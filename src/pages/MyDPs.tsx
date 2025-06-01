import React from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';

export const MyDPs: React.FC = () => {
  return (
    <div className="space-y-8">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-primary">My Display Pictures</h1>
        <p className="text-secondary mt-2">All your generated event DPs in one place</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for when there are no DPs */}
        <motion.div
          className="col-span-full text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-secondary">You haven't created any DPs yet.</p>
        </motion.div>
      </div>
    </div>
  );
};