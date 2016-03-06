var methode = Animation.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");

function Animation(name, src, frames, frequency, x, y, width, height, opacity, index) {
	this.name = name;
	this.src = src;
	this.frames = frames;
	this.frequency = frequency;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.opacity = opacity;
	this.index = index;
}

Animation.fromNode = function(node, index, projectPath, materialNames, errors) {
	var name = ParseUtil.validateNonEmptyStringAttr(node, "name", errors);
	
	var duplicate = false;
	materialNames.forEach(function(e) {
		if(e.name == name)
			duplicate = true;
	});
	
	if(duplicate)
		errors.push(new ParseError("Duplicate material name.", node.lineNumber));
	else
		materialNames.push({name: name, type: node.nodeName});
	
	var src = ParseUtil.validateSrc(node, "src", projectPath, errors);
	var frames = ParseUtil.validatePositiveIntegerAttr(node, "frames", errors);
	var frequency = ParseUtil.validatePositiveIntegerAttr(node, "frequency", errors);
	var x = ParseUtil.validateIntegerAttr(node, "x", errors);
	var y = ParseUtil.validateIntegerAttr(node, "y", errors);
	var width = ParseUtil.validatePositiveIntegerAttr(node, "width", errors);
	var height = ParseUtil.validatePositiveIntegerAttr(node, "frames", errors);
	var opacity = ParseUtil.validateBetweenZeroAndOneAttr(node, "opacity", errors);
	
	return new Animation(name, src, frames, frequency, x, y, width, height, opacity, index);
}

module.exports = Animation;