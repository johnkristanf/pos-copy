import { App } from "@/types"
import { IntegrationCard } from "./integration-card"

interface IntegrationGroupProps {
  title: string
  integrations: App[]
}

export function IntegrationGroup({
  title,
  integrations,
}: IntegrationGroupProps) {
  return (
    <div className="space-y-2 sm:space-y-3">
      <h3 className="text-sm sm:text-base font-medium">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {integrations.map((integration) => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  )
}
