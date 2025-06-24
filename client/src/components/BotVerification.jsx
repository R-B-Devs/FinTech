import React, { use State } from 'react';
import '../styles/BotVerification.css';

const handleChange = (e) => {
    const  checked = e.target.checked;
    setIsHuman(checked);
    if (checked && onVerified) {
        onVerified();
    }
};

return (
    <div className="bot-verification">
        <label className="checkbox-label">
            <input
            type="checkbox"
            checked={isHuman}
            onChange={handleChange}
            />
            <span>I am not a robot</span>
        </label>
    </div>
);

export default BotVerification;