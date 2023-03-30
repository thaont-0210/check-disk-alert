var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var checkDiskRouter = require('./routes/check_disk');

const checkDiskService = require('./services/disk').checkDisk;
const reportDiskService = require('./services/disk').report;
const task = require('./services/schedule').task;

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
      privateKeyPath: process.env.PRIVATE_KEY_PATH,
    }

    task(checkDiskService, data, process.env[`SCHEDULE_FOR_CHECK_DISK_${i}`]).start();
    // task(reportDiskService, data, process.env[`SCHEDULE_FOR_REPORT_DISK_${i}`]).start();
  }
}

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', indexRouter);
//app.use('/users', usersRouter);
//app.use('/check-disk', checkDiskRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
