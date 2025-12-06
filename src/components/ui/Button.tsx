import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { motion, type HTMLMotionProps } from "framer-motion"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-3 border-neo-dark shadow-neo hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]",
    {
        variants: {
            variant: {
                default: "bg-neo-primary text-neo-dark hover:bg-neo-primary/90",
                secondary: "bg-neo-secondary text-neo-dark hover:bg-neo-secondary/90",
                accent: "bg-neo-accent text-neo-dark hover:bg-neo-accent/90",
                outline: "bg-neo-bg text-neo-dark hover:bg-neo-gray",
                ghost: "border-0 shadow-none hover:bg-neo-gray hover:translate-x-0 hover:translate-y-0",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-11 px-8",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> { }

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, ...props }, ref) => {
        return (
            <motion.button
                whileTap={{ scale: 0.95 }}
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref as any}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
