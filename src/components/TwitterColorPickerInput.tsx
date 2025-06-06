import React, { useState, useRef, useEffect } from "react";
import { TwitterPicker, ColorResult } from "react-color";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TwitterColorPickerInputProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  disabled?: boolean;
}

const DEFAULT_COLORS = [
  "#FF6900",
  "#FCB900",
  "#7BDCB5",
  "#00D084",
  "#8ED1FC",
  "#0693E3",
  "#ABB8C3",
  "#EB144C",
  "#F78DA7",
  "#9900EF",
  "#000000",
  "#FFFFFF",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
];

export const TwitterColorPickerInput: React.FC<TwitterColorPickerInputProps> = ({
  value,
  onChange,
  label,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorChange = (color: ColorResult) => {
    onChange(color.hex);
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm text-secondary font-medium">
          {label}
        </label>
      )}
      
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full flex items-center justify-between px-3 py-2 border rounded-lg transition-all
            ${disabled 
              ? "bg-gray-100 cursor-not-allowed opacity-50" 
              : "bg-white hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary"
            }
            ${isOpen ? "border-primary ring-1 ring-primary" : "border-primary/20"}
          `}
        >
          <div className="flex items-center space-x-3">
            <div
              className="w-6 h-6 rounded border border-gray-300 shadow-sm"
              style={{ backgroundColor: value }}
            />
            <span className="text-sm text-gray-700 font-mono uppercase">
              {value}
            </span>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`} 
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-3"
            >
              <TwitterPicker
                color={value}
                onChange={handleColorChange}
                colors={DEFAULT_COLORS}
                triangle="hide"
                styles={{
                  default: {
                    card: {
                      boxShadow: "none",
                      border: "none",
                      borderRadius: "0",
                      background: "transparent",
                    },
                    body: {
                      padding: "0",
                    },
                    label: {
                      fontSize: "12px",
                      color: "#6B7280",
                      fontFamily: '"Open Sans", sans-serif',
                    },
                    input: {
                      fontSize: "12px",
                      color: "#374151",
                      border: "1px solid #D1D5DB",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      fontFamily: '"Open Sans", sans-serif',
                    },
                    swatch: {
                      borderRadius: "6px",
                      border: "1px solid #E5E7EB",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    },
                  },
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};