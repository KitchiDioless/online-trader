# Online Trader - Платформа для продажи изделий ручной работы

[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-blue.svg)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-red.svg)](https://redis.io/)

## Описание проекта

Online Trader - платформа для продажи изделий ручной работы, где мастера могут размещать свои уникальные товары, а покупатели - находить и приобретать их.

### Основные возможности

- **Регистрация и авторизация** пользователей с ролями (покупатель, мастер)
- **Каталог товаров** с фильтрацией и поиском
- **Корзина покупок** с управлением количеством товаров
- **Профиль пользователя** с возможностью редактирования данных
- **Добавление товаров** для мастеров с загрузкой изображений

## Технологии

### Frontend
- **React 19.1.0** - основная библиотека для UI
- **Redux Toolkit** - управление состоянием приложения
- **React Router** - маршрутизация
- **Axios** - HTTP-клиент для API
- **GSAP** - анимации
- **React Hook Form** - управление формами
- **Yup** - валидация данных
- **React Toastify** - уведомления

### Backend
- **Node.js** - серверная среда
- **Express.js** - веб-фреймворк
- **MongoDB** - база данных
- **Mongoose** - ODM для MongoDB
- **JWT** - аутентификация
- **Bcrypt** - хеширование паролей
- **Multer** - загрузка файлов
- **Redis** - кеширование
- **CORS** - кросс-доменные запросы

### Инфраструктура
- **Docker Compose** - контейнеризация
- **MongoDB** - основная база данных
- **Redis** - кеш и сессии

## Установка и запуск

### Предварительные требования
- Node.js (версия 16 или выше)
- Docker и Docker Compose
- Git

### 1. Клонирование репозитория
```bash
git clone https://github.com/KitchiDioless/online-trader
cd online-trader
```

### 2. Запуск базы данных
```bash
docker-compose up -d
```

### 3. Настройка переменных окружения

Создайте файл `.env` в папке `server/`:
```env
PORT=5000
MONGO_URI=mongodb://root:supersecretpassword@localhost:27017/online-trader?authSource=admin
JWT_SECRET=your_jwt_secret_key
REDIS_URL=redis://localhost:6379
```

### 4. Установка зависимостей

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### 5. Запуск приложения

#### Backend (в папке server/)
```bash
npm start
```

#### Frontend (в папке client/)
```bash
npm start
```

## API Endpoints

### Аутентификация
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход в систему
- `GET /api/auth/me` - получение данных текущего пользователя

### Товары
- `GET /api/products` - получение списка товаров
- `GET /api/products/:id` - получение товара по ID
- `POST /api/products` - создание нового товара (только для мастеров)
- `PUT /api/products/:id` - обновление товара
- `DELETE /api/products/:id` - удаление товара

### Заказы
- `GET /api/orders` - получение списка заказов
- `POST /api/orders` - создание заказа
- `PUT /api/orders/:id` - обновление статуса заказа

## Роли пользователей

- **Покупатель (buyer)** - может просматривать товары, добавлять в корзину, оформлять заказы
- **Мастер (master)** - может создавать и управлять своими товарами
- **Администратор (admin)** - полный доступ к системе

## Особенности интерфейса

- **Адаптивный дизайн** - корректное отображение на всех устройствах
- **Анимации GSAP** - плавные переходы и эффекты
- **Интерактивная галерея** - карусель товаров на главной странице
- **Уведомления** - информативные сообщения о действиях пользователя
- **Валидация форм** - проверка данных на клиенте и сервере

## Безопасность

- **JWT токены** для аутентификации
- **Хеширование паролей** с помощью bcrypt
- **Валидация данных** на сервере
- **CORS настройки** для безопасных запросов
- **Защита маршрутов** с помощью middleware

## Развертывание

```bash
docker-compose up -d
cd server && npm run dev
cd client && npm start
```

---

