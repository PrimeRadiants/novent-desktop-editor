var methode = Novent.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");
const Button = require("./Button.js");
const Page = require("./Page.js");

function Novent(width, height, button, pages, errors) {
	this.width = width;
	this.height = height;
	this.button = button;
	this.pages = pages;
	this.errors = errors;
}

Novent.fromNode = function(node, projectPath) {
	var errors = new Array();
	
	var width = ParseUtil.validatePositiveIntegerAttr(node, "width", errors);
	var height = ParseUtil.validatePositiveIntegerAttr(node, "height", errors);
	
	var buttonNodes = node.getElementsByTagName("button");
	
	if(buttonNodes.length == 0) {
		errors.push(new ParseError("missing button tag.", node.lineNumber));
	}
	else {
		if(buttonNodes.length > 1) {
			for(i = 1; i < buttonNodes.length; i++)
				errors.push(new ParseError("Duplicate button tag.", buttonNodes.item(i).lineNumber));
		}
		
		var button = Button.fromNode(buttonNodes.item(0), projectPath, errors);
	}
	
	var pageNodes = node.getElementsByTagName("page");
	
	if(pageNodes.length == 0) {
		errors.push(new ParseError("No page tag.", node.lineNumber));
	}
	else {
		var pages = new Array();
		for(i = 0; i < pageNodes.length; i++)
			pages.push(Page.fromNode(pageNodes.item(i), projectPath, errors));
		
	}
	
	return new Novent(width, height, button, pages, errors);
} 

module.exports = Novent;