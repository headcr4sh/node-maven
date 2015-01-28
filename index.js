/* jslint node: true */

/*
* Copyright (C) 2015 Benjamin P. Jung.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/


/**
 * Maven for Node.js.
 * @module maven
 */

var util = require('util');
var Promise = Promise || require('es6-promise').Promise;

/**
* A simple wrapper around child_process.spawn that returns a promise.
* @private
* @param {!Maven} mvn
* @param {!Array.<string>} args
*     Command to be executed.
* @return {Promise.<void>}
*/
var _spawn = function (mvn, args) {
  var spawn = require('child_process').spawn;
  return new Promise(function (resolve, reject) {
    var proc = spawn('mvn', args, { cwd: mvn.options.basedir }, function (error, stdout, stderr) {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
    proc.on('error', reject);
    proc.on('close', function (code) {
      if (code !== 0) {
        reject({ code: code});
      } else {
        resolve();
      }
    });
    proc.stdout.on('data', function(data) { process.stdout.write('' + data); });
    proc.stderr.on('data', function(data) { process.stderr.write('' + data); });
  });
};

/**
* @private
* @param {!Maven} mvn
* @param {string|!Array.<string>} commands
*     Command(s) to be executed.
* @param {Object<string, string>} [defines]
*     Defines to be passed to the mvn executable via "-D" flags.
*/
var _run = function (mvn, commands, defines) {
  var args = [];
  if (mvn.options.file) {
    args.push('-f', 'mvn.options.file');
  }
  if (defines) {
    for (var define in defines) {
      if (defines.hasOwnProperty(define)) {
        args.push('-D' + define + '=' + defines[define]);
      }
    }
  }
  if (typeof commands === 'string') {
    args.push(commands);
  } else {
    args.concat(commands);
  }
  return _spawn(mvn, args);
};

/**
 * @typedef {Object} MavenOptions
 * @property {!string} basedir
 *   Base directory (Default is: <code>__dirname</code>)
 * @property {?string} file
 *   Filename of the POM. (Results in <code>-f ${file}</code>)
 */

/**
* Creates a new Maven wrapper instance.
* @param {MavenOptions} [options]
*     Configuration options.
* @constructor
*/
var Maven = function (options) {
  this.options = options || {};
  if (!this.options.basedir) {
    this.options.basedir = __dirname;
  }
};

/**
 * Creates a new Maven wrapper instance.
 * @param {MavenOptions} [options]
 *     Configuration options.
 * @returns {!Maven}
 *   A new Maven wrapper instance.
 */
Maven.create = function (options) {
  return new Maven(options);
};

/**
 * Executes one or more Maven commands.
 * @param {!Array.<string>|string} commands
 *     A list of commands to be executed or a single command.
 * @param {Object.<string, *>} [defines]
 *     List of defines that will be passed to the Java VM via
 *     <code>-Dkey=value</code>
 */
Maven.prototype.execute = function (commands, defines) {
  return _run(this, commands, defines);
};


module.exports = Maven;
