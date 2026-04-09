import clsx from 'clsx'

export default function Input({
  label,
  id,
  error,
  className,
  inputClassName,
  ...props
}) {
  const inputId = id || props.name
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30',
          error && 'border-red-400 focus:border-red-500 focus:ring-red-500/30',
          inputClassName
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
