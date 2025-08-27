export type CardMinimal = {
  handle: string;
  image_url: string;
  narrative: string;
  narrative_twitter: string; // Twitter-optimized narrative (200 chars)
  glyphs: string; // space-separated
  psi_delta_phi: number;
  level: string;
  family?: string;
  generated_at?: string;
  full_json_url?: string;
  scores?: {
    coherence: number;
    surprise: number;
    resonance: number;
    complexity: number;
    depth: number;
    emergence: number;
    novelty: number;
  };
};

export type RunResponse = {
  job_id: string;
  card?: CardMinimal;
};


