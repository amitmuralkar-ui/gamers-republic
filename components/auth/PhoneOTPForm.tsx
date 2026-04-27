"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { ArrowLeft, Phone } from "lucide-react"
import { formatPhone } from "@/lib/utils"

interface PhoneOTPFormProps {
  onBack: () => void
}

export function PhoneOTPForm({ onBack }: PhoneOTPFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function sendOTP() {
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formatPhone(phone) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to send code")
      setStep("otp")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP() {
    setError("")
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        phone: formatPhone(phone),
        otp,
        redirect: false,
      })
      if (result?.error) throw new Error("Invalid or expired code")
      router.push("/home")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={step === "otp" ? () => setStep("phone") : onBack} className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-white font-semibold text-lg">
            {step === "phone" ? "Enter your phone number" : "Enter verification code"}
          </h2>
          <p className="text-slate-400 text-sm">
            {step === "phone" ? "We'll send you a 6-digit code" : `Sent to ${phone}`}
          </p>
        </div>
      </div>

      {step === "phone" ? (
        <>
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+1 234 567 8900"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={error}
          />
          <Button
            className="w-full"
            size="lg"
            onClick={sendOTP}
            loading={loading}
            disabled={phone.length < 7}
          >
            <Phone className="w-4 h-4 mr-2" />
            Send Code
          </Button>
        </>
      ) : (
        <>
          <Input
            label="Verification Code"
            type="text"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            error={error}
          />
          <Button
            className="w-full"
            size="lg"
            onClick={verifyOTP}
            loading={loading}
            disabled={otp.length !== 6}
          >
            Verify & Sign In
          </Button>
          <button
            onClick={sendOTP}
            className="w-full text-sm text-slate-400 hover:text-violet-400 transition-colors"
          >
            Resend code
          </button>
        </>
      )}
    </div>
  )
}
