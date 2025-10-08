// src/components/ResetPasswordModal.jsx
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";

export default function ResetPasswordModal({ isOpen, onClose, onSubmit, loading = false }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setConfirm("");
      setError(null);
    }
  }, [isOpen]);

  const submit = () => {
    setError(null);
    if (!password) return setError("Isi password baru");
    if (password !== confirm) return setError("Konfirmasi password tidak cocok");
    onSubmit({ new_password: password, new_password_confirmation: confirm });
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onClose}>
        {/* overlay: lebih ringan + blur */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" />
        </div>

        <div className="flex min-h-screen items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transform transition ease-out duration-150"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transform transition ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 p-5">
              <div className="flex items-start justify-between">
                <Dialog.Title className="text-lg font-semibold">Reset Password Guru</Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700 rounded-full p-1"
                  aria-label="Close"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password baru</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Masukkan password baru"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Konfirmasi password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="mt-1 w-full border border-gray-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    placeholder="Ulangi password"
                  />
                </div>

                {error && <div className="text-sm text-red-600">{error}</div>}
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">
                  Batal
                </button>
                <button
                  onClick={submit}
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-white text-sm ${loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`}
                >
                  {loading ? "Memproses..." : "Reset Password"}
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
