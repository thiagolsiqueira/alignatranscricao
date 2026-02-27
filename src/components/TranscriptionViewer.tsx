import React from 'react';
import { Download, Copy, Share2, FileText, ArrowLeft, Check, Search } from 'lucide-react';
import { Transcription } from '../types';
import { useState } from 'react';

interface TranscriptionViewerProps {
  transcription: Transcription;
  onBack: () => void;
}

export function TranscriptionViewer({ transcription, onBack }: TranscriptionViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (transcription.text) {
      navigator.clipboard.writeText(transcription.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (transcription.text) {
      const element = document.createElement("a");
      const file = new Blob([transcription.text], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${transcription.fileName}.txt`;
      document.body.appendChild(element);
      element.click();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar para Dashboard
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 h-10 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Baixar TXT
          </button>
          <button className="flex items-center gap-2 px-4 h-10 rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors text-sm font-medium shadow-sm">
            <Share2 className="w-4 h-4" />
            Compartilhar
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden flex flex-col min-h-[600px]">
        <div className="border-bottom border-slate-200 p-6 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{transcription.fileName}</h2>
              <p className="text-sm text-slate-500 uppercase">{transcription.language} • {transcription.status}</p>
            </div>
          </div>
          
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar na transcrição..." 
              className="pl-9 pr-4 h-10 rounded-lg border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
            />
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto">
          {transcription.status === 'processing' ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-slate-500">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="animate-pulse">Gerando transcrição...</p>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <p className="text-lg leading-relaxed text-slate-700 whitespace-pre-wrap">
                {transcription.text || "Nenhum texto gerado."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
