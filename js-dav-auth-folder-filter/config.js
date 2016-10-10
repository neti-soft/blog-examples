//config.js

var fs = require('fs');
var path = require('path');

var config = {
  "port": 3000,
  "host": "localhost",
  "secure": false,
  "debugMode": false,
  "rootDir": "/davfsroot",
  "locksDir": "/davfslocks"
};

if (config.secure) {
  var keypath = path.join(process.cwd(), "/path/to/certs/server.key");
  var certpath = path.join(process.cwd(), "/path/to/certs/server.crt");
  config.ssl = {
    key: fs.readFileSync(keypath),
    cert: fs.readFileSync(certpath),
    requestCert: false,
    rejectUnauthorized: false
  };
}

module.exports = config;
