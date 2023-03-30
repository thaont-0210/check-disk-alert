require('dotenv').config();
const { WebClient } = require('@slack/web-api');

function sendReport(data, slackConfig) {
    const web = new WebClient(slackConfig.slackToken);

    (async () => {
        const res = await web.chat.postMessage({
            channel: slackConfig.slackChannelId,
            link_names: true,
            text: 'Report: disk space usage in ' + slackConfig.environment,
            blocks: prepareTextMessageReport(data, slackConfig)
        }).catch(e => console.log(e));
    })();
}

function getMentionUsers(slackConfig) {
    let mention = '';
    let mentionUsers = slackConfig.slackMentionUsers.split(',');
    for (let i = 0; i < mentionUsers.length; i++) {
        mention += '@' + mentionUsers[i] + ' ';
    }

    return mention;
}

function prepareTextMessageReport(data, slackConfig) {
    let mention = getMentionUsers(slackConfig);
    data = data.split(/(?:\r\n|\r|\n)/g);
    let text = mention + ' You received this message because you are chosen one to view disk space in *' + slackConfig.environment + "* server!\n";
    text += "*Disk Usage Detail*\n";
    text += '```';
    for (let i = 0; i < data.length; i++) {
        text += data[i] + "\n";
    }

    text += '```';

    return [
        {
            'type': 'header',
            'text': {
                'type': 'plain_text',
                'text': 'This is report for disk space in ' + slackConfig.environment,
                'emoji': true
            }
        },
        {
            'type': 'section',
            'text': {
                'type': 'mrkdwn',
                'text': text,
            }
        }
    ];
}

function sendNotify(data, slackConfig) {
    const web = new WebClient(slackConfig.slackToken);

    (async () => {
        const res = await web.chat.postMessage({
            channel: slackConfig.slackChannelId,
            link_names: true,
            text: 'Alert: disk space usage in ' + slackConfig.environment + ' is over!!!',
            blocks: prepareTextMessageNotify(data, slackConfig)
        }).catch(e => console.log(e));
    })();
}

function prepareTextMessageNotify(data, slackConfig) {
    let mention = getMentionUsers(slackConfig);

    let fields = [
        {
            'type': 'mrkdwn',
            'text': '*Filesystem*'
        },
        {
            'type': 'mrkdwn',
            'text': '*Used*'
        }
    ];

    let maxFields = 4;

    for (let i = 0; i < maxFields; i++) {
        if (data[i] !== undefined) {
            fields.push({
                'type': 'plain_text',
                'text': data[i][0] + '[' + data[i][5] + ']',
                'emoji': true
            });

            fields.push({
                'type': 'mrkdwn',
                'text': data[i][4] + '(' + data[i][2] + '/' + data[i][1] + ')',
            });
        }
    }

    return [
        {
            'type': 'header',
            'text': {
                'type': 'plain_text',
                'text': 'This is alert for disk space in ' + slackConfig.environment,
                'emoji': true
            }
        },
        {
            'type': 'section',
            'text': {
                'type': 'mrkdwn',
                'text': mention + ' You received this message because disk usage space in *' + slackConfig.environment
                    + '* server has been used over ' + slackConfig.diskOverPercent,
            },
            'fields': fields,
        }
    ];
}

module.exports = {sendNotify, sendReport}
