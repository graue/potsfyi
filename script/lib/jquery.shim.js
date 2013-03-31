// jQuery does not export itself as node.js/CommonJS module
require("./jquery");
// but after the require we can just export the jQuery
// global from this module
module.exports = window.jQuery;
