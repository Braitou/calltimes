/**
 * Logo Call Times - Identité typographique
 * CALL (Inter Black 900) + Times (Libre Baskerville Italic)
 */

interface LogoProps {
  size?: 'small' | 'medium' | 'large'
  variant?: 'vertical' | 'horizontal'
}

export function Logo({ size = 'medium', variant = 'vertical' }: LogoProps) {
  const sizes = {
    small: { 
      call: 'text-2xl', 
      times: 'text-[1.65rem]' 
    },
    medium: { 
      call: 'text-5xl', 
      times: 'text-[3.3rem]' 
    },
    large: { 
      call: 'text-[5rem]', 
      times: 'text-[5.5rem]' 
    },
  }

  if (variant === 'horizontal') {
    return (
      <div className="inline-flex items-baseline gap-2">
        <div className={`logo-call ${sizes[size].call}`}>CALL</div>
        <div className={`logo-times ${sizes[size].times}`}>Times</div>
      </div>
    )
  }

  // Vertical (default)
  return (
    <div className="inline-block">
      <div className={`logo-call ${sizes[size].call}`}>CALL</div>
      <div className={`logo-times ${sizes[size].times}`}>Times</div>
    </div>
  )
}


