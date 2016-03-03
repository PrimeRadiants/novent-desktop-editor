'use strict';

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const dialog = electron.dialog;
const fs = require('fs-extra');
const path = require('path');
const Menu = electron.Menu;


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
var filePath = null;
var template = [
  {
    label: 'File',
    submenu: [
	  {
        label: 'Open',
        accelerator: 'CmdOrCtrl+O',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            openNovent();
        }
      },
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
	  {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      }
    ]
  }
];

var menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function createWindow () {
  mainWindow = new BrowserWindow({width: 600, height: 800});
  mainWindow.maximize();
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  if(process.argv[1] != undefined)
	 filePath = process.argv[1];
  
  if(filePath == null)
	openNoventFile();
  else
	readNovent();

  mainWindow.on('closed', function() {
	mainWindow = null;
  });
}

function openNoventFile() {
	//Open File dialog
  dialog.showOpenDialog({properties: ['openFile'], filters: [{ name: 'Novent', extensions: ['novent'] }]}, function(filePaths) {
	  
	  //If no file selected, quit
	  if(filePaths == undefined) {
		  app.quit();
		  return;
	  }
	  
	  //Resolve file name without extension
	  filePath = filePaths[0];
	  readNovent();
  });
}

function readNovent() {
	var fileName = path.basename(filePath, ".novent");
	  
	  //Copy novent in Novent directory and rename it as a asar archive
	  fs.copy(filePath, app.getPath("temp") + "/novents/" + fileName + ".novent", function (err) {
		  if (err) return console.error(err);
		  fs.rename( app.getPath("temp") + "/novents/" + fileName + ".novent",  app.getPath("temp") + "/novents/" + fileName + ".asar", function(err) {
			  if (err) return console.error(err);
			   mainWindow.loadURL('file://' + app.getPath("temp") + "/novents/" + fileName + ".asar" + '/novent.html');
		  });
	  })
}

app.on('open-file', function(e, path) {
	e.preventDefault()
	filePath = path;
});
app.on('ready', createWindow);

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
