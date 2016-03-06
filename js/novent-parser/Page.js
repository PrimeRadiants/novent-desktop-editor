'use strict';
var methode = Page.prototype;
const ParseUtil = require("./ParseUtil.js");
const Materials = require("./Materials.js");
const Events = require("./Events.js");
const ParseError = require("./ParseError.js");

function Page(name, materials, events) {
	this.name = name;
	this.materials = materials;
	this.events = events;
}

Page.fromNode = function(node, projectPath, pageNames, errors) {
	var materialNames = new Array();
	
	var name = ParseUtil.validateNonEmptyStringAttr(node, "name");
	
	var duplicate = false;
	pageNames.forEach(function(e) {
		if(e.name == name)
			duplicate = true;
	});
	
	if(duplicate)
		errors.push(new ParseError("Duplicate page name.", node.lineNumber));
	else
		pageNames.push({name: name, type: node.nodeName});
	
	var materialsList = node.getElementsByTagName("materials");
	
	if(materialsList.length == 0)
		errors.push(new ParseError("missing materials tag.", node.lineNumber));
	else {
		if(materialsList.length > 1) {
			for(let i = 1; i < materialsList.length; i++)
				errors.push(new ParseError("Duplicate materials tag.", materialsList.item(i).lineNumber));
		}
		
		var materials = Materials.fromNode(materialsList.item(0), projectPath, materialNames, errors);
	}
	
	var eventsList = node.getElementsByTagName("events");
	
	if(eventsList.length == 0)
		errors.push(new ParseError("missing events tag.", node.lineNumber));
	else {
		if(eventsList.length > 1) {
			for(let i = 1; i < eventsList.length; i++)
				errors.push(new ParseError("Duplicate events tag.", eventsList.item(i).lineNumber));
		}
		
		var events = Events.fromNode(eventsList.item(0), projectPath, materialNames, errors);
	}
	
	return new Page(name, materials, events);
}

module.exports = Page;