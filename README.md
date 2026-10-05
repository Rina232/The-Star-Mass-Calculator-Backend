# REST API (Lab 3)

Backend на NestJS + PostgreSQL (TypeORM) + Minio. Домен предметной области —
спектральные классы звёзд.

Проект сочетает два слоя:
- **SSR-страницы** (Handlebars) из лабораторных №1-2 — работают как раньше, ничего не меняли;
- **REST API** (`/api/...`) из лабораторной №3 — отдельный слой контроллеров/сервисов для будущего SPA.

---

## 1. Установка и запуск с нуля

### 1.1 Зависимости
```
npm install
npm install class-validator class-transformer
npm install minio multer
npm install --save-dev @types/multer
```

### 1.2 Инфраструктура (Docker)
В `docker-compose.yml` должны быть подняты 3 сервиса: `postgres`, `adminer`, `minio`.
```
docker-compose up -d
docker ps
```
Все три контейнера должны быть в статусе `Up`.

### 1.3 `.env`
```
PORT=3000

DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=star
DB_PASSWORD=1
DB_NAME=star_classes_db

MINIO_ROOT_USER=root
MINIO_ROOT_PASSWORD=rootpassword
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_BUCKET=star-classes
MINIO_USE_SSL=false
```

### 1.4 Миграция и наполнение БД
```
npm run migrate
```
Таблицы заполняются вручную через Adminer (http://localhost:8081) — см. раздел «Структура БД» ниже, какие поля у каждой таблицы.

### 1.5 Запуск
```
npm run start:dev
```
SSR-страницы: http://localhost:3000/star_classes_feed
REST API: http://localhost:3000/api/...

---

## 2. Коллекция Postman

Файл `star-classes-api.postman_collection.json` в корне проекта — импортируйте через
**Postman → Import → выбрать файл**. Внутри:
- переменная `{{baseUrl}}` = `http://localhost:3000`;
- переменная `{{draftId}}` — впишите вручную id своего черновика после запроса №5 (создание), чтобы запросы «Публикация» и «Удаление» сработали;
- 2 папки: **Пользователь** (3 запроса) и **Услуга** (8 запросов) — итого 11, с запасом сверх требуемых 10.

Рекомендуемый порядок прогона для защиты (ровно совпадает с «Скриншоты 1-10» из методички):
1. GET список с фильтром
2. POST добавление услуги (с фото и видео)
3. GET получить черновик
4. PUT публикация
5. GET лента без id
6. GET лента по id `?next=true`
7. POST лайк
8. DELETE удаление
9. POST регистрация нового пользователя

---

## 3. Домен «Пользователь» — `/api/users`

| # | Метод | URL | Тело запроса | Код ответа | Описание |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/users/register` | `{ "username": string, "password": string }` | `201` | Создаёт пользователя в `star_class_users`. Пароль в ответе никогда не возвращается. |
| 2 | `POST` | `/api/users/login` | — | `200` | Заглушка, реальная аутентификация — лабораторная №4. |
| 3 | `POST` | `/api/users/logout` | — | `200` | Заглушка, реальная деавторизация — лабораторная №4. |

---

## 4. Домен «Услуга» — `/api/star-classes`

| # | Метод | URL | Тело запроса | Код ответа | Через что | Описание |
|---|---|---|---|---|---|---|
| 1 | `GET` | `/api/star-classes?minMass=&maxMass=` | — | `200` | ORM | Список **только опубликованных** услуг. У каждой записи `isMine: 0\|1`. |
| 2 | `POST` | `/api/star-classes` | `multipart/form-data`: `title`, `image` (файл), `video` (файл) | `201` | ORM + Minio | Создаёт черновик. Файлы грузятся в Minio под латинским именем, у пользователя может быть не больше одного черновика. |
| 3 | `GET` | `/api/star-classes/draft` | — | `200` | ORM | Черновик текущего пользователя, id не указывается. |
| 4 | `PUT` | `/api/star-classes/:id/publish` | `{ "description": string, "mass": number, "luminosity": number }` | `200` | ORM | Меняет статус `draft → published`. Только свой черновик, обратного перехода нет. |
| 5 | `GET` | `/api/star-classes/feed` | — | `200` | ORM | Первая опубликованная услуга. |
| 6 | `GET` | `/api/star-classes/feed/:id` | — | `200` | ORM | Конкретная опубликованная услуга. |
| 7 | `GET` | `/api/star-classes/feed/:id?next=true` | — | `200` | ORM | Следующая опубликованная услуга после `:id`, по кругу. |
| 8 | `DELETE` | `/api/star-classes/:id` | — | `204` | ORM | Мягкое удаление (`status = 'deleted'`). Только свои услуги. |
| 9 | `POST` | `/api/star-classes/:id/like` | `{ "like": 0 \| 1 }` | `200` | ORM | Лайк/снятие лайка от текущего пользователя. |

Все системные поля (`id`, `status`, `creator_id`, даты) **никогда** не принимаются от клиента — вычисляются на бэкенде через `CurrentUserService` (singleton) и бизнес-логику сервиса.

---

## 5. Структура БД

### `star_class_users`
| Столбец | Тип | Ключ |
|---|---|---|
| `star_class_user_id` | serial | PK |
| `star_class_username` | varchar(50), unique | |
| `star_class_password` | varchar(50) | |

### `star_classes`
| Столбец | Тип | Ключ |
|---|---|---|
| `star_class_id` | serial | PK |
| `star_class_title` | varchar(150) | |
| `star_class_description` | varchar(500), nullable | |
| `star_class_status` | varchar(20) | `draft` / `published` / `deleted` |
| `star_class_image_url` | varchar(255) | |
| `star_class_video_url` | varchar(255) | |
| `star_class_mass` | numeric(10,2), nullable | |
| `star_class_luminosity` | numeric(12,2), nullable | |
| `star_class_created_at` | timestamp | |
| `star_class_published_at` | timestamp, nullable | |
| `star_class_creator_id` | integer | FK → `star_class_users.star_class_user_id` (RESTRICT, без каскада) |

### `star_class_likes`
| Столбец | Тип | Ключ |
|---|---|---|
| `star_class_like_id` | serial | PK |
| `star_class_user_id` | integer | FK → `star_class_users.star_class_user_id` (RESTRICT) |
| `star_class_id` | integer | FK → `star_classes.star_class_id` (RESTRICT) |

Связи: `star_class_users (1) — (∞) star_classes` (создатель), `star_class_users (∞) — (∞) star_classes` через `star_class_likes`.

---

## 6. Архитектурные решения

- **Singleton текущего пользователя** — `src/common/current-user.service.ts`. Обычный `@Injectable()`-класс без указания `scope`; в NestJS это всегда одна инстанция на всё приложение. Все API-методы домена «Услуга» получают id пользователя **только** через него — ни одной захардкоженной константы внутри бизнес-логики.
- **Файлы в Minio, а не на диске сервера.** `multer` держит файл в оперативной памяти (`memoryStorage()`) ровно между приёмом запроса и загрузкой в Minio — на диске NestJS-процесса файл не остаётся ни секунды.
- **Имя файла генерируется на латинице** (`star-classes-filename.util.ts`) — транслитерация кириллицы + уникальный суффикс, независимо от исходного имени и языка названия услуги.
- **В БД хранится полный URL файла**, а не голое имя — так колонки `star_class_image_url`/`star_class_video_url` остаются совместимы с уже работающими hbs-шаблонами лабораторной №1-2 без дополнительной сборки URL на каждой странице. Латинское имя файла всё равно видно как последний сегмент этого URL.
- **Статусы меняются только в одну сторону.** Переход `draft → published` возможен только через `PUT .../publish`, и только если услуга — черновик текущего пользователя (проверяется одним `WHERE` без отдельных `if`). Метода «вернуть в черновик» не существует вообще — это и есть защита от произвольной смены статуса.
- **REST, не RPC.** Ресурс (`/api/star-classes/:id`) — существительное, а не глагол; действие кодируется HTTP-методом (`GET`/`POST`/`PUT`/`DELETE`), а не в самом URL (кроме двух неизбежных исключений — `/feed` и `/draft`, которые на деле являются отдельными *представлениями* одного и того же ресурса, а `/like` — потому что «лайк» не меняет сам ресурс-услугу, а создаёт/удаляет отдельную связь в `star_class_likes`).
