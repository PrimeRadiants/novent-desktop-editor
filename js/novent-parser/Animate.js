'use strict';
var methode = Animate.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const End = require("./End.js");
const Play = require("./Play.js");
const Wait = require("./Wait.js");
const Wiggle = require("./Wiggle.js");
const Stop = require("./Stop.js");

function Animate(childElements, targetType, target, property, value, duration, ease) {
	this.childElements = childElements;
	this.targetType = targetType;
	this.target = target;
	this.property = property;
	this.value = value;
	this.duration = duration;
	this.ease = ease;
}

Animate.fromNode = function(node, projectPath, materialNames, errors) {
	var target = ParseUtil.validateTargetAttr(node, "target", errors);
	var property = ParseUtil.validatePropertyAttr(node, "property", ParseUtil.PropertyValues, errors);
	
	if(target[0] == "sound" && property.name != "volume")
		errors.push(new ParseError("Invalid property value for sound material.", node.lineNumber));
	else if(target[0] != "sound" && property.name == "volume")
		errors.push(new ParseError("Invalid property value for " + target[0] + " material.", node.lineNumber));
	
	
	var existingMaterial = false;
	materialNames.forEach(function(e) {
		if(e.name == target[1] && e.type == target[0])
			existingMaterial = true;
	});
	
	if(!existingMaterial)
		errors.push(new ParseError("Unknown material name.", node.lineNumber));
		
	var value;
	
	if(property.type == "integer")
		value = ParseUtil.validateIntegerAttr(node, "value", errors);
	else if(property.type == "positiveInteger")
		value = ParseUtil.validatePositiveIntegerAttr(node, "value", errors);
	else if(property.type == "betweenZeroAndOne")
		value = ParseUtil.validateBetweenZeroAndOneAttr(node, "value", errors);
	else if(property.type == "real")
		value = ParseUtil.validateRealAttr(node, "value", errors);
	else
		value = ParseUtil.validatePositiveRealAttr(node, "value", errors);
	
	var duration = ParseUtil.validatePositiveIntegerAttr(node, "duration", errors);
	var ease = ParseUtil.validateArrayValueAttr(node, "ease", ParseUtil.EaseValues, errors);
	
	var childElements = new Array();
	var children = node.childNodes;
	for(let i = 0; i < children.length; i++) {
		if(children.item(i).nodeName != "#text")
			childElements.push(getChildEvent(children.item(i), projectPath, materialNames, errors));
	}
	
	return new Animate(childElements, target[0], target[1], property.name, value, duration, ease);
}

var getChildEvent = function(node, projectPath, materialNames, errors) {
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

module.exports = Animate;