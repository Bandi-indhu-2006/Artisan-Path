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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
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
    // Nav
    shop: "Shop", learn: "Learn", events: "Events", dashboard: "Dashboard",
    orders: "Orders", login: "Login", logout: "Logout", profile: "Profile",
    teachers: "Teachers", chat: "Chat",
    // Shop page
    bazaar: "Bazaar", discoverCrafts: "Discover handcrafted treasures from artisans across India.",
    searchPlaceholder: "Search crafts or artisans...", allCrafts: "All Crafts",
    allCities: "All Cities", clearFilters: "Clear Filters", noCraftsFound: "No crafts found",
    adjustFilters: "Try adjusting your filters or search term.", viewProduct: "View",
    byArtisan: "By", reviews: "reviews", category: "Category", city: "City",
    painting: "Painting", handloom: "Handloom", pottery: "Pottery",
    // Product detail
    addToCart: "Buy Now", writeReview: "Write a Review", submitReview: "Submit Review",
    yourRating: "Your Rating", yourReview: "Your Review", reviewsTitle: "Reviews",
    priceRange: "Price Range", artisan: "Artisan", verified: "Verified",
    // Learn / Teachers
    learnTitle: "Learn a Craft", teachersTitle: "Meet the Teachers",
    enrollNow: "Enroll Now", contactTeacher: "Contact Teacher",
    duration: "Duration", hours: "hours", availableForTeaching: "Available for Teaching",
    // Events
    craftEvents: "Craft Events & Exhibitions",
    craftEventsDesc: "Experience the magic of Indian crafts live.",
    allTypes: "All Types", booked: "Booked", soldOut: "Sold Out",
    bookNow: "Book Now", registerShowcase: "Register to Showcase",
    registeredShowcase: "Registered to Showcase", seatsLeft: "seats left",
    confirmBooking: "Confirm Booking", confirming: "Confirming...",
    bookingDetails: "Confirm your details to secure your spot.",
    logInToBook: "Log in to book tickets",
    // Dashboard tabs
    myCrafts: "My Crafts", myCourses: "My Courses",
    teachingRequests: "Requests",
    // Dashboard content
    myWorkshop: "My Workshop", manageYourBusiness: "Manage your crafts, courses, and business.",
    manageProducts: "Manage Products", manageCourses: "Manage Courses",
    addCraft: "Add Craft", addCourse: "Add Course",
    addNewCraft: "Add New Craft", listNewItem: "List a new item in your shop for buyers.",
    addNewCourse: "Add New Course", offerClasses: "Offer classes to teach your craft.",
    productTitle: "Title", productDesc: "Description", productPrice: "Your Price (₹)",
    productCategory: "Category", productSubcategory: "Subcategory",
    courseTitle: "Course Title", courseDuration: "Duration (Hours)", coursePrice: "Price (₹)",
    courseDesc: "Description", courseWhat: "What students will learn...",
    dictate: "Dictate", stopRecording: "Stop", addToShop: "Add to Shop",
    adding: "Adding...", addingCourse: "Adding...",
    noProductsYet: "You haven't added any products yet.",
    addFirstCraft: "Add Your First Craft", noCoursesYet: "You haven't listed any courses yet.",
    createFirstCourse: "Create Your First Course",
    productAdded: "Product added successfully!",
    productRemoved: "Product removed",
    courseAdded: "Course added successfully!",
    failedAddProduct: "Failed to add product",
    failedAddCourse: "Failed to add course",
    // Teaching requests
    requestsTitle: "Teaching Requests",
    requestsDesc: "Students interested in learning your craft.",
    accept: "Accept", dismiss: "Dismiss", accepted: "Accepted",
    acceptedMsg: "Accepted! You'll be connected with the student.",
    dismissedMsg: "Request dismissed",
    noRequests: "No teaching requests yet.",
    noRequestsDesc: "Students will appear here when they request to learn from you.",
    // Trend recommendations
    trendTitle: "Trending in your category",
    trendSubtitle: "Based on market data — consider making these too",
    demandVeryHigh: "Very High Demand", demandHigh: "High Demand", demandMedium: "Medium",
    // Profile page
    editProfile: "Edit Profile", save: "Save", about: "About", bio: "Bio",
    gallery: "Work Gallery", addPhoto: "Add Photos", profileSaved: "Profile saved!",
    speakProfile: "Speak Profile", stopSpeaking: "Stop",
    // Product upload
    suggestedPrice: "Suggested Price Range", uploadImage: "Upload Image",
    detectingCraft: "Detecting craft type...", craftDetected: "Craft type detected",
    recommended: "Recommended", marketData: "based on market data",
    uploadCraftPhoto: "Upload craft photo",
    aiDetects: "AI will auto-detect category from image name",
    clickToChange: "Click to change",
    // General
    fullName: "Full Name", phone: "Phone Number", enterBazaar: "Enter Bazaar",
    openShop: "Open My Shop", joinBuyer: "Join as a Buyer",
    joinArtisan: "Join as an Artisan", discoverBuy: "Discover and purchase authentic handcrafted treasures.",
    showcaseCraft: "Showcase your craft to the world.",
    selectCity: "Select your city", selectCraft: "Select primary craft",
    selectSpecialty: "Select specialty", interestedTeaching: "I am interested in teaching my craft",
    entering: "Entering...", settingUp: "Setting up...",
  },
  hi: {
    shop: "दुकान", learn: "सीखें", events: "आयोजन", dashboard: "डैशबोर्ड",
    orders: "आदेश", login: "लॉग इन", logout: "लॉग आउट", profile: "प्रोफाइल",
    teachers: "शिक्षक", chat: "चैट",
    bazaar: "बाज़ार", discoverCrafts: "भारत के कारीगरों से हस्तशिल्प खजाने खोजें।",
    searchPlaceholder: "शिल्प या कारीगर खोजें...", allCrafts: "सभी शिल्प",
    allCities: "सभी शहर", clearFilters: "फ़िल्टर हटाएं", noCraftsFound: "कोई शिल्प नहीं मिला",
    adjustFilters: "फ़िल्टर बदलें या खोज शब्द बदलें।", viewProduct: "देखें",
    byArtisan: "द्वारा", reviews: "समीक्षाएं", category: "श्रेणी", city: "शहर",
    painting: "चित्रकारी", handloom: "हथकरघा", pottery: "मिट्टी के बर्तन",
    addToCart: "अभी खरीदें", writeReview: "समीक्षा लिखें", submitReview: "समीक्षा जमा करें",
    yourRating: "आपकी रेटिंग", yourReview: "आपकी समीक्षा", reviewsTitle: "समीक्षाएं",
    priceRange: "मूल्य सीमा", artisan: "कारीगर", verified: "सत्यापित",
    learnTitle: "एक शिल्प सीखें", teachersTitle: "शिक्षकों से मिलें",
    enrollNow: "अभी नामांकन करें", contactTeacher: "शिक्षक से संपर्क करें",
    duration: "अवधि", hours: "घंटे", availableForTeaching: "पढ़ाने के लिए उपलब्ध",
    craftEvents: "शिल्प आयोजन और प्रदर्शनियां",
    craftEventsDesc: "भारतीय शिल्प का जादू सजीव अनुभव करें।",
    allTypes: "सभी प्रकार", booked: "बुक किया", soldOut: "बिक गया",
    bookNow: "अभी बुक करें", registerShowcase: "प्रदर्शनी के लिए पंजीकरण",
    registeredShowcase: "पंजीकृत", seatsLeft: "सीटें बची",
    confirmBooking: "बुकिंग पुष्टि करें", confirming: "पुष्टि हो रही है...",
    bookingDetails: "अपनी जगह सुरक्षित करने के लिए विवरण भरें।",
    logInToBook: "टिकट बुक करने के लिए लॉग इन करें",
    myCrafts: "मेरे शिल्प", myCourses: "मेरे कोर्स",
    teachingRequests: "अनुरोध",
    myWorkshop: "मेरी कार्यशाला", manageYourBusiness: "अपने शिल्प, कोर्स और व्यवसाय प्रबंधित करें।",
    manageProducts: "उत्पाद प्रबंधित करें", manageCourses: "कोर्स प्रबंधित करें",
    addCraft: "शिल्प जोड़ें", addCourse: "कोर्स जोड़ें",
    addNewCraft: "नया शिल्प जोड़ें", listNewItem: "खरीदारों के लिए अपनी दुकान में नया आइटम सूचीबद्ध करें।",
    addNewCourse: "नया कोर्स जोड़ें", offerClasses: "अपनी कला सिखाने के लिए कक्षाएं प्रदान करें।",
    productTitle: "शीर्षक", productDesc: "विवरण", productPrice: "आपका मूल्य (₹)",
    productCategory: "श्रेणी", productSubcategory: "उपश्रेणी",
    courseTitle: "कोर्स शीर्षक", courseDuration: "अवधि (घंटे)", coursePrice: "मूल्य (₹)",
    courseDesc: "विवरण", courseWhat: "छात्र क्या सीखेंगे...",
    dictate: "बोलें", stopRecording: "रोकें", addToShop: "दुकान में जोड़ें",
    adding: "जोड़ रहे हैं...", addingCourse: "जोड़ रहे हैं...",
    noProductsYet: "आपने अभी तक कोई उत्पाद नहीं जोड़ा।",
    addFirstCraft: "अपना पहला शिल्प जोड़ें", noCoursesYet: "आपने अभी तक कोई कोर्स सूचीबद्ध नहीं किया।",
    createFirstCourse: "अपना पहला कोर्स बनाएं",
    productAdded: "उत्पाद सफलतापूर्वक जोड़ा गया!",
    productRemoved: "उत्पाद हटाया गया",
    courseAdded: "कोर्स सफलतापूर्वक जोड़ा गया!",
    failedAddProduct: "उत्पाद जोड़ने में विफल",
    failedAddCourse: "कोर्स जोड़ने में विफल",
    requestsTitle: "शिक्षण अनुरोध",
    requestsDesc: "आपकी कला सीखने में रुचि रखने वाले छात्र।",
    accept: "स्वीकार करें", dismiss: "अस्वीकार करें", accepted: "स्वीकृत",
    acceptedMsg: "स्वीकृत! आप छात्र से जुड़ेंगे।",
    dismissedMsg: "अनुरोध अस्वीकृत",
    noRequests: "अभी कोई शिक्षण अनुरोध नहीं।",
    noRequestsDesc: "छात्र यहां दिखेंगे जब वे आपसे सीखना चाहेंगे।",
    trendTitle: "आपकी श्रेणी में ट्रेंडिंग",
    trendSubtitle: "बाजार डेटा के आधार पर — इन्हें भी बनाने पर विचार करें",
    demandVeryHigh: "बहुत अधिक मांग", demandHigh: "अधिक मांग", demandMedium: "मध्यम",
    editProfile: "प्रोफाइल संपादित करें", save: "सहेजें", about: "परिचय", bio: "जीवनी",
    gallery: "कार्य गैलरी", addPhoto: "फोटो जोड़ें", profileSaved: "प्रोफाइल सहेजी गई!",
    speakProfile: "प्रोफाइल सुनें", stopSpeaking: "रोकें",
    suggestedPrice: "सुझाई गई मूल्य सीमा", uploadImage: "छवि अपलोड करें",
    detectingCraft: "शिल्प प्रकार पहचाना जा रहा है...", craftDetected: "शिल्प प्रकार पहचाना गया",
    recommended: "अनुशंसित", marketData: "बाजार डेटा के आधार पर",
    uploadCraftPhoto: "शिल्प फोटो अपलोड करें",
    aiDetects: "AI फ़ाइल नाम से श्रेणी पहचानेगी",
    clickToChange: "बदलने के लिए क्लिक करें",
    fullName: "पूरा नाम", phone: "फ़ोन नंबर", enterBazaar: "बाज़ार में प्रवेश करें",
    openShop: "मेरी दुकान खोलें", joinBuyer: "खरीदार के रूप में शामिल हों",
    joinArtisan: "कारीगर के रूप में शामिल हों",
    discoverBuy: "भारत के कारीगरों से प्रामाणिक हस्तशिल्प खोजें।",
    showcaseCraft: "दुनिया को अपनी कला दिखाएं।",
    selectCity: "अपना शहर चुनें", selectCraft: "प्राथमिक शिल्प चुनें",
    selectSpecialty: "विशेषता चुनें", interestedTeaching: "मैं अपनी कला सिखाने में रुचि रखता हूं",
    entering: "प्रवेश हो रहा है...", settingUp: "सेटअप हो रहा है...",
  },
  te: {
    shop: "దుకాణం", learn: "నేర్చుకోండి", events: "కార్యక్రమాలు", dashboard: "డాష్‌బోర్డ్",
    orders: "ఆదేశాలు", login: "లాగిన్", logout: "లాగ్అవుట్", profile: "ప్రొఫైల్",
    teachers: "ఉపాధ్యాయులు", chat: "చాట్",
    bazaar: "బజారు", discoverCrafts: "భారతదేశం అంతటా కళాకారుల నుండి హస్తకళా నిధులను కనుగొనండి.",
    searchPlaceholder: "చేతిపనులు లేదా కళాకారులను వెతకండి...", allCrafts: "అన్ని చేతిపనులు",
    allCities: "అన్ని నగరాలు", clearFilters: "ఫిల్టర్లు తీసివేయి", noCraftsFound: "చేతిపనులు కనుగొనబడలేదు",
    adjustFilters: "మీ ఫిల్టర్లు లేదా శోధన పదాన్ని సర్దుబాటు చేయండి.", viewProduct: "చూడండి",
    byArtisan: "ద్వారా", reviews: "సమీక్షలు", category: "వర్గం", city: "నగరం",
    painting: "చిత్రలేఖనం", handloom: "చేనేత", pottery: "మట్టి పని",
    addToCart: "ఇప్పుడు కొనుగోలు చేయండి", writeReview: "సమీక్ష రాయండి", submitReview: "సమీక్ష సమర్పించండి",
    yourRating: "మీ రేటింగ్", yourReview: "మీ సమీక్ష", reviewsTitle: "సమీక్షలు",
    priceRange: "ధర పరిధి", artisan: "కళాకారుడు", verified: "ధృవీకరించబడింది",
    learnTitle: "ఒక కళ నేర్చుకోండి", teachersTitle: "ఉపాధ్యాయులను కలవండి",
    enrollNow: "ఇప్పుడు చేరండి", contactTeacher: "ఉపాధ్యాయుడిని సంప్రదించండి",
    duration: "వ్యవధి", hours: "గంటలు", availableForTeaching: "బోధనకు అందుబాటులో ఉంది",
    craftEvents: "చేతిపని కార్యక్రమాలు & ప్రదర్శనలు",
    craftEventsDesc: "భారతీయ చేతిపని మాయాజాలాన్ని అనుభవించండి.",
    allTypes: "అన్ని రకాలు", booked: "బుక్ చేయబడింది", soldOut: "అమ్ముడుపోయింది",
    bookNow: "ఇప్పుడు బుక్ చేయండి", registerShowcase: "ప్రదర్శనకు నమోదు చేయండి",
    registeredShowcase: "నమోదు చేయబడింది", seatsLeft: "సీట్లు మిగిలి ఉన్నాయి",
    confirmBooking: "బుకింగ్ నిర్ధారించండి", confirming: "నిర్ధారిస్తోంది...",
    bookingDetails: "మీ స్థానాన్ని సురక్షితం చేయడానికి వివరాలు నిర్ధారించండి.",
    logInToBook: "టికెట్లు బుక్ చేయడానికి లాగిన్ చేయండి",
    myCrafts: "నా చేతిపనులు", myCourses: "నా కోర్సులు",
    teachingRequests: "అభ్యర్థనలు",
    myWorkshop: "నా వర్క్‌షాప్", manageYourBusiness: "మీ చేతిపనులు, కోర్సులు మరియు వ్యాపారాన్ని నిర్వహించండి.",
    manageProducts: "ఉత్పత్తులు నిర్వహించండి", manageCourses: "కోర్సులు నిర్వహించండి",
    addCraft: "చేతిపని జోడించు", addCourse: "కోర్సు జోడించు",
    addNewCraft: "కొత్త చేతిపని జోడించు", listNewItem: "కొనుగోలుదారుల కోసం మీ దుకాణంలో కొత్త వస్తువు జోడించండి.",
    addNewCourse: "కొత్త కోర్సు జోడించు", offerClasses: "మీ కళను నేర్పించడానికి తరగతులు అందించండి.",
    productTitle: "శీర్షిక", productDesc: "వివరణ", productPrice: "మీ ధర (₹)",
    productCategory: "వర్గం", productSubcategory: "ఉప వర్గం",
    courseTitle: "కోర్సు శీర్షిక", courseDuration: "వ్యవధి (గంటలు)", coursePrice: "ధర (₹)",
    courseDesc: "వివరణ", courseWhat: "విద్యార్థులు ఏమి నేర్చుకుంటారు...",
    dictate: "చెప్పండి", stopRecording: "ఆపు", addToShop: "దుకాణంలో జోడించు",
    adding: "జోడిస్తోంది...", addingCourse: "జోడిస్తోంది...",
    noProductsYet: "మీరు ఇంకా ఏ ఉత్పత్తులను జోడించలేదు.",
    addFirstCraft: "మీ మొదటి చేతిపని జోడించండి",
    noCoursesYet: "మీరు ఇంకా కోర్సులు జాబితా చేయలేదు.",
    createFirstCourse: "మీ మొదటి కోర్సు సృష్టించండి",
    productAdded: "ఉత్పత్తి విజయవంతంగా జోడించబడింది!",
    productRemoved: "ఉత్పత్తి తీసివేయబడింది",
    courseAdded: "కోర్సు విజయవంతంగా జోడించబడింది!",
    failedAddProduct: "ఉత్పత్తి జోడించడం విఫలమైంది",
    failedAddCourse: "కోర్సు జోడించడం విఫలమైంది",
    requestsTitle: "బోధన అభ్యర్థనలు",
    requestsDesc: "మీ కళ నేర్చుకోవాలనుకునే విద్యార్థులు.",
    accept: "అంగీకరించండి", dismiss: "తిరస్కరించండి", accepted: "అంగీకరించబడింది",
    acceptedMsg: "అంగీకరించబడింది! విద్యార్థితో అనుసంధానం అవుతారు.",
    dismissedMsg: "అభ్యర్థన తిరస్కరించబడింది",
    noRequests: "ఇంకా బోధన అభ్యర్థనలు లేవు.",
    noRequestsDesc: "విద్యార్థులు మీ నుండి నేర్చుకోవాలనుకున్నప్పుడు ఇక్కడ కనిపిస్తారు.",
    trendTitle: "మీ వర్గంలో ట్రెండింగ్",
    trendSubtitle: "మార్కెట్ డేటా ఆధారంగా — వీటిని కూడా తయారు చేయడం పరిగణించండి",
    demandVeryHigh: "చాలా అధిక డిమాండ్", demandHigh: "అధిక డిమాండ్", demandMedium: "మధ్యస్థం",
    editProfile: "ప్రొఫైల్ సవరించు", save: "సేవ్ చేయి", about: "గురించి", bio: "జీవిత చరిత్ర",
    gallery: "పని గ్యాలరీ", addPhoto: "ఫోటో జోడించు", profileSaved: "ప్రొఫైల్ సేవ్ అయింది!",
    speakProfile: "ప్రొఫైల్ చదవండి", stopSpeaking: "ఆపు",
    suggestedPrice: "సూచించిన ధర పరిధి", uploadImage: "చిత్రం అప్‌లోడ్ చేయండి",
    detectingCraft: "కళ రకాన్ని గుర్తిస్తోంది...", craftDetected: "కళ రకం గుర్తించబడింది",
    recommended: "సిఫార్సు చేయబడింది", marketData: "మార్కెట్ డేటా ఆధారంగా",
    uploadCraftPhoto: "చేతిపని ఫోటో అప్‌లోడ్ చేయండి",
    aiDetects: "AI ఫైల్ పేరు నుండి వర్గాన్ని గుర్తిస్తుంది",
    clickToChange: "మార్చడానికి క్లిక్ చేయండి",
    fullName: "పూర్తి పేరు", phone: "ఫోన్ నంబర్", enterBazaar: "బజారులోకి వెళ్ళండి",
    openShop: "నా దుకాణం తెరువు", joinBuyer: "కొనుగోలుదారుగా చేరండి",
    joinArtisan: "కళాకారుడిగా చేరండి",
    discoverBuy: "నిజమైన హస్తకళా నిధులను కనుగొని కొనుగోలు చేయండి.",
    showcaseCraft: "మీ కళను ప్రపంచానికి చూపించండి.",
    selectCity: "మీ నగరాన్ని ఎంచుకోండి", selectCraft: "ప్రాథమిక కళను ఎంచుకోండి",
    selectSpecialty: "ప్రత్యేకతను ఎంచుకోండి", interestedTeaching: "నేను నా కళను నేర్పించడానికి ఆసక్తి ఉంది",
    entering: "ప్రవేశిస్తోంది...", settingUp: "సెటప్ అవుతోంది...",
  },
  ta: {
    shop: "கடை", learn: "கற்க", events: "நிகழ்வுகள்", dashboard: "முகப்பு",
    orders: "ஆர்டர்கள்", login: "உள்நுழை", logout: "வெளியேறு", profile: "சுயவிவரம்",
    teachers: "ஆசிரியர்கள்", chat: "அரட்டை",
    bazaar: "சந்தை", discoverCrafts: "இந்தியா முழுவதும் கலைஞர்களிடமிருந்து கைவினைப் பொக்கிஷங்களை கண்டுபிடிக்கவும்.",
    searchPlaceholder: "கைவினைகள் அல்லது கலைஞர்களை தேடவும்...", allCrafts: "அனைத்து கைவினைகள்",
    allCities: "அனைத்து நகரங்கள்", clearFilters: "வடிகட்டிகளை அழி", noCraftsFound: "கைவினைகள் கிடைக்கவில்லை",
    adjustFilters: "உங்கள் வடிகட்டிகளை அல்லது தேடல் சொல்லை சரிசெய்யவும்.", viewProduct: "பார்க்க",
    byArtisan: "ஆல்", reviews: "மதிப்புரைகள்", category: "வகை", city: "நகரம்",
    painting: "ஓவியம்", handloom: "கைத்தறி", pottery: "மண் பாத்திரம்",
    addToCart: "இப்போதே வாங்கு", writeReview: "மதிப்புரை எழுதுக", submitReview: "மதிப்புரை சமர்ப்பி",
    yourRating: "உங்கள் மதிப்பீடு", yourReview: "உங்கள் மதிப்புரை", reviewsTitle: "மதிப்புரைகள்",
    priceRange: "விலை வரம்பு", artisan: "கலைஞர்", verified: "சரிபார்க்கப்பட்டது",
    learnTitle: "ஒரு கலையை கற்கவும்", teachersTitle: "ஆசிரியர்களை சந்திக்கவும்",
    enrollNow: "இப்போதே சேர்க", contactTeacher: "ஆசிரியரை தொடர்பு கொள்ளவும்",
    duration: "காலம்", hours: "மணிநேரம்", availableForTeaching: "கற்பிக்க கிடைக்கிறார்",
    craftEvents: "கைவினை நிகழ்வுகள் & கண்காட்சிகள்",
    craftEventsDesc: "இந்திய கைவினையின் மாயத்தை நேரில் அனுபவிக்கவும்.",
    allTypes: "அனைத்து வகைகள்", booked: "பதிவு செய்யப்பட்டது", soldOut: "விற்றுத் தீர்ந்தது",
    bookNow: "இப்போதே பதிவு செய்", registerShowcase: "காட்சிக்கு பதிவு செய்யவும்",
    registeredShowcase: "பதிவு செய்யப்பட்டது", seatsLeft: "இடங்கள் உள்ளன",
    confirmBooking: "பதிவை உறுதிப்படுத்து", confirming: "உறுதிப்படுத்துகிறது...",
    bookingDetails: "உங்கள் இடத்தை உறுதிப்படுத்த விவரங்களை நிரப்பவும்.",
    logInToBook: "டிக்கெட்டுகள் பதிவு செய்ய உள்நுழையவும்",
    myCrafts: "என் கைவினைகள்", myCourses: "என் பாடங்கள்",
    teachingRequests: "கோரிக்கைகள்",
    myWorkshop: "என் பட்டறை", manageYourBusiness: "உங்கள் கைவினைகள், பாடங்கள் மற்றும் வணிகத்தை நிர்வகிக்கவும்.",
    manageProducts: "தயாரிப்புகளை நிர்வகிக்கவும்", manageCourses: "பாடங்களை நிர்வகிக்கவும்",
    addCraft: "கைவினை சேர்", addCourse: "பாடம் சேர்",
    addNewCraft: "புதிய கைவினை சேர்க்கவும்", listNewItem: "வாங்குபவர்களுக்காக உங்கள் கடையில் புதிய பொருளை பட்டியலிடவும்.",
    addNewCourse: "புதிய பாடம் சேர்க்கவும்", offerClasses: "உங்கள் கலையை கற்பிக்க வகுப்புகளை வழங்கவும்.",
    productTitle: "தலைப்பு", productDesc: "விவரம்", productPrice: "உங்கள் விலை (₹)",
    productCategory: "வகை", productSubcategory: "உப வகை",
    courseTitle: "பாட தலைப்பு", courseDuration: "காலம் (மணிநேரம்)", coursePrice: "விலை (₹)",
    courseDesc: "விவரம்", courseWhat: "மாணவர்கள் என்ன கற்பார்கள்...",
    dictate: "சொல்லுங்கள்", stopRecording: "நிறுத்து", addToShop: "கடையில் சேர்",
    adding: "சேர்க்கிறது...", addingCourse: "சேர்க்கிறது...",
    noProductsYet: "நீங்கள் இன்னும் எந்த தயாரிப்பையும் சேர்க்கவில்லை.",
    addFirstCraft: "உங்கள் முதல் கைவினையை சேர்க்கவும்",
    noCoursesYet: "நீங்கள் இன்னும் பாடங்களை பட்டியலிடவில்லை.",
    createFirstCourse: "உங்கள் முதல் பாடத்தை உருவாக்கவும்",
    productAdded: "தயாரிப்பு வெற்றிகரமாக சேர்க்கப்பட்டது!",
    productRemoved: "தயாரிப்பு அகற்றப்பட்டது",
    courseAdded: "பாடம் வெற்றிகரமாக சேர்க்கப்பட்டது!",
    failedAddProduct: "தயாரிப்பு சேர்க்க தவறியது",
    failedAddCourse: "பாடம் சேர்க்க தவறியது",
    requestsTitle: "கற்பித்தல் கோரிக்கைகள்",
    requestsDesc: "உங்கள் கலையை கற்க ஆர்வமுள்ள மாணவர்கள்.",
    accept: "ஏற்கவும்", dismiss: "நிராகரி", accepted: "ஏற்கப்பட்டது",
    acceptedMsg: "ஏற்கப்பட்டது! மாணவருடன் இணைக்கப்படுவீர்கள்.",
    dismissedMsg: "கோரிக்கை நிராகரிக்கப்பட்டது",
    noRequests: "இன்னும் கற்பித்தல் கோரிக்கைகள் இல்லை.",
    noRequestsDesc: "மாணவர்கள் உங்களிடம் கற்க விரும்பும்போது இங்கே தோன்றுவார்கள்.",
    trendTitle: "உங்கள் வகையில் டிரெண்டிங்",
    trendSubtitle: "சந்தை தரவு அடிப்படையில் — இவற்றையும் செய்வதை கவனியுங்கள்",
    demandVeryHigh: "மிக அதிக தேவை", demandHigh: "அதிக தேவை", demandMedium: "நடுத்தரம்",
    editProfile: "சுயவிவரம் திருத்து", save: "சேமி", about: "பற்றி", bio: "சுய விவரம்",
    gallery: "படைப்பு தொகுப்பு", addPhoto: "புகைப்படம் சேர்", profileSaved: "சுயவிவரம் சேமிக்கப்பட்டது!",
    speakProfile: "சுயவிவரம் கேட்கவும்", stopSpeaking: "நிறுத்து",
    suggestedPrice: "பரிந்துரைக்கப்பட்ட விலை வரம்பு", uploadImage: "படம் பதிவேற்றவும்",
    detectingCraft: "கைவினை வகை கண்டறியப்படுகிறது...", craftDetected: "கைவினை வகை கண்டறியப்பட்டது",
    recommended: "பரிந்துரைக்கப்பட்டது", marketData: "சந்தை தரவு அடிப்படையில்",
    uploadCraftPhoto: "கைவினை புகைப்படம் பதிவேற்றவும்",
    aiDetects: "AI கோப்பு பெயரிலிருந்து வகையை கண்டறியும்",
    clickToChange: "மாற்ற கிளிக் செய்யவும்",
    fullName: "முழு பெயர்", phone: "தொலைபேசி எண்", enterBazaar: "சந்தையில் நுழைக",
    openShop: "என் கடையை திறக்கவும்", joinBuyer: "வாங்குபவராக சேரவும்",
    joinArtisan: "கலைஞராக சேரவும்",
    discoverBuy: "நம்பகமான கைவினைப் பொக்கிஷங்களை கண்டுபிடித்து வாங்கவும்.",
    showcaseCraft: "உங்கள் கலையை உலகுக்கு காட்டுங்கள்.",
    selectCity: "உங்கள் நகரத்தை தேர்ந்தெடுக்கவும்", selectCraft: "முதன்மை கலையை தேர்ந்தெடுக்கவும்",
    selectSpecialty: "சிறப்பியல்பை தேர்ந்தெடுக்கவும்", interestedTeaching: "நான் என் கலையை கற்பிக்க ஆர்வமாக இருக்கிறேன்",
    entering: "நுழைகிறது...", settingUp: "அமைக்கிறது...",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    const stored = localStorage.getItem("artisan_path_lang") as SupportedLanguage;
    if (stored && ['en', 'hi', 'te', 'ta'].includes(stored)) setLanguageState(stored);
  }, []);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem("artisan_path_lang", lang);
  };

  const t = (key: string) => translations[language][key] || translations['en'][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}
