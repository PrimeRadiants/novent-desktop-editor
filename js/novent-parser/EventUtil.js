'use strict';
function EventUtil() {}

EventUtil.getChildEvent = function(node, projectPath, errors) {
	var result;
	if(node.tagName == "end") {
		result = End.fromNode(node, projectPath, errors);
	}
	else if(node.tagName == "animate") {
		result = Animate.fromNode(node, projectPath, errors);
	}
	else if(node.tagName == "play") {
		result = Play.fromNode(node, projectPath, errors);
	}
	else if(node.tagName == "wait") {
		result = Wait.fromNode(node, projectPath, errors);
	}
	else if(node.tagName == "wiggle") {
		result = Wiggle.fromNode(node, projectPath, errors);
	}
	else if(node.tagName == "stop") {
		result = Stop.fromNode(node, projectPath, errors);
	}
	else {
		errors.push(new ParseError("Invalid event content: unsupported tag: " + node.tageName + ".", node.lineNumber));
	}
	
	return result;
}

module.exports = EventUtil;