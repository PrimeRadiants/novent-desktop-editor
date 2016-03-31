var noventTags = {
    "!top": ["novent"],
    "novent": {
        "attrs": {
            "height": null,
            "width": null
        },
        "children": ["button", "page"]
    },
    "button": {
        "attrs": {
            "src": null,
            "alpha": null,
            "regX": null,
            "regY": null,
            "rotation": null,
            "scaleX": null,
            "scaleY": null,
            "skewX": null,
            "skewY": null,
            "visible": null,
            "x": null,
            "y": null
        }
    },
    "page": {
        "attrs": {
            "name": null
        },
        "children": ["materials", "event"]
    },
    "materials": {
        "children": ["image", "animation", "video", "sound", "text"]
    },
    "image": {
        "attrs": {
            "name": null,
            "src": null,
            "alpha": null,
            "regX": null,
            "regY": null,
            "rotation": null,
            "scaleX": null,
            "scaleY": null,
            "skewX": null,
            "skewY": null,
            "visible": null,
            "x": null,
            "y": null
        }
    },
    "animation": {
        "attrs": {
            "name": null,
            "src": null,
            "height": null,
            "width": null,
            "frames": null,
            "framerate": null,
            "alpha": null,
            "regX": null,
            "regY": null,
            "rotation": null,
            "scaleX": null,
            "scaleY": null,
            "skewX": null,
            "skewY": null,
            "visible": null,
            "x": null,
            "y": null
        }
    },
    "video": {
        "attrs": {
            "name": null,
            "src": null,
            "alpha": null,
            "regX": null,
            "regY": null,
            "rotation": null,
            "scaleX": null,
            "scaleY": null,
            "skewX": null,
            "skewY": null,
            "visible": null,
            "x": null,
            "y": null
        }
    },
    "sound": {
        "attrs": {
            "name": null,
            "src": null,
            "volume": null
        }
    },
    "text": {
        "attrs": {
            "name": null,
            "font": null,
            "size": null,
            "width": null,
            "align": ["left", "center", "right", "justify"],
            "lineHeight": null,
            "color": null,
            "alpha": null,
            "regX": null,
            "regY": null,
            "rotation": null,
            "scaleX": null,
            "scaleY": null,
            "skewX": null,
            "skewY": null,
            "visible": null,
            "x": null,
            "y": null
        }
    },
    "event": {
        "children": ["end", "animate", "wiggle", "play", "wait", "stop"]
    },
    "end": {},
    "animate": {
        "attrs": {
            "target": null,
            "property": ["volume", "alpha", "regX", "regY", "rotation", "scaleX", "scaleY", "skewX", "skewY", "x", "y"],
            "value": null,
            "duration": null,
            "ease": ["backIn", "backInOut", "backOut", "bounceIn", "bounceInOut", "bounceOut", "circIn", "circInOut", "circOut", "cubicIn", "cubicInOut", "cubicOut", "elasticIn", "elasticInOut", "elasticOut", "linear", "quadIn", "quadInOut", "quadOut", "quartIn", "quartInOut", "quartOut", "quintIn", "quintInOut", "quintOut", "sineIn", "sineInOut", "sineOut"]
        },
        "children": ["end", "animate", "wiggle", "play", "wait", "stop"]
    },
    "wiggle": {
        "attrs": {
            "name": null,
            "target": null,
            "property": ["volume", "alpha", "regX", "regY", "rotation", "scaleX", "scaleY", "skewX", "skewY", "x", "y"],
            "amplitude": null,
            "frequency": null,
            "ease": ["backIn", "backInOut", "backOut", "bounceIn", "bounceInOut", "bounceOut", "circIn", "circInOut", "circOut", "cubicIn", "cubicInOut", "cubicOut", "elasticIn", "elasticInOut", "elasticOut", "linear", "quadIn", "quadInOut", "quadOut", "quartIn", "quartInOut", "quartOut", "quintIn", "quintInOut", "quintOut", "sineIn", "sineInOut", "sineOut"]
        }
    },
    "play": {
        "attrs": {
            "target": null,
            "loop": ["loop", "stop", "remove"]
        },
        "children": ["end", "animate", "wiggle", "play", "wait", "stop"]
    },
    "wait": {
        "attrs": {
            "duration": null
        },
        "children": ["end", "animate", "wiggle", "play", "wait", "stop"]
    },
    "stop": {
        "attrs": {
            "target": null
        }
    }
};

function completeAfter(cm, pred) {
	var cur = cm.getCursor();
	if (!pred || pred()) setTimeout(function() {
	  if (!cm.state.completionActive)
		cm.showHint({completeSingle: false});
	}, 100);
	return CodeMirror.Pass;
  }

  function completeIfAfterLt(cm) {
	return completeAfter(cm, function() {
	  var cur = cm.getCursor();
	  return cm.getRange(CodeMirror.Pos(cur.line, cur.ch - 1), cur) == "<";
	});
  }

  function completeIfInTag(cm) {
	return completeAfter(cm, function() {
	  var tok = cm.getTokenAt(cm.getCursor());
	  if (tok.type == "string" && (!/['"]/.test(tok.string.charAt(tok.string.length - 1)) || tok.string.length == 1)) return false;
	  var inner = CodeMirror.innerMode(cm.getMode(), tok.state).state;
	  return inner.tagName;
	});
  }