import { match } from "ts-pattern"

export const getStatusTheme = (status: string) => {
  return match(status)
    .with("fully_paid", "paid", () => ({
      dot: "bg-emerald-500",
      text: "text-emerald-600",
      label: "Paid",
    }))
    .with("partially_paid", () => ({
      dot: "bg-amber-500",
      text: "text-amber-600",
      label: "Partial",
    }))
    .with("pending", () => ({
      dot: "bg-yellow-400",
      text: "text-yellow-500",
      label: "Pending",
    }))
    .with("cancelled", () => ({
      dot: "bg-red-500",
      text: "text-red-600",
      label: "Cancelled",
    }))
    .otherwise(() => ({
      dot: "bg-neutral-300",
      text: "text-neutral-400",
      label: "Pending",
    }))
}
