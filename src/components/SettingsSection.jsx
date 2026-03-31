import React from 'react';
import SettingsCard from './SettingsCard';

const SettingsSection = ({ title, description, children }) => (
  <section className="settings-section mb-12 last:mb-0">
    <h2 className="settings-section-title mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">{title}</h2>
    {description && <p className="mb-6 max-w-2xl">{description}</p>}
    <div className="settings-grid">
      {children}
    </div>
  </section>
);

export default SettingsSection;

