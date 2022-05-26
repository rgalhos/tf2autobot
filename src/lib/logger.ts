/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

import winston from 'winston';
import 'winston-daily-rotate-file';
import { FormatWrap } from 'logform';

import { Paths } from '../resources/paths';
import Options from '../classes/Options';

const levels = {
    debug: 5,
    verbose: 4,
    info: 3,
    warn: 2,
    trade: 1,
    error: 0
};

const colors = {
    debug: 'blue',
    verbose: 'cyan',
    info: 'green',
    warn: 'yellow',
    trade: 'magenta',
    error: 'red'
};

winston.addColors(colors);

const levelFilter = (level: string): FormatWrap => {
    return winston.format(info => {
        if (info.level !== level) {
            return false;
        }

        return info;
    });
};

const privateFilter = winston.format(info => {
    if (info.private === true) {
        return false;
    }

    return info;
});

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({
        stack: true
    }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.colorize(),
    winston.format.errors({
        stack: true
    }),
    winston.format.printf(info => {
        let msg = `${info.timestamp} ${info.level}: ${info.message}`;

        const splat = info[Symbol.for('splat') as unknown as string];

        if (splat) {
            if (splat.length === 1) {
                msg += ` ${JSON.stringify(splat[0])}`;
            } else if (splat.length > 1) {
                msg += ` ${JSON.stringify(info[Symbol.for('splat') as unknown as string])}`;
            }
        }

        return msg;
    })
);

export interface BetterLogger extends winston.Logger {
    exception: (error: Error, prefix?: string) => BetterLogger;
    // I just added these methods to prevent some stupid VS Code errors
    // I know, I'm doing something wrong
    debug: (...args: any[]) => any;
    info: (...args: any[]) => any;
    error: (...args: any[]) => any;
    verbose: (...args: any[]) => any;
    warn: (...args: any[]) => any;
}

const logger = winston.createLogger({
    levels: levels
});

// // Monkey patching Winston because it incorrectly logs `Error` instances even in 2020
// // Related issue: https://github.com/winstonjs/winston/issues/1498
// logger.exception = function (error, prefix?) {
//     const message = error.message || error.toString();
//     const stack = error.stack;
//     prefix = prefix ? `${prefix} ` : '';

//     // eslint-disable-next-line @typescript-eslint/no-unsafe-call
//     return this.error(`${prefix}${message}, stack ${stack}`) as BetterLogger;
// };

export function init(paths: Paths, options: Options): void {
    const debugConsole = options.debug;
    // Debug to file is enabled by default
    const debugFile = options.debugFile;

    const transports = [
        {
            type: 'DailyRotateFile',
            filename: paths.logs.log,
            level: debugFile ? 'debug' : 'verbose',
            filter: 'private',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: '14d'
        },
        {
            type: 'File',
            filename: paths.logs.trade,
            level: 'trade',
            filter: 'trade'
        },
        {
            type: 'File',
            filename: paths.logs.error,
            level: 'error'
        },
        {
            type: 'Console',
            level: debugConsole ? 'debug' : 'verbose'
        }
    ];

    transports.forEach(transport => {
        const type = transport.type;

        delete transport.type;

        if (['File', 'DailyRotateFile'].includes(type)) {
            transport['format'] = fileFormat;
        } else if (type === 'Console') {
            transport['format'] = consoleFormat;
        }

        const filter = transport.filter;

        if (filter) {
            delete transport.filter;

            if (filter === 'trade') {
                transport['format'] = winston.format.combine(levelFilter(filter)(), transport['format']);
            } else if (filter === 'private') {
                transport['format'] = winston.format.combine(privateFilter(), transport['format']);
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        logger.add(new winston.transports[type](transport));
    });
}

export default logger;
