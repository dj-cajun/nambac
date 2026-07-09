import { useEffect, useMemo, useState } from 'react';
import { fetchFortuneSceneImage } from '../lib/fortuneApi';
import { getHomeFeatureThumbPlan } from '../../shared/featureThumbnails.js';

export function useHomeFeatureThumbs() {
  const plan = useMemo(() => getHomeFeatureThumbPlan(), []);

  const [fortuneTodaySrc, setFortuneTodaySrc] = useState(plan.fortuneToday.src);
  const [fortuneTomorrowSrc, setFortuneTomorrowSrc] = useState(plan.fortuneTomorrow.src);

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
    ]).then(([todayRes, tomorrowRes]) => {
      if (cancelled) return;
      if (todayRes.status === 'fulfilled') setFortuneTodaySrc(todayRes.value.src);
      if (tomorrowRes.status === 'fulfilled') setFortuneTomorrowSrc(tomorrowRes.value.src);
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
  };
}
