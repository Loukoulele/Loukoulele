'use client';

import { useEffect } from 'react';
import { initAnalytics } from '@/lib/firebase';

export default function AnalyticsProvider() {
  useEffect(() => {
    initAnalytics();
  }, []);

  return null;
}
