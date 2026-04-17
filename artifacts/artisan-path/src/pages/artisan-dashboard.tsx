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
  useListEvents,
  getListEventsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mic, Trash2, PlusCircle, Package, GraduationCap, MicOff, CalendarDays, ImagePlus, Sparkles, MessageSquare, Star, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

const CRAFT_DETECTION_KEYWORDS: Array<{ keywords: string[]; category: keyof typeof CATEGORIES; subcategory: string }> = [
  { keywords: ["saree", "sari", "fabric", "weave", "handloom", "textile", "silk", "cotton", "ikat", "kalamkari"], category: "Handloom", subcategory: "Cotton Saree" },
  { keywords: ["painting", "art", "warli", "madhubani", "gond", "tanjore", "pattachitra", "canvas", "watercolor"], category: "Painting", subcategory: "Warli" },
  { keywords: ["pot", "pottery", "ceramic", "clay", "terracotta", "earthen", "vase", "lamp", "bowl"], category: "Pottery", subcategory: "Clay Pot" },
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
  // Seed some demo requests for artisans who opted in to teaching
  return [
    { id: "1", studentName: "Priya Sharma", skill: "Warli Painting", message: "I would love to learn Warli art from you. I am a beginner.", date: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "2", studentName: "Ravi Kumar", skill: "Pottery", message: "Interested in weekend pottery classes. Do you offer group sessions?", date: new Date(Date.now() - 86400000 * 5).toISOString() },
  ];
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

  // Course form
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCat, setCourseCat] = useState<string>(artisan?.category || "");
  const [courseSubcat, setCourseSubcat] = useState<string>(artisan?.subcategory || "");
  const [courseHrs, setCourseHrs] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [addCourseOpen, setAddCourseOpen] = useState(false);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Teaching requests
  const [teachingRequests, setTeachingRequests] = useState<TeachingRequest[]>([]);

  useEffect(() => {
    if (artisan && artisan.availableForTeaching) {
      setTeachingRequests(loadTeachingRequests(artisan.id));
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

  const { data: allEvents = [] } = useListEvents({}, {
    query: { enabled: !!artisan, queryKey: getListEventsQueryKey({}) }
  });
  // Show upcoming events the artisan might have showcased at (just show all events for now)
  const upcomingEvents = allEvents.slice(0, 4);

  const createProdMutation = useCreateProduct();
  const deleteProdMutation = useDeleteProduct();
  const createCourseMutation = useCreateCourse();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    setCraftDetected(false);

    // Simulate AI detection from filename
    const detected = detectCraftFromFilename(file.name);
    if (detected) {
      setTimeout(() => {
        setProdCat(detected.category);
        setProdSubcat(detected.subcategory);
        const range = PRICE_RANGES[detected.category];
        if (range && !prodPrice) setProdPrice(String(range.recommended));
        setCraftDetected(true);
        toast({ title: `${t("craftDetected")}: ${detected.category} — ${detected.subcategory}` });
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
      toast({ title: "Voice recognition not supported in this browser", variant: "destructive" });
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

    recognition.onerror = () => {
      setIsRecording(false);
      toast({ title: "Error recording voice", variant: "destructive" });
    };

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
        toast({ title: "Product added successfully!" });
        setAddProdOpen(false);
        refetchProducts();
        setProdTitle(""); setProdDesc(""); setProdPrice(""); setProdImageBase64(""); setProdImageName(""); setCraftDetected(false);
      },
      onError: () => toast({ title: "Failed to add product", variant: "destructive" })
    });
  };

  const handleDeleteProduct = (id: number) => {
    deleteProdMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Product removed" });
        refetchProducts();
      }
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
        subcategory: courseSubcat,
        durationHours: parseInt(courseHrs),
        price: parseFloat(coursePrice),
        imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f"
      }
    }, {
      onSuccess: () => {
        toast({ title: "Course added successfully!" });
        setAddCourseOpen(false);
        refetchCourses();
        setCourseTitle(""); setCourseDesc(""); setCourseHrs(""); setCoursePrice("");
      },
      onError: () => toast({ title: "Failed to add course", variant: "destructive" })
    });
  };

  const dismissRequest = (id: string) => {
    const updated = teachingRequests.filter(r => r.id !== id);
    setTeachingRequests(updated);
    if (artisan) {
      localStorage.setItem(TEACHING_REQUESTS_KEY + artisan.id, JSON.stringify(updated));
    }
    toast({ title: "Request dismissed" });
  };

  const priceRange = PRICE_RANGES[prodCat as keyof typeof PRICE_RANGES];

  if (!artisan) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">My Workshop</h1>
          <p className="text-muted-foreground">Manage your crafts, courses, and business.</p>
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
          <TabsTrigger value="events" className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium whitespace-nowrap">
            <CalendarDays className="w-4 h-4 mr-2" /> {t('myEvents')}
          </TabsTrigger>
          {artisan.availableForTeaching && (
            <TabsTrigger value="requests" className="px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium whitespace-nowrap">
              <MessageSquare className="w-4 h-4 mr-2" /> {t('teachingRequests')}
              {teachingRequests.length > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-xs bg-destructive text-destructive-foreground">{teachingRequests.length}</Badge>
              )}
            </TabsTrigger>
          )}
        </TabsList>

        {/* My Crafts */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-bold">Manage Products</h2>
            <Dialog open={addProdOpen} onOpenChange={setAddProdOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><PlusCircle className="w-4 h-4" /> {t('addCraft')}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Craft</DialogTitle>
                  <DialogDescription>List a new item in your shop for buyers.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input required value={prodTitle} onChange={e => setProdTitle(e.target.value)} placeholder="e.g. Handwoven Kanjivaram Silk Saree" />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex justify-between items-center">
                      Description
                      <Button
                        type="button"
                        variant={isRecording ? "destructive" : "secondary"}
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={toggleRecording}
                      >
                        {isRecording ? <MicOff className="w-3 h-3 mr-1" /> : <Mic className="w-3 h-3 mr-1" />}
                        {isRecording ? "Stop" : "Dictate"}
                      </Button>
                    </Label>
                    <Textarea
                      required
                      value={prodDesc}
                      onChange={e => setProdDesc(e.target.value)}
                      rows={3}
                      placeholder="Describe your craft, materials, process..."
                      className={isRecording ? "ring-2 ring-destructive" : ""}
                    />
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
                          <img src={prodImageBase64} alt="Preview" className="w-16 h-16 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium text-foreground line-clamp-1">{prodImageName}</p>
                            {craftDetected && (
                              <div className="flex items-center gap-1 mt-1">
                                <Sparkles className="w-3 h-3 text-primary" />
                                <span className="text-xs text-primary font-medium">{t('craftDetected')}</span>
                              </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">Click to change</p>
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
                            <p className="text-sm font-medium">Upload craft photo</p>
                            <p className="text-xs text-muted-foreground">AI will auto-detect category from image name</p>
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={prodCat} onValueChange={(v) => { setProdCat(v); setCraftDetected(false); }}>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subcategory</Label>
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
                    <div className="rounded-lg bg-accent/10 border border-accent/20 p-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-semibold text-primary">{t('suggestedPrice')}</span>
                      </div>
                      <p className="text-sm text-foreground font-medium">
                        ₹{priceRange.min.toLocaleString()} – ₹{priceRange.max.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Recommended: ₹{priceRange.recommended.toLocaleString()} based on market data
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Your Price (₹)</Label>
                    <Input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={e => setProdPrice(e.target.value)}
                      placeholder={priceRange ? `Suggested: ${priceRange.recommended}` : "Enter price"}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-4" disabled={createProdMutation.isPending || imageUploading}>
                    {createProdMutation.isPending ? "Adding..." : "Add to Shop"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProducts.length > 0 ? myProducts.map(product => (
              <Card key={product.id} className="overflow-hidden border-border/50">
                <div className="aspect-[4/3] bg-muted relative">
                  <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
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
              <div className="col-span-full py-12 text-center border rounded-xl bg-card">
                <p className="text-muted-foreground mb-4">You haven't added any products yet.</p>
                <Button variant="outline" onClick={() => setAddProdOpen(true)}>Add Your First Craft</Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Courses */}
        {artisan.availableForTeaching && (
          <TabsContent value="courses">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold">Manage Courses</h2>
              <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><PlusCircle className="w-4 h-4" /> {t('addCourse')}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>Offer classes to teach your craft.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCourse} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Course Title</Label>
                      <Input required value={courseTitle} onChange={e => setCourseTitle(e.target.value)} placeholder="e.g. Warli Painting for Beginners" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea required value={courseDesc} onChange={e => setCourseDesc(e.target.value)} rows={3} placeholder="What students will learn..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={courseCat} onValueChange={setCourseCat}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Object.keys(CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (Hours)</Label>
                        <Input type="number" required value={courseHrs} onChange={e => setCourseHrs(e.target.value)} min="1" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Price (₹)</Label>
                      <Input type="number" required value={coursePrice} onChange={e => setCoursePrice(e.target.value)} />
                    </div>
                    <Button type="submit" className="w-full mt-4" disabled={createCourseMutation.isPending}>
                      {createCourseMutation.isPending ? "Adding..." : "Add Course"}
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
                      <span className="text-sm text-muted-foreground">{course.durationHours} Hours</span>
                      <span className="font-semibold text-lg text-primary">₹{course.price}</span>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-full py-12 text-center border rounded-xl bg-card">
                  <p className="text-muted-foreground mb-4">You haven't listed any courses yet.</p>
                  <Button variant="outline" onClick={() => setAddCourseOpen(true)}>Create Your First Course</Button>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* My Events */}
        <TabsContent value="events">
          <div className="mb-6">
            <h2 className="text-xl font-serif font-bold mb-1">Upcoming Events</h2>
            <p className="text-sm text-muted-foreground">Craft fairs and exhibitions where you can showcase your work.</p>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {upcomingEvents.map(event => (
                <Card key={event.id} className="border-border/50 overflow-hidden flex flex-col sm:flex-row">
                  <div className="sm:w-36 aspect-video sm:aspect-auto bg-muted relative shrink-0">
                    <img
                      src={event.imageUrl || "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=400&q=80"}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 left-2 text-xs bg-background/80 text-foreground border-none">
                      {event.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4 flex-1">
                    <h3 className="font-serif font-bold line-clamp-1">{event.name}</h3>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-primary" />
                        {format(new Date(event.date), "MMM d, yyyy")}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        {event.location}, {event.city}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="mt-3 w-full text-xs">
                      Register to Showcase
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border rounded-xl bg-card">
              <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming events found.</p>
            </div>
          )}
        </TabsContent>

        {/* Teaching Requests */}
        {artisan.availableForTeaching && (
          <TabsContent value="requests">
            <div className="mb-6">
              <h2 className="text-xl font-serif font-bold mb-1">Teaching Requests</h2>
              <p className="text-sm text-muted-foreground">Students interested in learning your craft.</p>
            </div>

            {teachingRequests.length > 0 ? (
              <div className="space-y-4">
                {teachingRequests.map(req => (
                  <Card key={req.id} className="border-border/50">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-bold text-primary">{req.studentName.charAt(0)}</span>
                            </div>
                            <div>
                              <h3 className="font-semibold">{req.studentName}</h3>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(req.date), "MMM d, yyyy")}
                              </p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="mb-2 text-xs">{req.skill}</Badge>
                          <p className="text-sm text-muted-foreground">{req.message}</p>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          <Button size="sm" className="text-xs px-3">Accept</Button>
                          <Button size="sm" variant="ghost" className="text-xs px-3" onClick={() => dismissRequest(req.id)}>Dismiss</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center border rounded-xl bg-card">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No teaching requests yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Students will appear here when they request to learn from you.</p>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
