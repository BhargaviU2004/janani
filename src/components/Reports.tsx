import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Upload, 
  Search, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  X,
  Stethoscope,
  Activity,
  Milestone,
  AlertCircle
} from 'lucide-react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { ai, MODELS } from '../lib/gemini';
import { Type } from '@google/genai';
import { format } from 'date-fns';

export default function Reports() {
  const { user, profile, triggerCrisisAlert } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'users', user.uid, 'reports'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setReports(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [user]);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setPreview(reader.result as string);
      await analyzeReport(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const dropzoneOptions: any = {
    onDrop,
    accept: { 'image/*': [], 'application/pdf': [] },
    multiple: false
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const analyzeReport = async (base64: string, mimeType: string) => {
    setAnalyzing(true);
    try {
      const status = profile?.status || 'pregnant';
      const response = await ai.models.generateContent({
        model: MODELS.REPORT_EXTRACTION,
        contents: [
          {
            text: `Review this medical document (Prescription/Report/Ultrasound). 
            User is currently ${status === 'pregnant' ? 'PREGNANT' : 'POSTPARTUM'}.
            Extract key data points: 
            1. Report Type
            2. Key metrics (e.g., Hb levels, BP, ${status === 'pregnant' ? 'fetal weight' : 'recovery metrics'})
            3. Medication schedule if any.
            4. ${status === 'pregnant' ? 'Pregnancy milestonesReached' : 'Recovery milestones reached'}.
            5. Risk flags ${status === 'postpartum' ? '(focus on PPD signs if mentioned, or physical healing)' : ''}.
            Return a JSON object.`
          },
          {
            inlineData: { data: base64, mimeType }
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reportType: { type: Type.STRING },
              extractedData: { type: Type.OBJECT },
              medications: { type: Type.ARRAY, items: { type: Type.STRING } },
              milestones: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskLevel: { type: Type.STRING, description: "low, medium, high, or critical" },
              summary: { type: Type.STRING }
            },
            required: ["reportType", "extractedData", "summary", "riskLevel", "riskFlags"]
          }
        }
      });

      const analysis = JSON.parse(response.text || '{}');

      if (analysis.riskLevel === 'critical') {
        triggerCrisisAlert(analysis.summary, analysis.riskFlags || []);
      } else if (analysis.riskLevel === 'high') {
        alert(`🚨 Medical Report Warning: High-risk indicators found.\n\n${analysis.summary}\n\nPlease share this with your doctor immediately.`);
      }

      await addDoc(collection(db, 'users', user.uid, 'reports'), {
        userId: user.uid,
        reportType: analysis.reportType,
        extractedData: analysis.extractedData,
        analysis,
        timestamp: Timestamp.now(),
      });

      setPreview(null);
    } catch (error) {
      console.error("Report analysis failed", error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="serif text-3xl text-[#5A5A40]">Medical Records</h3>
          <p className="text-gray-500 text-sm mt-1">Upload reports for AI-powered tracking</p>
        </div>
      </div>

      {/* Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`card-maternal border-2 border-dashed transition-all cursor-pointer ${
          isDragActive ? 'border-[#5A5A40] bg-[#5A5A40]/5' : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center py-8 text-center">
          <div className="bg-[#5A5A40]/10 p-4 rounded-3xl mb-4">
            {analyzing ? (
              <Loader2 className="w-8 h-8 text-[#5A5A40] animate-spin" />
            ) : (
              <Upload className="w-8 h-8 text-[#5A5A40]" />
            )}
          </div>
          <p className="text-gray-600 font-medium">
            {isDragActive ? "Drop the file here" : "Tap to upload Report or Image"}
          </p>
          <p className="text-xs text-gray-400 mt-2">Supports Ultrasound, Lab Reports, Prescriptions</p>
        </div>
      </div>

      {/* Preview Modal (overlay style) */}
      <AnimatePresence>
        {preview && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden p-6 relative">
              <button 
                onClick={() => setPreview(null)}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
              <h4 className="serif text-2xl mb-4">Analyzing Document...</h4>
              <img src={preview} className="w-full h-64 object-cover rounded-2xl mb-6 opacity-50 grayscale" />
              <div className="flex items-center gap-3 text-[#5A5A40]">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-medium">Janani AI is reading your records...</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reports List */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Recent Records</h4>
        {reports.map((report) => (
          <motion.div 
            key={report.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-maternal !p-5 relative group"
          >
            <div className="flex gap-4">
              <div className="bg-purple-50 p-3 rounded-2xl h-fit">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-bold text-gray-800 leading-tight">{report.reportType}</h5>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{format(report.timestamp.toDate(), 'MMMM dd, yyyy')}</span>
                  </div>
                  {report.analysis?.riskFlags?.length > 0 && (
                    <div className="bg-red-50 p-1.5 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100/50">
                  {report.analysis?.summary}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {report.analysis?.medications?.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                        <Activity className="w-3 h-3" />
                        <span>Meds</span>
                      </div>
                      <div className="text-[10px] text-gray-700 font-medium">
                        {report.analysis.medications.join(', ')}
                      </div>
                    </div>
                  )}
                  {report.analysis?.milestones?.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
                        <Milestone className="w-3 h-3" />
                        <span>Milestones</span>
                      </div>
                      <div className="text-[10px] text-gray-700 font-medium">
                        {report.analysis.milestones.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {reports.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No medical records found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
