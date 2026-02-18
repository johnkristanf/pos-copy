import { NuqsAdapter } from "nuqs/adapters/react"

export default function NuqsAdapterContext({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NuqsAdapter fullPageNavigationOnShallowFalseUpdates>
      {children}
    </NuqsAdapter>
  )
}
