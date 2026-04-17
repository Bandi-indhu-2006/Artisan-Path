import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth, useLanguage } from "@/lib/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Camera, Edit2, MapPin, Star, Trash2, ImagePlus, CheckCircle } from "lucide-react";

type ProfileData = {
  bio: string;
  galleryImages: string[]; // base64 data URLs
};

const PROFILE_KEY = "artisan_path_profile_";

function loadProfile(artisanId: number): ProfileData {
  try {
    const stored = localStorage.getItem(PROFILE_KEY + artisanId);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { bio: "", galleryImages: [] };
}

function saveProfile(artisanId: number, data: ProfileData) {
  localStorage.setItem(PROFILE_KEY + artisanId, JSON.stringify(data));
}

export default function Profile() {
  const { artisan } = useAuth();
  const { t } = useLanguage();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!artisan) { setLocation("/"); return; }
    const p = loadProfile(artisan.id);
    setBio(p.bio);
    setGallery(p.galleryImages);
  }, [artisan, setLocation]);

  if (!artisan) return null;

  const handleSave = () => {
    saveProfile(artisan.id, { bio, galleryImages: gallery });
    toast({ title: t("profileSaved") });
    setEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    if (gallery.length + files.length > 8) {
      toast({ title: "Maximum 8 images allowed", variant: "destructive" });
      return;
    }
    setUploading(true);
    const readers = files.map(file => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(base64s => {
      const updated = [...gallery, ...base64s];
      setGallery(updated);
      saveProfile(artisan.id, { bio, galleryImages: updated });
      setUploading(false);
      toast({ title: `${files.length} image${files.length > 1 ? "s" : ""} added to gallery` });
    });
    e.target.value = "";
  };

  const handleRemoveImage = (idx: number) => {
    const updated = gallery.filter((_, i) => i !== idx);
    setGallery(updated);
    saveProfile(artisan.id, { bio, galleryImages: updated });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Profile Header */}
      <Card className="mb-8 overflow-hidden border-border/50">
        <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/10" />
        <CardContent className="px-6 pb-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-primary/10 flex items-center justify-center shadow-lg">
              <span className="text-4xl font-serif font-bold text-primary">
                {artisan.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold text-foreground">{artisan.name}</h1>
                {artisan.verified && <CheckCircle className="w-5 h-5 text-primary" />}
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <Badge variant="secondary" className="text-xs">{artisan.category}</Badge>
                <Badge variant="outline" className="text-xs">{artisan.subcategory}</Badge>
                {artisan.availableForTeaching && (
                  <Badge className="text-xs bg-accent/20 text-accent-foreground border border-accent/30">
                    Teacher
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {artisan.city}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                  <span>{artisan.rating?.toFixed(1) || "4.5"}</span>
                </div>
              </div>
            </div>
            <Button
              variant={editing ? "default" : "outline"}
              size="sm"
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="gap-2 self-start sm:self-end"
            >
              <Edit2 className="w-4 h-4" />
              {editing ? t("save") : t("editProfile")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About / Bio */}
      <Card className="mb-6 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg font-serif">{t("about")}</CardTitle>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-2">
              <Label>{t("bio")}</Label>
              <Textarea
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={4}
                placeholder="Tell buyers and learners about yourself, your craft tradition, years of experience..."
                className="resize-none"
              />
            </div>
          ) : bio ? (
            <p className="text-muted-foreground leading-relaxed">{bio}</p>
          ) : (
            <p className="text-muted-foreground italic text-sm">
              No bio added yet.{" "}
              <button className="text-primary underline" onClick={() => setEditing(true)}>
                Add one
              </button>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Gallery */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-serif">{t("gallery")}</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{gallery.length}/8</span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || gallery.length >= 8}
              >
                <ImagePlus className="w-4 h-4" />
                {uploading ? "Uploading..." : t("addPhoto")}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {gallery.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group bg-muted">
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {gallery.length < 8 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-xs">Add photo</span>
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-12 flex flex-col items-center gap-3 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              <Camera className="w-10 h-10" />
              <p className="font-medium">Upload your craft photos</p>
              <p className="text-xs text-center">Show buyers your work — paintings, pottery, textiles and more. Up to 8 images.</p>
              <Button variant="outline" size="sm" className="mt-2">
                <ImagePlus className="w-4 h-4 mr-2" /> Choose Photos
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
