import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '../api';
import { Camera, Upload, FileVideo, RefreshCw, CheckCircle, XCircle, Trash2 } from 'lucide-react';

const MediaCapture = ({ sessionId, type }) => {
  const [mode, setMode] = useState('webcam');
  const [status, setStatus] = useState(null);
  const [uploadResults, setUploadResults] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const uploadCanvasRef = useRef(null);
  const uploadImgRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper to draw boxes on a canvas
  const drawBoxes = (ctx, results, width, height, isMirrored = false) => {
    ctx.clearRect(0, 0, width, height);
    if (!results || results.length === 0) return;

    results.forEach(det => {
      let bbox = det.bbox;
      if (typeof bbox === 'string') {
        try { bbox = JSON.parse(bbox); } catch (e) { bbox = []; }
      }

      if (Array.isArray(bbox) && bbox.length === 4) {
        const [x, y, w, h] = bbox;
        const posX = isMirrored ? width - x - w : x;

        ctx.strokeStyle = '#22c55e'; // emerald-500
        ctx.lineWidth = 3;
        ctx.strokeRect(posX, y, w, h);

        ctx.fillStyle = 'rgba(34, 197, 94, 0.9)';
        const text = det.emotion;
        ctx.font = 'bold 14px Inter, sans-serif';
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(posX, y - 24, textWidth + 12, 24);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(text, posX + 6, y - 7);
      }
    });
  };

  const captureAndDetect = useCallback(async () => {
    if (mode !== 'webcam' || !webcamRef.current?.video || webcamRef.current.video.readyState !== 4 || isProcessing) return;

    const video = webcamRef.current.video;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const formData = new FormData();
    const blob = await fetch(imageSrc).then(r => r.blob());
    formData.append('file', blob, 'capture.jpg');
    formData.append('type', type);

    try {
      setIsProcessing(true);
      const res = await api.post(`/sessions/${sessionId}/analyze`, formData);
      if (canvasRef.current) {
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        drawBoxes(canvasRef.current.getContext('2d'), res.data.results, video.videoWidth, video.videoHeight, true);
      }
    } catch (err) { console.error("Webcam detection error:", err); }
    finally { setIsProcessing(false); }
  }, [sessionId, type, isProcessing, mode]);

  useEffect(() => {
    const interval = mode === 'webcam' ? setInterval(captureAndDetect, 800) : null;
    return () => clearInterval(interval);
  }, [captureAndDetect, mode]);

  // Effect to draw boxes on uploaded image whenever it results change
  useEffect(() => {
    if (mode === 'upload' && previewUrl && uploadResults.length > 0 && uploadImgRef.current && uploadCanvasRef.current) {
      const img = uploadImgRef.current;
      const canvas = uploadCanvasRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      drawBoxes(canvas.getContext('2d'), uploadResults, img.naturalWidth, img.naturalHeight, false);
    }
  }, [mode, previewUrl, uploadResults]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset previous
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadResults([]);
    setStatus('uploading');

    const isVideo = file.type.startsWith('video/');
    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const endpoint = isVideo ? 'analyze_video' : 'analyze';

    try {
      const res = await api.post(`/sessions/${sessionId}/${endpoint}`, formData);
      if (!isVideo) setUploadResults(res.data.results || []);
      setStatus('success');
      if (isVideo) setTimeout(() => setStatus(null), 3000);
    } catch (err) { setStatus('error'); }
  };

  const clearUpload = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadResults([]);
    setStatus(null);
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden group border border-white/5 shadow-2xl">
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
        <button
          onClick={() => { setMode('webcam'); clearUpload(); }}
          className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${mode === 'webcam' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-black/40 text-slate-300 hover:bg-black/60'}`}
          title="Switch to Webcam"
        >
          <Camera size={18} />
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${mode === 'upload' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-black/40 text-slate-300 hover:bg-black/60'}`}
          title="Upload File"
        >
          <Upload size={18} />
        </button>
        {previewUrl && (
          <button onClick={clearUpload} className="p-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all shadow-lg shadow-red-500/20" title="Clear Upload">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {mode === 'webcam' && (
        <div className="w-full h-full relative">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            className="w-full h-full object-cover transform scale-x-[-1]"
            videoConstraints={{ facingMode: "user" }}
          />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
        </div>
      )}

      {mode === 'upload' && (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
          {previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black/20">
              {previewUrl.includes('video') || status === 'uploading' && !status?.startsWith('image') ? (
                /* Static feedback for videos or while uploading videos */
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="animate-spin text-indigo-500" size={40} />
                  <span className="text-sm font-bold text-white tracking-widest uppercase">Processing Media...</span>
                </div>
              ) : (
                <>
                  <img
                    ref={uploadImgRef}
                    src={previewUrl}
                    alt="Upload Preview"
                    className="max-w-full max-h-full object-contain animate-enter"
                    onLoad={() => {
                      // Trigger a re-draw if results already exist
                      if (uploadResults.length > 0) setUploadResults([...uploadResults]);
                    }}
                  />
                  <canvas ref={uploadCanvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                </>
              )}
              {status === 'success' && uploadResults.length === 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-xl animate-enter">
                  Detection Complete
                </div>
              )}
            </div>
          ) : (
            <label className="group/label cursor-pointer flex flex-col items-center p-12 w-full h-full border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 group-hover/label:scale-110 group-hover/label:bg-indigo-500/20 transition-all text-indigo-400">
                <FileVideo size={40} />
              </div>
              <span className="text-lg font-bold text-white mb-2">Drop classroom footage here</span>
              <span className="text-sm text-slate-400">Supports Images and MP4 Videos</span>
              <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
              <div className="mt-8 btn-primary !py-2 !px-6 !rounded-lg text-xs">Browse Files</div>
            </label>
          )}

          {status === 'error' && (
            <div className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <XCircle className="text-white" size={48} />
              <span className="font-bold text-white uppercase tracking-tighter">Analysis Failed</span>
              <button onClick={clearUpload} className="btn-ghost !bg-white !text-red-600 !rounded-full !py-2 !px-6 !text-xs mt-2">Try Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default MediaCapture;