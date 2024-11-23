"use client"
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { Input } from './ui/input'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getFiles } from '@/lib/actions/file.actions'
import { Models } from 'node-appwrite'
import Thumbnail from './Thumbnail'
import { convertFileSize } from '@/lib/utils'
import {useDebounce} from 'use-debounce'
function Search() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get('query') || ''
  const [results, setResults] = useState<Models.Document[]>([])
  const [open, setOpen] = useState(false)
  const handleClickItem = (file: Models.Document) => {
    setOpen(false)
    setResults([])
    router.push(`/${file.$type=== 'video' || file.$type === 'audio' ? 'media' : file.type + "s"}?query=${query}`)
  }
  const [debouncedQuery] = useDebounce(query, 500)
  const path = usePathname()
  useEffect(() => {
    const fetchFiles = async () => {
      if (debouncedQuery.length===0) {
        setResults([])
        setOpen(false)
        return router.push(path.replace(searchParams.toString(), ''))
      }
      const files = await getFiles({types: [], searchText: debouncedQuery })
      setResults(files.documents)
      setOpen(true)
    }
    fetchFiles()
  }, [debouncedQuery])
  useEffect(() => {
    if (!searchQuery) {
      setQuery('')
    }
  }, [searchQuery])
  return (
    <div className='search'>
      <div className='search-input-wrapper'>
        <Image src="/assets/icons/search.svg" alt='search' width={24} height={24} className='search-icon' />
        <Input className='search-input' placeholder='Search files' value={query} onChange={(e) => setQuery(e.target.value)} />
        {open && (
          <ul className='search-result'>
            {results.length > 0 ? (
              results.map((file) => (
                <li key={file.$id} className='flex items-center justify-between' onClick={() => handleClickItem(file)}>
                  <div className='flex cursor-pointer items-center gap-4'>
                    <Thumbnail type={file.type} extension={file.extension} url={file.url} className='size-9 min-w-9' />
                    <p className='subtitle-2 text-light-100 line-clamp-1'>{file.name}</p>
                  </div>
                  <p className='subtitle-2 text-light-100'>{convertFileSize(file.size)} </p>
                </li>
              )))
              : (
                <li className='empty-result'>No files found</li>
              )}
          </ul>
        )}
      </div>
    </div>
  )
}

export default Search
