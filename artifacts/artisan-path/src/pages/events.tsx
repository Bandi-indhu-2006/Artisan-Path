import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/context";
import { useListEvents, useBookEvent, getListEventsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, MapPin, Users, Info } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CITIES = ["Hyderabad", "Mumbai", "Delhi", "Jaipur", "Chennai", "Bangalore"];
const CATEGORIES = ["Exhibition", "Workshop", "Fair"];

export default function Events() {
  const { user, artisan } = useAuth();
  const { toast } = useToast();
  const [city, setCity] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Booking form state
  const [bookName, setBookName] = useState(user?.name || "");
  const [bookPhone, setBookPhone] = useState(user?.phone || "");

  const params = {
    ...(city !== "all" && { city }),
    ...(category !== "all" && { category })
  };

  const { data: events = [], isLoading, refetch } = useListEvents(params, {
    query: {
      enabled: true,
      queryKey: getListEventsQueryKey(params)
    }
  });

  const bookMutation = useBookEvent();

  const handleBookEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEventId) {
      toast({ title: "Must be logged in as user to book", variant: "destructive" });
      return;
    }
    if (!bookName || !bookPhone) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    bookMutation.mutate({
      data: {
        userId: user.id,
        name: bookName,
        phone: bookPhone
      }
    }, {
      onSuccess: () => {
        toast({ title: "Successfully booked event!" });
        setBookingOpen(false);
        refetch();
      },
      onError: () => {
        toast({ title: "Failed to book event", variant: "destructive" });
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Craft Events & Exhibitions</h1>
        <p className="text-muted-foreground">Experience the magic of Indian crafts live. Meet artisans, join workshops, and attend exhibitions.</p>
        
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
              <SelectItem value="all">All Types</SelectItem>
              {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-48 w-full"></div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => (
            <Card key={event.id} className="flex flex-col sm:flex-row overflow-hidden border-border/50 bg-card hover:shadow-md transition-shadow">
              <div className="sm:w-2/5 aspect-video sm:aspect-auto bg-muted relative">
                <img 
                  src={event.imageUrl || "https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&w=600&q=80"} 
                  alt={event.name}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-3 left-3 bg-background/90 text-foreground backdrop-blur border-none">
                  {event.category}
                </Badge>
              </div>
              <div className="flex-1 p-5 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-serif font-bold text-xl line-clamp-2">{event.name}</h3>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    {format(new Date(event.date), "EEEE, MMM d, yyyy • h:mm a")}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    {event.location}, {event.city}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    {event.bookingCount} / {event.maxCapacity} Booked
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {event.description}
                </p>
                
                <div className="mt-auto pt-4 border-t border-border flex gap-2">
                  {artisan ? (
                    <Button variant="outline" className="w-full">
                      Register to Showcase
                    </Button>
                  ) : (
                    <Dialog open={bookingOpen && selectedEventId === event.id} onOpenChange={(open) => {
                      setBookingOpen(open);
                      if (open) setSelectedEventId(event.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full" disabled={event.bookingCount >= event.maxCapacity}>
                          {event.bookingCount >= event.maxCapacity ? "Sold Out" : "Book Tickets"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book Tickets for {event.name}</DialogTitle>
                          <DialogDescription>
                            Confirm your details to secure your spot.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleBookEvent} className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={bookName} onChange={e => setBookName(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={bookPhone} onChange={e => setBookPhone(e.target.value)} />
                          </div>
                          <Button type="submit" className="w-full mt-4" disabled={bookMutation.isPending}>
                            {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No events found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or check back later.</p>
        </div>
      )}
    </div>
  );
}
