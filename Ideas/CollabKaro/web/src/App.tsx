import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, Bookmark, ChevronDown, MapPin, Search, Sparkles, X } from "lucide-react";
import { Campaign, createApplication, getCampaign, getCampaigns, getCreatorProfile } from "./api";
import { getApplicationFailureType, trackEvent } from "./analytics";
import BrandApp from "./BrandApp";
import CreatorProfileApp from "./CreatorProfileApp";
import "./index.css";

const categories = ["All categories", "Beauty", "Fashion", "Fitness", "Food", "Technology"];
const platforms = ["All platforms", "Instagram", "YouTube", "LinkedIn", "Shorts"];

function navigate(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function Header({ brand }: { brand: boolean }) {
  const scrollToCampaigns = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (window.location.pathname !== "/") navigate("/");
    window.setTimeout(() => document.getElementById("campaigns")?.scrollIntoView({ behavior: "smooth" }), 0);
  };

  return <header className="ck26-nav">
    <a className="ck26-logo" href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }} aria-label="CollabKaro home"><span>K</span>collab<span className="ck26-logo-dot">karo</span></a>
    <nav className="ck26-navlinks" aria-label="Primary navigation">
      <a href="#campaigns" onClick={scrollToCampaigns}>Discover</a>
      {!brand && <><a href="/creator/profile" onClick={(e) => { e.preventDefault(); navigate("/creator/profile"); }}>Profile</a><a href="/creator/applications" onClick={(e) => { e.preventDefault(); navigate("/creator/applications"); }}>Applications</a></>}
      <a href="#how">How it works</a>
    </nav>
    <button className="ck26-profile ck26-role" type="button" onClick={() => navigate(brand ? "/" : "/brand")} aria-label={`Switch to ${brand ? "creator" : "brand"} workspace`}><span>{brand ? "CS" : "CK"}</span><i>{brand ? "Brand" : "Creator"}</i><ChevronDown size={15} aria-hidden="true" /></button>
  </header>;
}

function CampaignCard({ campaign, index, saved, onToggleSave }: { campaign: Campaign; index: number; saved: boolean; onToggleSave: () => void }) {
  const goToCampaign = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    navigate(`/campaigns/${encodeURIComponent(campaign.id)}`);
  };

  return <article className={`ck26-card ${campaign.featured ? "featured" : ""}`} style={{ "--i": index } as React.CSSProperties}>
    <div className="ck26-cardhead">
      <div className="ck26-brand"><span>{campaign.brandInitials}</span><div><strong>{campaign.brand}</strong><small>Verified brand</small></div></div>
      <button className={`ck26-save ${saved ? "is-saved" : ""}`} type="button" onClick={onToggleSave} aria-pressed={saved} aria-label={`${saved ? "Unsave" : "Save"} ${campaign.title}`}><Bookmark size={17} fill={saved ? "currentColor" : "none"} aria-hidden="true" /></button>
    </div>
    <a className="ck26-card-link" href={`/campaigns/${campaign.id}`} onClick={goToCampaign}>
      <div className="ck26-cardtitle">
        {campaign.featured && <span className="ck26-feature">Top match</span>}
        <h3>{campaign.title}</h3>
        <p>{campaign.description}</p>
      </div>
       {!!campaign.matchReasons?.length && <div className="match-reasons" aria-label="Why this campaign matches">{campaign.matchReasons.slice(0, 2).map((reason) => <span key={reason}>{reason}</span>)}</div>}
      <div className="ck26-tags"><span>{campaign.category}</span><span>{campaign.platform}</span><span><MapPin size={12} aria-hidden="true" />{campaign.location}</span></div>
      <div className="ck26-cardfoot"><div><small>Indicative budget</small><strong>₹{campaign.budget.toLocaleString("en-IN")}</strong></div><div className="ck26-match"><b>{campaign.match}%</b><small>match</small></div><span className="ck26-open" aria-hidden="true"><ArrowUpRight size={19} /></span></div>
    </a>
  </article>;
}

function Discovery() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [platform, setPlatform] = useState("");
  const [saved, setSaved] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [profileReady, setProfileReady] = useState<boolean | null>(null);
  useEffect(() => { getCreatorProfile().then(({ profile }) => setProfileReady(!!profile?.completed)).catch(() => setProfileReady(false)); }, []);

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    getCampaigns({ search, category, platform })
      .then((result) => { if (active) { setCampaigns(result.campaigns); setTotal(result.total); } })
      .catch((reason: Error) => { if (active) setError(reason.message || "Could not load campaigns."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search, category, platform, refresh]);

  const clearFilters = () => { setSearch(""); setCategory(""); setPlatform(""); };
  return <main className="ck26-main">
    <section className="ck26-intro" aria-labelledby="discovery-title">
      <div className="ck26-kicker"><Sparkles size={15} aria-hidden="true" /> Made for the culturally fluent</div>
      <h1 id="discovery-title">Find the brief<br /><em>that feels like you.</em></h1>
      <p>Open doors to work worth making. Browse thoughtful campaigns from India&apos;s most interesting brands, then pitch your point of view.</p>
      <div className="ck26-statline"><strong><span>●</span> Live</strong> creator opportunities with clear budgets and context</div>
      {profileReady === false && <aside className="onboarding-prompt"><strong>Make discovery more personal.</strong><span>Complete your creator profile for tailored match reasons and a shareable media kit.</span><button type="button" onClick={() => navigate("/onboarding/creator")}>Build your profile</button></aside>}
    </section>

    <section className="ck26-discovery" aria-label="Campaign discovery">
      <div className="ck26-search"><Search size={19} aria-hidden="true" /><label className="sr-only" htmlFor="campaign-search">Search campaigns</label><input id="campaign-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brands, briefs, or places" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search"><X size={16} aria-hidden="true" /></button>}</div>
      <div className="ck26-select"><label htmlFor="campaign-category">Category</label><select id="campaign-category" value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((item) => <option key={item} value={item === "All categories" ? "" : item}>{item}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></div>
      <div className="ck26-select"><label htmlFor="campaign-platform">Platform</label><select id="campaign-platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>{platforms.map((item) => <option key={item} value={item === "All platforms" ? "" : item}>{item}</option>)}</select><ChevronDown size={15} aria-hidden="true" /></div>
    </section>

    <section id="campaigns" className="ck26-results" aria-labelledby="open-calls-title">
      <div className="ck26-results-head"><div><span className="ck26-overline">For you · This week</span><h2 id="open-calls-title">Briefs with a point of view</h2></div><span className="ck26-count">{loading ? "Finding briefs…" : `${campaigns.length} of ${total} open`}</span></div>
      {loading && <div className="ck26-grid" aria-label="Loading campaigns"><div className="ck26-skeleton" /><div className="ck26-skeleton" /><div className="ck26-skeleton" /></div>}
      {!loading && error && <div className="ck26-empty" role="alert"><strong>That didn&apos;t load.</strong><p>{error}</p><button type="button" onClick={() => setRefresh((value) => value + 1)}>Try again</button></div>}
      {!loading && !error && !campaigns.length && <div className="ck26-empty"><Sparkles size={20} aria-hidden="true" /><strong>No briefs in this pocket yet.</strong><p>Try a wider search or clear a filter. Fresh opportunities land every week.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
      {!loading && !error && campaigns.length > 0 && <div className="ck26-grid">{campaigns.map((campaign, index) => <CampaignCard key={campaign.id} campaign={campaign} index={index} saved={saved.includes(campaign.id)} onToggleSave={() => setSaved((items) => items.includes(campaign.id) ? items.filter((id) => id !== campaign.id) : [...items, campaign.id])} />)}</div>}
    </section>

    <section id="how" className="ck26-how" aria-labelledby="how-title"><div><span className="ck26-overline">The good stuff</span><h2 id="how-title">Less scrolling.<br /><em>More making.</em></h2></div><div className="ck26-steps"><div><b>01</b><strong>Find your fit</strong><p>Every brief has a clear budget, context, and reason to exist.</p></div><div><b>02</b><strong>Bring your angle</strong><p>Pitch the idea only you could make. No templated proposals.</p></div><div><b>03</b><strong>Make something real</strong><p>Work directly with brands who value your perspective.</p></div></div></section>
  </main>;
}

function CampaignDetail({ id }: { id: string }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ creatorName: "", handle: "", pitch: "", proposedRate: "" });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const load = () => { setLoading(true); setError(""); getCampaign(id).then((result) => { setCampaign(result); trackEvent("campaign_viewed", { campaign_id: result.id, category: result.category, platform: result.platform }); }).catch((reason: Error) => setError(reason.message || "This brief is unavailable.")).finally(() => setLoading(false)); };
  useEffect(load, [id]);
  useEffect(() => { getCreatorProfile().then(({ profile }) => { if (profile?.completed) setForm((current) => ({ ...current, creatorName: current.creatorName || profile.displayName, handle: current.handle || profile.handle, proposedRate: current.proposedRate || String((profile.services[0]?.rate ?? profile.campaignPreferences.minimumRate) || "") })); }).catch(() => undefined); }, []);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!campaign) { setFormError("This brief is unavailable. Please reload and try again."); return; } if (!form.creatorName || !form.handle || !form.pitch || !form.proposedRate) { setFormError("Fill in every field so the brand can get a clear picture."); return; } const submittedCampaign = campaign; setSubmitting(true); setFormError(""); createApplication({ campaignId: id, creatorName: form.creatorName, handle: form.handle, pitch: form.pitch, proposedRate: Number(form.proposedRate) }).then(() => { trackEvent("pitch_submitted", { campaign_id: submittedCampaign.id, category: submittedCampaign.category, platform: submittedCampaign.platform }); navigate("/applications/success"); }).catch((reason: Error) => { trackEvent("pitch_submission_failed", { campaign_id: submittedCampaign.id, category: submittedCampaign.category, platform: submittedCampaign.platform, failure_type: getApplicationFailureType(reason) }); setFormError(reason.message || "Your pitch could not be sent. Please try again."); }).finally(() => setSubmitting(false)); };
  if (loading) return <main className="container detail-wrap"><div className="skeleton" /></main>;
  if (error || !campaign) return <main className="container state"><strong>We couldn’t find that brief.</strong><p>{error}</p><button className="top-link" onClick={load}>Try again</button></main>;
  return <main className="container detail-wrap"><a className="back" href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}>← Back to all briefs</a><div className="detail-layout"><article className="detail-main"><div className="detail-brand"><span className="brand-avatar">{campaign.brandInitials}</span><div><strong>{campaign.brand}</strong><span>{campaign.location} · {campaign.platform}</span></div></div><div className="eyebrow">{campaign.category} · {campaign.applicants} creators already interested</div><h1>{campaign.title}</h1><p className="detail-description">{campaign.description}</p><div className="detail-block"><h2>What you’ll make</h2><ul>{campaign.deliverables.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="detail-block"><h2>Who this is for</h2><ul>{campaign.requirements.map((item) => <li key={item}>{item}</li>)}</ul></div></article><form className="apply-card" onSubmit={submit}><h2>Make your pitch</h2><p>Keep it human. Tell {campaign.brand} why this brief has your name on it.</p><div className="form-field"><label htmlFor="creatorName">Your name</label><input id="creatorName" value={form.creatorName} onChange={(e) => setForm({ ...form, creatorName: e.target.value })} /></div><div className="form-field"><label htmlFor="handle">Social handle</label><input id="handle" placeholder="@yourhandle" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} /></div><div className="form-field"><label htmlFor="pitch">Your pitch</label><textarea id="pitch" placeholder="What would you make, and why would it work?" value={form.pitch} onChange={(e) => setForm({ ...form, pitch: e.target.value })} /></div><div className="form-field"><label htmlFor="rate">Proposed rate (₹)</label><input id="rate" type="number" min="1000" step="500" value={form.proposedRate} onChange={(e) => setForm({ ...form, proposedRate: e.target.value })} /></div>{formError && <div className="form-error" role="alert">{formError}</div>}<button className="submit" disabled={submitting}>{submitting ? "Sending your pitch…" : "Send pitch"}</button></form></div></main>;
}

function Success() { return <main className="success"><div><div className="success-mark">✓</div><div className="eyebrow">Pitch sent</div><h1>You’re in the mix.</h1><p>Your application is on its way to the brand. Keep making good things while they take a look.</p><a className="browse" href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}>Browse more briefs</a></div></main>; }

export default function App() {
  const [path, setPath] = useState(window.location.pathname);
  useEffect(() => { const onPopState = () => setPath(window.location.pathname); window.addEventListener("popstate", onPopState); return () => window.removeEventListener("popstate", onPopState); }, []);
  const isBrand = path === "/brand" || path === "/brand/" || path === "/brand/campaigns/new";
  let page = <Discovery />;
  if (path === "/brand" || path === "/brand/") page = <BrandApp page="dashboard" navigate={navigate} />;
  else if (path === "/brand/campaigns/new") page = <BrandApp page="new" navigate={navigate} />;
  if (path === "/applications/success") page = <Success />;
  else if (path === "/onboarding/creator") page = <CreatorProfileApp page="onboarding" navigate={navigate} />;
  else if (path === "/creator/profile") page = <CreatorProfileApp page="profile" navigate={navigate} />;
  else if (path === "/creator/media-kit") page = <CreatorProfileApp page="media-kit" navigate={navigate} />;
  else if (path === "/creator/applications") page = <CreatorProfileApp page="applications" navigate={navigate} />;
  else if (path.startsWith("/campaigns/")) page = <CampaignDetail id={decodeURIComponent(path.split("/")[2] || "")} />;
  return <div className="ck26-shell app-shell"><Header brand={isBrand} />{page}</div>;
}