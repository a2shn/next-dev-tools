import type { ReactNode } from 'react'
/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled'

type Variant = 'primary' | 'destructive' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const sizeStyles = {
  sm: { fontSize: '0.75rem', padding: '0.25rem 0.5rem' },
  md: { fontSize: '1rem', padding: '0.5rem 1rem' },
  lg: { fontSize: '1.25rem', padding: '0.75rem 1.25rem' },
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  ...props
}: ButtonProps): ReactNode {
  const background
    = variant === 'primary'
      ? 'var(--primary)'
      : variant === 'destructive'
        ? 'var(--destructive)'
        : 'transparent'

  const color
    = variant === 'outline' ? 'var(--primary)' : 'var(--primary-foreground)'

  const border = variant === 'outline' ? '1px solid var(--primary)' : 'none'

  const sizeStyle = sizeStyles[size]

  const StyledButton = styled.button({
    background,
    color,
    border,
    'borderRadius': 'var(--radius)',
    'fontWeight': 500,
    'cursor': 'pointer',
    'transition': 'background-color 0.2s ease',
    ...sizeStyle,
    '&:hover': {
      filter: 'brightness(0.9)',
    },
  })

  return <StyledButton {...props}>{children}</StyledButton>
}
