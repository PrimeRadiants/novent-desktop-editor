var app = angular.module('app', ['AxelSoft']);
const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;
const remote = require('remote');
const path = require('path');
const fs = require('fs-extra');
const dirTree = require('directory-tree');
const NoventParser = require("./js/novent-parser/NoventParser.js");
const NoventCompiler = require("./js/novent-parser/NoventCompiler.js");
const XMLParser = require('xmldom').DOMParser;
const asar = require('asar');

app.controller('editorController', function($scope, $interval) {
	
	$scope.projectPath = path.dirname(remote.getGlobal('filePath'));
	
	CodeMirror.registerHelper("lint", "xml", function(text, options) {
		var found = [];
		if(text == "")
			return found;
		
		$scope.$apply(function () {
			$scope.novent = NoventParser.parse(text, $scope.projectPath);
		});
		
		for (var i = 0; i < $scope.novent.errors.length; i++) {
		  var message = $scope.novent.errors[i].msg;
		  var startLine = $scope.novent.errors[i].line;
		  var endLine = $scope.novent.errors[i].line;
		  var startCol = 0; 
		  var endCol = 0;
		  found.push({
			from: CodeMirror.Pos(startLine - 1, startCol),
			to: CodeMirror.Pos(endLine - 1, endCol),
			message: message
		  });
		}
		console.log(found);
		return found;
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
	  $scope.$apply(function () {
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
					
					$scope.$apply(function () {
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
		console.log("test");
		fs.writeFile($scope.projectPath + "/novent-descriptor.xml", $scope.editor.getValue(), (err) => {
			if (err) {
				console.log(err);
				return;  
			}
			
			$scope.$apply(function () {
				$scope.canSave = false;
			});
		});
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
			$scope.$apply(function () {
				$scope.save();
			});
		}
		
		if(ev.ctrlKey && ev.keyCode == 14) {
			$scope.$apply(function () {
				$scope.new();
			});
		}
		
		if(ev.ctrlKey && ev.keyCode == 15) {
			$scope.$apply(function () {
				$scope.open();
			});
		}
	});
});