import { beforeEach, describe, expect, it, vi } from "vitest";

const searchSimilarChunks = vi.fn();
const embedQuery = vi.fn();
const generateGroundedAnswer = vi.fn();

vi.mock("../src/db/chunks.repo.js", () => ({ searchSimilarChunks }));
vi.mock("../src/services/gemini.js", async () => {
  const actual = await vi.importActual<typeof import("../src/services/gemini.js")>("../src/services/gemini.js");
  return { ...actual, embedQuery, generateGroundedAnswer };
});

const { answerQuestion, NOT_MENTIONED_MESSAGE } = await import("../src/services/rag.js");
const { NOT_MENTIONED_SENTINEL } = await import("../src/services/gemini.js");

describe("answerQuestion (anti-hallucination guardrails)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    embedQuery.mockResolvedValue([0.1, 0.2, 0.3]);
  });

  it("returns the not-mentioned fallback without calling the LLM when retrieval finds nothing close enough", async () => {
    searchSimilarChunks.mockResolvedValue([{ id: "c1", content: "unrelated text", page_number: 1, chunk_index: 0, distance: 0.9 }]);

    const result = await answerQuestion("doc-1", "What is the penalty for late payment?");

    expect(result.grounded).toBe(false);
    expect(result.answer).toBe(NOT_MENTIONED_MESSAGE);
    expect(result.sources).toEqual([]);
    expect(generateGroundedAnswer).not.toHaveBeenCalled();
  });

  it("returns the not-mentioned fallback when the model itself signals the sentinel", async () => {
    searchSimilarChunks.mockResolvedValue([
      { id: "c1", content: "The parties agree to arbitration in Delhi.", page_number: 2, chunk_index: 1, distance: 0.2 },
    ]);
    generateGroundedAnswer.mockResolvedValue(NOT_MENTIONED_SENTINEL);

    const result = await answerQuestion("doc-1", "What is the penalty for late payment?");

    expect(result.grounded).toBe(false);
    expect(result.answer).toBe(NOT_MENTIONED_MESSAGE);
  });

  it("returns a grounded answer with sources when retrieval and generation both succeed", async () => {
    searchSimilarChunks.mockResolvedValue([
      { id: "c1", content: "Rent is due on the 1st of every month.", page_number: 3, chunk_index: 2, distance: 0.15 },
    ]);
    generateGroundedAnswer.mockResolvedValue("Rent is due on the 1st of every month (see passage 1).");

    const result = await answerQuestion("doc-1", "When is rent due?");

    expect(result.grounded).toBe(true);
    expect(result.answer).toContain("Rent is due");
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0]).toMatchObject({ chunkId: "c1", pageNumber: 3 });
  });
});
