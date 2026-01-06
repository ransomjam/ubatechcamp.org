import React, { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatDialog = ({ open, onOpenChange }: ChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm the UBa Tech Camp assistant. How can I help you today? You can ask me about programs, registration, fees, or schedules.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Registration fee questions
    if (lowerMessage.includes("registration") && (lowerMessage.includes("fee") || lowerMessage.includes("cost"))) {
      return "The registration fee is 1,00FRS. This covers your initial enrollment and materials. Would you like to know about our complete program fees?";
    }

    // Complete program questions
    if (lowerMessage.includes("complete program") || lowerMessage.includes("full program") || lowerMessage.includes("program fee")) {
      return "Our complete program fee is 50,000 FRS. This includes all courses, materials, mentorship, and certification. The schedule varies based on the program you choose. Would you like details about specific programs?";
    }

    // Program questions
    if (lowerMessage.includes("program") && !lowerMessage.includes("fee")) {
      return "We offer several programs including Web Development, Mobile App Development, Data Science, and Cybersecurity. Each program is 12 weeks long with flexible schedules. Which program interests you?";
    }

    // Schedule questions
    if (lowerMessage.includes("schedule") || lowerMessage.includes("time") || lowerMessage.includes("when")) {
      return "Our programs run in cohorts throughout the year with flexible schedules:\n- Weekday batches: Monday-Friday, 9AM-5PM\n- Weekend batches: Saturday-Sunday, 9AM-6PM\n- Evening batches: Monday-Friday, 6PM-9PM\n\nWhich schedule works best for you?";
    }

    // Contact questions
    if (lowerMessage.includes("contact") || lowerMessage.includes("phone") || lowerMessage.includes("email")) {
      return "You can reach us at:\n📞 +256 700 123 456\n📧 info@ubatechcamp.ug\n\nOur office hours are Monday-Friday: 8AM-6PM, Saturday: 9AM-2PM";
    }

    // Location questions
    if (lowerMessage.includes("location") || lowerMessage.includes("where") || lowerMessage.includes("address")) {
      return "We're located at the University of Bamenda,  Bambili, Bamenda, Cameroon. You can schedule a campus visit by contacting us!";
    }

    // Default response
    return "I'm here to help! I can answer questions about:\n• Registration fees (1,00FRS)\n• Complete program fees (50,000 FRS)\n• Program schedules and duration\n• Available programs\n• Contact information\n\nWhat would you like to know?";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate thinking time
    setTimeout(() => {
      const response = generateResponse(input);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            UBa Tech Camp Assistant
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6" ref={scrollRef}>
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === "user" ? "bg-secondary" : "bg-primary"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.content}</p>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 rounded-lg p-3 bg-muted">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              placeholder="Ask about programs, fees, schedules..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Note: This is a basic assistant. For AI-powered responses, enable Lovable Cloud.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
