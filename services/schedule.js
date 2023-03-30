const cron = require('node-cron');

function task(callback, data, schedule) {
    if (schedule === '' || schedule == null) {
        schedule = '* * * * *';
    }

    return cron.schedule(schedule, () =>  {
        callback(data);
        console.log('done schedule for ' + data.environment);
    }, {
        scheduled: false
    });
}

module.exports = {task}