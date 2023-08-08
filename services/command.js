const { NodeSSH } = require('node-ssh');

const ssh = new NodeSSH();

// only need an authenticate method: password or private key
async function executeSSH(command, configSSH, options = {}, retry = 2) {
    try {
        await ssh.connect(configSSH);
        const result = await ssh.exec(command.cmd, [command.param], options);
        ssh.dispose();

        return result;
    } catch (error) {
        ssh.dispose();
        if (retry > 0) {
            retry--;

            return executeSSH(command, configSSH, options, retry);
        }

        throw error;
    }
}

async function multipleExecuteSSH(
    commands,
    configSSH,
    options = {},
    retry = 2
) {
    try {
        await ssh.connect(configSSH);
        const result = await Promise.all(
            commands.map(({ cmd, param }) => ssh.exec(cmd, [param], options))
        );
        ssh.dispose();

        return result.join('\n\n');
    } catch (e) {
        ssh.dispose();
        if (retry > 0) {
            console.log('retry multipleExecuteSSH remaining: ' + retry);
            retry--;

            return multipleExecuteSSH(commands, configSSH, options, retry);
        }

        throw e;
    }
}

module.exports = { executeSSH, multipleExecuteSSH };
