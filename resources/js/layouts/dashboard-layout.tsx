import { type ReactNode } from "react"
import { DashboardSideBar } from "@/components/layouts/dashboard-sidebar"

interface DashboardLayoutProps {
  children: ReactNode
}

export default ({ children, ...props }: DashboardLayoutProps) => (
  <DashboardSideBar {...props}>{children}</DashboardSideBar>
)
