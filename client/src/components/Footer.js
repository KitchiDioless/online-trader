import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>𖠿 Магаз</h3>
          <p>Уникальные изделия ручной работы от талантливых мастеров. Поддерживаем творчество и качество.</p>
          <div className="social-links">
            <a href="#" className="social-link">📘</a>
            <a href="#" className="social-link">📷</a>
            <a href="#" className="social-link">🐦</a>
            <a href="#" className="social-link">📺</a>
          </div>
        </div>
        
        <div className="footer-section">
          <h4>Навигация</h4>
          <ul className="footer-links">
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/products">Каталог</Link></li>
            <li><Link to="/cart">Корзина</Link></li>
            <li><Link to="/profile">Профиль</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Для мастеров</h4>
          <ul className="footer-links">
            <li><Link to="/register">Стать мастером</Link></li>
            <li><Link to="/add-product">Добавить товар</Link></li>
            <li><a href="#">Условия продаж</a></li>
            <li><a href="#">Помощь</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>Поддержка</h4>
          <ul className="footer-links">
            <li><a href="#">Контакты</a></li>
            <li><a href="#">Доставка</a></li>
            <li><a href="#">Возврат</a></li>
            <li><a href="#">FAQ</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>&copy; 2024 Онлайн-магазин. Все права защищены.</p>
          <div className="footer-bottom-links">
            <a href="#">Политика конфиденциальности</a>
            <a href="#">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 