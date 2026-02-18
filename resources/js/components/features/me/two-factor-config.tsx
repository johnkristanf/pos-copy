import { useState } from "react"
import { useTwoFactorAuth } from "@/hooks/api/auth"
import { TwoFactorSetupForm } from "./two-factor-setup-form"
import { TwoFactorVerificationForm } from "./two-factor-verification-form"

interface TwoFactorConfigProps {
  onClose: () => void
  onBack: () => void
}

export const TwoFactorConfig = ({ onClose, onBack }: TwoFactorConfigProps) => {
  const [step, setStep] = useState<"setup" | "verify">("setup")
  const {
    qrCodeSvg,
    manualSetupKey,
    recoveryCodesList,
    errors,
    fetchSetupData,
    regenerateRecoveryCodes,
    isRegenerating,
  } = useTwoFactorAuth()

  const handleNextStep = () => {
    setStep("verify")
  }

  const handleBack = () => {
    if (step === "verify") {
      setStep("setup")
    } else {
      onBack()
    }
  }
  return (
    <>
      {step === "setup" ? (
        <TwoFactorSetupForm
          qrCodeSvg={qrCodeSvg}
          manualSetupKey={manualSetupKey}
          recoveryCodes={recoveryCodesList}
          buttonText="Next"
          onNextStep={handleNextStep}
          errors={errors}
          fetchSetupData={fetchSetupData}
          onRegenerateRecoveryCodes={regenerateRecoveryCodes}
          isRegenerating={isRegenerating}
        />
      ) : (
        <TwoFactorVerificationForm onClose={onClose} onBack={handleBack} />
      )}
    </>
  )
}
