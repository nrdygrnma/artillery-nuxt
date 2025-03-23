// General API response type
export interface ApiResponseBase {
  success: boolean;
  message?: string;
}

// Response for file listing
export interface FileListResponse extends ApiResponseBase {
  files: { filename: string; uploadedDate: string }[];
}

// Response for a single file operation (upload/delete)
export interface FileOperationResponse extends ApiResponseBase {
  filename?: string;
  uploadedDate?: string;
}

// Represents an individual file item for display
export type FileItem = {
  id: string;
  name: string;
  uploadedDate: Date;
};
