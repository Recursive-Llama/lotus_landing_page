export function thetaFromTurns(turns: number, clockwise: boolean = true): number {
  const direction = clockwise ? 1 : -1;
  return direction * (Math.PI * 2 * turns);
}

export function cartesianFromTheta(
  theta: number,
  a: number,
  b: number,
  scale: number,
  centerX: number,
  centerY: number
): { x: number; y: number } {
  const radius = a * Math.exp(b * theta);
  const x = centerX + radius * Math.cos(theta) * 60 * scale;
  const y = centerY + radius * Math.sin(theta) * 60 * scale;
  return { x, y };
}

export type SampleOptions = {
  a: number;
  b: number;
  scale: number;
  turns: number;
  centerX: number;
  centerY: number;
  step?: number;
};

export function sampleSpiralPath(options: SampleOptions): Float32Array {
  const { a, b, scale, turns, centerX, centerY, step = 0.012 } = options;
  const totalTheta = Math.PI * 2 * turns;
  const points: number[] = [];
  for (let theta = 0; theta <= totalTheta; theta += step) {
    const radius = a * Math.exp(b * theta);
    const x = centerX + radius * Math.cos(theta) * 60 * scale;
    const y = centerY + radius * Math.sin(theta) * 60 * scale;
    points.push(x, y);
  }
  return new Float32Array(points);
}

