'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

type CheckboxProps = {
  id?: string
  className?: string
  checked?: boolean
  disabled?: boolean
  'aria-invalid'?: boolean | 'true' | 'false'
  onCheckedChange?: (checked: boolean) => void
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'checked'>

function Checkbox({ className, checked, onCheckedChange, id, disabled, ...rest }: CheckboxProps) {
  return (
    <input
      data-slot="checkbox"
      id={id}
      type="checkbox"
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      disabled={disabled}
      className={cn(
        'size-4 shrink-0 rounded-[4px] border border-input shadow-xs outline-none transition-shadow focus-visible:ring-[3px] focus-visible:border-ring focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    />
  )
}

export { Checkbox }
