import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUser } from './redux/slices/authSlice';
import Navigation from './components/Navigation';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ProductList from './pages/ProductList';
import ProductDetails from './pages/ProductDetails';
import AddProduct from './pages/AddProduct';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import CardSwap, { Card } from './components/CardSwap';
import Footer from './components/Footer';
import 'react-toastify/dist/ReactToastify.css';
import './styles/ProductDetails.css';
import './styles/Navigation.css'
import './styles/auth.css'
import './styles/profile.css'

const Home = () => (
  <div className="home">
    <div className="hero-section">
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <div className="bubble"></div>
      <h1>Добро пожаловать в онлайн-магазин!</h1>
      <p>Уникальные изделия ручной работы от талантливых мастеров</p>
      <div className="hero-actions">
        <Link to="/products" className="btn-primary">Перейти в каталог</Link>
        <Link to="/register" className="btn-secondary">Стать мастером</Link>
      </div>
    </div>
    
    <div className="features-section">
      <h2>Почему выбирают нас?</h2>
      <div className="features-grid">
        <div className="feature">
          <h3>🎨 Уникальность</h3>
          <p>Каждое изделие создано в единственном экземпляре</p>
        </div>
        <div className="feature">
          <h3>👨‍🎨 Мастера</h3>
          <p>Прямая связь с авторами работ</p>
        </div>
        <div className="feature">
          <h3>🛡️ Качество</h3>
          <p>Тщательная проверка каждого товара</p>
        </div>
      </div>
    </div>

    <div className="card-showcase" style={{ height: '630px', position: 'relative' }}>
      <div className="card-showcase-content">
        <div className="card-showcase-text">
          <h2>𖠚 Наши лучшие товары</h2>
          <p>Откройте для себя уникальные изделия ручной работы от талантливых мастеров</p>
        </div>
        <div className="card-showcase-animation">
          <CardSwap
            cardDistance={100}
            verticalDistance={110}
            delay={4000}
            pauseOnHover={true}
            width={500}
            height={420}
          >
        <Card>
          <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop" alt="Ручная работа" />
          <h3>Деревянные украшения</h3>
          <p>Эксклюзивные изделия из натурального дерева</p>
        </Card>
        <Card>
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=200&fit=crop" alt="Керамика" />
          <h3>Керамические вазы</h3>
          <p>Уникальная керамика ручной работы</p>
        </Card>
        <Card>
          <img src="https://i.pinimg.com/1200x/e7/c1/c8/e7c1c87e758c6167344fd98d8fa76819.jpg?w=300&h=200&fit=crop" alt="Текстиль" />
          <h3>Текстильные изделия</h3>
          <p>Мягкие и уютные вещи для дома</p>
        </Card>
        <Card>
          <img src="https://i.pinimg.com/736x/44/bc/18/44bc18775ed731fcd534fb77eb9fb0bd.jpg?w=300&h=200&fit=crop" alt="Ювелирные изделия" />
          <h3>Ювелирные украшения</h3>
          <p>Элегантные украшения ручной работы</p>
        </Card>
        <Card>
          <img src="https://i.pinimg.com/736x/92/cf/77/92cf7783938121fb89a14eae89a11c86.jpg?w=300&h=200&fit=crop" alt="Свечи" />
          <h3>Ароматические свечи</h3>
          <p>Уютные свечи с натуральными ароматами</p>
        </Card>
      </CardSwap>
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector(state => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('App useEffect - token:', !!token, 'isAuthenticated:', isAuthenticated, 'user:', !!user, 'loading:', loading);
    
    if (token && !isAuthenticated && !user && !loading) {
      console.log('Initializing user authentication...');
      dispatch(getCurrentUser());
    }
  }, [dispatch, isAuthenticated, user, loading]);

  return (
    <div className="App">
      <Navigation />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/add-product" element={<AddProduct />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;