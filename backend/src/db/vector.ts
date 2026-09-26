/** pgvector expects a literal like "[0.1,0.2,0.3]" when passed as a query parameter. */
export function toVectorLiteral(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}
