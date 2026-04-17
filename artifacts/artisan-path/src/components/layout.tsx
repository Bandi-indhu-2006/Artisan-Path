import { Link, useLocation } from "wouter";
import { useAuth, useLanguage, SupportedLanguage } from "@/lib/context";
import { Store, GraduationCap, CalendarDays, LayoutDashboard, Search, Settings, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, artisan, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground pb-16 md:pb-0">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-serif font-bold text-primary">ArtisanPath</span>
          </Link>
          
          <div className="flex items-center gap-4">
            <Select value={language} onValueChange={(val) => setLanguage(val as SupportedLanguage)}>
              <SelectTrigger className="w-[100px] border-none bg-muted/50 focus:ring-0 rounded-full h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">EN</SelectItem>
                <SelectItem value="hi">HI</SelectItem>
                <SelectItem value="te">TE</SelectItem>
                <SelectItem value="ta">TA</SelectItem>
              </SelectContent>
            </Select>
            
            {(user || artisan) && (
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-muted-foreground hover:text-destructive">
                <LogOut className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-x-hidden">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Mobile Bottom Navigation */}
      {(user || artisan) && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50 px-2 pb-safe">
          <div className="flex justify-around items-center h-16">
            <Link href="/shop" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.startsWith('/shop') || location.startsWith('/product') ? 'text-primary' : 'text-muted-foreground'}`}>
              <Store className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('shop')}</span>
            </Link>
            <Link href="/teachers" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.startsWith('/learn') || location.startsWith('/teachers') ? 'text-primary' : 'text-muted-foreground'}`}>
              <GraduationCap className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('learn')}</span>
            </Link>
            <Link href="/events" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.startsWith('/events') ? 'text-primary' : 'text-muted-foreground'}`}>
              <CalendarDays className="h-5 w-5" />
              <span className="text-[10px] font-medium">{t('events')}</span>
            </Link>
            
            {artisan ? (
              <Link href="/artisan-dashboard" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.startsWith('/artisan-dashboard') ? 'text-primary' : 'text-muted-foreground'}`}>
                <LayoutDashboard className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t('dashboard')}</span>
              </Link>
            ) : (
              <Link href="/orders" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.startsWith('/orders') ? 'text-primary' : 'text-muted-foreground'}`}>
                <Package className="h-5 w-5" />
                <span className="text-[10px] font-medium">{t('orders')}</span>
              </Link>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
