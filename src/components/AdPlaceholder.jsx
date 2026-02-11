import React from 'react';

const AdPlaceholder = ({ location = "auto" }) => {
    // In development or until AdSense is active, show placeholder
    // Once active, this component can be replaced with actual <ins> tag

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
