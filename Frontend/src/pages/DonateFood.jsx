import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/DonateFood.css';

function DonateFood() {
  const navigate = useNavigate();
  const [foodData, setFoodData] = useState({
    foodName: '',
    description: '',
    quantity: '',
    unit: 'portions',
    category: 'vegetables',
    expiryDate: '',
    pickupAddress: '',
    pickupStartTime: '',
    pickupEndTime: '',
    photo: null,
    dietaryInfo: [],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'vegetables',
    'fruits',
    'bakery',
    'dairy',
    'meat',
    'cooked-meals',
    'snacks',
    'beverages',
    'other',
  ];

  const dietaryOptions = [
    { id: 'vegan', label: 'Vegan' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'glutenFree', label: 'Gluten Free' },
    { id: 'dairyFree', label: 'Dairy Free' },
    { id: 'nutFree', label: 'Nut Free' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFoodData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDietaryChange = (id) => {
    setFoodData(prev => ({
      ...prev,
      dietaryInfo: prev.dietaryInfo.includes(id)
        ? prev.dietaryInfo.filter(item => item !== id)
        : [...prev.dietaryInfo, id],
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo size must be less than 5MB');
        return;
      }
      setFoodData(prev => ({
        ...prev,
        photo: file,
      }));
      setError('');
    }
  };

  const validateForm = () => {
    if (!foodData.foodName.trim()) {
      setError('Please enter the food name');
      return false;
    }
    if (!foodData.quantity || foodData.quantity <= 0) {
      setError('Please enter a valid quantity');
      return false;
    }
    if (!foodData.expiryDate) {
      setError('Please select an expiry date');
      return false;
    }
    if (!foodData.pickupAddress.trim()) {
      setError('Please enter a pickup address');
      return false;
    }
    if (!foodData.pickupStartTime || !foodData.pickupEndTime) {
      setError('Please select pickup time window');
      return false;
    }
    if (foodData.pickupStartTime >= foodData.pickupEndTime) {
      setError('Pickup end time must be after start time');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('foodName', foodData.foodName);
      formData.append('description', foodData.description);
      formData.append('quantity', foodData.quantity);
      formData.append('unit', foodData.unit);
      formData.append('category', foodData.category);
      formData.append('expiryDate', foodData.expiryDate);
      formData.append('pickupAddress', foodData.pickupAddress);
      formData.append('pickupStartTime', foodData.pickupStartTime);
      formData.append('pickupEndTime', foodData.pickupEndTime);
      formData.append('dietaryInfo', JSON.stringify(foodData.dietaryInfo));
      
      if (foodData.photo) {
        formData.append('photo', foodData.photo);
      }

      // Send to backend
      const response = await fetch('/api/donate-food', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit donation');
      }

      setSuccess(true);
      setIsLoading(false);

      // Reset form and redirect after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message || 'An error occurred while submitting your donation');
      setIsLoading(false);
    }
  };

  // Get today's date for min expiry date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page">
      <header>
        <h1>Food Share</h1>
        <nav>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </nav>
      </header>

      <main>
        <section className="donate-container">
          <div className="donate-header">
            <h2>Donate Extra Food</h2>
            <p>Help reduce food waste by sharing your extra food with those in need</p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">
              ✓ Your food donation has been posted successfully! Redirecting to dashboard...
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="donate-form">
              {/* Food Information Section */}
              <fieldset className="form-section">
                <legend>Food Information</legend>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="foodName">Food Name *</label>
                    <input
                      type="text"
                      id="foodName"
                      name="foodName"
                      value={foodData.foodName}
                      onChange={handleInputChange}
                      placeholder="e.g., Fresh Tomatoes, Homemade Pasta"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="description">Description</label>
                    <textarea
                      id="description"
                      name="description"
                      value={foodData.description}
                      onChange={handleInputChange}
                      placeholder="Describe the food, ingredients, storage method, etc."
                      rows="3"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">Category *</label>
                    <select
                      id="category"
                      name="category"
                      value={foodData.category}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    >
                      <option value="vegetables">Vegetables</option>
                      <option value="fruits">Fruits</option>
                      <option value="bakery">Bakery</option>
                      <option value="dairy">Dairy</option>
                      <option value="meat">Meat/Fish</option>
                      <option value="cooked-meals">Cooked Meals</option>
                      <option value="snacks">Snacks</option>
                      <option value="beverages">Beverages</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="quantity">Quantity *</label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={foodData.quantity}
                      onChange={handleInputChange}
                      placeholder="Enter quantity"
                      min="1"
                      step="0.5"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="unit">Unit</label>
                    <select
                      id="unit"
                      name="unit"
                      value={foodData.unit}
                      onChange={handleInputChange}
                      disabled={isLoading}
                    >
                      <option value="portions">Portions</option>
                      <option value="kg">kg</option>
                      <option value="liters">Liters</option>
                      <option value="pieces">Pieces</option>
                      <option value="boxes">Boxes</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="expiryDate">Expiry Date *</label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={foodData.expiryDate}
                      onChange={handleInputChange}
                      min={today}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="photo">Add Photo</label>
                    <input
                      type="file"
                      id="photo"
                      name="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={isLoading}
                    />
                    {foodData.photo && (
                      <p className="file-info">✓ {foodData.photo.name}</p>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Dietary Information</label>
                    <div className="checkbox-group">
                      {dietaryOptions.map(option => (
                        <label key={option.id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={foodData.dietaryInfo.includes(option.id)}
                            onChange={() => handleDietaryChange(option.id)}
                            disabled={isLoading}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Pickup Information Section */}
              <fieldset className="form-section">
                <legend>Pickup Information</legend>

                <div className="form-row">
                  <div className="form-group full-width">
                    <label htmlFor="pickupAddress">Pickup Address *</label>
                    <input
                      type="text"
                      id="pickupAddress"
                      name="pickupAddress"
                      value={foodData.pickupAddress}
                      onChange={handleInputChange}
                      placeholder="Enter complete address for pickup"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="pickupStartTime">Pickup Start Time *</label>
                    <input
                      type="time"
                      id="pickupStartTime"
                      name="pickupStartTime"
                      value={foodData.pickupStartTime}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="pickupEndTime">Pickup End Time *</label>
                    <input
                      type="time"
                      id="pickupEndTime"
                      name="pickupEndTime"
                      value={foodData.pickupEndTime}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </fieldset>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={isLoading}>
                  {isLoading ? 'Submitting...' : 'Post Your Donation'}
                </button>
                <Link to="/dashboard" className="btn-cancel">
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}

export default DonateFood;
