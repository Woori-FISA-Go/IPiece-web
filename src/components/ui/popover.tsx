"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type PopoverContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  triggerRef: React.RefObject<HTMLElement | null>
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

function usePopoverContext(component: string) {
  const context = React.useContext(PopoverContext)
  if (!context) {
    throw new Error(`${component} must be used within <Popover />`)
  }
  return context
}

type PopoverProps = React.HTMLAttributes<HTMLDivElement> & {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function Popover({
  className,
  open: openProp,
  defaultOpen,
  onOpenChange,
  children,
  ...props
}: PopoverProps) {
  const triggerRef = React.useRef<HTMLElement>(null)
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen ?? false)
  const isControlled = openProp !== undefined
  const open = isControlled ? !!openProp : internalOpen

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (!isControlled) {
        setInternalOpen(value)
      }
      onOpenChange?.(value)
    },
    [isControlled, onOpenChange],
  )

  React.useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      if (!triggerRef.current) return
      const container = triggerRef.current.closest("[data-slot='popover-root']")
      if (container && event.target instanceof Node && container.contains(event.target)) return
      setOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, setOpen])

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef }}>
      <div
        data-slot="popover-root"
        className={cn("relative inline-flex flex-col", className)}
        {...props}
      >
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

type PopoverTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean
  children: React.ReactElement | React.ReactNode
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
  ({ asChild = false, children, className, onClick, ...props }, ref) => {
    const { open, setOpen, triggerRef } = usePopoverContext("PopoverTrigger")

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)
      if (!event.defaultPrevented) {
        setOpen(!open)
      }
    }

    if (asChild && React.isValidElement(children)) {
      const childWithProps = children as React.ReactElement<any> & { ref?: React.Ref<any> }
      const composedOnClick = composeEventHandlers(
        composeEventHandlers(childWithProps.props.onClick, onClick),
        () => setOpen(!open),
      )
      return React.cloneElement(childWithProps, {
        ref: mergeRefs(childWithProps.ref ?? null, (node: HTMLElement | null) => {
          triggerRef.current = node
        }),
        "aria-haspopup": "dialog",
        "aria-expanded": open,
        onClick: composedOnClick,
        "data-slot": "popover-trigger",
      })
    }

    return (
      <button
        type="button"
        ref={(node) => {
          triggerRef.current = node
          if (typeof ref === "function") {
            ref(node)
          } else if (ref) {
            ;(ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
          }
        }}
        data-slot="popover-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children}
      </button>
    )
  },
)
PopoverTrigger.displayName = "PopoverTrigger"

type PopoverContentProps = React.HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end"
  side?: "top" | "bottom" | "left" | "right"
  sideOffset?: number
}

const PopoverContent = React.forwardRef<HTMLDivElement, PopoverContentProps>(
  (
    {
      className,
      align = "center",
      side = "bottom",
      sideOffset = 4,
      style,
      ...props
    },
    ref,
  ) => {
    const { open, triggerRef, setOpen } = usePopoverContext("PopoverContent")

    if (!open) {
      return null
    }

    const baseStyle: React.CSSProperties = {
      position: "absolute",
      zIndex: 50,
      minWidth: "8rem",
    }

    switch (side) {
      case "top":
        baseStyle.bottom = `calc(100% + ${sideOffset}px)`
        break
      case "left":
        baseStyle.right = `calc(100% + ${sideOffset}px)`
        break
      case "right":
        baseStyle.left = `calc(100% + ${sideOffset}px)`
        break
      case "bottom":
      default:
        baseStyle.top = `calc(100% + ${sideOffset}px)`
        break
    }

    if (side === "left" || side === "right") {
      if (align === "start") {
        baseStyle.top = "0"
      } else if (align === "end") {
        baseStyle.bottom = "0"
      } else {
        baseStyle.top = "50%"
        baseStyle.transform = "translateY(-50%)"
      }
    } else {
      if (align === "start") {
        baseStyle.left = "0"
      } else if (align === "end") {
        baseStyle.right = "0"
      } else {
        baseStyle.left = "50%"
        baseStyle.transform = "translateX(-50%)"
      }
    }

    return (
      <div
        data-slot="popover-content"
        ref={ref}
        className={cn(
          "bg-popover text-popover-foreground w-72 rounded-md border border-gray-200 bg-white p-4 shadow-md outline-hidden",
          className,
        )}
        style={{ ...baseStyle, ...style }}
        role="dialog"
        {...props}
      >
        {props.children}
        <button
          type="button"
          className="sr-only"
          aria-label="Close"
          onClick={() => setOpen(false)}
        />
      </div>
    )
  },
)
PopoverContent.displayName = "PopoverContent"

const PopoverAnchor = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(function PopoverAnchor({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      data-slot="popover-anchor"
      className={cn("inline-flex", className)}
      {...props}
    />
  )
})

function composeEventHandlers<E extends React.SyntheticEvent>(
  theirHandler: ((event: E) => void) | undefined,
  ourHandler?: (event: E) => void,
) {
  return (event: E) => {
    theirHandler?.(event)
    if (!event.defaultPrevented) {
      ourHandler?.(event)
    }
  }
}

function mergeRefs<T>(
  refA: React.Ref<T> | undefined,
  refB: React.Ref<T> | undefined,
) {
  return (value: T) => {
    if (typeof refA === "function") refA(value)
    else if (refA) (refA as React.MutableRefObject<T>).current = value
    if (typeof refB === "function") refB(value)
    else if (refB) (refB as React.MutableRefObject<T>).current = value
  }
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
