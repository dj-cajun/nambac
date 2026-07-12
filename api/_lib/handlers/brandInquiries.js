import { createBrandInquiry } from '../quizDb.js';

const MAX_LEN = {
  company_name: 120,
  contact_person: 80,
  email: 160,
  phone: 40,
  quiz_concept: 1000,
  target_audience: 500,
  budget_tier: 80,
};

function cleanText(value, maxLen) {
  return String(value || '').trim().slice(0, maxLen);
}

function validateInquiry(body) {
  const payload = {
    company_name: cleanText(body.company_name, MAX_LEN.company_name),
    contact_person: cleanText(body.contact_person, MAX_LEN.contact_person),
    email: cleanText(body.email, MAX_LEN.email).toLowerCase(),
    phone: cleanText(body.phone, MAX_LEN.phone),
    quiz_concept: cleanText(body.quiz_concept, MAX_LEN.quiz_concept),
    target_audience: cleanText(body.target_audience, MAX_LEN.target_audience),
    budget_tier: cleanText(body.budget_tier, MAX_LEN.budget_tier),
  };

  if (!payload.company_name || !payload.contact_person || !payload.email || !payload.quiz_concept) {
    return { error: 'Company, contact, email, and quiz concept are required' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return { error: 'Invalid email' };
  }
  return { payload };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const validation = validateInquiry(body);
    if (validation.error) return res.status(400).json({ error: validation.error });

    const result = await createBrandInquiry(validation.payload);
    return res.status(201).json(result);
  } catch (err) {
    console.error('POST /api/brand-inquiries', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
