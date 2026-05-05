import { useEffect } from "react";

const BODY_CLASS = "app-modal-open";
const DATA_KEY = "modalOpenCount";

export default function useModalChrome(active = true) {
  useEffect(() => {
    if (!active || typeof document === "undefined") return undefined;

    const { body } = document;
    const { window } = document.defaultView || {};
    const currentCount = Number(body.dataset[DATA_KEY] || "0");
    const nextCount = currentCount + 1;
    let rafId = null;

    body.dataset[DATA_KEY] = String(nextCount);
    body.classList.add(BODY_CLASS);

    if (window?.requestAnimationFrame) {
      rafId = window.requestAnimationFrame(() => {
        document.querySelectorAll("[data-modal-scroll='true']").forEach((element) => {
          if ("scrollTop" in element) {
            element.scrollTop = 0;
          }
        });
      });
    }

    return () => {
      if (rafId !== null && window?.cancelAnimationFrame) {
        window.cancelAnimationFrame(rafId);
      }

      const remainingCount = Math.max(Number(body.dataset[DATA_KEY] || "1") - 1, 0);

      if (remainingCount === 0) {
        delete body.dataset[DATA_KEY];
        body.classList.remove(BODY_CLASS);
        return;
      }

      body.dataset[DATA_KEY] = String(remainingCount);
    };
  }, [active]);
}
