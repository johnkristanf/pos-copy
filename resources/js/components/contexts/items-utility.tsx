import { createContext, ReactNode, useContext } from "react"
import {
  Category,
  Item,
  Location,
  PaymentMethod,
  StockLocation,
  Supplier,
  UnitOfMeasure,
} from "@/types"

interface ItemsUtilityContextType {
  categories?: Category[]
  location?: Location[]
  supplier?: Supplier[]
  unit_of_measures?: UnitOfMeasure[]
  items?: Item[]
  stockLocation?: StockLocation[]
  paymentMethods?: PaymentMethod[]
}

const ItemsUtilityContext = createContext<ItemsUtilityContextType | undefined>(
  undefined,
)

interface ItemsUtilityProviderProps {
  categories?: Category[]
  location?: Location[]
  supplier?: Supplier[]
  unit_of_measures?: UnitOfMeasure[]
  items?: Item[]
  stockLocation?: StockLocation[]
  paymentMethods?: PaymentMethod[]
  children: ReactNode
}

export const ItemsUtilityProvider = ({
  categories,
  location,
  supplier,
  unit_of_measures,
  items,
  children,
  stockLocation,
  paymentMethods,
}: ItemsUtilityProviderProps) => {
  const contextValue: ItemsUtilityContextType = {
    categories,
    location,
    supplier,
    unit_of_measures,
    items,
    stockLocation,
    paymentMethods,
  }

  return (
    <ItemsUtilityContext.Provider value={contextValue}>
      {children}
    </ItemsUtilityContext.Provider>
  )
}

export const useItemsUtilityContext = () => {
  const context = useContext(ItemsUtilityContext)
  if (context === undefined) {
    throw new Error(
      "useItemsUtilityContext must be used within an ItemsUtilityProvider",
    )
  }
  return context
}
