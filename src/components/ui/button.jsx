export function Button({
  className = "",
  variant = "default",
  size = "default",
  disabled = false,
  children,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variants = {
    default: "bg-slate-800 text-white hover:bg-slate-700",
    outline: "border border-slate-600 bg-transparent text-slate-300 hover:bg-slate-800",
    ghost: "hover:bg-slate-800 text-slate-300",
  };

  const sizes = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-7 px-3 text-xs",
    lg: "h-11 px-6 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant] ?? variants.default} ${sizes[size] ?? sizes.default} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
