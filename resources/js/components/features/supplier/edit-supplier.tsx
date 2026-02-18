import { useForm } from "@inertiajs/react"
import { MapPin, Warehouse } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { FormStep, InertiaFieldConfig, Supplier } from "@/types"
import {
  SupplierPayload,
  supplierPayloadSchema,
} from "@/types/items-utility.validation"
import { SupplierLocationRest } from "./supplier-location-rest"

interface EditSupplierProps {
  supplier: Supplier
}

export const EditSupplierForm = ({ supplier }: EditSupplierProps) => {
  const { closeDialog } = useDynamicDialog()
  const editSupplierForm = useForm<SupplierPayload>({
    name: supplier.name,
    email: supplier.email,
    contact_person: supplier.contact_person,
    contact_no: supplier.contact_no,
    telefax: supplier.telefax,
    address: supplier.address,
    shipping: supplier.shipping,
    terms: supplier.terms,
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
        editSupplierForm.data,
        editSupplierForm,
      )
    ) {
      return
    }

    const editSupplierPromise = new Promise<void>((resolve, reject) => {
      editSupplierForm.patch(API_ROUTES.UPDATE_SUPPLIER(String(supplier.id)), {
        preserveScroll: true,
        onSuccess: () => {
          editSupplierForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) || "Failed to edit supplier",
            ),
          )
        },
      })
    })

    toast.promise(editSupplierPromise, {
      loading: <span className="animate-pulse">Editing supplier...</span>,
      success: "Supplier edited successfully!",
      error: (error) => catchError(error),
    })
  }

  const editSupplierFields: InertiaFieldConfig<SupplierPayload>[] = useMemo(
    () => [
      {
        name: "name",
        type: "text",
        label: "Name",
        placeholder: "e.g., Auto Supply Inc.",
        disabled: editSupplierForm.processing,
        showRequiredMarker: true,
      },
      {
        name: "email",
        type: "text",
        label: "Email",
        placeholder: "e.g., info@autosupply.com",
        disabled: editSupplierForm.processing,
      },
      {
        name: "contact_person",
        type: "text",
        label: "Contact Person",
        placeholder: "e.g., John Doe",
        disabled: editSupplierForm.processing,
      },
      {
        name: "contact_no",
        type: "text",
        label: "Contact No.",
        placeholder: "e.g., +63 917 123 4567",
        disabled: editSupplierForm.processing,
      },
      {
        name: "telefax",
        type: "text",
        label: "Telefax",
        placeholder: "e.g., (02) 8555 1234",
        disabled: editSupplierForm.processing,
      },
      {
        name: "shipping",
        type: "text",
        label: "Shipping",
        placeholder: "e.g., FOB, Ex Works",
        disabled: editSupplierForm.processing,
      },
      {
        name: "location",
        type: "text",
        label: "Location",
        disabled: editSupplierForm.processing,
        showRequiredMarker: true,
        customComponent: () => (
          <SupplierLocationRest
            form={editSupplierForm}
            disabled={editSupplierForm.processing}
          />
        ),
      },
      {
        name: "address",
        type: "text",
        label: "Street",
        placeholder: "e.g., 123 Supply St., Industrial Park",
        disabled: editSupplierForm.processing,
        required: true,
      },
      {
        name: "terms",
        type: "text",
        label: "Terms",
        placeholder: "e.g., Net 30 Days, COD",
        disabled: editSupplierForm.processing,
        required: true,
      },
    ],
    [editSupplierForm.processing, editSupplierForm.data],
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
      form={editSupplierForm}
      onSubmit={handleSubmit}
      fields={editSupplierFields}
      submitButtonTitle="Edit Supplier"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={editSupplierForm.processing}
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
      size="sm"
    />
  )
}
