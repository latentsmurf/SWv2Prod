import React, { memo, useMemo } from "react";
import { StickerOverlay } from "../../../types";
import { templateMap } from "../../../templates/sticker-templates/sticker-helpers";


interface StickerLayerContentProps {
  overlay: StickerOverlay;
  isSelected: boolean;
  onUpdate?: (updates: Partial<StickerOverlay>) => void;
}

export const StickerLayerContent: React.FC<StickerLayerContentProps> = memo(
  ({ overlay, isSelected, onUpdate }) => {
    const template = templateMap[overlay.content];

    // Memoize props to prevent unnecessary re-renders
    const props = useMemo(() => {
      if (!template) return null;
      return {
        ...template.config.defaultProps,
        overlay,
        isSelected,
        ...(onUpdate && { onUpdate }),
      };
    }, [template, overlay, isSelected, onUpdate]);

    if (!template || !props) {
      console.warn(`No sticker template found for id: ${overlay.content}`);
      return null;
    }

    // Use the Component directly - parent is already memoized
    const { Component } = template;

    return <Component {...props} />;
  },
  (prevProps, nextProps) => {
    // Only re-render if these props change
    return (
      prevProps.overlay.content === nextProps.overlay.content &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.overlay.styles?.opacity === nextProps.overlay.styles?.opacity &&
      prevProps.overlay.rotation === nextProps.overlay.rotation &&
      prevProps.overlay.width === nextProps.overlay.width &&
      prevProps.overlay.height === nextProps.overlay.height
    );
  }
);

StickerLayerContent.displayName = "StickerLayerContent";