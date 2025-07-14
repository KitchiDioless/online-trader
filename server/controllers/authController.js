const User = require('../models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const redis = require('redis');
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

// Подключение к Redis с обработкой ошибок
let redisConnected = false;
redisClient.connect().then(() => {
  console.log('Redis connected successfully in authController');
  redisConnected = true;
}).catch((err) => {
  console.error('Redis connection error in authController:', err);
  redisConnected = false;
});

redisClient.on('error', (err) => {
  console.error('Redis error in authController:', err);
  redisConnected = false;
});

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

const validateRegistration = (data) => {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Имя должно содержать минимум 2 символа');
  } else if (data.name.length > 50) {
    errors.push('Имя не должно превышать 50 символов');
  } else if (!/^[а-яА-Яa-zA-Z\s]+$/.test(data.name)) {
    errors.push('Имя может содержать только буквы и пробелы');
  }

  if (!data.email) {
    errors.push('Email обязателен');
  } else if (!emailRegex.test(data.email)) {
    errors.push('Введите корректный email адрес');
  }

  if (!data.password) {
    errors.push('Пароль обязателен');
  } else if (data.password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  } else if (!passwordRegex.test(data.password)) {
    errors.push('Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру');
  }

  if (data.phone && !phoneRegex.test(data.phone)) {
    errors.push('Введите корректный номер телефона');
  }

  return errors;
};

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    
    const validationErrors = validateRegistration({ email, password, name, phone });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: validationErrors.join(', '),
        errors: validationErrors 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = new User({ 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      name: name.trim(), 
      phone: phone ? phone.trim() : undefined 
    });
    await user.save();

    // TODO: send email for verification
    
    res.status(201).json({ 
      message: 'Регистрация успешна! Проверьте email для подтверждения аккаунта.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Введите корректный email адрес' });
    }
    
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }
    
    // verification (disabled for testing)
    // if (!user.isVerified) {
    //   return res.status(400).json({ message: 'Подтвердите email для входа в аккаунт' });
    // }
    
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    // Сохраняем токен в Redis только если он доступен
    if (redisConnected) {
      try {
    await redisClient.set(
      token, 
      JSON.stringify({ 
        userId: user._id, 
        role: user.role,
        email: user.email 
      }), 
      { EX: 60 * 60 * 24 * 7 } // 7 дней
    );
      } catch (redisError) {
        console.error('Redis set error:', redisError);
        // Продолжаем выполнение даже если Redis недоступен
      }
    } else {
      console.warn('Redis not available, token not cached');
    }

    res.json({ 
      message: 'Вход выполнен успешно',
      token, 
      user: { 
        id: user._id,
        email: user.email, 
        name: user.name, 
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Ошибка сервера при входе' });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(400).json({ message: 'Токен не предоставлен' });
    }

    // Удаляем токен из Redis только если он доступен
    if (redisConnected) {
      try {
    await redisClient.del(token);
      } catch (redisError) {
        console.error('Redis del error:', redisError);
        // Продолжаем выполнение даже если Redis недоступен
      }
    } else {
      console.warn('Redis not available, token not removed from cache');
    }
    res.json({ message: 'Выход выполнен успешно' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Ошибка сервера при выходе' });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    console.log('getCurrentUser called with user:', req.user);
    
    const user = await User.findById(req.user.userId).select('-password');
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const responseData = { 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    };
    
    console.log('Sending response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении данных пользователя' });
  }
};

exports.becomeMaster = async (req, res) => {
  try {
    console.log('=== BecomeMaster Debug ===');
    console.log('Request user:', req.user);
    console.log('User ID:', req.user.userId);
    
    const user = await User.findById(req.user.userId);
    console.log('Found user:', user);
    
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    console.log('Current user role:', user.role);
    
    if (user.role !== 'buyer') {
      console.log('User is not buyer, current role:', user.role);
      return res.status(400).json({ message: 'Вы уже являетесь мастером или администратором' });
    }

    user.role = 'master';
    await user.save();
    console.log('Role changed to master successfully');

    const responseData = { 
      message: 'Роль успешно изменена',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
    
    console.log('Response data:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Error in becomeMaster:', error);
    res.status(500).json({ message: 'Ошибка сервера при смене роли' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    console.log('Update profile request:', { 
      body: req.body, 
      user: req.user, 
      file: req.file,
      bodyKeys: Object.keys(req.body || {}),
      hasBody: !!req.body,
      contentType: req.headers['content-type']
    });
    
    if (!req.body) {
      return res.status(400).json({ message: 'Данные формы не получены' });
    }
    
    const name = req.body?.name || '';
    const email = req.body?.email || '';
    const phone = req.body?.phone || '';
    const currentPassword = req.body?.currentPassword || '';
    const newPassword = req.body?.newPassword || '';
    
    const userId = req.user.userId;

    const errors = [];
    
    if (!name || name.trim().length < 2) {
      errors.push('Имя должно содержать минимум 2 символа');
    } else if (name.length > 50) {
      errors.push('Имя не должно превышать 50 символов');
    } else if (!/^[а-яА-Яa-zA-Z\s]+$/.test(name)) {
      errors.push('Имя может содержать только буквы и пробелы');
    }

    if (!email || !emailRegex.test(email)) {
      errors.push('Введите корректный email адрес');
    }

    if (phone && !phoneRegex.test(phone)) {
      errors.push('Введите корректный номер телефона');
    }

    if (newPassword && newPassword.length < 8) {
      errors.push('Новый пароль должен содержать минимум 8 символов');
    } else if (newPassword && !passwordRegex.test(newPassword)) {
      errors.push('Новый пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру');
    }

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: errors.join(', '),
        errors: errors 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    if (email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: userId } });
      if (emailExists) {
        return res.status(400).json({ message: 'Этот email уже используется' });
      }
    }

    if (newPassword && currentPassword) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Неверный текущий пароль' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    user.name = name;
    user.email = email;
    user.phone = phone;

    if (req.file) {
      console.log('Avatar uploaded:', req.file);
      user.avatar = `/uploads/${req.file.filename}`;
    }

    await user.save();

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isVerified: user.isVerified
    };

    console.log('Profile updated successfully:', userResponse);
    res.json({ message: 'Профиль успешно обновлен', user: userResponse });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении профиля' });
  }
};