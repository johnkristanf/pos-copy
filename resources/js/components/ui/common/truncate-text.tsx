import { useState } from "react"

export const TruncateText = ({
  text,
  maxLength = 25,
  className = "",
}: {
  text: string
  maxLength?: number
  className?: string
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!text) return null

  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>
  }

  return (
    <span
      className={`inline-block align-middle ${className} wrap-break-word whitespace-normal`}
    >
      {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsExpanded(!isExpanded)
        }}
        className="ml-1 inline-flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline hover:text-primary/80 align-middle"
      >
        {isExpanded ? "Less" : "More"}
      </button>
    </span>
  )
}
