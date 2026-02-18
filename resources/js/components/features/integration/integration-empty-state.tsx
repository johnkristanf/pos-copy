import { Plus, Puzzle } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { Card, CardContent } from "@/components/ui/common/card"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { CreateAppForm } from "./create-app-form"

export const IntegrationsEmptyState = () => {
  const { openDialog } = useDynamicDialog()

  const handleCreateApp = () => {
    openDialog({
      title: "Create App",
      description:
        "Create the details for the app that needed to be integrated.",
      children: <CreateAppForm />,
    })
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <Puzzle className="h-8 w-8 text-muted-foreground" />
        </div>
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-semibold">No integrations yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Connect USI BridgePOS with other Bridge applications to streamline
            your workflow and enhance productivity.
          </p>
        </div>
        <Button
          onClick={handleCreateApp}
          className="mt-6"
          variant="bridge_digital"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Your First Project
        </Button>
      </CardContent>
    </Card>
  )
}
