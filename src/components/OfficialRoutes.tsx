import React, { useState } from "react";
import type { Route } from "../api/types";
import { useT } from "../i18n";
import { isSafeUrl } from "../lib/safeUrl";

export interface OfficialRoutesProps {
  routes: Route[];
}

export const OfficialRoutes: React.FC<OfficialRoutesProps> = ({ routes }) => {
  const { lang, t } = useT();
  const [selectedFinding, setSelectedFinding] = useState<"match" | "nomatch" | "unable" | null>(null);

  if (!routes || routes.length === 0) return null;

  return (
    <section
      aria-labelledby="routes-title"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--line-strong)",
        borderRadius: "4px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <div>
        <h2
          id="routes-title"
          style={{
            margin: "0 0 4px 0",
            fontSize: "1.25rem",
            fontWeight: 600,
            fontFamily: "'Source Serif 4', serif",
          }}
        >
          {t("routes.title")}
        </h2>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--ink-muted)" }}>
          {t("routes.note")}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {routes.map((route) => {
          const routeLabel = route.label[lang] || route.label.en;
          const routeDesc = route.description[lang] || route.description.en;
          const safe = isSafeUrl(route.url || route.tel);

          return (
            <div
              key={route.id}
              style={{
                backgroundColor: "var(--paper)",
                border: "1px solid var(--line)",
                borderRadius: "4px",
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "1.0625rem" }}>{routeLabel}</div>
              <div style={{ fontSize: "0.9375rem", color: "var(--ink-muted)", lineHeight: 1.4 }}>
                {routeDesc}
              </div>

              {safe && route.url && (
                <div>
                  <a
                    href={route.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--paper)",
                      backgroundColor: "var(--green)",
                      borderRadius: "4px",
                      textDecoration: "none",
                    }}
                  >
                    {t("routes.open")}
                  </a>
                </div>
              )}

              {safe && route.tel && (
                <div>
                  <a
                    href={route.tel}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      color: "var(--paper)",
                      backgroundColor: "var(--green)",
                      borderRadius: "4px",
                      textDecoration: "none",
                    }}
                  >
                    {t("routes.call")} {route.tel.replace("tel:", "")}
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ borderTop: "1px solid var(--line)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <legend style={{ fontWeight: 600, fontSize: "1rem", marginBottom: "4px" }}>
          {t("routes.checked.title")}
        </legend>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9375rem" }}>
            <input
              type="radio"
              name="finding"
              value="match"
              checked={selectedFinding === "match"}
              onChange={() => setSelectedFinding("match")}
              style={{ accentColor: "var(--green)" }}
            />
            {t("routes.checked.match")}
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9375rem" }}>
            <input
              type="radio"
              name="finding"
              value="nomatch"
              checked={selectedFinding === "nomatch"}
              onChange={() => setSelectedFinding("nomatch")}
              style={{ accentColor: "var(--green)" }}
            />
            {t("routes.checked.nomatch")}
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.9375rem" }}>
            <input
              type="radio"
              name="finding"
              value="unable"
              checked={selectedFinding === "unable"}
              onChange={() => setSelectedFinding("unable")}
              style={{ accentColor: "var(--green)" }}
            />
            {t("routes.checked.unable")}
          </label>
        </div>

        {selectedFinding && (
          <div
            style={{
              backgroundColor: "var(--sunken)",
              border: "1px solid var(--line-strong)",
              borderRadius: "4px",
              padding: "12px",
              fontSize: "0.875rem",
              lineHeight: 1.5,
              marginTop: "4px",
            }}
          >
            {t(`routes.checked.note.${selectedFinding}`)}
          </div>
        )}
      </div>
    </section>
  );
};
