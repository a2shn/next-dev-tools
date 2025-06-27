import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "ndt:inline-flex ndt:items-center ndt:justify-center ndt:gap-2 ndt:whitespace-nowrap ndt:rounded-md ndt:text-sm ndt:font-medium ndt:transition-all ndt:disabled:pointer-events-none ndt:disabled:opacity-50 ndt:[&_svg]:pointer-events-none ndt:[&_svg:not([class*=size-])]:size-4 ndt:shrink-0 ndt:[&_svg]:shrink-0 ndt:outline-none ndt:focus-visible:border-ring ndt:focus-visible:ring-ring/50 ndt:focus-visible:ring-[3px] ndt:aria-invalid:ring-destructive/20 ndt:dark:aria-invalid:ring-destructive/40 ndt:aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "ndt:bg-primary ndt:text-primary-foreground ndt:shadow-xs ndt:hover:bg-primary/90",
        destructive:
          "ndt:bg-destructive ndt:text-white ndt:shadow-xs ndt:hover:bg-destructive/90 ndt:focus-visible:ring-destructive/20 ndt:dark:focus-visible:ring-destructive/40 ndt:dark:bg-destructive/60",
        outline:
          "ndt:border ndt:bg-background ndt:shadow-xs ndt:hover:bg-accent ndt:hover:text-accent-foreground ndt:dark:bg-input/30 ndt:dark:border-input ndt:dark:hover:bg-input/50",
        secondary:
          "ndt:bg-secondary ndt:text-secondary-foreground ndt:shadow-xs ndt:hover:bg-secondary/80",
        ghost:
          "ndt:hover:bg-accent ndt:hover:text-accent-foreground ndt:dark:hover:bg-accent/50",
        link: "ndt:text-primary ndt:underline-offset-4 ndt:hover:underline",
      },
      size: {
        default: "ndt:h-9 ndt:px-4 ndt:py-2 ndt:has-[>svg]:px-3",
        sm: "ndt:h-8 ndt:rounded-md ndt:gap-1.5 ndt:px-3 ndt:has-[>svg]:px-2.5",
        lg: "ndt:h-10 ndt:rounded-md ndt:px-6 ndt:has-[>svg]:px-4",
        icon: "ndt:size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
