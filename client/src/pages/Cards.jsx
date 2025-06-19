import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Wallet } from 'lucide-react';
import '../styles/Cards.css';

const initialCards = [
  {
    id: 1,
    bank: 'ABSA',
    cardType: 'Gold Cheque',
    cardNumber: '1234567812345678',
    cardHolder: 'Kgaugelo Helen',
    accountnumber: 123456789,
    expiry: '12/26',
    cvv: '123',
  },
  {
    id: 2,
    bank: 'ABSA',
    cardType: 'Savings',
    cardNumber: '8765432187654321',
    cardHolder: 'Kgaugelo Helen',
    accountnumber: 987654321,
    expiry: '09/27',
    cvv: '456',
  },
];

const Cards = () => {
  const [cards] = useState(initialCards);
  const [flippedIds, setFlippedIds] = useState([]);
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [internationalEnabled, setInternationalEnabled] = useState(false);

  const toggleFlip = (id) => {
    setFlippedIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <nav>
          <div className="nav-section">
            <div className="nav-links">
              <Link to="/dashboard" className="nav-link">
                <Wallet className="nav-icon" />
                <span>Back</span>
              </Link>
            </div>
          </div>
        </nav>
      </aside>

      <main className="cards-page">
        <h2><CreditCard size={28} /> Saved Cards</h2>
        <br>
        </br>
        <div className="cards-container">
          {cards.map((card) => {
            const isFlipped = flippedIds.includes(card.id);

            return (
              <div
                key={card.id}
                className={`card ${isFlipped ? 'flipped' : ''}`}
                onClick={() => toggleFlip(card.id)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') toggleFlip(card.id);
                }}
              >
                <div className="card-inner">
                  {/* FRONT */}
                  <div className="card-front">
                    <div className="card-header">
                      <span className="card-type right">{card.cardType}</span>
                    </div>
                    <div className="card-holder-name">{card.cardHolder}</div>
                    <div className="account-number">{card.accountnumber}</div>
                  </div>

                  {/* BACK */}
                  <div className="card-back">
                    <div className="card-bank">{card.bank}</div>
                    <div className="card-number">**** **** **** {card.cardNumber.slice(-4)}</div>
                    <div className="expiry">Exp: {card.expiry}</div>
                    <div className="card-cvv">CVV: {card.cvv}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* GLOBAL TOGGLES */}
        <div className="global-toggles">
          <div className="toggle-option">
            <span>Online Transactions</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={onlineEnabled}
                onChange={() => setOnlineEnabled(!onlineEnabled)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="toggle-option">
            <span>International Transactions</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={internationalEnabled}
                onChange={() => setInternationalEnabled(!internationalEnabled)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cards;
