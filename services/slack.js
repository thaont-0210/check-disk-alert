require('dotenv').config();
const { WebClient } = require('@slack/web-api');

function sendMessage(token, channelId, msgTitle, msgContent) {
    const web = new WebClient(token);

    web.chat.postMessage({
        channel: channelId,
        link_names: true,
        text: msgTitle,
        blocks: msgContent
    }).then(r => console.log('sent message'))
    .catch(e => console.log(e));
}

function sendReport(data, config) {
    let mentionUsersDefault = '';
    if (config.slackMentionUsers[0] != null && config.slackMentionUsers[0] != 'undefined') {
        mentionUsersDefault = config.slackMentionUsers[0];
    }

    for (let i = 0; i < config.slackChannelIds.length; i++) {
        let mentionUsers = mentionUsersDefault;
        if (config.slackMentionUsers[i] != null && config.slackMentionUsers[i] != 'undefined') {
            mentionUsers = config.slackMentionUsers[i];
        }

        sendMessage(
            config.slackToken,
            config.slackChannelIds[i],
            'Report: disk space usage in ' + config.environment,
            prepareTextMessageReport(data, config.environment, mentionUsers)
        );
    }
}

function getMentionUsers(mentionUsers) {
    let mention = '';
    mentionUsers = mentionUsers.split(',');
    for (let i = 0; i < mentionUsers.length; i++) {
        mention += '@' + mentionUsers[i] + ' ';
    }

    return mention;
}

function prepareTextMessageReport(data, environment, mentionUsers) {
    let mention = getMentionUsers(mentionUsers);
    data = data.split(/(?:\r\n|\r|\n)/g);
    let text = mention + ' You received this message because you are chosen one to view disk space in *' + environment + "* server!\n";
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
                'text': 'This is report for disk space in ' + environment,
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

function sendNotify(data, config) {
    let mentionUsersDefault = '';
    if (config.slackMentionUsers[0] != null && config.slackMentionUsers[0] != 'undefined') {
        mentionUsersDefault = config.slackMentionUsers[0];
    }

    for (let i = 0; i < config.slackChannelIds.length; i++) {
        let mentionUsers = mentionUsersDefault;
        if (config.slackMentionUsers[i] != null && config.slackMentionUsers[i] != 'undefined') {
            let mentionUsers = config.slackMentionUsers[i];
        }

        sendMessage(
            config.slackToken,
            config.slackChannelIds[i],
            'Alert: disk space usage in ' + config.environment + ' is over!!!',
            prepareTextMessageNotify(data, config.environment, config.diskOverPercent, mentionUsers)
        );
    }
}

function prepareTextMessageNotify(data, environment, diskOverPercent, mentionUsers) {
    let mention = getMentionUsers(mentionUsers);

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
                'text': 'This is alert for disk space in ' + environment,
                'emoji': true
            }
        },
        {
            'type': 'section',
            'text': {
                'type': 'mrkdwn',
                'text': mention + ' You received this message because disk usage space in *' + environment
                    + '* server has been used over ' + diskOverPercent,
            },
            'fields': fields,
        }
    ];
}

module.exports = {sendNotify, sendReport}
