function getSshConfig(data) {
    return {
        host: data.host,
        username: data.user,
        password: data.password,
        privateKeyPath: data.privateKeyPath,
    };
}

function getSlackDataForReport(data) {
    return {
        environment: data.environment,
        slackChannelIds: data.slackChannelIds,
        slackMentionUsers: data.slackMentionUsers,
        slackToken: data.slackToken,
        diskOverPercent: data.diskOverPercent,
    };
}

module.exports = { getSshConfig, getSlackDataForReport };
