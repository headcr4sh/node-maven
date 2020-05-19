"use strict";

/*
 * Copyright (C) 2015-2016 Benjamin P. Jung.
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

/**
 * child_process.spawn works a bit different when using
 * Windows.
 */
const isWin = /^win/.test(process.platform);

/**
 * Determine if maven wrapper (./mvnw) is present in cwd root
 */
const mvnw = cwd => {
    const cmd = require("path").resolve(cwd, "mvnw");
    return require("fs").existsSync(cmd) ? cmd : false;
};

/**
* A simple wrapper around child_process.spawn that returns a promise.
* @private
* @param {!Maven} mvn
* @param {!Array.<string>} args
*     Command to be executed.
* @return {Promise.<void>}
*/
function _spawn(mvn, args) {
  const spawn = require('child_process').spawn;
  // Command to be executed.
  let cmd = mvn.options.cmd || mvnw(mvn.options.cwd) || 'mvn';
  return new Promise((resolve, reject) => {
    if (isWin) {
      args.unshift(cmd);
      args.unshift('/c'),
      args.unshift('/s');
      cmd = process.env.COMSPEC || 'cmd.exe';
    }
    const proc = spawn(cmd, args, { 'cwd': mvn.options.cwd, stdio: [process.stdin, process.stdout, process.stderr] });
    proc.on('error', reject);
    proc.on('exit', (code, signal) => {
      if (code !== 0) {
        reject({ 'code': code, 'signal': signal });
      } else {
        resolve();
      }
    });
  });
};

/**
* @private
* @param {!Maven} mvn
* @param {string|!Array.<string>} commands
*     Command(s) to be executed.
* @param {Object<string, string>} [defines]
*     Defines to be passed to the mvn executable via "-D" flags.
* @param {string|!Array.<string>} projects
*     Project(s) to be build inside a maven reactor.
*/
function _run(mvn, commands, defines, projects) {
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
    args.push('-X');
  }
  if (mvn.options.updateSnapshots) {
    args.push('-U');
  }
  if (mvn.options.offline) {
    args.push('-o');
  }
  if (mvn.options.nonRecursive) {
    args.push('-N');
  }
  if (mvn.options.threads) {
      args.push(`-T ${mvn.options.threads}`);
  }
  if (mvn.options.noTransferProgress) {
      args.push('-ntp')
  }
  if (mvn.options.batchMode) {
      args.push('-B')
  }
  if (mvn.options.logFile) {
      args.push('-l', mvn.options.logFile);
  }
  if (mvn.options.alsoMake) {
      args.push('-am');
  }

  if (defines) {
    for (let define in defines) {
      if (defines.hasOwnProperty(define)) {
        args.push(`-D${define}=${defines[define]}`);
      }
    }
  }

  if(projects && projects.length > 0){
    args.push('-pl');
    args.push(projects.join(','));
  }

  if (mvn.options.profiles && mvn.options.profiles.length > 0) {
    args.push(`-P${mvn.options.profiles.join(',')}`);
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
 * @property {(string|undefined)} cwd
 *   Working directory (Default is: <code>process.cwd()</code>)
 * @property {{string|undefined}} cmd
 *   Maven executable relative to <code>cwd</code>. Default is './mvnw' if the mvnw 
 *   executable is in your project root. Otherwise, default is 'mvn' or 'mvn.bat' when using Windows.
 * @property {(string|undefined)} file
 *   Filename of the POM. (Results in <code>-f ${file}</code>)
 * @property {(string|undefined)} settings
 *   Filename of settings.xml to be used (Results in <code>-s ${setings}</code>)
 * @property {(!Array.<string>|undefined)} profiles
 *   List of profiles to be enabled or disabled.
 * @property {(boolean|undefined)} quiet
 *   Quiet output - only show errors if set to <code>true</code>.
 * @property {(boolean|undefined)} debug
 *   Produce execution debug output if set to <code>true</code>.
 * @property {(boolean|undefined)} updateSnapshots
 *   Forces a check for missing releases and updated snapshots on
 *   remote repositories. Defaults to <code>false</code>.
 * @property {(boolean|undefined)} offline
 *   Produce execution offline if set to <code>true</code>.
 * @property {(boolean|undefined)} nonRecursive
 *   Prevents Maven from building submodules if set to <code>true</code>.
 * @property {(number|undefined)} threads
 *   Thread count, for instance 2.0C where C is core multiplied
 * @property {(boolean|undefined)} noTransferProgress
 *   Suppress the transfer progress when downloading/uploading in interactive mode if set to <code>true</code>
 * @property {(boolean|undefined)} batchMode
 *   Run in non-interactive (batch) mode (disables output color) if set to <code>true</code>
 * @property {(string|undefined)} logFile
 *   Log file where all build output will go (disables output color) (Results in <code>-l ${file}</code>)
 * @property {(boolean|undefined)} alsoMake
 *   Builds the specific list of projects and any that depend on them, if set to <code>true</code>.
 */


/**
 * Maven wrapper.
 */
class Maven {
    /**
     * Creates a new Maven wrapper instance.
     * @param {MavenOptions} [options]
     *     Configuration options.
     */
    constructor(options) {
        this.options = options || {};
        if (!this.options.cwd) {
            this.options.cwd = process.cwd();
        }
    }
    /**
     * Creates a new Maven wrapper instance.
     * @param {MavenOptions} [options]
     *     Configuration options.
     * @returns {!Maven}
     *   A new Maven wrapper instance.
     */
    static create(options) {
        return new Maven(options);
    }
    /**
     * Executes one or more Maven commands.
     * @param {!Array.<string>|string} commands
     *     A list of commands to be executed or a single command.
     * @param {Object.<string, *>} [defines]
     *     List of defines that will be passed to the Java VM via
     *     <code>-Dkey=value</code>
     * @param {!Array.<string>|string} projects
     *     A list of projects to be executed.
     * @return {!Promise.<?>}
     */
    execute(commands, defines, projects) {
        return _run(this, commands, defines, projects);
    }
}

module.exports = Maven;
