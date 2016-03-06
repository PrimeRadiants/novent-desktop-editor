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
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
	});
	$scope.editor.setOption("theme", "night");
	
	fs.readFile(path.dirname(remote.getGlobal('filePath')) + "/novent-descriptor.xml", 'utf8', (err, data) => {
	  if (err) {
		ipcRenderer.send('project-error', err); 
		return;
	  }
	  console.log(data);
	  $scope.editor.setValue(data);
	  
	  doc = new XMLParser().parseFromString($scope.editor.getValue(), 'text/xml');
	  console.log(doc);
	  
	  console.log(Novent.fromNode(doc.getElementsByTagName("novent")[0], path.dirname(remote.getGlobal('filePath'))));
	});
	
	$scope.loadDirectoryFiles = function() {
		$scope.files = dirTree.directoryTree(path.dirname(remote.getGlobal('filePath')));
	}
	
	$scope.loadDirectoryFiles();
	
	
});