import React from "react";
import { getInitialsFromEmail, getInitialsFromName, pickBrandColors } from "../utils/avatar";

export default function Avatar({ email, name, size = 40, style = {}, className = "", customAvatar = null }) {
  const initials = email ? getInitialsFromEmail(email) : getInitialsFromName(name);
  const seed = email || name || "thrive360";
  const { backgroundColor, color, border } = pickBrandColors(seed);

  const diameter = typeof size === "number" ? `${size}px` : size;

  // If custom avatar is provided, show the image
  if (customAvatar) {
    return (
      <div
        className={className}
        style={{
          width: diameter,
          height: diameter,
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid #dee2e6",
          ...style,
        }}
        aria-label="User avatar"
        title={email || name}
      >
        <img
          src={customAvatar}
          alt={name || email || "User avatar"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.target.style.display = "none";
            e.target.parentElement.innerHTML = `
              <div style="
                width: 100%;
                height: 100%;
                background-color: ${backgroundColor};
                color: ${color};
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: ${Math.max(12, Math.floor((parseInt(size, 10) || 40) * 0.4))}px;
                user-select: none;
                line-height: 1;
              ">
                ${initials}
              </div>
            `;
          }}
        />
      </div>
    );
  }

  // Default avatar with initials
  return (
    <div
      className={className}
      style={{
        width: diameter,
        height: diameter,
        borderRadius: "50%",
        backgroundColor,
        color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: Math.max(12, Math.floor((parseInt(size, 10) || 40) * 0.4)),
        userSelect: "none",
        lineHeight: 1,
        border,
        ...style,
      }}
      aria-label="User avatar"
      title={email || name}
    >
      {initials}
    </div>
  );
}



