"use client"

import { Separator } from "@/components/ui/common/separator"

interface ReturnSteps {
  id: string | number
  number: number
  name: string
  status: string
  active: boolean
}

interface ReturnStepperProps {
  steps: ReturnSteps[]
}

export const ReturnStepper = ({ steps }: ReturnStepperProps) => {
  return (
    <div className="flex w-full justify-center p-8 gap-2">
      {steps.map((step) => (
        <div key={step.id} className="flex gap-2 justify-center">
          <div
            className={`flex justify-center items-center w-12 h-12 rounded-full ${step.active ? "bg-gray-900" : "bg-gray-200"}`}
          >
            <span
              className={`font-bold ${step.active ? "text-gray-50" : "text-gray-600"}`}
            >
              {step.number}
            </span>
          </div>

          <div className="w-30">
            <div>{step.name}</div>
            <Separator className="h-2000" />
            <div className="text-sm">{step.status}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
