import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signInWithFacebook: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Added Try/Catch so profile fetching never crashes the app
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    // FAILSAFE: If Supabase takes longer than 3 seconds, kill the spinner anyway.
    const emergencyUnlock = setTimeout(() => {
      if (mounted) {
        console.warn("Auth check took too long. Forcing UI to unlock.");
        setLoading(false);
      }
    }, 3000);

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }

        if (session?.user && mounted) {
          await fetchProfile(session.user.id);
        } else if (mounted) {
          setProfile(null);
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        // ALWAYS turn off loading when done
        clearTimeout(emergencyUnlock);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        try {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error("Auth state change error:", err);
        } finally {
          // Never set loading to true here, just ensure it is false
          if (mounted) setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(emergencyUnlock);
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const redirectUrl = import.meta.env.VITE_DEV_SUPABASE_REDIRECT_URL || 
      import.meta.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = import.meta.env.VITE_DEV_SUPABASE_REDIRECT_URL || 
      import.meta.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    return { error };
  };

  const signInWithFacebook = async () => {
    const redirectUrl = import.meta.env.VITE_DEV_SUPABASE_REDIRECT_URL || 
      import.meta.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
      `${window.location.origin}/auth/callback`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: { redirectTo: redirectUrl },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
