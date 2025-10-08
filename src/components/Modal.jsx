// src/components/Modal.jsx
import React from "react";

export default function Modal({ isOpen, title, children, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black opacity-30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded shadow-lg w-full max-w-lg z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded text-gray-600 hover:bg-gray-100">×</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
