"use client";

import { MessageSquare, Sparkles, Check } from "lucide-react";
import { useWizard } from "@/lib/wizard/wizard-context";

const PRIMARY_PRESETS = [
  "#0f172a", // Slate Dark
  "#4f46e5", // Indigo
  "#0284c7", // Sky Blue
  "#059669", // Emerald
  "#7c3aed", // Violet
  "#dc2626", // Rose
];

const ACCENT_PRESETS = [
  "#4f46e5", // Indigo
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ec4899", // Pink
];

export function BrandingStepPanel() {
  const { state, updateBrand, updateBotName } = useWizard();
  const { brand, botName } = state;

  return (
    <div className="flex flex-col rounded-[30px] border border-slate-900/5 bg-white/80 p-6 sm:p-8 shadow-[0_12px_40px_rgba(15,23,42,0.04)] backdrop-blur-xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-indigo-600">
          <Sparkles className="h-3.5 w-3.5" /> Step 4 of 5
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Customize branding</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Make the assistant look and feel like a seamless extension of your brand identity.
        </p>
      </div>

      <div className="space-y-6">
        {/* Assistant Name */}
        <div>
          <label className="text-sm font-semibold text-slate-900">Assistant Name</label>
          <div className="relative mt-2">
            <input
              type="text"
              value={botName}
              onChange={(e) => updateBotName(e.target.value)}
              placeholder="e.g. Acme Support Bot"
              className="h-11 w-full rounded-2xl border border-slate-200 pl-4 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Primary Color Picker */}
        <div>
          <label className="text-sm font-semibold text-slate-900">Header & Primary Color</label>
          <div className="mt-3 flex items-center gap-3">
            {PRIMARY_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => updateBrand({ primaryColor: color })}
                style={{ backgroundColor: color }}
                className={`h-9 w-9 rounded-full shadow-sm transition hover:scale-105 flex items-center justify-center ${
                  brand.primaryColor === color ? "ring-2 ring-indigo-600 ring-offset-2" : ""
                }`}
              >
                {brand.primaryColor === color && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}

            <input
              type="color"
              value={brand.primaryColor}
              onChange={(e) => updateBrand({ primaryColor: e.target.value })}
              className="h-9 w-9 rounded-full border-0 p-0 cursor-pointer shadow-sm"
              title="Custom Color"
            />
          </div>
        </div>

        {/* Accent Color Picker */}
        <div>
          <label className="text-sm font-semibold text-slate-900">Accent & Button Color</label>
          <div className="mt-3 flex items-center gap-3">
            {ACCENT_PRESETS.map((color) => (
              <button
                key={color}
                onClick={() => updateBrand({ accentColor: color })}
                style={{ backgroundColor: color }}
                className={`h-9 w-9 rounded-full shadow-sm transition hover:scale-105 flex items-center justify-center ${
                  brand.accentColor === color ? "ring-2 ring-indigo-600 ring-offset-2" : ""
                }`}
              >
                {brand.accentColor === color && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}

            <input
              type="color"
              value={brand.accentColor}
              onChange={(e) => updateBrand({ accentColor: e.target.value })}
              className="h-9 w-9 rounded-full border-0 p-0 cursor-pointer shadow-sm"
              title="Custom Accent Color"
            />
          </div>
        </div>

        {/* Welcome Message */}
        <div>
          <label className="text-sm font-semibold text-slate-900">Welcome Message</label>
          <div className="relative mt-2">
            <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
            <textarea
              rows={3}
              value={brand.welcomeMessage}
              onChange={(e) => updateBrand({ welcomeMessage: e.target.value })}
              placeholder="Hi there! 👋 How can I help you today?"
              className="w-full rounded-2xl border border-slate-200 pl-10 pr-4 pt-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 bg-slate-50/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

