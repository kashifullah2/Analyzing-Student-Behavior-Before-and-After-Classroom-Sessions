import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download, FileText, Calendar, Share2 } from 'lucide-react';
// Reuse your chart components here...

const ReportView = ({ sessionId }) => {
  const [report, setReport] = useState(null);

  useEffect(() => {
    // Fetch logic...
    const fetch = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/sessions/${sessionId}/report`);
            setReport(res.data);
        } catch(e) {}
    }
    fetch();
  }, [sessionId]);

  const downloadPDF = () => {
     // Feature 5: PDF Download Link
     window.open(`http://localhost:8000/sessions/${sessionId}/export_pdf`, '_blank');
  };

  if(!report) return <div>Loading Report...</div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      
      {/* Header */}
      <div className="flex justify-between items-end">
         <div>
            <h1 className="text-3xl font-bold text-heading">{report.session_info.class_name} Report</h1>
            <div className="flex items-center gap-4 mt-2 text-sub">
               <span className="flex items-center gap-1"><Calendar size={14}/> {new Date().toLocaleDateString()}</span>
               <span>•</span>
               <span>Instructor: {report.session_info.instructor}</span>
            </div>
         </div>
         <div className="flex gap-3">
             <button className="btn-secondary flex items-center gap-2">
                <Share2 size={16} /> Share
             </button>
             <button onClick={downloadPDF} className="btn-primary flex items-center gap-2">
                <Download size={18} /> Download PDF
             </button>
         </div>
      </div>

      {/* Feature 9: Focus Timer visualization could go here */}
      <div className="glass-panel p-8 rounded-3xl text-center">
         <h2 className="text-2xl font-bold text-white mb-2">Class Performance Summary</h2>
         <p className="text-slate-400 max-w-2xl mx-auto">
            The session maintained a <span className="text-green-400 font-bold">High Vibe Score ({report.entry_stats.vibe_score}/10)</span>. 
            Confusion peaked mid-session, suggesting the second topic was complex. 
            Overall attendance was estimated at <span className="text-blue-400 font-bold">{report.entry_stats.attendance_est} students</span>.
         </p>
      </div>

      {/* Re-use your charts here, but styled for a static report */}
      {/* ... Charts ... */}

    </div>
  );
};

export default ReportView;