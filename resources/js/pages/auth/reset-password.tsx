import { ReactNode } from "react"
import { ResetPasswordForm } from "@/components/features/reset-password/reset-password-form"
import AuthSplitLayout from "@/components/layouts/auth-split-layout"
import PageLayout from "@/layouts/page-layout"

interface ResetPasswordProps {
  token: string
  email: string
}

export default function ResetPasswordPage({
  token,
  email,
}: ResetPasswordProps) {
  return (
    <AuthSplitLayout
      title="Reset Password"
      description="Enter your new password below"
    >
      <ResetPasswordForm token={token} email={email} />{" "}
    </AuthSplitLayout>
  )
}

ResetPasswordPage.layout = (page: ReactNode) => (
  <PageLayout
    title="Reset Password"
    metaDescription="Reset password of your account"
  >
    {page}
  </PageLayout>
)
