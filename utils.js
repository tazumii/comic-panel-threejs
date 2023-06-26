export function vectors2Vertices(vectors) {
  return Float32Array.from(vectors.flatMap(({ x, y }) => [x, y, 0]));
}

export function encloseVectors(vectors) {
  const positions = vectors.flatMap(({ x, y }) => [x, y, 0]);
  if (vectors.length > 0) {
    positions.push(...positions.slice(0, 3));
  }
  return positions;
}