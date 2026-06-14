import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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

  const loadMe = useCallback(async (currentSession: Session | null) => {
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
  }, []);

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

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setMe(null);
  }, []);

  const refreshMe = useCallback(async () => {
    await loadMe(session);
  }, [session, loadMe]);

  // Memoize so the context value is stable across renders — otherwise every
  // provider render re-renders all consumers and rebuilds their effects (e.g.
  // the Dashboard's 30s SOP-polling interval).
  const value = useMemo(
    () => ({ session, me, loading, signOut, refreshMe }),
    [session, me, loading, signOut, refreshMe]
  );

  return (
    <PortalAuthContext.Provider value={value}>
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  return useContext(PortalAuthContext);
}
