import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { setUser } from '../redux/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);

  const handleBecomeMaster = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/auth/become-master',
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      dispatch(setUser(response.data.user));
      toast.success('Вы стали мастером! Теперь вы можете добавлять товары.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка при смене роли');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="profile-not-auth">
        <h2>Необходима авторизация</h2>
        <p>Войдите в систему, чтобы просмотреть личный кабинет</p>
        <Link to="/login" className="btn-primary">
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="profile">
      <h1>Личный кабинет</h1>
      
      <div className="profile-info">
        <h2>Информация о пользователе</h2>
        <div className="profile-details">
          <div className="profile-avatar">
            {user?.avatar ? (
              <img src={`http://localhost:5000${user.avatar}`} alt="Аватар пользователя" />
            ) : (
              <div className="avatar-placeholder">
                <span>{user?.name?.charAt(0) || 'U'}</span>
              </div>
            )}
          </div>
          <div className="profile-field">
            <label>Имя:</label>
            <span>{user?.name || 'Не указано'}</span>
          </div>
          <div className="profile-field">
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
          <div className="profile-field">
            <label>Роль:</label>
            <span className={`role-${user?.role}`}>
              {user?.role === 'buyer' && 'Покупатель'}
              {user?.role === 'master' && 'Мастер'}
              {user?.role === 'admin' && 'Администратор'}
            </span>
            {user?.role === 'buyer' && (
              <button 
                onClick={handleBecomeMaster}
                className="btn-become-master"
                disabled={loading}
              >
                {loading ? 'Обработка...' : 'Стать мастером'}
              </button>
            )}
          </div>
          {user?.phone && (
            <div className="profile-field">
              <label>Телефон:</label>
              <span>{user.phone}</span>
            </div>
          )}
          <div className="profile-actions">
            <Link to="/profile/edit" className="btn-edit-profile">
              Редактировать профиль
            </Link>
          </div>
        </div>
      </div>
      
      <div className="profile-sections">
        <div className="section">
          <h3>Мои заказы</h3>
          <div className="section-content">
            <p>История ваших заказов</p>
            <div className="placeholder-content">
              <p>Функция будет добавлена позже</p>
            </div>
          </div>
        </div>

        {user?.role === 'master' && (
          <div className="section">
            <h3>Мои товары</h3>
            <div className="section-content">
              <p>Управление вашими товарами</p>
              <Link to="/add-product" className="btn-primary">
                Добавить новый товар
              </Link>
              <div className="placeholder-content">
                <p>Статистика продаж</p>
                <p>Управление заказами</p>
              </div>
            </div>
          </div>
        )}
        
        {user?.role === 'admin' && (
          <div className="section">
            <h3>Админ-панель</h3>
            <div className="section-content">
              <p>Управление сайтом</p>
              <div className="placeholder-content">
                <p>Модерация товаров</p>
                <p>Управление пользователями</p>
                <p>Аналитика продаж</p>
                <p>Настройки системы</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 