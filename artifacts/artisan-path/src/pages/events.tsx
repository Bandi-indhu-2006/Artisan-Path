import { useState } from "react";
import { useAuth, useLanguage } from "@/lib/context";
import { useListEvents, useBookEvent, useRegisterForEvent, getListEventsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon, MapPin, Users, Star, TrendingUp, CheckCircle2 } from "lucide-react";
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

// Smart skill suggestions per city
const CITY_SKILLS: Record<string, Array<{ skill: string; rating: number; count: number }>> = {
  Hyderabad: [
    { skill: "Handloom Weaving", rating: 4.8, count: 142 },
    { skill: "Bidri Jewelry", rating: 4.6, count: 98 },
    { skill: "Nirmal Painting", rating: 4.5, count: 76 },
  ],
  Mumbai: [
    { skill: "Warli Painting", rating: 4.7, count: 120 },
    { skill: "Paithani Weaving", rating: 4.5, count: 88 },
    { skill: "Kolhapuri Craft", rating: 4.3, count: 64 },
  ],
  Delhi: [
    { skill: "Pottery & Ceramics", rating: 4.9, count: 165 },
    { skill: "Block Printing", rating: 4.7, count: 130 },
    { skill: "Phulkari Embroidery", rating: 4.4, count: 92 },
  ],
  Jaipur: [
    { skill: "Blue Pottery", rating: 4.8, count: 178 },
    { skill: "Meenakari Jewelry", rating: 4.7, count: 145 },
    { skill: "Bandhani Tie-Dye", rating: 4.5, count: 110 },
  ],
  Chennai: [
    { skill: "Silk Weaving", rating: 4.9, count: 195 },
    { skill: "Tanjore Painting", rating: 4.8, count: 152 },
    { skill: "Bronze Casting", rating: 4.6, count: 88 },
  ],
  Bangalore: [
    { skill: "Channapatna Toys", rating: 4.7, count: 109 },
    { skill: "Mysore Silk", rating: 4.6, count: 134 },
    { skill: "Rosewood Carving", rating: 4.4, count: 72 },
  ],
};

// Track registered events in localStorage for artisans
const REGISTERED_EVENTS_KEY = "artisan_path_registered_events_";

function getRegisteredEvents(artisanId: number): number[] {
  try {
    const stored = localStorage.getItem(REGISTERED_EVENTS_KEY + artisanId);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function addRegisteredEvent(artisanId: number, eventId: number) {
  const existing = getRegisteredEvents(artisanId);
  if (!existing.includes(eventId)) {
    localStorage.setItem(REGISTERED_EVENTS_KEY + artisanId, JSON.stringify([...existing, eventId]));
  }
}

export default function Events() {
  const { user, artisan } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [city, setCity] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<number[]>(
    artisan ? getRegisteredEvents(artisan.id) : []
  );

  // Booking form state — pre-fill from user data
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
  const registerMutation = useRegisterForEvent();

  // FIX: pass both id and data — this was the root cause of booking failure
  const handleBookEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in as a buyer to book events", variant: "destructive" });
      return;
    }
    if (!selectedEventId) return;
    if (!bookName.trim() || !bookPhone.trim()) {
      toast({ title: "Please fill in your name and phone number", variant: "destructive" });
      return;
    }

    bookMutation.mutate(
      {
        id: selectedEventId,   // ← was missing before — caused all booking failures
        data: { userId: user.id, name: bookName.trim(), phone: bookPhone.trim() }
      },
      {
        onSuccess: () => {
          toast({ title: "Event booked successfully! You'll receive details shortly." });
          setBookingOpen(false);
          setSelectedEventId(null);
          refetch();
        },
        onError: () => {
          toast({ title: "Booking failed — please try again", variant: "destructive" });
        }
      }
    );
  };

  // Register artisan to showcase at an event
  const handleRegister = (eventId: number, eventName: string) => {
    if (!artisan) return;

    if (registeredEventIds.includes(eventId)) {
      toast({ title: "You're already registered for this event" });
      return;
    }

    registerMutation.mutate(
      { id: eventId, data: { artisanId: artisan.id } },
      {
        onSuccess: () => {
          addRegisteredEvent(artisan.id, eventId);
          setRegisteredEventIds(prev => [...prev, eventId]);
          toast({ title: `Registered to showcase at "${eventName}"! See you there.` });
        },
        onError: () => {
          toast({ title: "Registration failed — please try again", variant: "destructive" });
        }
      }
    );
  };

  const citySkills = city !== "all" ? CITY_SKILLS[city] || [] : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Craft Events & Exhibitions</h1>
        <p className="text-muted-foreground">Experience the magic of Indian crafts live. Meet artisans, join workshops, and attend exhibitions.</p>

        <div className="flex flex-wrap gap-2">
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

        {/* Smart Skill Suggestions — appears when a city is selected */}
        {citySkills.length > 0 && (
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">
                Popular Crafts in {city} — Ranked by Community Reviews
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {citySkills
                .slice()
                .sort((a, b) => b.rating - a.rating)
                .map((item, idx) => (
                  <div
                    key={item.skill}
                    className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2"
                  >
                    <span className="text-xs font-bold text-muted-foreground w-4">#{idx + 1}</span>
                    <span className="text-sm font-medium">{item.skill}</span>
                    <span className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {item.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">({item.count})</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-48 w-full" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {events.map((event) => {
            const isRegistered = artisan ? registeredEventIds.includes(event.id) : false;
            const isFull = event.bookingCount >= event.maxCapacity;

            return (
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
                  {isRegistered && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-5 flex flex-col">
                  <h3 className="font-serif font-bold text-xl line-clamp-2 mb-3">{event.name}</h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
                      {format(new Date(event.date), "EEEE, MMM d, yyyy • h:mm a")}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      {event.location}, {event.city}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      {event.bookingCount} / {event.maxCapacity} Booked
                      {isFull && <Badge variant="destructive" className="text-xs ml-1">Sold Out</Badge>}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>

                  <div className="mt-auto pt-4 border-t border-border">
                    {artisan ? (
                      <Button
                        variant={isRegistered ? "secondary" : "outline"}
                        className="w-full"
                        onClick={() => handleRegister(event.id, event.name)}
                        disabled={isRegistered || registerMutation.isPending}
                      >
                        {isRegistered ? (
                          <><CheckCircle2 className="w-4 h-4 mr-2 text-green-600" /> Registered to Showcase</>
                        ) : registerMutation.isPending ? "Registering..." : "Register to Showcase"}
                      </Button>
                    ) : !user ? (
                      <Button variant="outline" className="w-full" disabled>
                        Log in to book tickets
                      </Button>
                    ) : (
                      <Dialog
                        open={bookingOpen && selectedEventId === event.id}
                        onOpenChange={(open) => {
                          setBookingOpen(open);
                          if (open) {
                            setSelectedEventId(event.id);
                            setBookName(user?.name || "");
                            setBookPhone(user?.phone || "");
                          } else {
                            setSelectedEventId(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button className="w-full" disabled={isFull}>
                            {isFull ? "Sold Out" : t("bookNow")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Book Tickets</DialogTitle>
                            <DialogDescription>
                              {event.name} — {format(new Date(event.date), "MMM d, yyyy")} at {event.location}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleBookEvent} className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label htmlFor="bookName">Full Name</Label>
                              <Input
                                id="bookName"
                                value={bookName}
                                onChange={e => setBookName(e.target.value)}
                                placeholder="Your name"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bookPhone">Phone Number</Label>
                              <Input
                                id="bookPhone"
                                value={bookPhone}
                                onChange={e => setBookPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                required
                              />
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                              Booking for: <span className="font-medium text-foreground">{event.name}</span>
                              <br />
                              Seats remaining: <span className="font-medium text-foreground">{event.maxCapacity - event.bookingCount}</span>
                            </div>
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={bookMutation.isPending}
                            >
                              {bookMutation.isPending ? "Confirming booking..." : "Confirm Booking"}
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
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
