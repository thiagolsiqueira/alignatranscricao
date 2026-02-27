import React, { useState } from 'react';
import { Layout, History, Plus, Search, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UploadSection } from './components/UploadSection';
import { TranscriptionList } from './components/TranscriptionList';
import { TranscriptionViewer } from './components/TranscriptionViewer';
import { Transcription } from './types';
import { transcribeAudio } from './services/transcriptionService';
import { cn } from './lib/utils';
import { formatTranscriptionText } from './lib/formatTranscription';

export default function App() {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'viewer'>('dashboard');
  const [selectedTranscription, setSelectedTranscription] = useState<Transcription | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleUpload = async (file: File, language: string) => {
    setIsProcessing(true);
    const newTranscription: Transcription = {
      id: Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      fileSize: file.size,
      status: 'processing',
      createdAt: Date.now(),
      language: language,
    };
    setTranscriptions((prev) => [newTranscription, ...prev]);
    setSelectedTranscription(newTranscription);
    setCurrentView('viewer');
    try {
      const rawText = await transcribeAudio(file, language);
      const text = formatTranscriptionText(rawText);
      setTranscriptions((prev) =>
        prev.map((t) => (t.id === newTranscription.id ? { ...t, status: 'completed', text } : t))
      );
      setSelectedTranscription((prev) =>
        prev?.id === newTranscription.id ? { ...prev, status: 'completed', text } : prev
      );
    } catch (error) {
      console.error('Transcription error:', error);
      setTranscriptions((prev) =>
        prev.map((t) => (t.id === newTranscription.id ? { ...t, status: 'failed' } : t))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectTranscription = (t: Transcription) => {
    setSelectedTranscription(t);
    setCurrentView('viewer');
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 md:hidden"
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-white border-r border-slate-200 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-50 md:relative md:z-auto",
        "w-80 max-w-[85vw] md:max-w-none",
        mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        sidebarOpen ? "md:w-80" : "md:w-20"
      )}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0">
            <Layout className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && <span className="font-bold text-xl tracking-tight">Aligna Transcrição</span>}
        </div>

        <div className="px-4 mb-6">
          <button 
            onClick={() => {
              setCurrentView('dashboard');
              setMobileSidebarOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 h-12 rounded-xl transition-all",
              currentView === 'dashboard' ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-600 hover:bg-slate-100"
            )}
          >
            <Plus className="w-5 h-5" />
            {sidebarOpen && <span className="font-semibold">Nova Transcrição</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 space-y-6">
          <div>
            {sidebarOpen && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-4">
                Recentes
              </p>
            )}
            <div className="space-y-1">
              {transcriptions.slice(0, 5).map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTranscription(t)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 h-11 rounded-lg transition-all text-sm",
                    selectedTranscription?.id === t.id ? "bg-slate-100 text-slate-900 font-medium" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <History className="w-4 h-4 shrink-0" />
                  {sidebarOpen && <span className="truncate">{t.fileName}</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-1"></div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative max-w-md w-full hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Pesquisar transcrições..." 
                className="w-full pl-10 pr-4 h-10 rounded-lg bg-slate-100 border-transparent focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-primary/10 outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4"></div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {currentView === 'dashboard' ? (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <UploadSection onUpload={handleUpload} isUploading={isProcessing} />
                
                <div className="max-w-4xl mx-auto px-4 pb-20">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Suas Transcrições</h2>
                    <button className="text-sm font-semibold text-primary hover:text-primary-hover">Ver todas</button>
                  </div>
                  <TranscriptionList 
                    transcriptions={transcriptions} 
                    onSelect={handleSelectTranscription}
                    selectedId={selectedTranscription?.id}
                  />
                </div>
              </motion.div>
            ) : (
              selectedTranscription && (
                <motion.div
                  key="viewer"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <TranscriptionViewer 
                    transcription={selectedTranscription} 
                    onBack={() => setCurrentView('dashboard')} 
                  />
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
