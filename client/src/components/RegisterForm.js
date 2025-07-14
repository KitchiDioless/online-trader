import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { register as registerUser, clearError, clearRegisterSuccess } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^(\+7|8)?[ ]?\(?[489][0-9]{2}\)?[ ]?[0-9]{3}[ ]?[0-9]{2}[ ]?[0-9]{2}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

const schema = yup.object({
  name: yup
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов')
    .matches(/^[а-яА-Яa-zA-Z\s]+$/, 'Имя может содержать только буквы и пробелы')
    .required('Имя обязательно'),
  
  email: yup
    .string()
    .matches(emailRegex, 'Введите корректный email адрес')
    .required('Email обязателен'),
  
  password: yup
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .matches(passwordRegex, 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру')
    .required('Пароль обязателен'),
  
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Пароли должны совпадать')
    .required('Подтвердите пароль'),
  
  phone: yup
    .string()
    .matches(phoneRegex, 'Введите корректный номер телефона')
    .nullable(),
  
  agreeToTerms: yup
    .boolean()
    .oneOf([true], 'Необходимо согласиться с условиями')
    .required('Необходимо согласиться с условиями'),
});

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, registerSuccess, isAuthenticated } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    mode: 'onChange'
  });

  const onSubmit = (data) => {
    const { confirmPassword, agreeToTerms, ...userData } = data;
    dispatch(registerUser(userData));
  };

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  React.useEffect(() => {
    if (registerSuccess) {
      toast.success('Регистрация успешна! Теперь вы можете войти в аккаунт.');
      reset();
      dispatch(clearRegisterSuccess());
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  }, [registerSuccess, dispatch, reset, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/products');
    }
  }, [isAuthenticated, navigate]);

  if (registerSuccess) {
    return (
      <div className="register-form">
        <div className="success-message">
          <h2>🎉 Регистрация успешна!</h2>
          <p>Ваш аккаунт создан. Сейчас вы будете перенаправлены на страницу входа.</p>
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-form">
      <h2>Регистрация</h2>
      <p className="form-subtitle">Создайте аккаунт для доступа к магазину</p>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="name">Имя *</label>
          <input
            {...register('name')}
            id="name"
            type="text"
            placeholder="Введите ваше имя"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="example@email.com"
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">Телефон</label>
          <input
            {...register('phone')}
            id="phone"
            type="tel"
            placeholder="+7 (999) 123-45-67"
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone.message}</span>}
          <small className="help-text">Формат: +7 (999) 123-45-67 или 89991234567</small>
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль *</label>
          <input
            {...register('password')}
            id="password"
            type="password"
            placeholder="Минимум 8 символов"
            className={errors.password ? 'error' : ''}
          />
          {errors.password && <span className="error-message">{errors.password.message}</span>}
          <small className="help-text">
            Пароль должен содержать минимум 8 символов, включая заглавную букву, строчную букву и цифру
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Подтвердите пароль *</label>
          <input
            {...register('confirmPassword')}
            id="confirmPassword"
            type="password"
            placeholder="Повторите пароль"
            className={errors.confirmPassword ? 'error' : ''}
          />
          {errors.confirmPassword && <span className="error-message">{errors.confirmPassword.message}</span>}
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              {...register('agreeToTerms')}
              type="checkbox"
              className={errors.agreeToTerms ? 'error' : ''}
            />
            <span className="checkmark"></span>
            Я согласен с <a href="/terms" target="_blank">условиями использования</a> и <a href="/privacy" target="_blank">политикой конфиденциальности</a>
          </label>
          {errors.agreeToTerms && <span className="error-message">{errors.agreeToTerms.message}</span>}
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>

      <div className="form-footer">
        <p>Уже есть аккаунт? <a href="/login">Войти</a></p>
      </div>
    </div>
  );
};

export default RegisterForm; 