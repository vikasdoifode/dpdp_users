import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { api, setToken, getToken } from "@/lib/api";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  _id?: string;
  type: "data_storage" | "ai_processing" | "analytics";
  label: string;
  description: string;
  granted: boolean;
  updatedAt: string;
}

export interface ActivityEntry {
  id: string;
  _id?: string;
  type: "login" | "consent_update" | "data_modification";
  description: string;
  timestamp: string;
  metadata?: Record<string, string>;
}

interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  consents: ConsentRecord[];
  activities: ActivityEntry[];
  aiEnabled: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  demoLogin: () => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
    consents: Record<string, boolean>;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateConsent: (consentId: string, granted: boolean) => Promise<void>;
  toggleAI: (enabled: boolean) => Promise<void>;
  refreshActivities: () => Promise<void>;
  refreshConsents: () => Promise<void>;
  requestDataExport: () => void;
  requestAccountDeletion: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MongoDoc = Record<string, any>;

// Helper to normalize MongoDB docs to our interface
const normalizeUser = (u: MongoDoc): UserProfile => ({
  id: u._id || u.id,
  name: u.name,
  email: u.email,
  phone: u.phone || "",
  role: u.role || "USER",
  createdAt: u.createdAt || new Date().toISOString(),
});

const normalizeConsent = (c: MongoDoc): ConsentRecord => ({
  id: c._id || c.id,
  type: c.type,
  label: c.label || c.type,
  description: c.description || "",
  granted: c.granted,
  updatedAt: c.updatedAt || c.createdAt || new Date().toISOString(),
});

const normalizeActivity = (a: MongoDoc): ActivityEntry => ({
  id: a._id || a.id,
  type: a.type,
  description: a.description,
  timestamp: a.timestamp || a.createdAt || new Date().toISOString(),
  metadata: a.metadata,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    consents: [],
    activities: [],
    aiEnabled: false,
    loading: true,
  });

  // Auto-login on mount if token exists
  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        setState((s) => ({ ...s, loading: false }));
        return;
      }
      try {
        const profileRes = await api.getProfile();
        const consentRes = await api.getConsentHistory();
        const activityRes = await api.getActivities(20);

        const user = normalizeUser(profileRes.user);
        const consents = (consentRes.consents || []).map(normalizeConsent);
        const activities = (activityRes.activities || []).map(
          normalizeActivity,
        );

        setState({
          isAuthenticated: true,
          user,
          consents,
          activities,
          aiEnabled:
            consents.find((c) => c.type === "ai_processing")?.granted ?? false,
          loading: false,
        });
      } catch {
        // Token expired or invalid
        setToken(null);
        setState({
          isAuthenticated: false,
          user: null,
          consents: [],
          activities: [],
          aiEnabled: false,
          loading: false,
        });
      }
    };
    restoreSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    setToken(res.token);

    const user = normalizeUser(res.user);
    const consents = (res.consents || []).map(normalizeConsent);
    const activities = (res.activities || []).map(normalizeActivity);

    setState({
      isAuthenticated: true,
      user,
      consents,
      activities,
      aiEnabled:
        consents.find((c) => c.type === "ai_processing")?.granted ?? false,
      loading: false,
    });
  }, []);

  const demoLogin = useCallback(() => {
    const demoUser = {
      id: "demo_user_123",
      name: "Demo User",
      email: "demo@example.com",
      phone: "+91 98765 43210",
      role: "USER",
      createdAt: new Date().toISOString(),
    };

    const demoConsents: ConsentRecord[] = [
      { id: "c1", type: "data_storage", label: "Personal Data Storage", description: "Storage of your profile data.", granted: true, updatedAt: new Date().toISOString() },
      { id: "c2", type: "ai_processing", label: "AI Transparency & Processing", description: "Use of AI to analyze your privacy risks.", granted: true, updatedAt: new Date().toISOString() },
      { id: "c3", type: "analytics", label: "Usage Analytics", description: "Anonymous data usage to improve the platform.", granted: false, updatedAt: new Date().toISOString() },
    ];

    const demoActivities: ActivityEntry[] = [
      { id: "a1", type: "login", description: "Logged in via Demo Mode", timestamp: new Date().toISOString() },
    ];

    setToken("demo_token");
    setState({
      isAuthenticated: true,
      user: demoUser,
      consents: demoConsents,
      activities: demoActivities,
      aiEnabled: true,
      loading: false,
    });
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      consents: Record<string, boolean>;
    }) => {
      const res = await api.register({
        name: data.name,
        email: data.email,
        password: data.password,
        consents: data.consents,
      });
      setToken(res.token);

      const user = normalizeUser(res.user);

      // Setup consents on backend
      try {
        await api.setupConsents(data.consents);
      } catch {
        // Consents may already be initialized by register endpoint
      }

      // Fetch fresh consents & activities
      const consentRes = await api.getConsentHistory();
      const activityRes = await api.getActivities(20);
      const consents = (consentRes.consents || []).map(normalizeConsent);
      const activities = (activityRes.activities || []).map(normalizeActivity);

      setState({
        isAuthenticated: true,
        user,
        consents,
        activities,
        aiEnabled:
          consents.find((c) => c.type === "ai_processing")?.granted ?? false,
        loading: false,
      });
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setState({
      isAuthenticated: false,
      user: null,
      consents: [],
      activities: [],
      aiEnabled: false,
      loading: false,
    });
  }, []);

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    const res = await api.updateProfile({ name: data.name, phone: data.phone });
    setState((s) => ({
      ...s,
      user: s.user ? normalizeUser(res.user) : null,
    }));
  }, []);

  const updateProfileDemo = useCallback(async (data: Partial<UserProfile>) => {
    setState((s) => ({
      ...s,
      user: s.user ? { ...s.user, ...data } : null,
      activities: [
        { id: `a_${Date.now()}`, type: "data_modification", description: "Updated profile information (Demo)", timestamp: new Date().toISOString() },
        ...s.activities
      ]
    }));
  }, []);

  const updateConsent = useCallback(
    async (consentId: string, granted: boolean) => {
      const isDemo = getToken() === "demo_token";

      if (isDemo) {
        setState((s) => ({
          ...s,
          consents: s.consents.map((c) => (c.id === consentId ? { ...c, granted, updatedAt: new Date().toISOString() } : c)),
          aiEnabled: s.consents.find(c => c.id === consentId)?.type === "ai_processing" ? granted : s.aiEnabled,
          activities: [
            { id: `a_${Date.now()}`, type: "consent_update", description: `Updated consent (Demo)`, timestamp: new Date().toISOString() },
            ...s.activities
          ]
        }));
        return;
      }

      const res = await api.updateConsent(consentId, granted);
      const updated = normalizeConsent(res.consent);

      setState((s) => ({
        ...s,
        consents: s.consents.map((c) => (c.id === consentId ? updated : c)),
        aiEnabled: updated.type === "ai_processing" ? granted : s.aiEnabled,
      }));
    },
    [],
  );

  const toggleAI = useCallback(async (enabled: boolean) => {
    setState((s) => {
      const aiConsent = s.consents.find((c) => c.type === "ai_processing");
      if (aiConsent) {
        // Fire API call (don't await inside setState)
        api.updateConsent(aiConsent.id, enabled).catch(console.error);
      }
      return {
        ...s,
        aiEnabled: enabled,
        consents: s.consents.map((c) =>
          c.type === "ai_processing"
            ? { ...c, granted: enabled, updatedAt: new Date().toISOString() }
            : c,
        ),
      };
    });
  }, []);

  const refreshActivities = useCallback(async () => {
    try {
      const res = await api.getActivities(50);
      setState((s) => ({
        ...s,
        activities: (res.activities || []).map(normalizeActivity),
      }));
    } catch {
      // silently fail
    }
  }, []);

  const refreshConsents = useCallback(async () => {
    try {
      const res = await api.getConsentHistory();
      const consents = (res.consents || []).map(normalizeConsent);
      setState((s) => ({
        ...s,
        consents,
        aiEnabled:
          consents.find((c) => c.type === "ai_processing")?.granted ??
          s.aiEnabled,
      }));
    } catch {
      // silently fail
    }
  }, []);

  const requestDataExport = useCallback(() => {
    const exportData = {
      user: state.user,
      consents: state.consents,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state.user, state.consents]);

  const requestAccountDeletion = useCallback(async () => {
    await api.deleteAccount();
    setToken(null);
    setState({
      isAuthenticated: false,
      user: null,
      consents: [],
      activities: [],
      aiEnabled: false,
      loading: false,
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        demoLogin,
        register,
        logout,
        updateProfile: getToken() === "demo_token" ? updateProfileDemo : updateProfile,
        updateConsent,
        toggleAI,
        refreshActivities: getToken() === "demo_token" ? async () => { } : refreshActivities,
        refreshConsents: getToken() === "demo_token" ? async () => { } : refreshConsents,
        requestDataExport,
        requestAccountDeletion: getToken() === "demo_token" ? logout : requestAccountDeletion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
