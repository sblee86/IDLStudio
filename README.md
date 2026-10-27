# IDL Studio

IDL Studio 오프라인 v0.25의 웹 배포용 저장소입니다.

## 실행

- 웹: 저장소 루트 `index.html`에서 앱을 실행합니다. 외부 CDN이나 빌드가 필요하지 않습니다.
- 로컬: `python3 -m http.server 8000 --bind 127.0.0.1` 실행 후 브라우저로 접속합니다.
- 오프라인 단일 파일: `IDL-Studio.html`을 Chrome/Edge에서 엽니다.
- 소스 수정: `source/`의 JavaScript와 CSS를 편집합니다. 스크립트 추가 시 루트와 source의 index.html을 함께 갱신합니다.


## GitHub Pages

저장소 Settings → Pages → Build and deployment의 Source를 **GitHub Actions**로 설정합니다.
`main` 푸시 또는 Deploy GitHub Pages 워크플로 수동 실행으로 배포합니다.
배포 성공 시 기본 주소는 https://sblee86.github.io/IDLStudio/ 입니다.

작업 폴더 읽기·쓰기는 HTTPS와 File System Access API를 지원하는 Chrome/Edge에서 사용하세요.
사용자가 고른 파일은 브라우저에서 처리하며 서버 업로드 기능은 없습니다.
자세한 기능과 라이선스는 `README_사용방법.txt`, `LICENSE-IDL-Studio.txt`, `source/vendor/`를 참고하세요.
