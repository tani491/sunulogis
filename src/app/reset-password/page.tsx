import { ResetPasswordPage } from '@/components/auth/ResetPasswordPage'

interface ResetPasswordRouteProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPassword({ searchParams }: ResetPasswordRouteProps) {
  const params = await searchParams
  return <ResetPasswordPage token={params.token || ''} />
}
