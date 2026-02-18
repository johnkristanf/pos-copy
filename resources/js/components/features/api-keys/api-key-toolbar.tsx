import { Plus } from "lucide-react"
import { Button } from "@/components/ui/common/button"

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select"

interface ApiKeyToolbarProps {
  onCreateNew?: () => void
  app: {
    id: number
    name: string
    slug: string
  }
  selectedStatus?: string
}

export const ApiKeyToolbar = ({
  onCreateNew,
  // project,
  // selectedStatus,
}: ApiKeyToolbarProps) => {
  // const handleStatusFilter = (value: string) => {
  //   router.get(
  //     `/integration/${project.slug}/${project.id}`,
  //     { status: value === "all" ? undefined : value, page: 1 },
  //     { preserveState: true, preserveScroll: true },
  //   )
  // }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* <Select
        value={selectedStatus || "all"}
        onValueChange={handleStatusFilter}
      >
        <SelectTrigger className="w-[150px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
          <SelectItem value="revoked">Revoked</SelectItem>
        </SelectContent>
      </Select> */}

      <Button onClick={onCreateNew} variant={"bridge_digital"}>
        <Plus className="h-4 w-4 mr-2" />
        Create API Key
      </Button>
    </div>
  )
}
