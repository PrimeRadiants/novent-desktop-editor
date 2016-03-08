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

app.controller('editorController', function($scope, $interval) {
	
	
	CodeMirror.registerHelper("lint", "xml", function(text, options) {
		var found = [];
		if(text == "")
			return found;
		
		$scope.$apply(function () {
			$scope.novent = NoventParser.parse(text, path.dirname(remote.getGlobal('filePath')));
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
		lint: true
	});
	$scope.editor.setOption("theme", "night");
	
	fs.readFile(path.dirname(remote.getGlobal('filePath')) + "/novent-descriptor.xml", 'utf8', (err, data) => {
	  if (err) {
		ipcRenderer.send('project-error', err); 
		return;
	  }
	  $scope.editor.setValue(data);	
	});
	
	$scope.loadDirectoryFiles = function() {
		$scope.files = convertFileObject(dirTree.directoryTree(path.dirname(remote.getGlobal('filePath'))));
		//$scope.files = dirTree.directoryTree(path.dirname(remote.getGlobal('filePath')));
		//a = $scope.files;
		console.log($scope.files);
	}
	
	$scope.loadDirectoryFiles();
	$interval($scope.loadDirectoryFiles, 2000);
	
	$scope.previewURI = path.dirname(remote.getGlobal('filePath')) + "/novent.html";
	
	$scope.preview = function() {
		if(!$scope.isInPreview) {
			if($scope.novent.errors.length == 0) {
				if(!fs.existsSync(path.dirname(remote.getGlobal('filePath')) + "/novent.html")) {
					fs.copySync(remote.getGlobal('dirname') + "/project-resources/novent.html", path.dirname(remote.getGlobal('filePath')) + "/novent.html");
				}
				
				if(!fs.existsSync(path.dirname(remote.getGlobal('filePath')) + "/canvasengine-1.3.2.all.js")) {
					fs.copySync(remote.getGlobal('dirname') + "/project-resources/canvasengine-1.3.2.all.js", path.dirname(remote.getGlobal('filePath')) + "/canvasengine-1.3.2.all.js");
				}
				
				if(!fs.existsSync(path.dirname(remote.getGlobal('filePath')) + "/novent-reader.js")) {
					fs.copySync(remote.getGlobal('dirname') + "/project-resources/novent-reader.js", path.dirname(remote.getGlobal('filePath')) + "/novent-reader.js");
				}
				
				console.log("test");
				var script = NoventCompiler.compile($scope.novent);
				fs.writeFile(path.dirname(remote.getGlobal('filePath')) + "/novent.js", script, (err) => {
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
	
	$scope.breadcrums = [''];
					
	$scope.fileStructure = { folders: [
		{ name: 'Folder 1', files: [{ name: 'File 1.jpg' }, { name: 'File 2.png' }], folders: [
			{ name: 'Subfolder 1', files: [{ name: 'Subfile 1.txt' }] },
			{ name: 'Subfolder 2' },
			{ name: 'Subfolder 3' }
		]},
		{ name: 'Folder 2' }
	], files: [{ name: 'File 1.gif' }, { name: 'File 2.gif' }]};
	
	$scope.fileViewOptions = {
		onNodeSelect: function (node, breadcrums) {
			$scope.breadcrums = breadcrums;
		}
	};
});

function convertFileObject(fileObject) {
	var result = new Object();
	result.name = fileObject.name;
	result.folders = new Array();
	result.files = new Array();
	
	if(fileObject.children != undefined) {
		fileObject.children.forEach(function(e) {
			if(e.type == "file")
				result.files.push({name: e.name});
			else if(e.type == "directory")
				result.folders.push(convertFileObject(e));
		});
	}
	
	return result;
}