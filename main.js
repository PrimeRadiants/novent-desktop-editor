'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const dialog = electron.dialog;
const fs = require('fs-extra');
const path = require('path');
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;

let dialogWindow;
let mainWindow;

global.filePath = null;

function main() {
	if(global.filePath != null && path.extname(process.argv[1]) == ".noventproj")
	 global.filePath = process.argv[1];
  
	if(global.filePath == null)
		openDialog();
	else
		openEditor();
}

function openDialog () {
  dialogWindow = new BrowserWindow({width: 716, height: 400, resizable: false});
  dialogWindow.setMenu(null);
  dialogWindow.loadURL('file://' + __dirname + '/dialog.html');
  
  ipcMain.on('dialog-close', function(event, arg) {
	  dialogWindow.close();
  });
  
  ipcMain.on('dialog-open-existing-project', function(event, arg) {
	  openExistingProject();
  });
  
  ipcMain.on('dialog-create-new-project', function(event, arg) {
	  createNewProject();
  });
  
  dialogWindow.on('closed', function() {
	dialogWindow = null;
  });
}

ipcMain.on('project-error', function(event, arg) {
	  dialog.showErrorBox("Novent project error", arg);
});

function openEditor() {
	fs.exists(path.dirname(global.filePath) + "/novent-descriptor.xml", function(exists) {
		if(exists) {
			mainWindow = new BrowserWindow({width: 600, height: 800});
			mainWindow.maximize();
			mainWindow.loadURL('file://' + __dirname + '/index.html');
			mainWindow.webContents.openDevTools();
			dialogWindow.close();
			mainWindow.on('closed', function() {
				mainWindow = null;
			});
		}
		else {
			dialog.showErrorBox("Novent project error", "Invalid project directory: missing novent-descriptor.xml");
		}
	});
	
}

function openExistingProject() {
	dialog.showOpenDialog({properties: ['openFile'], filters: [{ name: 'Novent Project', extensions: ['noventproj'] }]}, function(filePaths) {

		//If no file selected, quit
		if(filePaths == undefined) {
			return;
		}

		//Resolve file name without extension
		global.filePath = filePaths[0];
		openEditor();
	});
}

function createNewProject() {
	dialog.showOpenDialog({properties: ['openDirectory']}, function(filePaths) {

		//If no file selected, quit
		if(filePaths == undefined) {
			return;
		}

		var projectPath = filePaths[0];
		
		fs.writeFile(projectPath + "/" + path.basename(projectPath) + '.noventproj', '', (err) => {
		  if (err) {
			openErrorWindow(err);
			return;  
		  }
		  
		  fs.copy(__dirname + "/project-resources/sample-descriptor.xml", projectPath + "/novent-descriptor.xml", function (err2) {
			  if (err2) {
				openErrorWindow(err2);
				return;  
			  }
			  fs.copy(__dirname + "/project-resources/button.png", projectPath + "/images/button.png", function (err3) {
				  if (err3) {
					openErrorWindow(err3);
					return;  
				  }
				  fs.copy(__dirname + "/project-resources/begin.png", projectPath + "/images/begin.png", function (err4) {
					  if (err4) {
						openErrorWindow(err4);
						return;  
					  }
					  global.filePath = projectPath + "/" + path.basename(projectPath) + '.noventproj';
					  openEditor();
				  });
			  });
		  });
		});
	});
}

app.on('open-file', function(e, path) {
	e.preventDefault();
	global.filePath = path;
});
app.on('ready', main);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
