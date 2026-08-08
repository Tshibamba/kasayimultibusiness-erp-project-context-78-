// PM2 Configuration — KasayiMultiBusiness ERP
// Usage : pm2 start ecosystem.config.cjs
module.exports = {
  apps: [{
    name: "kasayi-erp",
    script: "node_modules/next/dist/bin/next",
    args: "start",
    cwd: __dirname,
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
    },
    error_file: "./logs/error.log",
    out_file: "./logs/output.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    merge_logs: true,
  }],
};
