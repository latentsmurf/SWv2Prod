"use client";

import * as React from "react";
import {
  Film,
  Music,
  Type,
  Subtitles,
  ImageIcon,
  FolderOpen,
  Sticker,
  Layout,
  Settings,
  X,
} from "lucide-react";

import { OverlayType } from "../../types";
import { useEditorSidebar } from "../../contexts/sidebar-context";
import { useEditorContext } from "../../contexts/editor-context";

// Import overlay panels
import { VideoOverlayPanel } from "../overlay/video/video-overlay-panel";
import { TextOverlaysPanel } from "../overlay/text/text-overlays-panel";
import SoundsOverlayPanel from "../overlay/sounds/sounds-overlay-panel";
import { CaptionsOverlayPanel } from "../overlay/captions/captions-overlay-panel";
import { ImageOverlayPanel } from "../overlay/images/image-overlay-panel";
import { LocalMediaPanel } from "../overlay/local-media/local-media-panel";
import { StickersPanel } from "../overlay/stickers/stickers-panel";
import { TemplateOverlayPanel } from "../overlay/templates/template-overlay-panel";
import { SettingsPanel } from "../settings/settings-panel";

interface EditorToolbarProps {
  /** Array of overlay types to disable/hide from the toolbar */
  disabledPanels?: OverlayType[];
  /** Custom logo element */
  logo?: React.ReactNode;
}

const toolbarItems = [
  { type: OverlayType.VIDEO, icon: Film, label: "Video" },
  { type: OverlayType.TEXT, icon: Type, label: "Text" },
  { type: OverlayType.SOUND, icon: Music, label: "Audio" },
  { type: OverlayType.CAPTION, icon: Subtitles, label: "Captions" },
  { type: OverlayType.IMAGE, icon: ImageIcon, label: "Images" },
  { type: OverlayType.STICKER, icon: Sticker, label: "Stickers" },
  { type: OverlayType.LOCAL_DIR, icon: FolderOpen, label: "Uploads" },
  { type: OverlayType.TEMPLATE, icon: Layout, label: "Templates" },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  disabledPanels = [],
  logo,
}) => {
  const { activePanel, setActivePanel, isOpen, setIsOpen } = useEditorSidebar();
  const { setSelectedOverlayId } = useEditorContext();

  const filteredItems = toolbarItems.filter(
    (item) => !disabledPanels.includes(item.type)
  );

  const handleItemClick = (type: OverlayType) => {
    if (activePanel === type && isOpen) {
      setIsOpen(false);
    } else {
      setActivePanel(type);
      setIsOpen(true);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedOverlayId(null);
  };

  const renderActivePanel = () => {
    switch (activePanel) {
      case OverlayType.TEXT:
        return <TextOverlaysPanel />;
      case OverlayType.SOUND:
        return <SoundsOverlayPanel />;
      case OverlayType.VIDEO:
        return <VideoOverlayPanel />;
      case OverlayType.CAPTION:
        return <CaptionsOverlayPanel />;
      case OverlayType.IMAGE:
        return <ImageOverlayPanel />;
      case OverlayType.STICKER:
        return <StickersPanel />;
      case OverlayType.LOCAL_DIR:
        return <LocalMediaPanel />;
      case OverlayType.TEMPLATE:
        return <TemplateOverlayPanel />;
      case OverlayType.SETTINGS:
        return <SettingsPanel />;
      default:
        return null;
    }
  };

  const getPanelTitle = (type: OverlayType | null): string => {
    const item = toolbarItems.find((i) => i.type === type);
    if (item) return item.label;
    if (type === OverlayType.SETTINGS) return "Settings";
    return "";
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toolbar Header */}
      <div className="w-full bg-[#050505] border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center">
              {logo || <span className="text-primary font-bold text-sm">S</span>}
            </div>
            <span className="text-lg font-bold tracking-tight text-white">SceneWeaver</span>
          </div>

          {/* Tool Buttons */}
          <div className="flex items-center gap-1">
            {filteredItems.map((item) => (
              <button
                key={item.type}
                onClick={() => handleItemClick(item.type)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${
                    activePanel === item.type && isOpen
                      ? "bg-primary text-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }
                `}
              >
                <item.icon className="h-4 w-4" strokeWidth={1.5} />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
            
            {/* Settings Button */}
            <button
              onClick={() => handleItemClick(OverlayType.SETTINGS)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ml-2
                ${
                  activePanel === OverlayType.SETTINGS && isOpen
                    ? "bg-primary text-black"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }
              `}
            >
              <Settings className="h-4 w-4" strokeWidth={1.5} />
              <span className="hidden lg:inline">Settings</span>
            </button>
          </div>

          {/* Empty space for balance */}
          <div className="w-32" />
        </div>
      </div>

      {/* Expandable Panel */}
      {isOpen && activePanel && (
        <div className="w-full bg-[#0a0a0a] border-b border-white/5 animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
              <h3 className="text-sm font-medium text-zinc-300">
                {getPanelTitle(activePanel)}
              </h3>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {renderActivePanel()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

