import { cn } from '@/lib/utils'

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' }) {
  const variants: Record<string, string> = {
    default: 'bg-slate-900 text-slate-50 shadow hover:bg-slate-900/80 dark:bg-slate-50 dark:text-slate-900',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-50',
    destructive: 'bg-red-500 text-slate-50 shadow hover:bg-red-500/80',
    outline: 'border border-slate-200 text-slate-950 dark:border-slate-800 dark:text-slate-50',
  }
  return (
    <div
      className={cn('inline-flex items-center rounded-md border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2', variants[variant], className)}
      {...props}
    />
  )
}
