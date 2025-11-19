import { redirect } from 'next/navigation'

import RegisterForm from '@/components/auth/RegisterForm'
import { getSession } from '@/lib/auth'

export default async function RegisterPage() {
  const session = await getSession()
  
  if (session) {
    redirect('/explore')
  }

  return <RegisterForm />
}
