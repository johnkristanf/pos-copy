import { Deferred } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { UnitOfMeasureSection } from "@/components/features/unit-of-measure/unit-of-measure-section"
import { UnitOfMeasureSkeleton } from "@/components/features/unit-of-measure/unit-of-measure-skeleton"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedUnitOfMeasure, User } from "@/types"

const unitOfMeasurePage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Unit of Measure",
    href: PAGE_ROUTES.ITEM_UNIT_OF_MEASURE,
  },
]

interface UnitOfMeasurePageProps {
  unitOfMeasure: PaginatedUnitOfMeasure
  auth: {
    user: User
  }
}

export default function UnitOfMeasurePage({
  unitOfMeasure,
  auth,
}: UnitOfMeasurePageProps) {
  const [updatingUomId, setUpdatingUomId] = useState<number | null>(null)

  useRealtimeReload(
    "unit-of-measures",
    ".unit-of-measure.modified",
    ["unitOfMeasure"],
    (e: any) => {
      if (e?.id) {
        setUpdatingUomId(e.id)
      }
    },
    () => {
      setUpdatingUomId(null)
    },
  )

  return (
    <AppLayout>
      <ContentLayout title={"Item Unit of Measure"} userId={auth.user.id}>
        <DynamicBreadcrumb items={unitOfMeasurePage} />
        {unitOfMeasure ? (
          <UnitOfMeasureSection
            unitOfMeasure={unitOfMeasure}
            updatingUomId={updatingUomId}
            setUpdatingUomId={setUpdatingUomId}
            user={auth.user}
          />
        ) : (
          <Deferred data="unitOfMeasure" fallback={<UnitOfMeasureSkeleton />}>
            <UnitOfMeasureSection
              unitOfMeasure={unitOfMeasure}
              updatingUomId={updatingUomId}
              setUpdatingUomId={setUpdatingUomId}
              user={auth.user}
            />
          </Deferred>
        )}
      </ContentLayout>
    </AppLayout>
  )
}

UnitOfMeasurePage.layout = (page: ReactNode) => (
  <PageLayout
    title="Items Unit of Measure"
    metaDescription="Items Unit of Measure"
  >
    {page}
  </PageLayout>
)
