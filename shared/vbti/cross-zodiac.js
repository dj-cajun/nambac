import types from './types.vi.json' with { type: 'json' };

export const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Bạch Dương', emoji: '♈' },
  { id: 'taurus', name: 'Kim Ngưu', emoji: '♉' },
  { id: 'gemini', name: 'Song Tử', emoji: '♊' },
  { id: 'cancer', name: 'Cự Giải', emoji: '♋' },
  { id: 'leo', name: 'Sư Tử', emoji: '♌' },
  { id: 'virgo', name: 'Xử Nữ', emoji: '♍' },
  { id: 'libra', name: 'Thiên Bình', emoji: '♎' },
  { id: 'scorpio', name: 'Bọ Cạp', emoji: '♏' },
  { id: 'sagittarius', name: 'Nhân Mã', emoji: '♐' },
  { id: 'capricorn', name: 'Ma Kết', emoji: '♑' },
  { id: 'aquarius', name: 'Bảo Bình', emoji: '♒' },
  { id: 'pisces', name: 'Song Ngư', emoji: '♓' },
];

const ZODIAC_BUFFS = {
  fire: 'cộng buff tự tin và hành động',
  earth: 'cộng buff ổn định và kiên nhẫn',
  air: 'cộng buff social và idea',
  water: 'cộng buff cảm xúc và intuition',
};

const SIGN_ELEMENT = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

export function getCrossZodiac(sbtiCode, zodiacId) {
  const sbti = types[sbtiCode];
  const sign = ZODIAC_SIGNS.find((z) => z.id === zodiacId);
  if (!sbti || !sign) return null;
  const el = SIGN_ELEMENT[zodiacId] || 'air';
  const buff = ZODIAC_BUFFS[el];
  return {
    title: `${sbti.code} × ${sign.name}`,
    sign,
    buff: `${sign.emoji} ${sign.name} ${buff} cho ${sbti.name}.`,
    desc: `Với ${sign.name}, ${sbti.intro} được amplify theo hướng ${el}. `
      + `${sbti.name} trên nền ${sign.name}: vibe Gen Z + horoscope = content viral.`,
  };
}

export function getAllCrossZodiacForType(sbtiCode) {
  return ZODIAC_SIGNS.map((sign) => getCrossZodiac(sbtiCode, sign.id)).filter(Boolean);
}
