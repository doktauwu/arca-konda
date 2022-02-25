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
            let gifConvertCount = {
                "current": 0,
                "target": 0
            }

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
                let emoticons = doc.getElementsByClassName("emoticons-wrapper")[0].childNodes.filter(emoticon => emoticon.getAttribute("src") != null);
                emoticons = emoticons.map(node => node.getAttribute("src"))
                const savePath = `${desktopDir}/${emoticonsTitle}`;
                // const savePath = `./${emoticonsTitle}`;

                try { if (!fs.existsSync(savePath)) { fs.mkdirSync(savePath) } }
                catch (err) { console.log(err) }


                for (let i = 0; i < emoticons.length; i++) {
                    const fileName = `${i}.${emoticons[i].split(".").pop()}`;
                    downloadImage("https:" + emoticons[i], i, emoticons[i].split(".").pop(), savePath).then(() => {
                        if (emoticons[i].split(".").pop() == "mp4") {
                            const convertVidToGif = async () => {
                                const { success, err = '', results } = await new Promise(
                                    (resolve, reject) => {
                                        gifConvertCount["target"] = gifConvertCount["target"] + 1
                                        PythonShell.run("./resources/app/src/convert-to-gif.py", {
                                            mode: "text",
                                            pythonPath: "./resources/app/src/python/python.exe",
                                            pythonOptions: ["-u"],
                                            scriptPath: "",
                                            args: [path.resolve(`${savePath}/${fileName}`), path.resolve(`${savePath}/${fileName.split(".").shift()}.gif`)]
                                        }, (err, results) => {
                                            if (err) {
                                                gifConvertCount["current"] = gifConvertCount["current"] + 1
                                                if (gifConvertCount["current"] == gifConvertCount["target"]) {
                                                    rootResolve({ success: true, convertProcessIndex })
                                                }
                                                reject({ success: false, err })
                                            };
                                            // console.log(results)    
                                            gifConvertCount["current"] = gifConvertCount["current"] + 1
                                            if (gifConvertCount["current"] == gifConvertCount["target"]) {
                                                rootResolve({ success: true, convertProcessIndex })
                                            }
                                            resolve({ success: true, results })
                                        })
                                    }
                                );
                            }
                            convertVidToGif().then(() => { }).then(() => {
                                fs.unlink(`${savePath}/${fileName}`, () => { })
                            }).catch(() => {
                                console.log("converting error occurred");

                            })
                        }
                        if (emoticons.filter(x => x.split(".").pop() == "mp4").length < 1) {
                            rootResolve({ success: true, convertProcessIndex })
                        }
                    })
                }
            }).catch(err => console.log(err))
        })
}

exports.conDownloader = conDownloader