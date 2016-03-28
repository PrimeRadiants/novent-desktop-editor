/**
* Novent Reading Engine based on CreateJS
* @author: Shanira
*/

if(typeof NoventEngine == "undefined") {
	var NoventEngine = new Object();
	
	/**
	 * Novent Class definition, root element containing the novent pages, materials & events
	 * @constructor
	 * @param {string} canvasId Id of the canvas DOM object to use.
	 * @param {number} width Width of the Novent.
	 * @param {number} height Height of the Novent.
	 * @param {object} buttonDescriptor Object describing the button to use in the novent.
	 */
	NoventEngine.Novent = function(canvasId, width, height, buttonDescriptor) {
		var novent = this;
		
		//Setting constructor params:
		novent.canvas = document.getElementById(canvasId);
		novent.width = novent.canvas.width = width;
		novent.height = novent.canvas.height = height;
		
		window.onresize = function() {
			resize(novent.canvas);
		}
		resize(novent.canvas);
		
		novent.button = new NoventEngine.Button(novent, buttonDescriptor);
		novent.buttonVisible = false;
		
		novent.showButton = function() {
			createjs.Tween.get(novent.button.graphics).to({alpha: 1}, 2000).call(function() {
				novent.buttonVisible = true;
			});
		}
		
		novent.hideButton = function() {
			createjs.Tween.get(novent.button.graphics).to({alpha: 0}, 2000).call(function() {
				novent.buttonVisible = false;
			});;
		}
		
		//Creating stage : root level container for the novent:
		novent.stage = new createjs.Stage(novent.canvas);
		var loadQueue = new createjs.LoadQueue(true);
		
		novent.button.addToLoadQueue(loadQueue);		
		loadQueue.load();
		
		loadQueue.on("complete", function() {
			novent.button.appendToNovent();

			novent.button.graphics.addEventListener("click", function() {
				if(novent.pages[novent.index - 1].waiting && novent.buttonVisible) {
					novent.pages[novent.index - 1].readEvent();
					novent.hideButton();
				}
			});
		});
		
		novent.index = 0;
		novent.pages = new Array();
		novent.addPage = function(pageDescriptor) {
			novent.pages.push(new NoventEngine.Page(novent, pageDescriptor));
			return novent.pages[novent.pages.length - 1];
		}
		
		novent.nextPage = function() {
			if(novent.index != novent.pages.length - 1)
				return novent.pages[novent.index + 1];
		}
		
		novent.previousPage = function() {
			if(novent.index != 0)
				return novent.pages[novent.index - 1];
		}
		
		novent.read = function(index) {
			if(index != undefined && index < novent.pages.length)
				novent.index = index;
			
			
			var queue = new createjs.LoadQueue();
			novent.pages[novent.index].addToLoadQueue(queue);
			
			queue.on("complete", function() {
				novent.readPage();
			});
			
			queue.load();
		}
		
		novent.readPage = function() {
			if(novent.index != novent.pages.length) {
				if(novent.index != 0) {
					novent.pages[novent.index - 1].removeFromNovent();
					novent.pages[novent.index - 1].unload();
				}	
				novent.pages[novent.index].read();
				novent.index++;
			}
		}
		
		createjs.Ticker.setFPS(30);
		createjs.Ticker.addEventListener("tick", novent.stage);
		
		return novent;
	}
	
	
	NoventEngine.Button = function(novent, buttonDescriptor) {
		var button = this;
		
		button.novent = novent;
		button.id = "button";
		button.src = buttonDescriptor.src;
		
		//button.animation = (typeof _animation === 'undefined') ? false : _animation;
		
		button.addToLoadQueue = function(queue) {
			//Adding src to novent global load queue
			queue.loadFile({id:button.id, src: button.src});
			
			//When this file has finished loading : retreiving DOM element and creating graphic element
			queue.on("fileload", function(event) {
				if(event.item.id == button.id) {
					button.element = event.result;
					button.graphics = new createjs.Bitmap(event.result);
					
					//Setting the properties of the graphical object (x, y, ...)
					for(key in buttonDescriptor) {
						if(key != undefined)
							button.graphics[key] = buttonDescriptor[key];
					}
					
					button.graphics.alpha = 0;
				}
			});
		}
		
		//Adding button to the novent canvas
		button.appendToNovent = function() {
			if(button.graphics != undefined)
				button.novent.stage.addChild(button.graphics);
		}
		
		return button;
	}
	
	NoventEngine.Page = function(novent, pageDescriptor) {
		var page = this;
		
		page.novent = novent;
		page.name = pageDescriptor.name;
		
		page.events = new Array();
		page.addEvent = function(funct) {
			page.events.push(new NoventEngine.Event(page, funct));
			return page.events[page.events.length - 1];
		}
		
		page.container = new createjs.Container();
		
		page.materials = new Map();
		
		page.get = function(targetName, options) {
			return createjs.Tween.get(page.materials.get(targetName).graphics, options)
		}
		
		pageDescriptor.materials.images.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Image(page, e))
		});
		
		pageDescriptor.materials.animations.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Animation(page, e))
		});
		
		pageDescriptor.materials.videos.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Video(page, e))
		});
		
		pageDescriptor.materials.sounds.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Sound(page, e))
		});
		
		pageDescriptor.materials.texts.forEach(function(e) {
			page.materials.set(e.name, new NoventEngine.Text(page, e))
		});
		
		page.addToLoadQueue = function(queue) {
			for(var m of page.materials.values()) {
				m.addToLoadQueue(queue);
			}
			
			queue.on("complete", function() {
				var sortFunction = function(obj1, obj2, options) {
					 if (obj1.index > obj2.index) { return 1; }
					 if (obj1.index < obj2.index) { return -1; }
					 return 0;
				}
				page.container.sortChildren(sortFunction);

			});
		}
		
		page.unload = function() {
			for(var m of page.materials.values()) {
				delete m;
			}
		}
		
		page.appendToNovent = function() {
			page.novent.stage.addChild(page.container);
		}
		
		page.removeFromNovent = function() {
			page.novent.stage.removeChild(page.container);
		}
		
		page.waiting = false;
		page.index = 0;
		page.events = new Array();
		page.animates = new Map();
		page.addEvent = function(funct) {
			page.events.push(new NoventEngine.Event(page, funct));
			return page.events[page.events.length - 1];
		}
		
		page.nextEvent = function() {
			if(page.index != page.events.length - 1) {
				return page.events[page.index + 1];
			}
		}
		
		page.previousEvent = function() {
			if(page.index != 0) {
				return page.events[page.index - 1];
			}
		}
		
		page.read = function() {
			var queue = new createjs.LoadQueue();
			var nextPage = page.novent.nextPage();
			if(nextPage) {
				nextPage.addToLoadQueue(queue);
				queue.load();
			}
			
			page.appendToNovent();
			page.readEvent();
		}
		
		page.readEvent = function() {
			if(page.index != page.events.length) {
				page.events[page.index].read();
				page.index++;
			}
			else {
				page.novent.readPage();
			}
		}
		
		return page;
	}
	
	NoventEngine.Event = function(page, funct) {
		var event = this;
		
		event.page = page;
		event.funct = funct;
		
		event.read = function() {
			event.funct(page, function() {
				if(page.index != page.events.length) {
					event.page.waiting = true;
					event.page.novent.showButton();
				}
				else {
					event.page.novent.readPage();
				}
			});
		}
		
		return event;
	}
	
	NoventEngine.Image = function(page, imageDescriptor) {
		var image = this;
		
		image.page = page;
		image.name = imageDescriptor.name;
		image.id = page.name + ":" + image.name;
		image.src = imageDescriptor.src;
		
		image.addToLoadQueue = function(queue) {
			//Adding src to novent global load queue
			queue.loadFile({id:image.id, src: image.src});
			
			//When this file has finished loading : retreiving DOM element and creating graphic element
			queue.on("fileload", function(event) {
				if(event.item.id == image.id) {
					image.element = event.result;
					image.graphics = new createjs.Bitmap(event.result);
					
					//Setting the properties of the graphical object (x, y, ...)
					for(key in imageDescriptor) {
						if(key != undefined)
							image.graphics[key] = imageDescriptor[key];
					}
					
					//Adding image to the page container
					image.page.container.addChild(image.graphics);
				}
			});
		}
		
		return image;
	}
	
	NoventEngine.Video = function(page, videoDescriptor) {
		var video = this;
		
		video.page = page;
		video.name = videoDescriptor.name;
		video.id = page.name + ":" + video.name;
		video.src = videoDescriptor.src;
		
		var playing = false;
		
		video.addToLoadQueue = function(queue) {
			//Adding src to novent global load queue
			queue.loadFile({id:video.id, src: video.src});
			
			//When this file has finished loading : retreiving DOM element and creating graphic element
			queue.on("fileload", function(event) {
				if(event.item.id == video.id) {
					video.element = event.result;
					video.graphics = new createjs.Bitmap(event.result);
					
					//Setting the properties of the graphical object (x, y, ...)
					for(key in videoDescriptor) {
						if(key != undefined)
							video.graphics[key] = videoDescriptor[key];
					}
					
					video.page.container.addChild(video.graphics);
				}
			});
		}
		
		var eventAftermath;
		
		video.play = function(type, callback) {
			video.element.removeEventListener('ended', eventAftermath, false);
			
			eventAftermath = function () {
				if(type == "loop") {
					if(playing) {
						this.currentTime = 0;
						this.play();
						video.graphics.image.readyState = 4;
					}
				}
				else if(type == "remove") {
					video.page.container.removeChild(video.graphics);
					if(callback != undefined)
						callback();
				}
				else if(type == "stop") {
					if(callback != undefined)
						callback();
				}
			}

			video.element.addEventListener('ended', eventAftermath, false);
			playing = true;
			video.element.play();
		}
		
		video.stop = function() {
			playing = false;
		}
		
		return video;
	}
	
	NoventEngine.Animation = function(page, animationDescriptor) {
		var animation = this;
		
		animation.page = page;
		animation.name = animationDescriptor.name;
		animation.id = page.name + ":" + animation.name;
		animation.src = animationDescriptor.src;
		animation.height = animationDescriptor.height;
		animation.width = animationDescriptor.width;
		animation.framerate = animationDescriptor.framerate;
		animation.frames = animationDescriptor.frames;
		
		var playing = false;
		
		animation.addToLoadQueue = function(queue) {
			//Adding src to novent global load queue
			queue.loadFile({id:animation.id, src: animation.src});
			
			queue.on("fileload", function(event) {
				if(event.item.id == animation.id) {
					animation.element = event.result;
					animation.spriteSheet = new createjs.SpriteSheet({
						framerate: animation.framerate,
						images: [animation.element],
						frames: {width: animation.width, height: animation.height},
						animations: {
							animation: [0, animation.frames - 1]
						}
					});
					
					animation.graphics = new createjs.Sprite(animation.spriteSheet);
					
					//Setting the properties of the graphical object (x, y, ...)
					for(key in animationDescriptor) {
						if(key != undefined)
							animation.graphics[key] = animationDescriptor[key];
					}
					
					animation.page.container.addChild(animation.graphics);
				}
			});
		}
		
		animation.play = function(type, callback) {
			animation.graphics.addEventListener('animationend', function () {
				if(type == "remove") {
					if(callback != undefined)
						callback();
					animation.graphics.stop();
					animation.page.container.removeChild(animation.graphics);
				}
				else if(type == "stop" || !playing) {
					if(callback != undefined)
						callback();
					animation.graphics.stop();
				}
			});
			playing = true;
			animation.graphics.gotoAndPlay("animation");
		}
		
		animation.stop = function() {
			playing = false;
		}
		
		return animation;
	}
	
	NoventEngine.Text = function(page, textDescriptor) {
		var text = this;
		
		text.page = page;
		text.name = textDescriptor.name;
		text.id = page.name + ":" + text.name;
		text.content = textDescriptor.content;
		text.align = textDescriptor.align;
		text.font = textDescriptor.size + " " + textDescriptor.font;
		text.lineHeight = textDescriptor.lineHeight;
		text.width = textDescriptor.width;
		text.color = textDescriptor.color;
		
		text.addToLoadQueue = function(queue) {
			text.graphics = new createjs.Container();
			
			if(text.align != "justify") {
				var textGraphic = new createjs.Text(text.content, text.font, text.color);
				textGraphic.lineHeight = text.lineHeight;
				textGraphic.lineWidth = text.width;
				textGraphic.textAlign = text.align;
				
				text.graphics.addChild(textGraphic);
			}
			else {
				text.graphics = justifyText(text.graphics, text.content, text.font, text.lineHeight, text.width, text.color);
			}
			
			//Setting the properties of the graphical object (x, y, ...)
			for(key in textDescriptor) {
				if(key != undefined)
					text.graphics[key] = textDescriptor[key];
			}
			text.page.container.addChild(text.graphics);
		}
		
		return text;
	}
	
	NoventEngine.Sound = function(page, soundDescriptor) {
		var sound = this;
		
		sound.page = page;
		sound.name = soundDescriptor.name;
		sound.id = page.name + ":" + sound.name;
		sound.src = soundDescriptor.src;
		
		var playing = false;
		
		sound.addToLoadQueue = function(queue) {
			queue.loadFile({id:sound.id, src: sound.src});
			
			queue.on("fileload", function(event) {
				if(event.item.id == sound.id) {
					sound.graphics = event.result;
					//Setting the properties of the graphical object (x, y, ...)
					for(key in soundDescriptor) {
						if(key != undefined)
							sound.graphics[key] = soundDescriptor[key];
					}
				}
			});
		}
		
		sound.play = function(type, callback) {
			sound.graphics.addEventListener('ended', function () {
				if(type == "loop") {
					if(playing)
						sound.graphics.play();
				}
				else if(type == "stop") {
					if(callback != undefined)
						callback();
				}
			});
			playing = true;
			sound.graphics.play();
		}
		
		sound.stop = function() {
			playing = false;
		}
		
		return sound;
	}
	
	NoventEngine.Wiggle = function(page, wiggleDescriptor) {
		var wiggle = this;
		wiggle.name = wiggleDescriptor.name;
		wiggle.target = wiggleDescriptor.target;
		wiggle.property = wiggleDescriptor.property;
		wiggle.amplitude = wiggleDescriptor.amplitude;
		wiggle.frequency = wiggleDescriptor.frequency;
		wiggle.ease = wiggleDescriptor.ease;
		
		var minValue;
		var originValue;
		var playing = false;

		wiggle.stop = function() {
			playing = false;
		};
		
		function loop() {
			if(playing) {
				var value = minValue + Math.random()*2*wiggle.amplitude;
				var change = new Object();
				change[wiggle.property] = value;
				page.get(wiggle.target).to(change, wiggle.frequency, createjs.Ease[wiggle.ease]).call(function() {
					loop();
				});
			}
			else {
				var change = new Object();
				change[wiggle.property] = originValue;
				page.get(wiggle.target).to(change, wiggle.frequency, createjs.Ease[wiggle.ease]);
			}
		}

		wiggle.play = function() {
			originValue = page.materials.get(wiggle.target).graphics[wiggle.property];
			minValue = originValue - wiggle.amplitude;
			playing = true;
			page.materials.set(wiggle.name, wiggle);
			loop();
		};

		return wiggle;
	}
	
	NoventEngine.NoventDefinitionError = function(message) {
		this.name = "NoventDefinitionError";
		this.message = message;
	}
	
	function resize(canvasElement) {
		canvasElement.style.position = "fixed";
		canvasElement.style.top = 0;
		canvasElement.style.left = 0;
		canvasElement.style.bottom = 0;
		canvasElement.style.right = 0;
		canvasElement.style.margin = "auto";
		
		var width = window.innerWidth;
        var height = window.innerHeight;
		
		var screenRatio = height/width;
		var canvasRatio = canvasElement.height/canvasElement.width;
		
		if(screenRatio <= canvasRatio) {
			width = height / canvasRatio;
		} else {
			height = width * canvasRatio;
		}
		
		canvasElement.style.width = width + "px";
		canvasElement.style.height = height + "px";
	}
	
	function justifyText(container, content, font, lineHeight, width, color) {
		var words = content.split(' ');
		var line = '';
		var x = 0;
		var y = 0;
			
		for(var n = 0; n < words.length; n++) {
			var testLine;
			if(n == 0) {
				testLine = words[0];
			}
			else {
				testLine = line + ' ' + words[n];
			}
			
			var testTextContainer = new createjs.Text(testLine, font, color);
			var testWidth = testTextContainer.getMeasuredWidth();
			
			
			if (testWidth > width && n > 0) {
				container = justifyLine(container, line, font, color, width, x, y);
				
				line = words[n];
				if(lineHeight)
					y += lineHeight;
				else
					y += testTextContainer.getMeasuredLineHeight();
			}
			else {
				line = testLine;
			}
		}
		
		if(line != '') {
			var lastLine = new createjs.Text(line, font, color);
			lastLine.x = x;
			lastLine.y = y;
			
			container.addChild(lastLine);
		}
		
		return container;
	}
	
	function justifyLine(container, line, font, color, width, x, y) {
		var words = line.split(' ');
		var lineWithoutSpace = new createjs.Text(line.replace(/ /g, ""), font, color);
		
		var spaceWidth = (width - lineWithoutSpace.getMeasuredWidth())/(words.length - 1);
		var lineX = x;
		
		for(var n = 0; n < words.length; n++) {
			var word = new createjs.Text(words[n], font, color);
			word.x = lineX;
			word.y = y;
			
			container.addChild(word);
			lineX = lineX + word.getMeasuredWidth() + spaceWidth;
		}
		
		return container;
	}
}