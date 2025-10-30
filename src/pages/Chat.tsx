import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble } from "@/components/ChatBubble";
import { dummyChats, Message } from "@/utils/dummyData";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Chat() {
  const [selectedChat, setSelectedChat] = useState(dummyChats[0]);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      senderId: selectedChat.userId,
      senderName: selectedChat.userName,
      text: "Hi! Looking forward to our session tomorrow.",
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      senderId: "me",
      senderName: "You",
      text: "Me too! I've prepared some questions about React best practices.",
      timestamp: new Date(Date.now() - 3000000),
    },
    {
      id: "3",
      senderId: selectedChat.userId,
      senderName: selectedChat.userName,
      text: "Perfect! Feel free to send them over beforehand so I can prepare.",
      timestamp: new Date(Date.now() - 1800000),
    },
  ]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: "me",
      senderName: "You",
      text: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage("");
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
          <h1 className="text-3xl font-bold mb-6">Messages</h1>

          <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
            {/* Chat List */}
            <Card className="md:col-span-1 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-2">
                  {dummyChats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={cn(
                        "w-full p-4 rounded-lg text-left transition-colors hover:bg-muted",
                        selectedChat.id === chat.id && "bg-muted"
                      )}
                    >
                      <div className="flex items-start space-x-3">
                        <img
                          src={chat.userImage}
                          alt={chat.userName}
                          className="w-12 h-12 rounded-full bg-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold truncate">{chat.userName}</h3>
                            {chat.unread > 0 && (
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs">
                                {chat.unread}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {chat.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </Card>

            {/* Chat Window */}
            <Card className="md:col-span-2 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center space-x-3">
                <img
                  src={selectedChat.userImage}
                  alt={selectedChat.userName}
                  className="w-10 h-10 rounded-full bg-muted"
                />
                <div>
                  <h3 className="font-semibold">{selectedChat.userName}</h3>
                  <p className="text-xs text-muted-foreground">Active now</p>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <ChatBubble
                      key={message.id}
                      message={message}
                      isOwn={message.senderId === "me"}
                    />
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
                  <Button onClick={handleSend} size="icon">
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
