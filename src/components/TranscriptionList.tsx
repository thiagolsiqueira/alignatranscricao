import React from 'react';
import { FileText, Clock, ChevronRight, FileAudio, FileVideo } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transcription } from '../types';
import { cn } from '../lib/utils';

interface TranscriptionListProps {
  transcriptions: Transcription[];
  onSelect: (transcription: Transcription) => void;
  selectedId?: string;
}

export function TranscriptionList({ transcriptions, onSelect, selectedId }: TranscriptionListProps) {
  if (transcriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <FileText className="w-8 h-8 text-slate-400" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-slate-900">Nenhuma transcrição ainda</p>
          <p className="text-sm text-slate-500">Faça o upload do seu primeiro arquivo para começar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {transcriptions.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={cn(
            "w-full flex items-center justify-between p-4 rounded-xl transition-all border text-left",
            selectedId === t.id
              ? "bg-primary/5 border-primary/20 ring-1 ring-primary/20"
              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          )}
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              t.status === 'completed' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
            )}>
              {t.fileName.toLowerCase().match(/\.(mp4|mov|avi)$/) ? (
                <FileVideo className="w-5 h-5" />
              ) : (
                <FileAudio className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-slate-900 truncate">{t.fileName}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(t.createdAt, { addSuffix: true, locale: ptBR })}
                </span>
                <span className="uppercase">{t.language}</span>
                <span>{(t.fileSize / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
            </div>
          </div>
          <ChevronRight className={cn(
            "w-5 h-5 transition-colors",
            selectedId === t.id ? "text-primary" : "text-slate-300"
          )} />
        </button>
      ))}
    </div>
  );
}
