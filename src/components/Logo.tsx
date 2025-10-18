/**
 * Logo Call Times - Identité typographique
 * CALL (Inter Black 900) + times (Libre Baskerville Italic lowercase)
 */

interface LogoProps {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`inline-flex items-baseline gap-[0.15em] ${className}`}>
      <span className="logo-call text-[1em]">CALL</span>
      <span className="logo-times text-[1.1em]">times</span>
    </div>
  )
}


