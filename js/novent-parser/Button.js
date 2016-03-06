var methode = Button.prototype;
const ParseUtil = require("./ParseUtil.js");

function Button(src, x, y, width, height) {
	this.src = src;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}

Button.fromNode = function(node, projectPath, errors) {
	var src = ParseUtil.validateSrc(node, "src", projectPath, errors);
	var x = ParseUtil.validateIntegerAttr(node, "x", errors);
	var y = ParseUtil.validateIntegerAttr(node, "y", errors);
	var width = ParseUtil.validatePositiveIntegerAttr(node, "width", errors);
	var height = ParseUtil.validatePositiveIntegerAttr(node, "height", errors);
	
	return new Button(src, x, y, width, height);
}

module.exports = Button;