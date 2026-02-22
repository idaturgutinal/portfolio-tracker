import { cn } from "@/lib/utils";

interface FolioVaultLogoProps {
  size?: number;
  className?: string;
}

export function FolioVaultLogo({ size = 24, className }: FolioVaultLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
    >
      {/* Shield outline */}
      <path
        d="M12 2.5L20.5 6.5V13C20.5 17.5 12 21.5 12 21.5C12 21.5 3.5 17.5 3.5 13V6.5L12 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {/* Ascending bar chart */}
      <rect x="7.5" y="14" width="2.5" height="2" rx="0.4" fill="currentColor" />
      <rect x="10.75" y="11.5" width="2.5" height="4.5" rx="0.4" fill="currentColor" />
      <rect x="14" y="9" width="2.5" height="7" rx="0.4" fill="currentColor" />
    </svg>
  );
}
