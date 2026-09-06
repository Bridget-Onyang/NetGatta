import { useState, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

type View = "home" | "priority" | "activity" | "feedback";
type Priority = "High" | "Medium" | "Low";

interface TrafficItem {
  id: number;
  app: string;
  category: string;
  score: number;
  priority: Priority;
  action: string;
  release: string;
  icon: string;
}

interface ActivityItem {
  id: number;
  user: string;
  initials: string;
  color: string;
  action: string;
  target: string;
  tag: string;
  tagColor: string;
  time: string;
}

interface Idea {
  id: number;
  title: string;
  description: string;
  votes: number;
  voted: boolean;
  tag: string;
  author: string;
  date: string;
}

// ── Data ──────────────────────────────────────────────────────────────────

const trafficItems: TrafficItem[] = [
  { id: 1, app: "Video Call", category: "Real-time", score: 95, priority: "High", action: "PRIORITIZE", release: "2026-Q3", icon: "🎥" },
  { id: 2, app: "Voice Call", category: "Real-time", score: 91, priority: "High", action: "PRIORITIZE", release: "2026-Q3", icon: "📞" },
  { id: 3, app: "Messaging", category: "Interactive", score: 74, priority: "Medium", action: "NORMAL", release: "2026-Q4", icon: "💬" },
  { id: 4, app: "Web Browsing", category: "Interactive", score: 68, priority: "Medium", action: "NORMAL", release: "2026-Q4", icon: "🌐" },
  { id: 5, app: "Video Stream", category: "Streaming", score: 58, priority: "Medium", action: "REDUCED", release: "2027-Q1", icon: "▶️" },
  { id: 6, app: "Mobile Gaming", category: "Interactive", score: 62, priority: "Medium", action: "NORMAL", release: "2026-Q4", icon: "🎮" },
  { id: 7, app: "Cloud Backup", category: "Background", score: 21, priority: "Low", action: "DEPRIORITIZE", release: "2027-Q1", icon: "☁️" },
  { id: 8, app: "App Update", category: "Updates", score: 12, priority: "Low", action: "DEPRIORITIZE", release: "2027-Q2", icon: "⬇️" },
  { id: 9, app: "File Sync", category: "Background", score: 18, priority: "Low", action: "DEPRIORITIZE", release: "2027-Q2", icon: "🔄" },
];

const activityItems: ActivityItem[] = [
  { id: 1, user: "NetGatta AI", initials: "AI", color: "#2563EB", action: "prioritized", target: "Video Call (Score 95)", tag: "PRIORITIZE", tagColor: "bg-blue-100 text-blue-700", time: "Just now" },
  { id: 2, user: "System Monitor", initials: "SM", color: "#059669", action: "detected", target: "Network congestion on LTE", tag: "ALERT", tagColor: "bg-red-100 text-red-700", time: "2m ago" },
  { id: 3, user: "Policy Engine", initials: "PE", color: "#7C3AED", action: "deprioritized", target: "Cloud Backup (Score 21)", tag: "DEPRIORITIZE", tagColor: "bg-slate-100 text-slate-600", time: "3m ago" },
  { id: 4, user: "Sarah Kim", initials: "SK", color: "#EA580C", action: "adjusted policy for", target: "Background traffic threshold", tag: "CONFIG", tagColor: "bg-amber-100 text-amber-700", time: "11m ago" },
  { id: 5, user: "NetGatta AI", initials: "AI", color: "#2563EB", action: "classified", target: "New traffic stream as Interactive", tag: "CLASSIFY", tagColor: "bg-indigo-100 text-indigo-700", time: "18m ago" },
  { id: 6, user: "Data Miner", initials: "DM", color: "#0891B2", action: "completed pattern analysis on", target: "7-day historical dataset", tag: "ANALYSIS", tagColor: "bg-cyan-100 text-cyan-700", time: "32m ago" },
  { id: 7, user: "Raj Patel", initials: "RP", color: "#BE185D", action: "reviewed AI decision for", target: "Streaming priority reduction", tag: "REVIEW", tagColor: "bg-pink-100 text-pink-700", time: "1h ago" },
  { id: 8, user: "System Monitor", initials: "SM", color: "#059669", action: "restored normal allocation for", target: "All traffic (network improved)", tag: "RESTORE", tagColor: "bg-green-100 text-green-700", time: "1h 14m ago" },
  { id: 9, user: "Model Trainer", initials: "MT", color: "#6D28D9", action: "updated ML model with", target: "Latest congestion patterns", tag: "TRAIN", tagColor: "bg-violet-100 text-violet-700", time: "2h ago" },
  { id: 10, user: "Leon Fischer", initials: "LF", color: "#0E7490", action: "submitted report on", target: "Q3 prioritization accuracy", tag: "REPORT", tagColor: "bg-teal-100 text-teal-700", time: "3h ago" },
];

const initialIdeas: Idea[] = [
  { id: 1, title: "Per-app manual priority override", description: "Allow users to manually set priority overrides for specific apps that persist across sessions, overriding AI decisions when needed.", votes: 47, voted: false, tag: "Control", author: "M. Torres", date: "Aug 28" },
  { id: 2, title: "Scheduled bandwidth windows", description: "Let users define time windows where certain traffic types (e.g., backups) are automatically allowed full bandwidth — like overnight scheduling.", votes: 38, voted: false, tag: "Scheduling", author: "Y. Nakamura", date: "Sep 1" },
  { id: 3, title: "Dark mode dashboard", description: "Add dark mode support for the web dashboard. Long sessions on bright white are fatiguing, especially for ops engineers.", votes: 31, voted: false, tag: "UX", author: "A. Bergström", date: "Sep 2" },
  { id: 4, title: "Priority decision export (CSV/JSON)", description: "Export historical prioritization decisions with timestamps, scores, and reasons for compliance audits and offline analysis.", votes: 26, voted: false, tag: "Data", author: "P. Okonkwo", date: "Aug 19" },
  { id: 5, title: "Webhook notifications on congestion events", description: "Fire a webhook when congestion is detected or when a prioritization action is taken, enabling integration with PagerDuty and Slack.", votes: 19, voted: false, tag: "Integrations", author: "C. Larsson", date: "Sep 3" },
];

// ── Stat Card ──────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg border p-5 ${accent ? "bg-[#2563EB] border-[#2563EB]" : "bg-white border-slate-200"}`}>
      <p className={`text-xs font-mono tracking-widest uppercase mb-3 ${accent ? "text-blue-200" : "text-slate-400"}`}>{label}</p>
      <p className={`text-3xl font-display font-700 leading-none mb-1 ${accent ? "text-white" : "text-[#0F172A]"}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{value}</p>
      <p className={`text-xs font-mono ${accent ? "text-blue-200" : "text-slate-400"}`}>{sub}</p>
    </div>
  );
}

// ── Priority Badge ─────────────────────────────────────────────────────────

function PriorityBadge({ p }: { p: Priority }) {
  const cfg: Record<Priority, string> = {
    High: "bg-blue-50 text-blue-700 border-blue-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-mono font-500 ${cfg[p]}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <span className={`w-1.5 h-1.5 rounded-full ${p === "High" ? "bg-blue-500" : p === "Medium" ? "bg-amber-400" : "bg-slate-400"}`} />
      {p}
    </span>
  );
}

// ── Score Bar ──────────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? "#2563EB" : score >= 50 ? "#F59E0B" : "#94A3B8";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-mono text-slate-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{score}</span>
    </div>
  );
}

// ── Home View ──────────────────────────────────────────────────────────────

function HomeView() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-700 text-[#0F172A] mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
            Good morning, Sarah
          </h1>
          <p className="text-sm text-slate-500 font-sans">NetGatta is actively monitoring 4 network streams · LTE · <span className="text-green-600 font-medium">Excellent</span></p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-green-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>SYSTEM ACTIVE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="AI Priority Score" value="94/100" sub="+6 from yesterday" accent />
        <StatCard label="Active Streams" value="14" sub="4 prioritized now" />
        <StatCard label="Congestion Events" value="3" sub="Last 24 hours" />
        <StatCard label="Model Accuracy" value="97.4%" sub="Last 1000 decisions" />
      </div>

      {/* Network condition + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network health */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-sm font-mono font-500 text-slate-400 uppercase tracking-widest mb-5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Network Health · Live</h2>
          <div className="space-y-4">
            {[
              { label: "Bandwidth Utilization", value: 62, unit: "% of 50 Mbps" },
              { label: "Latency", value: 24, unit: "ms (target <80ms)" },
              { label: "Packet Loss", value: 8, unit: "% (threshold 5%)" },
              { label: "AI Confidence", value: 96, unit: "% prediction accuracy" },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-slate-700 font-sans">{m.label}</span>
                  <span className="text-xs font-mono text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{m.value}{m.unit.startsWith("%") ? "%" : ""} <span className="text-slate-300">{m.unit.startsWith("%") ? m.unit.slice(1) : m.unit}</span></span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${m.value}%`,
                      backgroundColor: m.value > 80 ? "#EF4444" : m.value > 60 ? "#F59E0B" : "#2563EB",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h2 className="text-sm font-mono font-500 text-slate-400 uppercase tracking-widest mb-5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Force Prioritize Video Call", icon: "🎥" },
              { label: "Pause All Background Traffic", icon: "⏸" },
              { label: "Reset to Auto Mode", icon: "↺" },
              { label: "Run Data Mining Cycle", icon: "⛏" },
              { label: "Export Decision Log", icon: "↗" },
            ].map((a) => (
              <button
                key={a.label}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-slate-700 bg-slate-50 hover:bg-[#EFF6FF] hover:text-[#2563EB] border border-transparent hover:border-blue-100 transition-all text-left"
              >
                <span className="text-base">{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top prioritized traffic */}
      <div className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="text-sm font-mono font-500 text-slate-400 uppercase tracking-widest mb-5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Currently Prioritized Traffic</h2>
        <div className="divide-y divide-slate-100">
          {trafficItems.filter(t => t.priority === "High").map(t => (
            <div key={t.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{t.icon}</span>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">{t.app}</p>
                  <p className="text-xs text-slate-400 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <ScoreBar score={t.score} />
                <span className="text-xs font-mono px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Priority View ──────────────────────────────────────────────────────────

function PriorityView() {
  const [filter, setFilter] = useState<Priority | "All">("All");

  const filtered = useMemo(
    () => filter === "All" ? trafficItems : trafficItems.filter(t => t.priority === filter),
    [filter]
  );

  const counts = useMemo(() => ({
    All: trafficItems.length,
    High: trafficItems.filter(t => t.priority === "High").length,
    Medium: trafficItems.filter(t => t.priority === "Medium").length,
    Low: trafficItems.filter(t => t.priority === "Low").length,
  }), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-700 text-[#0F172A] mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Traffic Priority Matrix</h1>
        <p className="text-sm text-slate-500">AI-scored network activities. Scores 80–100 = High · 50–79 = Medium · 0–49 = Low.</p>
      </div>

      {/* Status matrix summary */}
      <div className="grid grid-cols-3 gap-4">
        {(["High", "Medium", "Low"] as Priority[]).map(p => {
          const cfg: Record<Priority, { bg: string; border: string; text: string; dot: string }> = {
            High: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", dot: "bg-blue-500" },
            Medium: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", dot: "bg-amber-400" },
            Low: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-500", dot: "bg-slate-400" },
          };
          const c = cfg[p];
          return (
            <div key={p} className={`rounded-lg border p-4 ${c.bg} ${c.border}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className={`text-xs font-mono font-500 uppercase tracking-wider ${c.text}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{p} Priority</span>
              </div>
              <p className={`text-2xl font-display font-700 ${c.text}`} style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{counts[p]}</p>
              <p className={`text-xs font-mono mt-1 ${c.text} opacity-70`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>active streams</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(["All", "High", "Medium", "Low"] as (Priority | "All")[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-mono border transition-all ${
              filter === f
                ? "bg-[#2563EB] text-white border-[#2563EB]"
                : "bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600"
            }`}
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {f} {f !== "All" && `(${counts[f]})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {["App / Service", "Category", "AI Score", "Priority", "Action", "Target Release"].map(h => (
                <th key={h} className="text-left px-5 py-3 text-xs font-mono text-slate-400 uppercase tracking-wider font-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(t => (
              <tr key={t.id} className="hover:bg-[#EFF6FF] transition-colors group">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span>{t.icon}</span>
                    <span className="font-medium text-[#0F172A]">{t.app}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-slate-500 font-mono text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.category}</td>
                <td className="px-5 py-3.5"><ScoreBar score={t.score} /></td>
                <td className="px-5 py-3.5"><PriorityBadge p={t.priority} /></td>
                <td className="px-5 py-3.5">
                  <span className={`text-xs font-mono px-2 py-1 rounded border ${
                    t.action === "PRIORITIZE" ? "bg-blue-50 text-blue-700 border-blue-200"
                    : t.action === "NORMAL" ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-slate-100 text-slate-500 border-slate-200"
                  }`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.action}</span>
                </td>
                <td className="px-5 py-3.5 text-xs font-mono text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{t.release}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Activity View ──────────────────────────────────────────────────────────

function ActivityView() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-display font-700 text-[#0F172A] mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Activity Feed</h1>
          <p className="text-sm text-slate-500">Real-time log of NetGatta system events and team actions.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#EFF6FF] border border-blue-200 rounded-lg">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-blue-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>LIVE</span>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {activityItems.map(item => (
          <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
            {/* Avatar */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-display font-600 shrink-0 mt-0.5"
              style={{ backgroundColor: item.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}
            >
              {item.initials}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-sm font-medium text-[#0F172A]">{item.user}</span>
                <span className="text-sm text-slate-500">{item.action}</span>
                <span className="text-sm font-medium text-[#0F172A] truncate">{item.target}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${item.tagColor}`} style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.tag}</span>
                <span className="text-xs text-slate-400 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feedback View ──────────────────────────────────────────────────────────

function FeedbackView() {
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [tag, setTag] = useState("UX");
  const [submitted, setSubmitted] = useState(false);

  const handleVote = (id: number) => {
    setIdeas(prev =>
      prev.map(i =>
        i.id === id ? { ...i, votes: i.voted ? i.votes - 1 : i.votes + 1, voted: !i.voted } : i
      ).sort((a, b) => b.votes - a.votes)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setIdeas(prev => [
      { id: Date.now(), title, description: desc, votes: 0, voted: false, tag, author: "Sarah K.", date: "Today" },
      ...prev,
    ]);
    setTitle("");
    setDesc("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-700 text-[#0F172A] mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>Feedback & Ideas</h1>
        <p className="text-sm text-slate-500">Submit feature requests and upvote ideas from the NetGatta community.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Submission form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-lg p-6 sticky top-6">
            <h2 className="text-sm font-mono font-500 text-slate-400 uppercase tracking-widest mb-5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Submit Feature Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Title</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="E.g. Per-app priority override"
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 text-[#0F172A] placeholder:text-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Description</label>
                <textarea
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  rows={4}
                  placeholder="Describe the feature and why it would be useful..."
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 text-[#0F172A] placeholder:text-slate-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-slate-500 mb-1.5" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Category</label>
                <select
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 text-[#0F172A]"
                >
                  {["UX", "Control", "Scheduling", "Data", "Integrations", "AI/ML", "Performance"].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#2563EB] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {submitted ? "✓ Submitted!" : "Submit Idea"}
              </button>
            </form>
          </div>
        </div>

        {/* Idea board */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-500 text-slate-400 uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Community Ideas</h2>
            <span className="text-xs font-mono text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{ideas.length} ideas · sorted by votes</span>
          </div>
          <div className="space-y-3">
            {ideas.map((idea, i) => (
              <div key={idea.id} className="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-200 transition-colors">
                <div className="flex items-start gap-4">
                  {/* Vote button */}
                  <button
                    onClick={() => handleVote(idea.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all shrink-0 ${
                      idea.voted
                        ? "bg-[#2563EB] border-[#2563EB] text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                      <path d="M6 0L12 8H0L6 0Z" fill="currentColor" />
                    </svg>
                    <span className="text-xs font-mono font-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{idea.votes}</span>
                  </button>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium text-[#0F172A] leading-snug">{idea.title}</h3>
                      {i === 0 && (
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace" }}>TOP</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{idea.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 text-slate-500 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{idea.tag}</span>
                      <span className="text-xs text-slate-400 font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{idea.author} · {idea.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar Nav ────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode; badge?: number }[] = [
  {
    id: "home",
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 6L8 1L15 6V15H10V10H6V15H1V6Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "priority",
    label: "Priority",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="10" width="4" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="6" y="6" width="4" height="9" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="1" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "activity",
    label: "Activity",
    badge: 3,
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 8H4L6 3L9 13L11 8H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: "feedback",
    label: "Feedback",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M14 10C14 10.5523 13.5523 11 13 11H4L1 14V3C1 2.44772 1.44772 2 2 2H13C13.5523 2 14 2.44772 14 3V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
];

// ── App ────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("home");
  const [search, setSearch] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <div className="flex h-full bg-slate-50 text-[#0F172A]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#2563EB] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7C2 4.23858 4.23858 2 7 2C9.76142 2 12 4.23858 12 7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M4 9L7 6L10 9" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-display font-700 text-[#0F172A] text-base tracking-tight" style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>NetGatta</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-1 pl-[36px]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>v2.4.1 · Dashboard</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative ${
                view === item.id
                  ? "bg-[#EFF6FF] text-[#2563EB] font-medium"
                  : "text-slate-500 hover:bg-slate-50 hover:text-[#0F172A]"
              }`}
            >
              {item.icon}
              {item.label}
              {item.badge && (
                <span className="ml-auto text-[10px] font-mono bg-[#2563EB] text-white rounded-full w-4 h-4 flex items-center justify-center" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Profile footer */}
        <div className="px-3 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-700 flex items-center justify-center text-white text-xs font-display font-600 shrink-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              SK
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#0F172A] truncate">Sarah Kim</p>
              <p className="text-[10px] text-slate-400 font-mono truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Admin · Team Lead</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center gap-4 px-6 shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search traffic, events, or ideas…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-300"
            />
          </div>

          <div className="ml-auto flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#0F172A] transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1C5.23858 1 3 3.23858 3 6V10L1 12H15L13 10V6C13 3.23858 10.7614 1 8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M6 12C6 13.1046 6.89543 14 8 14C9.10457 14 10 13.1046 10 12" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-white" />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-72 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 uppercase tracking-wider" style={{ fontFamily: "'JetBrains Mono', monospace" }}>Notifications</span>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded" style={{ fontFamily: "'JetBrains Mono', monospace" }}>3 new</span>
                  </div>
                  {[
                    { icon: "🔴", text: "Network congestion detected on LTE", time: "2m ago" },
                    { icon: "🎥", text: "Video Call prioritized automatically", time: "3m ago" },
                    { icon: "☁️", text: "Cloud Backup deprioritized", time: "3m ago" },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      <span className="text-sm mt-0.5">{n.icon}</span>
                      <div>
                        <p className="text-xs text-[#0F172A] leading-snug">{n.text}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Network status pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-[11px] font-mono text-green-700" style={{ fontFamily: "'JetBrains Mono', monospace" }}>EXCELLENT · 48ms</span>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {view === "home" && <HomeView />}
          {view === "priority" && <PriorityView />}
          {view === "activity" && <ActivityView />}
          {view === "feedback" && <FeedbackView />}
        </main>
      </div>
    </div>
  );
}
