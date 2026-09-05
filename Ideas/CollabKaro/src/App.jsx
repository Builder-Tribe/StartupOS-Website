import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, ShieldCheck, DollarSign, Search, PlusCircle, 
  Sparkles, CheckCircle2, AlertCircle, Lock, ArrowRight, ExternalLink, RefreshCw
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [stats, setStats] = useState({ totalCampaigns: 0, totalCreators: 0, totalEscrow: 0, releasedEscrow: 0 });
  const [creators, setCreators] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // New Campaign Form Modal
  const [showModal, setShowModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ brand_name: '', title: '', category: 'Tech', budget: 50000, deliverable_type: 'Instagram Reel' });

  const fetchData = async () => {
    try {
      const [resStats, resCreators, resCmp, resProp, resAudit] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/creators').then(r => r.json()),
        fetch('/api/campaigns').then(r => r.json()),
        fetch('/api/proposals').then(r => r.json()),
        fetch('/api/audit').then(r => r.json()),
      ]);

      setStats(resStats);
      setCreators(resCreators);
      setCampaigns(resCmp);
      setProposals(resProp);
      setAuditLogs(resAudit);
    } catch (e) {
      console.error('Failed to load API data', e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCampaign)
    });
    setShowModal(false);
    fetchData();
  };

  const handleEscrowAction = async (milestoneId, action) => {
    await fetch(`/api/milestones/${milestoneId}/${action}`, { method: 'POST' });
    fetchData();
  };

  const filteredCreators = creators.filter(c => 
    (filterCategory === 'All' || c.niche.includes(filterCategory)) &&
    (c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.city.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* OpenAI Astra / Razorpay 2026 Glassmorphism Ambient Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-200/40 to-pink-200/40 rounded-full blur-3xl opacity-70"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-teal-200/40 rounded-full blur-3xl opacity-70"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-bold text-xl">
              CK
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">CollabKaro</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">India Escrow OS</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button 
              onClick={() => setActiveTab('campaigns')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'campaigns' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Briefcase className="w-4 h-4" /> Campaigns
            </button>
            <button 
              onClick={() => setActiveTab('creators')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'creators' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Users className="w-4 h-4" /> Creator Directory
            </button>
            <button 
              onClick={() => setActiveTab('escrow')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'escrow' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <ShieldCheck className="w-4 h-4" /> Escrow & Proposals
            </button>
            <button 
              onClick={() => setActiveTab('audit')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'audit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Lock className="w-4 h-4" /> Governance Audit
            </button>
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-4 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 relative z-10">
        {/* Top KPI Metrics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Active Campaigns</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600"><Briefcase className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalCampaigns}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Verified Creators</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600"><Users className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats.totalCreators}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Escrow Held</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600"><Lock className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">₹{(stats.totalEscrow || 0).toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">Payouts Released</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign className="w-5 h-5" /></div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">₹{(stats.releasedEscrow || 0).toLocaleString('en-IN')}</p>
          </div>
        </div>

        {/* Tab 1: Campaigns */}
        {activeTab === 'campaigns' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Active Brand Campaigns</h2>
              <span className="text-xs text-slate-500">Showing all public campaign briefs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.map((cmp) => (
                <div key={cmp.id} className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">{cmp.category}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Verified Brand</span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-900 leading-snug">{cmp.title}</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">by {cmp.brand_name}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
                      <span className="text-slate-500">Deliverable:</span>
                      <span className="font-semibold text-slate-800">{cmp.deliverable_type}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 font-medium block">Total Budget</span>
                      <span className="text-xl font-extrabold text-slate-900">₹{cmp.budget.toLocaleString('en-IN')}</span>
                    </div>
                    <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold text-sm px-4 py-2 rounded-xl transition-all">
                      Pitch Concept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Creators */}
        {activeTab === 'creators' && (
          <div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search by creator name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto">
                {['All', 'Tech', 'Fashion', 'Fitness', 'Food'].map(cat => (
                  <button 
                    key={cat} 
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCreators.map((creator) => (
                <div key={creator.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all text-center">
                  <div className="relative w-20 h-20 mx-auto mb-3">
                    <img src={creator.avatar} alt={creator.name} className="w-20 h-20 rounded-full object-cover border-2 border-indigo-100" />
                    {creator.verified === 1 && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 bg-white rounded-full absolute bottom-0 right-0" />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{creator.name}</h3>
                  <p className="text-xs text-indigo-600 font-semibold">{creator.instagram_handle}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{creator.niche} • {creator.city}</p>

                  <div className="grid grid-cols-2 gap-2 my-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block">Followers</span>
                      <span className="font-bold text-slate-800">{(creator.followers / 1000).toFixed(0)}k</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Engagement</span>
                      <span className="font-bold text-slate-800">{creator.engagement_rate}%</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Reel Rate</span>
                    <span className="text-sm font-bold text-slate-900">₹{creator.rate_per_reel.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Escrow */}
        {activeTab === 'escrow' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Proposals & Escrow Milestone Management</h2>
              <button onClick={fetchData} className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline">
                <RefreshCw className="w-3.5 h-3.5" /> Sync Status
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Proposal #PROP-102: Summer Hydration Campaign</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Creator: Ananya Verma (@ananya_style) • Agreed Quote: ₹35,000</p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Active Contract</span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">1</div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">Script & Concept Approval</h4>
                      <p className="text-xs text-slate-500">Amount: ₹10,000</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">Approved & Paid</span>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">2</div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">Draft Reel Video Upload</h4>
                      <p className="text-xs text-slate-500">Amount: ₹15,000 (Held in Escrow)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEscrowAction('m2', 'release')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm transition-all"
                  >
                    Release Escrow Payout
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm">3</div>
                    <div>
                      <h4 className="font-semibold text-sm text-slate-900">Live Post & Analytics Proof</h4>
                      <p className="text-xs text-slate-500">Amount: ₹10,000</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleEscrowAction('m3', 'fund')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-sm transition-all"
                  >
                    Fund Escrow
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Audit Logs */}
        {activeTab === 'audit' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Platform Escrow Audit Log</h2>
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Action</th>
                    <th className="py-3.5 px-4">Details</th>
                    <th className="py-3.5 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-indigo-600 text-xs">{log.action}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">{log.details}</td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Create New Campaign Brief</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Brand Name</label>
                <input 
                  type="text" 
                  required
                  value={newCampaign.brand_name}
                  onChange={(e) => setNewCampaign({...newCampaign, brand_name: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Mamaearth"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Campaign Title</label>
                <input 
                  type="text" 
                  required
                  value={newCampaign.title}
                  onChange={(e) => setNewCampaign({...newCampaign, title: e.target.value})}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Monsoon Hair Care Reel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                  <select 
                    value={newCampaign.category}
                    onChange={(e) => setNewCampaign({...newCampaign, category: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option>Tech</option>
                    <option>Beauty</option>
                    <option>Fashion</option>
                    <option>Fitness</option>
                    <option>Food</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Budget (₹)</label>
                  <input 
                    type="number" 
                    required
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({...newCampaign, budget: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-500/20">Publish Brief</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
