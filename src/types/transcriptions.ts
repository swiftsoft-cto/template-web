// ==============================|| TRANSCRIPTION TYPES ||============================== //

/** Segmento da transcrição com timestamp e opcionalmente diarização (locutor) */
export interface TranscriptionSegment {
  id: string;
  startTime: string;
  endTime?: string;
  speaker?: string;
  text: string;
}

export type TranscriptionStatus = 'processing' | 'done' | 'error';

/** Transcrição completa (mock / backend) */
export interface Transcription {
  id: string;
  title: string;
  sourceFileName: string;
  createdAt: string;
  durationSeconds: number;
  durationFormatted: string;
  segments: TranscriptionSegment[];
  tags: string[];
  diarizationEnabled: boolean;
  status?: TranscriptionStatus;
  errorMessage?: string | null;
  /** Pasta onde a transcrição está (null/omitido = raiz) */
  folderId?: string | null;
  /** Caminho legível a partir da raiz até a transcrição (inclui o título) */
  path?: string[];
  /** Caminho em formato único estilo Windows: Pasta\\Subpasta\\Título */
  pathString?: string;
}

/** Payload para criar transcrição (upload) */
export interface CreateTranscriptionPayload {
  file: File;
  diarizationEnabled: boolean;
  /** Pasta de destino (opcional; null/omisso = raiz) */
  folderId?: string | null;
}

export type ListTranscriptionsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PagedResponse<T> = {
  data: T[];
  pagination?: PaginationMeta;
};

/** Payload para gerar resumo via LLM */
export interface GenerateSummaryPayload {
  transcriptionId: string;
  prompt: string;
}

/** Resposta do resumo em Markdown */
export interface SummaryResponse {
  markdown: string;
}

export type MediaMetaResponse = {
  fileId: string;
  streamPath: string;
  durationSeconds: number;
  durationFormatted: string;
};

export type UpsertTagsPayload = { tag: string } | { tags: string[] };

export type Comment = {
  id: string;
  transcriptionId: string;
  userId?: string | null;
  userName?: string | null;
  avatarPath?: string | null;
  text: string;
  atSeconds?: number | null;
  segmentId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateCommentPayload = {
  text: string;
  atSeconds?: number;
  segmentId?: string;
};

export type UpdateCommentPayload = {
  text?: string;
  atSeconds?: number;
  segmentId?: string;
};

export type ChatThread = {
  id: string;
  transcriptionId: string;
  title?: string | null;
  createdAt?: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  citations?: Array<{
    segmentId: string;
    startTime?: string;
    endTime?: string;
    snippet?: string;
  }>;
  createdAt?: string;
};

export type ChatMessagePayload = {
  message: string;
  threadId?: string;
};

export type ChatSendResponse = {
  threadId: string;
  assistant: {
    message: string;
    citations?: Array<{
      segmentId: string;
      startTime?: string;
      endTime?: string;
      snippet?: string;
    }>;
  };
};

export type Insight = {
  id: string;
  type: string;
  status: 'queued' | 'running' | 'done' | 'error';
  result?: any;
  errorMessage?: string | null;
  createdAt?: string;
};

export type CreateInsightsPayload = {
  types?: string[];
};

export type ShareLink = {
  token: string;
  url: string;
  expiresAt?: string | null;
  permission?: 'read' | 'comment';
};

export type CreateShareLinkPayload = {
  expiresAt?: string;
  permission?: 'read' | 'comment';
};

// ==============================|| SEGMENT EDITING ||============================== //

export type UpdateSegmentPayload = {
  text?: string;
  speaker?: string;
};

export type SegmentUpdate = {
  id: string;
  text?: string;
  speaker?: string;
};

export type UpdateSegmentsPayload = {
  updates: SegmentUpdate[];
};

export type UpdateSpeakerLabelsPayload = {
  labels: Record<string, string>; // { "A": "Reclamante", "B": "Reclamada" }
};

export type UpdateSpeakerLabelsResponse = {
  labels: Record<string, string>;
  transcription: Transcription;
};

// ==============================|| ICE BREAKERS ||============================== //

export type IceBreaker = {
  id: string;
  transcriptionId: string;
  question: string;
  order: number;
  createdAt: string;
};

// ==============================|| TRANSCRIPTION SHARES (compartilhar com usuários) ||============================= //

export type TranscriptionSharedWithItem = {
  id: string;
  sharedWithUserId: string;
  createdAt?: string | null;
  user?: {
    name: string;
    email: string;
    imageUrl?: string | null;
  } | null;
};

export type ShareTranscriptionPayload = {
  userId: string;
};

// ==============================|| FOLDERS & EXPLORER ||============================== //

export interface TranscriptionFolder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Presente em operações de busca global */
  path?: string[];
  pathString?: string;
}

export type ExplorerPathItem = {
  id: string | null;
  name: string;
};

/** Transcrição com informações de caminho (para o explorer) */
export type TranscriptionWithPath = Transcription & {
  folderId?: string | null;
  path?: string[];
  pathString?: string;
};

export type TranscriptionsExplorerResponse = {
  currentPath: string[];
  pathItems: ExplorerPathItem[];
  folders: TranscriptionFolder[];
  transcriptions: TranscriptionWithPath[];
};

/** Usuário que compartilhou transcrições comigo (GET shared-with-me/users) */
export type SharedWithMeUser = {
  id: string;
  name: string;
  email?: string;
  imageUrl?: string | null;
};
