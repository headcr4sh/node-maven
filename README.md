# Maven for Node.js

Node.js package that wraps [Apache Maven](https://maven.apache.org/).

## Installation
```sh
npm install maven
```

## Basic usage
```javascript
    var mvn = require('maven').create({
      basedir: '/path/to/your/maven-project'
    });
    mvn.execute(['clean', 'install'], { 'skipTests': true });
```

## Creating the Maven wrapper instance

Creating a Maven wrapper instance is pretty much straight forward:
```javascript
    var mvn = require('maven').create(options);
```

The following options can be passed to the <code>create</code> method:

#### `basedir` (default: ```__basedir```)
This parameter can be used to define the base directory when invoking the Maven command line.

#### `file` (default: ```undefined```)
Can be used to pass a specific POM file to the Maven command line. If nothing is specified, the Maven process itself will look for a file called ```pom.xml``` in the base directory.

## Executing Maven commands

Executing maven commands is simple, too:
```javascript
    mvn.execute(commands, defines);
```

`commands` is just a list of lifecycle phases and/or goals, e.g. ```'compile'```, ```[ 'clean', 'install' ]``` or ```[ 'release:prepare', 'release:perform' ]```.

`defines` is an object that represents the various definitions that will be passed to Java/Maven via ```-Dkey=value``` parameters.
