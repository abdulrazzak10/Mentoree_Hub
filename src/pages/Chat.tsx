import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "@/components/ChatBubble";
import { ArrowLeft, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

type UiMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
};

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { userId, profile } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  const chatsQuery = useQuery({
    queryKey: ["chats", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chats")
        .select(
          "id, mentor_id, student_id, last_message, last_message_at, created_at, " +
            "mentor:profiles!chats_mentor_id_fkey(name, profile_image_url), " +
            "student:profiles!chats_student_id_fkey(name, profile_image_url)"
        )
        .or(`mentor_id.eq.${userId},student_id.eq.${userId}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data || []) as any[];
    },
  });

  const selectedChat = useMemo(
    () => chatsQuery.data?.find((c) => c.id === selectedChatId) || null,
    [chatsQuery.data, selectedChatId]
  );

  useEffect(() => {
    const paramChatId = searchParams.get("chatId");
    if (paramChatId) {
      setSelectedChatId(paramChatId);
      return;
    }
    if (!selectedChatId && chatsQuery.data && chatsQuery.data.length > 0) {
      setSelectedChatId(chatsQuery.data[0].id);
    }
  }, [chatsQuery.data, selectedChatId, searchParams]);

  const messagesQuery = useQuery({
    queryKey: ["messages", selectedChatId],
    enabled: !!selectedChatId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, chat_id, sender_id, text, created_at, profiles!messages_sender_id_fkey(name)")
        .eq("chat_id", selectedChatId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data || []).map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        senderName: m.profiles?.name || "User",
        text: m.text,
        timestamp: new Date(m.created_at),
      })) as UiMessage[];
    },
  });

  useEffect(() => {
    if (!selectedChatId) return;
    const channel = supabase
      .channel(`messages-chat-${selectedChatId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `chat_id=eq.${selectedChatId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["messages", selectedChatId] });
          queryClient.invalidateQueries({ queryKey: ["chats", userId] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedChatId, queryClient, userId]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    const role = localStorage.getItem("userRole");
    navigate(role === "mentor" ? "/mentor/dashboard" : "/student/dashboard");
  };

  const sendMutation = useMutation({
    mutationFn: async ({ chatId, text }: { chatId: string; text: string }) => {
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: userId,
        text,
      });
      if (error) throw error;
    },
    onError: (e: any) => toast.error(e.message),
    onSuccess: async () => {
      setNewMessage("");
    },
  });

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChatId || !userId) return;
    sendMutation.mutate({ chatId: selectedChatId, text: newMessage.trim() });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Messages</h1>
          </div>

          <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* Chat List */}
            <Card className="md:col-span-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {(chatsQuery.data || []).map((chat) => {
                    const amMentor = chat.mentor_id === userId;
                    const other = amMentor ? chat.student : chat.mentor;
                    const otherName = other?.name || "User";
                    const otherImage = other?.profile_image_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=User";
                    const lastTime = chat.last_message_at ? new Date(chat.last_message_at) : null;
                    return (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChatId(chat.id)}
                      className={cn(
                        "w-full p-4 rounded-lg text-left transition-colors hover:bg-muted",
                        selectedChatId === chat.id && "bg-muted"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <img src={otherImage} alt={otherName} className="w-12 h-12 rounded-full bg-muted" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">{otherName}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{chat.last_message || ""}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {lastTime ? lastTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </p>
                        </div>
                      </div>
                    </button>
                  );})}
                </div>
              </ScrollArea>
            </Card>

            {/* Chat Window */}
            <Card className="md:col-span-2 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center space-x-3">
                {selectedChat ? (
                  <>
                    <img
                      src={
                        (selectedChat.mentor_id === userId
                          ? selectedChat.student?.profile_image_url
                          : selectedChat.mentor?.profile_image_url) || "https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                      }
                      alt="User"
                      className="w-10 h-10 rounded-full bg-muted"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {selectedChat.mentor_id === userId ? selectedChat.student?.name : selectedChat.mentor?.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">No chat selected</div>
                )}
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {(messagesQuery.data || []).map((message) => (
                    <ChatBubble key={message.id} message={message} isOwn={message.senderId === userId} />
                  ))}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <Button onClick={handleSend} size="icon" disabled={!selectedChatId || !newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
