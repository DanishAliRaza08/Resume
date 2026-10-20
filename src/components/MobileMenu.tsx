"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Phone/tablet top bar: the Menu button slides the sidebar in; it closes on navigation, Escape,
// or a tap outside. Hidden on wide screens (see .topbar in globals.css).
export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("menu-open");
    };
  }, [open]);
  return (
    <>
      <header className="topbar">
        {children}
        <button className="btn menu-btn" type="button" aria-controls="sidebar" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? "✕ Close" : "☰ Menu"}
        </button>
      </header>
      {open && <div className="backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
    </>
  );
}
