require('dotenv').config();
const Table = require('easy-table');
const { executeSSH, multipleExecuteSSH } = require('./command');
const { getSshConfig, getSlackDataForReport } = require('../utils/extractors');
const logger = require('./logger');
const sendReport = require('./slack').sendReport;
const sendNotify = require('./slack').sendNotify;

function generateCommandForCheckAlert(diskOverPercent, checkedFileSystem = '') {
    return `df -h ${checkedFileSystem} | awk 'NR == 1 || +$5 >= ${diskOverPercent}'`;
}

async function getDiskUsage(checkedFileSystem, sshConfig) {
    const commands = [
        `df -h ${checkedFileSystem}`,
        `df -i ${checkedFileSystem}`,
    ];

    return await multipleExecuteSSH(
        commands.map((cmd) => ({
            cmd,
            param: '',
        })),
        sshConfig
    );
}

async function getSizeOfFolders(
    checkedFolders,
    dockerContainerName,
    sshConfig,
    passwordForRunningWithSudo = null
) {
    const command = `du -sh ${checkedFolders.join(' ')}`;
    let commandPrefix = dockerContainerName
        ? `docker exec ${dockerContainerName} `
        : '';
    commandPrefix = passwordForRunningWithSudo
        ? `sudo ${commandPrefix}`
        : commandPrefix;
    const options = passwordForRunningWithSudo
        ? {
              stdin: `${passwordForRunningWithSudo}\n`,
              execOptions: { pty: true },
          }
        : {};

    let result = await executeSSH(
        { cmd: `${commandPrefix}${command}`, param: '' },
        sshConfig,
        options
    );
    // Remove password prompt line.
    result = passwordForRunningWithSudo
        ? result.substring(result.indexOf('\n') + 1)
        : result;

    const foldersData = result.split('\n').map((line) => {
        const [size, path] = line.split(/\s/);

        return { Size: size, Folder: path };
    });

    return foldersData;
}

function alert(stdout, slackData) {
    let result = stdout.split(/(?:\r\n|\r|\n)/g).filter((item) => item);
    // because result container header of command stdout
    if (result.length > 1) {
        sendNotify(result, slackData);
    }
}

function sendReportCheckDisk(data, slackData) {
    sendReport(data, slackData);
}

function shouldReportOrNot(stdout, data) {
    let result = stdout.split(/(?:\r\n|\r|\n)/g).filter((item) => item);
    if (result.length > 1) {
        console.log(result);
        console.log('alert is set');
    } else {
        report(data);
    }
}

async function reportDisk(data) {
    let cmd = generateCommandForCheckAlert(
        data.diskOverPercent,
        data.checkedFileSystem
    );

    try {
        const result = await executeSSH(
            { cmd: cmd, param: '' },
            getSshConfig(data)
        );
        shouldReportOrNot(result, data);
    } catch ({ stack }) {
        console.log(stack);
        logger.error({
            message: `Error in ${data.host}`,
            data,
            stack,
        });
    }
}

async function report(data) {
    const sshConfig = getSshConfig(data);
    try {
        const diskUsage = await getDiskUsage(data.checkedFileSystem, sshConfig);
        const sizeOfFolders = await getSizeOfFolders(
            data.checkedFolders,
            data.dockerContainerName,
            sshConfig,
            data.password
        );
        sendReportCheckDisk(
            `${diskUsage}\n\n${Table.print([
                ...sizeOfFolders,
                { Size: '...', Folder: '...' },
            ])}`,
            getSlackDataForReport(data)
        );
    } catch ({ stack }) {
        logger.error({
            message: `Error in ${data.host}`,
            data,
            stack,
        });
    }
}

async function checkDisk(data) {
    let cmd = generateCommandForCheckAlert(
        data.diskOverPercent,
        data.checkedFileSystem
    );

    try {
        const result = await executeSSH(
            {
                cmd: cmd,
                param: '',
            },
            {
                host: data.host,
                username: data.user,
                password: data.password,
                privateKeyPath: data.privateKeyPath,
            }
        );
        alert(result, getSlackDataForReport(data));
    } catch (error) {
        logger.error({
            message: `Error in ${data.host}`,
            data,
            stack: error.stack,
        });
    }
}

module.exports = { checkDisk, reportDisk };
