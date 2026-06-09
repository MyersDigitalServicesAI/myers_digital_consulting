import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { portalApi } from "@/lib/portal-api";
import type { PortalMeResponse } from "@shared/portal.types";

interface PortalAuthState {
  session: Session | null;
  me: PortalMeResponse | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMe: () => Promise<void>;
}

const PortalAuthContext = createContext<PortalAuthState>({
  session: null,
  me: null,
  loading: true,
  signOut: async () => {},
  refreshMe: async () => {},
});

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [me, setMe] = useState<PortalMeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadMe(currentSession: Session | null) {
    if (!currentSession) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      const data = await portalApi.me();
      setMe(data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      loadMe(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadMe(newSession);
      } else {
        setMe(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    setSession(null);
    setMe(null);
  }

  async function refreshMe() {
    await loadMe(session);
  }

  return (
    <PortalAuthContext.Provider value={{ session, me, loading, signOut, refreshMe }}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  return useContext(PortalAuthContext);
}
