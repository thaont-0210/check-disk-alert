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
            let data = {
                environment: env,
                slackChannelId: process.env[`SLACK_CHANNEL_ID_${i}`],
                slackMentionUsers: process.env[`SLACK_MENTION_USERS_${i}`],
                slackToken: process.env[`SLACK_TOKEN_${i}`],
                diskOverPercent: process.env[`ALERT_AFTER_OVERCOME_${i}`],
                host: process.env[`HOST_${i}`],
                user: process.env[`USER_${i}`],
                password: process.env[`PASSWORD_${i}`] ? process.env[`PASSWORD_${i}`] : '',
                privateKeyPath: process.env.PRIVATE_KEY_PATH ? process.env.PRIVATE_KEY_PATH : null,
            }

            task(checkDiskService, data, process.env[`SCHEDULE_FOR_CHECK_DISK_${i}`]).start();
            task(reportDiskService, data, process.env[`SCHEDULE_FOR_REPORT_DISK_${i}`]).start();
        }
    }
}

module.exports = {run}
