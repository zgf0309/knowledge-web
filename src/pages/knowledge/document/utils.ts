import type { KnowledgeFileRecord } from '../types';
import type { KnowledgeChunkItem } from './models';
import type { ChunkSourceSummary } from './types';

export const CHUNK_PAGE_SIZE = 5;

export const createChunkLabel = (index: number) => `#${index + 1}`;

export const normalizeChunks = (items: KnowledgeChunkItem[]) =>
  items.map((item, index) => ({
    ...item,
    label: createChunkLabel(index),
    charCount: (item.content ?? '').length,
    statusText: item.available ? '已启用' : '已停用',
  }));

export const getChunkSourceSummary = (
  chunks: KnowledgeChunkItem[],
): ChunkSourceSummary => ({
  all: chunks.length,
  original: chunks.filter((item) => item.chunk_type === 'original').length,
  custom: chunks.filter((item) => item.chunk_type === 'custom').length,
});

const AUDIO_EXTENSIONS = new Set(['wav', 'mp3', 'pcm', 'm4a', 'amr']);

const getFileExtension = (value?: string | null) => {
  const normalized = String(value ?? '')
    .split('?')[0]
    .split('#')[0];
  const extension = normalized.includes('.') ? normalized.split('.').pop() : '';
  return extension?.toLowerCase() ?? '';
};

export const isAudioDocument = (record?: KnowledgeFileRecord | null) => {
  if (!record) return false;
  const category = String(record.doc_category ?? '').toLowerCase();
  const docType = String(record.doc_type ?? '').toLowerCase();
  const nameExtension = getFileExtension(record.doc_name);
  const locationExtension = getFileExtension(record.location);

  return (
    category === 'audio' ||
    AUDIO_EXTENSIONS.has(docType) ||
    AUDIO_EXTENSIONS.has(nameExtension) ||
    AUDIO_EXTENSIONS.has(locationExtension)
  );
};

export const getPlayableAudioUrl = (
  record?: KnowledgeFileRecord | null,
  fallbackLocation?: string,
) => {
  const sourceUrl = String(record?.source_url ?? '').trim();
  const location = String(record?.location ?? '').trim();
  const candidate =
    sourceUrl || location || String(fallbackLocation ?? '').trim();

  if (/^(https?:|blob:|data:)/i.test(candidate) || candidate.startsWith('/')) {
    return candidate;
  }

  return undefined;
};
