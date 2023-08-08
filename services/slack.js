require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const moment = require('moment-timezone');
const logger = require('./logger');

function getCurrentDateTime() {
    let tz = 'Asia/Tokyo';
    let now = moment().tz(tz).format('YYYY-MM-DD HH:mm');

    return {
        en: `${now} (${tz})`,
        jp: `${now}（アジア/東京）`,
    };
}

async function sendMessage(token, channelId, msgTitle, msgContent) {
    const web = new WebClient(token);

    try {
        await web.chat.postMessage({
            channel: channelId,
            link_names: true,
            text: msgTitle,
            blocks: msgContent,
        });
        logger.info('Message is sent');
    } catch (error) {
        logger.error(error);
    }
}

function sendReport(data, config) {
    let mentionUsersDefault = '';
    if (
        config.slackMentionUsers[0] != null &&
        config.slackMentionUsers[0] != 'undefined'
    ) {
        mentionUsersDefault = config.slackMentionUsers[0];
    }

    for (let i = 0; i < config.slackChannelIds.length; i++) {
        let mentionUsers = mentionUsersDefault;
        if (
            config.slackMentionUsers[i] != null &&
            config.slackMentionUsers[i] != 'undefined'
        ) {
            mentionUsers = config.slackMentionUsers[i];
        }

        if (
            config.slackChannelIds[i] != null &&
            config.slackChannelIds[i] != ''
        ) {
            sendMessage(
                config.slackToken,
                config.slackChannelIds[i],
                `Report: disk space usage in ${config.environment} server.`,
                prepareTextMessageReport(
                    data,
                    config.environment,
                    config.diskOverPercent,
                    mentionUsers
                )
            );
        }
    }
}

function getMentionUsers(mentionUsers) {
    return mentionUsers
        .split(',')
        .filter((user) => user)
        .map((user) => `<@${user}>`)
        .join('');
}

function prepareTextMessageReport(
    usageDetail,
    environment,
    diskOverPercent,
    mentionUsers
) {
    const mentioned = getMentionUsers(mentionUsers);
    const mentionBlock = mentioned
        ? {
              type: 'section',
              text: {
                  type: 'mrkdwn',
                  text: mentioned,
              },
          }
        : null;
    const titleBlock = {
        type: 'header',
        text: {
            type: 'plain_text',
            text: 'Daily Disk usage report / 日次ディスク使用用量のレポート',
        },
    };
    const summaryBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: [
                `• Server: \`${environment}\``,
                '• State: `OK`',
                `• Alert threshold / アラートの閾値: \`${diskOverPercent}%\``,
                `• Reported at / 報告時点: ${getCurrentDateTime().en}\n`,
            ].join('\n'),
        },
    };
    const detailBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: [
                '*Disk Usage Detail / ディスク使用量の詳細*',
                `\`\`\`${usageDetail}\`\`\``,
            ].join('\n'),
        },
    };

    return [mentionBlock, titleBlock, summaryBlock, detailBlock].filter(
        (block) => block
    );
}

function sendNotify(data, config) {
    let mentionUsersDefault = '';
    if (
        config.slackMentionUsers[0] != null &&
        config.slackMentionUsers[0] != 'undefined'
    ) {
        mentionUsersDefault = config.slackMentionUsers[0];
    }

    for (let i = 0; i < config.slackChannelIds.length; i++) {
        let mentionUsers = mentionUsersDefault;
        if (
            config.slackMentionUsers[i] != null &&
            config.slackMentionUsers[i] != 'undefined'
        ) {
            mentionUsers = config.slackMentionUsers[i];
        }

        if (
            config.slackChannelIds[i] != null &&
            config.slackChannelIds[i] != ''
        ) {
            sendMessage(
                config.slackToken,
                config.slackChannelIds[i],
                `Alert: disk space usage in ${config.environment} server is over!!!`,
                prepareTextMessageNotify(
                    data,
                    config.environment,
                    config.diskOverPercent,
                    mentionUsers
                )
            );
        }
    }
}

function prepareTextMessageNotify(
    usageDetail,
    environment,
    diskOverPercent,
    mentionUsers
) {
    const mentioned = getMentionUsers(mentionUsers);
    const mentionBlock = mentioned
        ? {
              type: 'section',
              text: {
                  type: 'mrkdwn',
                  text: mentioned,
              },
          }
        : null;
    const titleBlock = {
        type: 'header',
        text: {
            type: 'plain_text',
            text: ':fire: High Disk usage alert / ディスク使用率が高いアラート',
        },
    };
    const summaryBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: [
                `• Server: \`${environment}\``,
                '• State: `Storage warning`',
                `• Alert threshold / アラートの閾値: \`${diskOverPercent}%\``,
                `• Reported at / 報告時点: ${getCurrentDateTime().en}\n`,
            ].join('\n'),
        },
    };
    const detailBlock = {
        type: 'section',
        text: {
            type: 'mrkdwn',
            text: `\`\`\`${usageDetail}\`\`\``,
        },
    };

    return [mentionBlock, titleBlock, summaryBlock, detailBlock].filter(
        (block) => block
    );
}

module.exports = { sendNotify, sendReport };
