'use strict';
const Novent = require("./Novent.js");
const XMLParser = require('xmldom').DOMParser;

var NoventParser = new Object();

NoventParser.parse = function(string, path) {
	var parser = new XMLParser();
	var doc = parser.parseFromString(string, 'text/xml');
	
	var noventNode = doc.getElementsByTagName("novent");
	
	if(noventNode.length == 0)
		return {errors: {line: 1, msg: "Missing novent tag."}};
	
	return Novent.fromNode(noventNode[0], path);
}

module.exports = NoventParser;