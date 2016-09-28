'use strict';

var _ = require('underscore'),
    expect = require('expect.js'),
    sinon = require('sinon'),
    path = require('path'),
    rewire = require('rewire'),
    Plugin = rewire('../index.js');

describe('serverless-plugin-write-env-vars', function() {

   describe('init', function() {

      it('registers the appropriate hook', function() {
         var plugin = new Plugin();

         expect(plugin.hooks['before:deploy:function:deploy']).to.be.a('function');
         expect(plugin.hooks['after:deploy:function:deploy']).to.be.a('function');
         expect(plugin.hooks['before:deploy:createDeploymentArtifacts']).to.be.a('function');
         expect(plugin.hooks['after:deploy:createDeploymentArtifacts']).to.be.a('function');
         expect(plugin.hooks['before:offline:start']).to.be(undefined);
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

      it('registers before:offline:start that calls writeEnvironmentFile when configured to do so', function() {
         var sls, plugin,
             spy = sinon.spy(),
             functions = {},
             ExtPlugin, hook, fn;

         sls = {
            service: { custom: { writeEnvVarsOffline: true } },
            cli: { log: _.noop },
         };

         plugin = new Plugin(sls);

         expect(plugin.hooks['before:offline:start']).to.be.a('function');

         // inlining testHookRegistration to pass it our serverless 'instance' with the config option enabled
         hook = 'before:offline:start';
         fn = 'writeEnvironmentFile';

         functions[fn] = spy;
         ExtPlugin = Plugin.extend(functions);

         plugin = new ExtPlugin(sls);
         plugin.hooks[hook]();

         expect(spy.called).to.be.ok();
         expect(spy.calledOn(plugin));
      });

   });


   describe('getEnvFilePath', function() {

      it('returns the correct path', function() {
         var plugin = new Plugin({ config: { servicePath: '/tmp/foo' } });

         expect(plugin.getEnvFilePath()).to.eql(path.join('/tmp/foo', '.env'));
      });

   });


   describe('writeEnvironmentFile', function() {

      it('formats the output correctly and writes it to the correct place', function() {
         var filePath = path.join('/tmp/foo', '.env'),
             vars = { FOO: 'bar', TEST123: 'xyz' },
             content = 'FOO=bar\nTEST123=xyz',
             fsStub = { writeFile: _.noop },
             mock = sinon.mock(fsStub),
             sls, plugin, revert;

         mock.expects('writeFile').once().withArgs(filePath, content).callsArg(2);
         revert = Plugin.__set__('fs', fsStub);

         sls = {
            config: { servicePath: '/tmp/foo' },
            service: { custom: { writeEnvVars: vars } },
            cli: { log: _.noop },
         };

         plugin = new Plugin(sls);

         return plugin.writeEnvironmentFile()
            .then(function() {
               mock.verify();
               revert();
            });
      });

   });


   describe('deleteEnvironmentFile', function() {

      function runTest(exists) {
         var filePath = path.join('/tmp/foo', '.env'),
             fsStub = { stat: _.noop, unlink: _.noop },
             mock = sinon.mock(fsStub),
             sls, plugin, revert;

         if (exists) {
            mock.expects('stat').once().withArgs(filePath).callsArg(1);
            mock.expects('unlink').once().withArgs(filePath).callsArg(1);
         } else {
            mock.expects('stat').once().withArgs(filePath).throws();
         }

         revert = Plugin.__set__('fs', fsStub);

         sls = {
            config: { servicePath: '/tmp/foo' },
            cli: { log: _.noop },
         };

         plugin = new Plugin(sls);

         return plugin.deleteEnvironmentFile()
            .then(function() {
               mock.verify();
               revert();
            });
      }

      it('invokes the proper functions - when file exists', function() {
         runTest(true);
      });

      it('invokes the proper functions - when file does not exist', function() {
         runTest(false);
      });

   });

});
