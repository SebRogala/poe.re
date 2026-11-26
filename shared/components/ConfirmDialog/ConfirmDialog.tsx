import React, {useEffect, useId, useRef} from "react";
import {createPortal} from "react-dom";
import "./ConfirmDialog.css";

export interface ConfirmDialogProps {
  title: string;
  body?: string;
  confirmLabel: string;
  tone: "danger" | "neutral";
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog = ({title, body, confirmLabel, tone, onConfirm, onCancel}: ConfirmDialogProps) => {
  const titleId = useId();
  const bodyId = useId();
  const opener = useRef(document.activeElement);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmRef.current?.focus();
    const openerElement = opener.current;
    return () => {
      if (openerElement instanceof HTMLElement && openerElement.isConnected) openerElement.focus();
    };
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    // Page-level keydown listeners must not also act: Profile.tsx runs its open popover's action on Enter
    event.stopPropagation();
    if (event.key === "Escape") {
      onCancel();
    } else if (event.key === "Tab") {
      const first = cancelRef.current, last = confirmRef.current;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  };

  // Rendered into body: in place, the sticky result box (z-index 50) and the phone navigation drawer (transform)
  // would trap the fixed backdrop below the phone header or inside the drawer.
  return createPortal(<div className="confirm-dialog-backdrop" role="presentation" onKeyDown={onKeyDown}
              onClick={(event) => { if (event.target === event.currentTarget) onCancel(); }}>
    <div className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={titleId}
         aria-describedby={body ? bodyId : undefined}>
      <div className="confirm-dialog-head">
        {tone === "danger" &&
          <svg className="confirm-dialog-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>
            <path d="M12 9v4"/>
            <path d="M12 17h.01"/>
          </svg>}
        <h2 className="confirm-dialog-title" id={titleId}>{title}</h2>
      </div>
      {body && <p className="confirm-dialog-body" id={bodyId}>{body}</p>}
      <div className="confirm-dialog-actions">
        <button ref={cancelRef} type="button" onClick={onCancel}>Cancel</button>
        <button ref={confirmRef} type="button" className={`confirm-dialog-confirm-${tone}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>, document.body);
};
