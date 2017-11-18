const electron = require('electron');
const url = require('url');
const path = require('path');

const {app, BrowserWindow, Menu, ipcMain} = electron;

let mainWindow;



// Listen for app to be ready
app.on('ready', function(){
	// Create new window
	mainWindow = new BrowserWindow({});

	// Load html into window
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'MainWindow.html'),
		protocol: 'file:',
		slashes: true
	}));

	// Quit entire application
	mainWindow.on('closed', function(){
		app.quit();
	});

	// Build menu from template
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

	// Insert the menu
	Menu.setApplicationMenu(mainMenu);
});

// Create menu template
const mainMenuTemplate = [
]

// Add developer tools 
if(process.env.NODE_ENV !== 'Production'){
	mainMenuTemplate.push({
		label:'Developer Tools',
		submenu: [
			{
				label: 'Refresh',
				accelerator: 'Ctrl+r',
				role: 'reload'
			},
			{
				label: 'Toggle DevTools',
				accelerator: 'Ctrl+i',
				click(item, focusedWindow){
					focusedWindow.toggleDevTools();
				}
			}
		]

	});
}