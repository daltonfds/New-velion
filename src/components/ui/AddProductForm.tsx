"use client";

import { useState } from "react";
import { X, Upload, Check } from "lucide-react";
import Button from "./Button";
import { createProduct } from "@/app/dashboard/seller/products/actions";
import { useToast } from "./Toast";

export default function AddProductForm({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", description: "", price: "", category: "Clothing"
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const validateStep = () => {
    if (step === 1 && !formData.name.trim()) {
      showToast("Product name is required", "error");
      return false;
    }
    if (step === 1 && !formData.price) {
      showToast("Price is required", "error");
      return false;
    }
    if (step === 2 && !formData.description.trim()) {
      showToast("Description is required", "error");
      return false;
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(step + 1); };
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async () => {
    if (!selectedFile) {
      showToast("Please upload an image", "error");
      return;
    }

    setIsLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("description", formData.description);
      formDataObj.append("price", formData.price);
      formDataObj.append("category", formData.category);
      formDataObj.append("image", selectedFile);

      await createProduct(formDataObj);
      showToast("Product created successfully! Waiting for admin approval.", "success");
      onClose();
    } catch (err: any) {
      showToast(err.message || "Failed to create product", "error");
    } finally {
      setIsLoading(false);
    }
  };

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
            <div><label className="text-xs text-muted">Product Name</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg mt-1" placeholder="e.g. Premium T-Shirt" /></div>
            <div><label className="text-xs text-muted">Price (R)</label><input value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg mt-1" placeholder="150.00" /></div>
            <div><label className="text-xs text-muted">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg mt-1"><option>Clothing</option><option>Electronics</option><option>Home</option></select></div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div><label className="text-xs text-muted">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg mt-1 h-24" placeholder="Describe your product..." /></div>
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
          </div>
        )}

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={step === 1 || isLoading}>Back</Button>
          {step < 3 ? <Button onClick={nextStep} disabled={isLoading}>Next Step</Button> : <Button onClick={handleSubmit} disabled={isLoading}>{isLoading ? "Saving..." : "Save Product"}</Button>}
        </div>
      </div>
    </div>
  );
}
