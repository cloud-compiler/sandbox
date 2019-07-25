const ispro = process.env.NODE_ENV === 'production';
module.exports = {
  pm2: ispro,
  pm2InstanceVar: 'NODE_APP_INSTANCE_CLOUD_COMPILER',
  appenders: { 
    app: { 
      type: 'stdout', 
    } 
  },
  categories: { 
    default: { 
      appenders: ['app'], 
      level: 'debug' 
    } 
  }
};