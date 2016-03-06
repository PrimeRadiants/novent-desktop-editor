var methode = Materials.prototype;
const ParseUtil = require("./ParseUtil.js");
const Animation = require("./Animation.js");
const Font = require("./Font.js");
const Image = require("./Image.js");
const Sound = require("./Sound.js");
const Text = require("./Text.js");
const Video = require("./Video.js");

function Materials(images, fonts, animations, sounds, texts, videos) {
	this.images = images;
	this.fonts = fonts;
	this.animations = animations;
	this.sounds = sounds;
	this.texts = texts;
	this.videos = videos;
}

Materials.fromNode = function(node, projectPath, materialNames, errors) {
	var materialList = node.childNodes;
	
	var animations = new Array();
	var images = new Array();
	var fonts = new Array();
	var sounds = new Array();
	var texts = new Array();
	var videos = new Array();
	
	for(var i = 0; i < materialList.length; i++) {
		if(materialList.item(i).nodeName == "animation")
			animations.push(Animation.fromNode(materialList.item(i), i, projectPath, materialNames, errors));
		else if(materialList.item(i).nodeName == "font")
			fonts.push(Font.fromNode(materialList.item(i), projectPath, materialNames, errors));
		else if(materialList.item(i).nodeName == "image")
			images.push(Image.fromNode(materialList.item(i), i, projectPath, materialNames, errors));
		else if(materialList.item(i).nodeName == "sound")
			sounds.push(Sound.fromNode(materialList.item(i), projectPath, materialNames, errors));
		else if(materialList.item(i).nodeName == "text")
			texts.push(Text.fromNode(materialList.item(i), i, projectPath, materialNames, errors));
		else if(materialList.item(i).nodeName == "video")
			videos.push(Video.fromNode(materialList.item(i), i, projectPath, materialNames, errors));
	}
	
	return new Materials(images, fonts, animations, sounds, texts, videos);
}

module.exports = Materials;