import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  children,
  className = "",
  style,
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    minHeight: "48px",
    padding: "0 20px",
    fontSize: "17px",
    fontWeight: 600,
    borderRadius: "4px",
    cursor: props.disabled ? "not-allowed" : "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    opacity: props.disabled ? 0.6 : 1,
    fontFamily: "inherit",
    ...style,
  };

  if (variant === "primary") {
    baseStyle.backgroundColor = "var(--green)";
    baseStyle.color = "var(--paper)";
    baseStyle.border = "none";
  } else {
    baseStyle.backgroundColor = "transparent";
    baseStyle.color = "var(--green)";
    baseStyle.border = "1px solid var(--green)";
  }

  return (
    <button className={`ruko-btn ${className}`} style={baseStyle} {...props}>
      {children}
    </button>
  );
};
