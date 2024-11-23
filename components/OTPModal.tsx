"use client"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import Image from "next/image"
import { useState } from "react"
import { Button } from "./ui/button"
import { sendEmailOTP, verifySecret } from "@/lib/actions/user.actions"
import { useRouter } from "next/navigation"


function OTPModal({ accountId, email }: { accountId: string, email: string }) {
    const [isOpen, setIsOpen] = useState(true)
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter()
    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const sessionId = await verifySecret({accountId,password})
            if(sessionId) router.push("/")
            
        } catch (error) {
            console.log(error)
            setIsLoading(false)
        }
        setIsLoading(false)
    }
    const handleResendOTP = async () => {
        await sendEmailOTP(email)
     }

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogContent className="shad-alert-dailog">
                <AlertDialogHeader className="relative flex justify-center">
                    <AlertDialogTitle className="h2 text-center">Enter your OTP
                        <Image src="/assets/icons/close-dark.svg" alt="close" width={20} height={20} className="otp-close-button" onClick={() => { setIsOpen(false) }} />
                    </AlertDialogTitle>
                    <AlertDialogDescription className="subtitle-2 text-center text-light-100">
                        We&apos;ve sent a code to your <span className="pl-1 text-brand">{email}</span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <InputOTP maxLength={6} value={password} onChange={setPassword}>
                    <InputOTPGroup className="shad-otp">
                        <InputOTPSlot index={0} className="shad-otp-slot" />
                        <InputOTPSlot index={1} className="shad-otp-slot" />
                        <InputOTPSlot index={2} className="shad-otp-slot" />
                        <InputOTPSlot index={3} className="shad-otp-slot" />
                        <InputOTPSlot index={4} className="shad-otp-slot" />
                        <InputOTPSlot index={5} className="shad-otp-slot" />
                    </InputOTPGroup>
                </InputOTP>

                <AlertDialogFooter>
                    <div className="flex w-full flex-col gap-4">
                        <AlertDialogAction onClick={handleSubmit} className="shad-submit-btn h-12" type="button">Submit
                            {isLoading && <Image src="/assets/icons/loader.svg" width={22} height={22} alt="loader" className="ml-2 animate-spin"/>}
                        </AlertDialogAction>
                        <div className="h4 mt-2 text-light-100 text-center">
                            Didn&apos;t get a code ? 
                            <Button variant = "link" className="pl-1 text-brand-100" onClick={handleResendOTP}>Click to resend</Button>
                        </div>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    )
}

export default OTPModal
