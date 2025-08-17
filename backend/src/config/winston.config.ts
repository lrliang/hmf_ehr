import * as winston from 'winston';
import { WinstonModuleOptions } from 'nest-winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const maxFiles = process.env.LOG_MAX_FILES || '14d';

export const winstonConfig: WinstonModuleOptions = {
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, context, trace }) => {
      return `${timestamp} [${level.toUpperCase()}] ${context ? `[${context}] ` : ''}${message}${
        trace ? `\n${trace}` : ''
      }`;
    }),
  ),
  transports: [
    // 控制台输出
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple(),
      ),
    }),
    // 错误日志文件
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 组合日志文件
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: maxFiles,
    }),
  ],
};
