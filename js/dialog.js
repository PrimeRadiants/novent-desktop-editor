var app = angular.module('app', []);
const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;

app.controller('dialogController', function($scope) {
	$scope.closeDialog = function() {
		ipcRenderer.send('dialog-close', '');
	}
	
	$scope.openExistingProject = function() {
		ipcRenderer.send('dialog-open-existing-project', '');
	}
	
	$scope.createNewProject = function() {
		ipcRenderer.send('dialog-create-new-project', '');
	}
	
	$scope.gotToDoc = function() {
		shell.openExternal('http://prime-radiants.com/doc');
	}
});