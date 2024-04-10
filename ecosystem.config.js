module.exports = {
  apps : [{
    name: 'crmbotwhatsapppoppo',
    script: '/1tb/NodeJS/COS_RPA_CRMBOTWHATSAPPOFICIALOPPO/WEB/src/index.js',
    watch: false,
    autorestart: true,
    cron_restart: "30 0 * * *"
  }, {
    name: 'crmbotwhatsapppoppo_asignacion',
    script: '/1tb/NodeJS/COS_RPA_CRMBOTWHATSAPPOFICIALOPPO/APIs/Asignacion/index.js',
    watch: false,
    autorestart: true,
    cron_restart: "30 0 * * *"
  }, {
    name: 'crmbotwhatsapppoppo_consultarmensajes',
    script: '/1tb/NodeJS/COS_RPA_CRMBOTWHATSAPPOFICIALOPPO/APIs/ConsultarMensajes/index.js',
    watch: false,
    autorestart: true,
    cron_restart: "30 0 * * *"
  }, {
    name: 'crmbotwhatsapppoppo_enviarmensajes',
    script: '/1tb/NodeJS/COS_RPA_CRMBOTWHATSAPPOFICIALOPPO/APIs/EnviarMensajes/index.js',
    watch: false,
    autorestart: true,
    cron_restart: "30 0 * * *"
  }, {
    name: 'crmbotwhatsapppoppo_statusmensajes',
    script: '/1tb/NodeJS/COS_RPA_CRMBOTWHATSAPPOFICIALOPPO/APIs/EstadoMensajes/index.js',
    watch: false,
    autorestart: true,
    cron_restart: "30 0 * * *"
  }, {
    name: 'crmbotwhatsapppoppo_webhook',
    script: '/1tb/NodeJS/COS_RPA_CRMBOTWHATSAPPOFICIALOPPO/WebHookWhasappConnetly/WebHook.py',
    watch: false,
    args: [""],
    wait_ready: true,
    autorestart: true,
    max_memory_restart: '512M',
    interpreter: 'python3',
    cron_restart: "30 0 * * *"
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
