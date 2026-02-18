import { Head } from "@inertiajs/react"

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  metaDescription: string
}

export default function PageLayout({
  children,
  title,
  metaDescription,
}: PageLayoutProps) {
  return (
    <>
      <Head title={title}>
        <meta name="description" content={metaDescription} />
      </Head>

      <>{children}</>
    </>
  )
}
