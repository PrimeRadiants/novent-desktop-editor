'use strict';
var methode = End.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const Event = require("./Event.js");

function End() {

}

End.fromNode = function(node, projectPath, errors) {
	var children = node.childNodes;
	if(children != null && children.length > 0)
		errors.push(new ParseError("Invalid end tag: must be empty.", node.lineNumber));
		
	return new End();
}

module.exports = End;