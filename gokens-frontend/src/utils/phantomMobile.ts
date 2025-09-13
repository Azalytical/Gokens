export const connectPhantomMobile = () => {
    const isPhantomInstalled = window.solana && window.solana.isPhantom;
    
    if (!isPhantomInstalled) {
      // Если Phantom не установлен, открываем ссылку на установку
      window.open('https://phantom.app/', '_blank');
      return;
    }
    
    // Для мобильных устройств
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      const dappUrl = encodeURIComponent(window.location.href);
      const deepLink = `phantom://browse/${dappUrl}`;
      window.location.href = deepLink;
    }
  };