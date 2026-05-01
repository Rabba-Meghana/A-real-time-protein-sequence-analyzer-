import { useState, useCallback, useRef } from 'react';
import { analyzeSequence, cleanSequence } from './utils/bioalgorithms';
import { useGroqAnalysis } from './hooks/useGroqAnalysis';
import HydrophobicityChart from './components/HydrophobicityChart';
import SecondaryStructureView from './components/SecondaryStructureView';
import CompositionChart from './components/CompositionChart';
import MotifMap from './components/MotifMap';

const EXAMPLES = [
  { label: 'GLP-1R (diabetes)', seq: 'MAGAPGPLRLALLLLGMVGRAGPRPQGATVSLWETVQKWLSAGQREGERISYREMLRQQSSERASPDNFQPPDTIPPPVTAEEPVFFTPEEVTRSQQHAAAQKGSEVPVMHVVRPSTKASDVRTGTDSRSSSPPTEGQKPMRLLVAINSRSSVLMTSSSTSEGDLTTAEAAAKLIKELEEELK' },
  { label: 'Spike RBD', seq: 'RVQPTESIVRFPNITNLCPFGEVFNATRFASVYAWNRKRISNCVADYSVLYNSASFSTFKCYGVSPTKLNDLCFTNVYADSFVIRGDEVRQIAPGQTGKIADYNYKLPDDFTGCVIAWNSNNLDSKVGGNYNYLYRLFRKSNLKPFERDISTEIYQAGSTPCNGVEGFNCYFPLQSYGFQPTNGVGYQPYRVVVLSFELLHAPATVCGPKKSTNLVKNKCVNFNFNGLTGTGVLTESNKKFLPFQQFGRDIADTTDAVRDPQTLEILDITPCSFGGVSVITPGTNTSNQVAVLYQDVNCTEVPVAIHADQLTPTWRVYSTGSNVFQTRAGCLIGAEHVNNSYECDIPIGAGICASYQTQTNSPRRARSVASQSIIAYTMSLGAENSVAYSNNSIAIPTNFTISVTTEILPVSMTKTSVDCTMYICGDSTECSNLLLQYGSFCTQLNRALTGIAVEQDKNTQEVFAQVKQIYKTPPIKDFGGFNFSQILPDPSKPSKRSFIEDLLFNKVTLADAGFIKQYGDCLGDIAARDLICAQKFNGLTVLPPLLTDEMIAQYTSALLAGTITSGWTFGAGAALQIPFAMQMAYRFNGIGVTQNVLYENQKLIANQFNSAIGKIQDSLSSTASALGKLQDVVNQNAQALNTLVKQLSSNFGAISSVLNDILSRLDKVEAEVQIDRLITGRLQSLQTYVTQQLIRAAEIRASANLAATKMSECVLGQSKRVDFCGKGYHLMSFPQSAPHGVVFLHVTYVPAQEKNFTTAPAICHDGKAHFPREGVFVSNGTHWFVTQRNFYEPQIITTDNTFVSGNCDVVIGIVNNTVYDPLQPELDSFKEELDKYFKNHTSPDVDLGDISGINASVVNIQKEIDRLNEVAKNLNESLIDLQELGKYEQYIKWPWYIWLGFIAGLIAIVMVTIMLCCMTSCCSCLKGCCSCGSCCKFDEDDSEPVLKGVKLHYT' },
  { label: 'Ubiquitin', seq: 'MQIFVKTLTGKTITLEVEPSDTIENVKAKIQDKEGIPPDQQRLIFAGKQLEDGRTLSDYNIQKESTLHLVLRLRGG' },
  { label: 'p53 DBD', seq: 'SVVVPYEPPEVGSDCTTIHYNYMCNSSCMGQMNRRPILTIITLEDSSGKLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPVHGQWLDSPRTFMYVTCEGRAEGFHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGQMNRRPILTIITLEDSSGKLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPVHGQWLDSPRTFMYVTCEGRAEGFHSVVVPYEP' },
];

const TABS = ['hydrophobicity', 'secondary structure', 'composition', 'motifs'];

const glass = {
  panel: {
    background: 'rgba(17,31,26,0.6)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(52,211,153,0.12)',
    borderRadius: 16,
  }
};

export default function App() {
  const [rawSeq, setRawSeq] = useState('');
  const [result, setResult] = useState(null);
  const [tab, setTab] = useState('hydrophobicity');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { insight, loading: aiLoading, analyze: aiAnalyze } = useGroqAnalysis();
  const textareaRef = useRef(null);

  const handleAnalyze = useCallback((seqOverride) => {
    const input = seqOverride ?? rawSeq;
    const cleaned = cleanSequence(input);
    if (!cleaned) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      const res = analyzeSequence(cleaned);
      if (!res.error) {
        setResult(res);
        aiAnalyze(res);
      }
      setIsAnalyzing(false);
    }, 60);
  }, [rawSeq, aiAnalyze]);

  const loadExample = (ex) => {
    setRawSeq(ex.seq);
    setResult(null);
    setTimeout(() => handleAnalyze(ex.seq), 10);
  };

  const cleaned = cleanSequence(rawSeq);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #050d14 0%, #071a2e 40%, #050f18 70%, #040d12 100%)',
      fontFamily: "'DM Sans', sans-serif",
      color: '#e0f2fe',
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'fixed', top: '-10%', left: '10%',
        width: 600, height: 600,
        background: 'radial-gradient(ellipse, rgba(56,189,248,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '5%', right: '5%',
        width: 500, height: 500,
        background: 'radial-gradient(ellipse, rgba(14,165,233,0.04) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1280, margin: '0 auto', padding: '0 20px 40px' }}>

        {/* ── HEADER ── */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 0 24px',
          borderBottom: '1px solid rgba(56,189,248,0.1)',
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Logo mark */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="10" fill="rgba(14,165,233,0.12)" stroke="rgba(56,189,248,0.3)" strokeWidth="1"/>
              <path d="M10 26 C10 26 14 14 18 18 C22 22 26 10 26 10" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <circle cx="18" cy="18" r="2" fill="#0ea5e9"/>
            </svg>
            <div>
              <div style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 18,
                color: '#e0f2fe', letterSpacing: '-0.5px',
              }}>
                ProteinLens
              </div>
              <div style={{ fontSize: 10, color: '#38bdf8', fontFamily: 'IBM Plex Mono', letterSpacing: '0.06em' }}>
                REAL-TIME SEQUENCE INTELLIGENCE
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 8px #34d399',
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 10, color: '#4b7a63', fontFamily: 'IBM Plex Mono' }}>
              ALL ALGORITHMS CLIENT-SIDE
            </span>
          </div>
        </header>

        {/* ── MAIN GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 16 }}>

          {/* ── LEFT: INPUT + METRICS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Input card */}
            <div style={{ ...glass.panel, padding: 20 }}>
              <div style={{
                fontSize: 9, fontFamily: 'IBM Plex Mono', color: '#38bdf8',
                letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span>Sequence Input</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,0.12)' }} />
              </div>

              <textarea
                ref={textareaRef}
                value={rawSeq}
                onChange={e => setRawSeq(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleAnalyze(); }}
                placeholder="Paste any protein sequence in single-letter FASTA format...&#10;&#10;MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
                style={{
                  width: '100%', height: 140,
                  background: 'rgba(5,13,20,0.7)',
                  border: '1px solid rgba(56,189,248,0.2)',
                  borderRadius: 10,
                  color: '#7dd3fc',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 10.5, lineHeight: 1.7,
                  padding: '12px 14px',
                  resize: 'none', outline: 'none',
                  letterSpacing: '0.06em',
                  wordBreak: 'break-all',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(56,189,248,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(56,189,248,0.06)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(56,189,248,0.2)'; e.target.style.boxShadow = 'none'; }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 9, color: '#4b7a63', fontFamily: 'IBM Plex Mono' }}>
                  {cleaned.length > 0 ? `${cleaned.length} valid AA` : 'awaiting input'}
                </span>
                <span style={{ fontSize: 9, color: '#4b7a63', fontFamily: 'IBM Plex Mono' }}>⌘ + Enter to run</span>
              </div>

              <button
                onClick={() => handleAnalyze()}
                disabled={!cleaned.length || isAnalyzing}
                style={{
                  width: '100%',
                  background: cleaned.length > 0 && !isAnalyzing
                    ? 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)'
                    : 'rgba(14,165,233,0.15)',
                  color: cleaned.length > 0 && !isAnalyzing ? '#fff' : '#4b7a63',
                  border: 'none',
                  borderRadius: 9,
                  padding: '11px',
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                  fontSize: 13,
                  cursor: cleaned.length > 0 && !isAnalyzing ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  letterSpacing: '-0.1px',
                  boxShadow: cleaned.length > 0 && !isAnalyzing ? '0 4px 20px rgba(14,165,233,0.25)' : 'none',
                }}
              >
                {isAnalyzing ? '⚡ Analyzing…' : '⚡ Analyze Sequence'}
              </button>

              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 9, color: '#4b7a63', fontFamily: 'IBM Plex Mono', marginBottom: 7, letterSpacing: '0.06em' }}>
                  EXAMPLE PROTEINS
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex.label}
                      onClick={() => loadExample(ex)}
                      style={{
                        background: 'rgba(14,165,233,0.08)',
                        border: '1px solid rgba(56,189,248,0.15)',
                        borderRadius: 5,
                        padding: '4px 9px',
                        fontSize: 9.5,
                        fontFamily: 'IBM Plex Mono',
                        color: '#7dd3fc',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.target.style.background = 'rgba(14,165,233,0.18)'; e.target.style.borderColor = 'rgba(56,189,248,0.35)'; }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(14,165,233,0.08)'; e.target.style.borderColor = 'rgba(56,189,248,0.15)'; }}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Physicochemical metrics */}
            {result && (
              <div style={{ ...glass.panel, padding: 20, animation: 'fadeIn 0.4s ease' }}>
                <div style={{
                  fontSize: 9, fontFamily: 'IBM Plex Mono', color: '#38bdf8',
                  letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>Physicochemical Properties</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,0.12)' }} />
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                  {result.tags.map((t, i) => (
                    <span key={i} style={{
                      fontSize: 9, fontFamily: 'IBM Plex Mono',
                      background: `${t.color}18`,
                      border: `1px solid ${t.color}33`,
                      color: t.color,
                      borderRadius: 4, padding: '3px 8px',
                    }}>
                      {t.label}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Length', val: `${result.length} AA`, color: '#38bdf8' },
                    { label: 'Mol. Weight', val: `${(result.mw / 1000).toFixed(2)} kDa`, color: '#38bdf8' },
                    { label: 'pI', val: result.pi.toFixed(2), color: result.pi < 7 ? '#f87171' : '#34d399', sub: result.pi < 7 ? 'acidic' : 'basic' },
                    { label: 'Net charge pH7', val: result.charge7 > 0 ? `+${result.charge7}` : result.charge7, color: result.charge7 > 0 ? '#34d399' : '#f87171' },
                    { label: 'GRAVY', val: result.gravy, color: result.gravy > 0 ? '#f59e0b' : '#60a5fa', sub: result.gravy > 0 ? 'hydrophobic' : 'hydrophilic' },
                    { label: 'Aliphatic idx', val: result.aliphatic.toFixed(1), color: '#a78bfa' },
                    { label: 'Instability idx', val: result.instability, color: result.stable ? '#34d399' : '#f87171', sub: result.stable ? '✓ stable' : '✗ unstable' },
                    { label: 'ε₂₈₀ (M⁻¹cm⁻¹)', val: result.epsilon.toLocaleString(), color: '#38bdf8' },
                  ].map(({ label, val, color, sub }) => (
                    <div key={label} style={{
                      background: 'rgba(5,13,20,0.5)',
                      border: '1px solid rgba(56,189,248,0.08)',
                      borderRadius: 8, padding: '10px 12px',
                    }}>
                      <div style={{ fontSize: 8.5, fontFamily: 'IBM Plex Mono', color: '#4b7a63', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: 16, fontFamily: 'IBM Plex Mono', fontWeight: 500, color, lineHeight: 1 }}>
                        {val}
                      </div>
                      {sub && <div style={{ fontSize: 9, color: '#4b7a63', marginTop: 3 }}>{sub}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT: CHARTS ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!result ? (
              <div style={{
                ...glass.panel,
                flex: 1,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: 400, gap: 16, padding: 40,
              }}>
                {/* Decorative helix */}
                <svg width="120" height="80" viewBox="0 0 120 80" fill="none" style={{ opacity: 0.3 }}>
                  <path d="M10 40 C20 20, 30 60, 40 40 C50 20, 60 60, 70 40 C80 20, 90 60, 100 40 C110 20, 120 60, 130 40" stroke="#38bdf8" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M10 40 C20 60, 30 20, 40 40 C50 60, 60 20, 70 40 C80 60, 90 20, 100 40 C110 60, 120 20, 130 40" stroke="#0ea5e9" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
                </svg>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: '#e0f2fe', marginBottom: 8 }}>
                    Ready for Analysis
                  </div>
                  <div style={{ fontSize: 13, color: '#4b7a63', lineHeight: 1.7, maxWidth: 340, fontWeight: 300 }}>
                    Paste any protein sequence or load an example. All bioinformatics algorithms run instantly in your browser — no server, no wait.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 20, marginTop: 8 }}>
                  {['Kyte-Doolittle hydrophobicity', 'Chou-Fasman SS prediction', 'Motif scanning', 'pI / MW / charge'].map(f => (
                    <div key={f} style={{
                      fontSize: 9, fontFamily: 'IBM Plex Mono', color: '#38bdf8',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <span style={{ color: '#34d399' }}>✓</span> {f}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Tab bar */}
                <div style={{
                  ...glass.panel,
                  padding: '0',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    display: 'flex',
                    borderBottom: '1px solid rgba(56,189,248,0.1)',
                    padding: '0 4px',
                    background: 'rgba(5,13,20,0.3)',
                  }}>
                    {TABS.map(t => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        style={{
                          fontFamily: 'IBM Plex Mono',
                          fontSize: 9.5,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          padding: '13px 16px 11px',
                          background: 'none',
                          border: 'none',
                          borderBottom: `2px solid ${tab === t ? '#38bdf8' : 'transparent'}`,
                          color: tab === t ? '#38bdf8' : '#4b7a63',
                          cursor: 'pointer',
                          transition: 'all 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { if (tab !== t) e.target.style.color = '#7dd3fc'; }}
                        onMouseLeave={e => { if (tab !== t) e.target.style.color = '#4b7a63'; }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  <div style={{ padding: 20 }}>
                    {tab === 'hydrophobicity' && (
                      <div>
                        <div style={{ fontSize: 10, color: '#4b7a63', fontFamily: 'IBM Plex Mono', marginBottom: 12, lineHeight: 1.6 }}>
                          Kyte-Doolittle hydrophobicity · 9-residue sliding window · dashed line = transmembrane threshold (1.6)
                        </div>
                        <HydrophobicityChart data={result.hydrophobicity} />
                        <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
                          <div style={{
                            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.15)',
                            borderRadius: 8, padding: '8px 14px', flex: 1,
                          }}>
                            <div style={{ fontSize: 8, fontFamily: 'IBM Plex Mono', color: '#4b7a63', marginBottom: 3 }}>GRAVY SCORE</div>
                            <div style={{ fontSize: 20, fontFamily: 'IBM Plex Mono', color: result.gravy > 0 ? '#f59e0b' : '#60a5fa', fontWeight: 500 }}>
                              {result.gravy > 0 ? '+' : ''}{result.gravy}
                            </div>
                            <div style={{ fontSize: 9, color: '#4b7a63' }}>
                              {result.gravy > 0.5 ? 'Likely membrane protein' :
                               result.gravy > 0 ? 'Mildly hydrophobic' :
                               result.gravy > -0.5 ? 'Mildly hydrophilic' : 'Soluble / cytoplasmic'}
                            </div>
                          </div>
                          <div style={{
                            background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)',
                            borderRadius: 8, padding: '8px 14px', flex: 1,
                          }}>
                            <div style={{ fontSize: 8, fontFamily: 'IBM Plex Mono', color: '#4b7a63', marginBottom: 3 }}>PEAK HYDROPHOBIC REGION</div>
                            <div style={{ fontSize: 20, fontFamily: 'IBM Plex Mono', color: '#60a5fa', fontWeight: 500 }}>
                              {Math.max(...result.hydrophobicity.map(h => h.score)).toFixed(2)}
                            </div>
                            <div style={{ fontSize: 9, color: '#4b7a63' }}>
                              pos {result.hydrophobicity.reduce((best, h) => h.score > best.score ? h : best, result.hydrophobicity[0]).position}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {tab === 'secondary structure' && (
                      <div>
                        <div style={{ fontSize: 10, color: '#4b7a63', fontFamily: 'IBM Plex Mono', marginBottom: 12 }}>
                          Chou-Fasman propensity method · H = α-helix · E = β-sheet · T = turn · C = coil
                        </div>
                        <SecondaryStructureView data={result.secondaryStructure} />
                      </div>
                    )}

                    {tab === 'composition' && (
                      <div>
                        <div style={{ fontSize: 10, color: '#4b7a63', fontFamily: 'IBM Plex Mono', marginBottom: 12 }}>
                          Amino acid frequency (%) — colored by physicochemical group
                        </div>
                        <CompositionChart data={result.composition} />
                        {/* Top residues */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                          {result.composition.slice(0, 5).map(d => (
                            <div key={d.aa} style={{
                              background: 'rgba(56,189,248,0.06)',
                              border: '1px solid rgba(56,189,248,0.12)',
                              borderRadius: 7, padding: '8px 12px', minWidth: 60,
                            }}>
                              <div style={{ fontSize: 18, fontFamily: 'IBM Plex Mono', fontWeight: 500, color: '#7dd3fc' }}>{d.aa}</div>
                              <div style={{ fontSize: 9, color: '#4b7a63', fontFamily: 'IBM Plex Mono' }}>{d.percent.toFixed(1)}%</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {tab === 'motifs' && (
                      <div>
                        <div style={{ fontSize: 10, color: '#4b7a63', fontFamily: 'IBM Plex Mono', marginBottom: 12 }}>
                          Scanning for {10} known functional motifs · hover map for positions
                        </div>
                        <MotifMap motifs={result.motifs} seqLength={result.length} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Stability analysis card */}
                <div style={{ ...glass.panel, padding: 20 }}>
                  <div style={{
                    fontSize: 9, fontFamily: 'IBM Plex Mono', color: '#38bdf8',
                    letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>Stability & Expression Prediction</span>
                    <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,0.12)' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {[
                      {
                        label: 'In-vivo stability',
                        val: result.stable ? 'Stable' : 'Unstable',
                        sub: `II = ${result.instability}`,
                        color: result.stable ? '#34d399' : '#f87171',
                        bg: result.stable ? 'rgba(52,211,153,0.06)' : 'rgba(248,113,113,0.06)',
                      },
                      {
                        label: 'Solubility prediction',
                        val: result.gravy < -0.2 ? 'Likely soluble' : result.gravy < 0.2 ? 'Moderate' : 'Low',
                        sub: `GRAVY ${result.gravy}`,
                        color: result.gravy < -0.2 ? '#34d399' : result.gravy < 0.2 ? '#f59e0b' : '#f87171',
                        bg: result.gravy < -0.2 ? 'rgba(52,211,153,0.06)' : 'rgba(251,191,36,0.06)',
                      },
                      {
                        label: 'Thermostability',
                        val: result.aliphatic > 80 ? 'High' : result.aliphatic > 50 ? 'Moderate' : 'Low',
                        sub: `AI = ${result.aliphatic.toFixed(0)}`,
                        color: result.aliphatic > 80 ? '#34d399' : result.aliphatic > 50 ? '#f59e0b' : '#f87171',
                        bg: 'rgba(167,139,250,0.06)',
                      },
                    ].map(c => (
                      <div key={c.label} style={{
                        background: c.bg,
                        border: `1px solid ${c.color}22`,
                        borderRadius: 10, padding: '12px 14px',
                      }}>
                        <div style={{ fontSize: 8, fontFamily: 'IBM Plex Mono', color: '#4b7a63', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {c.label}
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: c.color, marginBottom: 3 }}>
                          {c.val}
                        </div>
                        <div style={{ fontSize: 9, color: '#4b7a63', fontFamily: 'IBM Plex Mono' }}>
                          {c.sub}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* AI Insight — right panel, below stability */}
                {(insight || aiLoading) && (
                  <div style={{
                    ...glass.panel,
                    padding: 20,
                    borderColor: 'rgba(56,189,248,0.25)',
                    animation: 'fadeIn 0.4s ease',
                  }}>
                    <div style={{
                      fontSize: 9, fontFamily: 'IBM Plex Mono', color: '#38bdf8',
                      letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: aiLoading ? '#f59e0b' : '#34d399',
                        boxShadow: `0 0 10px ${aiLoading ? '#f59e0b' : '#34d399'}`,
                        animation: aiLoading ? 'pulse 1s ease-in-out infinite' : 'none',
                        flexShrink: 0,
                      }} />
                      <span>AI Biological Interpretation</span>
                      <div style={{ flex: 1, height: 1, background: 'rgba(56,189,248,0.12)' }} />
                    </div>
                    <div style={{
                      fontSize: 12.5,
                      lineHeight: 1.85,
                      color: '#bae6fd',
                      fontWeight: 300,
                      whiteSpace: 'pre-wrap',
                    }}>
                      {insight}
                      {aiLoading && (
                        <span style={{
                          display: 'inline-block', width: 2, height: 14,
                          background: '#38bdf8', marginLeft: 2,
                          animation: 'blink 0.8s ease-in-out infinite',
                          verticalAlign: 'middle',
                        }} />
                      )}
                    </div>
                    {!aiLoading && insight && (
                      <div style={{
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: '1px solid rgba(56,189,248,0.08)',
                        fontSize: 9, color: '#4b7a63', fontFamily: 'IBM Plex Mono',
                        display: 'flex', alignItems: 'center', gap: 6,
                      }}>
                        <span style={{ color: '#34d399' }}>✓</span>
                        Powered by Llama 3.3 70B via Groq · Experimental validation recommended
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500&family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(56,189,248,0.2); border-radius: 2px; }
        textarea { scrollbar-width: thin; }
      `}</style>
    </div>
  );
}
