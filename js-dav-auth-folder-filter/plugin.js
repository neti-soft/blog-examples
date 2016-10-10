//plugin.js
var Exc = require("jsDAV/lib/shared/exceptions");
var Abauth = require("jsDAV/lib/DAV/plugins/auth/abstractBasic");
var jsDAV_Property_Response = require("jsDAV/lib/DAV/property/response");
var Xml = require("jsDAV/lib/shared/xml");
var Handler = require("jsDAV/lib/DAV/handler");
var qs = require('querystring');
var authUtil = require('./utils/auth');

module.exports = Abauth.extend({

  initialize: function (handler) {
    Abauth.initialize.call(this);
  },

  authenticate: function (handler, realm, cbauth) {
    this.handler = handler;
    this.req = handler.httpRequest;
    var self = this;

    // Filter listed folders on each request
    // Get nested folders and add them into this.foldersToFilter
    self.allowedFolders  = [];

    Handler.prototype.generateMultiStatus = function (fileProperties, strip404s) {
      var namespace, prefix, entry, href, response;
      var xml = '<?xml version="1.0" encoding="utf-8"?><d:multistatus';

      // Adding in default namespaces
      for (namespace in Xml.xmlNamespaces) {
        prefix = Xml.xmlNamespaces[namespace];
        xml += ' xmlns:' + prefix + '="' + namespace + '"';
      }

      xml += ">";
      for (var i in fileProperties) {
        entry = fileProperties[i];
        href = entry["href"];
        var index = href.lastIndexOf('/');
        var shref = href.substr(0, index);
        if (shref && self.allowedFolders.indexOf("/" + shref) < 0) {
          continue;
        }
        if (strip404s && entry["404"])
          delete entry["404"];
        response = jsDAV_Property_Response.new(href, entry);
        xml = response.serialize(this, xml);
      }
      return xml + "</d:multistatus>";
    };

    return Abauth.authenticate.apply(this, arguments);
  },

  validateUserPass: function (username, password, cbvalidpass) {

    console.log("WEBDAV [%s] %s", this.req.method, this.req.url);

    var url = qs.unescape(this.req.url);
    var l = url.length;
    var method = this.req.method;
    var self = this;

    if (url !== "/" && url[l - 1] == "/") {
      url = url.substr(0, l - 1);
    }

    authUtil.authenticate(username, password, function (err, user) {

      if (err) {
        return cbvalidpass(false, err);
      }

      authUtil.authorise(url, user, method, function (err, folder) {
        if (err) {
          return cbvalidpass(false, err);
        }

        if (method == "PROPFIND" || method == "GET") {
          authUtil.getAllowedSubfolders(url, user, function (err, folders) {
            if (err) {
              return cbvalidpass(false, err);
            }
            self.allowedFolders = folders;
            cbvalidpass(true);
          });
          return;
        }

        if (method == "DELETE") {
          //TODO: remove resource from the disc and then call cbvalidpass(true)
        }

        return cbvalidpass(true);
      })

    });
  }
});
