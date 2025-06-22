import { Eye, Trash2, Loader2, Calendar, ImageIcon, Type } from "lucide-react";
import { Template } from "../../../hooks/useTemplates";

interface Props {
  template: Template;
  onPreview: (template: Template) => void;
  onDelete: (templateID: string) => void;
  deleting: string;
}

export const TemplateCard = ({
  template,
  onPreview,
  onDelete,
  deleting,
}: Props) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="group bg-neutral border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
      <div className="aspect-video bg-muted relative overflow-hidden">
        {template.template_image_url ? (
          <img
            src={template.template_image_url}
            alt={template.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-secondary" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-3">
          <button
            onClick={() => onPreview(template)}
            className="bg-neutral text-primary p-2 rounded-lg hover:bg-muted"
          >
            <Eye className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(template.id)}
            disabled={deleting === template.id}
            className="bg-imperialred text-neutral p-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {deleting === template.id ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-primary mb-2 truncate">
          {template.title}
        </h3>
        <div className="flex items-center justify-between text-sm text-secondary mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(template.created_at)}</span>
          </div>
          {template.created_by && (
            <span className="text-xs bg-muted px-2 py-1 rounded">
              by {template.created_by}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-secondary">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <ImageIcon className="w-3 h-3" />
              <span>{template.user_image_placeholders.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Type className="w-3 h-3" />
              <span>{template.user_text_placeholders.length}</span>
            </div>
          </div>
          <span className="text-accent font-medium">
            {template.template_placeholders.length} elements
          </span>
        </div>
      </div>
    </div>
  );
};
