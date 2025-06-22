import { Plus, ImageIcon, Type, Calendar, Download } from "lucide-react";
import { Template } from "../../../hooks/useTemplates";
import { useToast } from "../../../context/ToastContext";

interface Placeholder {
  id: string;
  labelText: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
}

interface Props {
  template: Template;
  onClose: () => void;
  currentUserId: string;
}

export const TemplatePreviewModal = ({ template, onClose, currentUserId }: Props) => {
  const { showToast } = useToast();
  const textPlaceholders = template.template_placeholders.filter(
    (p) => p.type === "text"
  );

  const isOwner = template.user_id === currentUserId;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = async () => {
    try {
      // Fetch the image as blob
      const response = await fetch(template.template_image_url);
      if (!response.ok) {
        throw new Error("Failed to fetch template image");
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `${template.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_template.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up blob URL
      URL.revokeObjectURL(url);

      showToast("Template downloaded successfully!", "success");
    } catch (error) {
      console.error("Error downloading template:", error);
      showToast("Failed to download template", "error");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-primary">
                {template.title}
              </h3>
              {template.created_by && (
                <p className="text-secondary">
                  Created by {isOwner ? "you" : template.created_by}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary p-2"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>

          {/* Creation Date */}
          <div className="mb-6 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="font-medium">Created on:</span>
              <span className="ml-2">{formatDateTime(template.created_at)}</span>
            </div>
          </div>

          {/* Image and Download Button */}
          {template.template_image_url && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-primary">Template Image</h4>
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </button>
              </div>
              <img
                src={template.template_image_url}
                alt={template.title}
                className="w-full max-h-96 object-contain rounded-lg border border-border"
              />
            </div>
          )}

          {/* Overview Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              icon={<ImageIcon className="w-5 h-5" />}
              title="User Image Areas"
              count={template.user_image_placeholders.length}
              description="Areas where users can upload their images"
            />
            <StatCard
              icon={<Type className="w-5 h-5" />}
              title="User Text Areas"
              count={template.user_text_placeholders.length}
              description="Areas where users can input their text"
            />
            <StatCard
              icon={<Plus className="w-5 h-5" />}
              title="Template Elements"
              count={template.template_placeholders.length}
              description="Fixed elements that appear on every template"
            />
          </div>

          {/* Text Placeholder Lists */}
          <div className="mt-6 space-y-6">
            {template.user_text_placeholders.length > 0 && (
              <PlaceholderList
                title="User Text Placeholders"
                items={template.user_text_placeholders}
              />
            )}
            {textPlaceholders.length > 0 && (
              <PlaceholderList
                title="Template Text Elements"
                items={textPlaceholders}
              />
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-primary text-neutral px-6 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponent: Stat Card
const StatCard = ({
  icon,
  title,
  count,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  description: string;
}) => (
  <div className="bg-muted p-4 rounded-lg">
    <h4 className="font-semibold text-primary mb-3 flex items-center space-x-2">
      {icon}
      <span>{title}</span>
    </h4>
    <p className="text-2xl font-bold text-accent mb-2">{count}</p>
    <p className="text-sm text-secondary">{description}</p>
  </div>
);

// Subcomponent: Placeholder List
const PlaceholderList = ({
  title,
  items,
}: {
  title: string;
  items: Placeholder[];
}) => (
  <div>
    <h4 className="font-semibold text-primary mb-2">{title}</h4>
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="bg-muted p-3 rounded text-sm">
          <div className="font-medium text-primary">{item.labelText}</div>
          <div className="text-secondary">
            {item.text && <>"{item.text}" • </>}
            {item.fontSize && `${item.fontSize}px`} {item.fontFamily}
          </div>
        </div>
      ))}
    </div>
  </div>
);