"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./Button";

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
                  <a href="mailto:daltonfelizarda66@gmail.com" className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg text-sm text-dark hover:bg-secondary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5946E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                    daltonfelizarda66@gmail.com
                  </a>
                  <a href="tel:+27722958915" className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg text-sm text-dark hover:bg-secondary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5946E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    +27722958915
                  </a>
                  <a href="https://instagram.com/dalton_fds" target="_blank" className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg text-sm text-dark hover:bg-secondary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5946E6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
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
