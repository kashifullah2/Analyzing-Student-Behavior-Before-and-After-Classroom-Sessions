import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { API_URL } from '../config';
import { Camera, Upload, FileVideo, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const MediaCapture = ({ sessionId, type }) => {
  const [mode, setMode] = useState('webcam'); 
  const [status, setStatus] = useState(null); 
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const captureAndDetect = useCallback(async () => {
    if (mode !== 'webcam' || !webcamRef.current || !webcamRef.current.video.readyState === 4 || isProcessing) return;
    
    const video = webcamRef.current.video;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const formData = new FormData();
    const blob = await fetch(imageSrc).then(r => r.blob());
    formData.append('file', blob, 'capture.jpg');
    formData.append('type', type);

    try {
      setIsProcessing(true);
      const res = await axios.post(`${API_URL}/sessions/${sessionId}/analyze`, formData);
      
      if (canvasRef.current && video) {
        const ctx = canvasRef.current.getContext('2d');
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        ctx.clearRect(0, 0, video.videoWidth, video.videoHeight);

        res.data.results.forEach(det => {
          const [x, y, w, h] = det.bbox;
          ctx.strokeStyle = '#00FF00';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);
          ctx.fillStyle = '#00FF00';
          ctx.font = 'bold 16px Arial';
          ctx.fillText(det.emotion, x, y - 5);
        });
      }
    } catch (err) { console.error(err); } 
    finally { setIsProcessing(false); }
  }, [sessionId, type, isProcessing, mode]);

  useEffect(() => {
    const interval = mode === 'webcam' ? setInterval(captureAndDetect, 1500) : null;
    return () => clearInterval(interval);
  }, [captureAndDetect, mode]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const endpoint = file.type.startsWith('video/') ? 'analyze_video' : 'analyze';
    try {
      await axios.post(`${API_URL}/sessions/${sessionId}/${endpoint}`, formData);
      setStatus('success'); setTimeout(() => setStatus(null), 3000);
    } catch (err) { setStatus('error'); }
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden group">
      <div className="absolute top-3 right-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => setMode('webcam')} className="p-2 bg-black/50 text-white hover:bg-indigo-600 rounded"><Camera size={16}/></button>
        <button onClick={() => setMode('upload')} className="p-2 bg-black/50 text-white hover:bg-indigo-600 rounded"><Upload size={16}/></button>
      </div>

      {mode === 'webcam' && (
        <>
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        </>
      )}

      {mode === 'upload' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white">
            {status === 'uploading' ? <RefreshCw className="animate-spin text-indigo-500" size={32}/> :
             status === 'success' ? <CheckCircle className="text-green-500" size={32}/> :
             <label className="cursor-pointer flex flex-col items-center">
                 <FileVideo size={48} className="text-indigo-400 mb-2"/>
                 <span>Click to Upload</span>
                 <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
             </label>
            }
        </div>
      )}
    </div>
  );
};
export default MediaCapture;