"use client";

import { useState } from "react";
import { X, Upload, Check } from "lucide-react";
import Button from "./Button";

export default function AddProductForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", category: ""
  });

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 1 && !formData.name.trim()) newErrors.name = "Product name is required";
    if (step === 1 && !formData.price) newErrors.price = "Price is required";
    if (step === 2 && !formData.description.trim()) newErrors.description = "Description is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => { if (validateStep()) setStep(step + 1); };
  const prevStep = () => setStep(step - 1);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-dark"><X size={24} /></button>
        
        <h2 className="text-xl font-bold text-dark mb-2">Add New Product</h2>
        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-gray-200"}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div><label className="text-xs text-muted">Product Name</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg mt-1" placeholder="e.g. Premium T-Shirt" /><p className="text-error text-xs mt-1">{errors.name}</p></div>
            <div><label className="text-xs text-muted">Price (R)</label><input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg mt-1" placeholder="150.00" /><p className="text-error text-xs mt-1">{errors.price}</p></div>
            <div><label className="text-xs text-muted">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg mt-1"><option>Clothing</option><option>Electronics</option><option>Home</option></select></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div><label className="text-xs text-muted">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg mt-1 h-24" placeholder="Describe your product..." /><p className="text-error text-xs mt-1">{errors.description}</p></div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="text-xs text-muted">Product Images</label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-secondary/50 transition-colors relative">
              <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Upload className="mx-auto text-muted mb-2" size={32} />
              <p className="text-sm text-muted">Click to upload image</p>
            </div>
            {preview && <div className="mt-2"><img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-border mx-auto" /></div>}
            <p className="text-xs text-success flex items-center gap-1 justify-center mt-2"><Check size={14} /> Image ready to upload (backend pending)</p>
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={step === 1}>Back</Button>
          {step < 3 ? <Button onClick={nextStep}>Next Step</Button> : <Button onClick={onClose}>Save Product (Demo)</Button>}
        </div>
      </div>
    </div>
  );
}
