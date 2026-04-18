import { useState } from "react";
import { Link } from "wouter";
import { useListProducts, getListProductsQueryKey } from "@workspace/api-client-react";
import { useLanguage } from "@/lib/context";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, CheckCircle, Search, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CITIES = ["Hyderabad", "Mumbai", "Delhi", "Jaipur", "Chennai", "Bangalore"];
const CATEGORIES = ["Painting", "Handloom", "Pottery"];

export default function Shop() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<string>("all");
  const [city, setCity] = useState<string>("all");
  const [search, setSearch] = useState("");

  const params = {
    ...(category !== "all" && { category }),
    ...(city !== "all" && { city })
  };

  const { data: products = [], isLoading } = useListProducts(params, {
    query: { enabled: true, queryKey: getListProductsQueryKey(params) }
  });

  const filteredProducts = products
    .filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.artisanName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.averageRating - a.averageRating);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">{t('bazaar')}</h1>
        <p className="text-muted-foreground">{t('discoverCrafts')}</p>

        <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[150px] bg-background">
                <SelectValue placeholder={t('category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCrafts')}</SelectItem>
                <SelectItem value="Painting">{t('painting')}</SelectItem>
                <SelectItem value="Handloom">{t('handloom')}</SelectItem>
                <SelectItem value="Pottery">{t('pottery')}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-full md:w-[150px] bg-background">
                <SelectValue placeholder={t('city')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCities')}</SelectItem>
                {CITIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-4">
              <div className="bg-muted rounded-xl aspect-[4/3] w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="h-full cursor-pointer group hover:shadow-md transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden bg-card">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={product.imageUrl || "https://images.unsplash.com/photo-1605335552317-5e927db43bce?auto=format&fit=crop&w=800&q=80"}
                    alt={product.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur font-medium text-xs">
                      {product.category}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 pt-5 space-y-2">
                  <h3 className="font-serif font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">{product.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground gap-1">
                    <span>{t('byArtisan')} {product.artisanName}</span>
                    {product.verified && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground">{product.artisanCity}</div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-medium text-sm">{product.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-xs">({product.reviewCount} {t('reviews')})</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div className="font-semibold text-lg">₹{product.price}</div>
                  <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                    {t('viewProduct')}
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">{t('noCraftsFound')}</h3>
          <p className="text-muted-foreground">{t('adjustFilters')}</p>
          {(category !== "all" || city !== "all" || search) && (
            <Button variant="outline" className="mt-4" onClick={() => { setCategory("all"); setCity("all"); setSearch(""); }}>
              {t('clearFilters')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
