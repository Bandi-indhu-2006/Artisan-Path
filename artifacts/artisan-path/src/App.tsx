import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, LanguageProvider } from "@/lib/context";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Shop from "@/pages/shop";
import Learn from "@/pages/learn";
import Events from "@/pages/events";
import Orders from "@/pages/orders";
import ProductDetail from "@/pages/product";
import Teachers from "@/pages/teachers";
import Chat from "@/pages/chat";
import ArtisanDashboard from "@/pages/artisan-dashboard";
import Profile from "@/pages/profile";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/learn" component={Learn} />
      <Route path="/teachers" component={Teachers} />
      <Route path="/events" component={Events} />
      <Route path="/orders" component={Orders} />
      <Route path="/chat" component={Chat} />
      <Route path="/artisan-dashboard" component={ArtisanDashboard} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <LanguageProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Layout>
                <Router />
              </Layout>
            </WouterRouter>
          </LanguageProvider>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
