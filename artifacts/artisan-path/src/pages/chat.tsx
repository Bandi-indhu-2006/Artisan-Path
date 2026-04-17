import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/context";
import { useListMessages, useSendMessage, getListMessagesQueryKey, useGetArtisan } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, UserCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Chat() {
  const { user, artisan } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const urlArtisanId = searchParams.get('artisanId');
  const urlUserId = searchParams.get('userId');

  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeUserId = user ? user.id : (urlUserId ? parseInt(urlUserId) : 0);
  const activeArtisanId = artisan ? artisan.id : (urlArtisanId ? parseInt(urlArtisanId) : 0);
  const senderType = user ? "user" : "artisan";

  useEffect(() => {
    if (!user && !artisan) {
      setLocation("/");
    }
  }, [user, artisan, setLocation]);

  const { data: artisanDetails } = useGetArtisan(activeArtisanId, {
    query: { enabled: !!activeArtisanId }
  });

  const params = { artisanId: activeArtisanId, userId: activeUserId };

  const { data: messages = [], refetch } = useListMessages(params, {
    query: {
      enabled: !!activeArtisanId && !!activeUserId,
      queryKey: getListMessagesQueryKey(params),
      refetchInterval: 3000
    }
  });

  const sendMutation = useSendMessage();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !activeUserId || !activeArtisanId) return;

    sendMutation.mutate({
      data: {
        artisanId: activeArtisanId,
        userId: activeUserId,
        senderType,
        message: message.trim()
      }
    }, {
      onSuccess: () => {
        setMessage("");
        refetch();
        // Simulate auto reply if user sends message
        if (senderType === "user") {
          setTimeout(() => {
            sendMutation.mutate({
              data: {
                artisanId: activeArtisanId,
                userId: activeUserId,
                senderType: "artisan",
                message: "Thank you for reaching out! I will respond to your query shortly."
              }
            }, { onSuccess: () => refetch() });
          }, 1500);
        }
      },
      onError: () => toast({ title: "Failed to send message", variant: "destructive" })
    });
  };

  if (!activeUserId || !activeArtisanId) {
    return <div className="container mx-auto p-8 text-center">Invalid chat session. Please select someone to chat with.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 h-[calc(100vh-4rem)] max-w-3xl flex flex-col">
      <div className="bg-card border border-border p-4 rounded-t-xl flex items-center gap-3 shadow-sm z-10 relative">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <UserCircle2 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-serif font-bold text-lg">
            {senderType === "user" ? (artisanDetails?.name || "Artisan") : "Buyer"}
          </h2>
          {senderType === "user" && artisanDetails && (
            <p className="text-xs text-muted-foreground">{artisanDetails.city} • {artisanDetails.category}</p>
          )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 bg-muted/30 border-x border-border p-4 overflow-y-auto flex flex-col gap-4"
      >
        {messages.map((msg) => {
          const isMine = msg.senderType === senderType;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[75%] p-3 rounded-2xl ${
                  isMine 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-card border border-border rounded-tl-sm'
                }`}
              >
                <p className="text-sm">{msg.message}</p>
                <span className={`text-[10px] block mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground my-auto flex flex-col items-center">
            <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
            <p>Start the conversation</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="bg-card border border-border p-3 rounded-b-xl flex gap-2 shadow-sm z-10 relative">
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-background border-none shadow-none focus-visible:ring-1"
        />
        <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={sendMutation.isPending || !message.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
