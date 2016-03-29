var app = angular.module('app', []);
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('remote');
const path = require('path');
const fs = require('fs-extra');
const NoventCompiler = require("./js/NoventCompiler.js");
const asar = require('asar');
const libxml = require("libxmljs");
const xml2js = require('xml2js');

window.$ = require("./js/jquery-2.2.1.min.js");

app.controller('editorController', function($scope, $interval) {
	$scope.safeApply = function(fn) {
	  var phase = this.$root.$$phase;
	  if(phase == '$apply' || phase == '$digest') {
	    if(fn && (typeof(fn) === 'function')) {
	      fn();
	    }
	  } else {
	    this.$apply(fn);
	  }
	};
	
	$scope.projectPath = path.dirname(remote.getGlobal('filePath'));
	
	CodeMirror.registerHelper("lint", "xml", function(text, options) {
		var found = [];
		if(text == "")
			return found;
		
		try {
			var xsd = fs.readFileSync("project-resources/novent-descriptor-0.1.xsd", "utf8");
			var xsdDoc = libxml.parseXml(xsd);
			var xmlDoc = libxml.parseXml(text);
			xmlDoc.validate(xsdDoc);
			
			//TODO: post validation:
			//- animate value attr (positive integer etc.)
			
			validateNoventSrcs(xmlDoc);
			validateEndTagNumber(xmlDoc);
			validateTargetValues(xmlDoc);
			
			$scope.safeApply(function () {
				$scope.noventErrors = xmlDoc.validationErrors;
				console.log(xmlDoc.validationErrors)
				var parser = new xml2js.Parser({explicitChildren:true, preserveChildrenOrder:true});
				parser.parseString(text, function (err, result) {
					$scope.novent = result.novent;
					console.log($scope.novent);
				});
			});
			
			for (var i = 0; i < xmlDoc.validationErrors.length; i++) {
			  var message = xmlDoc.validationErrors[i].message;
			  var startLine = xmlDoc.validationErrors[i].line;
			  var endLine = xmlDoc.validationErrors[i].line;
			  var startCol = xmlDoc.validationErrors[i].column; 
			  var endCol = xmlDoc.validationErrors[i].column;
			  found.push({
				from: CodeMirror.Pos(startLine - 1, startCol),
				to: CodeMirror.Pos(endLine - 1, endCol),
				message: message
			  });
			}
			return found;
		}
		catch(e) {
			$scope.safeApply(function () {
				$scope.noventErrors = [{line: 0, column: 0, message: "Invalid XML structure"}];
			});
			found.push({
				from: CodeMirror.Pos(0, 0),
				to: CodeMirror.Pos(0, 0),
				message: "Invalid XML structure"
			  });
			return found;
		}
	});
	
	function validateNoventSrcs(xmlDoc) {
		var srcAttrs = xmlDoc.find("//@src");
		for(var i in srcAttrs) {
			if(!fs.existsSync($scope.projectPath + "/" + srcAttrs[i].value()))
				xmlDoc.validationErrors.push({line: srcAttrs[i].line(), column: 0, message: "Attribute 'src': '" + srcAttrs[i].value() + "' is not a valid value: file is missing in project path."});
		}
	}
	
	function validateEndTagNumber(xmlDoc) {
		var eventTags = xmlDoc.find("//event");
		for(var i in eventTags) {
			var ends = eventTags[i].find(".//end");
			if(ends.length != 1)
				xmlDoc.validationErrors.push({line: eventTags[i].line(), column: 0, message: "Invalid event structure: there must be one and only one end tag in each event."});
		}
	}
	
	function validateTargetValues(xmlDoc) {
		var pageTags = xmlDoc.find("//page");
		
		for(var i in pageTags) {			
			var targetAttrs = pageTags[i].find(".//@target");
			for(var j in targetAttrs) {
				var target = targetAttrs[j].value();
				var targetNode = pageTags[i].find(".//*[@name='" + target + "']");
				var nodeName = targetAttrs[j].parent().name();
				
				if(targetNode.length == 0)
					xmlDoc.validationErrors.push({line: targetAttrs[j].line(), column: 0, message: "Attribute 'target': '" + targetAttrs[j].value() + "' is not a valid value: no materials with this name."});
				else {
					var targetNodeName = targetNode[0].name();
					if(nodeName == "play" && !(targetNodeName == "sound" || targetNodeName == "animation" || targetNodeName == "video"))
						xmlDoc.validationErrors.push({line: targetAttrs[j].line(), column: 0, message: "Attribute 'target': '" + targetAttrs[j].value() + "' is not a valid value: play event can only apply on sounds, animations and videos."});
					else if(nodeName == "stop" && !(targetNodeName == "sound" || targetNodeName == "animation" || targetNodeName == "video" || targetNodeName == "wiggle"))
						xmlDoc.validationErrors.push({line: targetAttrs[j].line(), column: 0, message: "Attribute 'target': '" + targetAttrs[j].value() + "' is not a valid value: play event can only apply on sounds, animations, videos and wiggles."});
				}

			}
			
		}
	}
	
	$scope.editor = CodeMirror.fromTextArea(document.getElementById("editor-textarea"), {
	  lineNumbers: true,
	  styleActiveLine: true,
	  mode: "xml",
	  extraKeys: {
		  "'<'": completeAfter,
		  "'/'": completeIfAfterLt,
		  "' '": completeIfInTag,
		  "'='": completeIfInTag,
		  "Ctrl-Space": "autocomplete"
		},
		hintOptions: {schemaInfo: noventTags},
		matchTags: {bothTags: true},
		autoCloseTags: true,
		foldGutter: true,
		gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		lint: true,
		scrollbarStyle: "simple"
	});
	$scope.editor.setOption("theme", "night");
	
	$scope.editor.on("change", function() {
		if($scope.editor.getValue() != $scope.savedContent)  {
			$scope.safeApply(function () {
				$scope.canSave = true;
			});
		}
		else {
			$scope.safeApply(function () {
				$scope.canSave = false;
			});
		}
	});
	
	$scope.fontSize = 13;
	
	$scope.zoomIn = function() {
		if($scope.fontSize < 50) {
			$scope.fontSize++;
			$scope.editor.getWrapperElement().style.fontSize = $scope.fontSize + "px";
		}
	}
	
	$scope.zoomOut = function() {
		if($scope.fontSize > 1) {
			$scope.fontSize--;
			$scope.editor.getWrapperElement().style.fontSize = $scope.fontSize + "px";
		}
	}
		
	fs.readFile($scope.projectPath + "/novent-descriptor.xml", 'utf8', (err, data) => {
	  if (err) {
		ipcRenderer.send('project-error', err); 
		return;
	  }
	  $scope.safeApply(function () {
		  $scope.editor.setValue(data);	
		  $scope.editor.clearHistory();	
		  $scope.savedContent = data;
		  $scope.canSave = false;
	  });

	});
	
	$scope.search = function() {
		$scope.editor.execCommand("find");
	}
	
	
	$scope.previewURI = $scope.projectPath + "/novent.html";
	
	$scope.preview = function() {
		if(!$scope.isInPreview) {
			if($scope.noventErrors.length == 0) {
				ensureCompileFiles();
				
				var script = NoventCompiler.compile($scope.novent, $scope.pageSelect);
				fs.writeFile($scope.projectPath + "/novent.js", script, (err) => {
					if (err) {
						console.log(err);
						return;  
					}
					
					$scope.safeApply(function () {
						$scope.isInPreview = true;
						$scope.editor.setOption("readOnly", true);
					});
				});
			}
		}
		else {
			$scope.isInPreview = false;
			$scope.editor.setOption("readOnly", false);
		}
	}
	
	function ensureCompileFiles() {
		fs.copySync(remote.getGlobal('dirname') + "/project-resources/novent.html",$scope.projectPath + "/novent.html");
		fs.copySync(remote.getGlobal('dirname') + "/project-resources/createjs-2015.11.26.min.js", $scope.projectPath + "/createjs-2015.11.26.min.js");
		fs.copySync(remote.getGlobal('dirname') + "/project-resources/novent-engine-0.1.js", $scope.projectPath + "/novent-engine-0.1.js");
	}
	
	$scope.new = function() {
		ipcRenderer.send('dialog-create-new-project', '');
	}
	
	$scope.open = function() {
		ipcRenderer.send('dialog-open-existing-project', '');
	}
	
	$scope.save = function() {
		fs.writeFileSync($scope.projectPath + "/novent-descriptor.xml", $scope.editor.getValue());
		
		$scope.savedContent = $scope.editor.getValue();
		$scope.canSave = false;
	}
	
	$scope.package = function() {
		if($scope.noventErrors.length == 0) {
			var packagePath = ipcRenderer.sendSync('package-project', '');
			if(packagePath != null) {
				ensureCompileFiles();
				
				var script = NoventCompiler.compile($scope.novent);
				fs.writeFile($scope.projectPath + "/novent.js", script, (err) => {
					if (err) {
						console.log(err);
						return;  
					}
					
					asar.createPackage($scope.projectPath, packagePath + "\\" + path.basename($scope.projectPath) + ".novent", function() {});
				});
			}
		}
	}
	
	$scope.cut = function() {
		$scope.editor.focus();
		document.execCommand('cut');
	}
	
	$scope.copy = function() {
		$scope.editor.focus();
		document.execCommand('copy');
	}
	
	$scope.paste = function() {
		$scope.editor.focus();
		document.execCommand('paste');
	}
	
	window.addEventListener('keypress', function(ev){
		if(ev.ctrlKey && ev.keyCode == 19) {
			$scope.safeApply(function () {
				$scope.save();
			});
		}
		
		if(ev.ctrlKey && ev.keyCode == 14) {
			$scope.safeApply(function () {
				$scope.new();
			});
		}
		
		if(ev.ctrlKey && ev.keyCode == 15) {
			$scope.safeApply(function () {
				$scope.open();
			});
		}
	});
	
	
	$(document).ready(function() {
		var resizeEditorPreview = false;
		
		$(".resize-editor-preview").mousedown(function() {
			resizeEditorPreview = true;
		});
		
		$("#top-section").mouseup(function() {
			resizeEditorPreview = false;
			$("#top-section").css("cursor", "default");
		});
		
		/*$(".resize-editor-preview").mouseleave(function() {
			resizeEditorPreview = false;
		});*/
		
		$("#top-section").mousemove(function(event) {
			if(resizeEditorPreview && !$scope.isInPreview) {
				$("#top-section").css("cursor", "ew-resize");
				var percent = event.clientX/window.innerWidth;
				
				if(percent < 0.9 && percent > 0.1) {
					$("#editor").css("right", (1 - percent)*100 + "%");
					$("#preview").css("left", percent*100 + "%");
				}
			}
		});
	});
	
	ipcRenderer.on('save-before-close', function(event, message) {
		if(!$scope.canSave)
			remote.getCurrentWindow().destroy();
		else {
			var value = ipcRenderer.sendSync("save-before-change-dialog", "");
			if(value == 0) {
				$scope.save();	
				remote.getCurrentWindow().destroy();
			}
			else if(value == 1)
				remote.getCurrentWindow().destroy();
		}
	});
});