// src/components/RouteLoader.js
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Loading from './Loading';

function RouteLoader() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const MIN_DURATION = 500;
    const start = Date.now();

    setIsVisible(true); // show spinner immediately

    const cleanup = () => {
      const elapsed = Date.now() - start;
      const remaining = MIN_DURATION - elapsed;

      setTimeout(() => {
        setIsVisible(false); // hide spinner after minimum time
      }, remaining > 0 ? remaining : 0);
    };

    cleanup();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  return isVisible ? <Loading /> : null;
}

export default RouteLoader;
