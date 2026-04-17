import { useState } from "react";
import { useLocation } from "wouter";
import { useListCourses, getListCoursesQueryKey } from "@workspace/api-client-react";
import { useLanguage } from "@/lib/context";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Star, CheckCircle, GraduationCap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["Painting", "Handloom", "Pottery"];

export default function Learn() {
  const { t } = useLanguage();
  const [category, setCategory] = useState<string>("all");

  const params = category !== "all" ? { category } : {};

  const { data: courses = [], isLoading } = useListCourses(params, {
    query: {
      enabled: true,
      queryKey: getListCoursesQueryKey(params)
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-serif font-bold text-foreground">Learn the Craft</h1>
        <p className="text-muted-foreground">Master traditional Indian arts from verified artisans.</p>
        
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] bg-background">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col gap-4">
              <div className="bg-muted rounded-xl aspect-video w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="h-full group hover:shadow-md transition-all duration-300 border-border/50 overflow-hidden bg-card flex flex-col">
              <div className="relative aspect-video overflow-hidden bg-muted">
                <img 
                  src={course.imageUrl || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80"} 
                  alt={course.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <Badge className="absolute top-2 right-2 bg-background/80 text-foreground backdrop-blur font-medium">
                  {course.category}
                </Badge>
              </div>
              <CardContent className="p-4 pt-5 space-y-3 flex-1">
                <h3 className="font-serif font-bold text-xl line-clamp-2">{course.title}</h3>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <GraduationCap className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{course.artisanName}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                    <span className="font-medium">{course.artisanRating.toFixed(1)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.durationHours} Hours
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {course.artisanCity}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between items-center mt-auto border-t border-border/50 bg-muted/20">
                <div className="font-semibold text-xl text-primary">₹{course.price}</div>
                <Button>
                  Enroll Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No courses found</h3>
          <p className="text-muted-foreground">Check back later for new learning opportunities.</p>
        </div>
      )}
    </div>
  );
}
