var app = angular.module('app', []);
const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;
const remote = require('remote');
const path = require('path');
const fs = require('fs-extra');
const dirTree = require('directory-tree');
const Novent = require("./js/novent-parser/Novent.js");
const XMLParser = require('xmldom').DOMParser;

app.controller('editorController', function($scope) {
	CodeMirror.registerHelper("lint", "xml", function(text, options) {
		var found = [];
		if(text == "")
			return found;
		
		var doc = new XMLParser().parseFromString(text, 'text/xml');
		var novent = Novent.fromNode(doc.getElementsByTagName("novent")[0], path.dirname(remote.getGlobal('filePath')));
		console.log(doc);
		console.log(novent);
		for (var i = 0; i < novent.errors.length; i++) {
		  var message = novent.errors[i].msg;
		  var startLine = novent.errors[i].line;
		  var endLine = novent.errors[i].line;
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
		$scope.files = dirTree.directoryTree(path.dirname(remote.getGlobal('filePath')));
	}
	
	$scope.loadDirectoryFiles();
	
	
});