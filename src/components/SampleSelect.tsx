import React from "react";
import { useT } from "../i18n";

export interface SampleSelectProps {
  onSelectSample: (key: string, text: string) => void;
  selectedSampleKey: string | null;
}

export const SAMPLES: Record<string, { labelKey: string; text: string }> = {
  sample1: {
    labelKey: "sample.1",
    text: "Vanakkam sir! Naan SEBI registered advisor (Reg: INH000000000). Our VIP group la join pannunga. Daily 3% guaranteed profit, risk illa. Only 10 slots left, innaiku mattum. Registration fee Rs 5000 indha UPI ku anuppunga: rameshadvisor@okaxis. Trading app download: http://trade-app-download.example/app.apk. Yarukum solla vendam."
  },
  sample2: {
    labelKey: "sample.2",
    text: "Mutual fund investments are subject to market risks. Read all scheme related documents carefully."
  },
  sample3: {
    labelKey: "sample.3",
    text: "Which stock should I buy today?"
  },
  sample4: {
    labelKey: "sample.4",
    text: "உறுதியான லாபம் தினமும் 3%. யாரிடமும் சொல்ல வேண்டாம். இன்று மட்டும்!"
  }
};

export const SampleSelect: React.FC<SampleSelectProps> = ({ onSelectSample, selectedSampleKey }) => {
  const { t } = useT();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label htmlFor="sample-select-dropdown">{t("sample.label")}</label>
      <select
        id="sample-select-dropdown"
        value={selectedSampleKey || ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val && SAMPLES[val]) {
            onSelectSample(val, SAMPLES[val].text);
          }
        }}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "4px",
          border: "1px solid var(--line-strong)",
          backgroundColor: "var(--surface)",
          color: "var(--ink)",
          fontSize: "1rem",
        }}
      >
        <option value="">-- Choose a sample message --</option>
        <option value="sample1">{t("sample.1")}</option>
        <option value="sample2">{t("sample.2")}</option>
        <option value="sample3">{t("sample.3")}</option>
        <option value="sample4">{t("sample.4")}</option>
      </select>
    </div>
  );
};
