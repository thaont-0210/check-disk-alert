require('dotenv').config();
const {execute, executeSSH} = require("./command");
const sendReport = require("./slack").sendReport;
const sendNotify = require('./slack').sendNotify;
var slackData = {};

function generateCommandForShow(filter) {
    let cmd = '';
    if (filter != '') {
        cmd = 'df -h | grep "' + filter + '\\|Mounted on" && printf "\n" && df -i | grep "' + filter + '\\|Mounted on"';
    } else {
        cmd = 'df -h && printf "\n" && df -i';
    }

    return cmd;
}

function generateCommandForCheckAlert(diskOverPercent) {
    return `df -h | awk '$5 > "${diskOverPercent}"' | { read -r line; sort -k5; }`;
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

function alert(stdout) {
    let result = generateCommandResult(stdout);
    if (result.length > 0) {
        sendNotify(result, slackData);
    }
}

function sendReportCheckDisk() {
    // sendReport(data);
    console.log('report to ' + slackData.environment);
}

function report(data) {
    slackData = {
        environment: data.environment,
        slackChannelId: data.slackChannelId,
        slackMentionUsers: data.slackMentionUsers,
        diskOverPercent: data.diskOverPercent,
    }

    execute(generateCommandForShow(''), sendReportCheckDisk);
}

function checkDisk(data) {
    let cmd = generateCommandForCheckAlert(data.diskOverPercent);
    slackData = {
        environment: data.environment,
        slackChannelId: data.slackChannelId,
        slackMentionUsers: data.slackMentionUsers,
        slackToken: data.slackToken,
        diskOverPercent: data.diskOverPercent,
    }

    if (data.host == null || data.host === '') {
        execute(cmd, alert);
    } else {
        executeSSH({
            cmd: cmd,
            param: ''
        }, {
            host: data.host,
            username: data.user,
            privateKeyPath: data.privateKeyPath
        }, alert);
    }
}

module.exports = {generateCommandForShow, checkDisk, report}
