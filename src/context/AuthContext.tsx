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

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  consents: ConsentRecord[];
  activities: ActivityEntry[];
  aiEnabled: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    consents: Record<string, boolean>;
  }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  activityRefresh: {
    loading: boolean;
    error: string | null;
    fetch: () => Promise<void>;
  };
  consentRefresh: {
    loading: boolean;
    error: string | null;
    fetch: () => Promise<void>;
  };
  requestDataExport: () => void;
  requestAccountDeletion: () => Promise<void>;
  toggleAI: (enabled: boolean) => Promise<void>; // Added to interface
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

  const updateConsent = useCallback(
    async (consentId: string, granted: boolean) => {
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
      const res = await api.getActivities();
      setState((prev) => ({
        ...prev,
        activities: (res.activities || []).map(normalizeActivity),
      }));
    } catch (err) {
      console.error(err);
    }
  }, []);

  const refreshConsents = useCallback(async () => {
    try {
      const res = await api.getConsentHistory(); // Ensure this endpoint returns current status
      // You may need a dedicated endpoint for current consents status if history returns logs
      // Assuming getConsentHistory returns { consents: [] }
      setState((prev) => ({
        ...prev,
        consents: (res.consents || []).map(normalizeConsent),
      }));
    } catch (err) {
      console.error(err);
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

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    activityRefresh: {
       loading: false, // Placeholder, can implement detailed loading state
       error: null,
       fetch: refreshActivities,
    },
    consentRefresh: {
       loading: false,
       error: null,
       fetch: refreshConsents,
    },
    requestDataExport,
    requestAccountDeletion,
    toggleAI,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
