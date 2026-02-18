export const getPaymentMethodBadge = (tag: string | undefined) => {
  switch (tag) {
    case "cash":
      return "success"
    case "credit":
      return "info"
    case "e_wallet":
      return "purple"
    default:
      return "secondary"
  }
}
