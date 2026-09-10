import React from 'react';
import MarketingLander from './MarketingLander';
import { appUrl } from './config';

export default function App() {
  const handleEnterPortal = (targetTab = 'launchpad') => {
    // Directs out to the full StartupOS builder portal workspace
    window.location.href = appUrl(`?view=portal&tab=${targetTab}`);
  };

  const handleOpenAuthModal = () => {
    // Directs out to the portal auth modal
    window.location.href = appUrl('?view=portal&auth=login');
  };

  return (
    <MarketingLander
      onEnterPortal={handleEnterPortal}
      onOpenAuthModal={handleOpenAuthModal}
    />
  );
}
