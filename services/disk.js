require('dotenv').config();
const {execute} = require("./command");
const sendReport = require("./slack").sendReport;
const sendNotify = require('./slack').sendNotify;
const alertAfterOverCome = process.env.ALERT_AFTER_OVERCOME;

function generateCommandForShow(filter) {
    let cmd = '';
    if (filter != '') {
        cmd = 'df -h | grep "' + filter + '\\|Mounted on" && printf "\n" && df -i | grep "' + filter + '\\|Mounted on"';
    } else {
        cmd = 'df -h && printf "\n" && df -i';
    }

    return cmd;
}

function generateCommandForCheckAlert() {
    return `df -h | awk '$5 > "`+ alertAfterOverCome + `"' | { read -r line; sort -k5; }`;
}

function generateCommandResult(stdout) {
    stdout = stdout.split(/(?:\r\n|\r|\n)/g);
    let result = [];
    let j = 0;
    for (let i = stdout.length - 1; i >= 0; i--) {
        if (stdout[i] != '' && stdout[i] != null) {
            result[j] = stdout[i].replace(/\s+/g, '-').split('-');
            j++;
        }
    }

    return result;
}

function alert(stdout) {
    let result = generateCommandResult(stdout);
    if (result.length > 0) {
        sendNotify(result);
    }
}

function sendReportCheckDisk(data) {
    sendReport(data);
}

function report() {
    execute(generateCommandForShow(''), sendReportCheckDisk);
}

function checkDisk() {
    execute(generateCommandForCheckAlert(), alert);
}

module.exports = {generateCommandForShow, checkDisk, report}
