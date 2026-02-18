import { usePage } from "@inertiajs/react"
import { ReactNode, useState } from "react"
import { CategorySection } from "@/components/features/category/category-section"
import { ContentLayout } from "@/components/layouts/content-layout"
import { DynamicBreadcrumb } from "@/components/ui/common/dynamic-breadcrumb"
import { PAGE_ROUTES } from "@/config/page-routes"
import { useRealtimeReload } from "@/hooks/api/use-realtime-reload"
import AppLayout from "@/layouts/dashboard-layout"
import PageLayout from "@/layouts/page-layout"
import { BreadcrumbItemProps, PaginatedCategories, SharedData } from "@/types"

const categoryPage: BreadcrumbItemProps<string>[] = [
  { label: "Dashboard", href: PAGE_ROUTES.DASHBOARD_PAGE },
  {
    label: "Categories",
    href: PAGE_ROUTES.ITEMS_CATEGORY_PAGE,
  },
]

interface CategoryPageProps {
  categories: PaginatedCategories
}

export default function CategoryPage({ categories }: CategoryPageProps) {
  const { auth } = usePage<SharedData>().props
  const user = auth.user
  const [updatingCategoryId, setUpdatingCategoryId] = useState<number | null>(
    null,
  )

  useRealtimeReload(
    "categories",
    ".category.modified",
    ["categories"],
    (e: any) => {
      if (e?.id) {
        setUpdatingCategoryId(e.id)
      }
    },
    () => {
      setUpdatingCategoryId(null)
    },
  )

  return (
    <AppLayout>
      <ContentLayout title={"Categories"} userId={user.id}>
        <DynamicBreadcrumb items={categoryPage} />
        <CategorySection
          categories={categories}
          updatingCategoryId={updatingCategoryId}
          setUpdatingCategoryId={setUpdatingCategoryId}
          user={user}
        />
      </ContentLayout>
    </AppLayout>
  )
}

CategoryPage.layout = (page: ReactNode) => (
  <PageLayout title="Category" metaDescription="Category">
    {page}
  </PageLayout>
)
