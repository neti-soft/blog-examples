//server.js

var jsDAV = require("jsDAV/lib/jsdav");
var jsDAV_Server = require("jsDAV/lib/DAV/server");
var jsDAV_Locks_Backend_FS = require("jsDAV/lib/DAV/plugins/locks/fs");
var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var webdav_config = require('./config');
var plugin = require('./plugin');

//make sure folders required for webdav server exist
var nodePath = path.join(__dirname, webdav_config.rootDir);
var locksPath = path.join(__dirname, webdav_config.locksDir);
if (!fs.existsSync(nodePath)) {
  fs.mkdirSync(nodePath);
}
if (!fs.existsSync(locksPath)) {
  fs.mkdirSync(locksPath);
}

// setting debugMode to TRUE outputs a LOT of information to console
jsDAV.debugMode = !!webdav_config.debugMode;

if (jsDAV.debugMode) {
  console.log('WebDav: Starting server, version: %s', jsDAV_Server.VERSION);
}

//create HTTP and HTTPS server
var server = null;
if (webdav_config.secure) {
  var options = ssl.createHTTPSOptions();
  server = https.createServer(options).listen(webdav_config.port, webdav_config.host);
} else {
  server = http.createServer().listen(webdav_config.port, webdav_config.host);
}

//create webdav server
var webdav = jsDAV.createServer({
  node: nodePath,
  locksBackend: jsDAV_Locks_Backend_FS.new(locksPath),
  mount: "/",
  authBackend: plugin.new(),
  server: server
});

webdav.on('listening', function() {
	console.log('WebDav: Starting list, version: %s', jsDAV_Server.VERSION);
});

webdav.on('error', function(e) {
  if (jsDAV.debugMode) {
    console.log(e);
  }
});