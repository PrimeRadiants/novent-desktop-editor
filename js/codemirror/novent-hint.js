var childEvents = ["end", "animate", "play", "wait", "wiggle", "stop"];
var easeValues = [
	"easeInQuad",
	"easeOutQuad",
	"easeInCubic",
	"easeOutCubic",
	"easeInOutCubic",
	"easeInQuart",
	"easeOutQuart",
	"easeInOutQuart",
	"easeInQuint",
	"easeOutQuint",
	"easeInOutQuint",
	"easeInSine",
	"easeOutSine",
	"easeInOutSine",
	"easeInExpo",
	"easeOutExpo",
	"easeInOutExpo",
	"easeInCirc",
	"easeOutCirc",
	"easeInOutCirc",
	"easeInElastic",
	"easeOutElastic",
	"easeInOutElastic",
	"easeInBack",
	"easeOutBack",
	"easeInOutBack",
	"easeInBounce",
	"easeOutBounce",
	"easeInOutBounce"
];

var loopValues = ["loop", "stop", "remove"];

var noventTags = {
	"!top": ["novent"],
	novent: {
	  children: ["button", "page"]
	},
	button: {
	  attrs: {
		src: null,
		x: null,
		y: null,
		width: null,
		height: null
	  },
	  children: []
	},
	page: {
	  attrs: {name: null},
	  children: ["materials", "events"]
	},
	materials: {
		children: ["animation", "font", "image", "sound", "video", "text"]
	},
	events: {
		children: ["event"]
	},
	animation: {
		attrs: {
			name: null,
			src: null,
			x: null,
			y: null,
			width: null,
			height: null,
			frames: null,
			frequency: null,
			opacity: null
		},
		children: []
	},
	font: {
		attrs: {
			name: null,
			src: null
		},
		children: []
	},
	image: {
		attrs: {
			name: null,
			src: null,
			x: null,
			y: null,
			width: null,
			height: null,
			opacity: null
		},
		children: []
	},
	sound: {
		attrs: {
			name: null,
			src: null,
			volume: null
		},
		children: []
	},
	video: {
		attrs: {
			name: null,
			src: null,
			x: null,
			y: null,
			width: null,
			height: null,
			opacity: null
		},
		children: []
	},
	text: {
		attrs: {
			name: null,
			x: null,
			y: null,
			width: null,
			align: ["left", "center", "right", "justify"],
			lineHeight: null,
			font: null,
			size: null,
			opacity: null
		},
		children: []
	},
	event: {
		children: childEvents
	},
	end: {
		children: []
	},
	animate: {
		children: childEvents,
		attrs: {
			target: null,
			property: null,
			value: null,
			duration: null,
			ease: easeValues
		}
	},
	play: {
		children: childEvents,
		attrs: {
			target: null,
			loop: loopValues
		}
	},
	wait: {
		children: childEvents,
		attrs: {
			duration: null
		}
	},
	wiggle: {
		attrs: {
			name: null,
			target: null,
			property: null,
			amplitude: null,
			frequency: null,
			ease: easeValues
		},
		children: []
	},
	stop: {
		attrs: {
			target: null
		},
		children: []
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