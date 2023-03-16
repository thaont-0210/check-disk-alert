const alertAfterOverCome = '60%';

function generateCommandForShow(filter) {
    let cmd = '';
    if (filter != '') {
        cmd = 'df -h | grep "' + filter + '\\|Mounted on" && printf "\n" && df -i | grep "' + filter + '\\|Mounted on"';
    } else {
        cmd = 'df -h && printf "\n" && df -i';
    }

    return cmd;
}

function filterResultAlert(stdout) {
    let result = stdout.split(/(?:\r\n|\r|\n)/g);
    for (let i = 0; i < result.length; i++) {
        if (result[i] == null || result[i] == '' || result[i].includes('Filesystem')) {
            result.splice(i, 1);
        }
    }

    return result;
}

function generateCommandForCheckAlert() {
    return `df -h | awk '$5 > "`+ alertAfterOverCome + `"'`;
}

module.exports = {generateCommandForShow, generateCommandForCheckAlert, filterResultAlert}