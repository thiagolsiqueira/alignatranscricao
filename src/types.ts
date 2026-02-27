export interface Transcription {
  id: string;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  text?: string;
  createdAt: number;
  language: string;
  duration?: number;
}

export interface TranscriptionOptions {
  language: string;
  priority: 'speed' | 'accuracy';
}
