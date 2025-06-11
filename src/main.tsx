import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { seedTemplates, shouldSeedTemplates } from "./utils/seedTemplates";

import "./index.css";

// Seed templates if not already done
const initializeApp = async () => {
  if (shouldSeedTemplates()) {
    try {
      await seedTemplates();
    } catch (error) {
      console.error('Failed to seed templates:', error);
      // Continue with app initialization even if seeding fails
    }
  }

  // Render the app
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
};

// Initialize the app
initializeApp();