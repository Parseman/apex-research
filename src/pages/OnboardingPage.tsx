import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.tsx';
import type { ProfileData } from '../types/auth.ts';

const STEPS = ['Identité', 'Finances', 'Stratégie'];

const STATUTS = [
  { value: 'etudiant',       label: 'Étudiant',               icon: '🎓' },
  { value: 'salarie',        label: 'Salarié',                 icon: '💼' },
  { value: 'entrepreneur',   label: 'Entrepreneur',            icon: '🚀' },
  { value: 'retraite',       label: 'Retraité',                icon: '🏖️' },
  { value: 'reconversion',   label: 'En reconversion',         icon: '🔄' },
  { value: 'sans_emploi',    label: 'Sans emploi',             icon: '🔍' },
  { value: 'autre',          label: 'Autre',                   icon: '✦'  },
];

const CAPITAUX = [
  { value: 'moins_1k',     label: '< 1 000 €'           },
  { value: '1k_5k',        label: '1 000 – 5 000 €'     },
  { value: '5k_20k',       label: '5 000 – 20 000 €'    },
  { value: '20k_100k',     label: '20 000 – 100 000 €'  },
  { value: 'plus_100k',    label: '+ 100 000 €'          },
];

const RISQUES = [
  { value: 1, label: 'Très prudent',  desc: 'Capital avant tout',          color: '#4ECB71' },
  { value: 2, label: 'Prudent',       desc: 'Légère prise de risque',      color: '#A3E635' },
  { value: 3, label: 'Modéré',        desc: 'Équilibre risque / rendement', color: '#FBBF24' },
  { value: 4, label: 'Dynamique',     desc: 'Accepte la volatilité',       color: '#F97316' },
  { value: 5, label: 'Agressif',      desc: 'Maximise le potentiel',       color: '#E05C5C' },
];

const HORIZONS = [
  { value: 'court',      label: 'Court terme',      desc: '< 1 an',     icon: '⚡' },
  { value: 'moyen',      label: 'Moyen terme',      desc: '1 – 5 ans',  icon: '📈' },
  { value: 'long',       label: 'Long terme',       desc: '5 – 15 ans', icon: '🌱' },
  { value: 'tres_long',  label: 'Très long terme',  desc: '15+ ans',    icon: '🏔️' },
];

export default function OnboardingPage() {
  const { completeOnboarding, session } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<ProfileData>({
    displayName: '',
    status: '',
    capital: '',
    riskLevel: 0,
    horizon: '',
  });

  const set = <K extends keyof ProfileData>(key: K, val: ProfileData[K]) =>
    setForm(f => ({ ...f, [key]: val }));

  const canNext = () => {
    if (step === 0) return form.displayName.trim().length >= 2 && form.status !== '';
    if (step === 1) return form.capital !== '' && form.riskLevel > 0;
    if (step === 2) return form.horizon !== '';
    return false;
  };

  const handleNext = () => {
    if (step < 2) { setStep(s => s + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      await completeOnboarding(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue.');
      setLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(13,17,23,0.8)',
    borderColor: 'rgba(200,169,110,0.2)',
    color: '#F0EBE0',
  };

  const chipActive = { background: 'rgba(200,169,110,0.15)', borderColor: '#C8A96E', color: '#C8A96E' };
  const chipIdle  = { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(200,169,110,0.15)', color: '#6B7B8D' };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: '#080C10' }}
    >
      {/* Orbs */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #C8A96E, transparent)' }} />
      <div className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full opacity-5 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #4ECDC4, transparent)' }} />

      <div className="w-full max-w-lg relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl border flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(200,169,110,0.1)', borderColor: 'rgba(200,169,110,0.3)' }}>
            <span className="font-cormorant text-gold text-2xl font-bold">A</span>
          </div>
          <h1 className="font-cormorant text-2xl font-bold text-cream">Apex Research</h1>
          <p className="font-sans-dm text-xs text-muted mt-1 tracking-widest uppercase">
            Personnalisez votre profil
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1 flex flex-col items-center gap-1.5">
              <div className="w-full h-0.5 rounded-full transition-all duration-300"
                style={{ background: i <= step ? '#C8A96E' : 'rgba(200,169,110,0.15)' }} />
              <span className="font-mono-dm text-[9px] tracking-widest uppercase transition-colors"
                style={{ color: i === step ? '#C8A96E' : i < step ? 'rgba(200,169,110,0.5)' : '#2D3748' }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-8" style={{ background: '#0D1117', borderColor: 'rgba(200,169,110,0.15)' }}>
          <div style={{ height: '2px', background: 'linear-gradient(90deg,transparent,#C8A96E,transparent)', marginBottom: 28, borderRadius: 2 }} />

          {/* ── ÉTAPE 1 : Identité ── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <p className="font-mono-dm text-[10px] tracking-widest uppercase mb-1" style={{ color: '#C8A96E' }}>Étape 1 / 3</p>
                <h2 className="font-cormorant text-2xl font-bold text-cream">Votre identité</h2>
                <p className="font-sans-dm text-sm text-muted mt-1">Comment souhaitez-vous être appelé ?</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-sans-dm text-xs text-muted">Nom ou pseudo</label>
                <input
                  type="text"
                  value={form.displayName}
                  onChange={e => set('displayName', e.target.value)}
                  className="px-4 py-2.5 rounded-lg border text-sm font-sans-dm outline-none transition-colors"
                  style={inputStyle}
                  placeholder={`ex. ${session?.email?.split('@')[0] ?? 'Alexandre'}`}
                  autoFocus
                  maxLength={40}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans-dm text-xs text-muted">Votre situation</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUTS.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => set('status', s.value)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all"
                      style={form.status === s.value ? chipActive : chipIdle}
                    >
                      <span className="text-base">{s.icon}</span>
                      <span className="font-sans-dm text-xs font-medium">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 : Finances ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <p className="font-mono-dm text-[10px] tracking-widest uppercase mb-1" style={{ color: '#C8A96E' }}>Étape 2 / 3</p>
                <h2 className="font-cormorant text-2xl font-bold text-cream">Votre profil financier</h2>
                <p className="font-sans-dm text-sm text-muted mt-1">Ces informations restent strictement privées.</p>
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-sans-dm text-xs text-muted">Capital disponible à investir</label>
                <div className="flex flex-col gap-1.5">
                  {CAPITAUX.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => set('capital', c.value)}
                      className="px-4 py-2.5 rounded-lg border text-left transition-all font-sans-dm text-sm"
                      style={form.capital === c.value ? chipActive : chipIdle}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="font-sans-dm text-xs text-muted">Appétit au risque</label>
                <div className="flex gap-2">
                  {RISQUES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set('riskLevel', r.value)}
                      className="flex-1 py-3 rounded-lg border flex flex-col items-center gap-1 transition-all"
                      style={form.riskLevel === r.value
                        ? { background: `${r.color}18`, borderColor: r.color, color: r.color }
                        : chipIdle}
                    >
                      <span className="font-cormorant text-2xl font-bold">{r.value}</span>
                    </button>
                  ))}
                </div>
                {form.riskLevel > 0 && (
                  <div className="rounded-lg px-4 py-2.5 text-center transition-all"
                    style={{ background: `${RISQUES[form.riskLevel - 1].color}12`, border: `1px solid ${RISQUES[form.riskLevel - 1].color}30` }}>
                    <span className="font-sans-dm text-sm font-medium" style={{ color: RISQUES[form.riskLevel - 1].color }}>
                      {RISQUES[form.riskLevel - 1].label}
                    </span>
                    <span className="font-sans-dm text-xs text-muted ml-2">
                      — {RISQUES[form.riskLevel - 1].desc}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 : Stratégie ── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="font-mono-dm text-[10px] tracking-widest uppercase mb-1" style={{ color: '#C8A96E' }}>Étape 3 / 3</p>
                <h2 className="font-cormorant text-2xl font-bold text-cream">Votre stratégie</h2>
                <p className="font-sans-dm text-sm text-muted mt-1">Sur quel horizon investissez-vous ?</p>
              </div>

              <div className="flex flex-col gap-2">
                {HORIZONS.map(h => (
                  <button
                    key={h.value}
                    type="button"
                    onClick={() => set('horizon', h.value)}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-lg border text-left transition-all"
                    style={form.horizon === h.value ? chipActive : chipIdle}
                  >
                    <span className="text-xl w-7 text-center">{h.icon}</span>
                    <div>
                      <p className="font-sans-dm text-sm font-medium" style={{ color: form.horizon === h.value ? '#C8A96E' : '#F0EBE0' }}>
                        {h.label}
                      </p>
                      <p className="font-mono-dm text-xs" style={{ color: '#4A5568' }}>{h.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Récap */}
              <div className="rounded-lg p-4 space-y-2" style={{ background: 'rgba(200,169,110,0.05)', border: '1px solid rgba(200,169,110,0.1)' }}>
                <p className="font-mono-dm text-[9px] tracking-widest uppercase mb-2" style={{ color: '#C8A96E' }}>Récapitulatif</p>
                {[
                  { label: 'Pseudo', value: form.displayName },
                  { label: 'Statut', value: STATUTS.find(s => s.value === form.status)?.label ?? '—' },
                  { label: 'Capital', value: CAPITAUX.find(c => c.value === form.capital)?.label ?? '—' },
                  { label: 'Risque', value: form.riskLevel > 0 ? `${form.riskLevel}/5 — ${RISQUES[form.riskLevel - 1].label}` : '—' },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center">
                    <span className="font-sans-dm text-xs text-muted">{row.label}</span>
                    <span className="font-sans-dm text-xs text-cream">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-xs font-sans-dm px-3 py-2 rounded"
              style={{ color: '#E05C5C', background: 'rgba(224,92,92,0.1)' }}>
              {error}
            </p>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-2.5 rounded-lg border font-sans-dm text-sm text-muted transition-colors hover:text-cream"
                style={{ borderColor: 'rgba(200,169,110,0.2)' }}
              >
                ← Retour
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNext() || loading}
              className="flex-1 py-2.5 rounded-lg font-sans-dm text-sm font-medium transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #C8A96E, #E8CC90)', color: '#080C10' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg/40 border-t-bg rounded-full animate-spin" />
                  Enregistrement...
                </span>
              ) : step < 2 ? 'Continuer →' : 'Accéder au portail'}
            </button>
          </div>
        </div>

        <p className="text-center font-mono-dm text-[10px] text-muted mt-6 tracking-widest uppercase">
          Ces données ne sont jamais partagées
        </p>
      </div>
    </div>
  );
}
