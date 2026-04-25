import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/admin"
import { LoginForm } from "./form"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "admin · login — promise999",
  robots: "noindex,nofollow",
}

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin")

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm border border-border p-6 space-y-4">
        <div>
          <h1 className="font-serif text-2xl">관리자 로그인</h1>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            ADMIN_TOKEN 환경변수와 일치해야 접근 가능
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
