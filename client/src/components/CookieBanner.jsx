import React, { useEffect, useState} from 'react';
import '../styles/CookieBanner.css';

const CookieBanner = () => {
    const [showBanner, setShowBanner] = useState(false);
     
    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setShowBanner(false);
    };

    const handleReject = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        setShowBanner(false);
    };
    if (!showBanner) return null;


  return (
    <div className="cookie-banner">
      <p>
        We use cookies to enhance your experience. You can accept or reject the use of cookies.
      </p>
      <div className="cookie-buttons">
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleReject}>Reject</button>
      </div>
    </div>
  );
};

export default CookieBanner;
    