//CHANGE THIS LINE:
import React, { useRef, useCallback, useEffect } from 'react'; // <--- Added useEffect here

import Webcam from 'react-webcam';
import axios from 'axios';

const WebcamCapture = ({ sessionId, type }) => {
  const webcamRef = useRef(null);

  const capture = useCallback(async () => {
    if (!webcamRef.current) return; // Add safety check
    const imageSrc = webcamRef.current.getScreenshot();
    
    if (!imageSrc) return; // Add safety check if camera isn't ready

    // Convert base64 to blob
    const blob = await fetch(imageSrc).then(res => res.blob());
    
    const formData = new FormData();
    formData.append('file', blob, 'capture.jpg');
    formData.append('type', type);

    try {
      await axios.post(`http://localhost:8000/sessions/${sessionId}/analyze`, formData);
      console.log(`Captured & Sent (${type})`);
    } catch (err) {
      console.error("Upload failed", err);
    }
  }, [webcamRef, sessionId, type]);

  // Auto-capture every 3 seconds
  useEffect(() => {
    const interval = setInterval(capture, 3000);
    return () => clearInterval(interval);
  }, [capture]);

  return (
    <div className="border-4 border-gray-200 rounded-lg overflow-hidden relative bg-black">
        <div className="bg-gray-800 text-white p-2 text-center font-bold uppercase tracking-wider">
            {type} Camera
        </div>
        <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="w-full h-64 object-cover" 
        />
        <div className="absolute bottom-0 w-full p-1 bg-black/50 text-center text-xs text-white font-mono">
           <span className="text-red-500 font-bold animate-pulse">● REC</span>
        </div>
    </div>
  );
};

export default WebcamCapture;