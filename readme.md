## Install
- Install Nodejs
- Install pm2
- Clone repository
- Run npm install
- Make .env file and setting
- Run pm2
```
pm2 start npm -- start
```

## Create Slack app and get token

## Check disk then alert

Setting here for schedule check alert
```
SCHEDULE_FOR_CHECK_DISK=*/30 * * * * #At every 30th minute
```

Setting here for overcome % disk
```
ALERT_AFTER_OVERCOME=90%
```

## Report

Setting here for schedule report

```
SCHEDULE_FOR_REPORT_DISK=0 */6 * * * #At minute 0 past every 6th hour
```

## Web interface

Setting here for web token

```
TOKEN_FOR_WEB=Aa@1234567
```

Then go to here for full report disk space
```
http://localhost:3000/check-disk?t=Aa@1234567&a=1
```

Add `f` parameter for specific filesystem report
```
http://localhost:3000/check-disk?t=Aa@1234567&f=run/lock
```