'use strict';
var methode = Event.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const End = require("./End.js");
const Animate = require("./Animate.js");
const Play = require("./Play.js");
const Wait = require("./Wait.js");
const Wiggle = require("./Wiggle.js");
const Stop = require("./Stop.js");

function Event(elements) {
	this.elements = elements;
}

Event.fromNode = function(node, projectPath, materialNames, errors) {
	var children = node.childNodes;
	if(children.length == 0)
		errors.push(new ParseError("Invalid event tag: no child tag.", node.lineNumber));
	
	var childElements = new Array();
	
	for(let i = 0; i < children.length; i++) {
		if(children.item(i).nodeName != "#text")
			childElements.push(Event.getChildEvent(children.item(i), projectPath, materialNames, errors));
	}
	
	return new Event(childElements);
}

Event.getChildEvent = function(node, projectPath, materialNames, errors) {
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

module.exports = Event;