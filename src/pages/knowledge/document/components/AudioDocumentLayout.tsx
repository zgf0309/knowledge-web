import type { KnowledgeChunkItem, KnowledgeInsightItem } from '../models';
import type {
  AudioSourceInfo,
  SourceFilterValue,
  StatusFilterValue,
} from '../types';
import AudioSourcePanel from './AudioSourcePanel';
import DocumentChunkPanel from './DocumentChunkPanel';
import DocumentInsightPanel from './DocumentInsightPanel';

interface AudioDocumentLayoutProps {
  audio: AudioSourceInfo;
  filteredChunks: KnowledgeChunkItem[];
  pagedChunks: KnowledgeChunkItem[];
  chunkCount: number;
  chunkPage: number;
  currentChunkId: string;
  searchKeyword: string;
  sourceFilter: SourceFilterValue;
  statusFilter: StatusFilterValue;
  sourceSummary: {
    all: number;
    original: number;
    custom: number;
  };
  visibleInsights: KnowledgeInsightItem[];
  onSearchChange: (value: string) => void;
  onSourceFilterChange: (value: SourceFilterValue) => void;
  onStatusFilterChange: (value: StatusFilterValue) => void;
  onCreateChunk: () => void;
  onSelectChunk: (chunkId: string) => void;
  onEditChunk: (chunk: KnowledgeChunkItem) => void;
  onCopyChunk: (chunk: KnowledgeChunkItem) => void;
  onToggleChunk: (chunkId: string, enabled: boolean) => void;
  onDeleteChunk: (chunk: KnowledgeChunkItem) => void;
  onPageChange: (page: number) => void;
  onCreateInsight: () => void;
  onEditInsight: (insightId: string) => void;
  onDeleteInsight: (insightId: string) => void;
  loading?: boolean;
}

const AudioDocumentLayout = ({
  audio,
  filteredChunks,
  pagedChunks,
  chunkCount,
  chunkPage,
  currentChunkId,
  searchKeyword,
  sourceFilter,
  statusFilter,
  sourceSummary,
  visibleInsights,
  onSearchChange,
  onSourceFilterChange,
  onStatusFilterChange,
  onCreateChunk,
  onSelectChunk,
  onEditChunk,
  onCopyChunk,
  onToggleChunk,
  onDeleteChunk,
  onPageChange,
  onCreateInsight,
  onEditInsight,
  onDeleteInsight,
  loading,
}: AudioDocumentLayoutProps) => (
  <div className="knowledge-document-page__layout knowledge-document-page__layout--audio">
    <div className="knowledge-document-page__audio-main">
      <AudioSourcePanel audio={audio} />
      <DocumentChunkPanel
        filteredChunks={filteredChunks}
        pagedChunks={pagedChunks}
        chunkCount={chunkCount}
        chunkPage={chunkPage}
        currentChunkId={currentChunkId}
        searchKeyword={searchKeyword}
        sourceFilter={sourceFilter}
        statusFilter={statusFilter}
        sourceSummary={sourceSummary}
        title="切片信息"
        showSubtitle={false}
        showSourceFilter={false}
        onSearchChange={onSearchChange}
        onSourceFilterChange={onSourceFilterChange}
        onStatusFilterChange={onStatusFilterChange}
        onCreateChunk={onCreateChunk}
        onSelectChunk={onSelectChunk}
        onEditChunk={onEditChunk}
        onCopyChunk={onCopyChunk}
        onToggleChunk={onToggleChunk}
        onDeleteChunk={onDeleteChunk}
        onPageChange={onPageChange}
        loading={loading}
      />
    </div>
    <DocumentInsightPanel
      visibleInsights={visibleInsights}
      onCreateInsight={onCreateInsight}
      onEditInsight={onEditInsight}
      onDeleteInsight={onDeleteInsight}
    />
  </div>
);

export default AudioDocumentLayout;
