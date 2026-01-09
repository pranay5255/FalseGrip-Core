
import {
  Users,
  CreditCard,
  LifeBuoy,
  Settings,
  Dumbbell,
} from "lucide-react"

const MENU_ITEMS = [
  { id: "clients", label: "Client Management", mobileLabel: "Clients", icon: Users },
  { id: "billing", label: "Billing & Plans", mobileLabel: "Billing", icon: CreditCard },
  { id: "support", label: "Support", mobileLabel: "Support", icon: LifeBuoy },
]

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const baseItemClasses =
    "flex w-full items-center justify-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium leading-snug whitespace-normal transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70"

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-slate-950 text-slate-100 md:flex">
      <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 ring-1 ring-slate-700">
          <Dumbbell className="h-5 w-5 text-slate-100" />
        </div>
        <div className="leading-tight">
          <h2 className="text-lg font-semibold">FalseGrip</h2>
          <p className="text-xs text-slate-400">Trainer Dashboard</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4">
        <div className="space-y-1">
          {MENU_ITEMS.map((item) => {
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={`${baseItemClasses} ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/70 hover:text-white"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="border-t border-slate-800 px-4 py-4">
        <button
          type="button"
          className={`${baseItemClasses} text-slate-400 hover:bg-slate-800/70 hover:text-white`}
        >
          <Settings className="h-5 w-5" />
          <span className="flex-1">Settings</span>
        </button>
      </div>
    </aside>
  )
}

export function MobileNav({ activeView, onViewChange }: SidebarProps) {
  const mobileItemClasses =
    "flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium leading-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70"

  return (
    <div className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950 text-slate-100 md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 ring-1 ring-slate-700">
            <Dumbbell className="h-4 w-4 text-slate-100" />
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-semibold">FalseGrip</h2>
            <p className="text-[11px] text-slate-400">Trainer Dashboard</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Open settings"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-800/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/70"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>
      <nav className="px-3 pb-3">
        <div className="grid grid-cols-3 gap-2">
          {MENU_ITEMS.map((item) => {
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                className={`${mobileItemClasses} ${
                  isActive
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.mobileLabel ?? item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
