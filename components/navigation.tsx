"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Settings, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-4 mb-8">
      <Link href="/">
        <Button variant={pathname === "/" ? "default" : "outline"} className={cn("flex items-center gap-2 cursor-pointer")}>
          <Settings className="h-4 w-4" />
          Controle de Dispositivos
        </Button>
      </Link>
      <Link href="/scheduling">
        <Button variant={pathname === "/scheduling" ? "default" : "outline"} className={cn("flex items-center gap-2 cursor-pointer")}>
          <Calendar className="h-4 w-4" />
          Agendamento
        </Button>
      </Link>
    </nav>
  )
}
