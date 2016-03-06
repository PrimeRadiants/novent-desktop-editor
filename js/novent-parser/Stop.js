'use strict';
var methode = Stop.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const Event = require("./Event.js");

function Stop(target) {
	this.target = target;
}

Stop.fromNode = function(node, projectPath, errors) {
	var target = ParseUtil.validateNonEmptyStringAttr(node, "target");
	var children = node.childNodes;
	if(children != null && children.length > 0)
		errors.push(new ParseError("Invalid stop tag: must be empty.", node.lineNumber));
		
	return new Stop(target);
}

module.exports = Stop;