var utils = require("utils");
var webrequest = require("webrequest");

/**
* Start all the listeners
*/
webrequest.startListeners();

// TODO move listeners and this message behind INITIALIZED
console.log('Wrong Target is ready to rock!');
console.log('Set DEBUG=1 to view console messages.');
