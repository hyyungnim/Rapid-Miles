import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { supabase, requireSupabase } from "../lib/supabase";
import type { Profile, UserRole } from "../lib/types";

const ADMIN_EMAIL = "rapidmileslogistics@gmail.com";
const ADMIN_PASSWORD = "RapidMiles25";

interface AuthState {
  user: Profile | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, fullName: string, phone: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getLocalUsers(): Profile[] {
  try { return JSON.parse(localStorage.getItem("rm_users") || "[]"); } catch { return []; }
}

function saveLocalUsers(users: Profile[]) {
  localStorage.setItem("rm_users", JSON.stringify(users));
}

function getLocalSession(): { email: string; id: string } | null {
  try {
    const s = localStorage.getItem("rm_session");
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}

function setLocalSession(email: string, id: string) {
  localStorage.setItem("rm_session", JSON.stringify({ email, id }));
}

function clearLocalSession() {
  localStorage.removeItem("rm_session");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null });
  const pendingProfileRef = useRef<Profile | null>(null);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession()
        .then(async ({ data: { session } }) => {
          if (session?.user) {
            const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
            setState({ user: data || null, loading: false, error: null });
          } else {
            setState((s) => ({ ...s, loading: false }));
          }
        })
        .catch(() => setState((s) => ({ ...s, loading: false })));

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const pending = pendingProfileRef.current;
          if (pending && pending.id === session.user.id) {
            setState({ user: pending, loading: false, error: null });
            pendingProfileRef.current = null;
            return;
          }
          const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
          setState({ user: data || null, loading: false, error: null });
        } else {
          setState({ user: null, loading: false, error: null });
        }
      });
      return () => subscription.unsubscribe();
    }

    // Local auth fallback
    const session = getLocalSession();
    if (session) {
      const users = getLocalUsers();
      const user = users.find(u => u.email === session.email && u.id === session.id);
      setState({ user: user || null, loading: false, error: null });
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  async function signIn(email: string, password: string) {
    setState((s) => ({ ...s, loading: true, error: null }));

    // Check hardcoded admin credentials first
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminProfile: Profile = {
        id: "admin-001",
        email: ADMIN_EMAIL,
        full_name: "Rapid Miles Logistics",
        phone: "+234 816 935 9828",
        role: "admin",
        avatar_url: null,
        created_at: new Date().toISOString(),
      };
      setLocalSession(adminProfile.email, adminProfile.id);
      setState({ user: adminProfile, loading: false, error: null });
      return;
    }

    if (supabase) {
      try {
        const sb = requireSupabase();
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw new Error(error.message);
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
          if (profile) {
            setState({ user: profile, loading: false, error: null });
          } else {
            const newProfile: Profile = {
              id: session.user.id,
              email,
              full_name: session.user.user_metadata?.full_name || email.split("@")[0],
              phone: session.user.user_metadata?.phone || null,
              role: session.user.user_metadata?.role || "customer",
              avatar_url: null,
              created_at: new Date().toISOString(),
            };
            await supabase.from("profiles").insert(newProfile);
            setState({ user: newProfile, loading: false, error: null });
          }
        }
      } catch (e: any) {
        setState((s) => ({ ...s, loading: false, error: e.message }));
        throw e;
      }
      return;
    }

    // Local auth
    const users = getLocalUsers();
    const user = users.find(u => u.email === email);
    if (!user) {
      const err = "No account found with this email";
      setState((s) => ({ ...s, loading: false, error: err }));
      throw new Error(err);
    }
    setLocalSession(user.email, user.id);
    setState({ user: user, loading: false, error: null });
  }

  async function signUp(email: string, password: string, fullName: string, phone: string, role: UserRole) {
    setState((s) => ({ ...s, loading: true, error: null }));

    if (supabase) {
      try {
        const sb = requireSupabase();
        const { data, error } = await sb.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, phone, role } },
        });
        if (error) throw new Error(error.message);
        if (data.session?.user) {
          const userId = data.session.user.id;
          await sb.auth.setSession(data.session);
          const correctProfile: Profile = {
            id: userId,
            email,
            full_name: fullName,
            phone,
            role,
            avatar_url: null,
            created_at: new Date().toISOString(),
          };
          await supabase.from("profiles").upsert(correctProfile, { onConflict: "id" });
          if (role === "driver") {
            const { data: existingDriver } = await supabase.from("drivers").select("id").eq("id", userId).maybeSingle();
            if (!existingDriver) {
              await supabase.from("drivers").insert({
                id: userId,
                full_name: fullName,
                phone,
                email,
                motorcycle_photo: null,
                rating: 0,
                total_deliveries: 0,
                is_online: false,
              });
            }
          }
          pendingProfileRef.current = correctProfile;
          setState({ user: correctProfile, loading: false, error: null });
        } else {
          setState({ user: null, loading: false, error: "Check your email for the confirmation link." });
        }
      } catch (e: any) {
        setState((s) => ({ ...s, loading: false, error: e.message }));
        throw e;
      }
      return;
    }

    // Local signup
    const users = getLocalUsers();
    if (users.find(u => u.email === email)) {
      const err = "An account with this email already exists";
      setState((s) => ({ ...s, loading: false, error: err }));
      throw new Error(err);
    }

    const newUser: Profile = {
      id: `user-${Date.now()}`,
      email,
      full_name: fullName,
      phone,
      role,
      avatar_url: null,
      created_at: new Date().toISOString(),
    };
    saveLocalUsers([...users, newUser]);
    setLocalSession(newUser.email, newUser.id);
    setState({ user: newUser, loading: false, error: null });
  }

  async function signOut() {
    if (supabase) {
      await supabase.auth.signOut();
    }
    clearLocalSession();
    setState({ user: null, loading: false, error: null });
  }

  async function updateProfile(data: Partial<Profile>) {
    if (supabase && state.user) {
      const { error } = await supabase.from("profiles").update(data).eq("id", state.user.id);
      if (error) throw error;
    }
    if (state.user) {
      const updated = { ...state.user, ...data };
      const users = getLocalUsers();
      saveLocalUsers(users.map(u => u.id === updated.id ? updated : u));
      setState((s) => ({ ...s, user: updated }));
    }
  }

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
