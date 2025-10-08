import React from "react";

export default function Card({ title, children, className = "" }) {
  return (
    <div className={`bg-white p-4 rounded shadow ${className}`}>
      {title && <div className="font-semibold mb-2">{title}</div>}
      {children}
    </div>
  );
}