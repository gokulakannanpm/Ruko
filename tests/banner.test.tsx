import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { TierBanner } from "../src/components/TierBanner";
import { sampleNoneFoundResponse } from "../src/mock/sampleResponse";
import { LanguageContext, t as tFunc } from "../src/i18n";

describe("TierBanner hard product rules", () => {
  it("asserts that none_found banner never contains the word 'safe'", () => {
    const { container } = render(
      <LanguageContext.Provider
        value={{
          lang: "en",
          setLang: () => {},
          t: (k, v) => tFunc(k, v, "en"),
        }}
      >
        <TierBanner response={sampleNoneFoundResponse} />
      </LanguageContext.Provider>
    );

    const bannerText = container.textContent?.toLowerCase() || "";
    expect(bannerText).not.toContain("safe");
  });

  it("asserts that Tamil none_found banner also never contains 'safe'", () => {
    const { container } = render(
      <LanguageContext.Provider
        value={{
          lang: "ta",
          setLang: () => {},
          t: (k, v) => tFunc(k, v, "ta"),
        }}
      >
        <TierBanner response={sampleNoneFoundResponse} />
      </LanguageContext.Provider>
    );

    const bannerText = container.textContent?.toLowerCase() || "";
    expect(bannerText).not.toContain("safe");
  });
});
