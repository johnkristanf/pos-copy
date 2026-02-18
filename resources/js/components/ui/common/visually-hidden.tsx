import * as VisuallyHidden from "@radix-ui/react-visually-hidden"

export const VisuallyHiddenComponent = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return <VisuallyHidden.Root>{children}</VisuallyHidden.Root>
}
