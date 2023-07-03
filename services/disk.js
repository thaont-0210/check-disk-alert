require('dotenv').config();
const {execute, executeSSH, multipleExecuteSSH} = require('./command');
const sendReport = require('./slack').sendReport;
const sendNotify = require('./slack').sendNotify;

function generateCommandForShow(filter, excluded = '') {
    let cmd = '';
    if (filter !== '') {
        cmd = 'df -h | grep "' + filter + '\\|Mounted on" && printf "\n" && df -i | grep "' + filter + '\\|Mounted on"';
    } else if (excluded !== '') {
        cmd = `df -h | grep -v '${excluded}' && printf "\n" && df -i | grep -v '${excluded}'`;
    } else {
        cmd = 'df -h && printf "\n" && df -i';
    }

    return cmd;
}

function generateCommandForCheckAlert(diskOverPercent, dockerContainerName = '', excluded = '') {
    let cmd = '';
    if (dockerContainerName !== '' && dockerContainerName != null) {
        cmd += `docker exec ${dockerContainerName} `;
    }

    cmd += `df -h | awk 'NR == 1 || +$5 >= ${diskOverPercent}'`;

    if (excluded !== '' && excluded != null) {
        cmd += ` | grep -v "${excluded}"`;
    }

    return cmd;
}

function generateCommandResult(stdout) {
    stdout = stdout.split(/(?:\r\n|\r|\n)/g);
    let result = [];
    let j = 0;
    for (let i = stdout.length - 1; i >= 0; i--) {
        if (stdout[i] !== '' && stdout[i] != null) {
            result[j] = stdout[i].replace(/\s+/g, '....').split('....');
            j++;
        }
    }

    return result;
}

function alert(stdout, slackData) {
    let result = stdout.split(/(?:\r\n|\r|\n)/g).filter(item => item);
    // because result container header of command stdout
    if (result.length > 1) {
        sendNotify(result, slackData);
    }
}

function sendReportCheckDisk(data, slackData) {
    sendReport(data, slackData);
}

function shouldReportOrNot(stdout, data) {
    let result = stdout.split(/(?:\r\n|\r|\n)/g).filter(item => item);
    if (result.length > 1) {
        console.log(result);
        console.log('alert is set');
    } else {
        report(data);
    }
}

function reportDisk(data) {
    let slackData = {
        environment: data.environment,
        slackChannelIds: data.slackChannelIds,
        slackMentionUsers: data.slackMentionUsers,
        slackToken: data.slackToken,
        diskOverPercent: data.diskOverPercent,
        excludedDiskCmd: data.excludedDiskCmd,
    }

    if (data.host == null || data.host === '') {
        execute(generateCommandForCheckAlert(data.diskOverPercent, data.dockerContainerName, data.excludedDiskCmd), {data: slackData}, shouldReportOrNot);
        // TO-DO
    } else {
        let cmd = generateCommandForCheckAlert(data.diskOverPercent, data.dockerContainerName, data.excludedDiskCmd);
        executeSSH({
            cmd: cmd,
            param: ''
        }, {
            configSSH: {
                host: data.host,
                username: data.user,
                password: data.password,
                privateKeyPath: data.privateKeyPath
            },
            data: data
        }, shouldReportOrNot);
    }
}

function report(data) {
    let slackData = {
        environment: data.environment,
        slackChannelIds: data.slackChannelIds,
        slackMentionUsers: data.slackMentionUsers,
        slackToken: data.slackToken,
        diskOverPercent: data.diskOverPercent,
    }

    if (data.host == null || data.host === '') {
        execute(generateCommandForShow('', data.excludedDiskCmd), {data: slackData}, sendReportCheckDisk);
    } else {
        let dfCmd = '';
        if (data.dockerContainerName !== '' && data.dockerContainerName != null) {
            dfCmd = `docker exec ${data.dockerContainerName} `;
        }

        dfCmd += 'df';

        let dfCmdH = `${dfCmd} -h`;
        let dfCmdI = `${dfCmd} -i`;

        if (data.excludedDiskCmd !== '' && data.excludedDiskCmd != null) {
            dfCmdH += ` | grep -v '${data.excludedDiskCmd}'`;
            dfCmdI += ` | grep -v '${data.excludedDiskCmd}'`;
        }

        multipleExecuteSSH([
            {cmd: dfCmdH, param: ''},
            {cmd: dfCmdI, param: ''},
        ], {
            configSSH: {
                host: data.host,
                username: data.user,
                password: data.password,
                privateKeyPath: data.privateKeyPath
            },
            data: slackData
        }, sendReportCheckDisk);
    }
}

function checkDisk(data) {
    let cmd = generateCommandForCheckAlert(data.diskOverPercent, data.dockerContainerName, data.excludedDiskCmd);
    let slackData = {
        environment: data.environment,
        slackChannelIds: data.slackChannelIds,
        slackMentionUsers: data.slackMentionUsers,
        slackToken: data.slackToken,
        diskOverPercent: data.diskOverPercent,
    }

    if (data.host == null || data.host === '') {
        execute(cmd, {data: slackData}, alert);
    } else {
        executeSSH({
            cmd: cmd,
            param: ''
        }, {
            configSSH: {
                host: data.host,
                username: data.user,
                password: data.password,
                privateKeyPath: data.privateKeyPath
            },
            data: slackData
        }, alert);
    }
}

module.exports = {generateCommandForShow, checkDisk, reportDisk}
