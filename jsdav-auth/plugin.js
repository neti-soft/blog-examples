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
    return Abauth.authenticate.apply(this, arguments);
  },

  validateUserPass: function (username, password, cbvalidpass) {

    console.log("WEBDAV [%s] %s", this.req.method, this.req.url);

    var url = qs.unescape(this.req.url);
    var l = url.length;
    var method = this.req.method;

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

        if (method == "DELETE") {
          //TODO: remove resource from the disc and then call cbvalidpass(true)
        }

        return cbvalidpass(true);
      })

    });
  }
});
