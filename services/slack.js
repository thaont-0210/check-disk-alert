require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const moment = require('moment-timezone');

function getCurrentDateTime()
{
    let tz = 'Asia/Tokyo';
    let now = moment().tz(tz).format('YYYY-M-D H:m');

    return `${now} (${tz})`;
}

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
            `Report: disk space usage in ${config.environment} server`,
            prepareTextMessageReport(data, config.environment, mentionUsers)
        );
    }
}

function getMentionUsers(mentionUsers) {
    let mention = '';
    mentionUsers = mentionUsers.split(',');
    for (let i = 0; i < mentionUsers.length; i++) {
        mention += `@${mentionUsers[i]} `;
    }

    return mention;
}

function prepareTextMessageReport(data, environment, mentionUsers) {
    let mention = getMentionUsers(mentionUsers);
    data = data.split(/(?:\r\n|\r|\n)/g);

    let text = `${mention}\nYou received this message because you are chosen one to view disk space in *${environment}* server!\n`;
    text += `*${environment}*サーバーのディスク容量を確認できるように、このメッセージが配信されました！\n`;

    let checkedAt = getCurrentDateTime();
    text += `Reported at: ${checkedAt}\n`;

    text += "*Disk Usage Detail*\n";
    text += "*ディスク使用量の詳細*\n";

    text += '```';
    for (let i = 0; i < data.length; i++) {
        text += data[i] + "\n";
    }

    text += '```';

    let txtTile = `This is report for disk space in ${environment} server\n`;
    txtTile += `${environment}のディスク容量についてのレポートです。`;

    return [
        {
            'type': 'header',
            'text': {
                'type': 'plain_text',
                'text': txtTitle,
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
            mentionUsers = config.slackMentionUsers[i];
        }

        sendMessage(
            config.slackToken,
            config.slackChannelIds[i],
            `Alert: disk space usage in ${config.environment} server is over!!!`,
            prepareTextMessageNotify(data, config.environment, config.diskOverPercent, mentionUsers)
        );
    }
}

function prepareTextMessageNotify(data, environment, diskOverPercent, mentionUsers) {
    let mention = getMentionUsers(mentionUsers);
    let checkedAt = getCurrentDateTime();
    let text = `${mention}\nYou received this message because disk usage space in *${environment}* server has been used over *${diskOverPercent}*\n`;
    text += `*${environment}*サーバーのディスク使用容量が*${diskOverPercent}*を超えたため、このメッセージが配信されました。\n`;
    text += `Checked at: ${checkedAt}\n`;

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
                'text': `${data[i][0]}[${data[i][5]}]`,
                'emoji': true
            });

            fields.push({
                'type': 'mrkdwn',
                'text': `${data[i][4]}(${data[i][2]}/${data[i][1]})`,
            });
        }
    }

    let txtTitle = `This is alert for disk space in ${environment} server\n`;
    txtTitle += `${environment}のディスク容量についてのアラートです。`;

    return [
        {
            'type': 'header',
            'text': {
                'type': 'plain_text',
                'text': txtTitle,
                'emoji': true
            }
        },
        {
            'type': 'section',
            'text': {
                'type': 'mrkdwn',
                'text': text,
            },
            'fields': fields,
        }
    ];
}

module.exports = {sendNotify, sendReport}
