# React Context API

## The Problem with Prop Drilling

While prop drilling (passing data through multiple component levels) is straightforward, it becomes problematic when:

- Data needs to pass through intermediate components that don't use it
- Component hierarchies are deep
- Code becomes harder to maintain and read

## Solution: React Context API

The Context API provides a clean way to share data across multiple components without prop drilling.

### 1. Create the Context 

Create `src/context/InventoryContext.tsx`:

```typescript
// src/context/InventoryContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { Category } from '@/types/inventory';

// Define the shape of the context data
interface InventoryContextType {
  categories: Category[];
}

// 1. Create the Context object
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// 2. Create the Provider component
interface InventoryProviderProps {
  categories: Category[];
  children: ReactNode;
}

export const InventoryProvider = ({ categories, children }: InventoryProviderProps) => {
  const contextValue: InventoryContextType = {
    categories,
  };

  return (
    <InventoryContext.Provider value={contextValue}>
      {children}
    </InventoryContext.Provider>
  );
};

// 3. Create a custom hook for easy consumption
export const useInventoryContext = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventoryContext must be used within an InventoryProvider');
  }
  return context;
};
```


### 2. Wrap Your Application  

Use the Provider in your main page (`inventory.tsx`):

```typescript
// inventory.tsx (Updated)

import { InventoryProvider } from '@/context/InventoryContext';
import { Category } from "@/types/inventory"
import { InventorySection } from "@/components/features/items/inventory-section"

export default function Inventory({ category }: InventoryPageProps) {
  return (
    <AppLayout>
      {/* Wrap content with Provider and pass the data */}
      <InventoryProvider categories={category}> 
        <ContentLayout title={"Inventory"}>
          <DynamicBreadcrumb items={integrationPage} />
          {/* InventorySection no longer needs the categories prop */}
          <InventorySection /> 
          <div></div>
        </ContentLayout>
      </InventoryProvider>
    </AppLayout>
  )
}
```

### 3. Consume Context in Components  

Use the custom hook directly where you need the data:

```
// InventoryToolbar.tsx (Updated)

import { useInventoryContext } from '@/context/InventoryContext';

interface InventoryToolbarProps {
  // categories prop is removed!
  onCreateNew?: () => void
}

export function InventoryToolbar({ onCreateNew }: InventoryToolbarProps) {
  // Access categories directly from context
  const { categories } = useInventoryContext(); 

  return (
    <div className="flex justify-between">
      <div className="flex gap-2">
        <Select>
          <SelectTrigger className="w-30">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Category</SelectLabel>
              {/* Map over categories from context */}
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.code}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {/* ... rest of component ... */}
      </div>
    </div>
  )
}

```
