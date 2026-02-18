import { useForm } from "@inertiajs/react"
import { CreditCard, MapPin, User } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useCountries } from "@/hooks/api/country"
import { usePsgc } from "@/hooks/api/psgc"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { FormStep, InertiaFieldConfig } from "@/types"
import {
  CreateCustomerPayload,
  createCustomerSchema,
} from "@/types/customers.validation"
import { CountrySelector } from "./country-selector"
import { LocationSelector } from "./location-selector"

interface CreateCustomerFormProps {
  onSuccess?: (customer?: any) => void
}

export const CreateCustomerForm = ({
  onSuccess,
}: CreateCustomerFormProps = {}) => {
  const { closeDialog } = useDynamicDialog()

  const createCustomerForm = useForm<CreateCustomerPayload>({
    customer_img: null,
    name: "",
    email: "",
    contact_no: "",
    credit_limit: 0,
    credit_term: 0,
    country: "Philippines",
    region: "",
    province: "",
    municipality: "",
    barangay: "",
  })

  const { data: countries } = useCountries()

  const selectedCountry = useMemo(() => {
    return (
      countries?.find(
        (c) => c.name.common === createCustomerForm.data.country,
      ) || null
    )
  }, [countries, createCustomerForm.data.country])

  const { data: psgcData } = usePsgc(createCustomerForm.data.region!)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        createCustomerSchema,
        createCustomerForm.data,
        createCustomerForm,
      )
    ) {
      return
    }

    const createCustomerPromise = new Promise<void>((resolve, reject) => {
      createCustomerForm.transform((data) => {
        const regionName =
          psgcData?.regions.find((r) => r.code === data.region)?.name ||
          data.region

        const provinceName =
          psgcData?.selectedRegion?.provinces.find(
            (p) => p.code === data.province,
          )?.name || data.province

        const municipalityName =
          psgcData?.selectedRegion?.citiesMunicipalities.find(
            (c) => c.code === data.municipality,
          )?.name || data.municipality

        const barangayName =
          psgcData?.selectedRegion?.barangays.find(
            (b) => b.code === data.barangay,
          )?.name || data.barangay

        return {
          ...data,
          region: regionName,
          province: provinceName,
          municipality: municipalityName,
          barangay: barangayName,
          location: {
            country: data.country,
            region: regionName,
            province: provinceName,
            municipality: municipalityName,
            barangay: barangayName,
          },
        }
      })

      createCustomerForm.post(API_ROUTES.CREATE_CUSTOMER, {
        preserveScroll: true,
        forceFormData: true,
        onSuccess: () => {
          createCustomerForm.reset()
          closeDialog()
          if (onSuccess) onSuccess()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to create customer",
            ),
          )
          closeDialog()
        },
      })
    })

    toast.promise(createCustomerPromise, {
      loading: <span className="animate-pulse">Creating Customer...</span>,
      success: "Customer created successfully!",
      error: (error) => catchError(error),
    })
  }

  const createCustomerFields: InertiaFieldConfig<CreateCustomerPayload>[] =
    useMemo(
      () => [
        {
          name: "customer_img",
          type: "blob-attachment",
          label: "Customer Image",
        },
        {
          name: "name",
          type: "text",
          label: "Customer Name",
          placeholder: "Enter customer name",
          disabled: createCustomerForm.processing,
          required: true,
          showRequiredMarker: true,
        },
        {
          name: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter email address (optional)",
          disabled: createCustomerForm.processing,
          required: false,
          showRequiredMarker: false,
        },
        {
          name: "contact_no",
          type: "text",
          label: "Contact Number",
          placeholder: "Enter contact number (optional)",
          disabled: createCustomerForm.processing,
          required: false,
        },
        {
          name: "credit_limit",
          type: "number",
          label: "Credit Limit",
          placeholder: "0.00",
          disabled: createCustomerForm.processing,
          required: false,
          showRequiredMarker: false,
        },
        {
          name: "credit_term",
          type: "number",
          label: "Credit Term (Days)",
          placeholder: "0",
          disabled: createCustomerForm.processing,
          required: false,
          showRequiredMarker: false,
        },
        {
          name: "country",
          type: "custom",
          label: "Country",
          customComponent: () => (
            <CountrySelector
              value={createCustomerForm.data.country}
              onChange={(c) =>
                createCustomerForm.setData(
                  "country",
                  typeof c === "string" ? c : c?.name.common || "",
                )
              }
              disabled={createCustomerForm.processing}
            />
          ),
        },
        {
          name: "region",
          type: "custom",
          label: "Address",
          placeholder: "",
          customComponent: () => <LocationSelector form={createCustomerForm} />,
        },
      ],
      [createCustomerForm.processing, createCustomerForm, selectedCountry],
    )

  const formSteps: FormStep[] = useMemo(
    () => [
      {
        id: "basic-info",
        title: "Basic Info",
        icon: <User className="h-4 w-4" />,
        fields: ["customer_img", "name", "email", "contact_no"],
      },
      {
        id: "financials",
        title: "Financials",
        icon: <CreditCard className="h-4 w-4" />,
        fields: ["credit_limit", "credit_term"],
      },
      {
        id: "address",
        title: "Address",
        icon: <MapPin className="h-4 w-4" />,
        fields: ["country", "region"],
      },
    ],
    [],
  )

  return (
    <DynamicInertiaForm<CreateCustomerPayload>
      form={createCustomerForm}
      onSubmit={handleSubmit}
      fields={createCustomerFields}
      submitButtonTitle="Create Customer"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={createCustomerForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
    />
  )
}
