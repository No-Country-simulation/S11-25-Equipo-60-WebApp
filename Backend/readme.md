# 📘 Backend for App ✨

- [`📚 Root`](../README.md)/[`📕 Frontend`](../Frontend/README.md)/
- [`📚 Root`](../README.md)/`📘 Backend`/

## 📖 Table of Contents

- [📘 Backend for App ✨](#-backend-for-app-)
  - [📖 Table of Contents](#-table-of-contents)
  - [👀 Motivation 🔝](#-motivation-)
  - [🧰 Technology Stack 🔝](#-technology-stack-)
  - [🤵‍♂️ Team communication channels 🔝](#️-team-communication-channels-)
  - [🧑‍💻 Developer Teams 🔝](#-developer-teams-)
  - [🗃️ Project info 🔝](#️-project-info-)
    - [📚 License 🔝](#-license-)
    - [📚 Workspaces 🔝](#-workspaces-)
    - [📚 Deploy 🔝](#-deploy-)
  - [🛠️ Requirements 🔝](#️-requirements-)
    - [1. Clone the repository from GitHub](#1-clone-the-repository-from-github)
    - [2. Navigate to the backend folder](#2-navigate-to-the-backend-folder)
    - [3. Execute the container](#3-execute-the-container)
    - [4. Open your browser and navigate to http://localhost:3000](#4-open-your-browser-and-navigate-to-httplocalhost3000)
    - [✨ Root Base](#-root-base)
    - [✨ Start Route 🔝](#-start-route-)
    - [⛔ Invalid Route 🔝](#-invalid-route-)
    - [📑 Docs Route 🔝](#-docs-route-)
    - [🔐 Authorization Routes 🔝](#-authorization-routes-)

## 👀 Motivation [🔝](#-backend-for-app-)

The backend of Testimonial CMS is built with Django and PostgreSQL, providing a solid, scalable, and secure foundation for managing testimonials in multiple formats (text, image, and video). It features a role-based authentication system (admin, editor, visitor), a fully documented REST API, and support for moderation, curation, and engagement analytics. It also integrates with external services like YouTube API and Cloudinary for multimedia management, ensuring flexibility and high performance in content-heavy environments.

## 🧰 Technology Stack [🔝](#-backend-for-app-)

[![Python Link](https://img.shields.io/badge/Python-3776AB.svg?style=for-the-badge&logo=Python&logoColor=white 'Python link')](https://www.python.org/)
[![Django link](https://img.shields.io/badge/Django-092E20.svg?style=for-the-badge&logo=Django&logoColor=white, 'Django Link')](https://www.djangoproject.com/)
[![Render link](https://img.shields.io/badge/Render-000000.svg?style=for-the-badge&logo=Render&logoColor=white 'Render link')](https://render.com/)
[![Swagger Link](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black 'Swagger Link')](https://swagger.io/)
[![Markdown Link](https://img.shields.io/badge/Markdown-03a7dd?style=for-the-badge&logo=markdown&logoColor=white 'Markdown Link')](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)
[![Cloudinary Link](https://img.shields.io/badge/cloudinary-%233448C5?style=for-the-badge&logo=cloudinary&logoColor=ffffff 'Cloudinary Link')](https://cloudinary.com/)
[![Zod Link](https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod&logoColor=892CA0&color=313131)](https://zod.dev/ 'Zod Link')
[![JSON_WEB_TOKENS Link](https://img.shields.io/badge/JSON_WEB_TOKENS-212121?style=for-the-badge&logo=jsonwebtokens&logoColor=ffffff 'JSON_WEB_TOKENS Link')](https://jwt.io/)
[![Postgres](https://img.shields.io/badge/Postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff&style=for-the-badge)](https://www.docker.com/)

## 🤵‍♂️ Team communication channels [🔝](#-backend-for-app-)

[![Slack Link](https://img.shields.io/badge/Slack-4A154B?style=for-the-badge&logo=slack&logoColor=white "Slack Link")](https://slack.com) [![Discord Link](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white "Discord Link")](https://discord.com) [![LinkedIn Link](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white "LinkedIn Link")](https://linkedIn.com) [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com/No-Country-simulation/s18-03-m-python-react)

## 🧑‍💻 Developer Teams [🔝](#-backend-for-app-)

| ![Avatar](https://avatars.githubusercontent.com/u/155690817?s=96&v=4) | ![Avatar](https://lh3.googleusercontent.com/a/ACg8ocJECvornhjcgno_fAykj-V5Ccyu7-PXjaqDdhj1Az7zpn3oK1WQ=s96-c?s=96&v=4) | ![Avatar](https://lh3.googleusercontent.com/a/ACg8ocJ5y2QpvGl64LmXRSUeHhHnbdu-JNvVJGQTLcCFcbKhh_wZJSFQRw=s96-c?s=96&v=4) | ![Avatar](https://avatars.githubusercontent.com/u/141883724?s=96&v=4) |
|:-:|:-:|:-:| :-: |
| **Emily Rodríguez** | **Carlos Mario Hernández Gutiérrez**  | **Jose Ortega**  | **Jesus Medina** |
| [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com/EmilySelenia01)[![LinkedIn Link](https://img.shields.io/badge/linkedin%20-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white 'LinkedIn Link')](https://www.linkedin.com) | [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com)[![LinkedIn Link](https://img.shields.io/badge/linkedin%20-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white 'LinkedIn Link')](https://www.linkedin.com) | [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com)[![LinkedIn Link](https://img.shields.io/badge/linkedin%20-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white 'LinkedIn Link')](https://www.linkedin.com) | [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com)[![LinkedIn Link](https://img.shields.io/badge/linkedin%20-%230077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white 'LinkedIn Link')](https://www.linkedin.com) |

## 🗃️ Project info [🔝](#-backend-for-app-)

### 📚 License [🔝](#-backend-for-app-)

| License | [![License Link](https://img.shields.io/badge/MIT-FF0000?style=for-the-badge&logo=amazoniam&logoColor=white "License Link")](./LICENSE.MD) |
| :-: | :-: |

### 📚 Workspaces [🔝](#-backend-for-app-)

|     Name     |   Path   |     Description      |
| :----------: | :------: | :------------------: |
| `🎛️ Backend` | /backend | application Back-End |

### 📚 Deploy [🔝](#-backend-for-app-)

| Description |  Deploy | link |
| :-: | :-: | :-: |
| Backend | [![Vercel Link](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white 'Vercel Link')](https://vercel.com/) |[Back-End](https://github.com/No-Country-simulation/S11-25-Equipo-60-WebApp) |
| Data Base | [![Postgres Link](https://img.shields.io/badge/Postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)| [PostgreSQL](https://github.com/No-Country-simulation/S11-25-Equipo-60-WebApp) |

## 🛠️ Requirements [🔝](#-backend-for-app-)

Make sure you have **Docker** installed. If you don't have it, click [here](https://www.docker.com) to go to the official site and download it.

### 1. Clone the repository from GitHub

```sh
git clone https://github.com/No-Country-simulation/s18-03-m-python-react.git
```

### 2. Navigate to the backend folder

```sh
cd s18-03-m-python-react
```

### 3. Execute the container

```sh
docker-compose up -d --build
```

### 4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)


### ✨ Root Base

[http://localhost:3000](http://localhost:3000)

### ✨ Start Route [🔝](#-backend-for-app-)

| Method | Router  | Endpoint | Documentation | Api Key | Token |
| :----: | :-----: | :------: | :-----------: | :-----: | :---: |
|  Get   |    /    |    ✔️    |      ❌       |   ❌    |  ❌   |
|  Get   |  /api   |    ✔️    |      ❌       |   ❌    |  ❌   |
|  Get   | /api/v1 |    ✔️    |      ❌       |   ❌    |  ❌   |

### ⛔ Invalid Route [🔝](#-backend-for-app-)

| Method | Router | Endpoint | Documentation | Api Key | Token |
| :----: | :----: | :------: | :-----------: | :-----: | :---: |
|  Get   |  /\*   |    ✔️    |      ✔️       |   ❌    |  ❌   |

### 📑 Docs Route [🔝](#-backend-for-app-)

| Method |    Router    | Endpoint | Documentation | Api Key | Token |
| :----: | :----------: | :------: | :-----------: | :-----: | :---: |
|  Get   | /api/v1/docs |    ✔️    |      ✔️       |   ❌    |  ❌   |

### 🔐 Authorization Routes [🔝](#-backend-for-app-)

| Method |     Router     | Endpoint | Documentation | Api Key | Token |
| :----: | :------------: | :------: | :-----------: | :-----: | :---: |
|  Get   | /user/profile  |    ✔️    |      ✔️       |   ✔️    |  ✔️   |
|  Post  | /user/register |    ✔️    |      ✔️       |   ✔️    |  ❌   |
|  Post  |  /user/login   |    ✔️    |      ✔️       |   ✔️    |  ❌   |

