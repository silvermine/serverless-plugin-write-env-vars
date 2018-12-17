# WARNING: DEPRECATED PLUGIN

Serverless now has built-in support for [environment variables][sls-env-vars]. As such,
this plugin is deprecated and no longer maintained.

[sls-env-vars]: https://serverless.com/framework/docs/providers/aws/guide/functions/#environment-variables

# Serverless Plugin: Write Env Vars

[![Build Status](https://travis-ci.org/silvermine/serverless-plugin-write-env-vars.png?branch=master)](https://travis-ci.org/silvermine/serverless-plugin-write-env-vars)
[![Coverage Status](https://coveralls.io/repos/github/silvermine/serverless-plugin-write-env-vars/badge.svg?branch=master)](https://coveralls.io/github/silvermine/serverless-plugin-write-env-vars?branch=master)
[![Dependency Status](https://david-dm.org/silvermine/serverless-plugin-write-env-vars.png)](https://david-dm.org/silvermine/serverless-plugin-write-env-vars)
[![Dev Dependency Status](https://david-dm.org/silvermine/serverless-plugin-write-env-vars/dev-status.png)](https://david-dm.org/silvermine/serverless-plugin-write-env-vars#info=devDependencies&view=table)


## What is it?

This is a plugin for the Serverless framework (1.x branch, prior to 1.0.0
final) that writes environment variables out to a file that is compatible with
[dotenv](https://www.npmjs.com/package/dotenv).

Likely once [Serverless #1455](https://github.com/serverless/serverless/issues/1455)
is finished, we will no longer need this plugin.

## How do I use it?

Easy! In your `serverless.yml` file you add a custom variable that is a list of
variables you want written to an environment file. That file will be written
and bundled into the root of your code bundle. Then you can rely on the
[dotenv](https://www.npmjs.com/package/dotenv) library to load the file and
make those variables accessible to your running Lambda functions.

This makes it simple to take advantage of the powerful [variables
capabilities](https://serverless.com/framework/docs/providers/aws/guide/variables)
that are built into Serverless.

For example:

```yml
service: petstore-api

custom:
   projectName: petstore
   defaultRegion: us-east-1
   region: ${opt:region, self:custom.defaultRegion}
   stage: ${opt:stage, env:USER}
   writeEnvVars:
      SERVERLESS_STAGE: ${self:custom.stage}
      SERVERLESS_PROJECT: ${self:custom.projectName}
      SERVERLESS_SERVICE_NAME: ${self:service}

plugins:
   - serverless-plugin-write-env-vars
```

That's all! Fill those variables up with any keys and values you want!

**NOTE:** at this time the plugin does absolutely no sanitization of keys or
values, so you should make sure they are simple strings that do not have line
breaks or other characters that would need to be escaped.

## How do I contribute?

Easy! Pull requests are welcome! Just do the following:

   * Clone the code
   * Install the dependencies with `npm install`
   * Create a feature branch (e.g. `git checkout -b my_new_feature`)
   * Make your changes and commit them with a reasonable commit message
   * Make sure the code passes our standards with `grunt standards`
   * Make sure all unit tests pass with `npm test`

Our goal is 100% unit test coverage, with **good and effective** tests (it's
easy to hit 100% coverage with junk tests, so we differentiate). We **will not
accept pull requests for new features that do not include unit tests**. If you
are submitting a pull request to fix a bug, we may accept it without unit tests
(we will certainly write our own for that bug), but we *strongly encourage* you
to write a unit test exhibiting the bug, commit that, and then commit a fix in
a separate commit. This *greatly increases* the likelihood that we will accept
your pull request and the speed with which we can process it.


## License

This software is released under the MIT license. See [the license file](LICENSE) for more details.
