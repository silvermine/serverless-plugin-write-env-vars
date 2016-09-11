'use strict';

var expect = require('expect.js'),
    sinon = require('sinon'),
    path = require('path'),
    Plugin = require('../index.js');

describe('serverless-plugin-write-env-vars', function() {

   describe('init', function() {

      it('registers the appropriate hook', function() {
         var plugin = new Plugin();

         expect(plugin.hooks['before:deploy:function:deploy']).to.be.a('function');
         expect(plugin.hooks['after:deploy:function:deploy']).to.be.a('function');
         expect(plugin.hooks['before:deploy:createDeploymentArtifacts']).to.be.a('function');
         expect(plugin.hooks['after:deploy:createDeploymentArtifacts']).to.be.a('function');
      });


      function testHookRegistration(hook, fn) {
         it('registers ' + hook + ' that calls ' + fn, function() {
            var spy = sinon.spy(),
                functions = {},
                ExtPlugin, plugin;

            functions[fn] = spy;
            ExtPlugin = Plugin.extend(functions);

            plugin = new ExtPlugin();
            plugin.hooks[hook]();

            expect(spy.called).to.be.ok();
            expect(spy.calledOn(plugin));
         });
      }

      testHookRegistration('before:deploy:function:deploy', 'writeEnvironmentFile');
      testHookRegistration('after:deploy:function:deploy', 'deleteEnvironmentFile');
      testHookRegistration('before:deploy:createDeploymentArtifacts', 'writeEnvironmentFile');
      testHookRegistration('after:deploy:createDeploymentArtifacts', 'deleteEnvironmentFile');

   });


   describe('getEnvFilePath', function() {

      it('returns the correct path', function() {
         var plugin = new Plugin({ config: { servicePath: '/tmp/foo' } });

         expect(plugin.getEnvFilePath()).to.eql(path.join('/tmp/foo', '.env'));
      });

   });


   describe('writeEnvironmentFile', function() {
      // TODO: write tests
   });


   describe('deleteEnvironmentFile', function() {
      // TODO: write tests
   });

});
