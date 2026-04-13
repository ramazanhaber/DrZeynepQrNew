/**
 * PM2 config for Next.js standalone output.
 *
 * Usage (on server):
 *   npm ci
 *   npm run publish
 *   pm2 start ecosystem.config.cjs --env production
 */
module.exports = {
  apps: [
    {
      name: "qrmenu",
      cwd: "./publish",
      script: "./server.js",
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
      max_restarts: 10,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: "8461",
        HOSTNAME: "127.0.0.1",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: "8461",
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};

