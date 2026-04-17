import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useAuth, useLanguage } from "@/lib/context";
import { 
  useGetProduct, 
  getGetProductQueryKey,
  useGetProductRatings,
  getGetProductRatingsQueryKey,
  usePlaceOrder,
  useRateProduct
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Star, Volume2, ShieldCheck, MapPin, Store, ShoppingBag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' }
];

export default function ProductDetail() {
  const [match, params] = useRoute("/product/:id");
  const productId = parseInt(params?.id || "0");
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [descLang, setDescLang] = useState<string>("en");
  const [buying, setBuying] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState("");

  const { data: product, isLoading: loadingProduct } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetProductQueryKey(productId) }
  });

  const { data: ratings = [], refetch: refetchRatings } = useGetProductRatings(productId, {
    query: { enabled: !!productId, queryKey: getGetProductRatingsQueryKey(productId) }
  });

  const orderMutation = usePlaceOrder();
  const rateMutation = useRateProduct();

  const handleBuy = () => {
    if (!user) {
      toast({ title: "Please login as a buyer to purchase", variant: "destructive" });
      setLocation("/");
      return;
    }
    if (!product) return;

    orderMutation.mutate({
      data: {
        productId,
        userId: user.id,
        price: product.price
      }
    }, {
      onSuccess: () => {
        toast({ title: "Purchase successful!" });
        setBuying(false);
        setLocation("/orders");
      },
      onError: () => toast({ title: "Purchase failed", variant: "destructive" })
    });
  };

  const handleRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    rateMutation.mutate({
      data: {
        productId,
        userId: user.id,
        userName: user.name,
        stars: ratingVal,
        review: reviewText
      }
    }, {
      onSuccess: () => {
        toast({ title: "Review submitted successfully!" });
        refetchRatings();
        setReviewText("");
      },
      onError: () => toast({ title: "Failed to submit review", variant: "destructive" })
    });
  };

  const speakDescription = () => {
    if (!product || !window.speechSynthesis) return;
    
    let textToSpeak = product.description;
    let langCode = 'en-US';
    
    if (descLang === 'hi' && product.descriptionHindi) { textToSpeak = product.descriptionHindi; langCode = 'hi-IN'; }
    if (descLang === 'te' && product.descriptionTelugu) { textToSpeak = product.descriptionTelugu; langCode = 'te-IN'; }
    if (descLang === 'ta' && product.descriptionTamil) { textToSpeak = product.descriptionTamil; langCode = 'ta-IN'; }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langCode;
    window.speechSynthesis.cancel(); // stop previous
    window.speechSynthesis.speak(utterance);
  };

  if (loadingProduct) {
    return <div className="container mx-auto p-8 animate-pulse bg-muted h-[60vh] rounded-xl mt-8"></div>;
  }

  if (!product) {
    return <div className="container mx-auto p-8 text-center">Product not found</div>;
  }

  // Get correct description based on language
  let displayDesc = product.description;
  if (descLang === 'hi' && product.descriptionHindi) displayDesc = product.descriptionHindi;
  if (descLang === 'te' && product.descriptionTelugu) displayDesc = product.descriptionTelugu;
  if (descLang === 'ta' && product.descriptionTamil) displayDesc = product.descriptionTamil;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted border border-border shadow-sm">
          <img 
            src={product.imageUrl || "https://images.unsplash.com/photo-1605335552317-5e927db43bce?auto=format&fit=crop&w=1000&q=80"} 
            alt={product.title}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary">{product.category}</Badge>
              <Badge variant="outline">{product.subcategory}</Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">{product.title}</h1>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Store className="w-4 h-4" />
                <span className="font-medium text-foreground">{product.artisanName}</span>
                {product.verified && <ShieldCheck className="w-4 h-4 text-primary" />}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {product.artisanCity}
              </div>
            </div>
          </div>

          <div className="flex items-end gap-2">
            <div className="text-4xl font-bold text-primary">₹{product.price}</div>
            <div className="text-muted-foreground text-sm mb-1">(Est. market value: ₹{product.estimatedPriceMin} - ₹{product.estimatedPriceMax})</div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Description</h3>
              <div className="flex gap-2 items-center">
                <Select value={descLang} onValueChange={setDescLang}>
                  <SelectTrigger className="w-[120px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map(l => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={speakDescription}>
                  <Volume2 className="h-4 w-4 text-primary" />
                </Button>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {displayDesc}
            </p>
          </div>

          <div className="pt-6">
            <Dialog open={buying} onOpenChange={setBuying}>
              <DialogTrigger asChild>
                <Button className="w-full h-14 text-lg gap-2">
                  <ShoppingBag className="w-5 h-5" /> Buy Now
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Purchase</DialogTitle>
                  <DialogDescription>
                    You are buying {product.title} from {product.artisanName} for ₹{product.price}.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground mb-4">Payment would be processed here.</p>
                  <Button className="w-full" onClick={handleBuy} disabled={orderMutation.isPending}>
                    {orderMutation.isPending ? "Processing..." : `Confirm Payment of ₹${product.price}`}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-border">
        <h2 className="text-2xl font-serif font-bold mb-6 flex items-center gap-2">
          Ratings & Reviews
          <Badge variant="secondary" className="text-sm bg-accent/20 text-accent border-none ml-2">
            <Star className="w-3.5 h-3.5 fill-accent mr-1 inline" />
            {product.averageRating.toFixed(1)} ({product.reviewCount} reviews)
          </Badge>
        </h2>

        {user && (
          <Card className="mb-8 bg-card border-border/50">
            <CardContent className="pt-6">
              <h3 className="font-medium mb-4">Write a Review</h3>
              <form onSubmit={handleRate} className="space-y-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button type="button" key={star} onClick={() => setRatingVal(star)} className="focus:outline-none">
                      <Star className={`w-8 h-8 ${star <= ratingVal ? "fill-accent text-accent" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
                <Textarea 
                  placeholder="Share your experience with this craft..." 
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="bg-background resize-none"
                  rows={3}
                />
                <Button type="submit" disabled={rateMutation.isPending}>
                  {rateMutation.isPending ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {ratings.length > 0 ? (
            ratings.map((rating) => (
              <div key={rating.id} className="p-4 rounded-xl bg-card border border-border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium">{rating.userName}</div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < rating.stars ? "fill-accent text-accent" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{rating.review}</p>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first to review!</p>
          )}
        </div>
      </div>
    </div>
  );
}
