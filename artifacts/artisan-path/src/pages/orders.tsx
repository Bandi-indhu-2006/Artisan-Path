import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/context";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function Orders() {
  const { user } = useAuth();
  
  const params = user ? { userId: user.id } : {};

  const { data: orders = [], isLoading } = useListOrders(params, {
    query: {
      enabled: !!user,
      queryKey: getListOrdersQueryKey(params)
    }
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold mb-2">Login Required</h2>
        <p className="text-muted-foreground mb-6">Please login as a buyer to view your orders.</p>
        <Link href="/" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground">
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-serif font-bold text-foreground mb-8">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-muted rounded-xl h-32 w-full"></div>
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden border-border/50">
              <CardContent className="p-0 sm:p-4 flex flex-col sm:flex-row gap-4">
                <div className="aspect-square sm:aspect-auto sm:w-32 sm:h-32 w-full h-48 bg-muted shrink-0">
                  <img 
                    src={order.productImageUrl || "https://images.unsplash.com/photo-1605335552317-5e927db43bce?auto=format&fit=crop&w=400&q=80"} 
                    alt={order.productTitle}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4 sm:p-0 flex-1 flex flex-col justify-center space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-serif font-bold text-lg">{order.productTitle}</h3>
                      <p className="text-sm text-muted-foreground">Order #{order.id} • {format(new Date(order.createdAt), "MMM d, yyyy")}</p>
                    </div>
                    <div className="font-semibold text-primary whitespace-nowrap">₹{order.price}</div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-2">
                    {order.status === 'completed' ? (
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none">
                        <CheckCircle className="w-3 h-3 mr-1" /> Completed
                      </Badge>
                    ) : order.status === 'processing' ? (
                      <Badge variant="outline" className="border-accent/50 text-accent bg-accent/10">
                        <Clock className="w-3 h-3 mr-1" /> Processing
                      </Badge>
                    ) : (
                      <Badge variant="outline">{order.status}</Badge>
                    )}
                  </div>
                  
                  <div className="pt-2">
                    <Link href={`/product/${order.productId}`} className="text-sm text-primary hover:underline font-medium">
                      View Product
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-xl border border-border">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No orders yet</h3>
          <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
          <Link href="/shop" className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground">
            Explore Bazaar
          </Link>
        </div>
      )}
    </div>
  );
}
