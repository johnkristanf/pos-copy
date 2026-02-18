import {
  FileArchive,
  FileAudio,
  FileCode,
  File as FileIcon,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
} from "lucide-react"

export const getFileIcon = (mimeType: string | null) => {
  if (!mimeType) return <FileIcon className="h-8 w-8 text-muted-foreground" />

  if (mimeType.startsWith("image/"))
    return <FileImage className="h-8 w-8 text-purple-500" />
  if (mimeType.startsWith("video/"))
    return <FileVideo className="h-8 w-8 text-pink-500" />
  if (mimeType.startsWith("audio/"))
    return <FileAudio className="h-8 w-8 text-yellow-500" />
  if (mimeType === "application/pdf")
    return <FileText className="h-8 w-8 text-red-500" />
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv")
  )
    return <FileSpreadsheet className="h-8 w-8 text-green-500" />
  if (mimeType.includes("zip") || mimeType.includes("compressed"))
    return <FileArchive className="h-8 w-8 text-orange-500" />
  if (
    mimeType.includes("json") ||
    mimeType.includes("xml") ||
    mimeType.includes("html") ||
    mimeType.includes("javascript")
  )
    return <FileCode className="h-8 w-8 text-slate-500" />

  return <FileIcon className="h-8 w-8 text-blue-500" />
}
