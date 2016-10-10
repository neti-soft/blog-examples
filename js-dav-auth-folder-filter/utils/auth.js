var Exc = require("jsDAV/lib/shared/exceptions");
var folders = require('../data/folders.json');
var users = require('../data/users.json');

var has_one_permission = function (type) {
  return function (folder, user) {
    var folderRoles = folder[type];
    for (var roleIndex = 0; roleIndex < user.roles.length; roleIndex++) {
      if (folderRoles.indexOf(user.roles[roleIndex]) >= 0) {
        return true;
      }
    }
    return false;
  }
};

var canBeReadBy = has_one_permission("read");

var canBeModifiedBy = has_one_permission("write");

module.exports.getAllowedSubfolders = function (path, user, cb) {
  var allowed = [];
  var subs = [];
  var escapedUrl = path.replace(/\//g, "\\/");
  var regex = new RegExp(escapedUrl);

  for (var fi = 0; fi < folders.length; fi++) {
    if (regex.test(folders[fi].path)) {
      subs.push(folders[fi]);
    }
  }

  for (var subI = 0; subI < subs.length; subI++) {
    if (canBeReadBy(subs[subI], user)) {
      allowed.push(subs[subI].path);
    }
  }

  cb(null, allowed);
};

module.exports.authenticate = function (email, password, cb) {
  //TODO: implement you authentication mechanism here
  for (var userIndex = 0; userIndex < users.length; userIndex++) {
    var user = users[userIndex];
    if (user.email == email && user.password == password) {
      return cb(null, user);
    }
  }
  var error = new Exc.Forbidden('Username or password is not valid');
  cb(error);
};

module.exports.authorise = function (path, user, method, cb) {
  //TODO: implement you authorisation mechanism here
  for (var folderIndex = 0; folderIndex < folders.length; folderIndex++) {
    var folder = folders[folderIndex];
    if (folder.path == path) {

      if (folder.read.length == 0 && folder.write.length == 0) {
        return cb(null, folder);
      }

      //Method PROPFIND, GET is attempt to read resource
      if (method === "PROPFIND" || method === "GET") {
        if (canBeReadBy(folder, user)) {
          cb(null, folder);
        } else {
          var error = new Exc.Forbidden('No read access rights');
          return cb(error);
        }
      }

      //Method DELETE PUT POST is resource modification
      if (method === "DELETE" || method === "PUT" || method === "POST") {
        if (canBeModifiedBy(folder, user)) {
          cb(null, folder);
        } else {
          var error = new Exc.Forbidden('No write access rights');
          return cb(error);
        }
      }

    }
  }
  //if there is no folder found, access allowed
  cb(null, folder);
};
