import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, CheckCircle2, ClipboardList, Plus, Users } from "lucide-react";
import { BrandCampaignInput, Campaign, createBrandCampaign, getBrandCampaigns } from "./api";

type Props = { page: "dashboard" | "new"; navigate: (path: string) => void };

const emptyBrief = {
  title: "", objective: "", category: "", platform: "", location: "", budget: "", deadline: "",
  description: "", deliverables: "", requirements: ""
};

function splitLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export default function BrandApp({ page, navigate }: Props) {
  return page === "new" ? <CampaignBuilder navigate={navigate} /> : <BrandDashboard navigate={navigate} />;
}

function BrandDashboard({ navigate }: Pick<Props, "navigate">) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = () => {
    setLoading(true); setError("");
    getBrandCampaigns().then((result) => setCampaigns(result.campaigns))
      .catch((reason: Error) => setError(reason.message || "Could not load your briefs."))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);
  const totalApplicants = campaigns.reduce((sum, campaign) => sum + campaign.applicants, 0);
  return <main className="brand26-main">
    <section className="brand26-hero">
      <div><span className="ck26-overline">Brand workspace · CollabKaro Studio</span><h1>Briefs that<br /><em>move culture.</em></h1><p>Publish a clear invitation, then meet creators with a perspective worth backing.</p></div>
      <button className="brand26-primary" type="button" onClick={() => navigate("/brand/campaigns/new")}><Plus size={18} aria-hidden="true" /> Create campaign</button>
    </section>
    <section className="brand26-stats" aria-label="Campaign summary">
      <div><ClipboardList aria-hidden="true" /><small>Live campaigns</small><strong>{campaigns.length}</strong></div>
      <div><Users aria-hidden="true" /><small>Creator interest</small><strong>{totalApplicants}</strong></div>
      <div><CheckCircle2 aria-hidden="true" /><small>Published today</small><strong>{campaigns.length ? "Ready" : "—"}</strong></div>
    </section>
    <section className="brand26-list" aria-labelledby="your-briefs">
      <div className="brand26-sectionhead"><div><span className="ck26-overline">Your campaigns</span><h2 id="your-briefs">Published briefs</h2></div><button className="brand26-textbutton" onClick={load} type="button">Refresh</button></div>
      {loading && <div className="ck26-grid"><div className="ck26-skeleton" /><div className="ck26-skeleton" /></div>}
      {!loading && error && <div className="ck26-empty" role="alert"><strong>Your workspace didn&apos;t load.</strong><p>{error}</p><button type="button" onClick={load}>Try again</button></div>}
      {!loading && !error && !campaigns.length && <div className="brand26-empty"><ClipboardList size={28} aria-hidden="true" /><h3>Your first great brief starts here.</h3><p>Give creators a clear reason to make something memorable with you.</p><button className="brand26-primary" onClick={() => navigate("/brand/campaigns/new")} type="button"><Plus size={17} /> Create campaign</button></div>}
      {!loading && !error && campaigns.length > 0 && <div className="brand26-campaigns">{campaigns.map((campaign) => <article className="brand26-campaign" key={campaign.id}><div className="brand26-status">Published</div><span>{campaign.category} · {campaign.platform}</span><h3>{campaign.title}</h3><p>{campaign.description}</p><footer><strong>₹{campaign.budget.toLocaleString("en-IN")}</strong><small>Deadline {new Date(`${campaign.deadline}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</small><a href={`/campaigns/${campaign.id}`} onClick={(event) => { event.preventDefault(); navigate(`/campaigns/${campaign.id}`); }}>View brief <ArrowUpRight size={14} /></a></footer></article>)}</div>}
    </section>
  </main>;
}

function CampaignBuilder({ navigate }: Pick<Props, "navigate">) {
  const [form, setForm] = useState(emptyBrief);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const set = (key: keyof typeof emptyBrief, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError("");
    const deliverables = splitLines(form.deliverables), requirements = splitLines(form.requirements);
    if (!form.title.trim() || !form.category || !form.platform || !form.location.trim() || !form.description.trim() || !form.budget || !form.deadline || !deliverables.length || !requirements.length) {
      setError("Complete every required field, including at least one deliverable and creator requirement."); return;
    }
    if (!Number.isFinite(Number(form.budget)) || Number(form.budget) <= 0) { setError("Enter a positive campaign budget."); return; }
    setSubmitting(true);
    try {
      const input: BrandCampaignInput = { title: form.title, objective: form.objective || undefined, category: form.category, platform: form.platform, location: form.location, budget: Number(form.budget), deadline: form.deadline, description: form.description, deliverables, requirements };
      await createBrandCampaign(input);
      navigate("/brand");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not publish this campaign."); } finally { setSubmitting(false); }
  };
  return <main className="brand26-main brand26-builder">
    <a className="brand26-back" href="/brand" onClick={(event) => { event.preventDefault(); navigate("/brand"); }}><ArrowLeft size={16} /> Back to workspace</a>
    <div className="brand26-builderhead"><span className="ck26-overline">New campaign</span><h1>Make the brief<br /><em>worth opening.</em></h1><p>Specific context attracts thoughtful pitches. This goes live to creators as soon as you publish.</p></div>
    <form className="brand26-form" onSubmit={submit}>
      <fieldset><legend>Campaign essentials</legend><label>Campaign title <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. A summer ritual worth sharing" required /></label><label>Campaign objective <small>What should this collaboration accomplish?</small><input value={form.objective} onChange={(e) => set("objective", e.target.value)} placeholder="Build consideration for a new launch" /></label><label>Brief and creative context <small>Tell creators what makes this story matter.</small><textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Share the product, the audience, and the feeling you want the work to create." required /></label></fieldset>
      <fieldset><legend>Scope and timing</legend><div className="brand26-two"><label>Category <select value={form.category} onChange={(e) => set("category", e.target.value)} required><option value="">Choose a category</option>{["Beauty", "Fashion", "Fitness", "Food", "Technology"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Primary platform <select value={form.platform} onChange={(e) => set("platform", e.target.value)} required><option value="">Choose a platform</option>{["Instagram", "YouTube", "LinkedIn", "Shorts"].map((item) => <option key={item}>{item}</option>)}</select></label><label>Location <input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Mumbai or Pan India" required /></label><label>Campaign budget (₹) <input type="number" min="1" value={form.budget} onChange={(e) => set("budget", e.target.value)} placeholder="25000" required /></label></div><label>Application deadline <small>Creators can see this date on the live brief.</small><input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} required /></label></fieldset>
      <fieldset><legend>Creators and deliverables</legend><div className="brand26-two"><label>Deliverables <small>One item per line.</small><textarea value={form.deliverables} onChange={(e) => set("deliverables", e.target.value)} placeholder={"1 Instagram Reel\n3 story frames"} required /></label><label>Creator criteria <small>One requirement per line.</small><textarea value={form.requirements} onChange={(e) => set("requirements", e.target.value)} placeholder={"Beauty or wellness niche\n10K+ followers"} required /></label></div></fieldset>
      {error && <div className="brand26-error" role="alert">{error}</div>}
      <div className="brand26-submit"><p><CheckCircle2 size={17} /> Publishing makes this brief immediately visible to creators.</p><button className="brand26-primary" disabled={submitting}>{submitting ? "Publishing campaign…" : "Publish campaign"} <ArrowUpRight size={17} /></button></div>
    </form>
  </main>;
}