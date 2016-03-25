var app = angular.module('app', []);
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('remote');
const path = require('path');
const fs = require('fs-extra');
const NoventParser = require("./js/novent-parser/NoventParser.js");
const NoventCompiler = require("./js/novent-parser/NoventCompiler.js");
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
			//- 1 <end/> per event
			//- existing target for animate, play & stop tags
			//- animate value attr (positive integer etc.)

			
			$scope.safeApply(function () {
				$scope.noventErrors = xmlDoc.validationErrors;
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
			return found;
		}
	});
	
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
		$scope.canSave = true;
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
	
	editor = $scope.editor;
	
	fs.readFile($scope.projectPath + "/novent-descriptor.xml", 'utf8', (err, data) => {
	  if (err) {
		ipcRenderer.send('project-error', err); 
		return;
	  }
	  $scope.safeApply(function () {
		  $scope.editor.setValue(data);	
		  $scope.canSave = false;
	  });

	});
	
	
	$scope.previewURI = $scope.projectPath + "/novent.html";
	
	$scope.preview = function() {
		if(!$scope.isInPreview) {
			if($scope.novent.errors.length == 0) {
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
		if(!fs.existsSync($scope.projectPath + "/novent.html")) {
			fs.copySync(remote.getGlobal('dirname') + "/project-resources/novent.html",$scope.projectPath + "/novent.html");
		}
		
		if(!fs.existsSync($scope.projectPath + "/canvasengine-1.3.2.all.js")) {
			fs.copySync(remote.getGlobal('dirname') + "/project-resources/canvasengine-1.3.2.all.js", $scope.projectPath + "/canvasengine-1.3.2.all.js");
		}
		
		if(!fs.existsSync($scope.projectPath + "/novent-reader.js")) {
			fs.copySync(remote.getGlobal('dirname') + "/project-resources/novent-reader.js", $scope.projectPath + "/novent-reader.js");
		}
	}
	
	$scope.new = function() {
		ipcRenderer.send('dialog-create-new-project', '');
	}
	
	$scope.open = function() {
		ipcRenderer.send('dialog-open-existing-project', '');
	}
	
	$scope.save = function() {
		fs.writeFileSync($scope.projectPath + "/novent-descriptor.xml", $scope.editor.getValue());
			
		$scope.canSave = false;
	}
	
	$scope.package = function() {
		if($scope.novent.errors.length == 0) {
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