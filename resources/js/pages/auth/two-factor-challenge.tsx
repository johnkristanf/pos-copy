import { ReactNode, useMemo, useState } from "react"
import { TwoFactorChallengeForm } from "@/components/features/two-factor-challenge/two-factor-challenge-form"
import AuthSplitLayout from "@/components/layouts/auth-split-layout"
import TextLink from "@/components/ui/common/text-link"
import { PAGE_ROUTES } from "@/config/page-routes"
import PageLayout from "@/layouts/page-layout"

export default function TwoFactorChallengePage() {
  const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false)

  const authConfigContent = useMemo<{
    title: string
    description: string
    toggleText: string
  }>(() => {
    if (showRecoveryInput) {
      return {
        title: "Recovery Code",
        description:
          "Please confirm access to your account by entering one of your emergency recovery codes.",
        toggleText: "login using an authentication code",
      }
    }

    return {
      title: "Authentication Code",
      description:
        "Enter the authentication code provided by your authenticator application.",
      toggleText: "login using a recovery code",
    }
  }, [showRecoveryInput])

  const toggleRecoveryMode = (): void => {
    setShowRecoveryInput(!showRecoveryInput)
  }

  return (
    <AuthSplitLayout
      title={authConfigContent.title}
      description={authConfigContent.description}
    >
      <div className="space-y-6">
        <TwoFactorChallengeForm showRecoveryInput={showRecoveryInput} />
        <div className="space-y-2 text-center text-sm">
          <button
            type="button"
            onClick={toggleRecoveryMode}
            className="text-muted-foreground underline-offset-4 hover:underline"
          >
            {authConfigContent.toggleText}
          </button>

          <div className="text-muted-foreground">
            <span>remembered your password? </span>
            <TextLink href={PAGE_ROUTES.LOGIN_PAGE}>Log in</TextLink>
          </div>
        </div>
      </div>
    </AuthSplitLayout>
  )
}

TwoFactorChallengePage.layout = (page: ReactNode) => (
  <PageLayout
    title="Two Factor Challenge"
    metaDescription="Enter two factor code to login"
  >
    {page}
  </PageLayout>
)
