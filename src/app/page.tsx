import { redirect } from 'next/navigation'

export default function HomePage() {
  // Redirect to dashboard for now
  // Later this will be a proper landing page
  redirect('/dashboard')
}
