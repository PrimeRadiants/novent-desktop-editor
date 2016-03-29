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
let newProjectWindow;

global.filePath = null;
global.newProjectPath = app.getPath("documents");
global.dirname = __dirname

if(!fs.existsSync(app.getPath("documents") + "/recentNoventProjects.json")) {
	fs.writeFileSync(app.getPath("documents") + "/recentNoventProjects.json", "[]");
	global.recentProjects = [];
}
else {
	global.recentProjects = JSON.parse(fs.readFileSync(app.getPath("documents") + "/recentNoventProjects.json"));
	global.recentProjects.forEach(function(e, i) {
		if(!fs.existsSync(e))
			global.recentProjects.splice(i, 1);
	});
}

function updateReventProjects(newProjectPath) {
	if(global.recentProjects.indexOf(newProjectPath) != -1)
		global.recentProjects.splice(global.recentProjects.indexOf(newProjectPath), 1);
	else if(global.recentProjects.length == 20)
		global.recentProjects.splice(0, 1);
	
	global.recentProjects.push(newProjectPath);
	
	fs.writeFileSync(app.getPath("documents") + "/recentNoventProjects.json", JSON.stringify(global.recentProjects));
}

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
  
  dialogWindow.on('closed', function() {
	dialogWindow = null;
  });
}

ipcMain.on('dialog-close', function(event, arg) {
	if(dialogWindow != null)
		dialogWindow.close();
});

ipcMain.on('dialog-open-existing-project', function(event, arg) {
  openExistingProjectDialog();
});

ipcMain.on('open-existing-project', function(event, arg) {
  openExistingProject(arg);
});

ipcMain.on('dialog-create-new-project', function(event, arg) {
  openCreateNewProjectDialog();
});

ipcMain.on('project-error', function(event, arg) {
	dialog.showErrorBox("Novent project error", arg);
});

function openEditor() {
	fs.exists(path.dirname(global.filePath) + "/novent-descriptor.xml", function(exists) {
		if(exists) {
			if(mainWindow != null) {
				mainWindow.reload();
				return;
			}
				
			
			mainWindow = new BrowserWindow({width: 600, height: 800});
			mainWindow.setMenu(null);
			mainWindow.maximize();
			mainWindow.loadURL('file://' + __dirname + '/index.html');
			
			if(dialogWindow != null)
				dialogWindow.close();
			
			if(newProjectWindow != null)
				newProjectWindow.close();
			
			
			mainWindow.on('close', function(event) {
				event.preventDefault();
				mainWindow.webContents.send("save-before-close");
			});
			
			mainWindow.on('closed', function() {
				mainWindow = null;
			});
		}
		else {
			dialog.showErrorBox("Novent project error", "Invalid project directory: missing novent-descriptor.xml");
		}
	});
	
}

ipcMain.on('save-before-change-dialog', function(event, arg) {
	dialog.showMessageBox({type: "warning", buttons: ["Yes", "No", "Cancel"], title: "Novent Studio", message: "Save changes made to project before quiting ?"}, function(value) {
		event.returnValue = value;
	});
});

function openExistingProject(path) {
	if(fs.existsSync(path)) {
		global.filePath = path;
		updateReventProjects(global.filePath);
		openEditor();
	}
	else {
		dialog.showErrorBox("Novent project error", "Missing Project " + path);
	}
}

function openExistingProjectDialog() {
	dialog.showOpenDialog({properties: ['openFile'], filters: [{ name: 'Novent Project', extensions: ['noventproj'] }]}, function(filePaths) {

		//If no file selected, quit
		if(filePaths == undefined) {
			return;
		}

		//Resolve file name without extension
		global.filePath = filePaths[0];
		updateReventProjects(global.filePath);
		openEditor();
	});
}

function openCreateNewProjectDialog() {
	if(dialogWindow != null)
		dialogWindow.hide();
	newProjectWindow = new BrowserWindow({width: 716, height: 240, resizable: false});
	newProjectWindow.setMenu(null);
	newProjectWindow.loadURL('file://' + __dirname + '/new.html');
	
	newProjectWindow.on('closed', function() {
		if(dialogWindow != null)
			dialogWindow.show();
		newProjectWindow = null;
	});
}

ipcMain.on('new-project-close', function(event, arg) {
	if(newProjectWindow != null)
		newProjectWindow.close();
});

ipcMain.on('choose-project-location', function(event, arg) {
	dialog.showOpenDialog({properties: ['openDirectory']}, function(filePaths) {
		//If no file selected, quit
		if(filePaths == undefined) {
			event.returnValue = arg;
			return;
		}
				
		event.returnValue = filePaths[0];
	});
});

ipcMain.on('create-new-project', function(event, arg) {
	createNewProject(arg.name, arg.location);
});

function createNewProject(projectName, projectPath) {
	if(!fs.existsSync(projectPath + "/" + projectName)) {
		fs.mkdir(projectPath + "/" + projectName, (err) => {
			fs.writeFile(projectPath + "/" + projectName + "/" + projectName + '.noventproj', '', (err) => {
			  if (err) {
				dialog.showErrorBox("Novent project error", JSON.stringify(err));
				return;  
			  }
			  
			  fs.copy(__dirname + "/project-resources/sample-descriptor.xml", projectPath + "/" + projectName + "/novent-descriptor.xml", function (err2) {
				  if (err2) {
					dialog.showErrorBox("Novent project error", JSON.stringify(err2));
					return;  
				  }
				  fs.copy(__dirname + "/project-resources/button.png", projectPath + "/" + projectName + "/images/button.png", function (err3) {
					  if (err3) {
						dialog.showErrorBox("Novent project error", JSON.stringify(err3));
						return;  
					  }
					  fs.copy(__dirname + "/project-resources/begin.png", projectPath + "/" + projectName + "/images/begin.png", function (err4) {
						  if (err4) {
							dialog.showErrorBox("Novent project error", JSON.stringify(err4));
							return;  
						  }
						  global.filePath = projectPath + "\\" + projectName + "\\" + projectName + '.noventproj';
						  updateReventProjects(global.filePath);
						  openEditor();
					  });
				  });
			  });
			});
		});
	}
	else {
		dialog.showErrorBox("Novent project error", "Folder " + projectPath + "/" + projectName + " already exists.");
	}
}

ipcMain.on('package-project', function(event, arg) {
	dialog.showOpenDialog({properties: ['openDirectory']}, function(filePaths) {
		//If no file selected, quit
		if(filePaths == undefined) {
			event.returnValue = null;
			return;
		}
				
		event.returnValue = filePaths[0];
	});
});

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
