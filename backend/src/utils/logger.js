const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

const writeLog = (level, message, meta = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  const line = JSON.stringify(entry) + '\n';
  // Console
  if (level === 'error') console.error(`[${level.toUpperCase()}] ${message}`, meta);
  else console.log(`[${level.toUpperCase()}] ${message}`);
  // File
  const file = path.join(logDir, `${level}.log`);
  fs.appendFile(file, line, () => {});
};

const logger = {
  info:  (msg, meta) => writeLog('info',  msg, meta),
  warn:  (msg, meta) => writeLog('warn',  msg, meta),
  error: (msg, meta) => writeLog('error', msg, meta),
  debug: (msg, meta) => { if (process.env.NODE_ENV === 'development') writeLog('debug', msg, meta); },
};

module.exports = logger;
