import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, Artisan } from "@workspace/api-client-react";

type AuthState = {
  user: User | null;
  artisan: Artisan | null;
  loginUser: (user: User) => void;
  loginArtisan: (artisan: Artisan) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [artisan, setArtisan] = useState<Artisan | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("artisan_path_user");
    const storedArtisan = localStorage.getItem("artisan_path_artisan");
    if (storedUser) setUser(JSON.parse(storedUser));
    if (storedArtisan) setArtisan(JSON.parse(storedArtisan));
  }, []);

  const loginUser = (user: User) => {
    setUser(user);
    setArtisan(null);
    localStorage.setItem("artisan_path_user", JSON.stringify(user));
    localStorage.removeItem("artisan_path_artisan");
  };

  const loginArtisan = (artisan: Artisan) => {
    setArtisan(artisan);
    setUser(null);
    localStorage.setItem("artisan_path_artisan", JSON.stringify(artisan));
    localStorage.removeItem("artisan_path_user");
  };

  const logout = () => {
    setUser(null);
    setArtisan(null);
    localStorage.removeItem("artisan_path_user");
    localStorage.removeItem("artisan_path_artisan");
  };

  return (
    <AuthContext.Provider value={{ user, artisan, loginUser, loginArtisan, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export type SupportedLanguage = 'en' | 'hi' | 'te' | 'ta';

type LanguageState = {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageState | undefined>(undefined);

const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    shop: "Shop",
    learn: "Learn",
    events: "Events",
    dashboard: "Dashboard",
    orders: "Orders",
    login: "Login",
    logout: "Logout",
  },
  hi: {
    shop: "दुकान",
    learn: "सीखें",
    events: "आयोजन",
    dashboard: "डैशबोर्ड",
    orders: "आदेश",
    login: "लॉग इन करें",
    logout: "लॉग आउट",
  },
  te: {
    shop: "దుకాణం",
    learn: "నేర్చుకోండి",
    events: "కార్యక్రమాలు",
    dashboard: "డాష్‌బోర్డ్",
    orders: "ఆదేశాలు",
    login: "లాగిన్",
    logout: "లాగ్అవుట్",
  },
  ta: {
    shop: "கடை",
    learn: "கற்க",
    events: "நிகழ்வுகள்",
    dashboard: "முகப்பு",
    orders: "ஆர்டர்கள்",
    login: "உள்நுழை",
    logout: "வெளியேறு",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const stored = localStorage.getItem("artisan_path_lang") as SupportedLanguage;
    if (stored && ['en', 'hi', 'te', 'ta'].includes(stored)) {
      setLanguageState(stored);
    }
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("artisan_path_lang", lang);
  };

  const t = (key: string) => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
