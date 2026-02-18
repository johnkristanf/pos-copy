import { Navbar } from "@/components/features/dashboard/navbar"

interface ContentLayoutProps {
  children: React.ReactNode
  title: string
  userId: number
}

export const ContentLayout = ({
  children,
  title,
  userId,
}: ContentLayoutProps) => {
  return (
    <>
      <Navbar title={title} userId={userId} />
      <div className="container px-4 pt-8 pb-8 sm:px-8">{children}</div>
    </>
  )
}
