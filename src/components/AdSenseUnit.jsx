import React, { useEffect } from 'react';
import { isAdFree } from '../lib/premium';

const AdSenseUnit = ({
    adSlot, 
    adFormat = "auto", 
    fullWidthResponsive = "true",
    style = { display: 'block' },
    className = "",
    location = "auto"
}) => {
    const pubId = import.meta.env.VITE_ADSENSE_PUB_ID || "ca-pub-7386903584540643";
    const adFree = isAdFree();

    useEffect(() => {
        if (adFree || !pubId || !adSlot) return;
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense push failed", e);
            }
    }, [pubId, adSlot, adFree]);

    if (adFree) return null;

    // If no Publisher ID or Slot ID is provided, show a placeholder in development
    if (!pubId || !adSlot) {
        return (
            <div style={{
                width: '100%',
                backgroundColor: '#f8f9fa',
                border: '1px dashed #dee2e6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '20px 0',
                padding: '20px',
                color: '#adb5bd',
                fontSize: '12px',
                textAlign: 'center',
                minHeight: '100px'
            }} className={`ad-placeholder-v2 ${className}`}>
                <div>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>Ad Slot: {location}</p>
                    <p style={{ margin: '4px 0 0 0', opacity: 0.7 }}>Google AdSense (%VITE_ADSENSE_PUB_ID% missing)</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`adsense-wrapper ${className}`} style={{ margin: '20px 0', overflow: 'hidden' }}>
            <ins className="adsbygoogle"
                 style={style}
                 data-ad-client={pubId}
                 data-ad-slot={adSlot}
                 data-ad-format={adFormat}
                 data-full-width-responsive={fullWidthResponsive}></ins>
        </div>
    );
};

export default AdSenseUnit;
