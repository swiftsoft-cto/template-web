// API real para transcrições (backend).
// Usa o mesmo axios de utils/axios (Bearer + refresh) como em users.ts.

import axios from 'utils/axios';
import type {
  Transcription,
  CreateTranscriptionPayload,
  GenerateSummaryPayload,
  SummaryResponse,
  ListTranscriptionsQuery,
  PagedResponse,
  MediaMetaResponse,
  UpsertTagsPayload,
  Comment,
  CreateCommentPayload,
  UpdateCommentPayload,
  ChatMessagePayload,
  ChatSendResponse,
  ChatThread,
  ChatMessage,
  Insight,
  CreateInsightsPayload,
  ShareLink,
  CreateShareLinkPayload,
  UpdateSegmentPayload,
  UpdateSegmentsPayload,
  UpdateSpeakerLabelsPayload,
  UpdateSpeakerLabelsResponse,
  IceBreaker,
  TranscriptionSharedWithItem,
  ShareTranscriptionPayload,
  TranscriptionFolder,
  TranscriptionsExplorerResponse,
  SharedWithMeUser
} from '../types/transcriptions';

// ==============================|| TRANSCRIPTIONS ||============================== //

/** Lista transcrições (mantém assinatura antiga para não quebrar UI) */
export async function listTranscriptions(query?: ListTranscriptionsQuery): Promise<Transcription[]> {
  const res = await listTranscriptionsPaged(query);
  return Array.isArray(res?.data) ? res.data : [];
}

/** Lista transcrições com paginação */
export async function listTranscriptionsPaged(query?: ListTranscriptionsQuery): Promise<PagedResponse<Transcription>> {
  const { data } = await axios.get<PagedResponse<Transcription>>('/transcriptions', {
    params: {
      page: query?.page,
      limit: query?.limit,
      search: query?.search || undefined,
      tag: query?.tag || undefined
    }
  });
  return data ?? { data: [] };
}

/** Busca uma transcrição por ID */
export async function getTranscription(id: string): Promise<Transcription> {
  const { data } = await axios.get<Transcription>(`/transcriptions/${encodeURIComponent(id)}`);
  return data;
}

/** Cria transcrição via upload (multipart) */
export async function createTranscription(payload: CreateTranscriptionPayload): Promise<Transcription> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('diarizationEnabled', String(payload.diarizationEnabled));
  if (typeof payload.folderId !== 'undefined' && payload.folderId !== null) {
    form.append('folderId', payload.folderId);
  }
  const { data } = await axios.post<Transcription>('/transcriptions', form);
  return data;
}

/** Atualiza transcrição (ex.: título / pasta) */
export async function updateTranscription(id: string, patch: { title?: string; folderId?: string | null }): Promise<Transcription> {
  const { data } = await axios.patch<Transcription>(`/transcriptions/${encodeURIComponent(id)}`, patch);
  return data;
}

/** Soft delete transcrição */
export async function deleteTranscription(id: string): Promise<{ ok: boolean }> {
  const { data } = await axios.delete<{ ok: boolean }>(`/transcriptions/${encodeURIComponent(id)}`);
  return data ?? { ok: true };
}

// ==============================|| MEDIA ||============================== //

/** Metadados de mídia */
export async function getTranscriptionMediaMeta(id: string): Promise<MediaMetaResponse> {
  const { data } = await axios.get<MediaMetaResponse>(`/transcriptions/${encodeURIComponent(id)}/media`);
  return data;
}

/** Baixa a mídia (blob) via endpoint autenticado. Usa Bearer no header. */
export async function downloadTranscriptionMediaBlob(id: string): Promise<Blob> {
  const { data } = await axios.get<Blob>(`/transcriptions/${encodeURIComponent(id)}/media/stream`, { responseType: 'blob' });
  return data;
}

// ==============================|| TAGS ||============================== //

export async function addTranscriptionTags(id: string, payload: UpsertTagsPayload): Promise<Transcription> {
  const { data } = await axios.post<Transcription>(`/transcriptions/${encodeURIComponent(id)}/tags`, payload);
  return data;
}

export async function removeTranscriptionTag(id: string, tag: string): Promise<Transcription> {
  const encodedTag = encodeURIComponent(tag);
  const { data } = await axios.delete<Transcription>(`/transcriptions/${encodeURIComponent(id)}/tags/${encodedTag}`);
  return data;
}

// ==============================|| SUMMARY ||============================== //

/** Gera resumo (backend retorna { markdown }) */
export async function generateSummary(payload: GenerateSummaryPayload): Promise<SummaryResponse> {
  const id = payload.transcriptionId;
  const { data } = await axios.post<SummaryResponse>(`/transcriptions/${encodeURIComponent(id)}/summary`, { prompt: payload.prompt });
  return data;
}

export async function listSummaries(
  transcriptionId: string
): Promise<PagedResponse<{ id: string; prompt: string; markdown: string; createdAt: string }>> {
  const { data } = await axios.get(`/transcriptions/${encodeURIComponent(transcriptionId)}/summaries`);
  return data;
}

// ==============================|| COMMENTS ||============================== //

export async function listComments(transcriptionId: string): Promise<PagedResponse<Comment>> {
  const { data } = await axios.get(`/transcriptions/${encodeURIComponent(transcriptionId)}/comments`);
  return data;
}

export async function createComment(transcriptionId: string, payload: CreateCommentPayload): Promise<Comment> {
  const { data } = await axios.post(`/transcriptions/${encodeURIComponent(transcriptionId)}/comments`, payload);
  return data;
}

export async function updateComment(transcriptionId: string, commentId: string, payload: UpdateCommentPayload): Promise<{ ok: boolean }> {
  const { data } = await axios.patch(
    `/transcriptions/${encodeURIComponent(transcriptionId)}/comments/${encodeURIComponent(commentId)}`,
    payload
  );
  return data;
}

export async function deleteComment(transcriptionId: string, commentId: string): Promise<{ ok: boolean }> {
  const { data } = await axios.delete(`/transcriptions/${encodeURIComponent(transcriptionId)}/comments/${encodeURIComponent(commentId)}`);
  return data;
}

// ==============================|| CHAT ||============================== //

export async function listChatThreads(transcriptionId: string): Promise<PagedResponse<ChatThread>> {
  const { data } = await axios.get(`/transcriptions/${encodeURIComponent(transcriptionId)}/chat/threads`);
  return data;
}

export async function listChatMessages(transcriptionId: string, threadId: string): Promise<PagedResponse<ChatMessage>> {
  const { data } = await axios.get(
    `/transcriptions/${encodeURIComponent(transcriptionId)}/chat/threads/${encodeURIComponent(threadId)}/messages`
  );
  return data;
}

export async function sendChatMessage(transcriptionId: string, payload: ChatMessagePayload): Promise<ChatSendResponse> {
  const { data } = await axios.post(`/transcriptions/${encodeURIComponent(transcriptionId)}/chat/messages`, payload);
  return data;
}

// ==============================|| INSIGHTS ||============================== //

export async function createInsights(transcriptionId: string, payload: CreateInsightsPayload): Promise<{ ok: boolean }> {
  const { data } = await axios.post(`/transcriptions/${encodeURIComponent(transcriptionId)}/insights`, payload);
  return data;
}

export async function listInsights(transcriptionId: string): Promise<PagedResponse<Insight>> {
  const { data } = await axios.get(`/transcriptions/${encodeURIComponent(transcriptionId)}/insights`);
  return data;
}

// ==============================|| SHARE LINKS ||============================== //

export async function createShareLink(transcriptionId: string, payload: CreateShareLinkPayload): Promise<ShareLink> {
  const { data } = await axios.post(`/transcriptions/${encodeURIComponent(transcriptionId)}/share-links`, payload);
  return data;
}

export async function revokeShareLink(transcriptionId: string, token: string): Promise<{ ok: boolean }> {
  const { data } = await axios.delete(`/transcriptions/${encodeURIComponent(transcriptionId)}/share-links/${encodeURIComponent(token)}`);
  return data ?? { ok: true };
}

// ==============================|| PUBLIC SHARE ||============================== //

export async function getSharedTranscription(token: string): Promise<Transcription> {
  const { data } = await axios.get<Transcription>(`/share/${encodeURIComponent(token)}`);
  return data;
}

export async function downloadSharedMediaBlob(token: string): Promise<Blob> {
  const { data } = await axios.get<Blob>(`/share/${encodeURIComponent(token)}/media/stream`, { responseType: 'blob' });
  return data;
}

// ==============================|| SEGMENTS EDITING ||============================== //

/** Atualiza um segmento específico (texto e/ou speaker) */
export async function updateSegment(transcriptionId: string, segmentId: string, payload: UpdateSegmentPayload): Promise<Transcription> {
  const { data } = await axios.patch<Transcription>(
    `/transcriptions/${encodeURIComponent(transcriptionId)}/segments/${encodeURIComponent(segmentId)}`,
    payload
  );
  return data;
}

/** Atualiza vários segmentos de uma vez */
export async function updateSegments(transcriptionId: string, payload: UpdateSegmentsPayload): Promise<{ ok: boolean; updated: number }> {
  const { data } = await axios.patch<{ ok: boolean; updated: number }>(
    `/transcriptions/${encodeURIComponent(transcriptionId)}/segments`,
    payload
  );
  return data;
}

/** Renomeia speakers (mapeamento A/B -> nomes personalizados) */
export async function updateSpeakerLabels(
  transcriptionId: string,
  payload: UpdateSpeakerLabelsPayload
): Promise<UpdateSpeakerLabelsResponse> {
  const { data } = await axios.post<UpdateSpeakerLabelsResponse>(
    `/transcriptions/${encodeURIComponent(transcriptionId)}/speakers`,
    payload
  );
  return data;
}

// ==============================|| ICE BREAKERS ||============================== //

/** Lista ice breakers de uma transcrição */
export async function listIceBreakers(transcriptionId: string): Promise<PagedResponse<IceBreaker>> {
  const { data } = await axios.get<PagedResponse<IceBreaker>>(`/transcriptions/${encodeURIComponent(transcriptionId)}/ice-breakers`);
  return data;
}

// ==============================|| TRANSCRIPTION SHARES (compartilhar com usuários) ||============================= //

/** Lista usuários com quem a transcrição foi compartilhada */
export async function listTranscriptionSharedWith(transcriptionId: string): Promise<TranscriptionSharedWithItem[]> {
  const { data } = await axios.get<{ data: TranscriptionSharedWithItem[] }>(
    `/transcription-shares/transcriptions/${encodeURIComponent(transcriptionId)}/shared-with`
  );
  return Array.isArray(data?.data) ? data.data : [];
}

/** Compartilha transcrição com um usuário */
export async function shareTranscriptionWith(transcriptionId: string, payload: ShareTranscriptionPayload): Promise<{ ok: boolean }> {
  const { data } = await axios.post<{ ok: boolean }>(
    `/transcription-shares/transcriptions/${encodeURIComponent(transcriptionId)}/share`,
    payload
  );
  return data ?? { ok: true };
}

/** Remove compartilhamento com um usuário */
export async function unshareTranscriptionWith(transcriptionId: string, sharedWithUserId: string): Promise<{ ok: boolean }> {
  const { data } = await axios.delete<{ ok: boolean }>(
    `/transcription-shares/transcriptions/${encodeURIComponent(transcriptionId)}/share/${encodeURIComponent(sharedWithUserId)}`
  );
  return data ?? { ok: true };
}

// ==============================|| FOLDER SHARES (compartilhar pasta com usuários) ||============================== //

/** Lista usuários com quem a pasta foi compartilhada */
export async function listFolderSharedWith(folderId: string): Promise<TranscriptionSharedWithItem[]> {
  const { data } = await axios.get<TranscriptionSharedWithItem[] | { data: TranscriptionSharedWithItem[] }>(
    `/transcription-shares/folders/${encodeURIComponent(folderId)}/shared-with`
  );
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.data) ? data.data : [];
}

/** Compartilha pasta com um usuário (conteúdo atual e futuro fica visível para ele) */
export async function shareFolderWith(folderId: string, payload: ShareTranscriptionPayload): Promise<{ ok: boolean }> {
  const { data } = await axios.post<{ ok: boolean }>(
    `/transcription-shares/folders/${encodeURIComponent(folderId)}/share`,
    payload
  );
  return data ?? { ok: true };
}

/** Remove compartilhamento da pasta com um usuário */
export async function unshareFolderWith(folderId: string, sharedWithUserId: string): Promise<{ ok: boolean }> {
  const { data } = await axios.delete<{ ok: boolean }>(
    `/transcription-shares/folders/${encodeURIComponent(folderId)}/share/${encodeURIComponent(sharedWithUserId)}`
  );
  return data ?? { ok: true };
}

// ==============================|| FOLDERS & EXPLORER ||============================== //

export async function listTranscriptionFolders(parentId?: string | null): Promise<TranscriptionFolder[]> {
  const { data } = await axios.get<TranscriptionFolder[] | { data: TranscriptionFolder[] }>('/transcription-folders', {
    params: parentId === undefined ? {} : { parentId }
  });
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.data) ? data.data : [];
}

export async function getTranscriptionFolder(id: string): Promise<TranscriptionFolder> {
  const { data } = await axios.get<TranscriptionFolder>(`/transcription-folders/${encodeURIComponent(id)}`);
  return data;
}

export async function createTranscriptionFolder(payload: {
  name: string;
  parentId?: string | null;
}): Promise<TranscriptionFolder> {
  const { data } = await axios.post<TranscriptionFolder>('/transcription-folders', payload);
  return data;
}

export async function updateTranscriptionFolder(
  id: string,
  patch: { name?: string; parentId?: string | null }
): Promise<TranscriptionFolder> {
  const { data } = await axios.patch<TranscriptionFolder>(`/transcription-folders/${encodeURIComponent(id)}`, patch);
  return data;
}

export async function deleteTranscriptionFolder(id: string): Promise<{ ok: boolean }> {
  const { data } = await axios.delete<{ ok: boolean }>(`/transcription-folders/${encodeURIComponent(id)}`);
  return data ?? { ok: true };
}

export async function getTranscriptionsExplorer(params: {
  folderId?: string | null;
  search?: string;
} = {}): Promise<TranscriptionsExplorerResponse> {
  const { data } = await axios.get<TranscriptionsExplorerResponse>('/transcriptions/explorer', {
    params: {
      folderId: params.folderId ?? undefined,
      search: params.search || undefined
    }
  });
  return data;
}

// ==============================|| SHARED WITH ME ||============================== //

/** Lista usuários que compartilharam pelo menos uma transcrição comigo */
export async function listSharedWithMeUsers(): Promise<SharedWithMeUser[]> {
  const { data } = await axios.get<SharedWithMeUser[] | { data: SharedWithMeUser[] }>(
    '/transcriptions/shared-with-me/users'
  );
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.data) ? data.data : [];
}

/** Explorer das transcrições compartilhadas comigo por um usuário (pastas + arquivos) */
export async function getSharedWithMeExplorer(params: {
  sharedByUserId: string;
  folderId?: string | null;
}): Promise<TranscriptionsExplorerResponse> {
  const { data } = await axios.get<TranscriptionsExplorerResponse>(
    '/transcriptions/shared-with-me/explorer',
    {
      params: {
        sharedByUserId: params.sharedByUserId,
        folderId: params.folderId ?? undefined
      }
    }
  );
  return data;
}
