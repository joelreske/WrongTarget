window.DEBUG = true;

/**
* Log a message to the console if debugging is enabled
*/
window.log = function (/*...*/) {
  if (window.DEBUG) {
    console.log.apply(console, arguments);
  }
};

/**
 * Basic implementation of requirejs
 * for requiring other javascript files
 */
function require(module) {
  return require.scopes[module];
}
require.scopes = {};
