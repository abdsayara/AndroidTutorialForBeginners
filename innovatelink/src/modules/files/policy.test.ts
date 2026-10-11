import { describe, expect, it } from "vitest";
import { canDownload, canUploadTo } from "./policy";

describe("files policy", () => {
  it("inherits owner permissions", () => {
    expect(canUploadTo(true)).toBe(true);
    expect(canUploadTo(false)).toBe(false);
    expect(canDownload(true)).toBe(true);
    expect(canDownload(false)).toBe(false);
  });
});
