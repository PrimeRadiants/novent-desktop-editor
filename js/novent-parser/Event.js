'use strict';
var methode = Event.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const EventLibrary = require("./EventLibrary.js");

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
		result = EventLibrary.End.fromNode(node, projectPath, errors);
	}
	else if(node.nodeName == "animate") {
		result = EventLibrary.Animate.fromNode(node, projectPath, materialNames, errors);
	}
	else if(node.nodeName == "play") {
		result = EventLibrary.Play.fromNode(node, projectPath, materialNames, errors);
	}
	else if(node.nodeName == "wait") {
		result = EventLibrary.Wait.fromNode(node, projectPath, materialNames, errors);
	}
	else if(node.nodeName == "wiggle") {
		result = EventLibrary.Wiggle.fromNode(node, projectPath, errors);
	}
	else if(node.nodeName == "stop") {
		result = EventLibrary.Stop.fromNode(node, projectPath, errors);
	}
	else {
		errors.push(new ParseError("Invalid event content: unsupported tag: " + node.tageName + ".", node.lineNumber));
	}
	
	return result;
}

module.exports = Event;