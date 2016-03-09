'use strict';
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");

var EventLibrary = new Object();

EventLibrary.End = function() {

}

EventLibrary.End.fromNode = function(node, projectPath, errors) {
	var children = node.childNodes;
	if(children != null && children.length > 0)
		errors.push(new ParseError("Invalid end tag: must be empty.", node.lineNumber));
		
	return new EventLibrary.End();
}

EventLibrary.Animate = function(childElements, targetType, target, property, value, duration, ease) {
	this.childElements = childElements;
	this.targetType = targetType;
	this.target = target;
	this.property = property;
	this.value = value;
	this.duration = duration;
	this.ease = ease;
}

EventLibrary.Animate.fromNode = function(node, projectPath, materialNames, errors) {
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
	
	return new EventLibrary.Animate(childElements, target[0], target[1], property.name, value, duration, ease);
}


EventLibrary.Play = function(childElements, targetType, target, loop) {
	this.childElements = childElements;
	this.targetType = targetType;
	this.target = target;
	this.loop = loop;
}

EventLibrary.Play.fromNode = function(node, projectPath, materialNames, errors) {
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
	
	return new EventLibrary.Play(childElements, target[0], target[1], loop);
}

EventLibrary.Wait = function(childElements, duration) {
	this.childElements = childElements;
	this.duration = duration;
}

EventLibrary.Wait.fromNode = function(node, projectPath, materialNames, errors) {
	var duration = ParseUtil.validatePositiveIntegerAttr(node, "duration", errors);
	
	var childElements = new Array();
	var children = node.childNodes;
	for(let i = 0; i < children.length; i++) {
		if(children.item(i).nodeName != "#text")
			childElements.push(getChildEvent(children.item(i), projectPath, materialNames, errors));
	}
	
	return new EventLibrary.Wait(childElements, duration);
}

EventLibrary.Wiggle = function(childElements, targetType, target, property, amplitude, frequency, ease) {
	this.childElements = childElements;
	this.targetType = targetType;
	this.target = target;
	this.property = property;
	this.amplitude = amplitude;
	this.frequency = frequency;
	this.ease = ease;
}

EventLibrary.Wiggle.fromNode = function(node, projectPath, errors) {
	var name = ParseUtil.validateNonEmptyStringAttr(node, "name", errors);
	var target = ParseUtil.validateTargetAttr(node, "target", errors);
	var property = ParseUtil.validatePropertyAttr(node, "property", ParseUtil.PropertyValues, errors);
	var amplitude;
	
	if(property.type == "integer")
		amplitude = ParseUtil.validateIntegerAttr(node, "amplitude", errors);
	else if(property.type == "positiveInteger")
		amplitude = ParseUtil.validatePositiveIntegerAttr(node, "amplitude", errors);
	else if(property.type == "betweenZeroAndOne")
		amplitude = ParseUtil.validateBetweenZeroAndOneAttr(node, "amplitude", errors);
	else if(property.type == "real")
		amplitude = ParseUtil.validateRealAttr(node, "amplitude", errors);
	else
		amplitude = ParseUtil.validatePositiveRealAttr(node, "amplitude", errors);
	
	var frequency = ParseUtil.validateIntegerAttr(node, "frequency", errors);
	var ease = ParseUtil.validateArrayValueAttr(node, "ease", ParseUtil.EaseValues, errors);
	
	if(children != null && children.length > 0)
		errors.push(new ParseError("Invalid wiggle tag: must be empty.", node.lineNumber));
	
	return new EventLibrary.Wiggle(childElements, target[0], target[1], property, amplitude, frequency, ease);
}

EventLibrary.Stop = function(target) {
	this.target = target;
}

EventLibrary.Stop.fromNode = function(node, projectPath, errors) {
	var target = ParseUtil.validateNonEmptyStringAttr(node, "target");
	var children = node.childNodes;
	if(children != null && children.length > 0)
		errors.push(new ParseError("Invalid stop tag: must be empty.", node.lineNumber));
		
	return new EventLibrary.Stop(target);
}

var getChildEvent = function(node, projectPath, materialNames, errors) {
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

module.exports = EventLibrary;