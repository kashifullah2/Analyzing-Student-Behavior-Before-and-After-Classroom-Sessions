import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Maximize, Play, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api';

const VideoAnalyzer = ({ sessionId, type = 'entry', embedded = true }) => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [videoUrl, setVideoUrl] = useState(null);
  // ─── BUG FIX: Track fullscreen in React state so className re-renders
  // correctly. document.fullscreenElement is not reactive on its own.
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);

  // ─── BUG FIX: Listen for fullscreen changes and sync to state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type.startsWith('video/')) {
      setFile(selected);
      setVideoUrl(null);
      setStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('processing');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    try {
      // Endpoint returns the annotated mp4 file as a Blob
      const res = await api.post(`/sessions/${sessionId}/analyze_video_full`, formData, {
        responseType: 'blob'
      });

      const blob = new Blob([res.data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setStatus('success');
    } catch (err) {
      console.error("Video processing failed", err);
      setStatus('error');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    // ─── BUG FIX: use isFullscreen state (reactive) instead of
    // document.fullscreenElement (non-reactive) for className conditionals.
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center w-full h-full ${!embedded ? 'bg-slate-900 border border-white/10 rounded-2xl p-6 min-h-[400px]' : ''} ${isFullscreen && !embedded ? 'h-screen w-screen rounded-none' : ''}`}
    >
      {/* Fullscreen Button */}
      {!embedded && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all"
          title="Toggle Fullscreen"
        >
          <Maximize size={20} />
        </button>
      )}

      {!videoUrl ? (
        <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-md">
          {status === 'idle' || status === 'error' ? (
            <>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-indigo-500/50 hover:border-indigo-400 hover:bg-indigo-500/10 rounded-xl cursor-pointer transition-all">
                <UploadCloud size={48} className="text-indigo-400 mb-3" />
                <span className="text-white font-semibold">Select Video File</span>
                <span className="text-slate-400 text-sm mt-1">MP4, WEBM, MOV</span>
                <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              </label>

              {file && (
                <div className="w-full bg-slate-800 p-4 rounded-lg flex items-center justify-between border border-white/5">
                  <span className="text-slate-300 text-sm truncate pr-4">{file.name}</span>
                  <button
                    onClick={handleUpload}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-sm transition-all"
                  >
                    <Play size={16} /> Process
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-lg w-full">
                  <AlertTriangle size={16} /> Processing failed. Try a smaller video.
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-30 rounded-full animate-pulse"></div>
                <Loader size={64} className="text-indigo-500 animate-spin relative z-10" />
              </div>
              <p className="text-white font-bold text-lg">AI is Processing Video...</p>
              <p className="text-slate-400 text-sm text-center">
                This may take a few minutes depending on the video length.
                Please do not close this page.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="relative w-full h-full flex flex-col items-center">
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full object-contain rounded-lg max-h-[80vh]"
          />
          <div className="absolute top-4 left-4 bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-md">
            <CheckCircle size={14} /> Analysis Complete
          </div>
          {/* ─── BUG FIX: use isFullscreen state instead of document.fullscreenElement */}
          {!isFullscreen && (
            <button
              onClick={() => { setVideoUrl(null); setFile(null); setStatus('idle'); }}
              className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-all border border-white/10"
            >
              Analyze Another Video
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoAnalyzer;