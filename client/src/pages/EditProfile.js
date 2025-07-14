import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setUser } from '../redux/slices/authSlice';
import '../styles/EditProfile.css';

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user, isAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите изображение');
        return;
      }

      setAvatar(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Имя обязательно для заполнения');
      return false;
    }
    if (formData.name.trim().length < 2) {
      toast.error('Имя должно содержать минимум 2 символа');
      return false;
    }
    if (formData.name.length > 50) {
      toast.error('Имя не должно превышать 50 символов');
      return false;
    }
    if (!/^[а-яА-Яa-zA-Z\s]+$/.test(formData.name)) {
      toast.error('Имя может содержать только буквы и пробелы');
      return false;
    }
    if (!formData.email.trim()) {
      toast.error('Email обязателен для заполнения');
      return false;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      toast.error('Введите корректный email адрес');
      return false;
    }
    if (formData.phone && !/^(\+7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/.test(formData.phone)) {
      toast.error('Введите корректный номер телефона');
      return false;
    }
    if (formData.newPassword && formData.newPassword.length < 8) {
      toast.error('Новый пароль должен содержать минимум 8 символов');
      return false;
    }
    if (formData.newPassword && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(formData.newPassword)) {
      toast.error('Новый пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру');
      return false;
    }
    if (formData.newPassword && formData.newPassword !== formData.confirmNewPassword) {
      toast.error('Пароли не совпадают');
      return false;
    }
    if (formData.newPassword && !formData.currentPassword) {
      toast.error('Для смены пароля необходимо ввести текущий пароль');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phone', formData.phone);

      if (formData.newPassword && formData.currentPassword) {
        formDataToSend.append('currentPassword', formData.currentPassword);
        formDataToSend.append('newPassword', formData.newPassword);
      }

      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }

      const endpoint = avatar ? '/api/auth/profile' : '/api/auth/profile/basic';
      
      const response = await axios.put(
        `http://localhost:5000${endpoint}`,
        formDataToSend,
        {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );

      dispatch(setUser(response.data.user));
      toast.success('Профиль успешно обновлен');
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach(err => toast.error(err));
      } else {
        toast.error(error.response?.data?.message || 'Ошибка при обновлении профиля');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="edit-profile">
      <div className="edit-profile-container">
        <h1>Редактирование профиля</h1>
        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="avatar-section">
            <h3>Аватар</h3>
            <div className="avatar-upload">
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Превью аватара" />
                ) : user?.avatar ? (
                  <img src={`http://localhost:5000${user.avatar}`} alt="Текущий аватар" />
                ) : (
                  <div className="avatar-placeholder">
                    <span>Нет аватара</span>
                  </div>
                )}
              </div>
              <div className="avatar-upload-controls">
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar" className="btn-upload-avatar">
                  {avatar ? 'Изменить аватар' : 'Загрузить аватар'}
                </label>
                {avatar && (
                  <button
                    type="button"
                    className="btn-remove-avatar"
                    onClick={() => {
                      setAvatar(null);
                      setAvatarPreview(null);
                    }}
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="name">Имя *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ваше имя"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+7 (999) 123-45-67"
            />
            <small className="help-text">Формат: +7 (999) 123-45-67 или 89991234567</small>
          </div>

          <div className="password-section">
            <h3>Изменение пароля</h3>
            <div className="form-group">
              <label htmlFor="currentPassword">Текущий пароль</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Введите текущий пароль"
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">Новый пароль</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Минимум 8 символов"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmNewPassword">Подтвердите новый пароль</label>
              <input
                type="password"
                id="confirmNewPassword"
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleInputChange}
                placeholder="Повторите новый пароль"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={() => navigate('/profile')}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile; 