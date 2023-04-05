const checkDiskService = require('./disk').checkDisk;
const reportDiskService = require('./disk').report;
const task = require('./schedule').task;
require('dotenv').config();

function run() {
    let i = 0;
    let fetchEnv = true;
    while (fetchEnv) {
        i++;
        let env = process.env[`ENV_${i}`];
        if (env == null || env === 'undefined') {
            fetchEnv = false;
        } else {
            let overPercent = parseInt(process.env[`ALERT_AFTER_OVERCOME_${i}`]);
            let scheduleForChecking = process.env[`SCHEDULE_FOR_CHECK_DISK_${i}`];
            let scheduleForReporting = process.env[`SCHEDULE_FOR_REPORT_DISK_${i}`];

            let data = {
                environment: env,
                slackChannelIds: process.env[`SLACK_CHANNEL_ID_${i}`].split(','),
                slackMentionUsers: process.env[`SLACK_MENTION_USERS_${i}`].split(';'),
                slackToken: process.env[`SLACK_TOKEN_${i}`],
                diskOverPercent: overPercent,
                excludedDiskCmd: process.env[`EXCLUDED_DISK_${i}`],
                dockerContainerName: process.env[`DOCKER_CONTAINER_NAME_${i}`],
                host: process.env[`HOST_${i}`],
                user: process.env[`USER_${i}`],
                password: process.env[`PASSWORD_${i}`] ? process.env[`PASSWORD_${i}`] : '',
                privateKeyPath: process.env.PRIVATE_KEY_PATH ? process.env.PRIVATE_KEY_PATH : null,
            }

            if (!isNaN(overPercent) && scheduleForChecking != null && scheduleForChecking != '') {
                task(checkDiskService, data, scheduleForChecking).start();
            }

            if (scheduleForReporting != null && scheduleForReporting != '') {
                task(reportDiskService, data, scheduleForReporting).start();
            }
        }
    }
}

module.exports = {run}
