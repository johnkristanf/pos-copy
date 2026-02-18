import { Moon, Sun, SunDim } from "lucide-react"
import { useRef } from "react"
import { flushSync } from "react-dom"
import { Button } from "@/components/ui/common/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/common/tooltip"
import { useAppearance } from "@/hooks/ui/use-appearance"
import { cn } from "@/lib/cn"

export const ChangeThemeButton = () => {
  const { appearance, updateAppearance } = useAppearance()

  const toggleTheme = () => {
    const newTheme = appearance === "dark" ? "light" : "dark"
    updateAppearance(newTheme)
  }

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <Button
          className="size-8 rounded-full hover:bg-black/20"
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
        >
          <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 scale-0 dark:text-white transition-transform duration-500 ease-in-out hover:text-black dark:rotate-0 dark:scale-100" />

          <Sun className="dark:-rotate-90 absolute h-[1.2rem] w-[1.2rem] rotate-0 scale-100 dark:text-white transition-transform duration-500 ease-in-out dark:scale-0" />
          <span className="sr-only">Switch Theme</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Switch Theme</TooltipContent>
    </Tooltip>
  )
}

interface AnimatedThemeTogglerProps {
  className?: string
}

export const AnimatedThemeToggler = ({
  className,
}: AnimatedThemeTogglerProps) => {
  const { appearance, updateAppearance } = useAppearance()
  const buttonRef = useRef<HTMLButtonElement | null>(null)

  const changeTheme = async () => {
    if (!buttonRef.current) return

    await document.startViewTransition(() => {
      flushSync(() => {
        const isDark = document.documentElement.classList.contains("dark")
        const newTheme = isDark ? "light" : "dark"
        updateAppearance(newTheme)
      })
    }).ready

    const { top, left, width, height } =
      buttonRef.current.getBoundingClientRect()
    const y = top + height / 2
    const x = left + width / 2

    const right = window.innerWidth - left
    const bottom = window.innerHeight - top
    const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom))

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRad}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 700,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      },
    )
  }

  const isDarkMode =
    appearance === "dark" ||
    (appearance === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)

  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={changeTheme}
      className={cn(className)}
    >
      {isDarkMode ? <SunDim /> : <Moon />}
    </button>
  )
}
