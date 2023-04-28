const cron = require('node-cron');

function task(callback, data, schedule) {
    if (schedule === '' || schedule == null) {
        schedule = '* * * * *';
    }

    console.log('start job for ' + data.environment + ' and calling ' + callback.name);

    return cron.schedule(schedule, () =>  {
        callback(data);
        console.log('done job for ' + data.environment + ' and calling ' + callback.name);
    }, {
        scheduled: false
    });
}

module.exports = {task}