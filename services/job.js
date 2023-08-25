const checkDiskService = require('./disk').checkDisk;
const reportDiskService = require('./disk').reportDisk;
const task = require('./schedule').task;
require('dotenv').config();

function run() {
    let i = 0;
    while (true) {
        i++;
        let env = process.env[`ENV_${i}`];
        if (env == null || env === 'undefined') {
            return;
        }
        let overPercent = parseInt(process.env[`ALERT_AFTER_OVERCOME_${i}`]);
        let scheduleForChecking = process.env[`SCHEDULE_FOR_CHECK_DISK_${i}`];
        let scheduleForReporting = process.env[`SCHEDULE_FOR_REPORT_DISK_${i}`];

        let data = {
            environment: env,
            slackChannelIds: process.env[`SLACK_CHANNEL_ID_${i}`].split(','),
            slackMentionUsers:
                process.env[`SLACK_MENTION_USERS_${i}`].split(';'),
            slackToken: process.env[`SLACK_TOKEN_${i}`],
            diskOverPercent: overPercent,
            excludedDiskCmd: process.env[`EXCLUDED_DISK_${i}`],
            dockerContainerName: process.env[`DOCKER_CONTAINER_NAME_${i}`],
            host: process.env[`HOST_${i}`],
            user: process.env[`USER_${i}`],
            password: process.env[`PASSWORD_${i}`] ?? '',
            privateKeyPath: process.env.PRIVATE_KEY_PATH,
            checkedFileSystem: process.env[`CHECKED_FILE_SYSTEM_${i}`],
            checkedFolders: process.env[`CHECKED_FOLDERS_${i}`].split(','),
            runWithSudo: process.env[`RUN_WITH_SUDO_${i}`] ?? false,
        };

        if (
            !isNaN(overPercent) &&
            scheduleForChecking != null &&
            scheduleForChecking != ''
        ) {
            task(checkDiskService, data, scheduleForChecking).start();
        }

        if (scheduleForReporting != null && scheduleForReporting != '') {
            task(reportDiskService, data, scheduleForReporting).start();
        }
    }
}

module.exports = { run };
