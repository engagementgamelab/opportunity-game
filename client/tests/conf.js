var path = require('path');
require('dotenv').config({path: path.join(__dirname, '/../.env')});

var config = {
  'commanCapabilities': {
    'browserstack.user': process.env.BROWSERSTACK_USERNAME || 'BROWSERSTACK_USERNAME',
    'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY || 'BROWSERSTACK_ACCESS_KEY',
    'build': 'QA',
    'name': 'Civic Idea',
    'browserstack.debug': 'true',
  },
  'multiCapabilities': [{
      'browserName': 'Chrome'
    },{
      'browserName': 'Safari'
    },{
      'browserName': 'Firefox'
    },{
      'browserName': 'IE'
  }]
};

exports.capabilities = [];
// Code to support common capabilities
config.multiCapabilities.forEach(function(caps) {
  var temp_caps = JSON.parse(JSON.stringify(config.commanCapabilities));
  for(var i in caps) temp_caps[i] = caps[i];
  exports.capabilities.push(temp_caps);
console.log(exports.capabilities)
});