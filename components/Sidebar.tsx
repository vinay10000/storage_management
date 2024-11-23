"use client"
import { avatarPlaceHolderUrl, navItems } from '@/constants'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
interface props {
  avatar :string,
  fullName: string,
  email : string
}
function Sidebar({fullName,avatar,email}:props) {
  const pathname = usePathname()
  return (
    <aside className='sidebar'>
      <Link href="/">
        <Image src = "/assets/icons/logo-full-brand.svg" width={130} height={40} className='h-auto hidden lg:block' alt='logo' />
        <Image src = "/assets/icons/logo-brand.svg" width={52} height={52} className='lg:hidden' alt='logo' />
      </Link>
      <nav className='mt-5'>
        <ul className='flex flex-1 flex-col gap-6'>
          {navItems.map(({url,name,icon})=>(
             <Link key={name} className='lg:w-full' href={url}>
              <li className={cn(`sidebar-nav-item`,pathname===url && 'shad-active')}>
                <Image alt='logo' src = {icon} width={24} height={24} className={cn(`nav-icon`,pathname===url && 'nav-icon-active')}/>
                <p className='hidden lg:block'>{name}</p>
              </li>
             </Link>
          ))}
        </ul>
      </nav>
      <Image src = "/assets/images/files-2.png" alt='logo' width={506} height={418} className='w-full' />
      <div className='sidebar-user-info'>
        <Image src={avatar} alt='avatar' width={44} height={44} className='sidebar-user-avatar'/>
        <div className='hidden lg:block'>
          <p className='subtitle-2 capitalize'>{fullName}</p>
          <p className='caption'>{email}</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
