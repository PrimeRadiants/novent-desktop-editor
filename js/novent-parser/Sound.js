var methode = Sound.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");

function Sound(name, src, volume) {
	this.name = name;
	this.src = src;
	this.volume = volume;
}

Sound.fromNode = function(node, projectPath, materialNames, errors) {
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
	var volume = ParseUtil.validateBetweenZeroAndOneAttr(node, "volume", errors);
	
	return new Sound(name, src, volume);
}

module.exports = Sound;