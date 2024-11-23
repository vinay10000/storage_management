"use client"
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from './ui/button'
import { cn, convertFileToUrl, getFileType } from '@/lib/utils'
import Image from 'next/image'
import Thumbnail from './Thumbnail'
import { useToast } from "@/hooks/use-toast"

import { MAX_FILE_SIZE } from '@/constants'
import { uploadFile } from '@/lib/actions/file.actions'
import { usePathname } from 'next/navigation'
interface Props {
  ownerId: string,
  accountId: string,
  className?: string,
}

function FileUploader({ ownerId, accountId, className }: Props) {
  const path = usePathname()
  const [files, setFiles] = useState<File[]>([])
  const { toast } = useToast()
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles(acceptedFiles)
    const uploadPromises = acceptedFiles.map(async (file) => {
      if (file.size > MAX_FILE_SIZE) {
        setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name))
        return toast({
          description: (<p className='body-2 text-white'>
            File <span className='font-bold'>{file.name}</span> is too large. Please upload a file that is less than 50MB
          </p>), className: "error-toast"
        })
      }
      return uploadFile({file,ownerId,accountId,path}).then((uploadedFile)=>{
        if(uploadedFile){
          setFiles((prevFiles) => prevFiles.filter((f) => f.name !== file.name))
        }
      })
    })
    await Promise.all(uploadPromises)
  }, [ownerId,accountId,path])
  const { getRootProps, getInputProps } = useDropzone({ onDrop })
  const handleRemoveFile = (e: React.MouseEvent<HTMLImageElement, MouseEvent>, fileName: string) => {
    e.stopPropagation()
    setFiles((prevFiles) => prevFiles.filter((file) => file.name !== fileName))
  }
  return (
    <div {...getRootProps()} className='cursor-pointer'>
      <input {...getInputProps()} />
      <Button type='button' className={cn("uploader-button", className)}>
        <Image alt='upload' width={24} height={24} src="/assets/icons/upload.svg" />
        <p className='h5'>Upload</p>
      </Button>
      {files.length > 0 && (
        <ul className='uploader-preview-list'>
          <h4 className='h4 text-light-100'>Uploading</h4>
          {files.map((file, index) => {
            const { type, extension } = getFileType(file.name);
            return (
              <li key={`${file.name}-${index}`} className='uploader-preview-item'>
                <div className='flex items-center gap-3'>
                  <Thumbnail type={type} extension={extension} url={convertFileToUrl(file)} />
                  <div className='preview-item-name'>{file.name}
                    <Image alt='loader' width={80} height={26} src="/assets/icons/file-loader.gif" />
                  </div>
                </div>
                <Image src="/assets/icons/remove.svg" width={24} height={24} alt='remove' onClick={(e) => { handleRemoveFile(e, file.name) }} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default FileUploader
