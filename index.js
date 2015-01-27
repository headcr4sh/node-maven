/* jslint node: true */

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
    var proc = spawn('mvn', args, { cwd: mvn.basedir }, function (error, stdout, stderr) {
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
* @param {Object<string, string>=} defines
*     Defines to be passed to the mvn executable via "-D" flags.
*/
var _run = function (mvn, commands, defines) {
  var args = [];
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
  console.log(args);
  return _spawn(mvn, args);
};

/**
* Creates a new Maven wrapper instance.
* @param {string=} basedir
*     Base directory for invoking 'mvn'. Uses __dirname if not specified.
* @constructor
*/
var Maven = function (basedir) {
  this.basedir = basedir || __dirname;
};

/**
 * Creates a new Maven wrapper instance.
 * @param {string=} basedir
 *     Base directory for invoking 'mvn'. Uses __dirname if not specified.
 * @return {!Maven}
 *   A new Maven wrapper instance.
 */
Maven.create = function (basedir) {
  return new Maven(basedir);
}

Maven.prototype.execute = function (commands, defines) {
  return _run(this, commands, defines);
};

module.exports = Maven;
