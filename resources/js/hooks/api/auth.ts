import { router } from "@inertiajs/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useCallback, useEffect, useState } from "react"
import { API_ROUTES } from "@/config/api-routes"
import { fetchJson } from "@/lib/fetch-json"
import twoFactor from "@/routes/two-factor"
import {
  ConfirmAccountPasswordPayload,
  ConfirmAccountPasswordResponse,
  TwoFactorSecretKey,
  TwoFactorSetupData,
  TwoFactorVerificationPayload,
  TwoFactorVerificationResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from "@/types/auth.validation"
import { useMobileNavigation } from "../ui/use-mobile-navigation"

export const useGetCsrfToken = () => {
  return useMutation({
    mutationKey: ["csrf-token"],
    mutationFn: async () => {
      const response = await axios.get("/csrf-token")
      const token = response.data.token
      axios.defaults.headers.common["X-CSRF-TOKEN"] = token
      return token
    },
    onError: (errors) => {
      throw new Error(Object.values(errors).flat()[0] as string)
    },
  })
}

export const useLogOutUser = () => {
  const cleanup = useMobileNavigation()
  return useMutation({
    mutationKey: ["logout"],
    mutationFn: async () => {
      return new Promise((resolve, reject) => {
        router.post(API_ROUTES.LOGOUT, undefined, {
          preserveScroll: false,
          preserveState: false,
          onSuccess: () => {
            cleanup()
            router.flushAll()
            resolve({
              message: "Logged out successfully",
            })
          },
          onError: (errors) => {
            reject(new Error(Object.values(errors).flat()[0] as string))
          },
        })
      })
    },
  })
}

export const useEnableTwoFactor = () => {
  return useMutation({
    mutationKey: ["enable-two-factor"],
    mutationFn: async () => {
      return new Promise((resolve, reject) => {
        router.post(twoFactor.enable.url(), undefined, {
          preserveScroll: true,
          preserveState: true,
          onBefore: () => {
            return true
          },
          onSuccess: () => {
            resolve({ message: "Two-factor authentication enabled" })
          },
          onError: (errors) => {
            if (
              errors &&
              typeof errors === "object" &&
              "password_confirmation" in errors
            ) {
              reject(new Error("Password confirmation required"))
            } else {
              reject(new Error(Object.values(errors).flat()[0] as string))
            }
          },
        })
      })
    },
  })
}

export const useDisableTwoFactor = () => {
  return useMutation({
    mutationKey: ["disable-two-factor"],
    mutationFn: async () => {
      return new Promise((resolve, reject) => {
        router.delete(twoFactor.disable.url(), {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            resolve({
              message: "Two-factor authentication disabled successfully",
            })
          },
          onError: (errors) => {
            reject(new Error(Object.values(errors).flat()[0] as string))
          },
        })
      })
    },
  })
}

export const useTwoFactorAuth = () => {
  const [errors, setErrors] = useState<string[]>([])
  const [shouldFetchSetup, setShouldFetchSetup] = useState(false)
  const [shouldFetchRecovery, setShouldFetchRecovery] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: qrCodeData,
    isError: isQrCodeError,
    refetch: refetchQrCode,
  } = useQuery({
    queryKey: ["two-factor-qr-code"],
    queryFn: () => fetchJson<TwoFactorSetupData>(twoFactor.qrCode.url()),
    enabled: shouldFetchSetup,
    retry: false,
    staleTime: 0,
  })

  const {
    data: secretKeyData,
    isError: isSecretKeyError,
    refetch: refetchSecretKey,
  } = useQuery({
    queryKey: ["two-factor-secret-key"],
    queryFn: () => fetchJson<TwoFactorSecretKey>(twoFactor.secretKey.url()),
    enabled: shouldFetchSetup,
    retry: false,
    staleTime: 0,
  })

  const {
    data: recoveryCodesData,
    isError: isRecoveryCodesError,
    refetch: refetchRecoveryCodes,
  } = useQuery({
    queryKey: ["two-factor-recovery-codes"],
    queryFn: () => fetchJson<string[]>(twoFactor.recoveryCodes.url()),
    enabled: shouldFetchRecovery,
    retry: false,
    staleTime: 0,
  })

  const regenerateRecoveryCodesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(twoFactor.regenerateRecoveryCodes.url())
      if (!response.ok) throw new Error("Failed to regenerate codes")
      return response
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["two-factor-recovery-codes"],
      })
      await refetchRecoveryCodes()
    },
  })

  const updateErrors = useCallback(() => {
    const newErrors: string[] = []
    if (isQrCodeError) {
      newErrors.push("Failed to fetch QR code")
    }
    if (isSecretKeyError) {
      newErrors.push("Failed to fetch setup key")
    }
    if (isRecoveryCodesError) {
      newErrors.push("Failed to fetch recovery codes")
    }
    setErrors(newErrors)
  }, [isQrCodeError, isSecretKeyError, isRecoveryCodesError])

  const clearErrors = useCallback((): void => {
    setErrors([])
  }, [])

  const clearSetupData = useCallback((): void => {
    setShouldFetchSetup(false)
    setShouldFetchRecovery(false)
    clearErrors()
  }, [clearErrors])

  const fetchQrCode = useCallback(async (): Promise<void> => {
    clearErrors()
    setShouldFetchSetup(true)
    await refetchQrCode()
  }, [clearErrors, refetchQrCode])

  const fetchSetupKey = useCallback(async (): Promise<void> => {
    clearErrors()
    setShouldFetchSetup(true)
    await refetchSecretKey()
  }, [clearErrors, refetchSecretKey])

  const fetchRecoveryCodes = useCallback(async (): Promise<void> => {
    clearErrors()
    setShouldFetchRecovery(true)
    await refetchRecoveryCodes()
  }, [clearErrors, refetchRecoveryCodes])

  const fetchSetupData = useCallback(async (): Promise<void> => {
    clearErrors()
    setShouldFetchSetup(true)
    setShouldFetchRecovery(true)
    await Promise.all([
      refetchQrCode(),
      refetchSecretKey(),
      refetchRecoveryCodes(),
    ])
  }, [clearErrors, refetchQrCode, refetchSecretKey, refetchRecoveryCodes])

  const regenerateRecoveryCodes = useCallback(async (): Promise<void> => {
    clearErrors()
    await regenerateRecoveryCodesMutation.mutateAsync()
  }, [clearErrors, regenerateRecoveryCodesMutation])

  useEffect(() => {
    updateErrors()
  }, [updateErrors])

  return {
    qrCodeSvg: qrCodeData?.svg ?? null,
    manualSetupKey: secretKeyData?.secretKey ?? null,
    recoveryCodesList: recoveryCodesData ?? [],
    hasSetupData: !!(qrCodeData?.svg && secretKeyData?.secretKey),
    errors,
    clearErrors,
    clearSetupData,
    fetchQrCode,
    fetchSetupKey,
    fetchSetupData,
    fetchRecoveryCodes,
    regenerateRecoveryCodes,
    isRegenerating: regenerateRecoveryCodesMutation.isPending,
  }
}

export const useConfirmPassword = () => {
  return useMutation<
    ConfirmAccountPasswordResponse,
    Error,
    ConfirmAccountPasswordPayload
  >({
    mutationKey: ["confirm-password"],
    mutationFn: async (data: ConfirmAccountPasswordPayload) => {
      return new Promise((resolve, reject) => {
        router.post(API_ROUTES.CHANGE_PASSWORD, data, {
          preserveScroll: true,
          preserveState: true,
          replace: true,
          only: [],
          onFinish: () => {
            resolve({
              message: "Password confirmed successfully",
            })
          },
          onError: (errors) => {
            reject(new Error(Object.values(errors).flat()[0] as string))
          },
        })
      })
    },
  })
}

export const useTwoFactorVerification = () => {
  return useMutation<
    TwoFactorVerificationResponse,
    Error,
    TwoFactorVerificationPayload
  >({
    mutationKey: ["two-factor-verification"],
    mutationFn: async (data: TwoFactorVerificationPayload) => {
      return new Promise((resolve, reject) => {
        router.post(twoFactor.confirm.url(), data, {
          preserveScroll: true,
          preserveState: false,
          onSuccess: () => {
            resolve({
              message: "Two-factor authentication confirmed successfully",
            })
          },
          onError: (errors) => {
            reject(new Error(Object.values(errors).flat()[0] as string))
          },
        })
      })
    },
  })
}

export const useResendVerificationEmail = () => {
  return useMutation<VerifyEmailResponse, Error, VerifyEmailPayload>({
    mutationKey: ["resend-verification-email"],
    mutationFn: async (verifyEmailPayload: VerifyEmailPayload) => {
      return new Promise((resolve, reject) => {
        router.post(API_ROUTES.RESEND_VERIFICATION_EMAIL, verifyEmailPayload, {
          preserveScroll: true,
          preserveState: false,
          onSuccess: () => {
            resolve({
              message: "Verification email sent successfully",
              status: "verification-link-sent",
            })
          },
          onError: (errors) => {
            reject(new Error(Object.values(errors).flat()[0] as string))
          },
        })
      })
    },
  })
}
