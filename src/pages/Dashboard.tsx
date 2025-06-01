import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Image as ImageIcon } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Events', value: '12', icon: Calendar },
    { label: 'Total Participants', value: '248', icon: Users },
    { label: 'DPs Generated', value: '186', icon: ImageIcon },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary">{label}</p>
                <p className="text-3xl font-bold text-primary mt-2">{value}</p>
              </div>
              <Icon className="w-8 h-8 text-accent" />
            </div>
          </div>
        ))}
      </motion.div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-primary mb-6">Recent Events</h2>
        <div className="space-y-4">
          {/* Placeholder for recent events list */}
          <p className="text-secondary">No events created yet.</p>
        </div>
      </div>
    </div>
  );
};