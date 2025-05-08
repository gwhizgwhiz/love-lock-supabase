// src/hooks/useCircles.js
import { useState, useEffect, useCallback } from 'react';
import { CircleService } from '../lib/circles';
import supabase         from '../supabaseClient';

export function useMyCircles() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    // 1. Get current user
    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError(userError || new Error('No authenticated user'));
      setLoading(false);
      return;
    }

    // 2. Fetch circles for that user
    const { data, error: fetchError } = await CircleService.getMyCircles(user.id);
    setLoading(false);

    if (fetchError) {
      setError(fetchError);
    } else {
      setCircles(data || []);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { circles, loading, error, refetch: fetch };
}

export function useCircleMembers(circleId) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

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
