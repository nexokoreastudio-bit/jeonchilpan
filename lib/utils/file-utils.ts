const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']
const DOCUMENT_EXTENSIONS = ['pdf', 'pptx', 'docx', 'xlsx', 'hwp']

export function isImageFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return !!ext && IMAGE_EXTENSIONS.includes(ext)
}

export function isDocumentFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return !!ext && DOCUMENT_EXTENSIONS.includes(ext)
}
