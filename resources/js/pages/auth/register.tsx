import { Head } from "@inertiajs/react"
import { ReactNode } from "react"
import { RegisterForm } from "@/components/features/register/register-form"
import AuthSplitLayout from "@/components/layouts/auth-split-layout"
import TextLink from "@/components/ui/common/text-link"
import { PAGE_ROUTES } from "@/config/page-routes"
import PageLayout from "@/layouts/page-layout"

export default function RegisterPage() {
  return (
    <AuthSplitLayout
      title="Create an account"
      description="Enter your details below to create your account"
    >
      <Head title="Register" />
      <RegisterForm />
      <div className="text-center text-sm text-muted-foreground mt-2">
        Already have an account?{" "}
        <TextLink href={PAGE_ROUTES.LOGIN_PAGE}>Log in</TextLink>
      </div>
    </AuthSplitLayout>
  )
}

RegisterPage.layout = (page: ReactNode) => (
  <PageLayout title="Register" metaDescription="Register your account">
    {page}
  </PageLayout>
)
