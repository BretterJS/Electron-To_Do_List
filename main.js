const electron = require('electron');
const url = require('url');
const path = require('path');
const {app, BrowserWindow, Menu, ipcMain, globalShortcut} = electron;

process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// App is ready
app.on('ready', function() {

    mainWindow = new BrowserWindow({}); // Create new window
    mainWindow.loadURL(url.format({ // Load HTML in new window
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Quit app
    mainWindow.on('closed', function() {
        app.quit();
    });

    // Build menu
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    Menu.setApplicationMenu(mainMenu);


    // Keyboard shortcut to add new window
    globalShortcut.register('CommandOrControl+A', () => {
        console.log('CommandOrControl+A is pressed');
        createAddWindow();
    });
});

    // Create add item window
    function createAddWindow() {

        addWindow = new BrowserWindow({
            height: 160,
            width: 500,
            title: 'Add Item To List'
        });

        addWindow.loadURL(url.format({
            pathname: path.join(__dirname, 'addWindow.html'),
            protocol: 'file:',
            slashes: true           
        }));

        // Remove from memory
        addWindow.on('close', function() {
            addWindow = null;
        });

    };

    // Add item
    ipcMain.on('item:add', function(e, item) {
        console.log(item);
        mainWindow.webContents.send('item:add', item);
        addWindow.close();
    });

   
// Create File Menu Template
const mainMenuTemplate = [
    {
        label:'File',
        submenu: [
            {
                label: 'Add Item',
                accelerator: process.platform == 'darwin' ? 'Command+A' : 'Ctrl+A',
                click() {
                    createAddWindow();
                }
            },
            {
                label: 'Clear List',
                click() {
                    mainWindow.webContents.send('item:clear');
                }
            },
            {
                label: 'Exit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    }
]

const addWindowTemplate = [
    {
        label: 'File',
        submenu: [
            {
                label: 'Add Item',
                click() {
                }
            }
        ]
    }
]

// Check to see if on Mac and add empty object so label changes to 'File'
if (process.platform == 'darwin') {
    maineMenuTemplate.unshift({});
}

// Add Dev Tools for Non Production
if (process.env.NODE_ENV !== 'production' ) {
    mainMenuTemplate.push({
        label: 'Dev Tools',
        submenu: [
            {
                label: 'Toggle Dev Tools',
                accelerator: process.platform == 'darwin' ? 'Command+D' : 'Ctrl+D',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]
    })
};