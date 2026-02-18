"use client"

interface ItemsHeaderProps {
  headerTitle: string
  headerSubtitle: string
}

export const SectionHeader = ({
  headerTitle,
  headerSubtitle,
}: ItemsHeaderProps) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-semibold">{headerTitle}</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">
            {headerSubtitle}
          </p>
        </div>
      </div>
    </div>
  )
}
