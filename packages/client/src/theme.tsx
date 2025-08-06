import { css } from '@emotion/react'

export const theme = css`
  :host(:not(.dark)) {
    --background: oklch(1 0 0);
    --foreground: oklch(0.1450 0 0);
    --card: oklch(1 0 0);
    --card-foreground: oklch(0.1450 0 0);
    --popover: oklch(1 0 0);
    --popover-foreground: oklch(0.1450 0 0);
    --primary: oklch(0.2050 0 0);
    --primary-foreground: oklch(0.9850 0 0);
    --secondary: oklch(0.9700 0 0);
    --secondary-foreground: oklch(0.2050 0 0);
    --muted: oklch(0.9700 0 0);
    --muted-foreground: oklch(0.5560 0 0);
    --accent: oklch(0.9700 0 0);
    --accent-foreground: oklch(0.2050 0 0);
    --destructive: oklch(0.5770 0.2450 27.3250);
    --destructive-foreground: oklch(1 0 0);
    --border: oklch(0.9220 0 0);
    --input: oklch(0.9220 0 0);
    --ring: oklch(0.7080 0 0);
  }

  :host(.dark) {
    --background: oklch(0.1450 0 0);
    --foreground: oklch(0.9850 0 0);
    --card: oklch(0.2050 0 0);
    --card-foreground: oklch(0.9850 0 0);
    --popover: oklch(0.2690 0 0);
    --popover-foreground: oklch(0.9850 0 0);
    --primary: oklch(0.9220 0 0);
    --primary-foreground: oklch(0.2050 0 0);
    --secondary: oklch(0.2690 0 0);
    --secondary-foreground: oklch(0.9850 0 0);
    --muted: oklch(0.2690 0 0);
    --muted-foreground: oklch(0.7080 0 0);
    --accent: oklch(0.3710 0 0);
    --accent-foreground: oklch(0.9850 0 0);
    --destructive: oklch(0.7040 0.1910 22.2160);
    --destructive-foreground: oklch(0.9850 0 0);
    --border: oklch(0.2750 0 0);
    --input: oklch(0.3250 0 0);
    --ring: oklch(0.5560 0 0);
  }
`
