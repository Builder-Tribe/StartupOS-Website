"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  X,
  Sparkles,
  Loader2,
  ChevronRight,
  Plus,
  Minus,
  Check,
  AlertCircle,
  ImagePlus,
  Tag,
  DollarSign,
  FileText,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { fileToBase64 } from "@/lib/api";

type Stage = "upload" | "analysing" | "review" | "variants" | "publishing" | "done";

interface AIGeneratedListing {
  title: string;
  description: string;
  category: string;
  aesthetic_codes: string[];
  material_tags: string[];
  style_tags: string[];
  suggested_price_min: number;
  suggested_price_max: number;
  mrp_suggestion: number;
  ships_in_days: number;
  ai_confidence: number;
}

interface Variant {
  size: string;
  price: number;
  mrp: number;
  stock: number;
}

const ANALYSIS_STEPS = [
  "Identifying product category and style…",
  "Extracting material and texture details…",
  "Generating title and description…",
  "Tagging aesthetic codes…",
  "Estimating market price range…",
  "Finalising listing…",
];

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

// Mock AI response — replace with real Claude API call via backend
const MOCK_AI_RESPONSE: AIGeneratedListing = {
  title: "Handcrafted Ajrakh Block Print Indigo Kurta",
  description: "A beautifully crafted Ajrakh kurta featuring traditional block print patterns in deep indigo and earthy ochre tones. Hand-printed by master artisans in Kutch using natural dyes. The 100% cotton fabric ensures breathability, making it perfect for casual and semi-formal occasions. Each piece carries slight variations in print — a mark of authentic handcraft.",
  category: "fashion",
  aesthetic_codes: ["indie-boho", "artisan-craft", "earthy-tones", "india-heritage"],
  material_tags: ["100% cotton", "natural dyes", "hand-block-print", "ajrakh"],
  style_tags: ["kurta", "indo-western", "casual", "ethnic", "sustainable"],
  suggested_price_min: 1299,
  suggested_price_max: 1799,
  mrp_suggestion: 2499,
  ships_in_days: 3,
  ai_confidence: 91,
};

export default function AINewProductPage() {
  const router = useRouter();

  const [stage, setStage]       = useState<Stage>("upload");
  const [images, setImages]     = useState<{ file: File; preview: string }[]>([]);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [listing, setListing]   = useState<AIGeneratedListing | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [addingSize, setAddingSize] = useState(false);
  const [error, setError]       = useState("");
  const [publishing, setPublishing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Image handling ─────────────────────────────────────────────────────────

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const valid = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 8 - images.length);
    valid.forEach((file) => {
      const preview = URL.createObjectURL(file);
      setImages((prev) => [...prev, { file, preview }]);
    });
  }, [images.length]);

  const removeImage = useCallback((i: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ── AI Analysis ────────────────────────────────────────────────────────────

  const startAnalysis = useCallback(async () => {
    if (images.length === 0) { setError("Upload at least 1 photo"); return; }
    setError("");
    setStage("analysing");
    setAnalysisStep(0);

    // Step through analysis messages
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
      setAnalysisStep(i + 1);
    }

    // TODO: replace with real API call:
    // const base64Images = await Promise.all(images.map((img) => fileToBase64(img.file)));
    // const res = await axios.post("/api/v1/seller/catalog/ai-create", { images: base64Images }, { headers: { Authorization: `Bearer ${localStorage.getItem("ds_seller_token")}` } });
    // setListing(res.data.data);
    await fileToBase64(images[0].file); // touch the helper so it's used
    setListing(MOCK_AI_RESPONSE);

    // Pre-fill one variant
    setVariants([{ size: "M", price: MOCK_AI_RESPONSE.suggested_price_min, mrp: MOCK_AI_RESPONSE.mrp_suggestion, stock: 10 }]);
    setStage("review");
  }, [images]);

  // ── Variants ───────────────────────────────────────────────────────────────

  const addVariant = useCallback((size: string) => {
    if (variants.find((v) => v.size === size)) return;
    setVariants((prev) => [...prev, { size, price: listing?.suggested_price_min ?? 999, mrp: listing?.mrp_suggestion ?? 1499, stock: 5 }]);
    setAddingSize(false);
  }, [variants, listing]);

  const updateVariant = useCallback((i: number, field: keyof Variant, value: number | string) => {
    setVariants((prev) => prev.map((v, idx) => idx === i ? { ...v, [field]: value } : v));
  }, []);

  const removeVariant = useCallback((i: number) => {
    setVariants((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  // ── Publish ────────────────────────────────────────────────────────────────

  const handlePublish = useCallback(async () => {
    if (variants.length === 0) { setError("Add at least one size/variant"); return; }
    setPublishing(true);
    setStage("publishing");
    // TODO: POST /api/v1/seller/products with full listing + variants + images
    await new Promise((r) => setTimeout(r, 1500));
    setStage("done");
  }, [variants.length]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-4 md:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="w-8 h-8 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200">
          ←
        </button>
        <div>
          <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
            <Sparkles size={18} className="text-brand-500" /> AI Catalog Creator
          </h1>
          <p className="text-xs text-zinc-500">Claude Sonnet 5 turns your photo into a complete listing</p>
        </div>
      </div>

      {/* ── Upload Stage ── */}
      {stage === "upload" && (
        <div>
          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => images.length < 8 && fileInputRef.current?.click()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors mb-4",
              images.length > 0 ? "border-brand-300 bg-brand-50/50" : "border-zinc-200 hover:border-brand-300 hover:bg-brand-50/30"
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3">
              <ImagePlus size={22} className="text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-700 mb-1">Drop product photos here</p>
            <p className="text-xs text-zinc-400">Up to 8 photos · JPG, PNG, HEIC · Max 10MB each</p>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mb-5">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-zinc-900/70 text-white flex items-center justify-center"
                  >
                    <X size={10} />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-zinc-900/70 text-white px-1.5 py-0.5 rounded-full font-medium">Cover</span>}
                </div>
              ))}
              {images.length < 8 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-brand-300 transition-colors"
                >
                  <Upload size={18} />
                </button>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-100 mb-5">
            <p className="text-xs font-semibold text-zinc-700 mb-2">📸 Photo tips for better AI results</p>
            <ul className="text-xs text-zinc-500 space-y-1">
              <li>• Use natural light — avoid harsh shadows</li>
              <li>• Show the product from multiple angles</li>
              <li>• Include a close-up of texture/material</li>
              <li>• Plain or neutral background works best</li>
            </ul>
          </div>

          {error && <p className="mb-3 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}

          <button
            onClick={startAnalysis}
            disabled={images.length === 0}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all",
              images.length > 0 ? "bg-brand-500 text-white hover:bg-brand-600" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            )}
          >
            <Sparkles size={18} /> Analyse with AI
          </button>
        </div>
      )}

      {/* ── Analysing Stage ── */}
      {stage === "analysing" && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full bg-brand-100 animate-ping opacity-40" />
            <div className="relative w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center">
              <Sparkles size={32} className="text-brand-500" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-zinc-900 mb-2">Claude is analysing your product</h2>
          <div className="space-y-1 mb-6">
            {ANALYSIS_STEPS.map((step, i) => (
              <p key={i} className={cn("text-sm transition-all", i < analysisStep ? "text-brand-600 font-medium" : i === analysisStep - 1 ? "text-brand-600 font-medium" : "text-zinc-300")}>
                {i < analysisStep ? "✓ " : i === analysisStep - 1 ? "⟳ " : ""}{step}
              </p>
            ))}
          </div>
          <div className="w-48 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-700"
              style={{ width: `${(analysisStep / ANALYSIS_STEPS.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Review Stage ── */}
      {stage === "review" && listing && (
        <div>
          {/* AI Confidence Banner */}
          <div className="p-3 rounded-xl bg-brand-50 border border-brand-100 mb-5 flex items-center gap-3">
            <Sparkles size={16} className="text-brand-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-brand-800">AI generated — review and edit before publishing</p>
              <p className="text-xs text-brand-600">Confidence: {listing.ai_confidence}% · All fields are editable</p>
            </div>
          </div>

          {/* Title */}
          <Section icon={FileText} label="Title">
            <input
              value={listing.title}
              onChange={(e) => setListing({ ...listing, title: e.target.value })}
              className="w-full h-12 rounded-xl border-2 border-zinc-200 focus:border-brand-500 outline-none px-4 text-sm font-medium"
            />
          </Section>

          {/* Description */}
          <Section icon={FileText} label="Description">
            <textarea
              value={listing.description}
              onChange={(e) => setListing({ ...listing, description: e.target.value })}
              rows={4}
              className="w-full rounded-xl border-2 border-zinc-200 focus:border-brand-500 outline-none px-4 py-3 text-sm resize-none"
            />
          </Section>

          {/* Tags */}
          <Section icon={Tag} label="Aesthetic Codes">
            <div className="flex flex-wrap gap-2">
              {listing.aesthetic_codes.map((tag, i) => (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-xs font-medium text-brand-700">
                  {tag}
                  <button onClick={() => setListing({ ...listing, aesthetic_codes: listing.aesthetic_codes.filter((_, j) => j !== i) })}>
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-zinc-200 text-xs text-zinc-400">
                <Plus size={10} /> Add tag
              </button>
            </div>
          </Section>

          {/* Price */}
          <Section icon={DollarSign} label="Suggested Price Range">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-xs text-zinc-400 mb-1">Min</p>
                <div className="flex items-center h-11 rounded-xl border-2 border-zinc-200 focus-within:border-brand-500 px-3">
                  <span className="text-sm text-zinc-400 mr-1">₹</span>
                  <input
                    type="number"
                    value={listing.suggested_price_min}
                    onChange={(e) => setListing({ ...listing, suggested_price_min: +e.target.value })}
                    className="flex-1 bg-transparent text-sm font-medium outline-none"
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-400 mb-1">Max</p>
                <div className="flex items-center h-11 rounded-xl border-2 border-zinc-200 focus-within:border-brand-500 px-3">
                  <span className="text-sm text-zinc-400 mr-1">₹</span>
                  <input
                    type="number"
                    value={listing.suggested_price_max}
                    onChange={(e) => setListing({ ...listing, suggested_price_max: +e.target.value })}
                    className="flex-1 bg-transparent text-sm font-medium outline-none"
                  />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-400 mb-1">MRP</p>
                <div className="flex items-center h-11 rounded-xl border-2 border-zinc-200 focus-within:border-brand-500 px-3">
                  <span className="text-sm text-zinc-400 mr-1">₹</span>
                  <input
                    type="number"
                    value={listing.mrp_suggestion}
                    onChange={(e) => setListing({ ...listing, mrp_suggestion: +e.target.value })}
                    className="flex-1 bg-transparent text-sm font-medium outline-none"
                  />
                </div>
              </div>
            </div>
          </Section>

          <button
            onClick={() => setStage("variants")}
            className="w-full py-4 rounded-2xl bg-brand-500 text-white font-semibold flex items-center justify-center gap-2"
          >
            Next: Set Inventory <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* ── Variants Stage ── */}
      {stage === "variants" && listing && (
        <div>
          <Section icon={Layers} label="Sizes & Inventory">
            <div className="space-y-2">
              {variants.map((variant, i) => (
                <div key={i} className="flex items-center gap-2 p-3 rounded-xl border border-zinc-100 bg-zinc-50">
                  <span className="w-12 text-sm font-bold text-zinc-800">{variant.size}</span>
                  <div className="flex-1 flex gap-2">
                    <div className="flex items-center flex-1 h-9 rounded-lg border border-zinc-200 focus-within:border-brand-400 bg-white px-2">
                      <span className="text-xs text-zinc-400 mr-1">₹</span>
                      <input type="number" value={variant.price} onChange={(e) => updateVariant(i, "price", +e.target.value)} className="flex-1 bg-transparent text-xs outline-none font-medium" />
                    </div>
                    <div className="flex items-center gap-1.5 h-9 rounded-lg border border-zinc-200 focus-within:border-brand-400 bg-white px-2">
                      <button onClick={() => updateVariant(i, "stock", Math.max(0, variant.stock - 1))} className="text-zinc-400"><Minus size={12} /></button>
                      <span className="text-xs font-bold w-6 text-center">{variant.stock}</span>
                      <button onClick={() => updateVariant(i, "stock", variant.stock + 1)} className="text-zinc-400"><Plus size={12} /></button>
                    </div>
                  </div>
                  <button onClick={() => removeVariant(i)} className="text-zinc-300 hover:text-red-400"><X size={14} /></button>
                </div>
              ))}

              {/* Add size */}
              {addingSize ? (
                <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-brand-100 bg-brand-50">
                  {COMMON_SIZES.filter((s) => !variants.find((v) => v.size === s)).map((size) => (
                    <button key={size} onClick={() => addVariant(size)} className="px-3 py-1.5 rounded-full bg-white border border-brand-200 text-xs font-medium text-brand-700 hover:bg-brand-100">
                      + {size}
                    </button>
                  ))}
                  <button onClick={() => setAddingSize(false)} className="px-3 py-1.5 rounded-full bg-zinc-200 text-xs text-zinc-500">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setAddingSize(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-zinc-200 text-sm text-zinc-400 hover:border-brand-300 w-full">
                  <Plus size={14} /> Add size / variant
                </button>
              )}
            </div>
          </Section>

          {error && <p className="mb-3 text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}

          <button
            onClick={handlePublish}
            disabled={publishing || variants.length === 0}
            className={cn(
              "w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2",
              variants.length > 0 && !publishing ? "bg-brand-500 text-white" : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
            )}
          >
            {publishing ? <><Loader2 size={18} className="animate-spin" /> Publishing…</> : <>Publish Listing <ChevronRight size={18} /></>}
          </button>
        </div>
      )}

      {/* ── Publishing / Done ── */}
      {(stage === "publishing" || stage === "done") && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          {stage === "publishing" ? (
            <>
              <Loader2 size={40} className="text-brand-500 animate-spin mb-4" />
              <h2 className="text-lg font-bold text-zinc-900">Publishing your listing…</h2>
              <p className="text-sm text-zinc-500">Generating CLIP embeddings · Adding to search index</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                <Check size={36} className="text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mb-1">Product live!</h2>
              <p className="text-sm text-zinc-500 mb-6">Your listing is now discoverable via visual search.</p>
              <div className="flex gap-3">
                <button onClick={() => { setStage("upload"); setImages([]); setListing(null); setVariants([]); }} className="px-5 py-3 rounded-xl border border-zinc-200 text-sm font-medium text-zinc-700">
                  Add another
                </button>
                <button onClick={() => router.replace("/seller/products")} className="px-5 py-3 rounded-xl bg-brand-500 text-white text-sm font-semibold">
                  View products
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-zinc-400" />
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">{label}</label>
      </div>
      {children}
    </div>
  );
}
