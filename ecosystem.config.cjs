module.exports = {
  apps: [
    {
      name: 'clipstream-api',
      cwd: './apps/api',
      script: 'dist/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
      },
    },
    {
      name: 'clipstream-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000 -H 0.0.0.0',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
