import React from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import FileUploader from './FileUploader'
import Search from './Search'
import { signOutUser } from '@/lib/actions/user.actions'

function Header({userId,accountId}:{userId:string,accountId:string}) {
  return (
    <header className='header'>
      <Search/>
      <div className='header-wrapper'>
        <FileUploader ownerId={userId} accountId={accountId}/>
        <form action={async()=>{
          "use server"
          await signOutUser();
        }}>
          <Button type='submit' className='sign-out-button'>
            <Image width={24} height={24} className='w-6' src="/assets/icons/logout.svg" alt="img"/>
          </Button>
        </form>
      </div>
    </header>
  )
}

export default Header
