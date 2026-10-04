import { describe, it, expect } from "vitest";
import { en } from "../src/i18n/en";
import { ta } from "../src/i18n/ta";

describe("i18n dictionary completeness", () => {
  it("asserts English and Tamil dictionaries have identical key sets", () => {
    const enKeys = Object.keys(en).sort();
    const taKeys = Object.keys(ta).sort();

    expect(taKeys).toEqual(enKeys);
  });
});
