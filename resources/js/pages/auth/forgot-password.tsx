import { ReactNode } from "react"
import { ForgotPasswordForm } from "@/components/features/forgot-password/forgot-password-form"
import AuthSplitLayout from "@/components/layouts/auth-split-layout"
import TextLink from "@/components/ui/common/text-link"
import { PAGE_ROUTES } from "@/config/page-routes"
import PageLayout from "@/layouts/page-layout"

export default function ForgotPasswordPage({ status }: { status?: string }) {
  return (
    <AuthSplitLayout
      title="Forgot Password"
      description="Enter your email and password below to log in"
    >
      {status && (
        <div className="mb-4 text-center text-sm font-medium text-green-600">
          {status}
        </div>
      )}

      <div className="space-y-6">
        <ForgotPasswordForm />
        <div className="space-x-1 text-center text-sm text-muted-foreground mt-2">
          <span>Or, return to</span>
          <TextLink href={PAGE_ROUTES.LOGIN_PAGE}>log in</TextLink>
        </div>
      </div>
    </AuthSplitLayout>
  )
}

ForgotPasswordPage.layout = (page: ReactNode) => (
  <PageLayout
    title="Forgot Password"
    metaDescription="Reset the password of your account"
  >
    {page}
  </PageLayout>
)
