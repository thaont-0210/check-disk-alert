require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const alertAfterOverCome = process.env.ALERT_AFTER_OVERCOME;
const mentionUsers = process.env.SLACK_MENTION_USERS.split(',');
const env = process.env.ENV;

function sendReport(data) {
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);
    const slackChanelId = process.env.SLACK_CHANEL_ID;

    (async () => {
        const res = await web.chat.postMessage({
            channel: slackChanelId,
            link_names: true,
            text: 'Report: disk space usage in ' + env,
            blocks: prepareTextMessageReport(data)
        });
    })();
}

function getMentionUsers() {
    let mention = '';
    for (let i = 0; i < mentionUsers.length; i++) {
        mention += '@' + mentionUsers[i] + ' ';
    }

    return mention;
}

function prepareTextMessageReport(data) {
    let mention = getMentionUsers();
    data = data.split(/(?:\r\n|\r|\n)/g);
    let text = mention + " You received this message because you are chosen one to view disk space [in *" + env + "* server]!\n";
    text += "*Detail*\n";
    text += '```';
    for (let i = 0; i < data.length; i++) {
        text += data[i] + "\n";
    }
    text += '```';

    return [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "This is report for disk space.",
                "emoji": true
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": text,
            }
        }
    ];
}

function sendNotify(data) {
    const token = process.env.SLACK_TOKEN;
    const web = new WebClient(token);
    const slackChanelId = process.env.SLACK_CHANEL_ID;

    (async () => {
        const res = await web.chat.postMessage({
            channel: slackChanelId,
            link_names: true,
            text: 'Alert: disk space usage in ' + env + ' is over!!!',
            blocks: prepareTextMessageNotify(data)
        });
    })();
}

function prepareTextMessageNotify(data) {
    let mention = getMentionUsers();

    let fields = [
        {
            "type": "mrkdwn",
            "text": "*Filesystem*"
        },
        {
            "type": "mrkdwn",
            "text": "*Used*"
        }
    ];

    let maxFields = data.length >= 8 ? 4 : data.length / 2;
    for (let i = 0; i < maxFields; i++) {
        fields.push({
            "type": "plain_text",
            "text": data[i][0] + '[' + data[i][5] + ']',
            "emoji": true
        });

        fields.push({
            "type": "mrkdwn",
            "text": data[i][4] + '(' + data[i][2] + '/' + data[i][1] + ')',
        });
    }

    return [
        {
            "type": "header",
            "text": {
                "type": "plain_text",
                "text": "This is alert for disk space.",
                "emoji": true
            }
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": mention + " You received this message because disk space [in *" + env
                    + "* server] has been used over " + alertAfterOverCome,
            },
            "fields": fields,
        }
    ];
}

module.exports = {sendNotify, sendReport}
