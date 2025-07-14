import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { API_URL, PRODUCT_CATEGORIES } from '../utils/constants';
import '../styles/ProductList.css';
import SplitText from '../components/SplitText';

const SellerPopup = ({ seller, onClose }) => {
  if (!seller) return null;

  return (
    <div className="seller-popup-overlay" onClick={onClose}>
      <div className="seller-popup-content" onClick={e => e.stopPropagation()}>
        <div className="seller-info-header">
          <div className="seller-avatar">
            {seller.avatar ? (
              <img src={`http://localhost:5000${seller.avatar}`} alt={`Аватар ${seller.name}`} />
            ) : (
              <span>{seller.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="seller-details">
            <h4>О продавце</h4>
            <p className="seller-name">{seller.name}</p>
          </div>
        </div>
        <button className="btn-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

const ProductCard = React.memo(({ product }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [showSellerInfo, setShowSellerInfo] = useState(false);
  const { user } = useSelector(state => state.auth);

  const productImageUrl = useMemo(() => {
    if (product.images?.[0]) {
      const imagePath = product.images[0];
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      return `${API_URL}/${cleanPath}`;
    }
    return null;
  }, [product.images]);

  useEffect(() => {
    setImageUrl(productImageUrl);
  }, [productImageUrl]);



  const handleSellerInfo = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowSellerInfo(true);
  }, []);

  return (
    <>
      <Link to={`/products/${product._id}`} className="product-card">
        <div className="product-image">
          <img 
            src={imageUrl || '/placeholder.jpg'}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              if (e.target.src !== '/placeholder.jpg') {
                e.target.src = '/placeholder.jpg';
              }
            }}
          />
        </div>
        <div className="product-info">
          <div className="product-header">
            <h3 className="product-title">{product.title}</h3>
            {product.owner && (
              <button 
                className="btn-seller-avatar"
                onClick={handleSellerInfo}
                title="Информация о продавце"
              >
                {product.owner.avatar ? (
                  <img 
                    src={`http://localhost:5000${product.owner.avatar}`} 
                    alt={`Аватар ${product.owner.name}`}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                {(!product.owner.avatar || product.owner.avatar === '') && (
                  <span>{product.owner.name?.charAt(0) || 'U'}</span>
                )}
              </button>
            )}
          </div>
          <p className="product-description">
            {product.description?.length > 100 
              ? `${product.description.substring(0, 100)}...` 
              : product.description
            }
          </p>
          <div className="product-meta">
            <span className="product-category">{product.category}</span>
            <span className="product-price">{product.price} ₽</span>
          </div>
          <div className="product-actions">
            {user && product.owner && user.id === product.owner._id && (
              <div className="owner-notice-small">
                <span>Ваш товар</span>
              </div>
            )}
          </div>
        </div>
      </Link>
      {showSellerInfo && (
        <SellerPopup 
          seller={product.owner} 
          onClose={() => setShowSellerInfo(false)} 
        />
      )}
    </>
  );
});

const CategoryFilter = React.memo(({ selectedCategory, onCategoryChange }) => {
  const handleCategoryClick = useCallback((category) => {
    onCategoryChange(category);
  }, [onCategoryChange]);

  return (
    <div className="category-filter-buttons">
      <button 
        className={`category-btn ${!selectedCategory ? 'active' : ''}`}
        onClick={() => handleCategoryClick('')}
      >
        Все категории
      </button>
      {PRODUCT_CATEGORIES.map(category => (
        <button
          key={category}
          className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
          onClick={() => handleCategoryClick(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
});

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(state => state.products);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const params = {};
    if (selectedCategory) params.category = selectedCategory;
    if (searchTerm) params.search = searchTerm;
    dispatch(fetchProducts(params));
  }, [dispatch, selectedCategory, searchTerm]);



  const handleSearch = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products;
  }, [products]);

  const handleAnimationComplete = useCallback(() => {
    console.log('All letters have animated!');
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <h2>Загрузка товаров...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Ошибка загрузки</h2>
        <p>{error}</p>
        <button 
          onClick={() => dispatch(fetchProducts())}
          className="btn-retry"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <SplitText
          text="Каталог товаров"
          className="text-2xl font-semibold text-center"
          delay={30}
          duration={0.2}
          ease="power1.out"
          splitType="chars"
          from={{ opacity: 0, y: 15 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-30px"
          textAlign="center"
          onLetterAnimationComplete={handleAnimationComplete}
        />
        <div className="filters">
          <div className="search-bar">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button type="submit">
                <span role="img" aria-label="search">🔍</span>
              </button>
            </form>
          </div>
        </div>
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {!filteredProducts || filteredProducts.length === 0 ? (
        <div className="no-products">
          <h2>Товары не найдены</h2>
          <p>
            {selectedCategory || searchTerm 
              ? 'Попробуйте изменить параметры поиска'
              : 'Пока в каталоге нет товаров'
            }
          </p>
          <button 
            onClick={() => {
              setSelectedCategory('');
              setSearchTerm('');
              dispatch(fetchProducts());
            }}
            className="btn-retry"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList; 