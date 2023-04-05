require('dotenv').config();
const {execute, executeSSH, multipleExecuteSSH} = require('./command');
const sendReport = require('./slack').sendReport;
const sendNotify = require('./slack').sendNotify;

function generateCommandForShow(filter) {
    let cmd = '';
    if (filter != '') {
        cmd = 'df -h | grep "' + filter + '\\|Mounted on" && printf "\n" && df -i | grep "' + filter + '\\|Mounted on"';
    } else {
        cmd = 'df -h && printf "\n" && df -i';
    }

    return cmd;
}

function generateCommandForCheckAlert(diskOverPercent, dockerContainerName = '', excluded = '') {
    let cmd = '';
    if (dockerContainerName != '' && dockerContainerName != null) {
        cmd += `docker exec ${dockerContainerName} `;
    }

    cmd += `df -h | awk 'NR == 1 || +$5 >= ${diskOverPercent}'`;

    if (excluded != '' && excluded != null) {
        cmd += ` | grep -v "${excluded}"`;
    }

    return cmd;
}

function generateCommandResult(stdout) {
    stdout = stdout.split(/(?:\r\n|\r|\n)/g);
    let result = [];
    let j = 0;
    for (let i = stdout.length - 1; i >= 0; i--) {
        if (stdout[i] != '' && stdout[i] != null) {
            result[j] = stdout[i].replace(/\s+/g, '....').split('....');
            j++;
        }
    }

    return result;
}

function alert(stdout, slackData) {
    let result = stdout.split(/(?:\r\n|\r|\n)/g);
    // because result containe header of command stdout
    if (result.length > 1) {
        sendNotify(result, slackData);
    }
}

function sendReportCheckDisk(data, slackData) {
    sendReport(data, slackData);
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
        execute(generateCommandForShow(''), {data: slackData}, sendReportCheckDisk);
    } else {
        let dfCmd = '';
        if (data.dockerContainerName != '' && data.dockerContainerName != null) {
            dfCmd = `docker exec ${data.dockerContainerName} `;
        }

        dfCmd += 'df';

        multipleExecuteSSH([
            {cmd: dfCmd, param: '-h'},
            {cmd: dfCmd, param: '-i'},
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

module.exports = {generateCommandForShow, checkDisk, report}
