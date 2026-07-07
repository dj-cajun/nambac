import { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import {
  ROAST_TRAITS,
  getTraitById,
  buildRoastShareLink,
  parseRoastShareParams,
} from '../../shared/roastData.js';
import { buildRoastOgImageUrl } from '../lib/siteUrl';
import './RoastCardPage.css';

export default function RoastCardPage() {
  const cardRef = useRef(null);
  const [searchParams] = useSearchParams();
  const shared = parseRoastShareParams(searchParams);

  const [friendName, setFriendName] = useState(shared?.name || '');
  const [selectedTraitId, setSelectedTraitId] = useState(shared?.traitId || ROAST_TRAITS[0].id);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentTrait = getTraitById(selectedTraitId);
  const displayName = friendName.trim();

  const ogName = displayName || 'Bạn thân';
  const ogImageUrl = buildRoastOgImageUrl(ogName, selectedTraitId);
  const sharePageUrl = buildRoastShareLink(ogName, selectedTraitId);
  const ogTitle = displayName
    ? `${displayName} vừa bị bóc phốt: ${currentTrait.title} 💳`
    : 'Thẻ đen bóc phốt bạn bè 💳 — nambac.xyz';

  const handleDownload = async () => {
    if (!cardRef.current || !displayName) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `nambac_blacklist_${displayName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      alert('Có lỗi xảy ra khi tạo ảnh — hãy thử chụp màn hình nhé!');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (!displayName) return;
    const url = buildRoastShareLink(displayName, selectedTraitId);
    const text = `💳 ${displayName} — ${currentTrait.emoji} ${currentTrait.title}\n${currentTrait.description.slice(0, 100)}…\nBạn vào làm thẻ trả đũa đi!`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Thẻ đen bóc phốt — nambac.xyz', text, url });
        return;
      } catch {
        /* cancelled */
      }
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      alert('Đã copy — tag bạn thân trên Zalo!');
    } catch {
      alert(url);
    }
  };

  return (
    <div className="roast-generator-page">
      <Helmet>
        <title>Thẻ đen bóc phốt bạn bè 💳 — nambac.xyz</title>
        <meta
          name="description"
          content="Tạo thẻ blacklist roast bạn thân — nhập tên, chọn tội, tải ảnh tag Zalo. Không cần đăng nhập."
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle} />
        <meta
          property="og:description"
          content="Tạo thẻ đen bóc phốt bạn thân — chọn tội, tag Zalo. Vào làm thẻ trả đũa ngay!"
        />
        <meta property="og:url" content={sharePageUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={ogImageUrl} />
      </Helmet>

      <header className="roast-generator-hero">
        <h1>Thẻ đen bóc phốt 💳</h1>
        <p>Nhập tên + chọn tội → tải ảnh → tag bạn thân trên Zalo. Vui thôi nhé!</p>
      </header>

      {shared && (
        <div className="roast-viral-banner">
          Ai đó vừa làm thẻ đen cho <strong>{shared.name}</strong>!
          <br />
          Vào làm thẻ trả đũa hoặc chứng minh bạn không phải đứa đó 👀
        </div>
      )}

      <div className="roast-generator-form">
        <div>
          <label className="roast-generator-label" htmlFor="roast-friend-name">
            Tên đứa bạn muốn bóc phốt
          </label>
          <input
            id="roast-friend-name"
            className="roast-generator-input"
            type="text"
            maxLength={15}
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            placeholder="Nhập tên: Phúc, Minh…"
          />
        </div>

        <div>
          <label className="roast-generator-label" htmlFor="roast-trait">
            Tội danh
          </label>
          <select
            id="roast-trait"
            className="roast-generator-select"
            value={selectedTraitId}
            onChange={(e) => setSelectedTraitId(e.target.value)}
          >
            {ROAST_TRAITS.map((trait) => (
              <option key={trait.id} value={trait.id}>
                {trait.emoji} {trait.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="roast-card-frame">
        <div ref={cardRef} className="roast-blacklist-card">
          <span className="roast-danger-badge">⚠️ Độc hại</span>

          <div>
            <p className="roast-card-header-kicker">Danh sách đen Sài Gòn</p>
            <h2 className="roast-card-header-title">THẺ ĐEN BÓC PHỐT</h2>
          </div>

          <div className="roast-card-body-panel">
            <span className="roast-card-field-label">ĐỐI TƯỢNG</span>
            <span className="roast-card-field-name">
              {displayName || '__________'}
            </span>

            <span className="roast-card-field-label">TỘI DANH CHÍNH</span>
            <span className="roast-card-field-crime">
              {currentTrait.emoji} {currentTrait.description}
            </span>
          </div>

          <div className="roast-card-footer-row">
            <span>Nambac.xyz · Hệ tâm linh AI</span>
            <span>#SAIGON-GENZ-2026</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="roast-download-btn"
        disabled={!displayName || isGenerating}
        onClick={handleDownload}
      >
        <Download size={20} />
        {isGenerating ? 'Đang tạo ảnh…' : 'Tải ảnh dìm về máy'}
      </button>

      <button
        type="button"
        className="roast-share-btn"
        disabled={!displayName}
        onClick={handleShare}
      >
        <Share2 size={18} />
        Gửi Zalo — tag bạn thân
      </button>

      <p className="roast-zalo-hint">
        Nếu không tải được, hãy chụp màn hình lại nhé! (Zalo in-app đôi khi chặn download)
      </p>

      <Link to="/balance" className="roast-link-balance">
        ⚖️ Chơi Chọn 1 trong 2
      </Link>
    </div>
  );
}
