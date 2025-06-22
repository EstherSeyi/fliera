import { motion } from "framer-motion";
import { TemplateList } from "./TemplateList";
import { List, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { CreateTemplate } from "./CreateTemplate";

export const Templates = () => {
  const [activeTab, setActiveTab] = useState<"list" | "create">("list");

  // Read tab from URL query parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    if (tabParam === "create" || tabParam === "list") {
      setActiveTab(tabParam);
    }
  }, []);

  // Update URL when tab changes
  const handleTabChange = (tab: "list" | "create") => {
    setActiveTab(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.pushState({}, "", url.toString());
  };

  const renderView = () => {
    switch (activeTab) {
      case "create":
        return <CreateTemplate />;
      case "list":
        return <TemplateList />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {activeTab === "list" ? (
          <div>
            <h1 className="text-4xl font-bold text-primary">Templates</h1>
            <p className="text-secondary mt-2">
              Find the perfect template for your project (15 total)
            </p>
          </div>
        ) : activeTab === "create" ? (
          <div>
            <h1 className="text-4xl font-bold text-primary">
              Create New Template
            </h1>
            <p className="text-secondary mt-2">
              Design beautiful templates with our intuitive editor
            </p>
          </div>
        ) : null}

        <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 p-1">
          <button
            onClick={() => handleTabChange("list")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === "list"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">View Templates</span>
          </button>
          <button
            onClick={() => handleTabChange("create")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === "create"
                ? "bg-primary text-white shadow-sm"
                : "text-gray-600 hover:text-primary hover:bg-gray-50"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create New</span>
          </button>
        </div>
      </motion.div>

      {renderView()}
    </div>
  );
};