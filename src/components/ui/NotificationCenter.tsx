"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { subscribeToNotifications } from "@/lib/supabase/realtime";

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    const res = await fetch("/api/notifications");
    if (res.ok) {
      const data = await res.json();
      setNotifications(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchNotifications();
        // Subscribe to real-time updates
        const subscription = subscribeToNotifications(user.id, (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        });
        return () => subscription?.unsubscribe();
      }
    };
    getUser();
  }, []);

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const markAllAsRead = async () => {
    if (!userId) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId);
    setNotifications(notifications.map((n: any) => ({ ...n, read: true })));
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
              {loading ? <p className="text-center text-muted text-sm py-2">Loading...</p> : 
               notifications.length > 0 ? notifications.map((n: any) => (
                <div key={n.id} className={`flex gap-2 text-sm ${n.read ? "text-muted" : "text-dark"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${n.read ? "bg-gray-300" : "bg-primary"}`} />
                  <div><p>{n.message}</p><p className="text-xs text-muted">{new Date(n.created_at).toLocaleString()}</p></div>
                </div>
              )) : <p className="text-center text-muted text-sm py-2">No notifications yet</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
