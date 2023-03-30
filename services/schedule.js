const cron = require('node-cron');

function task(callback, data, schedule) {
    if (schedule === '' || schedule == null) {
        schedule = '* * * * *';
    }

    console.log('start job for ' + data.environment);

    return cron.schedule(schedule, () =>  {
        callback(data);
        console.log('done job for ' + data.environment);
    }, {
        scheduled: false
    });
}

module.exports = {task}