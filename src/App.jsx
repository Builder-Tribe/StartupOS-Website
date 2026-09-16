import React, { useState } from 'react';
import MarketingLander from './MarketingLander';
import FounderConnectModal from './FounderConnectModal';

export default function App() {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [modalIntent, setModalIntent] = useState('demo');

  const handleEnterPortal = (targetTab = 'launchpad') => {
    setModalIntent(targetTab === 'academy' ? 'academy' : 'demo');
    setIsConnectModalOpen(true);
  };

  const handleOpenAuthModal = () => {
    setModalIntent('contact');
    setIsConnectModalOpen(true);
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
