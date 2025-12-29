import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string | null;
  profile_id: string | null;
  name: string;
  email: string;
  phone: string;
  gender: string;
  photo_url: string | null;
  profile_completion_percentage: number | null;
  is_prime: boolean | null;
  is_complete: boolean | null;
  about_me: string | null;
  hobbies: string[] | null;
  horoscope_url: string | null;
  phone_verified: boolean | null;
  email_verified: boolean | null;
  date_of_birth: string | null;
  height: string | null;
  marital_status: string | null;
  mother_tongue: string | null;
  religion: string | null;
  caste: string | null;
  sub_caste: string | null;
  gothram: string | null;
  star: string | null;
  dosham: string | null;
  family_status: string | null;
  family_type: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  education: string | null;
  education_detail: string | null;
  employment_type: string | null;
  occupation: string | null;
  company_name: string | null;
  annual_income: string | null;
  verification_status: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userEmail: string) => {
    // Find profile by email directly
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle();

    if (!error && data) {
      setProfile(data as Profile);
    } else {
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user?.email) {
          setTimeout(() => {
            fetchProfile(session.user.email!);
          }, 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        fetchProfile(session.user.email);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user?.email) {
      await fetchProfile(user.email);
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signOut,
    refreshProfile,
    isAuthenticated: !!user,
  };
};
