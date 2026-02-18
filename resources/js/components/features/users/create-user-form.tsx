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
} from "@/types"
import {
  CreateUserPayload,
  createUserPayloadSchema,
} from "@/types/user.validation"
import { UserRoleFeatureSelector } from "./user-role-feature-selector"

interface CreateUserFormProps {
  stock_locations: StockLocation[]
  roles: Role[]
  features: SpecificUserFeature[]
  permissions: Permission[]
}

export const CreateUserForm = ({
  stock_locations,
  roles,
  features,
  permissions,
}: CreateUserFormProps) => {
  const { closeDialog } = useDynamicDialog()

  const createUserForm = useForm<CreateUserPayload>({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    stock_location_ids: [],
    password: "",
    roles: [],
    user_signature: "",
    user_image: "",
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        createUserPayloadSchema,
        createUserForm.data,
        createUserForm,
      )
    ) {
      return
    }

    const createUserPromise = new Promise<void>((resolve, reject) => {
      createUserForm.transform((data) => {
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
          password: data.password,
          roles: data.roles,
          user_signature: sigUrl,
          user_image: userImgUrl,
        }

        return payload
      })

      createUserForm.post(API_ROUTES.CREATE_USER, {
        preserveScroll: true,
        onSuccess: () => {
          createUserForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to create user",
            ),
          )
        },
      })
    })

    toast.promise(createUserPromise, {
      loading: <span className="animate-pulse">Creating user...</span>,
      success: "User created successfully!",
      error: (error) => catchError(error),
    })
  }

  const stockLocationOptions = useMemo(() => {
    return stock_locations.map((loc) => ({
      value: String(loc.id),
      label: loc.name.charAt(0).toUpperCase() + loc.name.slice(1),
    }))
  }, [stock_locations])

  const createUserFields: InertiaFieldConfig<CreateUserPayload>[] = useMemo(
    () => [
      {
        name: "first_name",
        type: "text",
        label: "First Name",
        placeholder: "Enter first name",
        disabled: createUserForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "middle_name",
        type: "text",
        label: "Middle Name",
        placeholder: "Enter middle name (optional)",
        disabled: createUserForm.processing,
      },
      {
        name: "last_name",
        type: "text",
        label: "Last Name",
        placeholder: "Enter last name",
        disabled: createUserForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "user_image",
        type: "blob-attachment",
        label: "User Image",
        placeholder: "Upload user image",
        disabled: createUserForm.processing,
        accept: "image/png, image/jpeg, image/webp",
        fieldName: "user_image",
      },
      {
        name: "user_signature",
        type: "blob-attachment",
        label: "User Signature",
        placeholder: "Upload signature",
        disabled: createUserForm.processing,
        accept: "image/png, image/jpeg, image/webp",
        isUserSignature: true,
        fieldName: "user_signature",
      },
      {
        name: "email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter email address",
        disabled: createUserForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "stock_location_ids",
        type: "multi-select",
        label: "Stock Locations",
        placeholder: "Select stock locations",
        options: stockLocationOptions,
        disabled: createUserForm.processing,
        required: true,
        showRequiredMarker: true,
      },
      {
        name: "password",
        type: "password-input",
        label: "Password",
        placeholder: "Enter password",
        disabled: createUserForm.processing,
        showStrengthIndicator: true,
        required: true,
        showRequiredMarker: true,
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
            value={createUserForm.data.roles}
            onChange={(value) => createUserForm.setData("roles", value)}
            roles={roles}
            features={features}
            permissions={permissions}
            isLoading={createUserForm.processing}
          />
        ),
      },
    ],
    [
      createUserForm.processing,
      createUserForm.data.roles,
      stockLocationOptions,
      roles,
      features,
      permissions,
      createUserForm.setData,
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
    <DynamicInertiaForm<CreateUserPayload>
      form={createUserForm}
      onSubmit={handleSubmit}
      fields={createUserFields}
      submitButtonTitle="Create User"
      onCancel={closeDialog}
      disabled={createUserForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
    />
  )
}
