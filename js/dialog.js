var app = angular.module('app', []);
const ipcRenderer = require('electron').ipcRenderer;
const shell = require('electron').shell;
const remote = require('remote');

app.controller('dialogController', function($scope) {
	
	$scope.recentProjects = remote.getGlobal("recentProjects");
	
	$scope.closeDialog = function() {
		ipcRenderer.send('dialog-close', '');
	}
	
	$scope.openExistingProject = function() {
		ipcRenderer.send('dialog-open-existing-project', '');
	}
	
	$scope.openRecentProject = function(path) {
		ipcRenderer.send('open-existing-project', path);
	}
	
	$scope.createNewProject = function() {
		ipcRenderer.send('dialog-create-new-project', '');
	}
	
	$scope.gotToDoc = function() {
		shell.openExternal('http://prime-radiants.com/doc');
	}
});

app.filter('reverse', function() {
  return function(items) {
    return items.slice().reverse();
  };
});