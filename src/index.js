'use strict';

var _ = require('underscore'),
    Q = require('q'),
    fs = require('fs'),
    path = require('path'),
    Class = require('class.extend');

module.exports = Class.extend({

   init: function(serverless, opts) {
      this._serverless = serverless;
      this._opts = opts;

      this.hooks = {
         'before:deploy:function:deploy': this.writeEnvironmentFile.bind(this),
         'after:deploy:function:deploy': this.deleteEnvironmentFile.bind(this),
         'before:deploy:createDeploymentArtifacts': this.writeEnvironmentFile.bind(this),
         'after:deploy:createDeploymentArtifacts': this.deleteEnvironmentFile.bind(this),
      };
   },

   getEnvFilePath: function() {
      return path.join(this._serverless.config.servicePath, '.env');
   },

   writeEnvironmentFile: function() {
      var filePath = this.getEnvFilePath(),
          str;

      str = _.reduce(this._serverless.service.custom.writeEnvVars, function(memo, val, key) {
         return memo + key + '=' + val + '\n';
      }, '');

      return Q.ninvoke(fs, 'writeFile', filePath, str)
         .then(function() {
            this._serverless.cli.log('Wrote .env file to ' + filePath);
         }.bind(this));
   },

   deleteEnvironmentFile: function() {
      var filePath = this.getEnvFilePath(),
          doDelete = true;

      return Q.ninvoke(fs, 'stat', filePath)
         .catch(function() {
            doDelete = false;
            // swallow an error because it just means the file isn't there
            // that's not an error in deleting it - it just means something
            // else deleted it, or possibly that there was an error in creating
            // it, which should be logged elsewhere
         })
         .then(function() {
            if (doDelete) {
               this._serverless.cli.log('Deleted .env file from ' + filePath);
               return Q.ninvoke(fs, 'unlink', filePath);
            }
         }.bind(this));
   },

});
