import { getInitials } from '../../utils/helpers';

const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl', '2xl': 'w-20 h-20 text-2xl' };

export default function Avatar({ src, name, size = 'md', className = '' }) {
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover flex-shrink-0 ${className}`} />;
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center flex-shrink-0 ${className}`}>
      {getInitials(name)}
    </div>
  );
}
