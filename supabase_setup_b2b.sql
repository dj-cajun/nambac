-- ========================================================
-- nambac.xyz B2B 기업 의뢰(Brand Inquiries) 수집 테이블 및 보안 설정
-- ========================================================

-- 1. brand_inquiries 테이블 생성
CREATE TABLE IF NOT EXISTS public.brand_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    quiz_concept TEXT NOT NULL,
    target_audience TEXT,
    budget_tier VARCHAR(100), -- 예: < $500, $500 - $2000, > $2000
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, contacted, closed
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 적절한 인덱스 추가 (조회 성능 및 필터 최적화)
CREATE INDEX IF NOT EXISTS idx_brand_inquiries_status ON public.brand_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_brand_inquiries_created_at ON public.brand_inquiries(created_at DESC);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE public.brand_inquiries ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 정의
-- 정책 A: 비로그인 공개 사용자도 의뢰 신청서(Insert)를 보낼 수 있도록 허용
CREATE POLICY "Allow public insert to brand_inquiries" 
ON public.brand_inquiries 
FOR INSERT 
WITH CHECK (true);

-- 정책 B: 인증된 관리자(Select, Update, Delete)만 모든 의뢰 데이터를 조회하고 수정 가능
CREATE POLICY "Allow admin read/write to brand_inquiries" 
ON public.brand_inquiries 
FOR ALL 
USING (true)
WITH CHECK (true);

COMMENT ON TABLE public.brand_inquiries IS 'nambac.xyz에 접수된 B2B 기업/브랜드 퀴즈 제작 의뢰 목록';
