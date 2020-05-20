# Maven for Node.js

Node.js package that wraps [Apache Maven](https://maven.apache.org/).

## Installation
```sh
npm install maven
```

## Basic usage
```javascript
    const mvn = require('maven').create({
      cwd: '/path/to/your/maven-project'
    });
    mvn.execute(['clean', 'install'], { 'skipTests': true }).then(() => {
      // As mvn.execute(..) returns a promise, you can use this block to continue
      // your stuff, once the execution of the command has been finished successfully.
    });
```

## Creating the Maven wrapper instance

Creating a Maven wrapper instance is pretty much straight forward:
```javascript
    const mvn = require('maven').create(options);
```

The following options can be passed to the <code>create</code> method:

#### `cwd` (default: ```process.cwd()```)
This parameter can be used to define the working directory when invoking the Maven command line.

#### `cmd` (default: ```./mvnw``` if present in project root, otherwise ```mvn``` (or ```mvn.bat``` on Windows))
Maven executable relative to `cwd`. For example, `cwd: '/usr/local/bin/mvn`

#### `file` (default: ```undefined```)
Can be used to pass a specific POM file to the Maven command line. If nothing is specified, the Maven process itself will look for a file called ```pom.xml``` in the base directory.

#### `profiles` (default: ```[]```)
An array that can be used to enable or disable profiles.
You can either explicitly enable a profile by adding it's name or disable a
profile by pre-pending ```!``` to it's name.
Will be passed to Java/Maven as ```-PprofileEnabled,!profileDisabled``` parameter.

#### `settings` (default: ```undefined```)
Can be used to override the default settings file when invoking Maven.
If nothing is specified, the Maven process itself will load ```.m2/settings.xml```
in the user's home directory.

#### `quiet` (default: ```false```)
Quiet output - only show errors if set to ```true```.

#### `debug` (default: ```false```)
Produce execution debug output if set to ```true```.

#### `updateSnapshots` (default: ```false```)
Forces a check for missing releases and updated snapshots on
remote repositories if set to ```true```.

#### `offline` (default: ```false```)
Produce execution offline if set to ```true```.

#### `nonRecursive` (default: ```false```)
Prevents Maven from building submodules if set to ```true```.

#### `threads` (default: ```undefined```)
Thread count, for instance 2.0C where C is core multiplied

#### `noTransferProgress` (default: ```false```)
Suppress the transfer progress when downloading/uploading in interactive mode if set to ```true``` (requires Maven 3.6.1+).

#### `batchMode` (default: ```false```)
Run in non-interactive (batch) mode (disables output color) if set to ```true```.

#### `alsoMake` (default: ```false```)
If project list is specified, also build projects required by the list

#### `logFile` (default: ```undefined```)
Log file where all build output will go (disables output color).

## Executing Maven commands

Executing Maven commands is simple, too:

```javascript
mvn.execute(commands, defines);
```

You can optionally specify a list of projects to be build:

```javascript
mvn.execute(commands, defines, projects)
```

`commands` is just a list of lifecycle phases and/or goals, e.g. ```'compile'```, ```[ 'clean', 'install' ]``` or ```[ 'release:prepare', 'release:perform' ]```.

`defines` is an object that represents the various definitions that will be passed to Java/Maven via ```-Dkey=value``` parameters.
