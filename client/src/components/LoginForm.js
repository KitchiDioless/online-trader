import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const schema = yup.object({
  email: yup
    .string()
    .matches(emailRegex, 'Введите корректный email адрес')
    .required('Email обязателен'),
  password: yup
    .string()
    .min(1, 'Введите пароль')
    .required('Пароль обязателен'),
  rememberMe: yup.boolean(),
});

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const onSubmit = (data) => {
    dispatch(login(data));
  };

  const handleForgotPassword = () => {
    toast.info('Функция восстановления пароля будет добавлена позже');
  };

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-form">
      <h2>Вход в аккаунт</h2>
      <p className="form-subtitle">Войдите, чтобы продолжить покупки</p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="example@email.com"
            className={errors.email ? 'error' : ''}
            autoComplete="email"
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль *</label>
          <div className="password-input-container">
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Введите пароль"
              className={errors.password ? 'error' : ''}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
          {errors.password && <span className="error-message">{errors.password.message}</span>}
        </div>

        <div className="form-options">
          <label className="checkbox-label">
            <input
              {...register('rememberMe')}
              type="checkbox"
            />
            <span className="checkmark"></span>
            Запомнить меня
          </label>
          
          <button
            type="button"
            className="forgot-password"
            onClick={handleForgotPassword}
          >
            Забыли пароль?
          </button>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Вход...' : 'Войти'}
        </button>
      </form>

      <div className="social-login">
        <p className="divider">или войдите через</p>
        <div className="social-buttons">
          <button type="button" className="social-btn google">
            <span>🔍</span> Google
          </button>
          <button type="button" className="social-btn facebook">
            <span>📘</span> Facebook
          </button>
        </div>
      </div>

      <div className="form-footer">
        <p>Нет аккаунта? <a href="/register">Зарегистрироваться</a></p>
      </div>
    </div>
  );
};

export default LoginForm; 