import React, { useState } from 'react';
import MarketingLander from './MarketingLander';
import FounderConnectModal from './FounderConnectModal';
import { appUrl } from './config';

export default function App() {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState('demo');

  // Detect public showcase (GitHub Pages or explicit showcase preview)
  const isShowcase = typeof window !== 'undefined' && (
    window.location.hostname.includes('github.io') ||
    window.location.search.includes('mode=showcase')
  );

  const handleEnterPortal = (targetTab = 'launchpad') => {
    if (isShowcase) {
      setModalIntent(targetTab === 'academy' ? 'academy' : 'demo');
      setIsConnectModalOpen(true);
    } else {
      // Directs out to the full StartupOS builder portal workspace
      window.location.href = appUrl(`?view=portal&tab=${targetTab}`);
    }
  };

  const handleOpenAuthModal = () => {
    if (isShowcase) {
      setModalIntent('contact');
      setIsConnectModalOpen(true);
    } else {
      // Directs out to the portal auth modal
      window.location.href = appUrl('?view=portal&auth=login');
    }
  };

  return (
    <>
      <MarketingLander
        onEnterPortal={handleEnterPortal}
        onOpenAuthModal={handleOpenAuthModal}
      />
      <FounderConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        intent={modalIntent}
      />
    </>
  );
}
