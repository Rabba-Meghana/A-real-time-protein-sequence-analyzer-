# ProteinLens — Real-time Protein Sequence Intelligence

> A production-grade bioinformatics tool that runs real algorithms entirely in the browser — no backend, no setup, instant results.

## What it does

All algorithms run client-side in real time:

| Algorithm | Method |
|-----------|--------|
| Hydrophobicity profile | Kyte-Doolittle scale, 9-residue sliding window |
| Secondary structure | Chou-Fasman propensity parameters |
| Isoelectric point (pI) | Henderson-Hasselbalch iterative bisection |
| Molecular weight | Exact AA residue masses |
| GRAVY score | Grand Average of Hydropathicity |
| Aliphatic index | Ikai (1980) thermostability |
| Instability index | Guruprasad et al. dipeptide weights |
| Extinction coefficient | Trp/Tyr/Cys at 280nm |
| Motif scanning | 10 known functional motifs |
| AI interpretation | Llama 3.3 70B via Groq (streaming) |

## Quick start

```bash
npm install
cp .env.example .env   # paste your Groq API key
npm run dev
```

## Environment

```
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get a free key at https://console.groq.com — never committed to repo.

## Build

```bash
npm run build && npm run preview
```

## Stack

React 19 + Vite · Recharts · Groq streaming API · IBM Plex Mono + Syne + DM Sans
