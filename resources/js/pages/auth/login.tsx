import { ReactNode } from "react"
import { LoginForm } from "@/components/features/login/login-form"
import AuthSplitLayout from "@/components/layouts/auth-split-layout"
import PageLayout from "@/layouts/page-layout"

export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Log-in"
      description="Enter your email and password below to log in"
    >
      <LoginForm />
    </AuthSplitLayout>
  )
}

LoginPage.layout = (page: ReactNode) => (
  <PageLayout title="Log in" metaDescription="Log in to your account">
    {page}
  </PageLayout>
)
