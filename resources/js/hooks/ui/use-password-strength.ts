import { useEffect, useMemo, useState } from "react"
import { PasswordStrength } from "@/types"

export const usePasswordStrength = (
  password: string | undefined | null,
): PasswordStrength => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    message: "",
    isStrong: false,
    hints: [],
    meetsRequirements: {
      hasMinLength: false,
      hasUpperCase: false,
      hasLowerCase: false,
      hasNumber: false,
      hasSpecialChar: false,
    },
  })

  const requirements = useMemo(
    () => ({
      minLength: 12,
      hasUpperCase: /[A-Z]/,
      hasLowerCase: /[a-z]/,
      hasNumber: /\d/,
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
    }),
    [],
  )

  useEffect(() => {
    if (!password) {
      setStrength({
        score: 0,
        message: "",
        isStrong: false,
        hints: ["Enter a password to check strength"],
        meetsRequirements: {
          hasMinLength: false,
          hasUpperCase: false,
          hasLowerCase: false,
          hasNumber: false,
          hasSpecialChar: false,
        },
      })
      return
    }

    const meetsRequirements = {
      hasMinLength: password.length >= requirements.minLength,
      hasUpperCase: requirements.hasUpperCase.test(password),
      hasLowerCase: requirements.hasLowerCase.test(password),
      hasNumber: requirements.hasNumber.test(password),
      hasSpecialChar: requirements.hasSpecialChar.test(password),
    }

    const score = Object.values(meetsRequirements).filter(Boolean).length

    const hints: string[] = []
    if (!meetsRequirements.hasMinLength) {
      hints.push(
        `Password should be at least ${requirements.minLength} characters long`,
      )
    }
    if (!meetsRequirements.hasUpperCase) {
      hints.push("Include at least one uppercase letter (A-Z)")
    }
    if (!meetsRequirements.hasLowerCase) {
      hints.push("Include at least one lowercase letter (a-z)")
    }
    if (!meetsRequirements.hasNumber) {
      hints.push("Include at least one number (0-9)")
    }
    if (!meetsRequirements.hasSpecialChar) {
      hints.push(
        'Include at least one special character (!@#$%^&*(),.?":{}|<>)',
      )
    }

    if (password.length > 0 && password.length < 8) {
      hints.push("Consider using a longer password for better security")
    }
    if (/(.)\1{2,}/.test(password)) {
      hints.push("Avoid repeating characters multiple times")
    }
    if (/^[a-zA-Z]+$/.test(password)) {
      hints.push("Using only letters makes your password easier to guess")
    }
    if (/^\d+$/.test(password)) {
      hints.push("Using only numbers makes your password easier to guess")
    }

    let message = ""
    let isStrong = false

    switch (score) {
      case 0:
        message = "Very weak"
        break
      case 1:
        message = "Weak"
        break
      case 2:
        message = "Fair"
        break
      case 3:
        message = "Moderate"
        break
      case 4:
        message = "Strong"
        isStrong = true
        break
      case 5:
        message = "Very strong"
        isStrong = true
        break
    }

    const finalHints =
      password.length === 0
        ? ["Enter a password to check strength"]
        : hints.length === 0
          ? ["Great! Your password meets all security requirements"]
          : hints

    setStrength({
      score,
      message,
      isStrong,
      hints: finalHints,
      meetsRequirements,
    })
  }, [password, requirements])

  return strength
}
