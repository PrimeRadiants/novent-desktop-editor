var app = angular.module('app', []);
const ipcRenderer = require('electron').ipcRenderer;

app.controller('errorController', function($scope) {
	$scope.closeDialog = function() {
		ipcRenderer.send('error-close', '');
	}
});

function getQueryVariable(variable)
{
	   var query = window.location.search.substring(1);
	   var vars = query.split("&");
	   for (var i=0;i<vars.length;i++) {
			   var pair = vars[i].split("=");
			   if(pair[0] == variable){return pair[1];}
	   }
	   return(false);
}