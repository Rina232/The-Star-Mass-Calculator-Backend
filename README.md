# REST API (Lab 3)


## 1. Коллекция Postman

1. GET список с фильтром
2. POST создание черновика
3. GET получение черновика
4. PUT публикация
5. GET ленты
6. POST лайк
7. DELETE удаление услуги
8. POST регистрация пользователя
9. POST авторизации
10. POST деавторизации

---
## 2. Описание методов

### Домен «Пользователь» — `/api/users`

| # | Метод | URL | Тело запроса | Код ответа | Описание |
|---|---|---|---|---|---|
| 1 | `POST` | `/api/users/register` | `{ "username": string, "password": string }` | `201` | Создаёт пользователя в `star_class_users`. Пароль в ответе не возвращается. |
| 2 | `POST` | `/api/users/login` | — | `200` | Заглушка |
| 3 | `POST` | `/api/users/logout` | — | `200` | Заглушка |

---

### Домен «Услуга» — `/api/star-classes`

| # | Метод | URL | Тело запроса | Код ответа| Описание |
|---|---|---|---|---|---|
| 1 | `GET` | `/api/star-classes?minMass=&maxMass=` | — | `200` | Список только опубликованных классов. У каждой записи `isMine: 0\|1`. |
| 2 | `POST` | `/api/star-classes` | `form-data`: `title`, `image`, `video` | `201` | Создаёт черновик. Файлы грузятся в Minio под латинским именем, у пользователя может быть не больше одного черновика. |
| 3 | `GET` | `/api/star-classes/draft` | — | `200` | Черновик текущего пользователя, id не указывается. |
| 4 | `PUT` | `/api/star-classes/draft/publish` | `{ "description": string, "mass": number, "luminosity": number }` | `200` | Меняет статус draft на published, обратного перехода нет. Публиковать можно только свой черновик. |
| 5 | `GET` | `/api/star-classes/feed?id=&next=true` | — | `200` | Конкретный класс по id, либо следующий за ним, если next=true, с флагом `isLiked: 0\|1`.|
| 6 | `DELETE` | `/api/star-classes/:id` | — | `204` | Soft delete только своего класса. |
| 7 | `POST` | `/api/star-classes/:id/like` | `{ "like": 0 \| 1 }` | `200` | Лайк/снятие лайка от текущего пользователя. |

---

## 3. Структура БД

### `star_class_users`
| Столбец | Тип | Свойство |
|---|---|---|
| `star_class_user_id` | integer | PK |
| `star_class_username` | varchar(50) | UNIQUE |
| `star_class_password` | varchar(50) | |

### `star_classes`
| Столбец | Тип | Свойство |
|---|---|---|
| `star_class_id` | integer | PK |
| `star_class_title` | varchar(150) | |
| `star_class_description` | varchar(500) | NULL |
| `star_class_status` | varchar(20) | draft / published / deleted |
| `star_class_image_url` | varchar(255) | |
| `star_class_video_url` | varchar(255) | |
| `star_class_mass` | numeric(10,2) | NULL |
| `star_class_luminosity` | numeric(12,2) | NULL |
| `star_class_created_at` | timestamp | |
| `star_class_published_at` | timestamp | NULL |
| `star_class_creator_id` | integer | FK |

### `star_class_likes`
| Столбец | Тип | Свойство |
|---|---|---|
| `star_class_like_id` | integer | PK |
| `star_class_user_id` | integer | FK |
| `star_class_id` | integer | FK |

**Связи:** `star_class_users (1) — (∞) star_classes`, `star_class_likes (∞) — (1) star_classes`, `star_class_users (1) — (∞) star_class_likes`.
