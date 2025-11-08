
export interface Voice {
  id: string;
  name: string;
}

export interface Speaker {
  id: number;
  name: string;
  voiceId: string;
  personality?: string;
}

export interface Segment {
  id: number;
  title: string;
  description?: string; // User-provided notes for the segment
  content: string; // Script content
  keyPoints?: string;
  activitySuggestion?: string;
  generatedAudio?: string | null;
  isExpanded?: boolean;
}
