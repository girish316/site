// Storage disabled — using Google Drive links instead (Firebase Spark plan)

export async function uploadResume(
  _file?: File,
  _onProgress?: (progress: number) => void
): Promise<string> {
  throw new Error("Firebase Storage not available on Spark plan. Use Google Drive links.");
}

export async function uploadProjectImage(
  _file?: File,
  _projectId?: string,
  _onProgress?: (progress: number) => void
): Promise<string> {
  throw new Error("Firebase Storage not available on Spark plan. Use Google Drive links instead.");
}

export async function uploadProjectVideo(
  _file?: File,
  _projectId?: string,
  _onProgress?: (progress: number) => void
): Promise<string> {
  throw new Error("Firebase Storage not available on Spark plan. Use Google Drive links instead.");
}

export async function uploadBlogImage(
  _file?: File,
  _blogId?: string,
  _onProgress?: (progress: number) => void
): Promise<string> {
  throw new Error("Firebase Storage not available on Spark plan. Use Google Drive links instead.");
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}