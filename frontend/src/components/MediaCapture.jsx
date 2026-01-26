import React, { useRef, useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { Camera, Upload, Film, Image as ImageIcon, CheckCircle } from 'lucide-react';

const MediaCapture = ({ sessionId, type }) => {
  const [mode, setMode] = useState('webcam'); // 'webcam' or 'upload'
  const [uploadStatus, setUploadStatus] = useState(null); // null, 'uploading', 'success', 'error'
  const webcamRef = useRef(null);

  // --- WEBCAM LOGIC ---
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
      console.log(`Live capture sent (${type})`);
    } catch (err) {
      console.error("Live upload failed", err);
    }
  }, [webcamRef, sessionId, type, mode]);

  // Auto-capture timer
  useEffect(() => {
    let interval;
    if (mode === 'webcam') {
      interval = setInterval(capture, 3000);
    }
    return () => clearInterval(interval);
  }, [capture, mode]);


  // --- UPLOAD LOGIC ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    // Determine endpoint based on file type
    const isVideo = file.type.startsWith('video/');
    const endpoint = isVideo ? 'analyze_video' : 'analyze';

    try {
      await axios.post(`http://localhost:8000/sessions/${sessionId}/${endpoint}`, formData);
      setUploadStatus('success');
      // Reset success message after 3 seconds
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error("File upload failed", err);
      setUploadStatus('error');
    }
  };

  return (
    <div className="border-4 border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      
      {/* Header / Mode Switcher */}
      <div className="bg-slate-800 text-white flex justify-between items-center px-4 py-2">
        <span className="font-bold uppercase tracking-wider text-sm">{type} Channel</span>
        
        <div className="flex bg-slate-700 rounded-lg p-1 space-x-1">
          <button
            onClick={() => setMode('webcam')}
            className={`p-1.5 rounded-md transition-all ${mode === 'webcam' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            title="Live Camera"
          >
            <Camera size={16} />
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`p-1.5 rounded-md transition-all ${mode === 'upload' ? 'bg-indigo-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            title="Upload File"
          >
            <Upload size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative h-64 bg-slate-100 flex flex-col justify-center items-center">
        
        {/* MODE: WEBCAM */}
        {mode === 'webcam' && (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-red-600/90 rounded text-xs text-white font-bold animate-pulse flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              LIVE
            </div>
          </>
        )}

        {/* MODE: UPLOAD */}
        {mode === 'upload' && (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-4 text-center">
            
            {uploadStatus === 'success' ? (
              <div className="animate-bounce text-green-600 flex flex-col items-center">
                <CheckCircle size={48} />
                <span className="mt-2 font-bold">Processed Successfully!</span>
              </div>
            ) : (
              <>
                <div className="p-4 bg-indigo-50 rounded-full">
                  {uploadStatus === 'uploading' ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  ) : (
                    <Upload size={32} className="text-indigo-500" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <h4 className="font-semibold text-slate-700">Upload Media</h4>
                  <p className="text-xs text-slate-500">Supports JPG, PNG or MP4</p>
                </div>

                <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                  Choose File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    disabled={uploadStatus === 'uploading'}
                  />
                </label>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaCapture;