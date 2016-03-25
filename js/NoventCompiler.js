'use strict';
//const EventLibrary = require("./EventLibrary.js");

var NoventCompiler = new Object();

NoventCompiler.compile = function(novent, startPageIndex) {	
	var normalizedNovent = normalizeNoventObject(novent);
	console.log(normalizedNovent);
	
	var script = "var novent = new NoventEngine.Novent(\"canvas_id\", " + normalizedNovent.width + "," + normalizedNovent.height + "," + JSON.stringify(normalizedNovent.button) + ");";
	
	normalizedNovent.pages.forEach(function(page) {
		script += "var page = novent.addPage(" + JSON.stringify(page) + ");";
		
		console.log(script)
		
		/*page.events.events.forEach(function(event) {
			script += "page.Events.New(function(canvas, readyObj, callback) {" + eventToJavascript(event.elements) + "});";
		});*/
	});
	
	/*if(startPageIndex != undefined)
		script += "novent.start(" + startPageIndex + ");";
	else
		script += "novent.start();";*/
	
	console.log(script);
	return script;
}

function normalizeDomObject(domObject) {
	var result = new Object();
	for(var prop in domObject) {
		if(!(domObject[prop] instanceof Object))
			result[prop] = domObject[prop];
		else if(prop == "$") {
			for(var attr in domObject[prop]) {
				result[attr] = domObject[prop][attr];
			}
		}
		else
			result[prop] = normalizeDomObject(domObject[prop]);
	}
	
	return result;
}

function normalizeNoventObject(novent) {
	var domNomalized = normalizeDomObject(novent);
	
	domNomalized.button = domNomalized.button[0];
	domNomalized.pages = new Array();
	
	for(var i in domNomalized.page) {
		domNomalized.pages[i] = domNomalized.page[i];
		
		domNomalized.pages[i].materials = domNomalized.pages[i].materials[0];
		
		domNomalized.pages[i].materials.images = new Array();
		domNomalized.pages[i].materials.animations = new Array();
		domNomalized.pages[i].materials.videos = new Array();
		domNomalized.pages[i].materials.sounds = new Array();
		domNomalized.pages[i].materials.texts = new Array();
		
		if(domNomalized.pages[i].materials.image != undefined) {
			for(var j in domNomalized.pages[i].materials.image)
				domNomalized.pages[i].materials.images[i] = domNomalized.pages[i].materials.image[i];
			
			delete domNomalized.pages[i].materials.image;
		}
		if(domNomalized.pages[i].materials.animation != undefined) {
			for(var j in domNomalized.pages[i].materials.animation)
				domNomalized.pages[i].materials.animations[i] = domNomalized.pages[i].materials.animation[i];
			
			delete domNomalized.pages[i].materials.animation;
		}
		if(domNomalized.pages[i].materials.video != undefined) {
			for(var j in domNomalized.pages[i].materials.video)
				domNomalized.pages[i].materials.videos[i] = domNomalized.pages[i].materials.video[i];
			
			delete domNomalized.pages[i].materials.video;
		}
		if(domNomalized.pages[i].materials.sound != undefined) {
			for(var j in domNomalized.pages[i].materials.sound)
				domNomalized.pages[i].materials.sounds[i] = domNomalized.pages[i].materials.sound[i];
			
			delete domNomalized.pages[i].materials.sound;
		}
		if(domNomalized.pages[i].materials.text != undefined) {
			for(var j in domNomalized.pages[i].materials.text)
				domNomalized.pages[i].materials.texts[i] = domNomalized.pages[i].materials.text[i];
			
			delete domNomalized.pages[i].materials.text;
		}
	}
	delete domNomalized.page;
	
	return domNomalized;
} 

/*function eventToJavascript(eventElements) {
	var result = "";
	eventElements.forEach(function(element) {
		if(element instanceof EventLibrary.Animate)
			result += animateToJavascript(element);
		else if(element instanceof EventLibrary.End)
			result += endToJavascript(element);
		else if(element instanceof EventLibrary.Play)
			result += playToJavascript(element);
		else if(element instanceof EventLibrary.Stop)
			result += stopToJavascript(element);
		else if(element instanceof EventLibrary.Wait)
			result += waitToJavascript(element);
		else if(element instanceof EventLibrary.Wiggle)
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
}*/

module.exports = NoventCompiler;