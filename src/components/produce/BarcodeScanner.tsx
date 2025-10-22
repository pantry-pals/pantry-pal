'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Result } from '@zxing/library';
import { Button } from 'react-bootstrap';

interface BarcodeScannerProps {
  onDetected: (code: string) => void;
  onClose: () => void;
}

const BarcodeScanner = ({ onDetected, onClose }: BarcodeScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    let isMounted = true;
    let scannerControls: IScannerControls | null = null;

    const startScan = async () => {
      try {
        const devices = await BrowserMultiFormatReader.listVideoInputDevices();
        if (!devices.length) throw new Error('No camera found.');

        const firstDeviceId = devices[0].deviceId;

        // Start scanning and store controls
        scannerControls = await reader.decodeFromVideoDevice(
          firstDeviceId,
          videoRef.current!,
          (result: Result | undefined) => {
            if (result && isMounted) {
              onDetected(result.getText());
              scannerControls?.stop(); // stop scanning
              onClose();
            }
          },
        );

        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Error accessing camera');
        setLoading(false);
      }
    };

    startScan();

    return () => {
      isMounted = false;
      scannerControls?.stop(); // cleanup on unmount
    };
  }, [onDetected, onClose]);

  return (
    <div className="d-flex flex-column align-items-center p-3 bg-dark text-white rounded">
      <h5>Scan a Barcode</h5>
      {error && <p className="text-danger">{error}</p>}
      {loading && <p>Initializing camera...</p>}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <video
        ref={videoRef}
        style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
      />
      <Button className="mt-3" variant="secondary" onClick={onClose}>
        Close
      </Button>
    </div>
  );
};

export default BarcodeScanner;
