# Maven for Node.js

## Example usage
```javascript
    var mvn = require('maven').create('/path/to/your/maven-project');
    mvn.execute(['clean', 'install'], { 'skipTests': true });
```
