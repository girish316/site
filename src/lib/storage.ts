// Storage disabled — using Google Drive links instead (Firebase Spark plan)
export async function uploadResume(): Promise<string> {
  throw new Error("Firebase Storage not available on Spark plan. Use Google Drive links.");
}
export async function uploadProjectImage(): Promise<string> {
  throw new Error("Firebase Storage not available on Spark plan.");
}
export async function uploadProjectVideo(): Promise<string> {
  throw new Error("Firebase Storage not available on Spark plan.");
}
export async function uploadBlogImage(): Promise<string> {
  throw new Error("Firebase Storage not available on Spark plan.");
}
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}