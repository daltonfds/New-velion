"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const mockNotifications = [
  { id: 1, message: "New order #VL-1004 received", time: "2 min ago", read: false },
  { id: 2, message: "Your withdrawal request was approved", time: "1 hour ago", read: false },
  { id: 3, message: "Product 'T-Shirt' is low in stock", time: "3 hours ago", read: true },
];

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-muted hover:text-dark transition-colors">
        <Bell size={20} />
        {unreadCount > 0 && <span className="absolute top-1 right-1 bg-error text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unreadCount}</span>}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 top-12 w-80 bg-white rounded-xl border border-border shadow-lg p-4 z-50">
            <div className="flex justify-between items-center mb-3 border-b border-border pb-2">
              <span className="font-semibold text-dark text-sm">Notifications</span>
              <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">Mark all read</button>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {notifications.length > 0 ? notifications.map(n => (
                <div key={n.id} className={`flex gap-2 text-sm ${n.read ? "text-muted" : "text-dark"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${n.read ? "bg-gray-300" : "bg-primary"}`} />
                  <div><p>{n.message}</p><p className="text-xs text-muted">{n.time}</p></div>
                </div>
              )) : <p className="text-center text-muted text-sm py-2">No notifications yet</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
