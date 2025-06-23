import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/Cards.css';

<Link to="/" className="nav-link">
  <span className="material-symbols-outlined">arrow_back</span>
  <span>Back</span>
</Link>


const savedCards = [
  {
    id: 1,
    cardType: 'Visa',
    cardNumber: '**** **** **** 1234',
    cardHolder: 'Rolivhuwa Muzila',
    expiry: '12/25',
    cvv: '123',
    bank: 'Capitec Bank',
  },
  {
    id: 2,
    cardType: 'MasterCard',
    cardNumber: '**** **** **** 5678',
    cardHolder: 'Rolivhuwa Muzila',
    expiry: '08/24',
    cvv: '456',
    bank: 'FNB',
  },
];

const Cards = () => {
  const [flippedIds, setFlippedIds] = useState([]);

  const toggleFlip = (id) => {
    if (flippedIds.includes(id)) {
      setFlippedIds(flippedIds.filter((fid) => fid !== id));
    } else {
      setFlippedIds([...flippedIds, id]);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar with Back link using Material Symbol */}
      <aside className="sidebar">
        <nav>
          <div className="nav-section">
            <div className="nav-links">
              <Link to="/Dashboard" className="nav-link">
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Back</span>
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="cards-page">
        <h2><CreditCard size={28} /> Saved Cards</h2>
        <p>Click on a card to see more details.</p>

        <div className="cards-container">
          {savedCards.map((card) => {
            const isFlipped = flippedIds.includes(card.id);

            return (
              <div
                key={card.id}
                className={`card ${isFlipped ? 'flipped' : ''}`}
                onClick={() => toggleFlip(card.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleFlip(card.id);
                  }
                }}
              >
                <div className="card-inner">
                  {/* Front Side */}
                  <div className="card-front">
                    <div className="card-header">{card.cardType}</div>
                    <div className="card-number">{card.cardNumber}</div>
                    <div className="card-footer">
                      <span className="card-holder">{card.cardHolder}</span>
                      <span className="expiry">Exp: {card.expiry}</span>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="card-back">
                    <div className="card-bank">{card.bank}</div>
                    <div className="card-cvv">CVV: {card.cvv}</div>
                    <div className="card-note">Keep your CVV confidential</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Cards;
