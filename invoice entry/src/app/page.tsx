import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'

export default async function RootRedirect() {
  const session = await getServerSession()
  
  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }
}
