import type { Document } from "@/types/request.types";
import type { DocumentStatistics } from "../types/Documents.types";

export interface DocumentsListState {
  selectedDocument: Document | null;
  showUploadForm: boolean;
  showWorkflowModal: boolean;
  selectedProjectId: string | undefined;
  /** When set, upload form opens for resubmitting this chapter. */
  selectedChapterForUpload: number | null;
}

export interface DocumentsListData {
  documents: Document[];
  /** Latest document per chapter for chapter cards (supports resubmission). */
  documentsForChapterCards: Document[];
  statistics: DocumentStatistics;
  isLoading: boolean;
  error: Error | null;
}

export type { Document, DocumentStatistics };
