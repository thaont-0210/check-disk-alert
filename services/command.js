const exec = require('child_process').exec;
const {NodeSSH} = require('node-ssh')

const ssh = new NodeSSH();

function execute(command, callback) {
    exec(command, function(error, stdout, stderr) {
        callback(stdout);
    });
}

// let config = {
//     host: '100.100.100.100',
//     username: 'nguyen.the.thao',
//     privateKeyPath: '/home/thaohihi/.ssh/id_rsa'
// }

function executeSSH(command, config, callback, cwd = '/var/www') {
    console.log(config, command);
    ssh.connect(config).then(function() {
        ssh.exec(command.cmd, [command.param], {
            cwd: cwd,
            onStdout(chunk) {
                callback(chunk.toString('utf8'));
                console.log('==========');
                console.log(chunk.toString('utf8'));
                console.log('==========');
                ssh.dispose();
            },
            onStderr(chunk) {
                ssh.dispose();
            },
        }).then(r => console.log('done'));
    }).catch(e => console.log('error in ' + config.host));
}

module.exports = {execute, executeSSH}
