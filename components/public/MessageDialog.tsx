"use client";

import { useEffect, useId, useRef } from "react";

export default function MessageDialog({
  open,
  title,
  message,
  onDismiss,
}: {
  open: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="status-dialog"
      aria-labelledby={titleId}
      onClose={onDismiss}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          dialogRef.current?.close();
        }
      }}
    >
      <h2 id={titleId} className="text-2xl">
        {title}
      </h2>
      <p className="mt-3 leading-relaxed">{message}</p>
      <button
        type="button"
        className="btn-primary mt-6 w-full"
        onClick={() => dialogRef.current?.close()}
      >
        OK
      </button>
    </dialog>
  );
}
