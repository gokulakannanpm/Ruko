import React from "react";
import { useT } from "../i18n";

export interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  const { lang, t } = useT();

  return (
    <article
      style={{
        maxWidth: "760px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontSize: "1.0625rem",
        lineHeight: 1.6,
      }}
    >
      <div>
        <a
          href="#/"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            color: "var(--green)",
            fontWeight: 600,
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            fontSize: "1rem",
            marginBottom: "16px",
          }}
        >
          ← {t("privacy.back")}
        </a>

        <h1 style={{ margin: "8px 0 4px 0", fontFamily: "'Source Serif 4', serif" }}>
          {t("nav.privacy")}
        </h1>
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--ink-muted)" }}>
          Prototype for the SANGYAN Investor Resilience Hackathon 2026.
        </p>
      </div>

      {/* Tamil Summary (shown when lang === "ta") */}
      {lang === "ta" && (
        <section
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--line-strong)",
            borderRadius: "4px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.25rem", fontFamily: "'Source Serif 4', serif" }}>
            தமிழ் சுருக்கம் (Tamil Summary)
          </h2>
          <ol style={{ margin: 0, paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <li>1. ருகோ ஒரு சுயாதீன முன்மாதிரி. இது செபி, அரசு அமைப்பு, வங்கி அல்லது தரகருடன் இணைந்தது அல்ல.</li>
            <li>2. அனுப்பும் முன் OTP, அட்டை, ஆதார், பான், தொலைபேசி, வங்கிக் கணக்கு போன்ற எண்கள் உங்கள் உலாவியிலேயே மறைக்கப்படும். இது முழுமையானது அல்ல; முக்கிய விவரங்களை ஒட்ட வேண்டாம்.</li>
            <li>3. உங்கள் செய்தி எங்கள் சர்வரில் சேமிக்கப்படாது. கணக்குகள், விளம்பரக் குக்கீகள் அல்லது பகுப்பாய்வு இல்லை.</li>
            <li>4. நீங்கள் விரும்பினால் மட்டுமே, மறைக்கப்பட்ட உரை Google Gemini API-க்கு அனுப்பப்படும். ஸ்கிரீன்ஷாட்டை மறைக்க முடியாததால் அது அப்படியே அனுப்பப்படும். ருகோவின் ஆபத்து முடிவு AI-யைச் சார்ந்தது அல்ல.</li>
            <li>5. ருகோ எந்த முதலீட்டையும் பரிந்துரைக்கவோ மதிப்பிடவோ கணிக்கவோ செய்யாது. அறிகுறிகள் இல்லை என்றால் அது பாதுகாப்புச் சோதனை அல்ல.</li>
            <li>6. செய்தியில் உள்ள இணைப்புகளை ருகோ திறக்காது. இந்த முன்மாதிரி சட்ட இணக்க மதிப்பாய்வு பெறவில்லை.</li>
          </ol>
        </section>
      )}

      {/* English Full Text */}
      <div lang="en" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            What Ruko is
          </h2>
          <p style={{ margin: 0 }}>
            Ruko helps you understand the claims inside an investment message and find the official place to check them. It is an independent prototype. It is not connected to SEBI, any government body, bank or broker.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            What you give Ruko
          </h2>
          <p style={{ margin: 0 }}>
            The text of a message you paste. Optionally, a screenshot. Your language choice.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            What happens on your device first
          </h2>
          <p style={{ margin: 0 }}>
            Before anything is sent, your browser hides numbers that look like OTPs, card numbers, Aadhaar numbers, PAN, phone numbers and bank account numbers. This is a best effort and can miss things. Please do not paste sensitive details.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            What our server does
          </h2>
          <p style={{ margin: 0 }}>
            Our server reads the hidden-text version with fixed rules and returns the result. It does not save the message, does not create accounts and does not use advertising or analytics cookies. Technical logs record that a request happened, not what it contained.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            AI help (only if you turn it on)
          </h2>
          <p style={{ margin: 0 }}>
            The same hidden-text version is also sent from our server to Google's Gemini API, which reads it and may suggest extra claims. If you add a screenshot, the image is sent as it is, because it cannot be hidden on your device. Google's own terms apply to that processing. Ruko's risk result never depends on AI.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            What stays on your device
          </h2>
          <p style={{ margin: 0 }}>
            Your language choice. Nothing else is stored.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            Links & Sharing
          </h2>
          <p style={{ margin: 0 }}>
            Ruko never opens or visits links in your message. Share buttons open WhatsApp or your device's share menu with text you can edit first. Ruko does not contact anyone for you.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            Not advice
          </h2>
          <p style={{ margin: 0 }}>
            Ruko does not recommend, rate or predict any investment. A risk indicator means a claim needs checking. It does not prove anything about a sender. When Ruko finds no indicators, that is not a safety check.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            Accuracy, limits & law
          </h2>
          <p style={{ margin: "0 0 8px 0" }}>
            Ruko can miss things and can flag harmless messages. Use the official routes it shows.
          </p>
          <p style={{ margin: 0 }}>
            Ruko is designed around the principles of India's Digital Personal Data Protection Act, 2023, such as using as little data as possible and not keeping it. This prototype has not had a legal compliance review.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: "1.375rem", fontFamily: "'Source Serif 4', serif", marginBottom: "8px" }}>
            Demonstrations
          </h2>
          <p style={{ margin: 0 }}>
            At this hackathon, demonstrations use made-up messages.
          </p>
        </section>
      </div>
    </article>
  );
};
