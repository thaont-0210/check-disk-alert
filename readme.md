## Install
- Install Nodejs
- Install pm2
- Clone repository
- Run npm install
- Make .env file and setting
- Run pm2
```
pm2 start npm --name "check disk" -- start
```

## Create Slack app and get token
- Go to [apps manager](https://api.slack.com/apps) to create new app
- Select **OAuth & Permissions** to add **Scopes**

Required scope for *Bot Token Scopes* is [chat:write](https://api.slack.com/scopes/chat:write)
- After that go to **Install App** to install your app to your Slack workspace
- Go back **OAuth & Permissions** to see *OAuth Tokens for Your Workspace* section

Copy *Bot User OAuth Token* for using later


## Setting app

### Setting ssh key
- Add ssh key path
```
PRIVATE_KEY_PATH=/home/userabc/.ssh/id_rsa
```

- Note: this private key of user is running app in current server.
- To check remote server, need copy public key of this user to `authorized_keys` of user in ssh server

### Setting for a server
- Make `.env` file
```
cp .env.example .env
```
- This is a first remote server to check
```
ENV_1=dev-sun
```

- Slack channel and token (for sending notification), `mentions users` mean who will receive message
```
SLACK_CHANNEL_ID_1=C04U1xxxx
SLACK_MENTION_USERS_1=nguyen.the.thao,haha.hihi
SLACK_TOKEN_1=xoxb-xxxxx
```

If you want to send message to more channel, each channel will mention some others, we do:
```
SLACK_CHANNEL_ID_1=C04U1xxx1,C04U1xxx2,C04U1xxx3
SLACK_MENTION_USERS_1=nguyen.the.thao,haha.hihi;channel;here
SLACK_TOKEN_1=xoxb-xxxxx
```

That mean, message will be sent to 3 channels, in channel `C04U1xxx1` mention `nguyen.the.thao` and `haha.hihi` user. In channel `C04U1xxx2` mention `@channel`, and channel `C04U1xxx3` mention `@here`.
If mention users are not defined for channnel 2 or 3, we will use mention users in first channel.

- If some disks are used over this setting, alert will be sent
```
ALERT_AFTER_OVERCOME_1=50
```

- If you don't want to check some disks, add this
```
EXCLUDED_DISK_1=tmp/or/somethingelse
```

- If you want run command in docker, add this
```
DOCKER_CONTAINER_NAME_1=container_name_xxx
```

- Schedule for check / report disk, using input temple like [crontab](https://crontab.guru/)
```
SCHEDULE_FOR_CHECK_DISK_1=*/30 * * * * #At every 30th minute
SCHEDULE_FOR_REPORT_DISK_1=0 */6 * * * #At minute 0 past every 6th hour
```

- Host information, if null => check current server

Fill `PASSWORD_1` by authenticate password string to ssh, if you don't want to use authenticate by private key.

```
HOST_1=100.0.100.100
USER_1=nguyen.the.thao
PASSWORD_1=xxx
```

### Setting for multiple servers

- Add the same setting, but change the number `1` to `2`, `3`,...
```
ENV_2=dev-local
SLACK_CHANNEL_ID_2=C04U1xxxx
SLACK_MENTION_USERS_2=nguyen.the.thao,haha.hihi
SLACK_TOKEN_2=xoxb-xxxxx
ALERT_AFTER_OVERCOME_2=60
SCHEDULE_FOR_CHECK_DISK_2=* * * * *
SCHEDULE_FOR_REPORT_DISK_2=* * * * *
HOST_2=
USER_2=
PASSWORD_2=
```
