var app = angular.module('app', []);
const electron = require('electron');
const ipcRenderer = electron.ipcRenderer;
const remote = require('remote');
const dialog = electron.dialog;

app.controller('newController', function($scope) {
	
	$scope.projectLocation = remote.getGlobal('newProjectPath');
	
	$scope.$watch(function() { return remote.getGlobal('newProjectPath'); }, function(value) {
		$scope.projectLocation = remote.getGlobal('newProjectPath');
	});
	
	$scope.chooseProjectLocation = function() {
		$scope.projectLocation = ipcRenderer.sendSync('choose-project-location', '');
	}
	
	$scope.cancel = function() {
		ipcRenderer.send('new-project-close', '');
	}
	
	$scope.create = function() {
		if($scope.projectName != undefined && $scope.projectName != null && $scope.projectName != "")
			ipcRenderer.send('create-new-project', {name: $scope.projectName, location: $scope.projectLocation});
		
	}
});