# 상벌점관리프로그램 &middot; [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/jaycho1214/DIV2CSU/pulls)

**상벌점관리프로그램**는 대한민국 군대 내 종이로 되어있던 아날로그식 일처리를 일정 부분 디지털화 시킨 웹사이트입니다. 부대 실정에 맞게 수정 및 보완하였습니다.

- **상점 관리** (용사 상점 신청 및 간부 상점 승인 등...)

이 서비스는 제2신속대응사단 예하 부대 동아리 **Keyboard Warrior**에 의해 제작된 코드를 바탕으로 **9탄약창 본부중대장 지동진 중위**에 의해 수정, 보완되었습니다.

## 수정 내용
- 상벌점 부여권한 수정(간부 → 중대장)
- 상점/벌점 리스트화(무분별한 상벌점 부여 통제)
- 다중 부여 기능추가
- 자동로그인
- 중대장 상벌점 확인 및 승인 체계구축

## 📋 Tech Stack

- 웹프레임워크: [NextJS](https://nextjs.org/)
- 데이터베이스: [PostgreSQL](https://postgresql.org/)
- SQL Query Builder: [Kysely](https://kysely.dev/)
- 데이터베이스 Schema 관리: [Prisma](https://www.prisma.io/)
- Styling: [Tailwindcss](https://tailwindcss.com/), [Ant Design](https://ant.design/)
- 배포: [Vercel](https://vercel.com/)
- 클라우드 DB: [railway](https://railway.com/)  **Pro Srevice 사용(20$/m)**


## 🎉 웹사이트 Deploy
### 설치 및 Build
```
yarn install
yarn build
```

### 웹사이트가 구동되기 위해 다음 .env 파일이 필요합니다
```
POSTGRES_URL="<POSTGRES_CONNECTION_STRING>"
JWT_SECRET_KEY="<COMPLEX_RANDOM_STRING>"
```

## 👏 How to contribute

이 서비스 오픈소스 웹사이트로, 부대에 적용하고 싶거나 개발에 기여하고 싶으시면 PR 열어주시면 됩니다. 그 외 기타 이슈나 피드백 제안은 아래를 참고해주시면 됩니다.

### 이슈 제보 및 피드백 제안

이슈 또는 피드백은 [다음](https://github.com/Dongjin-1203/9AD-MAIN/issues)에 제보 부탁드립니다.


## 📄 License

상벌점관리서비스는 [MIT License](https://github.com/Dongjin-1203/9AD-MAIN/blob/main/LICENSE)로 자유롭게 이용하시면 됩니다.
