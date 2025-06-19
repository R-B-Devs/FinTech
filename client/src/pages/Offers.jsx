import React from 'react';
import '../styles/Offers.css';
import { Gift, CreditCard, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const Offers = () => {
  const offers = [
    {
      icon: <Gift size={28} />,
      title: 'Cashback on Groceries',
      description: 'Earn up to 5% cashback on all grocery store purchases this month.',
      badge: 'New',
    },
    {
      icon: <CreditCard size={28} />,
      title: 'Low Interest Credit Card',
      description: 'Enjoy 0% interest on purchases and balance transfers for the first 12 months.',
      badge: 'Exclusive',
    },
    {
      icon: <TrendingUp size={28} />,
      title: 'Investment Bonus',
      description: 'Get a 10% bonus on your first R1,000 investment with Lynq AI.',
      badge: 'Limited Time',
    },
  ];

  return (
    <div className="offers-page">
      <Link to="/" className="nav-link">
            <span className="material-symbols-outlined">arrow_back</span>
            <span>Back</span>
      </Link>
      <h2 className="offers-heading">✨ Special Offers for You</h2>
      <p className="offers-subheading">Save money, earn rewards, and grow your finances.</p>
      <div className="offers-grid">
        {offers.map((offer, index) => (
          <div key={index} className="offer-card">
            <div className="offer-icon">{offer.icon}</div>
            <div className="offer-content">
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <span className="badge">{offer.badge}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Offers;

