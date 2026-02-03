export const quizzes = [
  {
    id: '1',
    type: 'Survival',
    title: '호치민 로컬 생존력 테스트',
    description: '당신의 호치민 적응력을 3개의 질문으로 완벽하게 분석합니다. 당신은 현지인일까요, 영원한 관광객일까요?',
    status: 'visible',
    questions: [],
    results: [],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    type: 'Love',
    title: '호치민 1군 카페 족제비 전생 테스트',
    description: '에어팟 맥스 끼고 코딩하던 당신... 사실은 콩카페 족제비였다?',
    status: 'visible',
    questions: [],
    results: [],
    createdAt: '2024-01-18'
  },
  {
    id: '3',
    type: 'Trendy',
    title: '밤문화 트렌드 2026',
    description: '2026년 호치민 밤문화 리더는 누구? 당신의 뱁파이어 스타일을 분석합니다.',
    status: 'hidden',
    questions: [],
    results: [],
    createdAt: '2024-01-20'
  }
];

export const questions = {
  '1': [
    {
      id: 'q1-1',
      quiz_id: '1',
      order_number: 1,
      question_text: '벤탄 시장에서 상인이 "50만동!"을 외쳤다. 당신의 반응은?',
      option_a: '오케이, 쿨거래 (호구형)',
      option_b: '"20만동 아니면 안사요" 뒤도 안보고 걷기 (고수형)',
      score_a: 0,
      score_b: 1,
      image_url: 'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q1-2',
      quiz_id: '1',
      order_number: 2,
      question_text: '오토바이 택시(Grab)가 역주행을 시작했다.',
      option_a: '비명을 지르며 기사님 어깨를 잡는다 (겁쟁이)',
      option_b: '자연스럽게 풍경을 감상하며 스릴을 즐긴다 (현지인)',
      score_a: 0,
      score_b: 2,
      image_url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q1-3',
      quiz_id: '1',
      order_number: 3,
      question_text: '점심 메뉴로 무엇을 먹을까?',
      option_a: '에어컨 빵빵한 일본 라멘집 (안전지향)',
      option_b: '목욕탕 의자에 앉아 먹는 길거리 껌땀 (도전지향)',
      score_a: 0,
      score_b: 4,
      image_url: 'https://images.unsplash.com/photo-1511690656952-34342d2c2ace?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q1-4',
      quiz_id: '1',
      order_number: 4,
      question_text: '[보너스] 콩카페에서 주문할 메뉴는?',
      option_a: '코코넛 커피',
      option_b: '쓰어다',
      score_a: 0,
      score_b: 0,
      image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q1-5',
      quiz_id: '1',
      order_number: 5,
      question_text: '[보너스] 갑자기 비가 쏟아진다(스콜). 당신은?',
      option_a: '건물 안으로 피신한다',
      option_b: '우비 입고 빗속을 뚫는다',
      score_a: 0,
      score_b: 0,
      image_url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=500&q=60'
    }
  ],
  '2': [
    {
      id: 'q2-1',
      quiz_id: '2',
      order_number: 1,
      question_text: '카페에 들어서자마자 당신이 찾는 것은?',
      option_a: '에어컨 바람 잘 오는 명당',
      option_b: '콘센트 옆 구석자리',
      score_a: 0,
      score_b: 1,
      image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q2-2',
      quiz_id: '2',
      order_number: 2,
      question_text: '옆자리 사람이 너무 시끄럽다면?',
      option_a: '에어팟 맥스 노캔 풀가동',
      option_b: '같이 떠들어서 기선제압',
      score_a: 0,
      score_b: 2,
      image_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q2-3',
      quiz_id: '2',
      order_number: 3,
      question_text: '2시간째 주문을 안 했다면 당신의 선택은?',
      option_a: '미안해서 연유커피 추가 주문',
      option_b: '직원이랑 눈싸움하며 버티기',
      score_a: 0,
      score_b: 4,
      image_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q2-4',
      quiz_id: '2',
      order_number: 4,
      question_text: '[보너스] 갑자기 맥북 배터리가 5% 남았다!',
      option_a: '침착하게 충전기 꺼내기',
      option_b: '코딩하는 척하며 전원 끄기',
      score_a: 0,
      score_b: 0,
      image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q2-5',
      quiz_id: '2',
      order_number: 5,
      question_text: '[보너스] 당신의 전생이 느껴지는 순간은?',
      option_a: '원두 냄새가 향수처럼 느껴질 때',
      option_b: '좁은 자리에 웅크려 앉아있을 때',
      score_a: 0,
      score_b: 0,
      image_url: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=500&q=60'
    }
  ],
  '3': [
    {
      id: 'q3-1',
      quiz_id: '3',
      order_number: 1,
      question_text: '금요일 밤, 클럽에 입장하자마자 먼저 하는 행동은?',
      option_a: '테이블에서 술 한잔 마시며 분위기 파악',
      option_b: '댄스플로어 중앙으로 직행',
      score_a: 0,
      score_b: 1,
      image_url: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q3-2',
      quiz_id: '3',
      order_number: 2,
      question_text: 'DJ가 당신이 좋아하는 곡을 틀었다!',
      option_a: '스마트폰 꺼내서 촬영',
      option_b: '망설임 없이 댄스플로어로 돌진',
      score_a: 0,
      score_b: 2,
      image_url: 'https://images.unsplash.com/photo-1571266028243-3716f02d2d2e?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q3-3',
      quiz_id: '3',
      order_number: 3,
      question_text: '새벽 4시, 그룹이 "뭐 할까?"라고 물어볼 때',
      option_a: '그래도 집에 가야겠다',
      option_b: '애쉬까지 가서 계속!',
      score_a: 0,
      score_b: 4,
      image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q3-4',
      quiz_id: '3',
      order_number: 4,
      question_text: '[보너스] 당신의 필수 룩은?',
      option_a: '심플한 블랙/화이트',
      option_b: '색감 넘치는 네온 스타일',
      score_a: 0,
      score_b: 0,
      image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=60'
    },
    {
      id: 'q3-5',
      quiz_id: '3',
      order_number: 5,
      question_text: '[보너스] 다음날 아침 가장 먼저 하는 일은?',
      option_a: '물 한 잔 마시고 수면 보충',
      option_b: '밤새 사진 올리고 태그 확인',
      score_a: 0,
      score_b: 0,
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=60'
    }
  ]
};

export const quizResults = {
  '1': [
    {
      result_code: 0,
      quiz_id: '1',
      title: '영원한 관광객',
      description: '당신은 아직 호치민의 낯선 방향지시판 앞에서 길을 찾는 중입니다. 하지만 그 순수함이 매력!',
      image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=tourist',
      traits: ['안전지향', '계획형', '신중함']
    },
    {
      result_code: 1,
      quiz_id: '1',
      title: '초보 현지인',
      description: '시도는 하지만 아직 실수가 많습니다. 호구 표지판? 아직은 아니에요!',
      image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=beginner',
      traits: ['도전지향', '계획형', '신중함']
    },
    {
      result_code: 2,
      quiz_id: '1',
      title: '안전한 현지인',
      description: '기본적인 생존력은 갖췄지만 아직은 안전한 영역에 머물러 있습니다.',
      image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=safe',
      traits: ['안전지향', '즉흥형', '신중함']
    },
    {
      result_code: 3,
      quiz_id: '1',
      title: '발전 중인 현지인',
      description: '이제야 비로소 호치민의 맛을 알기 시작했습니다. 앞으로가 기대됩니다!',
      image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=growing',
      traits: ['도전지향', '즉흥형', '신중함']
    },
    {
      result_code: 4,
      quiz_id: '1',
      title: '가성비 사냥꾼',
      description: '벤탄 시장은 당신의 놀이터입니다. 가격 흥정의 달인!',
      image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bargain',
      traits: ['안전지향', '계획형', '도전지향']
    },
    {
      result_code: 5,
      quiz_id: '1',
      title: '슈퍼 현지인',
      description: '이제 호구는 커녕 상인이 당신을 두려워합니다. 완벽한 절약술사!',
      image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=super',
      traits: ['도전지향', '계획형', '도전지향']
    },
    {
      result_code: 6,
      quiz_id: '1',
      title: '로컬 애호가',
      description: '길거리 음식부터 오토바이까지, 당신은 이미 현지인처럼 살아갑니다.',
      image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=local',
      traits: ['안전지향', '즉흥형', '도전지향']
    },
    {
      result_code: 7,
      quiz_id: '1',
      title: '호치민 만렙 족제비',
      description: '당신은 이미 사이공의 매연을 향수로 느끼는 경지에 올랐군요! 레전드!',
      image_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=legend',
      traits: ['도전지향', '즉흥형', '도전지향']
    }
  ],
  '2': [
    {
      result_code: 0,
      quiz_id: '2',
      title: '안전한 카페 거주민',
      description: '에어컨 빵빵한 자리는 당신의 성지입니다. 안락함이 최고!',
      image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=safe-cafe',
      traits: ['안락함 추구', '계획형', '신중함']
    },
    {
      result_code: 1,
      quiz_id: '2',
      title: '콘센트 수집가',
      description: '충전기 위치 외워두는 게 취미인 당신. 실용주의자!',
      image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=outlet',
      traits: ['실용주의', '계획형', '신중함']
    },
    {
      result_code: 2,
      quiz_id: '2',
      title: '소음 차단 마스터',
      description: '노캔이 당신의 방패입니다. 어디서든 집중 가능!',
      image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noise-cancel',
      traits: ['안락함 추구', '즉흥형', '신중함']
    },
    {
      result_code: 3,
      quiz_id: '2',
      title: '사교적 카페러',
      description: '혼자가 아닌 함께! 카페에서도 인싸 파워 발산!',
      image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=social',
      traits: ['사교적', '즉흥형', '신중함']
    },
    {
      result_code: 4,
      quiz_id: '2',
      title: '양심적 카페러',
      description: '오래 먹었으면 무엇이라도 사는게 예의! 당신은 모범생!',
      image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=conscience',
      traits: ['안락함 추구', '계획형', '배려심']
    },
    {
      result_code: 5,
      quiz_id: '2',
      title: '쿨한 잠수함',
      description: '주문 안해도 당당하게 버티는 당신. 배짱이 장땡!',
      image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cool',
      traits: ['실용주의', '계획형', '배려심']
    },
    {
      result_code: 6,
      quiz_id: '2',
      title: '박명수 카페러',
      description: '기회는 잡는 사람의 것! 박명수 모드 ON!',
      image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bak',
      traits: ['안락함 추구', '즉흥형', '배려심']
    },
    {
      result_code: 7,
      quiz_id: '2',
      title: '호치민 1군 카페 족제비',
      description: '당신은 이미 콩카페 DNA를 물려받았습니다. 완벽한 전생!',
      image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=weasel',
      traits: ['실용주의', '즉흥형', '배려심']
    }
  ],
  '3': [
    {
      result_code: 0,
      quiz_id: '3',
      title: '관찰자',
      description: '클럽의 분위기는 좋지만 당신은 구석에서 관찰하기를 즐깁니다.',
      image_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=observer',
      traits: ['관찰형', '계획형', '안정지향']
    },
    {
      result_code: 1,
      quiz_id: '3',
      title: '추억 수집가',
      description: '사진으로 남기는 게 더 중요! 인스타 피드는 당신의 쇼룸.',
      image_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=collector',
      traits: ['기록형', '계획형', '안정지향']
    },
    {
      result_code: 2,
      quiz_id: '3',
      title: '리듬 파도타기',
      description: '좋은 음악이 나올 때만 움직이는 센스 있는 댄서!',
      image_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=rhythm',
      traits: ['관찰형', '즉흥형', '안정지향']
    },
    {
      result_code: 3,
      quiz_id: '3',
      title: '플로어 지킴이',
      description: 'DJ 곡이 나올 때만 댄스플로어! 타이밍의 천재!',
      image_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=guardian',
      traits: ['기록형', '즉흥형', '안정지향']
    },
    {
      result_code: 4,
      quiz_id: '3',
      title: '심플 룩 미니멀리스트',
      description: '화려한 네온 속에서 당신의 심플함이 빛낍니다.',
      image_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=minimal',
      traits: ['관찰형', '계획형', '올나이터']
    },
    {
      result_code: 5,
      quiz_id: '3',
      title: '스타일 큐레이터',
      description: '사진은 남기되 스타일은 잃지 않는 당신. 트렌디!',
      image_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=curator',
      traits: ['기록형', '계획형', '올나이터']
    },
    {
      result_code: 6,
      quiz_id: '3',
      title: '새벽 파티장',
      description: '새벽 4시는 시작! 애쉬까지 가는게 당신의 목표.',
      image_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=party',
      traits: ['관찰형', '즉흥형', '올나이터']
    },
    {
      result_code: 7,
      quiz_id: '3',
      title: '밤의 뱁파이어',
      description: '해가 뜨기 전까지는 당신의 영역! 호치민 밤의 제왕!',
      image_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=vampire',
      traits: ['기록형', '즉흥형', '올나이터']
    }
  ]
};
