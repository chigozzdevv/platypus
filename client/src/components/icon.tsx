export default function PlatypusIcon({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="6" fill="#171717"/>
      <path 
        d="M8 12c0-1.1.9-2 2-2h4c3.3 0 6 2.7 6 6v0c0 1.1-.9 2-2 2h-2v2c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V12z" 
        fill="white"
      />
      <circle cx="13" cy="14" r="1.5" fill="#171717"/>
    </svg>
  );
}