const jwt = require('jsonwebtoken');
const redis = require('redis');

// Инициализация Redis-клиента
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Подключение к Redis с обработкой ошибок
let redisConnected = false;
redisClient.connect().then(() => {
  console.log('Redis connected successfully');
  redisConnected = true;
}).catch((err) => {
  console.error('Redis connection error:', err);
  redisConnected = false;
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
  redisConnected = false;
});

// Middleware для проверки авторизации
module.exports = async function (req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Нет токена' });
  }
  
  try {
    // Сначала проверяем подпись токена
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Если Redis недоступен, просто используем JWT payload
    if (!redisConnected) {
      console.warn('Redis not available, using JWT payload directly');
      req.user = payload;
      return next();
    }
    
    // Проверяем токен в Redis
    const cached = await redisClient.get(token);
    if (!cached) {
      return res.status(401).json({ message: 'Недействительный токен' });
    }
    
    req.user = payload;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Ошибка авторизации' });
  }
}; 