import React from 'react';
import { isAdFree } from '../lib/premium';
import AdSenseUnit from './AdSenseUnit';
import { AD_SLOTS } from '../lib/adsConfig';

const AdPlaceholder = ({ location = "auto" }) => {
    if (isAdFree()) return null;

    const slotMap = {
        'quiz-bottom': AD_SLOTS.quiz,
        'result-bottom': AD_SLOTS.result1,
        home: AD_SLOTS.home,
    };
    const slot = slotMap[location];

    if (slot) {
        return <AdSenseUnit adSlot={slot} location={location} />;
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '100%',
            height: location === 'result-bottom' ? '250px' : '100px',
            backgroundColor: '#f0f0f0',
            border: '1px dashed #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '20px 0',
            color: '#888',
            fontSize: '14px'
        }} className="ad-placeholder">
            <div>
                <p>Advertisement ({location})</p>
                <small>Google AdSense Slot</small>
            </div>
        </div>
    );
};

export default AdPlaceholder;
