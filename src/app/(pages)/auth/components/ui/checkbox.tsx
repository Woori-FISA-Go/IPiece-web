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
        'grid size-6 shrink-0 place-items-center appearance-none rounded-full border border-[#3386E5] bg-white bg-center bg-no-repeat outline-none transition-all duration-150 ease-out cursor-pointer focus-visible:ring-[3px] focus-visible:border-[#3386E5] focus-visible:ring-[#3386E5]/30 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-[#3386E5] checked:border-[#3386E5] checked:bg-[length:70%] checked:bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M6%2012l4%204%208-8%22%20stroke%3D%22white%22%20stroke-width%3D%223%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E")]',
        className,
      )}
      {...rest}
    />
  )
}

export { Checkbox }
