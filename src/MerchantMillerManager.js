import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './MerchantMillerManager.css';

export default function MerchantMillerManager() {
  // Load saved data from localStorage
  const [merchants, setMerchants] = useState(() => {
    const savedMerchants = localStorage.getItem('merchants');
    return savedMerchants ? JSON.parse(savedMerchants) : [];
  });
  
  const [millers, setMillers] = useState(() => {
    const savedMillers = localStorage.getItem('millers');
    return savedMillers ? JSON.parse(savedMillers) : [];
  });
  
  const [newMerchant, setNewMerchant] = useState('');
  const [newMiller, setNewMiller] = useState('');
  const [searchMerchant, setSearchMerchant] = useState('');
  const [searchMiller, setSearchMiller] = useState('');

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('merchants', JSON.stringify(merchants));
  }, [merchants]);
  
  useEffect(() => {
    localStorage.setItem('millers', JSON.stringify(millers));
  }, [millers]);

  // Add new merchant
  const addMerchant = () => {
    if (newMerchant.trim() !== '') {
      setMerchants([...merchants, newMerchant.trim()]);
      setNewMerchant('');
    }
  };

  // Add new miller
  const addMiller = () => {
    if (newMiller.trim() !== '') {
      setMillers([...millers, newMiller.trim()]);
      setNewMiller('');
    }
  };

  // Delete merchant
  const deleteMerchant = (index) => {
    const updatedMerchants = [...merchants];
    updatedMerchants.splice(index, 1);
    setMerchants(updatedMerchants);
  };

  // Delete miller
  const deleteMiller = (index) => {
    const updatedMillers = [...millers];
    updatedMillers.splice(index, 1);
    setMillers(updatedMillers);
  };

  // Filter merchants based on search
  const filteredMerchants = merchants.filter(merchant => 
    merchant.toLowerCase().includes(searchMerchant.toLowerCase())
  );

  // Filter millers based on search
  const filteredMillers = millers.filter(miller => 
    miller.toLowerCase().includes(searchMiller.toLowerCase())
  );

  return (
    <div className="manager-container">
      <h2 className="manager-heading">✨ Merchant & Miller Manager ✨</h2>
      
      <div className="manager-nav">
        <Link to="/" className="nav-button">Back to Bill Generator</Link>
      </div>
      
      <div className="manager-grid">
        {/* Merchant Management */}
        <div className="manager-section">
          <h3 className="section-heading">🛒 Manage Merchants</h3>
          
          <div className="add-form">
            <input
              type="text"
              value={newMerchant}
              onChange={(e) => setNewMerchant(e.target.value)}
              placeholder="Enter merchant name"
              className="add-input"
            />
            <button onClick={addMerchant} className="add-button">Add Merchant</button>
          </div>
          
          <div className="search-form">
            <input
              type="text"
              value={searchMerchant}
              onChange={(e) => setSearchMerchant(e.target.value)}
              placeholder="Search merchants..."
              className="search-input"
            />
          </div>
          
          <div className="items-list">
            {filteredMerchants.length > 0 ? (
              filteredMerchants.map((merchant, index) => (
                <div key={index} className="item">
                  <span className="item-name">{merchant}</span>
                  <button 
                    onClick={() => deleteMerchant(merchants.indexOf(merchant))} 
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="no-items">No merchants found</p>
            )}
          </div>
        </div>
        
        {/* Miller Management */}
        <div className="manager-section">
          <h3 className="section-heading">🏭 Manage Millers</h3>
          
          <div className="add-form">
            <input
              type="text"
              value={newMiller}
              onChange={(e) => setNewMiller(e.target.value)}
              placeholder="Enter miller name"
              className="add-input"
            />
            <button onClick={addMiller} className="add-button">Add Miller</button>
          </div>
          
          <div className="search-form">
            <input
              type="text"
              value={searchMiller}
              onChange={(e) => setSearchMiller(e.target.value)}
              placeholder="Search millers..."
              className="search-input"
            />
          </div>
          
          <div className="items-list">
            {filteredMillers.length > 0 ? (
              filteredMillers.map((miller, index) => (
                <div key={index} className="item">
                  <span className="item-name">{miller}</span>
                  <button 
                    onClick={() => deleteMiller(millers.indexOf(miller))} 
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <p className="no-items">No millers found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}