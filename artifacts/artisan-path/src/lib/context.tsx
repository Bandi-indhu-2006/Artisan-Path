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
    profile: "Profile",
    teachers: "Teachers",
    chat: "Chat",
    // Dashboard tabs
    myCrafts: "My Crafts",
    myCourses: "My Courses",
    myEvents: "My Events",
    teachingRequests: "Requests",
    // Profile page
    editProfile: "Edit Profile",
    save: "Save",
    about: "About",
    bio: "Bio",
    gallery: "Work Gallery",
    addPhoto: "Add Photos",
    profileSaved: "Profile saved!",
    // Product form
    suggestedPrice: "Suggested Price Range",
    uploadImage: "Upload Image",
    detectingCraft: "Detecting craft type...",
    craftDetected: "Craft type detected",
    // General
    addCraft: "Add Craft",
    addCourse: "Add Course",
    bookNow: "Book Now",
    viewAll: "View All",
  },
  hi: {
    shop: "दुकान",
    learn: "सीखें",
    events: "आयोजन",
    dashboard: "डैशबोर्ड",
    orders: "आदेश",
    login: "लॉग इन करें",
    logout: "लॉग आउट",
    profile: "प्रोफाइल",
    teachers: "शिक्षक",
    chat: "चैट",
    myCrafts: "मेरे शिल्प",
    myCourses: "मेरे कोर्स",
    myEvents: "मेरे आयोजन",
    teachingRequests: "शिक्षण अनुरोध",
    editProfile: "प्रोफाइल संपादित करें",
    save: "सहेजें",
    about: "परिचय",
    bio: "जीवनी",
    gallery: "कार्य गैलरी",
    addPhoto: "फोटो जोड़ें",
    profileSaved: "प्रोफाइल सहेजी गई!",
    suggestedPrice: "सुझाई गई मूल्य सीमा",
    uploadImage: "छवि अपलोड करें",
    detectingCraft: "शिल्प प्रकार पहचाना जा रहा है...",
    craftDetected: "शिल्प प्रकार पहचाना गया",
    addCraft: "शिल्प जोड़ें",
    addCourse: "कोर्स जोड़ें",
    bookNow: "अभी बुक करें",
    viewAll: "सभी देखें",
  },
  te: {
    shop: "దుకాణం",
    learn: "నేర్చుకోండి",
    events: "కార్యక్రమాలు",
    dashboard: "డాష్‌బోర్డ్",
    orders: "ఆదేశాలు",
    login: "లాగిన్",
    logout: "లాగ్అవుట్",
    profile: "ప్రొఫైల్",
    teachers: "ఉపాధ్యాయులు",
    chat: "చాట్",
    myCrafts: "నా చేతిపనులు",
    myCourses: "నా కోర్సులు",
    myEvents: "నా కార్యక్రమాలు",
    teachingRequests: "బోధన అభ్యర్థనలు",
    editProfile: "ప్రొఫైల్ సవరించు",
    save: "సేవ్ చేయి",
    about: "గురించి",
    bio: "జీవిత చరిత్ర",
    gallery: "పని గ్యాలరీ",
    addPhoto: "ఫోటో జోడించు",
    profileSaved: "ప్రొఫైల్ సేవ్ అయింది!",
    suggestedPrice: "సూచించిన ధర పరిధి",
    uploadImage: "చిత్రం అప్‌లోడ్ చేయండి",
    detectingCraft: "కళ రకాన్ని గుర్తిస్తోంది...",
    craftDetected: "కళ రకం గుర్తించబడింది",
    addCraft: "చేతిపని జోడించు",
    addCourse: "కోర్సు జోడించు",
    bookNow: "ఇప్పుడు బుక్ చేయండి",
    viewAll: "అన్నీ చూడండి",
  },
  ta: {
    shop: "கடை",
    learn: "கற்க",
    events: "நிகழ்வுகள்",
    dashboard: "முகப்பு",
    orders: "ஆர்டர்கள்",
    login: "உள்நுழை",
    logout: "வெளியேறு",
    profile: "சுயவிவரம்",
    teachers: "ஆசிரியர்கள்",
    chat: "அரட்டை",
    myCrafts: "என் கைவினைகள்",
    myCourses: "என் பாடங்கள்",
    myEvents: "என் நிகழ்வுகள்",
    teachingRequests: "கற்பித்தல் கோரிக்கைகள்",
    editProfile: "சுயவிவரம் திருத்து",
    save: "சேமி",
    about: "பற்றி",
    bio: "சுய விவரம்",
    gallery: "படைப்பு தொகுப்பு",
    addPhoto: "புகைப்படம் சேர்",
    profileSaved: "சுயவிவரம் சேமிக்கப்பட்டது!",
    suggestedPrice: "பரிந்துரைக்கப்பட்ட விலை வரம்பு",
    uploadImage: "படம் பதிவேற்றவும்",
    detectingCraft: "கைவினை வகை கண்டறியப்படுகிறது...",
    craftDetected: "கைவினை வகை கண்டறியப்பட்டது",
    addCraft: "கைவினை சேர்",
    addCourse: "பாடம் சேர்",
    bookNow: "இப்போதே பதிவு செய்",
    viewAll: "அனைத்தும் காண்க",
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
