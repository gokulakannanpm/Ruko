import React from "react";

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  children: React.ReactNode;
}

export const TextLink: React.FC<TextLinkProps> = ({ children, style, className = "", ...props }) => {
  const linkStyle: React.CSSProperties = {
    color: "var(--green)",
    textDecoration: "underline",
    textUnderlineOffset: "3px",
    cursor: "pointer",
    fontWeight: 600,
    fontFamily: "inherit",
    ...style,
  };

  return (
    <a className={`ruko-link ${className}`} style={linkStyle} {...props}>
      {children}
    </a>
  );
};
