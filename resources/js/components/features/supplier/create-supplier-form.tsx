import { useForm } from "@inertiajs/react"
import { MapPin, Warehouse } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { FormStep, InertiaFieldConfig } from "@/types"
import {
  SupplierPayload,
  supplierPayloadSchema,
} from "@/types/items-utility.validation"
import { SupplierLocationRest } from "./supplier-location-rest"

export const CreateSupplierForm = () => {
  const { closeDialog } = useDynamicDialog()
  const createSupplierForm = useForm<SupplierPayload>({
    name: "",
    email: "",
    contact_person: "",
    contact_no: "",
    telefax: "",
    address: "",
    shipping: "",
    terms: "",
    location: {
      country: "",
      region: "",
      province: "",
      municipality: "",
      barangay: "",
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        supplierPayloadSchema,
        createSupplierForm.data,
        createSupplierForm,
      )
    ) {
      return
    }

    const createSupplierPromise = new Promise<void>((resolve, reject) => {
      createSupplierForm.post(API_ROUTES.CREATE_SUPPLIER, {
        preserveScroll: true,
        onSuccess: () => {
          createSupplierForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to create supplier",
            ),
          )
        },
      })
    })

    toast.promise(createSupplierPromise, {
      loading: <span className="animate-pulse">Creating supplier...</span>,
      success: "Supplier created successfully!",
      error: (error) => catchError(error),
    })
  }

  const createSupplierFields: InertiaFieldConfig<SupplierPayload>[] = useMemo(
    () => [
      {
        name: "name",
        type: "text",
        label: "Name",
        placeholder: "e.g., Auto Supply Inc.",
        disabled: createSupplierForm.processing,
        showRequiredMarker: true,
      },
      {
        name: "email",
        type: "text",
        label: "Email",
        placeholder: "e.g., info@autosupply.com",
        disabled: createSupplierForm.processing,
      },
      {
        name: "contact_person",
        type: "text",
        label: "Contact Person",
        placeholder: "e.g., John Doe",
        disabled: createSupplierForm.processing,
      },
      {
        name: "contact_no",
        type: "text",
        label: "Contact No.",
        placeholder: "e.g., +63 917 123 4567",
        disabled: createSupplierForm.processing,
      },
      {
        name: "telefax",
        type: "text",
        label: "Telefax",
        placeholder: "e.g., (02) 8555 1234",
        disabled: createSupplierForm.processing,
      },
      {
        name: "shipping",
        type: "text",
        label: "Shipping",
        placeholder: "e.g., FOB, Ex Works",
        disabled: createSupplierForm.processing,
      },
      {
        name: "location",
        type: "text",
        label: "Location",
        disabled: createSupplierForm.processing,
        showRequiredMarker: true,
        customComponent: () => (
          <SupplierLocationRest
            form={createSupplierForm}
            disabled={createSupplierForm.processing}
          />
        ),
      },
      {
        name: "address",
        type: "text",
        label: "Address",
        placeholder: "e.g., 123 Supply St., Industrial Park",
        disabled: createSupplierForm.processing,
        required: true,
      },
      {
        name: "terms",
        type: "text",
        label: "Terms",
        placeholder: "e.g., Net 30 Days, COD",
        disabled: createSupplierForm.processing,
        required: true,
      },
    ],
    [createSupplierForm.processing, createSupplierForm.data],
  )

  const formSteps: FormStep[] = useMemo(
    () => [
      {
        id: "supplier-details",
        title: "Supplier Details",
        icon: <Warehouse className="h-4 w-4" />,
        fields: ["name", "email"],
      },
      {
        id: "contacts",
        title: "Contact Details",
        icon: <MapPin className="h-4 w-4" />,
        fields: ["contact_person", "contact_no", "telefax", "shipping"],
      },
      {
        id: "location",
        title: "Location & Terms",
        icon: <MapPin className="h-4 w-4" />,
        fields: ["location", "address", "terms"],
      },
    ],
    [],
  )

  return (
    <DynamicInertiaForm<SupplierPayload>
      form={createSupplierForm}
      onSubmit={handleSubmit}
      fields={createSupplierFields}
      submitButtonTitle="Create Supplier"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={createSupplierForm.processing}
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
      size="sm"
      debug
    />
  )
}
