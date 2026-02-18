import { ReactNode } from "react"
import { VerifyEmailForm } from "@/components/features/verify-email/verify-email-form"
import AuthSplitLayout from "@/components/layouts/auth-split-layout"
import PageLayout from "@/layouts/page-layout"

export default function VerifyEmailPage({ status }: { status?: string }) {
  return (
    <AuthSplitLayout
      title="Verify email"
      description="Please verify your email address by clicking on the link we just emailed to you."
    >
      <VerifyEmailForm status={status} />
    </AuthSplitLayout>
  )
}

VerifyEmailPage.layout = (page: ReactNode) => (
  <PageLayout
    title="Verify Email"
    metaDescription="Reset password of your account"
  >
    {page}
  </PageLayout>
)
