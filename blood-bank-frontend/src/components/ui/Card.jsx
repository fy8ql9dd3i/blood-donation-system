import clsx from 'clsx'

export function Card({ className, children }) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {title && (
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        )}
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export default Card

