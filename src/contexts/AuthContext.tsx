import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  hasOnboarded: boolean | null;
  loading: boolean;
  setHasOnboarded: (value: boolean) => void;
  checkOnboardingStatus: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      setHasOnboarded(!!data);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setHasOnboarded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Check onboarding status when user logs in
      if (session?.user) {
        setTimeout(() => {
          checkOnboardingStatus(session.user.id);
        }, 0);
      } else {
        setHasOnboarded(null);
        setLoading(false);
      }
    });

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkOnboardingStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        hasOnboarded,
        loading,
        setHasOnboarded,
        checkOnboardingStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
