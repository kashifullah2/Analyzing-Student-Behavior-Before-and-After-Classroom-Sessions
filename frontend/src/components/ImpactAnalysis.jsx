import React, { useState, useEffect } from 'react';
import api from '../api';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Target, TrendingUp, TrendingDown, Lightbulb, Award, ArrowRight } from 'lucide-react';

const EMOTION_COLORS = {
  Happiness: { color: '#22c55e', border: 'border-green-200', text: 'text-green-700' },
  Sadness:   { color: '#3b82f6', border: 'border-blue-200',  text: 'text-blue-700' },
  Anger:     { color: '#ef4444', border: 'border-red-200',   text: 'text-red-700' },
  Fear:      { color: '#a855f7', border: 'border-purple-200',text: 'text-purple-700' },
  Surprise:  { color: '#f59e0b', border: 'border-amber-200', text: 'text-amber-700' },
  Neutral:   { color: '#64748b', border: 'border-slate-200', text: 'text-slate-700' },
  Disgust:   { color: '#14b8a6', border: 'border-teal-200',  text: 'text-teal-700' },
  Contempt:  { color: '#f97316', border: 'border-orange-200',text: 'text-orange-700' },
};

/* ── SVG Gauge ──────────────────────────────────────────────────────────────── */
const ImpactGauge = ({ score, size = 240 }) => {
  const r = (size - 30) / 2;
  const circ = Math.PI * r;
  const progress = (score / 100) * circ;
  const cx = size / 2;

  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 80 ? 'Excellent' : score >= 70 ? 'Very Good'
    : score >= 60 ? 'Good' : score >= 50 ? 'Average'
    : score >= 40 ? 'Below Avg' : 'Needs Work';

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size / 2 + 35} viewBox={`0 0 ${size} ${size / 2 + 35}`}>
        <path d={`M 15 ${cx} A ${r} ${r} 0 0 1 ${size - 15} ${cx}`}
          fill="none" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" />
        <path d={`M 15 ${cx} A ${r} ${r} 0 0 1 ${size - 15} ${cx}`}
          fill="none" stroke={color} strokeWidth="16" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - progress}
          style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: `drop-shadow(0 0 10px ${color}50)` }} />
        <text x={cx} y={cx - 8} textAnchor="middle" fill="#0f172a"
          style={{ fontSize: '42px', fontWeight: 900 }}>{score}</text>
        <text x={cx} y={cx + 18} textAnchor="middle" fill="#64748b"
          style={{ fontSize: '14px', fontWeight: 600 }}>{label}</text>
      </svg>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────────────────── */
const ImpactAnalysis = ({ sessionId }) => {
  const [impact, setImpact] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, b] = await Promise.all([
          api.get(`/sessions/${sessionId}/impact`),
          api.get('/sessions/impact_trends')
        ]);
        setImpact(a.data);
        setTrends(b.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [sessionId]);

  if (loading) return <div className="p-10 text-center text-slate-500 animate-pulse">Analyzing Teaching Impact…</div>;

  if (!impact || !impact.has_data) return (
    <div className="p-16 text-center text-slate-500">
      <Award size={52} className="mx-auto mb-4 text-slate-300" />
      <p className="font-bold text-lg mb-2">No Impact Data Yet</p>
      <p className="text-sm">Capture both entry <strong>and</strong> exit data to unlock Teaching Impact Analysis.</p>
    </div>
  );

  const emotions = Object.keys(impact.entry_percentages).filter(e =>
    impact.entry_percentages[e] > 0 || impact.exit_percentages[e] > 0
  );

  const radarData = emotions.map(e => ({
    subject: e, Entry: impact.entry_percentages[e], Exit: impact.exit_percentages[e],
  }));

  const POSITIVE_EMOTIONS = ['Happiness', 'Surprise'];

  return (
    <div className="space-y-6 pb-12 animate-fade-in-up">

      {/* ── Row 1: Score Gauge + Radar ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Gauge */}
        <div className="dashboard-card p-8 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg"><Award className="text-indigo-500" size={20} /></div>
            <h3 className="font-bold text-slate-900 text-lg">Teaching Impact Score</h3>
          </div>
          <ImpactGauge score={impact.impact_score} />
          <div className="flex gap-6 mt-6 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <TrendingUp size={14} className="text-green-500" />
              Positive Shift: <strong className="text-green-600">{impact.positive_shift > 0 ? '+' : ''}{impact.positive_shift}%</strong>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <TrendingDown size={14} className="text-blue-500" />
              Neg. Reduction: <strong className="text-blue-600">{impact.negative_shift > 0 ? '+' : ''}{impact.negative_shift}%</strong>
            </span>
          </div>
        </div>

        {/* Radar */}
        <div className="dashboard-card p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-violet-50 rounded-lg"><Target className="text-violet-500" size={20} /></div>
            <h3 className="font-bold text-slate-900 text-lg">Emotion Profile Shift</h3>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                <Radar name="Entry" dataKey="Entry" stroke="#3B82F6" strokeWidth={2} fill="#3B82F6" fillOpacity={0.15} />
                <Radar name="Exit"  dataKey="Exit"  stroke="#10B981" strokeWidth={2} fill="#10B981" fillOpacity={0.15} />
                <Legend iconType="circle" />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Row 2: Emotion Shift Cards ────────────────────────────────────── */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2">
          <ArrowRight className="text-indigo-500" size={20} /> Emotion Shift Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emotions.map(emo => {
            const entry = impact.entry_percentages[emo];
            const exit  = impact.exit_percentages[emo];
            const delta = impact.deltas[emo];
            const c = EMOTION_COLORS[emo] || EMOTION_COLORS.Neutral;
            const flat = Math.abs(delta) < 1;
            const up = delta > 0;
            // For positive emotions, an increase is good; for negative, a decrease is good
            const isGood = POSITIVE_EMOTIONS.includes(emo) ? up : !up;

            return (
              <div key={emo} className={`dashboard-card p-5 border-l-4 ${c.border}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-bold text-sm ${c.text}`}>{emo}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    flat ? 'bg-slate-100 text-slate-500'
                    : isGood ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                    {flat ? '—' : `${up ? '↑' : '↓'} ${Math.abs(delta)}%`}
                  </span>
                </div>
                {/* Entry bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Entry</span><span>{entry}%</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(entry, 100)}%`, backgroundColor: c.color, opacity: 0.45 }} />
                  </div>
                </div>
                {/* Exit bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Exit</span><span>{exit}%</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(exit, 100)}%`, backgroundColor: c.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Row 3: Trend + Insights ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Trend Chart */}
        {trends.length > 1 && (
          <div className="dashboard-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="text-emerald-500" size={20} /></div>
              <h3 className="font-bold text-slate-900 text-lg">Impact Score Trend</h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorImpact" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="class_name" stroke="#94a3b8" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(v) => [`${v}`, 'Impact Score']} />
                  <Area type="monotone" dataKey="impact_score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorImpact)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Smart Insights */}
        <div className={`dashboard-card p-6 ${trends.length <= 1 ? 'lg:col-span-2' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-50 rounded-lg"><Lightbulb className="text-amber-500" size={20} /></div>
            <h3 className="font-bold text-slate-900 text-lg">Smart Insights</h3>
          </div>
          <div className="space-y-3">
            {impact.insights.map((ins, i) => (
              <div key={i} className="flex gap-3 items-start p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                <p className="text-sm text-slate-700 leading-relaxed">{ins}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactAnalysis;
