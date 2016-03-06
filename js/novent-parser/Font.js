var methode = Font.prototype;
const ParseUtil = require("./ParseUtil.js");
const ParseError = require("./ParseError.js");

function Font(name, src) {
	this.name = name;
	this.src = src;
}

Font.fromNode = function(node, projectPath, materialNames, errors) {
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
	
	return new Font(name, src);
}

module.exports = Font;