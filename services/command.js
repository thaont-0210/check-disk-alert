const exec = require('child_process').exec;
const {NodeSSH} = require('node-ssh')

const ssh = new NodeSSH();

function execute(command, data, callback) {
    exec(command, function(error, stdout, stderr) {
        callback(stdout, data.data);
    });
}

// let config = {
//     host: '100.100.100.100',
//     username: 'nguyen.the.thao',
//     password: 'xxxxxx',
//     privateKeyPath: '/home/thaohihi/.ssh/id_rsa',
// }

// only need an authenticate method: password or private key

function executeSSH(command, data, callback, cwd = '/var/www') {
    ssh.connect(data.configSSH).then(function() {
        ssh.exec(command.cmd, [command.param], {
            cwd: cwd,
            onStdout(chunk) {
                ssh.dispose();
                callback(chunk.toString('utf8'), data.data);
                console.log('disconnect ' +  data.configSSH.host);
            },
            onStderr(chunk) {
                ssh.dispose();
                console.log(chunk.toString('utf8'));
                console.log('disconnect ' +  data.configSSH.host);
            },
        }).then(r => console.log('execute command done.'))
        .catch(e => console.log('got error'));
    }).catch(e => console.log('error in ' + data.configSSH.host, e, data));
}

function multipleExecuteSSH(commands, data, callback, cwd = '/var/www') {
    let result = [];
    ssh.connect(data.configSSH).then(function() {
        let execTimes = commands.length;
        for (let i = 0; i < commands.length; i++) {
            ssh.exec(commands[i].cmd, [commands[i].param], {
                cwd: cwd,
                onStdout(chunk) {
                    result[i] = chunk.toString('utf8');
                    execTimes--;

                    if (execTimes == 0) {
                        ssh.dispose();
                        callback(result.join("\n"), data.data);
                        console.log('disconnect ' +  data.configSSH.host);
                    }
                },
                onStderr(chunk) {
                    ssh.dispose();
                    console.log('disconnect ' +  data.configSSH.host);
                },
            }).then(r => console.log('execute command done.'))
            .catch(e => console.log('got error'));
        }
    }).catch(e => console.log('error in ' + data.configSSH.host, e, data));
}

module.exports = {execute, executeSSH, multipleExecuteSSH}
