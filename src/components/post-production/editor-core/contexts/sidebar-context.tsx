import React, { createContext, useContext, useState } from "react";
import { OverlayType } from "../types";

// Define the shape of our context data
type EditorSidebarContextType = {
  activePanel: OverlayType; // Stores the currently active panel name
  setActivePanel: (panel: OverlayType) => void; // Function to update the active panel
  isOpen: boolean; // Whether the panel is open
  setIsOpen: (open: boolean) => void;
};

// Create the context with undefined as initial value
const EditorSidebarContext = createContext<EditorSidebarContextType | undefined>(undefined);

// Custom hook to consume the editor sidebar context
export const useEditorSidebar = () => {
  const context = useContext(EditorSidebarContext);

  if (!context) {
    throw new Error("useEditorSidebar must be used within a SidebarProvider");
  }

  return context;
};

// Provider component that wraps parts of the app that need access to sidebar state
export const SidebarProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [activePanel, setActivePanel] = useState<OverlayType>(OverlayType.VIDEO);
  const [isOpen, setIsOpen] = useState(false);

  const value = {
    activePanel,
    setActivePanel,
    isOpen,
    setIsOpen,
  };

  return (
    <EditorSidebarContext.Provider value={value}>{children}</EditorSidebarContext.Provider>
  );
}; 