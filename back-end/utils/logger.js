/**
 * Logger Utility
 * Enhanced logging with different log levels
 */

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = process.env.LOG_LEVEL 
  ? logLevels[process.env.LOG_LEVEL.toUpperCase()] 
  : logLevels.INFO;

const log = (level, message, ...args) => {
  if (logLevels[level] <= currentLogLevel) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}]`;
    console.log(prefix, message, ...args);
  }
};

export const logger = {
  error: (message, ...args) => log('ERROR', message, ...args),
  warn: (message, ...args) => log('WARN', message, ...args),
  info: (message, ...args) => log('INFO', message, ...args),
  debug: (message, ...args) => log('DEBUG', message, ...args),
};











