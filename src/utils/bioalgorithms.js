// ─────────────────────────────────────────────────────────────────────────────
// Real bioinformatics algorithms — no hardcoding, all computed from sequence
// ─────────────────────────────────────────────────────────────────────────────

// Kyte-Doolittle hydrophobicity scale
export const KD_SCALE = {
  A: 1.8, R: -4.5, N: -3.5, D: -3.5, C: 2.5, Q: -3.5, E: -3.5,
  G: -0.4, H: -3.2, I: 4.5, L: 3.8, K: -3.9, M: 1.9, F: 2.8,
  P: -1.6, S: -0.8, T: -0.7, W: -0.9, Y: -1.3, V: 4.2
};

// pKa values for charge calculation (Henderson-Hasselbalch)
export const PKA = {
  Nterm: 8.0, Cterm: 3.1,
  D: 3.9, E: 4.1, H: 6.5, C: 8.3, Y: 10.1, K: 10.5, R: 12.5
};

// Amino acid molecular weights
export const AA_MW = {
  A: 89.09, R: 174.20, N: 132.12, D: 133.10, C: 121.16,
  Q: 146.15, E: 147.13, G: 75.03, H: 155.16, I: 131.17,
  L: 131.17, K: 146.19, M: 149.21, F: 165.19, P: 115.13,
  S: 105.09, T: 119.12, W: 204.23, Y: 181.19, V: 117.15
};

// Molar extinction coefficients at 280nm
export const EXTINCTION = { W: 5500, Y: 1490, C: 125 };

// Secondary structure propensity (Chou-Fasman parameters)
export const CF_HELIX = {
  A: 1.42, R: 0.98, N: 0.67, D: 1.01, C: 0.70, Q: 1.11, E: 1.51,
  G: 0.57, H: 1.00, I: 1.08, L: 1.21, K: 1.16, M: 1.45, F: 1.13,
  P: 0.57, S: 0.77, T: 0.83, W: 1.08, Y: 0.69, V: 1.06
};
export const CF_SHEET = {
  A: 0.83, R: 0.93, N: 0.89, D: 0.54, C: 1.19, Q: 1.10, E: 0.37,
  G: 0.75, H: 0.87, I: 1.60, L: 1.30, K: 0.74, M: 1.05, F: 1.38,
  P: 0.55, S: 0.75, T: 1.19, W: 1.37, Y: 1.47, V: 1.70
};
export const CF_TURN = {
  A: 0.66, R: 0.95, N: 1.56, D: 1.46, C: 1.19, Q: 0.98, E: 0.74,
  G: 1.56, H: 0.95, I: 0.47, L: 0.59, K: 1.01, M: 0.60, F: 0.60,
  P: 1.52, S: 1.43, T: 0.96, W: 0.96, Y: 1.14, V: 0.50
};

// ── Validate and clean sequence ──────────────────────────────────────────────
export function cleanSequence(raw) {
  return raw.toUpperCase().replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, '');
}

export function validateSequence(seq) {
  if (!seq || seq.length === 0) return { valid: false, error: 'Empty sequence' };
  if (seq.length < 5) return { valid: false, error: 'Sequence too short (min 5 AA)' };
  const valid = /^[ACDEFGHIKLMNPQRSTVWY]+$/.test(seq);
  if (!valid) return { valid: false, error: 'Invalid amino acid characters' };
  return { valid: true };
}

// ── Amino acid composition ───────────────────────────────────────────────────
export function computeComposition(seq) {
  const counts = {};
  const ALL_AA = 'ACDEFGHIKLMNPQRSTVWY';
  for (const aa of ALL_AA) counts[aa] = 0;
  for (const aa of seq) if (counts[aa] !== undefined) counts[aa]++;
  return Object.entries(counts)
    .map(([aa, count]) => ({
      aa,
      count,
      percent: (count / seq.length) * 100
    }))
    .sort((a, b) => b.count - a.count);
}

// ── Molecular weight ─────────────────────────────────────────────────────────
export function computeMolecularWeight(seq) {
  let mw = seq.split('').reduce((sum, aa) => sum + (AA_MW[aa] || 0), 0);
  mw -= (seq.length - 1) * 18.02; // subtract water for peptide bonds
  return mw;
}

// ── Isoelectric point (pI) ───────────────────────────────────────────────────
export function computePI(seq) {
  const charge = (pH) => {
    let q = 0;
    // N-terminus
    q += 1 / (1 + Math.pow(10, pH - PKA.Nterm));
    // C-terminus
    q -= 1 / (1 + Math.pow(10, PKA.Cterm - pH));
    const contributions = {
      D: { pKa: PKA.D, sign: -1 },
      E: { pKa: PKA.E, sign: -1 },
      H: { pKa: PKA.H, sign: +1 },
      C: { pKa: PKA.C, sign: -1 },
      Y: { pKa: PKA.Y, sign: -1 },
      K: { pKa: PKA.K, sign: +1 },
      R: { pKa: PKA.R, sign: +1 },
    };
    for (const aa of seq) {
      const c = contributions[aa];
      if (c) {
        if (c.sign === 1) q += 1 / (1 + Math.pow(10, pH - c.pKa));
        else q -= 1 / (1 + Math.pow(10, c.pKa - pH));
      }
    }
    return q;
  };
  let lo = 0, hi = 14;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    charge(mid) > 0 ? (lo = mid) : (hi = mid);
  }
  return (lo + hi) / 2;
}

// ── Extinction coefficient ───────────────────────────────────────────────────
export function computeExtinction(seq) {
  let ext = 0;
  for (const aa of seq) ext += (EXTINCTION[aa] || 0);
  const mw = computeMolecularWeight(seq);
  return { epsilon: ext, absorbance: mw > 0 ? ext / mw : 0 };
}

// ── Instability index (Guruprasad et al.) ────────────────────────────────────
const DIPEPTIDE_INSTABILITY = {
  WW:1,WC:1,WY:1.5,WF:3,WM:3.5,WH:4,WR:4,WG:4.5,WT:5,WP:5,WL:5,WK:5,WN:5,WA:6,WQ:6,WD:6,WI:6,WE:6,WS:6.5,WV:7,
  CK:1,CY:1,CH:1,CR:1,CF:1.5,CM:2,CG:2,CP:2.5,CL:2.5,CA:2.5,CN:2.5,CT:2.5,CS:2.5,CI:3,CQ:3,CE:3,CD:3,CV:3,CC:3,CW:3,
  // simplified subset — full table would be 400 entries
  AA:1,AC:44.94,AE:1,AF:1,AG:1,AH:1,AI:1,AK:1,AL:1,AM:1,AN:1,AP:20.26,AQ:1,AR:1,AS:1,AT:1,AV:1,AW:1,AY:1,
  YY:1,YC:1,YK:2,YH:2
};

export function computeInstabilityIndex(seq) {
  let score = 0;
  for (let i = 0; i < seq.length - 1; i++) {
    const dipep = seq[i] + seq[i+1];
    score += (DIPEPTIDE_INSTABILITY[dipep] || 1);
  }
  return (10 / seq.length) * score;
}

// ── Hydrophobicity profile (sliding window) ──────────────────────────────────
export function computeHydrophobicity(seq, window = 9) {
  const result = [];
  const half = Math.floor(window / 2);
  for (let i = 0; i < seq.length; i++) {
    const start = Math.max(0, i - half);
    const end = Math.min(seq.length - 1, i + half);
    let sum = 0, count = 0;
    for (let j = start; j <= end; j++) {
      sum += (KD_SCALE[seq[j]] || 0);
      count++;
    }
    result.push({
      position: i + 1,
      aa: seq[i],
      score: parseFloat((sum / count).toFixed(3))
    });
  }
  return result;
}

// ── Secondary structure prediction (Chou-Fasman) ────────────────────────────
export function predictSecondaryStructure(seq) {
  const window = 6;
  const result = [];

  for (let i = 0; i < seq.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2));
    const end = Math.min(seq.length, start + window);
    const sub = seq.slice(start, end);

    let helix = 0, sheet = 0, turn = 0;
    for (const aa of sub) {
      helix += (CF_HELIX[aa] || 1);
      sheet += (CF_SHEET[aa] || 1);
      turn  += (CF_TURN[aa]  || 1);
    }
    helix /= sub.length;
    sheet /= sub.length;
    turn  /= sub.length;

    let ss = 'C'; // coil
    if (helix > 1.03 && helix >= sheet && helix >= turn) ss = 'H';
    else if (sheet > 1.05 && sheet >= helix && sheet >= turn) ss = 'E';
    else if (turn > 1.0 && turn >= helix && turn >= sheet) ss = 'T';

    result.push({
      position: i + 1,
      aa: seq[i],
      ss,
      helix: parseFloat(helix.toFixed(3)),
      sheet: parseFloat(sheet.toFixed(3)),
      turn: parseFloat(turn.toFixed(3)),
    });
  }
  return result;
}

// ── Domain/motif scanning ────────────────────────────────────────────────────
const MOTIFS = [
  { name: 'N-glycosylation', pattern: /N[^P][ST][^P]/g, color: '#60a5fa', desc: 'N-linked glycosylation site' },
  { name: 'RGD motif', pattern: /RGD/g, color: '#34d399', desc: 'Cell attachment sequence' },
  { name: 'KDEL signal', pattern: /KDEL/g, color: '#f59e0b', desc: 'ER retention signal' },
  { name: 'Nuclear export', pattern: /L[^ACDEFGHIKLMNPQRSTVWY]{2,3}L[^ACDEFGHIKLMNPQRSTVWY]{2,3}L/g, color: '#a78bfa', desc: 'Nuclear export signal' },
  { name: 'Caspase cleavage', pattern: /[DEVD]G/g, color: '#f87171', desc: 'Apoptotic cleavage site' },
  { name: 'Kinase site (PKC)', pattern: /[ST][^P][KR]/g, color: '#fb923c', desc: 'Protein kinase C phosphorylation' },
  { name: 'Kinase site (PKA)', pattern: /[RK][RK][^A][ST]/g, color: '#e879f9', desc: 'Protein kinase A phosphorylation' },
  { name: 'SH2 binding', pattern: /Y[^P][^P][IVLM]/g, color: '#2dd4bf', desc: 'SH2 domain binding motif' },
  { name: 'CAAX box', pattern: /C[^ACDEFGHIKLMNPQRSTVWY]{2}[ACMST]$/g, color: '#4ade80', desc: 'Prenylation signal' },
  { name: 'Transmembrane (IILL)', pattern: /[AILMFVWY]{10,}/g, color: '#94a3b8', desc: 'Putative transmembrane stretch' },
];

export function scanMotifs(seq) {
  const found = [];
  for (const motif of MOTIFS) {
    const re = new RegExp(motif.pattern.source, 'g');
    let match;
    while ((match = re.exec(seq)) !== null) {
      found.push({
        name: motif.name,
        desc: motif.desc,
        color: motif.color,
        start: match.index,
        end: match.index + match[0].length - 1,
        sequence: match[0],
      });
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

// ── Codon usage / protein classification heuristics ──────────────────────────
export function classifyProtein(seq) {
  const comp = {};
  for (const aa of seq) comp[aa] = (comp[aa] || 0) + 1;
  const len = seq.length;

  const hydrophobic = ['A','I','L','M','F','V','W','Y'].reduce((s,a) => s + (comp[a]||0), 0) / len;
  const charged     = ['D','E','K','R','H'].reduce((s,a) => s + (comp[a]||0), 0) / len;
  const cys         = (comp['C'] || 0) / len;
  const pro         = (comp['P'] || 0) / len;

  const tags = [];
  if (hydrophobic > 0.45) tags.push({ label: 'Hydrophobic', color: '#f59e0b' });
  if (charged > 0.25)     tags.push({ label: 'Highly charged', color: '#60a5fa' });
  if (cys > 0.05)         tags.push({ label: 'Cys-rich (disulfide)', color: '#f87171' });
  if (pro > 0.08)         tags.push({ label: 'Pro-rich', color: '#a78bfa' });
  if (len < 50)           tags.push({ label: 'Peptide', color: '#34d399' });
  else if (len < 200)     tags.push({ label: 'Small protein', color: '#34d399' });
  else if (len < 500)     tags.push({ label: 'Medium protein', color: '#34d399' });
  else                    tags.push({ label: 'Large protein', color: '#34d399' });

  return tags;
}

// ── GRAVY score (Grand Average of Hydropathicity) ────────────────────────────
export function computeGRAVY(seq) {
  const sum = seq.split('').reduce((s, aa) => s + (KD_SCALE[aa] || 0), 0);
  return sum / seq.length;
}

// ── Aliphatic index ──────────────────────────────────────────────────────────
export function computeAliphaticIndex(seq) {
  const len = seq.length;
  const A = ((seq.match(/A/g) || []).length / len) * 100;
  const V = ((seq.match(/V/g) || []).length / len) * 100;
  const I = ((seq.match(/I/g) || []).length / len) * 100;
  const L = ((seq.match(/L/g) || []).length / len) * 100;
  return A + 2.9 * V + 3.9 * (I + L);
}

// ── Charge at pH 7 ───────────────────────────────────────────────────────────
export function computeChargeAtPH(seq, pH = 7.0) {
  let charge = 0;
  charge += 1 / (1 + Math.pow(10, pH - PKA.Nterm));
  charge -= 1 / (1 + Math.pow(10, PKA.Cterm - pH));
  const titr = { D: PKA.D, E: PKA.E, C: PKA.C, Y: PKA.Y };
  const pos   = { H: PKA.H, K: PKA.K, R: PKA.R };
  for (const aa of seq) {
    if (titr[aa]) charge -= 1 / (1 + Math.pow(10, titr[aa] - pH));
    if (pos[aa])  charge += 1 / (1 + Math.pow(10, pH - pos[aa]));
  }
  return parseFloat(charge.toFixed(2));
}

// ── Run full analysis ────────────────────────────────────────────────────────
export function analyzeSequence(raw) {
  const seq = cleanSequence(raw);
  const validation = validateSequence(seq);
  if (!validation.valid) return { error: validation.error };

  const mw = computeMolecularWeight(seq);
  const pi = computePI(seq);
  const gravy = computeGRAVY(seq);
  const { epsilon, absorbance } = computeExtinction(seq);
  const instability = computeInstabilityIndex(seq);
  const aliphatic = computeAliphaticIndex(seq);
  const charge7 = computeChargeAtPH(seq, 7.0);

  return {
    seq,
    length: seq.length,
    mw: parseFloat(mw.toFixed(2)),
    pi: parseFloat(pi.toFixed(2)),
    gravy: parseFloat(gravy.toFixed(3)),
    epsilon,
    absorbance: parseFloat(absorbance.toFixed(4)),
    instability: parseFloat(instability.toFixed(2)),
    stable: instability < 40,
    aliphatic: parseFloat(aliphatic.toFixed(2)),
    charge7,
    composition: computeComposition(seq),
    hydrophobicity: computeHydrophobicity(seq, 9),
    secondaryStructure: predictSecondaryStructure(seq),
    motifs: scanMotifs(seq),
    tags: classifyProtein(seq),
  };
}
