import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { API_URL } from '../config';
import {
  Camera,
  Upload,
  FileVideo,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

const MediaCapture = ({ sessionId, type }) => {
  const [mode, setMode] = useState('webcam'); // webcam | upload
  const [status, setStatus] = useState(null); // uploading | success | error
  const [isProcessing, setIsProcessing] = useState(false);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  /* =========================
     WEBCAM CAPTURE + DETECT
     ========================= */
  const captureAndDetect = useCallback(async () => {
    if (
      mode !== 'webcam' ||
      !webcamRef.current ||
      !webcamRef.current.video ||
      webcamRef.current.video.readyState !== 4 ||
      isProcessing
    ) return;

    const video = webcamRef.current.video;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      const blob = await fetch(imageSrc).then(r => r.blob());
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      formData.append('type', type);

      setIsProcessing(true);

      const res = await axios.post(
        `${API_URL}/sessions/${sessionId}/analyze`,
        formData
      );

      if (canvasRef.current && video) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Match displayed video dimensions
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;

        // Calculate scale factors
        const scaleX = video.offsetWidth / video.videoWidth;
        const scaleY = video.offsetHeight / video.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        res.data?.results?.forEach(det => {
          const [x, y, w, h] = det.bbox;

          // Scale coordinates to displayed size
          const scaledX = x * scaleX;
          const scaledY = y * scaleY;
          const scaledW = w * scaleX;
          const scaledH = h * scaleY;

          ctx.strokeStyle = '#00ff00';
          ctx.lineWidth = 2;
          ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);

          ctx.fillStyle = '#00ff00';
          ctx.font = '14px Arial';
          ctx.fillText(det.emotion, scaledX, scaledY - 6);
        });
      }
    } catch (err) {
      console.error('Detection error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [mode, sessionId, type, isProcessing]);

  useEffect(() => {
    if (mode !== 'webcam') return;
    const interval = setInterval(captureAndDetect, 1500);
    return () => clearInterval(interval);
  }, [captureAndDetect, mode]);

  /* =========================
     FILE UPLOAD
     ========================= */
  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('uploading');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const endpoint = file.type.startsWith('video/')
      ? 'analyze_video'
      : 'analyze';

    try {
      await axios.post(
        `${API_URL}/sessions/${sessionId}/${endpoint}`,
        formData
      );
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setStatus('error');
    }
  };

  /* =========================
     UI
     ========================= */
  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">

      {/* MODE SWITCH */}
      <div className="absolute top-3 right-3 z-30 flex gap-2">
        <button
          onClick={() => setMode('webcam')}
          className={`p-2 rounded-lg border border-white/20 backdrop-blur
            ${mode === 'webcam'
              ? 'bg-indigo-600 text-white'
              : 'bg-black/50 text-slate-400 hover:text-white'
            }`}
        >
          <Camera size={16} />
        </button>

        <button
          onClick={() => setMode('upload')}
          className={`p-2 rounded-lg border border-white/20 backdrop-blur
            ${mode === 'upload'
              ? 'bg-indigo-600 text-white'
              : 'bg-black/50 text-slate-400 hover:text-white'
            }`}
        >
          <Upload size={16} />
        </button>
      </div>

      {/* WEBCAM */}
      {mode === 'webcam' && (
        <div className="relative w-full h-full">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: 'user'
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-20 pointer-events-none"
          />
        </div>
      )}

      {/* UPLOAD */}
      {mode === 'upload' && (
        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white p-6 border-2 border-dashed border-slate-700 rounded-xl">

          {status === 'uploading' && (
            <div className="flex flex-col items-center animate-pulse">
              <RefreshCw size={32} className="animate-spin text-indigo-500 mb-2" />
              <p className="font-bold">Processing…</p>
              <p className="text-xs text-slate-400">Please wait</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center text-green-400">
              <CheckCircle size={48} />
              <p className="font-bold mt-2">Analysis Complete</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center text-red-400">
              <XCircle size={48} />
              <p className="font-bold mt-2">Upload Failed</p>
              <button
                onClick={() => setStatus(null)}
                className="text-xs underline mt-2"
              >
                Try Again
              </button>
            </div>
          )}

          {!status && (
            <label className="cursor-pointer flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-3 hover:bg-indigo-600 transition">
                <FileVideo size={32} className="text-indigo-400 hover:text-white" />
              </div>
              <span className="font-bold text-lg">Upload Media</span>
              <p className="text-xs text-slate-500 mt-1">
                MP4, AVI, JPG, PNG (max 50MB)
              </p>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaCapture;