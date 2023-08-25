const winston = require('winston');
const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.timestamp(),
        winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.File({
            dirname: 'log',
            filename: 'debug.log',
        }),
        new winston.transports.File({
            dirname: 'log',
            filename: 'error.log',
            level: 'error',
        }),
    ],
});

module.exports = logger;
