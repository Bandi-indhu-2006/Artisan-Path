import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/context";
import { 
  useCreateProduct, 
  useListProducts, 
  getListProductsQueryKey,
  useDeleteProduct,
  useCreateCourse,
  useListCourses,
  getListCoursesQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mic, Trash2, PlusCircle, Package, GraduationCap, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const CATEGORIES = {
  Painting: ["Warli", "Madhubani", "Tanjore", "Gond", "Pattachitra"],
  Handloom: ["Kanchipuram Silk Saree", "Banarasi Silk Saree", "Cotton Saree", "Kalamkari Saree", "Ikat Saree"],
  Pottery: ["Clay Pot", "Terracotta", "Ceramic Vase", "Earthen Lamp", "Decorative Pot"],
};

export default function ArtisanDashboard() {
  const { artisan } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!artisan) setLocation("/");
  }, [artisan, setLocation]);

  // Product form
  const [prodTitle, setProdTitle] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodCat, setProdCat] = useState<string>(artisan?.category || "");
  const [prodSubcat, setProdSubcat] = useState<string>(artisan?.subcategory || "");
  const [prodImg, setProdImg] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [addProdOpen, setAddProdOpen] = useState(false);

  // Course form
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [courseCat, setCourseCat] = useState<string>(artisan?.category || "");
  const [courseSubcat, setCourseSubcat] = useState<string>(artisan?.subcategory || "");
  const [courseHrs, setCourseHrs] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [courseImg, setCourseImg] = useState("");
  const [addCourseOpen, setAddCourseOpen] = useState(false);

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const productParams = artisan ? { artisanId: artisan.id } : {};
  const { data: myProducts = [], refetch: refetchProducts } = useListProducts(productParams, {
    query: { enabled: !!artisan, queryKey: getListProductsQueryKey(productParams) }
  });

  const courseParams = {}; // Can't filter by artisanId currently based on API params
  const { data: myCourses = [], refetch: refetchCourses } = useListCourses(courseParams, {
    query: { enabled: !!artisan, queryKey: getListCoursesQueryKey(courseParams) }
  });
  
  const artisanCourses = myCourses.filter(c => c.artisanId === artisan?.id);

  const createProdMutation = useCreateProduct();
  const deleteProdMutation = useDeleteProduct();
  const createCourseMutation = useCreateCourse();

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
    recognition.lang = 'en-IN'; // Could be dynamic

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setProdDesc(prev => prev ? `${prev} ${text}` : text);
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsRecording(false);
      toast({ title: "Error recording voice", variant: "destructive" });
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

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
        imageUrl: prodImg || "https://images.unsplash.com/photo-1605335552317-5e927db43bce",
        price: parseFloat(prodPrice),
        city: artisan.city
      }
    }, {
      onSuccess: () => {
        toast({ title: "Product added successfully!" });
        setAddProdOpen(false);
        refetchProducts();
        // Reset
        setProdTitle(""); setProdDesc(""); setProdPrice(""); setProdImg("");
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
        imageUrl: courseImg || "https://images.unsplash.com/photo-1513364776144-60967b0f800f"
      }
    }, {
      onSuccess: () => {
        toast({ title: "Course added successfully!" });
        setAddCourseOpen(false);
        refetchCourses();
      },
      onError: () => toast({ title: "Failed to add course", variant: "destructive" })
    });
  };

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
          <div className="text-sm text-muted-foreground">{artisan.city}</div>
        </div>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="mb-6 h-12 bg-card border border-border">
          <TabsTrigger value="products" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
            <Package className="w-4 h-4 mr-2" /> My Crafts
          </TabsTrigger>
          {artisan.availableForTeaching && (
            <TabsTrigger value="courses" className="px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium">
              <GraduationCap className="w-4 h-4 mr-2" /> My Courses
            </TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif font-bold">Manage Products</h2>
            <Dialog open={addProdOpen} onOpenChange={setAddProdOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Craft</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Craft</DialogTitle>
                  <DialogDescription>List a new item in your shop for buyers.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input required value={prodTitle} onChange={e => setProdTitle(e.target.value)} />
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
                      rows={4}
                      placeholder="Describe your craft, materials used, process..."
                      className={isRecording ? "ring-2 ring-destructive" : ""}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={prodCat} onValueChange={setProdCat}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subcategory</Label>
                      <Select value={prodSubcat} onValueChange={setProdSubcat}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {(CATEGORIES[prodCat as keyof typeof CATEGORIES] || []).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price (₹)</Label>
                      <Input type="number" required value={prodPrice} onChange={e => setProdPrice(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL (Optional)</Label>
                      <Input value={prodImg} onChange={e => setProdImg(e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full mt-4" disabled={createProdMutation.isPending}>
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

        {artisan.availableForTeaching && (
          <TabsContent value="courses">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-serif font-bold">Manage Courses</h2>
              <Dialog open={addCourseOpen} onOpenChange={setAddCourseOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><PlusCircle className="w-4 h-4" /> Add Course</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Course</DialogTitle>
                    <DialogDescription>Offer classes to teach your craft.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddCourse} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Course Title</Label>
                      <Input required value={courseTitle} onChange={e => setCourseTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea required value={courseDesc} onChange={e => setCourseDesc(e.target.value)} rows={3} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Duration (Hours)</Label>
                        <Input type="number" required value={courseHrs} onChange={e => setCourseHrs(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Price (₹)</Label>
                        <Input type="number" required value={coursePrice} onChange={e => setCoursePrice(e.target.value)} />
                      </div>
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
                  <CardContent className="p-4">
                    <h3 className="font-serif font-bold text-lg line-clamp-1">{course.title}</h3>
                    <div className="text-sm text-muted-foreground mt-1 mb-3">{course.durationHours} Hours</div>
                    <div className="font-semibold text-lg text-primary">₹{course.price}</div>
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
      </Tabs>
    </div>
  );
}
