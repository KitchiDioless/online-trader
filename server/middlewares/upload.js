const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Проверяем/создаем директорию uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Конфигурация хранилища
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Используем абсолютный путь
  },
  filename: function (req, file, cb) {
    // Генерируем уникальное имя файла
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = uniqueSuffix + path.extname(file.originalname);
    console.log('Saving file:', {
      originalName: file.originalname,
      filename: filename,
      destination: uploadsDir
    });
    cb(null, filename);
  }
});

// Фильтр файлов
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    console.log('File accepted:', {
      originalName: file.originalname,
      mimetype: file.mimetype
    });
    cb(null, true);
  } else {
    console.log('File rejected:', {
      originalName: file.originalname,
      mimetype: file.mimetype
    });
    cb(new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG и WebP'), false);
  }
};

// Обработка ошибок multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Размер файла не должен превышать 5MB' });
    }
    return res.status(400).json({ message: 'Ошибка при загрузке файла' });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Создаем middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Максимум 5 файлов
  }
});

// Middleware для обработки multipart данных без файлов
const uploadNone = multer().none();

module.exports = { upload, uploadNone, handleMulterError }; 