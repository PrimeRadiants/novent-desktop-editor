'use strict';
var methode = Play.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const End = require("./End.js");
const Animate = require("./Animate.js");
const Wait = require("./Wait.js");
const Wiggle = require("./Wiggle.js");
const Stop = require("./Stop.js");

function Play(childElements, targetType, target, loop) {
	this.childElements = childElements;
	this.targetType = targetType;
	this.target = target;
	this.loop = loop;
}

Play.fromNode = function(node, projectPath, materialNames, errors) {
	var target = ParseUtil.validateTargetAttr(node, "target", errors);
	
	if(target[0] == "image" || target[0] == "text")
		errors.push(new ParseError("Invalit target type value.", node.lineNumber));
	
	var existingMaterial = false;
	materialNames.forEach(function(e) {
		if(e.name == target[1] && e.type == target[0])
			existingMaterial = true;
	});
	
	if(!existingMaterial)
		errors.push(new ParseError("Unknown material name.", node.lineNumber));
	
	var loop = ParseUtil.validateArrayValueAttr(node, "loop", ParseUtil.LoopValues, errors);
	
	var childElements = new Array();
	var children = node.childNodes;
	for(let i = 0; i < children.length; i++) {
		if(children.item(i).nodeName != "#text")
			childElements.push(getChildEvent(children.item(i), projectPath, materialNames, errors));
	}
	
	return new Play(childElements, target[0], target[1], loop);
}

var getChildEvent = function(node, projectPath, materialNames, errors) {
	console.log(Animate);
	console.log(End);
	console.log(Wait);
	console.log(Stop);
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


module.exports = Play;