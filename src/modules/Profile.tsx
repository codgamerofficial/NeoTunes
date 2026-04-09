import { UserCircle, LogOut } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { SectionTitle, MetricCard } from '../components/ui'

export function Profile() {
  const { user, signOut } = useAuth()

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <SectionTitle 
        title="My Profile" 
        eyebrow="Identity" 
        body="Manage your account details and current session logic." 
      />

      <div className="grid gap-6 md:grid-cols-2">
        <MetricCard
          label="Account Provider"
          value={user?.app_metadata?.provider || 'Google'}
          tone="accent"
        />

        <MetricCard
          label="Authentication Level"
          value="Standard"
          tone="neutral"
        />
      </div>

      <div className="rounded-[34px] border border-[rgb(var(--line))] bg-[rgb(var(--panel))] p-6 md:p-10 shadow-[var(--panel-shadow)]">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left">
          
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent-soft))] text-[rgb(var(--accent))] border border-[rgb(var(--accent-border))] shadow-inner">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="Avatar" className="h-full w-full rounded-full object-cover" />
            ) : (
              <UserCircle className="h-12 w-12" />
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-[rgb(var(--text))]">
              {user?.user_metadata?.full_name || 'Anonymous Student'}
            </h2>
            <p className="text-sm font-medium text-[rgb(var(--muted))]">
              {user?.email}
            </p>
            <p className="text-xs uppercase tracking-widest text-[rgb(var(--muted))] mt-2 opacity-70">
              User ID: {user?.id}
            </p>
          </div>

          <button
            onClick={signOut}
            className="flex h-fit items-center gap-2 rounded-full border border-red-500/20 bg-[rgba(239,68,68,0.1)] px-5 py-2.5 text-sm font-semibold text-red-500 transition hover:bg-[rgba(239,68,68,0.15)]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
