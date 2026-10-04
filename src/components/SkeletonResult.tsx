import React from "react";

export const SkeletonResult: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
      }}
    >
      {/* Banner block - height 96px */}
      <div
        className="skeleton-pulse"
        style={{
          height: "96px",
          backgroundColor: "var(--sunken)",
          borderRadius: "4px",
          border: "1px solid var(--line)",
        }}
      />

      {/* Message block - height 140px */}
      <div
        className="skeleton-pulse"
        style={{
          height: "140px",
          backgroundColor: "var(--sunken)",
          borderRadius: "4px",
          border: "1px solid var(--line)",
        }}
      />

      {/* 3 Ledger-row blocks - height 160px each */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          className="skeleton-pulse"
          style={{
            height: "160px",
            backgroundColor: "var(--sunken)",
            borderRadius: "4px",
            border: "1px solid var(--line)",
          }}
        />
        <div
          className="skeleton-pulse"
          style={{
            height: "160px",
            backgroundColor: "var(--sunken)",
            borderRadius: "4px",
            border: "1px solid var(--line)",
          }}
        />
        <div
          className="skeleton-pulse"
          style={{
            height: "160px",
            backgroundColor: "var(--sunken)",
            borderRadius: "4px",
            border: "1px solid var(--line)",
          }}
        />
      </div>
    </div>
  );
};
