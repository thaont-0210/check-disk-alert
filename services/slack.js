require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const moment = require('moment-timezone');

function getCurrentDateTime()
{
    let tz = 'Asia/Tokyo';
    let now = moment().tz(tz).format('YYYY-MM-DD HH:mm');

    return {
        'en': `${now} (${tz})`,
        'jp': `${now}（アジア/東京）`
    };
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

        if (config.slackChannelIds[i] != null && config.slackChannelIds[i] != '') {
            sendMessage(
                config.slackToken,
                config.slackChannelIds[i],
                `Report: disk space usage in ${config.environment} server.`,
                prepareTextMessageReport(data, config.environment, config.diskOverPercent, mentionUsers)
            );
        }
    }
}

function getMentionUsers(mentionUsers) {
    let mention = '';
    mentionUsers = mentionUsers.split(',');

    for (let i = 0; i < mentionUsers.length; i++) {
        if (mentionUsers[i] != null && mentionUsers[i] != '') {
            mention += `@${mentionUsers[i]} `;
        }
    }

    return mention;
}

function prepareTextMessageReport(data, environment, diskOverPercent, mentionUsers) {
    let txtTitle = `Daily Disk usage report / 日次ディスク使用用量のレポート`;

    let mention = getMentionUsers(mentionUsers);
    data = data.split(/(?:\r\n|\r|\n)/g);

    let text = mention != '' ? `${mention}\n` : '';
    text += "• Server: `" + environment + "`\n";
    text += "• State: `OK`\n";
    text += "• Alert threshold / アラートの閾値: `" + diskOverPercent + "%`\n";

    let reportedAt = getCurrentDateTime();
    text += `• Reported at / 報告時点: ${reportedAt.en}\n\n`;

    text += `*Disk Usage Detail / ディスク使用量の詳細*\n`;

    text += '```';
    for (let i = 0; i < data.length; i++) {
        if (i == data.length - 1) {
            text += data[i];
        } else {
            text += data[i] + "\n";
        }
    }

    text += '```';

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
        },
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

        if (config.slackChannelIds[i] != null && config.slackChannelIds[i] != '') {
            sendMessage(
                config.slackToken,
                config.slackChannelIds[i],
                `Alert: disk space usage in ${config.environment} server is over!!!`,
                prepareTextMessageNotify(data, config.environment, config.diskOverPercent, mentionUsers)
            );
        }
    }
}

function prepareTextMessageNotify(data, environment, diskOverPercent, mentionUsers) {
    let txtTitle = `:fire: High Disk usage alert / ディスク使用率が高いアラート`;

    let mention = getMentionUsers(mentionUsers);

    let text = `${mention}\n`;
    text += "• Server: `" + environment + "`\n";
    text += "• State: `Storage warning`\n";
    text += "• Alert threshold / アラートの閾値: `" + diskOverPercent + "%`\n";

    let reportedAt = getCurrentDateTime();
    text += `• Reported at / 報告時点: ${reportedAt.en}\n`;

    text += '```';
    for (let i = 0; i < data.length; i++) {
        if (i == data.length -1) {
            text += data[i];
        } else {
            text += data[i] + "\n";
        }
    }

    text += '```';


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

module.exports = {sendNotify, sendReport}
