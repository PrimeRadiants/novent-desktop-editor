'use strict';
var methode = Wait.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const End = require("./End.js");
const Animate = require("./Animate.js");
const Play = require("./Play.js");
const Wiggle = require("./Wiggle.js");
const Stop = require("./Stop.js");

function Wait(childElements, duration) {
	this.childElements = childElements;
	this.duration = duration;
}

Wait.fromNode = function(node, projectPath, materialNames, errors) {
	var duration = ParseUtil.validatePositiveIntegerAttr(node, "duration", errors);
	
	var childElements = new Array();
	var children = node.childNodes;
	for(let i = 0; i < children.length; i++) {
		if(children.item(i).nodeName != "#text")
			childElements.push(getChildEvent(children.item(i), projectPath, materialNames, errors));
	}
	
	return new Wait(childElements, duration);
}

var getChildEvent = function(node, projectPath, errors) {
	var result;
	if(node.nodeName == "end") {
		result = End.fromNode(node, projectPath, errors);
	}
	else if(node.nodeName == "animate") {
		result = Animate.fromNode(node, projectPath, materialNames, errors);
	}
	else if(node.nodeName == "play") {
		result = Play.fromNode(node, projectPath, materialNames, errors);
	}
	else if(node.nodeName == "wait") {
		result = Wait.fromNode(node, projectPath, materialNames, errors);
	}
	else if(node.nodeName == "wiggle") {
		result = Wiggle.fromNode(node, projectPath, errors);
	}
	else if(node.nodeName == "stop") {
		result = Stop.fromNode(node, projectPath, errors);
	}
	else {
		errors.push(new ParseError("Invalid event content: unsupported tag: " + node.tageName + ".", node.lineNumber));
	}
	
	return result;
}

module.exports = Wait;