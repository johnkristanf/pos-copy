import { useForm } from "@inertiajs/react"
import { CreditCard, MapPin, User } from "lucide-react"
import { FormEvent, useMemo } from "react"
import toast from "react-hot-toast"
import { DynamicInertiaForm } from "@/components/ui/forms/dynamic-inertia-form"
import { API_ROUTES } from "@/config/api-routes"
import { useDynamicDialog } from "@/hooks/ui/use-dynamic-dialog"
import { catchError } from "@/lib/catch-error"
import { validateForm } from "@/lib/validate-field"
import { Customer, FormStep, InertiaFieldConfig } from "@/types"
import {
  UpdateCustomerPayload,
  updateCustomerSchema,
} from "@/types/customers.validation"

interface EditCustomerFormProps {
  customer: Customer
}

export function EditCustomerForm({ customer }: EditCustomerFormProps) {
  const { closeDialog } = useDynamicDialog()

  const initialValues: UpdateCustomerPayload = useMemo(
    () => ({
      customer_img: customer.customer_img || null,
      name: customer.name,
      email: customer.email ?? "",
      contact_no: customer.contact_no ?? "",
      credit_limit: customer.credit?.limit
        ? Number(customer.credit.limit)
        : null,
      credit_term: customer.credit?.term ?? null,
      country: customer.locations?.country ?? "",
      region: customer.locations?.region ?? "",
      province: customer.locations?.province ?? "",
      municipality: customer.locations?.municipality ?? "",
      barangay: customer.locations?.barangay ?? "",
    }),
    [customer],
  )

  const editCustomerForm = useForm<UpdateCustomerPayload>(initialValues)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()

    if (
      !validateForm(
        updateCustomerSchema,
        editCustomerForm.data,
        editCustomerForm,
      )
    ) {
      return
    }

    const updateCustomerPromise = new Promise<void>((resolve, reject) => {
      editCustomerForm.transform((data) => {
        const payload: any = {
          _method: "PATCH",
        }

        const keys = Object.keys(data) as (keyof UpdateCustomerPayload)[]
        keys.forEach((key) => {
          if (data[key] !== initialValues[key]) {
            payload[key] = data[key]
          }
        })

        if ("customer_img" in payload) {
          const imgData = payload.customer_img as any
          let blobId: number | undefined
          let imgUrl = null

          if (imgData && typeof imgData === "object") {
            const id = imgData.file_id || imgData.id
            if (id) {
              blobId = Number(id)
            }
            imgUrl = imgData.file_url || imgData.url
          } else if (typeof imgData === "string") {
            imgUrl = imgData
          }

          if (blobId !== undefined) {
            payload.blob_attachment_id = blobId
          }
          payload.customer_img = imgData instanceof File ? imgData : imgUrl
        }

        const locationKeys = [
          "country",
          "region",
          "province",
          "municipality",
          "barangay",
        ]
        const hasLocationChange = locationKeys.some((k) => k in payload)

        if (hasLocationChange) {
          payload.location = {
            country: data.country,
            region: data.region,
            province: data.province,
            municipality: data.municipality,
            barangay: data.barangay,
          }
        }

        return payload
      })

      editCustomerForm.post(API_ROUTES.UPDATE_CUSTOMER(customer.id), {
        preserveScroll: true,
        forceFormData: true,
        onSuccess: () => {
          editCustomerForm.reset()
          closeDialog()
          resolve()
        },
        onError: (errors: any) => {
          reject(
            new Error(
              (Object.values(errors)[0] as string) ||
                "Failed to update customer",
            ),
          )
        },
      })
    })

    toast.promise(updateCustomerPromise, {
      loading: <span className="animate-pulse">Updating Customer...</span>,
      success: "Customer updated successfully!",
      error: (error) => catchError(error),
    })
  }

  const editCustomerFields: InertiaFieldConfig<UpdateCustomerPayload>[] =
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
          disabled: editCustomerForm.processing,
        },
        {
          name: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter email address",
          disabled: editCustomerForm.processing,
        },
        {
          name: "contact_no",
          type: "text",
          label: "Contact Number",
          placeholder: "Enter contact number",
          disabled: editCustomerForm.processing,
        },
        {
          name: "credit_limit",
          type: "number",
          label: "Credit Limit",
          placeholder: "0.00",
          disabled: editCustomerForm.processing,
        },
        {
          name: "credit_term",
          type: "number",
          label: "Credit Term (Days)",
          placeholder: "0",
          disabled: editCustomerForm.processing,
        },
        {
          name: "country",
          type: "text",
          label: "Country",
          placeholder: "Enter country",
          disabled: editCustomerForm.processing,
        },
        {
          name: "region",
          type: "text",
          label: "Region",
          placeholder: "Enter region",
          disabled: editCustomerForm.processing,
        },
        {
          name: "province",
          type: "text",
          label: "Province",
          placeholder: "Enter province",
          disabled: editCustomerForm.processing,
        },
        {
          name: "municipality",
          type: "text",
          label: "Municipality",
          placeholder: "Enter municipality",
          disabled: editCustomerForm.processing,
        },
        {
          name: "barangay",
          type: "text",
          label: "Barangay",
          placeholder: "Enter barangay",
          disabled: editCustomerForm.processing,
        },
      ],
      [editCustomerForm.processing],
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
        fields: ["country", "region", "province", "municipality", "barangay"],
      },
    ],
    [],
  )

  return (
    <DynamicInertiaForm<UpdateCustomerPayload>
      form={editCustomerForm}
      onSubmit={handleSubmit}
      fields={editCustomerFields}
      submitButtonTitle="Update Customer"
      addCancelButton={true}
      onCancel={closeDialog}
      disabled={editCustomerForm.processing}
      size="sm"
      isMultiStepForm={true}
      steps={formSteps}
      validateStepBeforeNext={true}
    />
  )
}
