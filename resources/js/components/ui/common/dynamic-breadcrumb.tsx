import { Link } from "@inertiajs/react"
import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/common/breadcrumb"
import { BreadcrumbItemProps } from "@/types"

interface DynamicBreadcrumbProps {
  items: BreadcrumbItemProps<string>[]
}

export const DynamicBreadcrumb = ({ items }: DynamicBreadcrumbProps) => {
  return (
    <Breadcrumb className="mb-2">
      <BreadcrumbList>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbItem>
              {item.href ? (
                <BreadcrumbLink asChild>
                  <Link
                    href={item.href}
                    className="hover:text-green-600 transition-colors"
                    prefetch={false}
                  >
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
