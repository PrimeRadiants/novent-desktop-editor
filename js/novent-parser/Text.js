var methode = Text.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");

function Text(name, x, y, width, align, lineHeight, font, size,
			opacity, content, color, index) {
	this.name = name;
	this.x = x;
	this.y = y;
	this.width = width;
	this.align = align;
	this.lineHeight = lineHeight;
	this.font = font;
	this.size = size;
	this.opacity = opacity;
	this.content = content;
	this.color = color;
	this.index = index;
}

Text.fromNode = function(node, index, projectPath, materialNames, errors) {
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
	
	var x = ParseUtil.validateIntegerAttr(node, "x", errors);
	var y = ParseUtil.validateIntegerAttr(node, "y", errors);
	var width = ParseUtil.validatePositiveIntegerAttr(node, "width", errors);
	var align = ParseUtil.validateArrayValueAttr(node, "align", ParseUtil.AlignValues, errors);
	var lineHeight = ParseUtil.validatePositiveIntegerAttr(node, "lineHeight", errors);
	var font = ParseUtil.validateNonEmptyStringAttr(node, "font", errors);
	var size = ParseUtil.validateNonEmptyStringAttr(node, "size", errors);
	var color = ParseUtil.validateNonEmptyStringAttr(node, "color", errors);
	var opacity = ParseUtil.validateBetweenZeroAndOneAttr(node, "opacity", errors);
	
	var content = node.textContent;
	if(content == "")
		errors.push(new ParseError("Missing content for tag " + node.tagName + ".", node.lineNumber));
	
	return new Text(name, x, y, width, align, lineHeight, font, size,
				opacity, content, color, index);
}

module.exports = Text;