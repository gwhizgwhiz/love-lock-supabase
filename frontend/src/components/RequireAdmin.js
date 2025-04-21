import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../supabaseClient';

export default function RequireAdmin({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const user = supabase.auth.user();
      if (!user) return navigate('/login');
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', user.id)
        .single();
      if (error || !data) {
        return navigate('/');
      }
      setIsAdmin(true);
    };
    checkAdmin();
  }, [navigate]);

  if (isAdmin === null) return <div>Checking admin...</div>;
  return <>{children}</>;
}