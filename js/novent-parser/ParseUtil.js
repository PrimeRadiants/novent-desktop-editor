const fs = require('fs-extra');
const ParseError = require("./ParseError.js");

var ParseUtil = new Object();

ParseUtil.validateNonEmptyStringAttr = function(node, attrName, errors) {
	if(!node.hasAttribute(attrName)) {
		errors.push(new ParseError("Missing attribute " + attrName + ".", node.lineNumber));
		return null;
	}
	else {
		return node.getAttribute(attrName);
	}
}

ParseUtil.validateSrc = function(node, attrName, projectPath, errors) {
	var src = ParseUtil.validateNonEmptyStringAttr(node, attrName, errors);
	
	if(src == null)
		return null;
	
	if(!fs.existsSync(projectPath + "/" + src)) {
		errors.push(new ParseError("Invalid attribute " + attrName + ", file do not exists.", node.lineNumber));
	}
	
	return src;
}

ParseUtil.validateIntegerAttr = function(node, attrName, errors) {
	var attr = ParseUtil.validateNonEmptyStringAttr(node, attrName, errors);
	
	if(attr == null)
		return null;
	
	var result = Number.parseInt(attr);
	
	if(result == NaN) {
		errors.push(new ParseError("Invalid attribute " + attrName + ", must be an integer.", node.lineNumber));
	}
	
	return result;
}

ParseUtil.validatePositiveIntegerAttr = function(node, attrName, errors) {
	var result = ParseUtil.validateIntegerAttr(node, attrName, errors);
	
	if(result == null)
		return null;
	
	if(result < 0) {
		errors.push(new ParseError("Invalid attribute " + attrName + ", must be an positive integer.", node.lineNumber));
	}
	
	return result;
}

ParseUtil.validateRealAttr = function(node, attrName, errors) {
	var attr = ParseUtil.validateNonEmptyStringAttr(node, attrName, errors);
	
	if(attr == null)
		return null;
	
	var result = Number.parseFloat(attr);
	
	if(result == NaN) {
		errors.push(new ParseError("Invalid attribute " + attrName + ", must be an integer.", node.lineNumber));
	}
	
	return result;
}

ParseUtil.validatePositiveRealAttr = function(node, attrName, errors) {
	var result = ParseUtil.validateRealAttr(node, attrName, errors);
	
	if(result == null)
		return null;
	
	if(result < 0) {
		errors.push(new ParseError("Invalid attribute " + attrName + ", must be an positive integer.", node.lineNumber));
	}
	
	return result;
}

ParseUtil.validateBetweenZeroAndOneAttr = function(node, attrName, errors) {
	var result = ParseUtil.validateRealAttr(node, attrName, errors);
	
	if(result == null)
		return null;
	
	if(result < 0 || result > 1) {
		errors.push(new ParseError("Invalid attribute " + attrName + ", must be an positive integer.", node.lineNumber));
	}
	
	return result;
}

ParseUtil.validateArrayValueAttr = function(node, attrName, array, errors) {
	var attr = ParseUtil.validateNonEmptyStringAttr(node, attrName, errors);
	
	if(attr == null)
		return null;
	
	if(array.indexOf(attr) == -1)
		errors.push(new ParseError("Invalid attribute value for " + attrName + ".", node.lineNumber));
	
	return attr;
}

ParseUtil.validatePropertyAttr = function(node, attrName, array, errors) {
	var attr = ParseUtil.validateNonEmptyStringAttr(node, attrName, errors);
	
	if(attr == null)
		return {name: null, type: null};
	
	var result = null;
	for(var i = 0; i < array.length; i++) {
		if(array[i].name == attr)
			result = array[i];
	}
	
	if(result == null) {
		errors.push(new ParseError("Invalid attribute value for " + attrName + ".", node.lineNumber));
		return {name: null, type: null};
	}
	
	return result;
}

ParseUtil.validateTargetAttr = function(node, attrName, errors) {
	var attr = ParseUtil.validateNonEmptyStringAttr(node, attrName, errors);
	
	if(attr == null)
		return [null, null];
	
	var attrDecomp = attr.split(":");
	
	if(attrDecomp.length != 2)
		errors.push(new ParseError("Invalid attribute value for " + attrName + ", must folow the syntax targetType:targetName.", node.lineNumber));

	node.setAttribute("target", attrDecomp[0]);
	var targetType = ParseUtil.validateArrayValueAttr(node, attrName, ParseUtil.TargetValues, errors);
	
	node.setAttribute("target", attrDecomp[1]);
	var target = ParseUtil.validateNonEmptyStringAttr(node, attrName, errors);
	
	return [targetType, target];
}

ParseUtil.AlignValues = ["left","center","right","justify"];

ParseUtil.TargetValues = ["animation","image","sound","text","video"];

ParseUtil.PropertyValues = [
	{
		name: "x",
		type: "integer"
	},
	{
		name: "y",
		type: "integer"
	},
	{
		name: "scaleX",
		type: "real"
	},
	{
		name: "scaleY",
		type: "real"
	},
	{
		name: "opacity",
		type: "betweenZeroAndOne"
	},
	{
		name: "rotation",
		type: "real"
	},
	{
		name: "volume",
		type: "betweenZeroAndOne"
	}
];

ParseUtil.EaseValues = [
	"easeInQuad",
	"easeOutQuad",
	"easeInCubic",
	"easeOutCubic",
	"easeInOutCubic",
	"easeInQuart",
	"easeOutQuart",
	"easeInOutQuart",
	"easeInQuint",
	"easeOutQuint",
	"easeInOutQuint",
	"easeInSine",
	"easeOutSine",
	"easeInOutSine",
	"easeInExpo",
	"easeOutExpo",
	"easeInOutExpo",
	"easeInCirc",
	"easeOutCirc",
	"easeInOutCirc",
	"easeInElastic",
	"easeOutElastic",
	"easeInOutElastic",
	"easeInBack",
	"easeOutBack",
	"easeInOutBack",
	"easeInBounce",
	"easeOutBounce",
	"easeInOutBounce"
];

ParseUtil.LoopValues = ["loop", "stop", "remove"];

module.exports = ParseUtil;