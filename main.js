const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')
const { conDownloader } = require("./conDownloader")

const createWindow = () => {
    const win = new BrowserWindow({
        useContentSize: true,
        width: 510,
        height: 340,
        transparent: true,
        frame: false,
        resizable: false,
        webPreferences: {
            nodeIntegration: true, contextIsolation: false,
        },
        title: "Konda - 아카콘 다운로더"
    })

    win.loadFile('index.html')
    win.webContents.openDevTools()
    console.log(win.id)
}

app.whenReady().then(() => {
    createWindow()
    ipcMain.on("titlebar-minimize", (evt) => {
        BrowserWindow.fromId(evt.frameId).minimize()
    })
    ipcMain.on("titlebar-close", (evt) => {
        BrowserWindow.fromId(evt.frameId).close()
    })
    ipcMain.on("request-download", (evt, arguments) => {
        conDownloader(arguments["emoticonUrl"], arguments["folderName"], arguments["convertProcessIndex"]).then(() => { BrowserWindow.fromId(evt.frameId).webContents.send("convert-done", arguments["convertProcessIndex"]) })
        // console.log(evt)
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})



    // (function () {

    //     var { remote } = require('remote');
    //     var currentWindow = remote.BrowserWindow.getFocusedWindow();

    //     function init() {
    //         document
    //             .querySelector(".titlebar__btn-minimize")
    //             .addEventListener("click", () => {
    //                 var window = currentWindow.getFocusedWindow();
    //                 window.minimize();
    //             });
    //         document
    //             .querySelector(".titlebar__btn-close")
    //             .addEventListener("click", () => {
    //                 var window = currentWindow.getFocusedWindow();
    //                 window.close();
    //             });
    //     };

    //     document.onreadystatechange = function () {
    //         if (document.readyState == "complete") {
    //             init();
    //         }
    //     };

    // })();