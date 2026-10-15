export default function LoadingSpinner({ size = 'md', center = false, text = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10', xl: 'w-14 h-14' };
  const spinner = (
    <div className={`${sizes[size]} border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin`} />
  );
  if (center) return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      {spinner}
      {text && <p className="text-sm text-slate-500">{text}</p>}
    </div>
  );
  return spinner;
}
