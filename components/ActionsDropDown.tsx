"use client"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { actionsDropdownItems } from "@/constants"
import { constructDownloadUrl } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Models } from "node-appwrite"
import { useState } from "react"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { usePathname } from "next/navigation"
import { DeleteFile, renameFile, updateFileUsers } from "@/lib/actions/file.actions"
import { FileDetails } from "./ActionsModalContent"
import { ShareInput } from "./ActionsModalContent"

const ActionsDropDown = ({ file }: { file: Models.Document }) => {
    const [emails, setemails] = useState<string[]>([])
    const handleRemoveUser = async (email: string) => {
        const updatedEmails = emails.filter((email) => email !== email)
        const success = await updateFileUsers({ fileId: file.$id, emails: updatedEmails, path })
        if (success) {
            setemails(updatedEmails)
        }
        closeAllModals()
    }
    const path = usePathname()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDropdownOpen, setisDropdownOpen] = useState(false)
    const [action, setaction] = useState<ActionType | null>(null)
    const [name, setname] = useState(file.name)
    const [isLoading, setisLoading] = useState(false)
    const closeAllModals = () => {
        setIsModalOpen(false)
        setisDropdownOpen(false)
        setaction(null)
        setname(file.name)
    }
    const handleActions = async () => {
        if (!action) return
        setisLoading(true)
        let success = false
        const actions = {
            rename: async () => {
                await renameFile({ fileId: file.$id, name, extension: file.extension, path })
                return true;
            },
            share: async () => {
                await updateFileUsers({ fileId: file.$id, emails, path })
                return true;
            },
            delete: async () => {
                await DeleteFile({ fileId: file.$id, bucketFileId: file.bucketFileId, path })
                return true;
            },
        }
        success = await actions[action.value as keyof typeof actions]()
        if (success) {
            closeAllModals()
        }
        setisLoading(false)
    }
    const renderDailogContent = () => {
        if (!action) return null
        const { value, label } = action
        return (
            <DialogContent className="shad-dailog button">
                <DialogHeader className="flex flex-col gap-3">
                    <DialogTitle className="text-center text-light-100">{label}</DialogTitle>
                    {value === "rename" && (
                        <Input type="text" value={name} onChange={(e) => setname(e.target.value)} />
                    )}
                    {value === "details" && (
                        <FileDetails file={file} />
                    )}
                    {value === "share" && (
                        <ShareInput file={file} onInputChange={(newEmails) => setemails(newEmails)} onRemove={handleRemoveUser} />
                    )}
                    {value === "delete" && (
                        <p className="delete-confirmation">Are you sure you want to delete <span className="delete-file-name">{file.name}</span> ?</p>
                    )}
                </DialogHeader>
                {['rename', 'delete', 'share'].includes(value) && (
                    <DialogFooter className="flex flex-col gap-3 md:flex-row">
                        <Button onClick={closeAllModals} className="modal-cancel-button">Cancel</Button>
                        <Button onClick={handleActions} className="modal-submit-button">
                            <p className="capitalize">{value}</p>
                            {isLoading && (
                                <Image width={24} height={24} alt="loader" className="animate-spin" src="assets/icons/loader.svg" />
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        )
    }
    return (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setisDropdownOpen}>
                <DropdownMenuTrigger className="shad-no-focus">
                    <Image src="/assets/icons/dots.svg" alt="dots" width={34} height={34} />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className="max-w-[200px] truncate">{file.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {actionsDropdownItems.map((actionItem) => (
                        <DropdownMenuItem key={actionItem.value} className="shad-dropdown-item" onClick={() => {
                            setaction(actionItem)
                            if (['rename', 'share', 'delete', 'details'].includes(actionItem.value)) {
                                setIsModalOpen(true)
                            }
                        }}>
                            {actionItem.value === "download" ?
                                <Link download={file.name} className="flex items-center gap-2" href={constructDownloadUrl(file.bucketFileId)}>
                                    <Image src={actionItem.icon} alt={actionItem.label} width={30} height={30} />
                                    {actionItem.label}
                                </Link>
                                :
                                <div className="flex items-center gap-2">
                                    <Image src={actionItem.icon} alt={actionItem.label} width={30} height={30} />
                                    {actionItem.label}
                                </div>}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
            {renderDailogContent()}
        </Dialog>

    )
}

export default ActionsDropDown
