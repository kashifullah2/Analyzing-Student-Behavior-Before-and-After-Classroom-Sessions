import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Camera, Upload, CheckCircle, RefreshCw, FileVideo } from 'lucide-react';

const MediaCapture = ({ sessionId, type }) => {
  const [mode, setMode] = useState('webcam');
  const [status, setStatus] = useState(null); // null, 'uploading', 'success', 'error'
  const webcamRef = useRef(null);

  // Webcam Logic
  const capture = useCallback(async () => {
    if (mode !== 'webcam' || !webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await fetch(imageSrc).then(res => res.blob());
    const formData = new FormData();
    formData.append('file', blob, 'capture.jpg');
    formData.append('type', type);

    try {
      await axios.post(`http://localhost:8000/sessions/${sessionId}/analyze`, formData);
    } catch (err) { console.error("Capture failed"); }
  }, [webcamRef, sessionId, type, mode]);

  useEffect(() => {
    const interval = mode === 'webcam' ? setInterval(capture, 3000) : null;
    return () => clearInterval(interval);
  }, [capture, mode]);

  // Upload Logic
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const endpoint = file.type.startsWith('video/') ? 'analyze_video' : 'analyze';
    
    try {
      await axios.post(`http://localhost:8000/sessions/${sessionId}/${endpoint}`, formData);
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) { setStatus('error'); }
  };

  return (
    <div className="w-full h-full relative group bg-white/10">
      
      {/* Floating Mode Switcher */}
      <div className="absolute top-4 right-4 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
            onClick={() => setMode('webcam')} 
            className={`p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all shadow-lg ${mode === 'webcam' ? 'bg-indigo-600 text-white' : 'bg-black/60 text-slate-400 hover:text-white'}`}
            title="Live Camera"
        >
          <Camera size={16} />
        </button>
        <button 
            onClick={() => setMode('upload')} 
            className={`p-2 rounded-lg backdrop-blur-md border border-white/10 transition-all shadow-lg ${mode === 'upload' ? 'bg-indigo-600 text-white' : 'bg-black/60 text-slate-400 hover:text-white'}`}
            title="Upload File"
        >
          <Upload size={16} />
        </button>
      </div>

      {/* View Content */}
      {mode === 'webcam' ? (
        <Webcam 
            audio={false} 
            ref={webcamRef} 
            screenshotFormat="image/jpeg" 
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" 
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
          {status === 'success' ? (
            <div className="text-emerald-400 animate-fade-in-up flex flex-col items-center">
                <CheckCircle size={48} className="drop-shadow-lg" />
                <p className="mt-3 font-bold text-lg text-white">Analysis Complete</p>
            </div>
          ) : (
            <label className="cursor-pointer group-hover:scale-105 transition-transform duration-300">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                {status === 'uploading' ? <RefreshCw className="animate-spin" size={32}/> : <FileVideo size={32} />}
              </div>
              <span className="text-white font-bold text-lg block">Upload Media</span>
              <p className="text-sm text-slate-400 mt-1">MP4 Video or JPG/PNG Image</p>
              <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaCapture;