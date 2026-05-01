import { useState, useCallback } from 'react';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export function useGroqAnalysis() {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (analysisData) => {
    if (!GROQ_API_KEY) {
      setError('API key not configured');
      return;
    }
    setLoading(true);
    setError(null);
    setInsight(null);

    const { seq, mw, pi, gravy, instability, stable, aliphatic, charge7,
            epsilon, motifs, tags, secondaryStructure } = analysisData;

    // Compute SS percentages
    const total = secondaryStructure.length;
    const helixPct = Math.round((secondaryStructure.filter(r => r.ss === 'H').length / total) * 100);
    const sheetPct = Math.round((secondaryStructure.filter(r => r.ss === 'E').length / total) * 100);
    const coilPct  = 100 - helixPct - sheetPct;

    const motifNames = motifs.map(m => m.name).join(', ') || 'none detected';
    const tagNames   = tags.map(t => t.label).join(', ');

    const prompt = `You are a senior computational biologist at a top pharmaceutical company. Analyze the following protein sequence properties and provide concise, expert-level biological interpretation. Be specific, mention drug discovery implications, and highlight anything unusual or actionable. Do NOT use markdown headers — write in flowing prose, 3-4 sentences max per point. Focus on: (1) what kind of protein this likely is, (2) druggability/tractability, (3) key risks or opportunities.

SEQUENCE (${seq.length} AA): ${seq.length > 80 ? seq.slice(0, 80) + '...' : seq}

COMPUTED PROPERTIES:
- Molecular weight: ${mw.toFixed(0)} Da
- Isoelectric point: ${pi.toFixed(2)}
- GRAVY score: ${gravy} (${gravy > 0 ? 'hydrophobic' : 'hydrophilic'})
- Instability index: ${instability} (${stable ? 'STABLE' : 'UNSTABLE'})
- Aliphatic index: ${aliphatic}
- Net charge at pH 7: ${charge7}
- Extinction coefficient: ${epsilon} M⁻¹cm⁻¹
- Secondary structure: ${helixPct}% helix, ${sheetPct}% sheet, ${coilPct}% coil
- Motifs detected: ${motifNames}
- Classification: ${tagNames}

Provide expert biological interpretation. Be direct and specific — mention real drug classes, biological processes, or experimental recommendations where relevant.`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.4,
          max_tokens: 600,
          stream: true,
        }),
      });

      if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let full = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]');
        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(6));
            const delta = json.choices?.[0]?.delta?.content || '';
            full += delta;
            setInsight(full);
          } catch {}
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { insight, loading, error, analyze };
}
