import { useState, useEffect, useRef } from "react";
import { Overlay, AspectRatio } from "../types";
import { hasAutosave, clearAutosave } from "../utils/general/indexdb-helper";
import { DEFAULT_OVERLAYS } from "@/app/constants";

/**
 * Custom hook to load project state (overlays) from API via URL parameter.
 */
export function useProjectStateFromUrl(
  paramName: string = "projectId",
  projectId: string = "TestComponent"
): {
  overlays: Overlay[];
  aspectRatio: AspectRatio | null;
  isLoading: boolean;
  showModal: boolean;
  onConfirmLoad: () => void;
  onCancelLoad: () => void;
} {
  const fallbackOverlays = DEFAULT_OVERLAYS;
  const [overlays, setOverlays] = useState<Overlay[]>(fallbackOverlays);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Store project data when we need user confirmation
  const pendingProjectDataRef = useRef<{ overlays: Overlay[]; aspectRatio?: AspectRatio } | null>(null);

  // Use ref to avoid adding fallbackOverlays to dependency array
  const fallbackOverlaysRef = useRef(fallbackOverlays);

  // Update ref when fallbackOverlays change
  useEffect(() => {
    fallbackOverlaysRef.current = fallbackOverlays;
  }, [fallbackOverlays]);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") {
      setIsLoading(false);
      return;
    }

    // Check if project loading is disabled via environment variable
    const isDisabled =
      process.env.NEXT_PUBLIC_DISABLE_PROJECT_LOADING === "true";

    if (isDisabled) {
      console.log(
        "[useProjectStateFromUrl] Project loading is disabled via environment variable"
      );
      setOverlays(fallbackOverlaysRef.current);
      setIsLoading(false);
      return;
    }

    const loadProjectState = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const paramValue = searchParams.get(paramName);

        // No parameter in URL - use fallback
        if (!paramValue) {
          console.log(
            `[useProjectStateFromUrl] No '${paramName}' parameter found, using fallback overlays`
          );
          setOverlays(fallbackOverlaysRef.current);
          setIsLoading(false);
          return;
        }

        console.log(
          `[useProjectStateFromUrl] Fetching project state '${paramValue}' from API...`
        );

        // Fetch project state from API
        const response = await fetch(`/api/projects?id=${paramValue}`);

        if (!response.ok) {
          console.warn(
            `[useProjectStateFromUrl] API returned ${response.status} for parameter '${paramValue}'`
          );
          setOverlays(fallbackOverlaysRef.current);
          setIsLoading(false);
          return;
        }

        const projectData = await response.json();

        // Validate project structure
        if (!projectData.overlays || !Array.isArray(projectData.overlays)) {
          console.error(
            `[useProjectStateFromUrl] Project '${paramValue}' does not have a valid overlays array`,
            projectData
          );
          setOverlays(fallbackOverlaysRef.current);
          setIsLoading(false);
          return;
        }

        console.log(
          `[useProjectStateFromUrl] Successfully fetched ${projectData.overlays.length} overlays from project '${paramValue}'`
        );

        // Extract aspect ratio if provided (API uses snake_case, convert to camelCase)
        const projectAspectRatio: AspectRatio | undefined = projectData.aspect_ratio || projectData.aspectRatio;
        if (projectAspectRatio) {
          console.log(
            `[useProjectStateFromUrl] Project aspect ratio: ${projectAspectRatio}`
          );
        }

        // Check if there's existing autosave data
        const hasExistingAutosave = await hasAutosave(projectId);

        if (hasExistingAutosave) {
          // Store project data and show modal for user decision
          console.log(
            "[useProjectStateFromUrl] Existing autosave found, showing confirmation modal"
          );
          pendingProjectDataRef.current = {
            overlays: projectData.overlays,
            aspectRatio: projectAspectRatio
          };
          setShowModal(true);
          setIsLoading(false);
        } else {
          // No autosave conflict - load project directly
          console.log(
            "[useProjectStateFromUrl] No autosave conflict, loading project"
          );
          setOverlays(projectData.overlays);
          if (projectAspectRatio) {
            setAspectRatio(projectAspectRatio);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error(
          `[useProjectStateFromUrl] Failed to load project:`,
          error
        );
        setOverlays(fallbackOverlaysRef.current);
        setIsLoading(false);
      }
    };

    loadProjectState();
  }, [paramName, projectId]);

  // Handler for when user confirms they want to load the project
  const onConfirmLoad = async () => {
    if (pendingProjectDataRef.current) {
      console.log(
        "[useProjectStateFromUrl] User confirmed load, clearing autosave and loading project"
      );
      await clearAutosave(projectId);
      setOverlays(pendingProjectDataRef.current.overlays);
      if (pendingProjectDataRef.current.aspectRatio) {
        setAspectRatio(pendingProjectDataRef.current.aspectRatio);
      }
      pendingProjectDataRef.current = null;
    }
    setShowModal(false);
  };

  // Handler for when user cancels and wants to keep their work
  const onCancelLoad = () => {
    console.log(
      "[useProjectStateFromUrl] User chose to keep existing work"
    );
    setOverlays(fallbackOverlaysRef.current);
    pendingProjectDataRef.current = null;
    setShowModal(false);
  };

  return {
    overlays,
    aspectRatio,
    isLoading,
    showModal,
    onConfirmLoad,
    onCancelLoad,
  };
}
