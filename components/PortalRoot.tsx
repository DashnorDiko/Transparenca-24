"use client";

import * as React from "react";

const PORTAL_Z = 2147483647;

const PortalContext = React.createContext<HTMLDivElement | null>(null);

export function usePortalContainer(): HTMLDivElement | null {
  return React.useContext(PortalContext);
}

export function PortalRoot({ children }: { children: React.ReactNode }) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const ref = React.useCallback((el: HTMLDivElement | null) => {
    setContainer(el);
  }, []);

  return (
    <PortalContext.Provider value={container}>
      {children}
      <div
        ref={ref}
        id="radix-portal-root"
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: PORTAL_Z,
          pointerEvents: "none",
        }}
      />
    </PortalContext.Provider>
  );
}
