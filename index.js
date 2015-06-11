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
 * @module node-maven
 */

var Promise = Promise || require('es6-promise').Promise;

/**
 * child_process.spawn works a bit different when using
 * Windows.
 */
var isWin = /^win/.test(process.platform);

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
  // Command to be executed. 'mvn' or 'mvn.bat' when using Windows.
  var cmd = 'mvn';
  return new Promise(function (resolve, reject) {
    if (isWin) {
      args.unshift(cmd);
      args.unshift('/c'),
      args.unshift('/s');
      cmd = 'cmd.exe';
    }
    var proc = spawn(cmd, args, { cwd: mvn.options.cwd }, function (error, stdout, stderr) {
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
    proc.stdout.on('data', process.stdout.write.bind(process.stdout));
    proc.stderr.on('data', process.stderr.write.bind(process.stderr));
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
  if (mvn.options.settings) {
    args.push('-s', mvn.options.settings);
  }
  if (mvn.options.file) {
    args.push('-f', mvn.options.file);
  }
  if (mvn.options.quiet) {
    args.push('-q');
  }
  if (mvn.options.debug) {
    args.push('-d');
  }
  if (mvn.options.updateSnapshots) {
    args.push('-U');
  }
  if (defines) {
    for (var define in defines) {
      if (defines.hasOwnProperty(define)) {
        args.push('-D' + define + '=' + defines[define]);
      }
    }
  }
  if (mvn.options.profiles && mvn.options.profiles.length > 0) {
    args.push('-P', mvn.options.profiles.join(','));
  }
  if (typeof commands === 'string') {
    args.push(commands);
  } else {
    args = args.concat(commands);
  }
  return _spawn(mvn, args);
};

/**
 * @typedef {Object} MavenOptions
 * @property {!string} cwd
 *   Working directory (Default is: <code>process.cwd()</code>)
 * @property {?string} file
 *   Filename of the POM. (Results in <code>-f ${file}</code>)
 * @property {?string} settings
 *   Filename of settings.xml to be used (Results in <code>-s ${setings}</code>)
 * @property {?Array.<string>} profiles
 *   List of profiles to be enabled or disabled.
 * @property {boolean} quiet
 *   Quiet output - only show errors if set to <code>true</code>.
 * @property {boolean} debug
 *   Produce execution debug output if set to <code>true</code>.
 * @property {boolean} updateSnapshots
 *   Forces a check for missing releases and updated snapshots on
 *   remote repositories. Defaults to <code>false</code>.
 */

/**
* Creates a new Maven wrapper instance.
* @param {MavenOptions} [options]
*     Configuration options.
* @constructor
*/
var Maven = function (options) {
  this.options = options || {};
  if (!this.options.cwd) {
    this.options.cwd = process.cwd();
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
