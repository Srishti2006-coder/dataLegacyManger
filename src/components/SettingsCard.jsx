import React from 'react';

const SettingsCard = ({ title, description, children }) => (
  <div className="settings-card p-6 rounded-xl border shadow-md hover:shadow-lg transition-all duration-300 dark:border-slate-700 dark:bg-slate-800">
    <h4 className="settings-card-title">{title}</h4>
    {description && <p className="settings-card-desc text-sm mb-4">{description}</p>}
    <div className="space-y-3">{children}</div>
  </div>
);

export default SettingsCard;

