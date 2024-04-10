module.exports = {
  apps : [{
    name: 'botwebwhatsappmotorizadoschile_bot1',
    script: '/1tb/NodeJS/COS_RPA_BOTWHATSAPPDELIMAOFIFOOD/APIs/API_REST_BOTWP/src/vigiliabot.py',
    watch: false,
    args: [""],
    wait_ready: true,
    autorestart: true,
    max_memory_restart: '1G',
    interpreter: 'python3'
  }, {
    name: 'botwebwhatsappmotorizadoschile_bot2',
    script: '/1tb/NodeJS/COS_RPA_BOTWHATSAPPDELIMAOFIFOOD/WebHookWhasappConnetly/WebHook.py',
    watch: false,
    args: [""],
    wait_ready: true,
    autorestart: true,
    max_memory_restart: '1G',
    interpreter: 'python3'
  }, {
    script: './service-worker/',
    watch: ['./service-worker']
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
