import { useMemo } from "react"
import { SectionHeader } from "@/components/ui/common/section-header"
import { DataTable } from "@/components/ui/data-table"
import { PaymentMethod, User } from "@/types"
import { getPaymentMethodColumn } from "./payment-method-column"
import { motion } from "framer-motion"
import { containerVariants, itemVariants } from "@/lib/animation-variants"

interface PaymentMethodSectionProps {
  paymentMethods: PaymentMethod[]
  user: User
}

export const PaymentMethodSection = ({
  paymentMethods,
  user,
}: PaymentMethodSectionProps) => {
  const paymentMethodColumns = useMemo(() => getPaymentMethodColumn(), [user])

  return (
    <motion.div
      className="space-y-3 sm:space-y-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <SectionHeader
          headerTitle="Payment Method"
          headerSubtitle="Payment Option List"
        />
      </motion.div>

      <motion.div className="flex flex-col gap-4" variants={itemVariants}>
        <motion.div
          className="flex-1 w-full min-w-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            type: "spring" as const,
            stiffness: 80,
            damping: 15,
          }}
        >
          <DataTable
            data={paymentMethods}
            columns={paymentMethodColumns}
            useInertia={true}
            searchPlaceholder="Search payment method by name..."
            emptyMessage="No defined payment method as of the moment."
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
