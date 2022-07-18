import { default as winston } from 'winston';
import { ConsoleTransportOptions } from 'winston/lib/winston/transports';
const expressWinston = require('express-winston');

const consoleOpts: ConsoleTransportOptions = {
  level: 'verbose'
};

//Console
const consoleTransport = new winston.transports.Console(consoleOpts);

const enabledTransports = [];
if (process.env.NODE_ENV !== 'test') {
  enabledTransports.push(consoleTransport);
}

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.cli()
  ),
  transports: enabledTransports
});

const loggerMiddleware = expressWinston.logger({
  winstonInstance: logger,
  skip: function(req: Request, res: Response) {
    return (req.url === "/");
  }
});

logger.on('error', function (err: any) {
  console.log("logging error", err);
});

export { logger, loggerMiddleware };
