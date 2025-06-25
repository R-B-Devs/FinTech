import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Wallet } from 'lucide-react';
import '../styles/Cards.css';

const Cards = () => {
  const [cards, setCards] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [internationalEnabled, setInternationalEnabled] = useState(false);
  const [error, setError] = useState('');

  // Fetch user data from backend using token
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('User not authenticated');
        return;
      }

      try {
        // Decode token to extract user_id
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.user_id;

        const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.user) {
          const fullName = `${data.user.first_name} ${data.user.last_name}`;

          setCards([
            {
              id: 1,
              bank: 'ABSA',
              cardType: 'Gold Cheque',
              cardNumber: '1234567812345678',
              cardHolder: fullName,
              accountnumber: data.user.account_number,
              expiry: '12/26',
              cvv: '123',
              isBlocked: false,
            },
            {
              id: 2,
              bank: 'ABSA',
              cardType: 'Savings',
              cardNumber: '8765432187654321',
              cardHolder: fullName,
              accountnumber: data.user.account_number,
              expiry: '09/27',
              cvv: '456',
              isBlocked: false,
            }
          ]);
        } else {
          setError(data.error || 'Failed to load user');
        }
      } catch (err) {
        setError('Failed to fetch user info');
      }
    };

    fetchUser();
  }, []);

  const toggleFlip = (id) => {
    const card = cards.find((c) => c.id === id);
    if (card?.isBlocked) return;
    setFlippedIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const toggleBlockCard = (id) => {
    setCards((prev) =>
      prev.map((card) =>
        card.id === id ? { ...card, isBlocked: !card.isBlocked } : card
      )
    );
    setFlippedIds((prev) => prev.filter((fid) => fid !== id));
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

        {error && <div className="error">{error}</div>}

        <div className="cards-container">
          {cards.map((card) => {
            const isFlipped = flippedIds.includes(card.id);
            return (
              <div
                key={card.id}
                className={`card ${isFlipped ? 'flipped' : ''} ${card.isBlocked ? 'blocked' : ''}`}
                onClick={() => toggleFlip(card.id)}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') toggleFlip(card.id);
                }}
              >
                <div className="card-inner">
                  <div className="card-front">
                    <div className="card-header">
                      <span className="card-type right">{card.cardType}</span>
                    </div>
                    <div className="card-holder-name">{card.cardHolder}</div>
                    <div className="account-number">{card.accountnumber}</div>
                    {card.isBlocked && (
                      <div className="block-notice">⚠️ This card is blocked</div>
                    )}
                  </div>

                  <div className="card-back">
                    <div className="card-bank">{card.bank}</div>
                    <div className="card-number">**** **** **** {card.cardNumber.slice(-4)}</div>
                    <div className="expiry">Exp: {card.expiry}</div>
                    <div className="card-cvv">CVV: {card.cvv}</div>
                    {card.isBlocked && (
                      <div className="block-message">🔒 Card is blocked</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* GLOBAL TOGGLES */}
        <div className="global-toggles-grid">
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
            <span>Block Card 1</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={cards[0]?.isBlocked}
                onChange={() => toggleBlockCard(cards[0]?.id)}
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

          <div className="toggle-option">
            <span>Block Card 2</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={cards[1]?.isBlocked}
                onChange={() => toggleBlockCard(cards[1]?.id)}
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
