import { useState, useEffect } from 'react';

export type NetworkType = 'slow-2g' | '2g' | '3g' | '4g';

interface NetworkState {
  effectiveType: NetworkType;
  saveData: boolean;
  downlink: number;
}

export const useNetwork = () => {
  const [network, setNetwork] = useState<NetworkState>({
    effectiveType: '4g',
    saveData: false,
    downlink: 10,
  });

  useEffect(() => {
    // @ts-ignore - navigator.connection is not standard but widely supported in Chrome/Edge
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      const updateNetworkInfo = () => {
        setNetwork({
          effectiveType: connection.effectiveType,
          saveData: connection.saveData,
          downlink: connection.downlink,
        });
      };

      connection.addEventListener('change', updateNetworkInfo);
      updateNetworkInfo();

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  const isSlow = network.effectiveType === 'slow-2g' || network.effectiveType === '2g' || network.effectiveType === '3g' || network.saveData;

  return { ...network, isSlow };
};
