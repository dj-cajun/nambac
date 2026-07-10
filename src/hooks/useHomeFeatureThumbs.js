import { useEffect, useMemo, useState } from 'react';
import { fetchFortuneSceneImage } from '../lib/fortuneApi';
import { fetchBalanceSceneImage } from '../lib/balanceApi';
import { getHomeFeatureThumbPlan } from '../../shared/featureThumbnails.js';

export function useHomeFeatureThumbs() {
  const plan = useMemo(() => getHomeFeatureThumbPlan(), []);

  const [fortuneTodaySrc, setFortuneTodaySrc] = useState(plan.fortuneToday.src);
  const [fortuneTomorrowSrc, setFortuneTomorrowSrc] = useState(plan.fortuneTomorrow.src);
  const [balanceSrc, setBalanceSrc] = useState(plan.balance.src);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetchFortuneSceneImage({
        fortuneIndex: plan.fortuneToday.fortuneIndex,
        dateLabel: plan.fortuneToday.dateLabel,
      }),
      fetchFortuneSceneImage({
        fortuneIndex: plan.fortuneTomorrow.fortuneIndex,
        dateLabel: plan.fortuneTomorrow.dateLabel,
      }),
      fetchBalanceSceneImage(plan.balance.questionId),
    ]).then(([todayRes, tomorrowRes, balanceRes]) => {
      if (cancelled) return;
      if (todayRes.status === 'fulfilled') setFortuneTodaySrc(todayRes.value.src);
      if (tomorrowRes.status === 'fulfilled') setFortuneTomorrowSrc(tomorrowRes.value.src);
      if (balanceRes.status === 'fulfilled') setBalanceSrc(balanceRes.value.src);
    });

    return () => {
      cancelled = true;
    };
  }, [plan]);

  return {
    fortuneToday: { ...plan.fortuneToday, src: fortuneTodaySrc },
    fortuneTomorrow: { ...plan.fortuneTomorrow, src: fortuneTomorrowSrc },
    roast: plan.roast,
    brain: plan.brain,
    balance: { ...plan.balance, src: balanceSrc },
    lienquan: plan.lienquan,
    sbti: plan.sbti,
  };
}
