"use client"

import type React from "react"

import { useState, useRef } from "react"
// use native <img> to avoid next/image remote config and blob preview limitations
import { Button } from "./ui/button"
import { X } from "lucide-react"

interface MediaUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onUpload: (files: string[]) => void
}

export function MediaUploadModal({ isOpen, onClose, onUpload }: MediaUploadModalProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const isValidFileType = (file: File) => {
    const validTypes = [".jpg", ".jpeg", ".png", ".svg", ".zip"]
    const fileName = file.name.toLowerCase()
    return validTypes.some((type) => fileName.endsWith(type))
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const file = files[0]
    if (!file) return

    if (!isValidFileType(file)) {
      alert("jpg, png, svg, zip 파일만 업로드 가능합니다.")
      return
    }

    setSelectedFiles([file])

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index))
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleUpload = () => {
    const fileNames = selectedFiles.map((file) => file.name)
    onUpload(fileNames)
  }

  const dragText = "Drag your file to start uploading"
  const supportText = "Only support .jpg, .png, .svg and .zip files"
  const maxFilesText = "Add your document here, and you can upload 1 file"

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Media Upload</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">{maxFilesText}</p>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-blue-50/30"
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/upload-K5PppdKIVEW0RAgCfvo4VeVLkTxlaG.png"
                alt="Upload"
                width={48}
                height={48}
              />
              <p className="text-sm text-gray-700">{dragText}</p>
              <p className="text-xs text-gray-400">OR</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="text-[#3386E5] border-[#3386E5] hover:bg-blue-50"
              >
                Browse files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.svg,.zip"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3">{supportText}</p>

          {selectedFiles.length > 0 && (
            <div className="mt-6 space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    {previewUrl ? (
                      <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={previewUrl || "/placeholder.svg"}
                          alt="Preview"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 bg-yellow-100 rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium">FILE</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)}MB</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveFile(index)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            className="bg-[#3386E5] text-white hover:bg-[#2970cc]"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
