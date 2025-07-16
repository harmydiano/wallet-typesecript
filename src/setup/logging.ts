import winston from 'winston';

const enumerateErrorFormat = winston.format((info: any) => {
  if (info.message instanceof Error) {
    info.message = Object.assign(
      { message: `${info.message.message}\n============\n${info.message.stack}` },
      info.message
    );
  }
  if (info instanceof Error) {
    return Object.assign(
      { message: `${info.message}\n============\n${info.stack}` }, 
      info
    );
  }
  return info;
});

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    enumerateErrorFormat(),
    winston.format.printf((info: any) => {
      const { timestamp, level, message, ...args } = info;
      let argumentText = '';
      if (Object.keys(args).length) {
        if (process.env.NODE_ENV === 'development') {
          argumentText = JSON.stringify(args, null, 2);
        } else {
          argumentText = JSON.stringify(args);
        }
      }
      return `${timestamp} [${level}]: ${typeof message === 'object' ? JSON.stringify(message) : message}\n${argumentText}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      level: process.env.LOG_LEVEL || 'debug',
      handleExceptions: true
    })
  ]
});

export default logger; 