import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody } from "./ui/dialog";
import type {
  FlierTemplate,
  TemplateInputValues,
  ImagePlaceholderZone,
  TextPlaceholderZone,
  PaginatedTemplatesResult,
  TemplateFilterType,
} from "../types";

import { TemplatePreviewStep } from "./template/TemplatePreviewStep";
import { TemplateSelectionStep } from "./template/TemplateSelectionStep";
import { TemplateInputStep } from "./template/TemplateInputStep";

interface FlierTemplateSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelected: (
    generatedImageUrl: string,
    imagePlaceholders: ImagePlaceholderZone[],
    textPlaceholders: TextPlaceholderZone[]
  ) => void;
}

export type ModalStep = "selection" | "input" | "preview";

export const FlierTemplateSelectionModal: React.FC<
  FlierTemplateSelectionModalProps
> = ({ isOpen, onClose, onTemplateSelected }) => {
  const [templates, setTemplates] = useState<FlierTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<ModalStep>("selection");
  const [selectedTemplate, setSelectedTemplate] =
    useState<FlierTemplate | null>(null);
  const [inputValues, setInputValues] = useState<TemplateInputValues>({});
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );

  // Konva stage states
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [imageScale, setImageScale] = useState(1);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(
    null
  );
  const [userImages, setUserImages] = useState<{
    [key: string]: HTMLImageElement;
  }>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    } else {
      // Reset state when modal closes
      setCurrentStep("selection");
      setSelectedTemplate(null);
      setInputValues({});
      setGeneratedImageUrl(null);
      setTemplateImage(null);
      setUserImages({});
    }
  }, [isOpen]);

  const fetchTemplates = useCallback(
    async (
      page: number = 1,
      limit: number = 12,
      filters: { filterType: TemplateFilterType } = { filterType: "all" }
    ): Promise<PaginatedTemplatesResult> => {
      try {
        setLoading(true);
        setError(null);

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) {
          throw new Error("You must be logged in to view templates");
        }

        // Calculate offset for pagination
        const offset = (page - 1) * limit;

        // Build the base query
        let countQuery = supabase
          .from("flier_templates")
          .select("*", { count: "exact", head: true });

        let dataQuery = supabase.from("flier_templates").select("*");

        // Apply filter type
        if (filters.filterType === "my") {
          countQuery = countQuery.eq("user_id", session.user.id);
          dataQuery = dataQuery.eq("user_id", session.user.id);
        } else if (filters.filterType === "others") {
          countQuery = countQuery.neq("user_id", session.user.id);
          dataQuery = dataQuery.neq("user_id", session.user.id);
        }
        // For "all", no additional filter is needed

        // Apply search filter
        if (filters.searchTerm) {
          const searchFilter = `%${filters.searchTerm}%`;
          countQuery = countQuery.ilike("title", searchFilter);
          dataQuery = dataQuery.ilike("title", searchFilter);
        }

        // Apply date filters
        if (filters.dateFrom) {
          countQuery = countQuery.gte("created_at", filters.dateFrom);
          dataQuery = dataQuery.gte("created_at", filters.dateFrom);
        }

        if (filters.dateTo) {
          // Add 23:59:59 to include the entire day
          const endOfDay = new Date(filters.dateTo);
          endOfDay.setHours(23, 59, 59, 999);
          const dateToString = endOfDay.toISOString();

          countQuery = countQuery.lte("created_at", dateToString);
          dataQuery = dataQuery.lte("created_at", dateToString);
        }

        // Execute count query
        const { count, error: countError } = await countQuery;
        if (countError) throw countError;

        // Execute data query with pagination and ordering
        const { data, error: fetchError } = await dataQuery
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        if (fetchError) throw fetchError;

        // Update templates state with the fetched data
        setTemplates(data || []);

        return {
          templates: data || [],
          totalCount: count || 0,
        };
      } catch (err) {
        const error = err as Error;
        setError(error?.message || "Failed to load templates");
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setTemplates]
  );

  const loadTemplateImage = useCallback(async () => {
    if (!selectedTemplate || !containerRef.current) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = selectedTemplate.template_image_url;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      setTemplateImage(img);

      // Calculate scale and stage size
      const containerWidth = containerRef.current.offsetWidth;
      const scale = Math.min(containerWidth / img.width, 400 / img.height);
      setImageScale(scale);

      setStageSize({
        width: img.width * scale,
        height: img.height * scale,
      });
    } catch (err) {
      console.error("Error loading template image:", err);
      setError("Failed to load template image");
    }
  }, [selectedTemplate]);

  const loadUserImages = useCallback(async () => {
    if (!selectedTemplate) return;

    const newUserImages: { [key: string]: HTMLImageElement } = {};

    for (const placeholder of selectedTemplate.template_placeholders) {
      if (
        placeholder.type === "image" &&
        inputValues[placeholder.id] instanceof File
      ) {
        const file = inputValues[placeholder.id] as File;
        const imageUrl = URL.createObjectURL(file);

        try {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = imageUrl;

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          newUserImages[placeholder.id] = img;
        } catch (err) {
          console.error("Error loading user image:", err);
        }
      }
    }

    setUserImages(newUserImages);
  }, [inputValues, selectedTemplate]);

  useEffect(() => {
    if (selectedTemplate && containerRef.current) {
      loadTemplateImage();
    }
  }, [loadTemplateImage, selectedTemplate]);

  useEffect(() => {
    // Load user images when input values change
    if (selectedTemplate) {
      loadUserImages();
    }
  }, [inputValues, loadUserImages, selectedTemplate]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Choose a Flier Template</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <AnimatePresence mode="wait">
            {currentStep === "selection" && (
              <TemplateSelectionStep
                loading={loading}
                error={error}
                fetchTemplates={fetchTemplates}
                setSelectedTemplate={setSelectedTemplate}
                setInputValues={setInputValues}
                templates={templates}
                setCurrentStep={setCurrentStep}
              />
            )}
            {currentStep === "input" && (
              <TemplateInputStep
                setCurrentStep={setCurrentStep}
                selectedTemplate={selectedTemplate}
                inputValues={inputValues}
                containerRef={containerRef}
                templateImage={templateImage}
                stageSize={stageSize}
                userImages={userImages}
                imageScale={imageScale}
                setInputValues={setInputValues}
                setGeneratedImageUrl={setGeneratedImageUrl}
                setError={setError}
              />
            )}
            {currentStep === "preview" && (
              <TemplatePreviewStep
                setCurrentStep={setCurrentStep}
                generatedImageUrl={generatedImageUrl}
                selectedTemplate={selectedTemplate}
                onTemplateSelected={onTemplateSelected}
                onClose={onClose}
              />
            )}
          </AnimatePresence>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};