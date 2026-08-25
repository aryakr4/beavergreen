"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const ResetContext = createContext<(() => void) | null>(null);

export function ResetBoundary({ children }: { children: ReactNode }) {
  const [key, setKey] = useState(0);

  return (
    <ResetContext.Provider value={() => setKey((k) => k + 1)}>
      <div key={key}>{children}</div>
    </ResetContext.Provider>
  );
}

export function useResetHome(): (() => void) | null {
  return useContext(ResetContext);
}
