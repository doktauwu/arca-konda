// 링크 검증 필요 or 페치 catch 예외 처리
// + emoticons wrapper 클래스 가변으로 변경 가능하도록
// +++ 레포지토리에 깃헙 페이지 xml로 class명 업데이트 가능하게
// +++++ 버전 확인도 가능
// 깃허브페이지에 fetch 요청 거부되지 않는지 보안 사항 확인 필요
const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")
const DOMParser = require("dom-parser")
const { PythonShell } = require("python-shell")
const https = require("https")
const stream = require("stream")
const homeDir = require('os').homedir()
const desktopDir = `${homeDir}/Desktop`;

const conDownloader = async (emoticonPage, emoticonsTitle, convertProcessIndex) => {
    const { success, err = '', results } = await new Promise(
        (rootResolve, rootReject) => {
            // 사전 인자

            // const emoticonPage = "https://arca.live/e/19608?target=title&keyword=%EC%9D%B4%EC%84%B8%EB%8F%8C&p=1";
            // const emoticonsTitle = "sedol"


            // funcs

            const downloadImage = async (url, filename, extension, savePath) => {
                const { success, err = '', results } = await new Promise(
                    (resolve, reject) => {
                        // console.log(url)     download url
                        https.request(url, function (response) {
                            var data = new stream.Transform();
                            response.on('data', function (chunk) {
                                data.push(chunk);
                            });

                            response.on('end', function () {
                                // console.log(savePath + filename)
                                fs.writeFile(savePath + "/" + filename + "." + extension, data.read(), () => { resolve({ success: true }) });

                            });
                        }).end();
                    }
                )
            }


            // 메인


            fetch(emoticonPage).then(data => { return data.text() }).then(html => {
                const parser = new DOMParser;
                const doc = parser.parseFromString(html, "text/html");
                let emoticons = doc.getElementsByClassName("emoticons-wrapper")[0].childNodes.filter(emoticon => emoticon.getAttribute("src") != null || emoticon.getAttribute("data-src") != null);
                emoticons = emoticons.map(node => {
                    if(node.getAttribute("src") != null){
                        return node.getAttribute("src")
                    }
                    else if(node.getAttribute("data-src") != null){
                        return node.getAttribute("data-src")
                    }
                })
                const savePath = `${desktopDir}/${emoticonsTitle}`;
                // const savePath = `./${emoticonsTitle}`;

                try { if (!fs.existsSync(savePath)) { fs.mkdirSync(savePath) } }
                catch (err) { console.log(err) }

                let currentVidIndex = 0

                const processSingleEmoticon = async () => {
                    const { success, err = '', results } = await new Promise(
                        (processSingleEmoticonResolve, processSingleEmoticonReject) => {
                            const fileName = `${currentVidIndex}.${emoticons[currentVidIndex].split(".").pop()}`;
                            downloadImage("https:" + emoticons[currentVidIndex], currentVidIndex, emoticons[currentVidIndex].split(".").pop(), savePath).then(() => {
                                if (emoticons[currentVidIndex].split(".").pop() == "mp4") {
                                    const convertVidToGif = async () => {
                                        const { success, err = '', results } = await new Promise(
                                            (resolve, reject) => {
                                                // !!FOR DEBUG!!    PythonShell.run("./src/convert-to-gif.py", {
                                                PythonShell.run("./resources/app/src/convert-to-gif.py", {
                                                    mode: "text",
                                                    // !!FOR DEBUG!!(use python in src folder)     pythonPath: "./src/python/python.exe",
                                                    // !!FOR DEBUG!!(use python that user installed)     pythonPath: "",
                                                    pythonPath: "./resources/app/src/python/python.exe",
                                                    pythonOptions: ["-u"],
                                                    scriptPath: "",
                                                    args: [path.resolve(`${savePath}/${fileName}`), path.resolve(`${savePath}/${fileName.split(".").shift()}.gif`)]
                                                }, (err, results) => {
                                                    if (err) {
                                                        reject({ success: false, err })
                                                    };
                                                    // console.log(results)    
                                                    resolve({ success: true, results })
                                                })
                                            }
                                        );
                                    }
                                    convertVidToGif().then(() => { }).then(() => {
                                        fs.unlink(`${savePath}/${fileName}`, () => { });
                                        processSingleEmoticonResolve({ success: true });
                                    }).catch(() => {
                                        console.log("converting error occurred");
                                        processSingleEmoticonResolve({ success: false });
                                    })
                                }
                                processSingleEmoticonResolve({ success: false });
                            })
                        })
                }




                const asyncDownloadHandler = async () => {
                    const { success, err = '', results } = await new Promise(
                        (resolve, reject) => {

                            if (emoticons.length - 1 >= currentVidIndex) {
                                processSingleEmoticon().then(() => { currentVidIndex++; asyncDownloadHandler(); resolve({ success: true }) })
                            }
                            else {
                                rootResolve({ success: true, convertProcessIndex })
                            }
                        })
                }
                asyncDownloadHandler()
            }).catch(err => console.log(err))
        })
}

exports.conDownloader = conDownloader