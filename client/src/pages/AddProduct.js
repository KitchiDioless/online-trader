import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { PRODUCT_CATEGORIES } from '../utils/constants';

const AddProduct = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: PRODUCT_CATEGORIES[0],
    images: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? value.replace(/[^0-9.]/g, '') : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      toast.error('Максимум 5 изображений');
      return;
    }

    const validFiles = files.filter(file => {
      const isValidSize = file.size <= 5 * 1024 * 1024;
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      if (!isValidSize) toast.error(`Файл ${file.name} слишком большой`);
      if (!isValidType) toast.error(`Файл ${file.name} должен быть в формате JPEG, PNG или WebP`);
      return isValidSize && isValidType;
    });

    setFormData(prev => ({
      ...prev,
      images: validFiles
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Введите название товара');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Введите описание товара');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Введите корректную цену');
      return;
    }

    try {
      setLoading(true);

      const productData = new FormData();
      productData.append('title', formData.title);
      productData.append('description', formData.description);
      productData.append('price', formData.price);
      productData.append('category', formData.category);
      
      formData.images.forEach(image => {
        productData.append('images', image);
      });

      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/products',
        productData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Товар успешно добавлен!');
      navigate('/products');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Ошибка при добавлении товара');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="not-authorized">
        <h2>Необходима авторизация</h2>
        <p>Для добавления товаров необходимо войти в систему</p>
        <button 
          onClick={() => navigate('/login')}
          className="btn-primary"
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="add-product">
      <h1>Добавление нового товара</h1>
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="title">Название товара *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Введите название товара"
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание товара *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Подробно опишите ваш товар"
            rows={5}
            maxLength={2000}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">Цена (₽) *</label>
          <input
            type="text"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Категория</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
          >
            {PRODUCT_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="images">Фотографии товара (до 5 шт.)</label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            multiple
            accept="image/jpeg,image/png,image/webp"
          />
          <small>Максимальный размер файла: 5MB. Форматы: JPEG, PNG, WebP</small>
          {formData.images.length > 0 && (
            <div className="image-preview">
              {Array.from(formData.images).map((file, index) => (
                <div key={index} className="preview-item">
                  <img src={URL.createObjectURL(file)} alt={`Preview ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <button 
          type="submit" 
          className="btn-primary"
          disabled={loading}
        >
          {loading ? 'Добавление...' : 'Добавить товар'}
        </button>
      </form>
    </div>
  );
};

export default AddProduct; 