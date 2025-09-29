import { redirect } from 'next/navigation'

export default function SigninPage() {
  // Redirection vers login pour uniformiser
  redirect('/auth/login')
}
