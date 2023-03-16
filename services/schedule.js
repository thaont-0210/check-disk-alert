const cron = require('node-cron');

function task(callback, schedule) {
    if (schedule == '' || schedule == null) {
        schedule = '* * * * *';
    }

    return cron.schedule(schedule, () =>  {
        callback();
    }, {
        scheduled: false
    });
}

module.exports = {task}