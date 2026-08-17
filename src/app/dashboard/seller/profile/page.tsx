"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/ui/ImageUpload";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { showToast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleSave = () => {
    showToast("Profile updated successfully!", "success");
  };

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-dark mb-6">Profile Settings</h1>
      <div className="bg-white rounded-xl border border-border shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-6 mb-8">
          <ImageUpload currentUrl={avatarUrl} onUpload={setAvatarUrl} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="block text-xs font-medium text-muted mb-1">Full Name</label><input type="text" defaultValue="John Doe" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" /></div>
          <div><label className="block text-xs font-medium text-muted mb-1">Email</label><input type="email" defaultValue="john@example.com" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" /></div>
          <div><label className="block text-xs font-medium text-muted mb-1">Phone</label><input type="tel" defaultValue="+258 84 000 0000" className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark" /></div>
          <div><label className="block text-xs font-medium text-muted mb-1">Country</label><select className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark"><option>Mozambique</option><option>South Africa</option><option>Angola</option></select></div>
        </div>
        <div className="mt-6"><label className="block text-xs font-medium text-muted mb-1">Payout Method</label><select className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-lg text-dark"><option>M-Pesa</option><option>Bank Transfer</option><option>Emola</option></select></div>
        <Button className="mt-6" onClick={handleSave}>Save Changes</Button>
      </div>
    </DashboardLayout>
  );
}
