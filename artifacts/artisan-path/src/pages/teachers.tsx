import { useState } from "react";
import { Link } from "wouter";
import { useListArtisans, getListArtisansQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, MapPin, MessageSquare } from "lucide-react";

const CITIES = ["Hyderabad", "Mumbai", "Delhi", "Jaipur", "Chennai", "Bangalore"];
const CATEGORIES = ["Painting", "Handloom", "Pottery"];

export default function Teachers() {
  const [city, setCity] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");

  const params = {
    teachingOnly: true,
    ...(city !== "all" && { city }),
    ...(category !== "all" && { category })
  };

  const { data: artisans = [], isLoading } = useListArtisans(params, {
    query: {
      enabled: true,
      queryKey: getListArtisansQueryKey(params)
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Artisan Teachers</h1>
        <p className="text-muted-foreground">Connect with master craftsmen offering guidance and classes.</p>
        
        <div className="flex gap-2">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crafts</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-48 w-full"></div>
          ))}
        </div>
      ) : artisans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {artisans.map((artisan) => (
            <Card key={artisan.id} className="h-full border-border/50 bg-card hover:shadow-md transition-shadow flex flex-col">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-3 flex-1">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-serif font-bold text-primary mb-2">
                  {artisan.name.charAt(0)}
                </div>
                <div className="flex items-center gap-1 justify-center">
                  <h3 className="font-serif font-bold text-xl">{artisan.name}</h3>
                  {artisan.verified && <ShieldCheck className="w-4 h-4 text-primary" />}
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-1">
                  <Badge variant="secondary" className="bg-background">{artisan.category}</Badge>
                  {artisan.subcategory && <Badge variant="outline">{artisan.subcategory}</Badge>}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground text-sm mt-2">
                  <MapPin className="w-3.5 h-3.5" /> {artisan.city}
                </div>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-4 h-4 fill-accent text-accent" />
                  <span className="font-medium text-sm">{artisan.rating.toFixed(1)}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 border-t border-border mt-auto pt-4">
                <Link href={`/chat?artisanId=${artisan.id}`} className="w-full">
                  <Button className="w-full gap-2" variant="outline">
                    <MessageSquare className="w-4 h-4" /> Message
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <h3 className="text-lg font-medium">No teachers found</h3>
          <p className="text-muted-foreground">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
