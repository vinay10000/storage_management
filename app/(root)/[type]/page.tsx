import Card from '@/components/Card';
import Sort from '@/components/Sort';
import { getFiles } from '@/lib/actions/file.actions';
import { getFileTypesParams } from '@/lib/utils';
import { Models } from 'node-appwrite';
import React from 'react';
import { redirect } from 'next/navigation';

interface SearchParamProps {
    params: { type: string };
    searchParams: { query?: string; sort?: string };
}

const page = async ({ params, searchParams }: SearchParamProps) => {
    const type = params.type || "";
    const types = getFileTypesParams(type) as FileType[];
    const searchText = searchParams.query || "";
    const sort = searchParams.sort || "$createdAt-desc";
    
    try {
        const files = await getFiles({ types, searchText, sort });
        
        if (!files) {
            return redirect('/sign-in');
        }
        
        return (
            <div className='page-container'>
                <section className='w-full'>
                    <h1 className='h1 capitalize'>
                        {type}
                    </h1>
                    <div className='total-size-section'>
                        <p className='body-1'>
                          Total: <span className='capitalize'>{files.total || 0} files</span>
                        </p>
                        <div className='sort-container'>
                            <p className='body-1 hidden text-light-200 sm:block'>Sort by:</p>
                            <Sort/>
                        </div>
                    </div>
                </section>
                {files.total > 0 ? (
                    <section className='file-list'>
                        {files.documents.map((file: Models.Document) => (
                            <Card key={file.$id} file={file}/>
                        ))}
                    </section>
                ) : (
                    <div className="flex-center flex-col text-center">
                        <p className="text-light-400 mt-10">No files found</p>
                    </div>
                )}
            </div>
        )
    } catch (error) {
        console.error('Error in file page:', error);
        return redirect('/sign-in');
    }
}

export default page;
