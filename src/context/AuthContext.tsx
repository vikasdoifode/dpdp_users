import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface ConsentRecord {
  id: string;
  type: "data_storage" | "ai_processing" | "analytics";
  label: string;
  description: string;
  granted: boolean;
  updatedAt: string;
}

export interface ActivityEntry {
  id: string;
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
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; consents: Record<string, boolean> }) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  updateConsent: (consentId: string, granted: boolean) => void;
  toggleAI: (enabled: boolean) => void;
  requestDataExport: () => void;
  requestAccountDeletion: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock data for demo
const MOCK_USER: UserProfile = {
  id: "usr_001",
  name: "Priya Sharma",
  email: "priya@example.com",
  phone: "+91 98765 43210",
  createdAt: "2024-11-15T10:30:00Z",
};

const MOCK_CONSENTS: ConsentRecord[] = [
  {
    id: "c1",
    type: "data_storage",
    label: "Data Storage",
    description: "Allow us to store your personal data securely on our servers as per DPDP Act Section 8.",
    granted: true,
    updatedAt: "2024-11-15T10:30:00Z",
  },
  {
    id: "c2",
    type: "ai_processing",
    label: "AI Processing",
    description: "Allow AI models to process your data to provide personalized recommendations. Data is anonymized before processing.",
    granted: true,
    updatedAt: "2024-11-15T10:30:00Z",
  },
  {
    id: "c3",
    type: "analytics",
    label: "Analytics",
    description: "Allow us to collect anonymized usage analytics to improve our services.",
    granted: false,
    updatedAt: "2024-12-01T14:00:00Z",
  },
];

const MOCK_ACTIVITIES: ActivityEntry[] = [
  { id: "a1", type: "login", description: "Logged in from Chrome on Windows", timestamp: "2025-03-02T09:15:00Z" },
  { id: "a2", type: "consent_update", description: "Withdrew consent for Analytics", timestamp: "2024-12-01T14:00:00Z" },
  { id: "a3", type: "data_modification", description: "Updated phone number", timestamp: "2024-11-20T11:30:00Z" },
  { id: "a4", type: "login", description: "Logged in from Safari on iPhone", timestamp: "2024-11-18T08:45:00Z" },
  { id: "a5", type: "consent_update", description: "Granted consent for Data Storage", timestamp: "2024-11-15T10:30:00Z" },
  { id: "a6", type: "consent_update", description: "Granted consent for AI Processing", timestamp: "2024-11-15T10:30:00Z" },
  { id: "a7", type: "login", description: "First login — account created", timestamp: "2024-11-15T10:30:00Z" },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    consents: [],
    activities: [],
    aiEnabled: true,
  });

  const login = useCallback(async (_email: string, _password: string) => {
    // In production: POST to auth endpoint, receive httpOnly cookie
    await new Promise((r) => setTimeout(r, 800));
    setState({
      isAuthenticated: true,
      user: MOCK_USER,
      consents: MOCK_CONSENTS,
      activities: MOCK_ACTIVITIES,
      aiEnabled: MOCK_CONSENTS.find((c) => c.type === "ai_processing")?.granted ?? false,
    });
  }, []);

  const register = useCallback(async (data: { name: string; email: string; password: string; consents: Record<string, boolean> }) => {
    await new Promise((r) => setTimeout(r, 800));
    const now = new Date().toISOString();
    setState({
      isAuthenticated: true,
      user: { id: "usr_new", name: data.name, email: data.email, phone: "", createdAt: now },
      consents: MOCK_CONSENTS.map((c) => ({ ...c, granted: data.consents[c.type] ?? false, updatedAt: now })),
      activities: [{ id: "a_new", type: "login", description: "Account created", timestamp: now }],
      aiEnabled: data.consents.ai_processing ?? false,
    });
  }, []);

  const logout = useCallback(() => {
    setState({ isAuthenticated: false, user: null, consents: [], activities: [], aiEnabled: false });
  }, []);

  const updateProfile = useCallback((data: Partial<UserProfile>) => {
    setState((s) => ({
      ...s,
      user: s.user ? { ...s.user, ...data } : null,
      activities: [
        { id: `a_${Date.now()}`, type: "data_modification", description: `Updated profile: ${Object.keys(data).join(", ")}`, timestamp: new Date().toISOString() },
        ...s.activities,
      ],
    }));
  }, []);

  const updateConsent = useCallback((consentId: string, granted: boolean) => {
    setState((s) => {
      const consent = s.consents.find((c) => c.id === consentId);
      return {
        ...s,
        consents: s.consents.map((c) => (c.id === consentId ? { ...c, granted, updatedAt: new Date().toISOString() } : c)),
        aiEnabled: consent?.type === "ai_processing" ? granted : s.aiEnabled,
        activities: [
          { id: `a_${Date.now()}`, type: "consent_update", description: `${granted ? "Granted" : "Withdrew"} consent for ${consent?.label}`, timestamp: new Date().toISOString() },
          ...s.activities,
        ],
      };
    });
  }, []);

  const toggleAI = useCallback((enabled: boolean) => {
    setState((s) => {
      const aiConsent = s.consents.find((c) => c.type === "ai_processing");
      return {
        ...s,
        aiEnabled: enabled,
        consents: s.consents.map((c) => (c.type === "ai_processing" ? { ...c, granted: enabled, updatedAt: new Date().toISOString() } : c)),
        activities: aiConsent
          ? [{ id: `a_${Date.now()}`, type: "consent_update", description: `${enabled ? "Enabled" : "Disabled"} AI processing`, timestamp: new Date().toISOString() }, ...s.activities]
          : s.activities,
      };
    });
  }, []);

  const requestDataExport = useCallback(() => {
    const exportData = { user: state.user, consents: state.consents, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-data-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [state.user, state.consents]);

  const requestAccountDeletion = useCallback(() => {
    // In production: POST deletion request to backend
    alert("Account deletion request submitted. You will receive a confirmation email within 72 hours as per DPDP Act requirements.");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        updateConsent,
        toggleAI,
        requestDataExport,
        requestAccountDeletion,
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
