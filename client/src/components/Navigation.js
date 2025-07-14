import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { clearCart } from '../redux/slices/cartSlice';

const Navigation = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const { items } = useSelector(state => state.cart);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/');
  };

  return (
    <nav className={`navigation ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-background"></div>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <div className="logo-icon">𖠿</div>
          <span className="logo-text">МАГАЗ</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/products" className={`nav-link ${location.pathname === '/products' ? 'active' : ''}`}>
            <span className="nav-icon">⛟</span>
            <span>Каталог</span>
          </Link>
          
          {isAuthenticated ? (
            <>
              <div className="cart-link-wrapper">
                <Link to="/cart" className={`nav-link cart-link ${location.pathname === '/cart' ? 'active' : ''}`}>
                  <span className="nav-icon">🛒</span>
                  <span>Корзина</span>
                </Link>
                {items.length > 0 && (
                  <span className="cart-badge">{items.length}</span>
                )}
              </div>
              
              <div className="profile-menu" ref={profileMenuRef}>
                <button 
                  className="profile-button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <div className="nav-avatar">
                    {user?.avatar ? (
                      <img src={`http://localhost:5000${user.avatar}`} alt="Аватар" />
                    ) : (
                      <span>{user?.name?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <span className="profile-name">{user?.name || 'Профиль'}</span>
                  <span className="profile-arrow">▼</span>
                </button>
                {showProfileMenu && (
                  <div className="profile-dropdown">
                    <Link to="/profile" onClick={() => setShowProfileMenu(false)}>
                      <span className="dropdown-icon">👤</span>
                      Личный кабинет
                    </Link>
                    <Link to="/profile/edit" onClick={() => setShowProfileMenu(false)}>
                      <span className="dropdown-icon">⚙️</span>
                      Редактировать профиль
                    </Link>
                    {user?.role === 'master' && (
                      <Link to="/add-product" onClick={() => setShowProfileMenu(false)}>
                        <span className="dropdown-icon">➕</span>
                        Добавить товар
                      </Link>
                    )}
                    <button onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}>
                      <span className="dropdown-icon">🚪</span>
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link auth-link ${location.pathname === '/login' ? 'active' : ''}`}>
                <span>Войти</span>
              </Link>
              <Link to="/register" className={`nav-link auth-link register ${location.pathname === '/register' ? 'active' : ''}`}>
                <span>Регистрация</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 