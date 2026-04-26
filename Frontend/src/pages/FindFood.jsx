import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/FindFood.css';

function FindFood() {
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter states
  const [filters, setFilters] = useState({
    category: 'all',
    dietaryInfo: [],
    searchTerm: '',
    sortBy: 'newest',
  });

  const categories = [
    { id: 'all', label: 'All Categories' },
    { id: 'vegetables', label: 'Vegetables' },
    { id: 'fruits', label: 'Fruits' },
    { id: 'bakery', label: 'Bakery' },
    { id: 'dairy', label: 'Dairy' },
    { id: 'meat', label: 'Meat/Fish' },
    { id: 'cooked-meals', label: 'Cooked Meals' },
    { id: 'snacks', label: 'Snacks' },
    { id: 'beverages', label: 'Beverages' },
  ];

  const dietaryOptions = [
    { id: 'vegan', label: 'Vegan' },
    { id: 'vegetarian', label: 'Vegetarian' },
    { id: 'glutenFree', label: 'Gluten Free' },
    { id: 'dairyFree', label: 'Dairy Free' },
    { id: 'nutFree', label: 'Nut Free' },
  ];

  // Fetch available foods on component mount
  useEffect(() => {
    fetchAvailableFoods();
  }, []);

  // Filter foods whenever filters change
  useEffect(() => {
    applyFilters();
  }, [foods, filters]);

  const fetchAvailableFoods = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch('/api/donate-food');
      if (!response.ok) {
        throw new Error('Failed to fetch available foods');
      }

      const data = await response.json();
      setFoods(data.donations || []);
      setError('');
    } catch (err) {
      setError('Failed to load available foods. Please try again.');
      console.error(err);
      // Set mock data for demo
      setFoods([
        {
          id: 1,
          foodName: 'Fresh Tomatoes',
          quantity: 5,
          unit: 'kg',
          category: 'vegetables',
          expiryDate: '2026-04-26',
          pickupAddress: '123 Main St, Downtown',
          pickupStartTime: '14:00',
          pickupEndTime: '16:00',
          dietaryInfo: ['vegan', 'glutenFree'],
          status: 'available',
          createdAt: '2026-04-25',
          description: 'Fresh, organic tomatoes from local garden',
          donor: 'John Farmer',
        },
        {
          id: 2,
          foodName: 'Homemade Pasta',
          quantity: 3,
          unit: 'portions',
          category: 'cooked-meals',
          expiryDate: '2026-04-25',
          pickupAddress: '456 Oak Ave, Midtown',
          pickupStartTime: '18:00',
          pickupEndTime: '20:00',
          dietaryInfo: ['vegetarian'],
          status: 'available',
          createdAt: '2026-04-25',
          description: 'Homemade pasta with tomato sauce',
          donor: 'Sarah Kitchen',
        },
        {
          id: 3,
          foodName: 'Fresh Bread',
          quantity: 2,
          unit: 'pieces',
          category: 'bakery',
          expiryDate: '2026-04-25',
          pickupAddress: '789 Pine Rd, Uptown',
          pickupStartTime: '16:00',
          pickupEndTime: '18:00',
          dietaryInfo: ['vegan'],
          status: 'available',
          createdAt: '2026-04-25',
          description: 'Freshly baked sourdough bread',
          donor: 'Mike Bakery',
        },
        {
          id: 4,
          foodName: 'Mixed Fruits',
          quantity: 2,
          unit: 'kg',
          category: 'fruits',
          expiryDate: '2026-04-27',
          pickupAddress: '321 Elm St, Westside',
          pickupStartTime: '10:00',
          pickupEndTime: '12:00',
          dietaryInfo: ['vegan', 'glutenFree', 'dairyFree'],
          status: 'available',
          createdAt: '2026-04-25',
          description: 'Assorted fresh fruits: apples, oranges, bananas',
          donor: 'Emma Market',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = foods;

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(food => food.category === filters.category);
    }

    // Dietary filter
    if (filters.dietaryInfo.length > 0) {
      filtered = filtered.filter(food =>
        filters.dietaryInfo.some(dietary => food.dietaryInfo?.includes(dietary))
      );
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        food =>
          food.foodName.toLowerCase().includes(searchLower) ||
          food.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    if (filters.sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (filters.sortBy === 'expiring-soon') {
      filtered.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    } else if (filters.sortBy === 'closest') {
      // In production, calculate distance using coordinates
      filtered.sort((a, b) => a.pickupAddress.localeCompare(b.pickupAddress));
    }

    setFilteredFoods(filtered);
  };

  const handleCategoryChange = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      category: categoryId,
    }));
  };

  const handleDietaryChange = (dietaryId) => {
    setFilters(prev => ({
      ...prev,
      dietaryInfo: prev.dietaryInfo.includes(dietaryId)
        ? prev.dietaryInfo.filter(item => item !== dietaryId)
        : [...prev.dietaryInfo, dietaryId],
    }));
  };

  const handleSearchChange = (e) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: e.target.value,
    }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({
      ...prev,
      sortBy: e.target.value,
    }));
  };

  const handleClaim = (food) => {
    setSelectedFood(food);
    setShowModal(true);
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();

    try {
      // In production, send claim request to backend
      const response = await fetch('/api/claim-food', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          foodId: selectedFood.id,
          claimantName: e.target.claimantName.value,
          contactPhone: e.target.contactPhone.value,
          notes: e.target.notes.value,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to claim food');
      }

      alert('Success! You have claimed this food. The donor will contact you soon.');
      setShowModal(false);
      setSelectedFood(null);
    } catch (err) {
      alert('Error claiming food: ' + err.message);
    }
  };

  const resetFilters = () => {
    setFilters({
      category: 'all',
      dietaryInfo: [],
      searchTerm: '',
      sortBy: 'newest',
    });
  };

  const getCategoryLabel = (categoryId) => {
    return categories.find(cat => cat.id === categoryId)?.label || categoryId;
  };

  const getDietaryLabels = (dietaryArray) => {
    return dietaryArray
      ?.map(id => dietaryOptions.find(opt => opt.id === id)?.label)
      .filter(Boolean)
      .join(', ') || 'None';
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="page">
      <header>
        <h1>Food Share</h1>
        <nav>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </nav>
      </header>

      <main>
        <section className="find-food-container">
          <div className="find-food-header">
            <h2>Find Available Food</h2>
            <p>Browse and claim available food donations in your area</p>
          </div>

          {/* Search Bar */}
          <div className="search-section">
            <input
              type="text"
              className="search-input"
              placeholder="Search for food by name or description..."
              value={filters.searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <div className="find-food-content">
            {/* Filters Sidebar */}
            <aside className="filters-sidebar">
              <div className="filter-group">
                <h3>Category</h3>
                <div className="filter-options">
                  {categories.map(category => (
                    <label key={category.id} className="filter-label">
                      <input
                        type="radio"
                        name="category"
                        value={category.id}
                        checked={filters.category === category.id}
                        onChange={() => handleCategoryChange(category.id)}
                      />
                      {category.label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <h3>Dietary Info</h3>
                <div className="filter-options">
                  {dietaryOptions.map(option => (
                    <label key={option.id} className="filter-label">
                      <input
                        type="checkbox"
                        checked={filters.dietaryInfo.includes(option.id)}
                        onChange={() => handleDietaryChange(option.id)}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              <button className="reset-filters-btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </aside>

            {/* Main Content */}
            <div className="main-content">
              {/* Sort and Results Count */}
              <div className="results-header">
                <span className="results-count">
                  {filteredFoods.length} food{filteredFoods.length !== 1 ? 's' : ''} available
                </span>
                <select
                  className="sort-select"
                  value={filters.sortBy}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest First</option>
                  <option value="expiring-soon">Expiring Soon</option>
                  <option value="closest">Closest Location</option>
                </select>
              </div>

              {/* Loading State */}
              {isLoading && <div className="loading">Loading available food...</div>}

              {/* Error State */}
              {error && !isLoading && (
                <div className="error-message">
                  {error}
                  <button onClick={fetchAvailableFoods} className="retry-btn">
                    Retry
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredFoods.length === 0 && !error && (
                <div className="empty-state">
                  <p>No food available with the selected filters.</p>
                  <button onClick={resetFilters} className="reset-btn">
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Food Cards Grid */}
              <div className="food-grid">
                {filteredFoods.map(food => (
                  <div key={food.id} className="food-card">
                    <div className="food-header">
                      <h3>{food.foodName}</h3>
                      <span className="category-badge">{getCategoryLabel(food.category)}</span>
                    </div>

                    {food.description && (
                      <p className="food-description">{food.description}</p>
                    )}

                    <div className="food-details">
                      <div className="detail-item">
                        <span className="detail-label">Quantity:</span>
                        <span className="detail-value">
                          {food.quantity} {food.unit}
                        </span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">Expiry Date:</span>
                        <span className={`detail-value ${new Date(food.expiryDate) < new Date() ? 'expired' : ''}`}>
                          {new Date(food.expiryDate).toLocaleDateString()}
                        </span>
                      </div>

                      {food.dietaryInfo && food.dietaryInfo.length > 0 && (
                        <div className="detail-item">
                          <span className="detail-label">Dietary:</span>
                          <span className="detail-value dietary-tags">
                            {food.dietaryInfo.map(tag => (
                              <span key={tag} className="dietary-tag">{tag}</span>
                            ))}
                          </span>
                        </div>
                      )}

                      <div className="detail-item">
                        <span className="detail-label">Pickup Location:</span>
                        <span className="detail-value address">{food.pickupAddress}</span>
                      </div>

                      <div className="detail-item">
                        <span className="detail-label">Pickup Time:</span>
                        <span className="detail-value time">
                          {formatTime(food.pickupStartTime)} - {formatTime(food.pickupEndTime)}
                        </span>
                      </div>

                      {food.donor && (
                        <div className="detail-item">
                          <span className="detail-label">Posted by:</span>
                          <span className="detail-value donor">{food.donor}</span>
                        </div>
                      )}
                    </div>

                    <button
                      className="claim-btn"
                      onClick={() => handleClaim(food)}
                    >
                      Claim This Food
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Claim Modal */}
      {showModal && selectedFood && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Claim Food - {selectedFood.foodName}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <form onSubmit={handleClaimSubmit} className="claim-form">
              <div className="form-group">
                <label htmlFor="claimantName">Your Name *</label>
                <input
                  type="text"
                  id="claimantName"
                  name="claimantName"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Phone Number *</label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Additional Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special requests or questions for the donor..."
                  rows="4"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-confirm">
                  Confirm Claim
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FindFood;
