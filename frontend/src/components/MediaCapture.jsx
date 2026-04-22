import React, { useRef, useEffect, useState, useCallback } from 'react';
import api from '../api';
import {
  Camera, Upload, FileVideo, RefreshCw, XCircle, Trash2,
  Wifi, WifiOff, Maximize, Video, StopCircle,
} from 'lucide-react';
import VideoAnalyzer from './VideoAnalyzer';

const WS_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/^http/, 'ws');

const MediaCapture = ({ sessionId, type }) => {
  const [mode, setMode] = useState('idle'); // NEW: 'idle' is the start screen
  const [status, setStatus] = useState(null);
  const [uploadResults, setUploadResults] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewIsVideo, setPreviewIsVideo] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const uploadCanvasRef = useRef(null);
  const uploadImgRef = useRef(null);
  const wsRef = useRef(null);
  const containerRef = useRef(null);

  // Track fullscreen reactively
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Draw bounding boxes on a canvas
  const drawBoxes = (ctx, results, width, height, isMirrored = false) => {
    ctx.clearRect(0, 0, width, height);
    if (!results || results.length === 0) return;

    const baseDim = Math.max(width, height);
    const lineWidth = Math.max(2, Math.floor(baseDim * 0.003));
    const fontSize = Math.max(12, Math.floor(baseDim * 0.02));
    const labelH = fontSize + 10;
    const padX = fontSize / 2;
    const padY = fontSize / 2;

    results.forEach(det => {
      let bbox = det.bbox;
      if (typeof bbox === 'string') {
        try { bbox = JSON.parse(bbox); } catch { bbox = []; }
      }
      if (!Array.isArray(bbox) || bbox.length !== 4) return;

      const [x, y, w, h] = bbox;
      const posX = isMirrored ? width - x - w : x;

      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = lineWidth * 4;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = lineWidth;
      ctx.strokeRect(posX, y, w, h);
      ctx.shadowBlur = 0;

      const text = `${det.emotion}${det.confidence ? ' ' + (det.confidence * 100).toFixed(0) + '%' : ''}`;
      ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
      const textWidth = ctx.measureText(text).width;
      ctx.fillStyle = 'rgba(34, 197, 94, 0.85)';
      ctx.beginPath();
      ctx.roundRect(posX, y - labelH - 2, textWidth + padX * 2, labelH, 4);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillText(text, posX + padX, y - padY - 2);
    });
  };

  // ── WebSocket (Webcam) ────────────────────────────────────────────────
  // FEATURE: Camera now only starts when mode === 'webcam' (user clicked Start).
  // Previously the WebSocket connected immediately on mount with no user gate.
  useEffect(() => {
    if (mode !== 'webcam') return;

    let cancelled = false;
    let ws = null;
    let reconnectTimer = null;

    const connect = () => {
      if (cancelled) return;
      const wsUrl = `${WS_BASE}/ws/webcam/${sessionId}/${type}`;
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        if (cancelled) { ws.close(); return; }
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        if (cancelled) return;
        try {
          const data = JSON.parse(event.data);
          if (data.frame && imgRef.current) {
            imgRef.current.src = `data:image/jpeg;base64,${data.frame}`;
          }
          setFaceCount(data.face_count || 0);
          if (canvasRef.current && imgRef.current) {
            const img = imgRef.current;
            if (img.naturalWidth > 0) {
              canvasRef.current.width = img.naturalWidth;
              canvasRef.current.height = img.naturalHeight;
              drawBoxes(
                canvasRef.current.getContext('2d'),
                data.results, img.naturalWidth, img.naturalHeight, false,
              );
            }
          }
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        if (!cancelled) reconnectTimer = setTimeout(connect, 2000);
      };

      ws.onerror = () => setWsConnected(false);
    };

    const startTimer = setTimeout(connect, 300);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      clearTimeout(reconnectTimer);
      if (ws) {
        if (ws.readyState === WebSocket.OPEN) ws.send('stop');
        ws.close();
      }
      wsRef.current = null;
      setWsConnected(false);
    };
  }, [mode, sessionId, type]);

  // Draw boxes on uploaded image when results arrive
  useEffect(() => {
    if (
      mode === 'upload' && previewUrl &&
      uploadResults.length > 0 &&
      uploadImgRef.current && uploadCanvasRef.current
    ) {
      const img = uploadImgRef.current;
      const canvas = uploadCanvasRef.current;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      drawBoxes(canvas.getContext('2d'), uploadResults, img.naturalWidth, img.naturalHeight, false);
    }
  }, [mode, previewUrl, uploadResults]);

  const clearUpload = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewIsVideo(false);
    setUploadResults([]);
    setStatus(null);
  }, [previewUrl]);

  // Stop webcam and return to the idle start screen
  const stopCamera = useCallback(() => {
    setMode('idle');
    setWsConnected(false);
    setFaceCount(0);
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadResults([]);
    setStatus('uploading');

    const isVideo = file.type.startsWith('video/');
    setPreviewUrl(URL.createObjectURL(file));
    setPreviewIsVideo(isVideo);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    const endpoint = isVideo ? 'analyze_video' : 'analyze';

    try {
      const res = await api.post(`/sessions/${sessionId}/${endpoint}`, formData);
      if (!isVideo) setUploadResults(res.data.results || []);
      setStatus('success');
      if (isVideo) setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus('error');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err =>
        console.warn(`Fullscreen error: ${err.message}`),
      );
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-slate-900 rounded-2xl overflow-hidden group border border-white/5 shadow-2xl ${isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full h-full'}`}
    >
      {/* ── Controls overlay (top-right) ── */}
      {mode !== 'idle' && (
        <div className="absolute top-4 right-4 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
          <button onClick={toggleFullscreen} className="p-2.5 rounded-xl backdrop-blur-md bg-black/40 text-slate-300 hover:bg-black/60 transition-all" title="Toggle Fullscreen">
            <Maximize size={18} />
          </button>
          {/* Stop camera button — returns to idle */}
          {mode === 'webcam' && (
            <button onClick={stopCamera} className="p-2.5 rounded-xl backdrop-blur-md bg-red-600/80 text-white hover:bg-red-600 transition-all" title="Stop Camera">
              <StopCircle size={18} />
            </button>
          )}
          <button
            onClick={() => { clearUpload(); setMode('upload'); }}
            className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${mode === 'upload' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-black/40 text-slate-300 hover:bg-black/60'}`}
            title="Upload Image/Video"
          >
            <Upload size={18} />
          </button>
          <button
            onClick={() => { clearUpload(); setMode('video'); }}
            className={`p-2.5 rounded-xl backdrop-blur-md transition-all ${mode === 'video' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-black/40 text-slate-300 hover:bg-black/60'}`}
            title="Upload Video (Full Analysis)"
          >
            <FileVideo size={18} />
          </button>
          {previewUrl && !previewIsVideo && (
            <button onClick={clearUpload} className="p-2.5 bg-red-500/80 hover:bg-red-500 text-white rounded-xl backdrop-blur-md transition-all" title="Clear Upload">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )}

      {/* ══ IDLE / START SCREEN ══════════════════════════════════════════ */}
      {mode === 'idle' && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Camera size={40} className="text-indigo-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg mb-1 capitalize">{type} Camera</p>
            <p className="text-slate-400 text-sm">Choose how you want to analyse this feed</p>
          </div>

          {/* Primary: Start live webcam */}
          <button
            onClick={() => setMode('webcam')}
            className="flex items-center gap-3 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95"
          >
            <Video size={20} />
            Start Live Camera
          </button>

          {/* Secondary options */}
          <div className="flex gap-3">
            <button
              onClick={() => { clearUpload(); setMode('upload'); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl font-semibold text-xs transition-all border border-white/10"
            >
              <Upload size={16} />
              Upload Image
            </button>
            <button
              onClick={() => { clearUpload(); setMode('video'); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 rounded-xl font-semibold text-xs transition-all border border-white/10"
            >
              <FileVideo size={16} />
              Upload Video
            </button>
          </div>
        </div>
      )}

      {/* ══ WEBCAM MODE ══════════════════════════════════════════════════ */}
      {mode === 'webcam' && (
        <div className="w-full h-full relative bg-black flex items-center justify-center">
          <img ref={imgRef} alt="Live Feed" className="w-full h-full object-contain" />
          <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ objectFit: 'contain' }} />

          {/* Connection badge */}
          <div className={`absolute bottom-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border ${wsConnected
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              : 'bg-red-500/20 text-red-300 border-red-500/30'
            }`}>
            {wsConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {wsConnected ? 'LIVE' : 'CONNECTING...'}
          </div>

          {/* Face count badge */}
          {wsConnected && faceCount > 0 && (
            <div className="absolute bottom-4 right-4 z-10 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md">
              {faceCount} face{faceCount !== 1 ? 's' : ''} detected
            </div>
          )}

          {/* Connecting overlay */}
          {!wsConnected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
              <RefreshCw className="animate-spin text-indigo-400 mb-3" size={32} />
              <span className="text-white/80 text-sm font-medium tracking-wide">Connecting to camera...</span>
              <button onClick={stopCamera} className="mt-5 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all">
                <StopCircle size={14} /> Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* ══ UPLOAD MODE ══════════════════════════════════════════════════ */}
      {mode === 'upload' && (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
          {previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black/20">
              {previewIsVideo || status === 'uploading' ? (
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
                    className="max-w-full max-h-full object-contain"
                    onLoad={() => { if (uploadResults.length > 0) setUploadResults([...uploadResults]); }}
                  />
                  <canvas ref={uploadCanvasRef} className="absolute inset-0 w-full h-full object-contain pointer-events-none" />
                </>
              )}
              {status === 'success' && uploadResults.length === 0 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-2 rounded-full font-bold shadow-xl">
                  Detection Complete
                </div>
              )}
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center p-12 w-full h-full border-2 border-dashed border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-indigo-400">
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
          {/* Back to start */}
          <button onClick={() => { clearUpload(); setMode('idle'); }} className="absolute bottom-4 left-4 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
            ← Back
          </button>
        </div>
      )}

      {/* ══ VIDEO ANALYZER MODE ══════════════════════════════════════════ */}
      {mode === 'video' && (
        <div className="w-full h-full relative">
          <VideoAnalyzer sessionId={sessionId} type={type} />
          <button onClick={() => { clearUpload(); setMode('idle'); }} className="absolute bottom-4 left-4 text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors z-10">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaCapture;