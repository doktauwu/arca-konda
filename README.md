![Banner](https://user-images.githubusercontent.com/98882733/155875986-a76c71be-5a5a-4fa3-afb1-d79e20766f63.png)
# ✨ Konda - 아카라이브 아카콘 다운로더

주요 기능 : 아카콘 자동 다운로드, MP4=> GIF 자동 변환

설치(윈도우) : https://github.com/doktauwu/arca-konda/releases
<br/>
<br/>
<br/>
# 📢 소스코드 이용 안내

npm test 사용을 위해서는 src/conDownloader.js 안의
PythonShell.run 경로 및 pythonPath를 변경해야 합니다
![image](https://user-images.githubusercontent.com/98882733/158053210-94c05d4f-a766-4a40-a698-c4c347d10d3f.png)
필요 파이썬 라이브러리 : moviepy

moviepy 라이브러리 설치 후 파이썬 설치 폴더를 src 폴더 안에 python이라는 이름으로 저장해주세요  
배포 시 src 폴더 안에 파이썬이 없을 경우 사용자가 파이썬 및 라이브러리를 설치하지 않으면 gif 변환이 작동하지 않습니다  
사용 빌더 : electron-builder
