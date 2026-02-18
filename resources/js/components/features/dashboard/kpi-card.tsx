import { Link } from "@inertiajs/react"
import { ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/common/button"
import { Card, CardContent } from "@/components/ui/common/card"

interface KpiCardProps {
  title: string
  icon: any
  value: string
  label: string
  trend?: "positive" | "negative"
  actionLink?: string
  onClick?: () => void
}

export const KpiCard = ({
  title,
  icon: Icon,
  value,
  label,
  trend,
  actionLink,
  onClick,
}: KpiCardProps) => {
  return (
    <div className="group relative rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className="absolute -inset-px rounded-xl bg-linear-to-r from-[#349083] to-[#e3ea4e] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />

      <Card className="relative h-full border border-border/60 bg-background shadow-none transition-colors group-hover:border-transparent">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-linear-to-r from-[#349083] to-[#e3ea4e] shadow-sm">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                {title}
              </div>
              <div className="font-mono text-2xl font-bold tracking-tighter text-foreground">
                {value}
              </div>
            </div>
            {actionLink && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#349083]"
                asChild
                onClick={onClick}
              >
                <Link href={actionLink}>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{label}</span>
            {trend === "positive" && (
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
