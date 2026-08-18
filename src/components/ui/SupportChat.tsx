"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Phone, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [showHuman, setShowHuman] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      // Envia para a API interna de notificações (que notifica o admin)
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "support_message",
          message: message.trim(),
        }),
      });

      if (res.ok) {
        setMessage("");
        setShowHuman(true);
        alert("Your message was sent. We'll reply shortly.");
      } else {
        alert("Failed to send message. Please try again.");
      }
    } catch (err) {
      alert("Network error.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-2xl border border-light-border shadow-xl w-80 md:w-96 mb-4 p-4 overflow-hidden">
            <div className="flex justify-between items-center border-b border-light-border pb-2 mb-3">
              <span className="font-semibold text-light-text">Velion Support</span>
              <button onClick={() => setIsOpen(false)} className="text-light-muted hover:text-light-text"><X size={18} /></button>
            </div>
            
            {!showHuman ? (
              <div>
                <p className="text-sm text-light-muted mb-4">Describe your issue below. We respond instantly to common questions.</p>
                <textarea 
                  value={message} 
                  onChange={e => setMessage(e.target.value)} 
                  placeholder="Type your message..." 
                  className="w-full px-3 py-2 border border-light-border rounded-lg text-sm h-20 resize-none focus:outline-none text-light-text" 
                />
                <Button 
                  className="w-full justify-center mt-3" 
                  onClick={handleSend} 
                  disabled={isSending}
                >
                  {isSending ? "Sending..." : <><Send size={16} className="mr-2" /> Send Message</>}
                </Button>
                <button onClick={() => setShowHuman(true)} className="w-full text-center text-xs text-primary underline mt-2">Need human support? Contact us</button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-light-muted mb-2">Our AI couldn't resolve this. Contact our human support team:</p>
                <div className="space-y-2">
                  <a href="mailto:daltonfelizarda66@gmail.com" className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg text-sm text-light-text hover:bg-secondary transition-colors">
                    <Mail size={16} className="text-primary" /> daltonfelizarda66@gmail.com
                  </a>
                  <a href="https://wa.me/27722958915" target="_blank" className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg text-sm text-light-text hover:bg-secondary transition-colors">
                    <Phone size={16} className="text-primary" /> +27722958915
                  </a>
                  <a href="https://instagram.com/dalton_fds" target="_blank" className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg text-sm text-light-text hover:bg-secondary transition-colors">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    @dalton_fds
                  </a>
                </div>
                <Button variant="outline" className="w-full justify-center mt-2" onClick={() => setShowHuman(false)}>Back to AI Chat</Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={() => setIsOpen(!isOpen)} className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-transform hover:scale-105">
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
