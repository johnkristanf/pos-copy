import { Provider } from "react-wrap-balancer"

export const WrapBalancerContext = ({
  children,
}: {
  children: React.ReactNode
}) => {
  return <Provider>{children}</Provider>
}
