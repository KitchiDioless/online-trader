import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { API_URL } from '../utils/constants';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct: product, loading, error } = useSelector(state => state.products);
  const { user } = useSelector(state => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchProduct(id));
  }, [dispatch, id]);

  const handleAddToCart = () => {
    console.log('=== DEBUG INFO ===');
    console.log('User:', user);
    console.log('Product owner:', product?.owner);
    console.log('User ID:', user?.id, 'Type:', typeof user?.id);
    console.log('Owner ID:', product?.owner?._id, 'Type:', typeof product?.owner?._id);
    console.log('User ID stringified:', JSON.stringify(user?.id));
    console.log('Owner ID stringified:', JSON.stringify(product?.owner?._id));
    console.log('Direct comparison:', user?.id === product?.owner?._id);
    console.log('String comparison:', String(user?.id) === String(product?.owner?._id));
    console.log('==================');
    
    if (user && product?.owner && user.id === product.owner._id) {
      toast.error('Вы не можете добавить в корзину свой собственный товар!');
      return;
    }
    
    dispatch(addToCart({ product, quantity }));
    toast.success('Товар добавлен в корзину!');
  };

  const isOwner = user && product?.owner && user.id === product.owner._id;

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.jpg';
    const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    return `${API_URL}/${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Загрузка товара...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Ошибка загрузки</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Вернуться в каталог
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="not-found">
        <h2>Товар не найден</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Вернуться в каталог
        </button>
      </div>
    );
  }

  return (
    <div className="product-details">
      <button 
        onClick={() => navigate('/products')} 
        className="btn-back"
      >
        ← Назад в каталог
      </button>

      <div className="product-details-content">
        <div className="product-images">
          <div className="main-image">
            <img
              src={getImageUrl(product.images?.[currentImageIndex])}
              alt={product.title}
              onError={(e) => {
                if (e.target.src !== '/placeholder.jpg') {
                  e.target.src = '/placeholder.jpg';
                }
              }}
            />
          </div>
          {product.images?.length > 1 && (
            <div className="image-thumbnails">
              {product.images.map((image, index) => (
                <img
                  key={index}
                  src={getImageUrl(image)}
                  alt={`${product.title} - изображение ${index + 1}`}
                  className={index === currentImageIndex ? 'active' : ''}
                  onClick={() => setCurrentImageIndex(index)}
                  onError={(e) => {
                    if (e.target.src !== '/placeholder.jpg') {
                      e.target.src = '/placeholder.jpg';
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          <h1>{product.title}</h1>
          <p className="price">{product.price} ₽</p>
          <div className="category">
            Категория: <span>{product.category}</span>
          </div>
          <p className="description">{product.description}</p>
          
          <div className="purchase-section">
            {isOwner ? (
              <div className="owner-notice">
                <p className="owner-message">Это ваш товар. Вы не можете добавить его в корзину.</p>
              </div>
            ) : (
              <>
                <div className="quantity-selector">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="btn-add-cart"
                >
                  Добавить в корзину
                </button>
              </>
            )}
          </div>

          {product.owner?.name && (
            <div className="seller-info">
              <h3>Продавец</h3>
              <div className="seller-details">
                <div className="seller-avatar-large">
                  {product.owner.avatar ? (
                    <img 
                      src={`http://localhost:5000${product.owner.avatar}`} 
                      alt={`Аватар ${product.owner.name}`}
                    />
                  ) : (
                    <span>{product.owner.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <div className="seller-text">
                  <p className="seller-name">{product.owner.name}</p>
                  <p className="seller-role">Мастер</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails; 