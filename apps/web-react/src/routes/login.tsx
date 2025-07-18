import { createFileRoute } from "@tanstack/react-router"
import { useAuth } from "@workos-inc/authkit-react"
import { useEffect } from "react"
import { Navigate } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      returnTo: search.returnTo as string | undefined,
    }
  },
})

function LoginPage() {
  const { user, signIn, isLoading } = useAuth()
  const search = Route.useSearch()
  
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const context = searchParams.get("context") ?? undefined
    
    if (!user && !isLoading) {
      signIn({ 
        context,
        state: { returnTo: search.returnTo || "/" }
      })
    }
  }, [user, isLoading, signIn, search])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (user) {
    return <Navigate to={search.returnTo || "/"} />
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Redirecting to login...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    </div>
  )
}