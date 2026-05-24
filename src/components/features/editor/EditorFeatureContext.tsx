"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

interface EditorFeatureState {
  activeFeature: string | null;
  toggleFeature: (id: string) => void;
}

const EditorFeatureContext = createContext<EditorFeatureState>({
  activeFeature: null,
  toggleFeature: () => undefined,
});

export function EditorFeatureProvider({ children }: { children: React.ReactNode }) {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const toggleFeature = useCallback((id: string) => {
    setActiveFeature(prev => (prev === id ? null : id));
  }, []);

  return (
    <EditorFeatureContext.Provider value={{ activeFeature, toggleFeature }}>
      {children}
    </EditorFeatureContext.Provider>
  );
}

export function useEditorFeature() {
  return useContext(EditorFeatureContext);
}
