"use client";

import { useState } from "react";
import { MessageCircle, X, Send, Phone, Mail, Instagram } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [showHuman, setShowHuman] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      alert("Support ticket sent! We'll get back to you.");
      setMessage("");
      setShowHuman(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white rounded-2xl border border-border shadow-xl w-80 md:w-96 mb-4 p-4 overflow-hidden">
            <div className="flex justify-between items-center border-b border-border pb-2 mb-3">
              <span className="font-semibold text-dark">Velion Support</span>
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-dark"><X size={18} /></button>
            </div>
            
            {!showHuman ? (
              <div>
                <p className="text-sm text-muted mb-4">Describe your issue below. We respond instantly to common questions.</p>
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your message..." className="w-full px-3 py-2 border border-border rounded-lg text-sm h-20 resize-none focus:outline-none" />
                <Button className="w-full justify-center mt-3" onClick={handleSend}><Send size={16} className="mr-2" /> Send Message</Button>
                <button onClick={() => setShowHuman(true)} className="w-full text-center text-xs text-primary underline mt-2">Need human support? Contact us</button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted mb-2">Our AI couldn't resolve this. Contact our human support team:</p>
                <div className="space-y-2">
                  <a href="mailto:daltonfelizarda66@gmail.com" className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg text-sm text-dark hover:bg-secondary transition-colors"><Mail size={16} className="text-primary" /> daltonfelizarda66@gmail.com</a>
                  <a href="tel:+27722958915" className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg text-sm text-dark hover:bg-secondary transition-colors"><Phone size={16} className="text-primary" /> +27722958915</a>
                  <a href="https://instagram.com/dalton_fds" target="_blank" className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg text-sm text-dark hover:bg-secondary transition-colors"><Instagram size={16} className="text-primary" /> @dalton_fds</a>
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
