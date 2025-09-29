import { cn } from "@/lib/utils"

interface A4PageProps {
  children: React.ReactNode
  className?: string
  /** When true, applies light theme for PDF generation */
  printMode?: boolean
}

/**
 * A4Page Component - Ensures convergence between preview and PDF
 * 
 * This component is critical for maintaining visual consistency between
 * the preview and the final PDF. It uses the same CSS classes and dimensions
 * for both display and print media.
 */
export function A4Page({ children, className = "", printMode = false }: A4PageProps) {
  return (
    <div
      className={cn(
        // Base A4 dimensions and styling
        "a4-page",
        "bg-white text-black",
        "w-[210mm] min-h-[297mm]",
        "p-[12mm] mx-auto",
        "shadow-lg rounded-sm",
        // Print optimizations
        "print:shadow-none print:rounded-none",
        "print:bg-white print:text-black",
        // Conditional light theme for PDF generation
        printMode && "light",
        className
      )}
    >
      {children}
    </div>
  )
}

/**
 * A4 Section Component - For organizing content within the page
 */
interface A4SectionProps {
  children: React.ReactNode
  className?: string
  title?: string
}

export function A4Section({ children, className = "", title }: A4SectionProps) {
  return (
    <section className={cn("mb-6 page-break-avoid", className)}>
      {title && (
        <h2 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">
          {title}
        </h2>
      )}
      {children}
    </section>
  )
}
