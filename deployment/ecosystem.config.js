module.exports = {
  apps: [{
    name: 'smartcv-api',
    script: './backend/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '500M',
    env: { NODE_ENV: 'production', PORT: 5000 },
    error_file: './logs/pm2-error.log',
    out_file:   './logs/pm2-out.log',
    log_file:   './logs/pm2-combined.log',
    time: true,
  }],
};
