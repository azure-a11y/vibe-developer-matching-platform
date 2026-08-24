# AI Builder Group 로컬 실행 안내 (Windows)

## 1. GitHub 저장소

https://github.com/azure-a11y/vibe-developer-matching-platform

## 2. 준비 프로그램

아래 프로그램이 설치되어 있어야 합니다.

* Git
* Node.js
* pnpm

설치 여부 확인:

```bash
git --version
node --version
pnpm --version
```

pnpm이 없다면:

```bash
npm install -g pnpm
```

## 3. 프로젝트 다운로드

PowerShell 또는 터미널에서 실행합니다.

```bash
git clone https://github.com/azure-a11y/vibe-developer-matching-platform.git
cd vibe-developer-matching-platform
```

## 4. 패키지 설치

```bash
pnpm install
```

## 5. 환경변수 설정

Supabase 데이터 및 관리자 기능을 사용하려면 별도로 전달받은 `.env` 환경변수 설정이 필요합니다.

주의:

* `.env` 파일은 GitHub에 업로드하지 않습니다.
* Supabase Key, 관리자 비밀번호, API Key 등을 Git에 커밋하지 않습니다.
* 환경변수는 별도로 전달받아 프로젝트에서 사용하는 위치에 설정합니다.

## 6. 사용자 웹 실행

```bash
pnpm --filter @orca/web dev
```

접속:

`http://localhost:3000`

## 7. 관리자 페이지 실행

새 터미널을 열고 프로젝트 폴더에서:

```bash
pnpm --filter @orca/admin dev
```

접속:

`http://localhost:3001`

## 8. 사용자 웹 + 관리자 동시 실행

터미널 1:

```bash
pnpm --filter @orca/web dev
```

터미널 2:

```bash
pnpm --filter @orca/admin dev
```

접속 주소:

* 사용자 웹: `http://localhost:3000`
* 관리자: `http://localhost:3001`

## 9. 최신 소스 받기

이미 프로젝트를 받은 상태에서 최신 작업을 받을 때:

```bash
git checkout main
git pull origin main
pnpm install
```

그 후 사용자 웹과 관리자 페이지를 다시 실행합니다.

## 참고

실제 작업 저장소:

`azure-a11y/vibe-developer-matching-platform`

`aibuilder-group-omega` 저장소는 목업/참고용 저장소이므로 실제 개발 소스로 사용하지 않습니다.
