// src/components/ConfirmModal.jsx
import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function ConfirmModal({ isOpen, title = "Konfirmasi", message = "", onCancel, onConfirm }) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50" onClose={onCancel}>
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-black/18 backdrop-blur-sm" />
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
            <Dialog.Panel className="w-full max-w-md bg-white rounded-xl shadow-2xl ring-1 ring-black/5 p-5">
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
              <div className="mt-3 text-sm text-gray-600">{message}</div>

              <div className="mt-5 flex justify-end gap-2">
                <button onClick={onCancel} className="px-3 py-2 rounded-lg border">
                  Batal
                </button>
                <button onClick={onConfirm} className="px-3 py-2 rounded-lg bg-red-600 text-white">
                  Hapus
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
