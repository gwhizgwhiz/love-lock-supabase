// src/hooks/useCircles.js
import { useState, useEffect, useCallback } from 'react';
import { CircleService } from '../lib/circles';
import useCurrentUser from './useCurrentUser';

export function useMyCircles() {
  const { userId, loading: userLoading } = useCurrentUser();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (userLoading || !userId) return;

    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await CircleService.getMyCircles(userId);
    setLoading(false);

    if (fetchError) {
      setError(fetchError);
    } else {
      setCircles(data || []);
    }
  }, [userId, userLoading]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { circles, loading, error, refetch: fetch };
}

export function useCircleMembers(circleId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await CircleService.getMembers(circleId);
    setLoading(false);

    if (fetchError) {
      setError(fetchError);
    } else {
      setMembers(data || []);
    }
  }, [circleId]);

  useEffect(() => {
    if (circleId) fetch();
  }, [circleId, fetch]);

  return { members, loading, error, refetch: fetch };
}
