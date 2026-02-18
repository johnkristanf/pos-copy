import { AnimatePresence, motion } from "framer-motion"
import { useEffect } from "react"
import { usePasswordStrength } from "@/hooks/ui/use-password-strength"

interface PasswordStrengthMeterProps {
  password: string | undefined | null
  onStrengthChange?: (isStrong: boolean) => void
}

export const PasswordStrengthMeter = ({
  password,
  onStrengthChange,
}: PasswordStrengthMeterProps) => {
  const { score, message, isStrong, hints, meetsRequirements } =
    usePasswordStrength(password)

  useEffect(() => {
    onStrengthChange?.(isStrong)
  }, [isStrong, onStrengthChange])

  const getColor = () => {
    switch (score) {
      case 0:
      case 1:
        return "bg-red-500"
      case 2:
        return "bg-orange-500"
      case 3:
        return "bg-yellow-500"
      case 4:
        return "bg-blue-500"
      case 5:
        return "bg-green-500"
      default:
        return "bg-gray-300"
    }
  }

  const getTextColor = () => {
    return getColor().replace("bg-", "text-")
  }

  if (!password) return null

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
        className="mt-2 p-3 bg-background rounded-lg shadow-sm border border-border overflow-hidden"
      >
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className={`h-full ${getColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${(score / 5) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <motion.p
          className={`mt-2 text-sm font-medium ${getTextColor()}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {message}
        </motion.p>

        <motion.div
          className="mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <h4 className="text-sm font-semibold text-foreground mb-2">
            Requirements:
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            <motion.div
              className={`text-xs flex items-center gap-1 ${
                meetsRequirements.hasMinLength
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35, duration: 0.2 }}
            >
              <span className="w-3 text-center">
                {meetsRequirements.hasMinLength ? "✓" : "✗"}
              </span>
              <span className="hidden sm:inline">At least 12 characters</span>
              <span className="sm:hidden">12+ characters</span>
            </motion.div>

            <motion.div
              className={`text-xs flex items-center gap-1 ${
                meetsRequirements.hasUpperCase
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.2 }}
            >
              <span className="w-3 text-center">
                {meetsRequirements.hasUpperCase ? "✓" : "✗"}
              </span>
              <span className="hidden sm:inline">Uppercase letter</span>
              <span className="sm:hidden">Uppercase (A-Z)</span>
            </motion.div>

            <motion.div
              className={`text-xs flex items-center gap-1 ${
                meetsRequirements.hasLowerCase
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.2 }}
            >
              <span className="w-3 text-center">
                {meetsRequirements.hasLowerCase ? "✓" : "✗"}
              </span>
              <span className="hidden sm:inline">Lowercase letter</span>
              <span className="sm:hidden">Lowercase (a-z)</span>
            </motion.div>

            <motion.div
              className={`text-xs flex items-center gap-1 ${
                meetsRequirements.hasNumber
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.2 }}
            >
              <span className="w-3 text-center">
                {meetsRequirements.hasNumber ? "✓" : "✗"}
              </span>
              <span>Number</span>
            </motion.div>

            <motion.div
              className={`text-xs flex items-center gap-1 col-span-full sm:col-span-1 ${
                meetsRequirements.hasSpecialChar
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.2 }}
            >
              <span className="w-3 text-center">
                {meetsRequirements.hasSpecialChar ? "✓" : "✗"}
              </span>
              <span className="hidden sm:inline">Special character</span>
              <span className="sm:hidden">Special char (!@#$...)</span>
            </motion.div>
          </div>
        </motion.div>

        {hints.length > 0 &&
          hints[0] !==
            "Great! Your password meets all security requirements" && (
            <motion.div
              className="mt-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <h4 className="text-sm font-semibold text-foreground mb-2">
                Tips:
              </h4>

              <div className="space-y-1">
                {hints
                  .slice(0, window.innerWidth < 640 ? 2 : hints.length)
                  .map((hint, index) => (
                    <motion.div
                      key={index}
                      className="text-xs text-amber-600 flex items-start gap-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65 + index * 0.1, duration: 0.2 }}
                    >
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span className="wrap-break-word">{hint}</span>
                    </motion.div>
                  ))}

                {window.innerWidth < 640 && hints.length > 2 && (
                  <motion.div
                    className="text-xs text-muted-foreground italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.2 }}
                  >
                    +{hints.length - 2} more tip{hints.length > 3 ? "s" : ""}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        {hints.length === 1 &&
          hints[0] ===
            "Great! Your password meets all security requirements" && (
            <motion.div
              className="mt-3 p-2 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3, ease: "easeOut" }}
            >
              <p className="text-xs text-green-700 dark:text-green-300 text-center">
                <span className="hidden sm:inline">{hints[0]}</span>
                <span className="sm:hidden">✓ Strong password!</span>
              </p>
            </motion.div>
          )}
      </motion.div>
    </AnimatePresence>
  )
}
