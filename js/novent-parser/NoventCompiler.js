'use strict';
const Novent = require("./Novent.js");
const Animate = require("./Animate.js");
const End = require("./End.js");
const Play = require("./Play.js");
const Stop = require("./Stop.js");
const Wait = require("./Wait.js");
const Wiggle = require("./Wiggle.js");

var NoventCompiler = new Object();

NoventCompiler.compile = function(novent, startPageIndex) {
	var script = "var novent = new NoventEngine.Novent(\"canvas_id\", " + novent.width + "," + novent.height + "," + JSON.stringify(novent.button) + ");";
	
	novent.pages.forEach(function(page) {
		script += "var page = novent.Pages.New(" + JSON.stringify(page) + ");";
		
		page.events.events.forEach(function(event) {
			script += "page.Events.New(function(canvas, readyObj, callback) {" + eventToJavascript(event.elements) + "});";
		});
	});
	
	if(startPageIndex != undefined)
		script += "novent.start(" + startPageIndex + ");";
	else
		script += "novent.start();";
	
	return script;
}

function eventToJavascript(eventElements) {
	var result = "";
	eventElements.forEach(function(element) {
		if(element instanceof Animate)
			result += animateToJavascript(element);
		else if(element instanceof End)
			result += endToJavascript(element);
		else if(element instanceof Play)
			result += playToJavascript(element);
		else if(element instanceof Stop)
			result += stopToJavascript(element);
		else if(element instanceof Wait)
			result += waitToJavascript(element);
		else if(element instanceof Wiggle)
			result += wiggleToJavascript(element);
	});
	return result;
}

function wiggleToJavascript(element) {
	return "var wiggleObj = new readyObj.wiggle('" + element.name + "', '" + element.tagetType + "s', '" + element.target + "', '" + element.property + "', " + element.amplitude + ", " + element.frequency + ", '" + element.ease + "');wiggleObj.start();";
}

function waitToJavascript(element) {
	var result = "canvas.Timeline.new(readyObj.button).wait(" + element.duration + ").call(";
	
	if(element.childElements.length != 0)
		result += "function() {" + eventToJavascript(element.childElements) + "}";
	
	result += ");";
	return result;
}

function stopToJavascript(element) {
	return "readyObj.materials.wiggles." + element.target + ".stop();";
}

function playToJavascript(element) {
	var result = "";
	if(element.targetType == "animation" || element.targetType == "video") {
		result = "readyObj.materials." + element.targetType + "s." + element.target + ".play('" + element.loop + "'";
		if(element.childElements.length != 0)
			result += "," + "function() {" + eventToJavascript(element.childElements) + "}";
		result += ");";
	}
	else if(element.targetType == "sound") {
		result = "canvas.Sound.";
		if(element.loop == "loop")
			result += "playLoop('" + element.target + "');";
		else
			result += "get('" + element.target + "').play();";
	}
	
	return result;
}

function endToJavascript(element) {
	return "callback();";
}

function animateToJavascript(element) {
	var result = "";
	if(element.targetType != "sound") {
		result = "canvas.Timeline.new(readyObj.materials." + element.targetType + "s." + element.target + ").to({" + element.property + ":" + element.value + "}, " + element.duration + ", Ease." + element.ease + ").call(";
		
		if(element.childElements.length != 0)
			result += "function() {" + eventToJavascript(element.childElements) + "}";
	}
	else if(element.property == "volume") {
		result = "canvas.Sound.fadeTo('" + element.target + "', " + element.duration + ", " + element.value + "";
		
		if(element.childElements.length != 0)
			result += ", function() {" + eventToJavascript(element.childElements) + "}";
	}
	
	result += ");";
	return result;
}

module.exports = NoventCompiler;