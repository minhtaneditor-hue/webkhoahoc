import Image from 'next/image';

// TẤN VA mark (Brand Kit 1.0): the designer's master file, transparent PNG.
export default function BrandMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/tan-va-mark.png"
      alt=""
      width={166}
      height={154}
      priority
      className={`!rounded-none object-contain ${className}`}
      style={{ width: size, height: 'auto' }}
    />
  );
}
