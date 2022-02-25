const { ipcRenderer } = require("electron");
const open = require("open");
const DOMParser = require("dom-parser")
const fileNameCheckRegex = /[\\/:*?"<>|]/
const homeDir = require('os').homedir()
const desktopDir = `${homeDir}/Desktop`;
const childProcess = require('child_process');


let convertProcessIndex = 0;
let convertProcessingQueue = {
}

window.onload = () => {
};


// title bar control

document
    .querySelector(".titlebar__btn-minimize")
    .addEventListener("click", () => {
        document.querySelector("html").classList.add("hide-window")
        setTimeout(() => {
            ipcRenderer.send("titlebar-minimize");
            document.querySelector("html").classList.remove("hide-window")
            // document.querySelector("html").style.animation = "none";
            // document.querySelector("html").style.animationPlayState = "paused";
        }, 150)
        // document.querySelector("html").style.animationPlayState = "running";
        // document.querySelector("html").style.animationIterationCount = 1
    });
document
    .querySelector(".titlebar__btn-close")
    .addEventListener("click", () => {
        ipcRenderer.send("titlebar-close");
    });



// main

const emoticonUrlInput = document.querySelector("#emoticon-url")
const saveFolderNameInput = document.querySelector("#save-folder-name")
const downloadBtn = document.querySelector("#download-btn")
const noticeCardSymbol = document.querySelector(".notice-card__symbol")
const noticeCardText = document.querySelector(".notice-card__text")


// notice card 처리

const noticeCardStatus = {
    info: "./assets/status-icons/status-icon__info.svg",
    warn: "./assets/status-icons/status-icon__warn.svg",
    success: "./assets/status-icons/status-icon__success.svg",
    fail: "./assets/status-icons/status-icon__fail.svg"
}

const noticeCardContent = {
    "0": [noticeCardStatus["warn"], "입력이 올바르지 않습니다"],
    "1": [noticeCardStatus["info"], "다운로드 및 MP4 파일 변환을 하는 중입니다"],
    "2": [noticeCardStatus["warn"], "URL 혹은 폴더명이 유효하지 않습니다"],
    "3": [noticeCardStatus["success"], "변환이 완료되었습니다"]
}


const updateNoticeCard = (contentNum) => {
    noticeCardSymbol.src = noticeCardContent[contentNum][0]
    noticeCardText.textContent = noticeCardContent[contentNum][1]
}


// 입력 + 버튼 처리 

function isValidHttpUrl(string) {
    let url;

    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }

    return url.protocol === "http:" || url.protocol === "https:";
}








// const downloadVideoAndCreateObjURL = async (url) => {
//     const { success, err = '', results } = await new Promise(
//         (rootResolve, rootReject) => {
//             // console.log(url)     download url
//             https.request(url, function (response) {
//                 var data = new stream.Transform();
//                 response.on('data', function (chunk) {
//                     data.push(chunk);
//                 });

//                 response.on('end', function () {
//                     // console.log(savePath + filename)
//                     () => { resolve({ success: true }, URL.createObjectURL(data.blob())) }

//                 });
//             }).end();
//         }
//     )
// }












const downloadBtnHandler = () => {
    let isValid = true
    if (emoticonUrlInput.value.split(".")[0] == "arca") {
        emoticonUrlInput.value = "https://" + emoticonUrlInput.value
    }
    if (emoticonUrlInput.value != "" && isValidHttpUrl(emoticonUrlInput.value) != false) {
    }
    else {
        emoticonUrlInput.classList.add("wrong-input")
        updateNoticeCard(0)
        isValid = false
    }
    if (saveFolderNameInput.value == "" || fileNameCheckRegex.test(saveFolderNameInput.value)) {
        saveFolderNameInput.classList.add("wrong-input")
        updateNoticeCard(0)
        isValid = false
    }
    if (isValid == true) {
        updateNoticeCard(1)
        ipcRenderer.send("request-download", {
            "emoticonUrl": emoticonUrlInput.value,
            "folderName": saveFolderNameInput.value,
            "convertProcessIndex": convertProcessIndex
        })
        convertProcessingQueue[convertProcessIndex] = desktopDir + "/" + saveFolderNameInput.value
        convertProcessIndex++
        fetch(emoticonUrlInput.value).then(data => { return data.text() }).then(rawHtml => {
            const parser = new DOMParser;
            const doc = parser.parseFromString(rawHtml, "text/html");
            // let thumbnailSrc = doc.getElementsByClassName("emoticon")[0].src
            const conTitle = doc.getElementsByClassName("title-row")[0].childNodes[1].innerHTML.split("\n")[1]
            const uploaderName = "업로더 : " + doc.getElementsByClassName("info-row")[0].getElementsByClassName("member-info")[0].childNodes[0].text.split("\n")[1]
            const saleCount = "판매수 : " + doc.getElementsByClassName("article-info")[0].getElementsByClassName("body")[0].innerHTML
            const thumbnailUrl = "https:" + doc.getElementsByClassName("emoticon")[0].getAttribute("src")
            if (thumbnailUrl.split(".").pop() == "mp4") {
                document.getElementsByClassName("con-info__bg-video-thumbnail")[0].src = thumbnailUrl
                document.getElementsByClassName("con-info__bg-video-thumbnail")[0].classList.add("show")
            }
            else {
                document.getElementsByClassName("con-info__bg-video-thumbnail")[0].classList.remove("show")
            }
            document.querySelector(".con-info__title").innerText = conTitle;
            document.querySelector(".con-info__uploader").innerText = uploaderName;
            document.querySelector(".con-info__sale-count").innerText = saleCount;
            document.querySelector(".control-panel__con-info").style.backgroundImage = `url(${thumbnailUrl})`
            emoticonUrlInput.value = ""
            saveFolderNameInput.value = ""
        }).catch(
            () => { updateNoticeCard(2) }
        )

    }
}

const inputChangeHandler = (event) => {
    event.target.classList.remove("wrong-input")
}


emoticonUrlInput.addEventListener("focus", inputChangeHandler)
saveFolderNameInput.addEventListener("focus", inputChangeHandler)

document.querySelector(".header__infos__website").addEventListener("click", () => { console.log("FMIWQJFMQWIFJMIOQWASFJIOAJFIOA"); open("https://konda.doktauwu.com") })


downloadBtn.addEventListener("click", downloadBtnHandler)


ipcRenderer.on("convert-done", (event, queueIndex) => {
    updateNoticeCard(3);
    childProcess.exec(`start "" "${convertProcessingQueue[queueIndex]}"`);
    delete convertProcessingQueue[queueIndex]
})

//열리는 거 처리