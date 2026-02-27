import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileAudio, FileVideo, X, CheckCircle2, Loader2, Languages, Zap, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

interface UploadSectionProps {
  onUpload: (file: File, language: string) => void;
  isUploading: boolean;
}

const LANGUAGES = [
  { code: 'auto', name: 'Detectar Automaticamente' },
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
];

export function UploadSection({ onUpload, isUploading }: UploadSectionProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const dropzoneOptions = {
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a', '.aac', '.ogg'],
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
    },
    multiple: false,
    disabled: isUploading,
  } as any;

  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const handleTranscribe = () => {
    if (file) {
      onUpload(file, selectedLanguage);
      setFile(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-12 px-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Transcreva áudio e vídeo em segundos
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Precisão profissional com inteligência artificial. Suporta mais de 90 idiomas.
        </p>
      </div>

      <div className="glass-panel rounded-3xl p-8 space-y-6">
        {!file ? (
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200",
              isDragActive ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50 hover:bg-slate-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-xl font-semibold text-slate-900">
                  Arraste e solte um arquivo aqui
                </p>
                <p className="text-slate-500">
                  Ou clique para selecionar (MP3, WAV, MP4, MOV...)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-slate-200 rounded-2xl p-6 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                {file.type.startsWith('audio/') ? (
                  <FileAudio className="w-6 h-6 text-primary" />
                ) : (
                  <FileVideo className="w-6 h-6 text-primary" />
                )}
              </div>
              <div>
                <p className="font-medium text-slate-900">{file.name}</p>
                <p className="text-sm text-slate-500">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => setFile(null)}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Languages className="w-4 h-4" /> Idioma do Áudio
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTranscribe}
              disabled={!file || isUploading}
              className={cn(
                "w-full h-12 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all",
                !file || isUploading
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20"
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Transcrever Agora
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
        <div className="flex items-start gap-4 p-4">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Alta Precisão</h3>
            <p className="text-sm text-slate-500">Modelos de IA de última geração para resultados impecáveis.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Zap className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Velocidade Turbo</h3>
            <p className="text-sm text-slate-500">Transcreva horas de áudio em apenas alguns minutos.</p>
          </div>
        </div>
        <div className="flex items-start gap-4 p-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Privacidade Total</h3>
            <p className="text-sm text-slate-500">Seus arquivos são processados com segurança e criptografia.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
