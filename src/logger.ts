import fs = require("fs");
import Moment from "moment";

enum Level { debug, info, warning, error, event }
enum Colors { red = "\x1b[31m", green = "\x1b[32m", yellow = "\x1b[33m", blue = "\x1b[34m" }

export default function logger(context: string, lvl: string) {
    const level = Level[lvl];
    let logFileStream: fs.WriteStream;
    return Object.freeze({
        createLogFileStream,
        colorMsg,
        debug,
        error,
        event,
        info,
        warn
    })

    function createLogFileStream() {
        try {
            if (!fs.existsSync('./log')) fs.mkdirSync('./log')
            logFileStream = fs.createWriteStream(`log/image-resizing.log`, { flags: 'a' })
        }
        catch (e) {
            const msg = `Logger: can't create log file stream ${e.message}`;
            console.error(msg); throw msg;
        }
    }

    function debug(msg: string) {
        if (level === Level.debug) {
            console.log(`${getLogTime()} ${color("debug")} | ${context}: ${msg}`);
            if (logFileStream) logFileStream.write(`${getLogDateTime()} debug | ${context}: ${msg}\n`);
        }
    }

    function info(msg: string) {
        if (level <= Level.info) {
            msg != "" ? console.log(`${getLogTime()} ${color("info")} | ${context}: ${msg}`) : console.log("");
            if (logFileStream)
                msg != "" ? logFileStream.write(`${getLogDateTime()} info | ${context}: ${msg}\n`) : logFileStream.write('\n');
        }
    }

    function warn(msg: string) {
        if (level <= Level.warning) {
            console.log(`${getLogTime()} ${color("warning")} | ${context}: ${msg}`);
            if (logFileStream) logFileStream.write(`${getLogDateTime()} warning | ${context}: ${msg}\n`);
        }
    }

    function error(msg: string) {
        console.log(`${getLogTime()} ${color("error")} | ${context}: ${msg}`);
        if (logFileStream) logFileStream.write(`${getLogDateTime()} error | ${context}: ${msg}\n`);
    }

    function event(msg: string) {
        console.log(`${getLogTime()} ${color("event")} | ${context}: ${msg}`);
        if (logFileStream) logFileStream.write(`${getLogDateTime()} event | ${context}: ${msg}\n`);
    }

    function colorMsg(str: string, color: Colors): string {
        let text = `${str}\x1b[39m`;
        switch (color) {
            case Colors.blue: text = `${Colors.blue}${text}`; break;
            case Colors.green: text = `${Colors.green}${text}`; break;
            case Colors.yellow: text = `${Colors.yellow}${text}`; break;
            case Colors.red: text = `${Colors.red}${text}`; break;
        }
        return text;
    }
}

function getLogDateTime() { return Moment().format('YYYY-MM-DD HH:mm:ss:SSS') }
function getLogTime() { return Moment().format('HH:mm:ss:SSS') }


function color(level: string): string {
    let text = `${level}\x1b[39m`;
    switch (Level[level]) {
        case Level.debug: text = `${Colors.blue}${text}`; break;
        case Level.info: text = `${Colors.green}${text}`; break;
        case Level.warning: text = `${Colors.yellow}${text}`; break;
        case Level.error: text = `${Colors.red}${text}`; break;
        case Level.event: text = `${Colors.green}${text}`; break;
    }
    return text;
}