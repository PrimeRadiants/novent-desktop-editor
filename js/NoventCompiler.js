'use strict';
//const EventLibrary = require("./EventLibrary.js");

var NoventCompiler = new Object();

NoventCompiler.compile = function(novent, startPageIndex) {	
	var normalizedNovent = normalizeNoventObject(novent);
	console.log(normalizedNovent);
	
	var script = "var novent = new NoventEngine.Novent(\"canvas_id\", " + normalizedNovent.width + "," + normalizedNovent.height + "," + JSON.stringify(normalizedNovent.button) + ");";
	
	normalizedNovent.pages.forEach(function(page) {
		script += "var page = novent.addPage(" + JSON.stringify(page) + ");";
				
		page.events.forEach(function(event) {
			script += "page.addEvent(function(page, callback) {" + eventToJavascript(event) + "});";
		});
	});
	
	if(startPageIndex != undefined)
		script += "novent.read(" + startPageIndex + ");";
	else
		script += "novent.read();";
	
	return script;
}

function normalizeDomObject(domObject) {
	var result = new Object();
	for(let prop in domObject) {
		if(!(domObject[prop] instanceof Object)) {
			if(prop != "_")
				result[prop] = filterFloat(domObject[prop]);
			else
				result.content = domObject[prop];
		}
		else if(prop == "$") {
			for(let attr in domObject[prop]) {
				result[attr] = filterFloat(domObject[prop][attr]);
			}
		}
		else
			result[prop] = normalizeDomObject(domObject[prop]);
	}
	
	return result;
}

function normalizeNoventObject(novent) {
	var domNomalized = normalizeDomObject(novent);
	console.log(domNomalized);
	
	domNomalized.button = domNomalized.button[0];
	domNomalized.pages = new Array();
	
	for(let i in domNomalized.page) {
		domNomalized.pages[i] = domNomalized.page[i];
		
		domNomalized.pages[i].materials = domNomalized.pages[i].materials[0];
		
		domNomalized.pages[i].materials.images = new Array();
		domNomalized.pages[i].materials.animations = new Array();
		domNomalized.pages[i].materials.videos = new Array();
		domNomalized.pages[i].materials.sounds = new Array();
		domNomalized.pages[i].materials.texts = new Array();
		
		if(domNomalized.pages[i].materials.image != undefined) {
			for(let j in domNomalized.pages[i].materials.image)
				domNomalized.pages[i].materials.images[j] = domNomalized.pages[i].materials.image[j];
			
			delete domNomalized.pages[i].materials.image;
		}
		if(domNomalized.pages[i].materials.animation != undefined) {
			for(let j in domNomalized.pages[i].materials.animation)
				domNomalized.pages[i].materials.animations[j] = domNomalized.pages[i].materials.animation[j];
			
			delete domNomalized.pages[i].materials.animation;
		}
		if(domNomalized.pages[i].materials.video != undefined) {
			for(let j in domNomalized.pages[i].materials.video)
				domNomalized.pages[i].materials.videos[j] = domNomalized.pages[i].materials.video[j];
			
			delete domNomalized.pages[i].materials.video;
		}
		if(domNomalized.pages[i].materials.sound != undefined) {
			for(let j in domNomalized.pages[i].materials.sound)
				domNomalized.pages[i].materials.sounds[j] = domNomalized.pages[i].materials.sound[j];
			
			delete domNomalized.pages[i].materials.sound;
		}
		if(domNomalized.pages[i].materials.text != undefined) {
			for(let j in domNomalized.pages[i].materials.text)
				domNomalized.pages[i].materials.texts[j] = domNomalized.pages[i].materials.text[j];
			
			delete domNomalized.pages[i].materials.text;
		}
		
		domNomalized.pages[i].events = new Array();
		for(let j in domNomalized.pages[i].event)
			domNomalized.pages[i].events.push(domNomalized.pages[i].event[j]);
		
		delete domNomalized.pages[i].event;
	}
	delete domNomalized.page;
	
	return domNomalized;
} 

function filterFloat(value) {
    if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/
      .test(value))
      return Number(value);
  return value;
}

function eventToJavascript(eventElements) {
	var result = "";

	if(eventElements.animate != undefined) {
		for(let i in eventElements.animate)
			result += animateToJavascript(eventElements.animate[i]);
	}
	
	if(eventElements.wiggle != undefined) {
		for(let i in eventElements.wiggle)
			result += wiggleToJavascript(eventElements.wiggle[i]);
	}
	
	if(eventElements.stop != undefined) {
		for(let i in eventElements.stop)
			result += stopToJavascript(eventElements.stop[i]);
	}
	
	if(eventElements.wait != undefined) {
		for(let i in eventElements.wait)
			result += waitToJavascript(eventElements.wait[i]);
	}
	
	if(eventElements.play != undefined) {
		for(let i in eventElements.play)
			result += playToJavascript(eventElements.play[i]);
	}
	
	if(eventElements.end != undefined) {
		for(let i in eventElements.end)
			result += endToJavascript(eventElements.end[i]);
	}
	
	return result;
}

function animateToJavascript(element) {
	
	var result = "page.get('" + element.target + "').to({" + element.property + ":" + element.value + "}, " + element.duration + ", createjs.Ease." + element.ease + ").call(function() {";
	result += eventToJavascript(element);
	result += "});";
	
	return result;
}

function endToJavascript(element) {
	return "callback();";
}

function waitToJavascript(element) {
	var result = "createjs.Tween.get(novent.button.graphics).wait(" + element.duration + ").call(";
	result += "function() {" + eventToJavascript(element) + "});";
	return result;
}

function playToJavascript(element) {
	var result = "page.materials.get('" + element.target + "').play('" + element.loop + "', function() {" + eventToJavascript(element) + "});";
	return result;
}

function wiggleToJavascript(element) {
	var result = "var wiggle = new NoventEngine.Wiggle(page, " + JSON.stringify(element) + ");wiggle.play();";
	return result;
} 

function stopToJavascript(element) {
	return "page.materials.get('" + element.target + "').stop();";
}

module.exports = NoventCompiler;