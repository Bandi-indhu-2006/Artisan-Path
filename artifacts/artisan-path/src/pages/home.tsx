import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/context";
import { useLoginUser, useLoginArtisan } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, UserCircle2, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CITIES = ["Hyderabad", "Mumbai", "Delhi", "Jaipur", "Chennai", "Bangalore"];
const CATEGORIES = {
  Painting: ["Warli", "Madhubani", "Tanjore", "Gond", "Pattachitra"],
  Handloom: ["Kanchipuram Silk Saree", "Banarasi Silk Saree", "Cotton Saree", "Kalamkari Saree", "Ikat Saree"],
  Pottery: ["Clay Pot", "Terracotta", "Ceramic Vase", "Earthen Lamp", "Decorative Pot"],
};

export default function Home() {
  const [_, setLocation] = useLocation();
  const { user, artisan, loginUser, loginArtisan } = useAuth();
  const { toast } = useToast();

  const userMutation = useLoginUser();
  const artisanMutation = useLoginArtisan();

  // User form state
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [userCity, setUserCity] = useState("");

  // Artisan form state
  const [artName, setArtName] = useState("");
  const [artCategory, setArtCategory] = useState<keyof typeof CATEGORIES | "">("");
  const [artSubcategory, setArtSubcategory] = useState("");
  const [artCity, setArtCity] = useState("");
  const [artTeaching, setArtTeaching] = useState(false);

  if (user || artisan) {
    setLocation("/shop");
    return null;
  }

  const handleUserLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone || !userCity) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    userMutation.mutate(
      { data: { name: userName, phone: userPhone, city: userCity } },
      {
        onSuccess: (data) => {
          loginUser(data);
          setLocation("/shop");
        },
        onError: () => toast({ title: "Login failed", variant: "destructive" })
      }
    );
  };

  const handleArtisanLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!artName || !artCategory || !artSubcategory || !artCity) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    artisanMutation.mutate(
      { data: { name: artName, category: artCategory, subcategory: artSubcategory, city: artCity, availableForTeaching: artTeaching } },
      {
        onSuccess: (data) => {
          loginArtisan(data);
          setLocation("/artisan-dashboard");
        },
        onError: () => toast({ title: "Login failed", variant: "destructive" })
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1605335552317-5e927db43bce')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
      
      <div className="z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-foreground">Welcome to ArtisanPath</h1>
          <p className="text-muted-foreground text-lg">Celebrate India's finest crafts</p>
        </div>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-card/50 backdrop-blur border border-border rounded-xl">
            <TabsTrigger value="user" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-md">
              <UserCircle2 className="w-4 h-4 mr-2" />
              Buyer
            </TabsTrigger>
            <TabsTrigger value="artisan" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-md">
              <Palette className="w-4 h-4 mr-2" />
              Artisan
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="user" className="mt-6">
            <Card className="border-border/50 shadow-xl bg-card/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Join as a Buyer</CardTitle>
                <CardDescription>Discover and purchase authentic handcrafted treasures.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" value={userName} onChange={(e) => setUserName(e.target.value)} className="bg-background/50 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+91 9876543210" value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="bg-background/50 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={userCity} onValueChange={setUserCity}>
                      <SelectTrigger className="bg-background/50 h-12">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg mt-6" disabled={userMutation.isPending}>
                    {userMutation.isPending ? "Entering..." : "Enter Bazaar"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="artisan" className="mt-6">
            <Card className="border-border/50 shadow-xl bg-card/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Join as an Artisan</CardTitle>
                <CardDescription>Showcase your craft to the world.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleArtisanLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="artName">Store/Artisan Name</Label>
                    <Input id="artName" placeholder="Ravi's Pottery" value={artName} onChange={(e) => setArtName(e.target.value)} className="bg-background/50 h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Select value={artCity} onValueChange={setArtCity}>
                      <SelectTrigger className="bg-background/50 h-12">
                        <SelectValue placeholder="Select your city" />
                      </SelectTrigger>
                      <SelectContent>
                        {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Craft Category</Label>
                    <Select value={artCategory} onValueChange={(val: any) => { setArtCategory(val); setArtSubcategory(""); }}>
                      <SelectTrigger className="bg-background/50 h-12">
                        <SelectValue placeholder="Select primary craft" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(CATEGORIES).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {artCategory && (
                    <div className="space-y-2">
                      <Label>Specialty</Label>
                      <Select value={artSubcategory} onValueChange={setArtSubcategory}>
                        <SelectTrigger className="bg-background/50 h-12">
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES[artCategory as keyof typeof CATEGORIES].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 pt-2 pb-4">
                    <Checkbox id="teaching" checked={artTeaching} onCheckedChange={(checked) => setArtTeaching(!!checked)} />
                    <Label htmlFor="teaching" className="font-normal cursor-pointer">I am interested in teaching my craft</Label>
                  </div>
                  <Button type="submit" className="w-full h-12 text-lg" disabled={artisanMutation.isPending}>
                    {artisanMutation.isPending ? "Setting up..." : "Open My Shop"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
