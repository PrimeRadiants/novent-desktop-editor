'use strict';
var methode = Wiggle.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const Event = require("./Event.js");

function Wiggle(childElements, targetType, target, property, amplitude, frequency, ease) {
	this.childElements = childElements;
	this.targetType = targetType;
	this.target = target;
	this.property = property;
	this.amplitude = amplitude;
	this.frequency = frequency;
	this.ease = ease;
}

Wiggle.fromNode = function(node, projectPath, errors) {
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
	
	return new Wiggle(childElements, target[0], target[1], property, amplitude, frequency, ease);
}

module.exports = Wiggle;