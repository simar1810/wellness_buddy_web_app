"use client";

import React, { useEffect, useState } from "react";
import { Globe, Image as ImageIcon, Database, Save, Loader2 } from "lucide-react";
import { fetchData, sendData } from "@/lib/api";
import { toast } from "sonner";
import useSWR from "swr";
import Loader from "@/components/common/Loader";

export default function CustomizableLinks() {
  const { isLoading, error, data } = useSWR(
    "app/coach/customizable-links", () => fetchData("app/coach/customizable-links"),
  );
  const [formData, setFormData] = useState({
    healthMongoId: "",
    customWebLink: "",
    customPhotoLink: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function saveCustomizableLinks() {
    try {
      setLoading(true);
      const payload = ['healthMongoId', 'customWebLink', 'customPhotoLink']
      .reduce((acc, curr) => ({
        ...acc,
        ...(formData[curr] !== "" && { [curr]: formData[curr] })
      }), {})
      console.log(payload, formData)
      const response = await sendData("app/coach/customizable-links", payload);
      if (response.status_code !== 200) throw new Error(response.message);
      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(function() {
    if(data?.status_code === 200) {
      setFormData({
        healthMongoId: data?.data?.healthMongoId || "",
        customWebLink: data?.data?.customWebLink || "",
        customPhotoLink: data?.data?.customPhotoLink || "",
      })
    }
  }, [isLoading])

  if (isLoading) return <div className="h-96 flex items-center justify-center">
    <Loader />
  </div>

return (
    <div className="bg-slate-50/50 flex items-center justify-center">
      <div className="w-full bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-8 pb-6">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Client Metadata</h2>
          <p className="text-sm text-slate-500 mt-1">Configure external links and hardware identifiers.</p>
        </div>

        <div className="px-8 pb-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Database size={12} className="text-slate-400" /> Health Mongo ID
            </label>
            <input
              name="healthMongoId"
              value={formData.healthMongoId}
              onChange={handleChange}
              placeholder="507f1f77bcf86cd799439011"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Globe size={12} className="text-slate-400" /> Custom Web Link
            </label>
            <input
              name="customWebLink"
              value={formData.customWebLink}
              onChange={handleChange}
              placeholder="https://client-portal.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <ImageIcon size={12} className="text-slate-400" /> Custom Photo Link
            </label>
            <input
              name="customPhotoLink"
              value={formData.customPhotoLink}
              onChange={handleChange}
              placeholder="https://cdn.wellnessz.com/profile.jpg"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="px-8 py-4 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <button
            onClick={saveCustomizableLinks}
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
};