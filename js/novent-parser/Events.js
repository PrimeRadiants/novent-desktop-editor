'use strict';
var methode = Events.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const Event = require("./Event.js");

function Events(events) {
	this.events = events;
}

Events.fromNode = function(node, projectPath, materialNames, errors) {
	var eventNodes = node.getElementsByTagName("event");
	
	if(eventNodes.length == 0) {
		errors.push(new ParseError("No event tag.", node.lineNumber));
	}
	else {
		var events = new Array();
		for(let i = 0; i < eventNodes.length; i++)
			events.push(Event.fromNode(eventNodes.item(i), projectPath, materialNames, errors));
		
	}
	
	return new Events(events);
}

module.exports = Events;