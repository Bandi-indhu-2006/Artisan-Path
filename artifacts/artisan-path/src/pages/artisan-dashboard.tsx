import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, useLanguage } from "@/lib/context";
import {
  useCreateProduct,
  useListProducts,
  getListProductsQueryKey,
  useDeleteProduct,
  useCreateCourse,
  useListCourses,
  getListCoursesQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Mic, Trash2, PlusCircle, Package, GraduationCap, MicOff,
  ImagePlus, Sparkles, MessageSquare, Star, MapPin, TrendingUp,
  CheckCircle2, ArrowUpRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";

const CATEGORIES = {
  Painting: ["Warli", "Madhubani", "Tanjore", "Gond", "Pattachitra"],
  Handloom: ["Kanchipuram Silk Saree", "Banarasi Silk Saree", "Cotton Saree", "Kalamkari Saree", "Ikat Saree"],
  Pottery: ["Clay Pot", "Terracotta", "Ceramic Vase", "Earthen Lamp", "Decorative Pot"],
};

const PRICE_RANGES: Record<string, { min: number; max: number; recommended: number }> = {
  Painting: { min: 1500, max: 8000, recommended: 3500 },
  Handloom: { min: 2000, max: 15000, recommended: 6000 },
  Pottery: { min: 500, max: 3000, recommended: 1200 },
};

const TREND_RECOMMENDATIONS: Record<string, Array<{ item: string; demand: string; boost: string; tip: string; emoji: string }>> = {
  Handloom: [
    { item: "Laptop Bags", demand: "Very High", boost: "+40%", tip: "WFH culture is driving huge demand for handwoven bags", emoji: "💼" },
    { item: "Cushion Covers", demand: "High", boost: "+25%", tip: "Interior décor boom — buyers pay premium for handmade", emoji: "🛋️" },
    { item: "Table Runners", demand: "High", boost: "+20%", tip: "Popular for wedding gifting across South India", emoji: "🎁" },
  ],
  Painting: [
    { item: "Painted Tote Bags", demand: "Very High", boost: "+35%", tip: "Eco-conscious buyers love custom painted totes", emoji: "👜" },
    { item: "Phone Cover Prints", demand: "High", boost: "+30%", tip: "Custom art accessories sell out fast on Instagram", emoji: "📱" },
    { item: "Gift Stationery Sets", demand: "High", boost: "+22%", tip: "Corporate gifting market is exploding post-Diwali", emoji: "📦" },
  ],
  Pottery: [
    { item: "Indoor Plant Pots", demand: "Very High", boost: "+50%", tip: "Indoor gardening trend is viral — these sell out in days", emoji: "🪴" },
    { item: "Candle Holders", demand: "High", boost: "+30%", tip: "Aromatherapy & home decor trend is driving huge sales", emoji: "🕯️" },
    { item: "Artisan Tea Sets", demand: "High", boost: "+25%", tip: "Artisanal chai culture is huge on social media right now", emoji: "☕" },
  ],
};

const CRAFT_DETECTION_KEYWORDS: Array<{ keywords: string[]; category: keyof typeof CATEGORIES; subcategory: string }> = [
  { keywords: ["saree", "sari", "fabric", "weave", "handloom", "textile", "silk", "cotton", "ikat", "kalamkari", "blanket", "shawl", "stole", "dupatta", "scarf"], category: "Handloom", subcategory: "Cotton Saree" },
  { keywords: ["painting", "art", "warli", "madhubani", "gond", "tanjore", "pattachitra", "canvas", "watercolor", "sketch"], category: "Painting", subcategory: "Warli" },
  { keywords: ["pot", "pottery", "ceramic", "clay", "terracotta", "earthen", "vase", "lamp", "bowl", "mug", "cup"], category: "Pottery", subcategory: "Clay Pot" },
];

function detectCraftFromFilename(filename: string): { category: string; subcategory: string } | null {
  const lower = filename.toLowerCase().replace(/[_\-\.]/g, " ");
  for (const entry of CRAFT_DETECTION_KEYWORDS) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return { category: entry.category, subcategory: entry.subcategory };
    }
  }
  return null;
}

const TEACHING_REQUESTS_KEY = "artisan_path_teaching_requests_";
const ACCEPTED_REQUESTS_KEY = "artisan_path_accepted_requests_";

type TeachingRequest = {
  id: string;
  studentName: string;
  skill: string;
  message: string;
  date: string;
};

function loadTeachingRequests(artisanId: number): TeachingRequest[] {
  try {
    const stored = localStorage.getItem(TEACHING_REQUESTS_KEY + artisanId);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [
    { id: "1", studentName: "Priya Sharma", skill: "Warli Painting", message: "I would love to learn Warli art from you. I am a beginner.", date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "2", studentName: "Ravi Kumar", skill: "Pottery", message: "Interested in weekend pottery classes. Do you offer group sessions?", date: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: "3", studentName: "Ananya Singh", skill: "Handloom Weaving", message: "Can you teach me the basics of handloom weaving? Very eager to learn!", date: new Date(Date.now() - 86400000 * 1).toISOString() },
  ];
}

function loadAcceptedIds(artisanId: number): string[] {
  try {
    const stored = localStorage.getItem(ACCEPTED_REQUESTS_KEY + artisanId);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export default function ArtisanDashboard() {
  const { artisan } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!artisan) setLocation("/");
  }, [artisan, setLocation]);

  // Product form
  const [prodTitle, setProdTitle] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCat, setProdCat] = useState<string>(artisan?.category || "");
  const [prodSubcat, setProdSubcat] = useState<string>(artisan?.subcategory || "");
  const [prodImageBase64, setProdImageBase64] = useState<string>("");
  const [prodImageName, setProdImageName] = useState<string>("");
  const [prodPrice, setProdPrice] = useState("");
  const [addProdOpen, setAddProdOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [craftDetected, setCraftDetected] = useState(false);
  const [trendCategory, setTrendCategory] = useState<string>("");

  // Course form
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCat, setCourseCat] = useState<string>(artisan?.category || "");
  const [courseHrs, setCourseHrs] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [addCourseOpen, setAddCourseOpen] = useState(false);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Teaching requests
  const [teachingRequests, setTeachingRequests] = useState<TeachingRequest[]>([]);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);

  useEffect(() => {
    if (artisan && artisan.availableForTeaching) {
      setTeachingRequests(loadTeachingRequests(artisan.id));
      setAcceptedIds(loadAcceptedIds(artisan.id));
    }
  }, [artisan]);

  const productParams = artisan ? { artisanId: artisan.id } : {};
  const { data: myProducts = [], refetch: refetchProducts } = useListProducts(productParams, {
    query: { enabled: !!artisan, queryKey: getListProductsQueryKey(productParams) }
  });

  const { data: myCourses = [], refetch: refetchCourses } = useListCourses({}, {
    query: { enabled: !!artisan, queryKey: getListCoursesQueryKey({}) }
  });
  const artisanCourses = myCourses.filter(c => c.artisanId === artisan?.id);

  const createProdMutation = useCreateProduct();
  const deleteProdMutation = useDeleteProduct();
  const createCourseMutation = useCreateCourse();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setCraftDetected(false);
    setTrendCategory("");

    const detected = detectCraftFromFilename(file.name);
    if (detected) {
      setTimeout(() => {
        setProdCat(detected.category);
        setProdSubcat(detected.subcategory);
        const range = PRICE_RANGES[detected.category];
        if (range && !prodPrice) setProdPrice(String(range.recommended));
        setCraftDetected(true);
        setTrendCategory(detected.category);
        toast({
          title: `✨ ${t("craftDetected")}: ${detected.category}`,
          description: `${detected.subcategory} — ${t("suggestedPrice")} added`,
        });
      }, 800);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProdImageBase64(reader.result as string);
      setProdImageName(file.name);
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ title: "Voice recognition not supported", variant: "destructive" });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setProdDesc(prev => prev ? `${prev} ${text}` : text);
      setIsRecording(false);
    };
    recognition.onerror = () => { setIsRecording(false); toast({ title: "Error recording", variant: "destructive" }); };
    recognition.onend = () => { setIsRecording(false); };
    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artisan) return;
    createProdMutation.mutate({
      data: {
        artisanId: artisan.id,
        title: prodTitle,
        description: prodDesc,
        category: prodCat,
        subcategory: prodSubcat,
        imageUrl: prodImageBase64 || "https://images.unsplash.com/photo-1605335552317-5e927db43bce",
        price: parseFloat(prodPrice),
        city: artisan.city
      }
    }, {
      onSuccess: () => {
        toast({ title: t("productAdded") });
        setAddProdOpen(false);
        refetchProducts();
        setProdTitle(""); setProdDesc(""); setProdPrice(""); setProdImageBase64(""); setProdImageName(""); setCraftDetected(false); setTrendCategory("");
      },
      onError: () => toast({ title: t("failedAddProduct"), variant: "destructive" })
    });
  };

  const handleDeleteProduct = (id: number) => {
    deleteProdMutation.mutate({ id }, {
      onSuccess: () => { toast({ title: t("productRemoved") }); refetchProducts(); }
    });
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artisan) return;
    createCourseMutation.mutate({
      data: {
        artisanId: artisan.id,
        title: courseTitle,
        description: courseDesc,
        category: courseCat,
        subcategory: artisan.subcategory,
        durationHours: parseInt(courseHrs),
        price: parseFloat(coursePrice),
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f"
      }
    }, {
      onSuccess: () => {
        toast({ title: t("courseAdded") });
        setAddCourseOpen(false);
        refetchCourses();
        setCourseTitle(""); setCourseDesc(""); setCourseHrs(""); setCoursePrice("");
      },
      onError: () => toast({ title: t("failedAddCourse"), variant: "destructive" })
    });
  };

  const handleAccept = (id: string) => {
    const newAccepted = [...acceptedIds, id];
    setAcceptedIds(newAccepted);
    if (artisan) {
      localStorage.setItem(ACCEPTED_REQUESTS_KEY + artisan.id, JSON.stringify(newAccepted));
    }
    toast({
      title: "✅ " + t("acceptedMsg"),
      description: "The student will be notified.",
    });
  };

  const dismissRequest = (id: string) => {
    const updated = teachingRequests.filter(r => r.id !== id);
    setTeachingRequests(updated);
    if (artisan) {
      localStorage.setItem(TEACHING_REQUESTS_KEY + artisan.id, JSON.stringify(updated));
      // Also remove from accepted if present
      const newAccepted = acceptedIds.filter(a => a !== id);
      setAcceptedIds(newAccepted);
      localStorage.setItem(ACCEPTED_REQUESTS_KEY + artisan.id, JSON.stringify(newAccepted));
    }
    toast({ title: t("dismissedMsg") });
  };

  const priceRange = PRICE_RANGES[prodCat as keyof typeof PRICE_RANGES];
  const trendRecs = TREND_RECOMMENDATIONS[trendCategory] || [];
  const pendingRequests = teachingRequests.filter(r => !acceptedIds.includes(r.id));

  if (!artisan) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">{t('myWorkshop')}</h1>
          <p className="text-muted-foreground">{t('manageYourBusiness')}</p>
        </div>
        <div className="text-right">
          <div className="font-bold text-xl">{artisan.name}</div>
          <div className="flex items-center gap-1 justify-end text-sm text-muted-foreground">
            <MapPin className="w-3.5 h-3.5" />{artisan.city}
          </div>
          <div className="flex items-center gap-1 justify-end mt-0.5">
            <Star className="w-3.5 h-3.5 fill-accent text-accent" />
            <span className="text-sm font-medium">{artisan.rating?.toFixed(1) || "4.5"}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6 h-12 bg-card border border-border overflow-x-auto flex-nowrap w-full justify-start">
          <TabsTrigger value="products" className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium whitespace-nowrap">
            <Package className="w-4 h-4 mr-2" /> {t('myCrafts')}
          </TabsTrigger>
          {artisan.availableForTeaching && (
            <TabsTrigger value="courses" className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium whitespace-nowrap">
              <GraduationCap className="w-4 h-4 mr-2" /> {t('myCourses')}
            </TabsTrigger>
          )}
          {artisan.availableForTeaching && (
            <TabsTrigger value="requests" className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium whitespace-nowrap">
              <MessageSquare className="w-4 h-4 mr-2" /> {t('teachingRequests')}
              {pendingRequests.length > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-xs bg-destructive text-destructive-foreground">{pendingRequests.length}</Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* My Crafts */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-bold">{t('manageProducts')}</h2>
            <Dialog open={addProdOpen} onOpenChange={(o) => { setAddProdOpen(o); if (!o) { setTrendCategory(""); setCraftDetected(false); } }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><PlusCircle className="w-4 h-4" /> {t('addCraft')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t('addNewCraft')}</DialogTitle>
                  <DialogDescription>{t('listNewItem')}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{t('productTitle')}</Label>
                    <Input required value={prodTitle} onChange={e => setProdTitle(e.target.value)} placeholder="e.g. Handwoven Kanjivaram Silk Saree" />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex justify-between items-center">
                      {t('productDesc')}
                      <Button type="button" variant={isRecording ? "destructive" : "secondary"} size="sm" className="h-7 px-2 text-xs" onClick={toggleRecording}>
                        {isRecording ? <MicOff className="w-3 h-3 mr-1" /> : <Mic className="w-3 h-3 mr-1" />}
                        {isRecording ? t('stopRecording') : t('dictate')}
                      </Button>
                    </Label>
                    <Textarea required value={prodDesc} onChange={e => setProdDesc(e.target.value)} rows={3} placeholder="Describe your craft, materials, process..." className={isRecording ? "ring-2 ring-destructive" : ""} />
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label>{t('uploadImage')}</Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-4 cursor-pointer flex items-center gap-3 transition-colors ${prodImageBase64 ? 'border-primary/50 bg-primary/5' : 'border-border hover:border-primary/40'}`}
                    >
                      {prodImageBase64 ? (
                        <>
                          <img src={prodImageBase64} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                          <div>
                            <p className="text-sm font-medium text-foreground line-clamp-1">{prodImageName}</p>
                            {craftDetected && (
                              <div className="flex items-center gap-1 mt-1">
                                <Sparkles className="w-3 h-3 text-primary" />
                                <span className="text-xs text-primary font-medium">{t('craftDetected')}</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">{t('clickToChange')}</p>
                          </div>
                        </>
                      ) : imageUploading ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          <span className="text-sm">{t('detectingCraft')}</span>
                        </div>
                      ) : (
                        <>
                          <ImagePlus className="w-8 h-8 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{t('uploadCraftPhoto')}</p>
                            <p className="text-xs text-muted-foreground">{t('aiDetects')}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </div>

                  {/* Trend Recommendations — shown after image upload detects a category */}
                  {trendRecs.length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{t('trendTitle')}</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400">{t('trendSubtitle')}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {trendRecs.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 bg-white/60 dark:bg-white/5 rounded-lg px-3 py-2 border border-amber-100 dark:border-amber-900">
                            <span className="text-lg leading-none mt-0.5">{rec.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-semibold text-foreground">{rec.item}</span>
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 flex items-center gap-0.5">
                                  <ArrowUpRight className="w-3 h-3" />{rec.boost}
                                </span>
                                <Badge className="h-4 px-1.5 text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300 border-none">
                                  {rec.demand === "Very High" ? t('demandVeryHigh') : rec.demand === "High" ? t('demandHigh') : t('demandMedium')}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{rec.tip}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t('productCategory')}</Label>
                      <Select value={prodCat} onValueChange={(v) => { setProdCat(v); setCraftDetected(false); setTrendCategory(""); }}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('productSubcategory')}</Label>
                      <Select value={prodSubcat} onValueChange={setProdSubcat}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {(CATEGORIES[prodCat as keyof typeof CATEGORIES] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Price Suggestion */}
                  {priceRange && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">{t('suggestedPrice')}</span>
                      </div>
                      <p className="text-sm text-foreground font-bold">
                        ₹{priceRange.min.toLocaleString()} – ₹{priceRange.max.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t('recommended')}: ₹{priceRange.recommended.toLocaleString()} ({t('marketData')})
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>{t('productPrice')}</Label>
                    <Input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={e => setProdPrice(e.target.value)}
                      placeholder={priceRange ? `${t('recommended')}: ₹${priceRange.recommended}` : "Enter price"}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={createProdMutation.isPending || imageUploading}>
                    {createProdMutation.isPending ? t('adding') : t('addToShop')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.length > 0 ? myProducts.map(product => (
              <Card key={product.id} className="overflow-hidden border-border/50 group">
                <div className="aspect-[4/3] bg-muted relative">
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleDeleteProduct(product.id)}
                    disabled={deleteProdMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Badge className="absolute bottom-2 left-2 bg-background/80 backdrop-blur text-foreground border-none text-xs">
                    {product.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-serif font-bold text-lg line-clamp-1">{product.title}</h3>
                  <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</div>
                  <div className="mt-3 font-semibold text-lg text-primary">₹{product.price}</div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full py-16 text-center border rounded-xl bg-card">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">{t('noProductsYet')}</p>
                <Button variant="outline" onClick={() => setAddProdOpen(true)}>{t('addFirstCraft')}</Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Courses */}
        {artisan.availableForTeaching && (
          <TabsContent value="courses">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold">{t('manageCourses')}</h2>
              <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><PlusCircle className="w-4 h-4" /> {t('addCourse')}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('addNewCourse')}</DialogTitle>
                    <DialogDescription>{t('offerClasses')}</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCourse} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>{t('courseTitle')}</Label>
                      <Input required value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="e.g. Warli Painting for Beginners" />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('courseDesc')}</Label>
                      <Textarea required value={courseDesc} onChange={e => setCourseDesc(e.target.value)} rows={3} placeholder={t('courseWhat')} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('productCategory')}</Label>
                        <Select value={courseCat} onValueChange={setCourseCat}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('courseDuration')}</Label>
                        <Input type="number" required value={courseHrs} onChange={e => setCourseHrs(e.target.value)} min="1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('coursePrice')}</Label>
                      <Input type="number" required value={coursePrice} onChange={e => setCoursePrice(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={createCourseMutation.isPending}>
                      {createCourseMutation.isPending ? t('addingCourse') : t('addCourse')}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artisanCourses.length > 0 ? artisanCourses.map(course => (
                <Card key={course.id} className="overflow-hidden border-border/50">
                  <CardContent className="p-5">
                    <Badge variant="secondary" className="mb-2 text-xs">{course.category}</Badge>
                    <h3 className="font-serif font-bold text-lg line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-muted-foreground">{course.durationHours} {t('hours')}</span>
                      <span className="font-semibold text-lg text-primary">₹{course.price}</span>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full py-16 text-center border rounded-xl bg-card">
                  <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">{t('noCoursesYet')}</p>
                  <Button variant="outline" onClick={() => setAddCourseOpen(true)}>{t('createFirstCourse')}</Button>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Teaching Requests */}
        {artisan.availableForTeaching && (
          <TabsContent value="requests">
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold mb-1">{t('requestsTitle')}</h2>
              <p className="text-sm text-muted-foreground">{t('requestsDesc')}</p>
            </div>

            {teachingRequests.length > 0 ? (
              <div className="space-y-4">
                {teachingRequests.map(req => {
                  const isAccepted = acceptedIds.includes(req.id);
                  return (
                    <Card key={req.id} className={`border-border/50 transition-all ${isAccepted ? 'border-green-300 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800' : ''}`}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isAccepted ? 'bg-green-100 dark:bg-green-900/40' : 'bg-primary/10'}`}>
                                {isAccepted
                                  ? <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                                  : <span className="text-sm font-bold text-primary">{req.studentName.charAt(0)}</span>
                                }
                              </div>
                              <div>
                                <h3 className="font-semibold">{req.studentName}</h3>
                                <p className="text-xs text-muted-foreground">{format(new Date(req.date), "MMM d, yyyy")}</p>
                              </div>
                              {isAccepted && (
                                <Badge className="ml-auto text-xs bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-none">
                                  {t('accepted')} ✓
                                </Badge>
                              )}
                            </div>
                            <Badge variant="secondary" className="mb-2 text-xs">{req.skill}</Badge>
                            <p className="text-sm text-muted-foreground leading-relaxed">{req.message}</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            {!isAccepted ? (
                              <Button
                                size="sm"
                                className="text-xs px-3 bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleAccept(req.id)}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t('accept')}
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline" className="text-xs px-3 text-green-600 border-green-300 cursor-default" disabled>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                {t('accepted')}
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-xs px-3 text-muted-foreground hover:text-destructive"
                              onClick={() => dismissRequest(req.id)}
                            >
                              {t('dismiss')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center border rounded-xl bg-card">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">{t('noRequests')}</p>
                <p className="text-sm text-muted-foreground mt-1">{t('noRequestsDesc')}</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
