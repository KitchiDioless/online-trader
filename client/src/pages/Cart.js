import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart, updateQuantity } from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';
import { API_URL } from '../utils/constants';

const CartItem = ({ item, onRemove, onQuantityChange }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (item.product.images?.[0]) {
      const imagePath = item.product.images[0];
      const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
      setImageUrl(`${API_URL}/${cleanPath}`);
    }
  }, [item.product.images]);

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img 
          src={imageUrl || '/placeholder.jpg'} 
          alt={item.product.title}
          onError={(e) => {
            if (e.target.src !== '/placeholder.jpg') {
              e.target.src = '/placeholder.jpg';
            }
          }}
        />
      </div>
      <div className="cart-item-info">
        <h3 className="cart-item-title">{item.product.title}</h3>
        <p className="cart-item-description">
          {item.product.description?.length > 100 
            ? `${item.product.description.substring(0, 100)}...` 
            : item.product.description
          }
        </p>
        <p className="cart-item-price">{item.product.price} ₽</p>
      </div>
      <div className="cart-item-actions">
        <div className="quantity-controls">
          <button 
            onClick={() => onQuantityChange(item.product._id, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="quantity-btn"
          >
            -
          </button>
          <span className="quantity-display">{item.quantity}</span>
          <button 
            onClick={() => onQuantityChange(item.product._id, item.quantity + 1)}
            className="quantity-btn"
          >
            +
          </button>
        </div>
        <button 
          onClick={() => onRemove(item.product._id)}
          className="btn-remove"
        >
          Удалить
        </button>
      </div>
      <div className="cart-item-total">
        <strong>{item.product.price * item.quantity} ₽</strong>
      </div>
    </div>
  );
};

const Cart = () => {
  const dispatch = useDispatch();
  const { items, total } = useSelector(state => state.cart);

  const handleRemove = (productId) => {
    dispatch(removeFromCart(productId));
    toast.success('Товар удалён из корзины');
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity < 1) return;
    dispatch(updateQuantity({ productId, quantity }));
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Корзина пуста');
      return;
    }
    toast.info('Функция оформления заказа будет добавлена позже');
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Корзина пуста</h2>
        <p>Добавьте товары из каталога</p>
        <a href="/products" className="btn-primary">
          Перейти в каталог
        </a>
      </div>
    );
  }

  return (
    <div className="cart">
      <h1>Корзина</h1>
      <div className="cart-items">
        {items.map(item => (
          <CartItem
            key={item.product._id}
            item={item}
            onRemove={handleRemove}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-summary-info">
          <p>Товаров в корзине: <strong>{items.length}</strong></p>
          <h3>Итого: <strong>{total} ₽</strong></h3>
        </div>
        <button 
          onClick={handleCheckout}
          className="btn-checkout"
          disabled={items.length === 0}
        >
          Оформить заказ
        </button>
      </div>
    </div>
  );
};

export default Cart; 