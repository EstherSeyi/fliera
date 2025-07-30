import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { CreditDetailsDialog } from "../components/CreditDetailsDialog";
import { CreditBalanceCard } from "../components/dashboard/CreditBalanceCard";
import { RecentEventsSection } from "../components/dashboard/RecentEventsSection";
import { StatCards } from "../components/dashboard/StatCard";

export const Dashboard: React.FC = () => {
  const [showCreditDialog, setShowCreditDialog] = useState(false);

  return (
    <div className="space-y-8">
      <motion.div
        className="flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-4xl font-bold text-primary">Dashboard</h1>
          <p className="text-secondary mt-2">
            Welcome back! Here's an overview of your events and activity.
          </p>
        </div>
        <Link
          to="/admin/create"
          className="flex items-center px-6 py-3 bg-thistle text-primary rounded-lg hover:bg-thistle/90 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Event
        </Link>
      </motion.div>

      <CreditBalanceCard onClick={() => setShowCreditDialog(true)} />
      <StatCards />
      <RecentEventsSection />

      <CreditDetailsDialog
        isOpen={showCreditDialog}
        onClose={() => setShowCreditDialog(false)}
        creditInfo={null} // pass if needed
      />
    </div>
  );
};
