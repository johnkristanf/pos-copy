import { useForm } from "@inertiajs/react"
import { Lock, Mail, Shield, User as UserIcon } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import {
  FormStep,
  InertiaFieldConfig,
  Permission,
  Role,
  SpecificUserFeature,
  StockLocation,
  User,
} from "@/types"
import {
  UpdateUserPayload,
  updateUserPayloadSchema,
} from "@/types/user.validation"
import { UserRoleFeatureSelector } from "./user-role-feature-selector"

interface EditUserFormProps {
  user: User
  stock_locations: StockLocation[]
  roles: Role[]
  features: SpecificUserFeature[]
  permissions: Permission[]
}

export const EditUserForm = ({
  user,
  stock_locations,
  roles,
  features,
  permissions,
}: EditUserFormProps) => {
  const { closeDialog } = useDynamicDialog()

  const initialRoleIds = useMemo(() => {
    return user.roles?.map((role) => role.id) || []
  }, [user])

  const initialSignature = useMemo(() => {
    if (user.user_signature) {
      return typeof user.user_signature === "string"
        ? user.user_signature
        : user.user_signature
    }
    if (user.signature_attachment?.file_url) {
      return user.signature_attachment.file_url
    }
    return ""
  }, [user])

  const initialUserImage = useMemo(() => {
    if (user.user_image) {
      return typeof user.user_image === "string"
        ? user.user_image
        : user.user_image
    }
    if (user.img_attachment?.file_url) {
      return user.img_attachment.file_url
    }
    return ""
  }, [user])

  const editUserForm = useForm<UpdateUserPayload>({
    first_name: user.first_name,
    middle_name: user.middle_name || "",
    last_name: user.last_name,
    email: user.email,
    stock_location_ids:
      user.assigned_stock_locations?.map((loc) => String(loc.id)) || [],
    password: "",
    roles: initialRoleIds,
    user_signature: initialSignature,
    user_image: initialUserImage,
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(updateUserPayloadSchema, editUserForm.data, editUserForm)
    ) {
      return
    }

    const updateUserPromise = new Promise<void>((resolve, reject) => {
      editUserForm.transform((data) => {
        const sigData = data.user_signature
        const userImgData = data.user_image

        const extractUrl = (value: any): string | null => {
          if (!value || value === "") {
            return null
          }

          if (typeof value === "string") {
            return value
          }

          if (typeof value === "object" && value !== null) {
            return value.file_url || value.url || null
          }

          return null
        }

        const sigUrl = extractUrl(sigData)
        const userImgUrl = extractUrl(userImgData)

        const payload: any = {
          first_name: data.first_name,
          middle_name: data.middle_name,
          last_name: data.last_name,
          email: data.email,
          stock_location_ids: data.stock_location_ids,
          roles: data.roles,
          user_signature: sigUrl,
          user_image: userImgUrl,
        }

        if (data.password && data.password.trim() !== "") {
          payload.password = data.password
        }

        return payload
      })

      editUserForm.put(API_ROUTES.UPDATE_USER(String(user.id)), {
        preserveScroll: true,
        onSuccess: () => {
          editUserForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to update user",
            ),
          )
        },
      })
    })

    toast.promise(updateUserPromise, {
      loading: <span className="animate-pulse">Updating user...</span>,
      success: "User updated successfully!",
      error: (error) => catchError(error),
    })
  }

  const stockLocationOptions = useMemo(() => {
    return stock_locations.map((loc) => ({
      value: String(loc.id),
      label: loc.name.charAt(0).toUpperCase() + loc.name.slice(1),
    }))
  }, [stock_locations])

  const editUserFields: InertiaFieldConfig<UpdateUserPayload>[] = useMemo(
    () => [
      {
        name: "first_name",
        type: "text",
        label: "First Name",
        placeholder: "Enter first name",
        disabled: editUserForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "middle_name",
        type: "text",
        label: "Middle Name",
        placeholder: "Enter middle name (optional)",
        disabled: editUserForm.processing,
      },
      {
        name: "last_name",
        type: "text",
        label: "Last Name",
        placeholder: "Enter last name",
        disabled: editUserForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "user_image",
        type: "blob-attachment",
        label: "User Image",
        placeholder: "Upload user image",
        disabled: editUserForm.processing,
        accept: "image/png, image/jpeg, image/webp",
        fieldName: "user_image",
      },
      {
        name: "user_signature",
        type: "blob-attachment",
        label: "User Signature",
        placeholder: "Upload signature",
        disabled: editUserForm.processing,
        accept: "image/png, image/jpeg, image/webp",
        isUserSignature: true,
        fieldName: "user_signature",
      },
      {
        name: "email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter email address",
        disabled: editUserForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "stock_location_ids",
        type: "multi-select",
        label: "Stock Locations",
        placeholder: "Select stock locations",
        options: stockLocationOptions,
        disabled: editUserForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "password",
        type: "password-input",
        label: "Password",
        placeholder: "Leave empty to keep current password",
        disabled: editUserForm.processing,
        showStrengthIndicator: true,
      },
      {
        name: "roles",
        type: "custom",
        label: "Roles & Permissions",
        required: true,
        showRequiredMarker: true,
        customComponent: ({ field }) => (
          <UserRoleFeatureSelector
            field={field}
            value={editUserForm.data.roles}
            onChange={(value) => editUserForm.setData("roles", value)}
            roles={roles}
            features={features}
            permissions={permissions}
            isLoading={editUserForm.processing}
          />
        ),
      },
    ],
    [
      editUserForm.processing,
      editUserForm.data.roles,
      stockLocationOptions,
      roles,
      features,
      permissions,
      editUserForm.setData,
    ],
  )

  const formSteps: FormStep[] = useMemo(
    () => [
      {
        id: "basic-info",
        title: "Basic Info",
        icon: <UserIcon className="h-4 w-4" />,
        fields: [
          "first_name",
          "middle_name",
          "last_name",
          "user_image",
          "user_signature",
        ],
      },
      {
        id: "contact",
        title: "Contact",
        icon: <Mail className="h-4 w-4" />,
        fields: ["email", "stock_location_ids"],
      },
      {
        id: "security",
        title: "Security",
        icon: <Lock className="h-4 w-4" />,
        fields: ["password"],
      },
      {
        id: "permissions",
        title: "Features",
        icon: <Shield className="h-4 w-4" />,
        fields: ["roles"],
      },
    ],
    [],
  )

  return (
    <DynamicInertiaForm<UpdateUserPayload>
      form={editUserForm}
      onSubmit={handleSubmit}
      fields={editUserFields}
      submitButtonTitle="Update User"
      onCancel={closeDialog}
      disabled={editUserForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
    />
  )
}
