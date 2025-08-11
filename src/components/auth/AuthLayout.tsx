import React from "react";

type HeroVariant = "pattern" | "photo" | "minimal";

export function AuthLayout({
  children,
  headline,
  subcopy,
  hero = {
    title: "Your time, organized.",
    copy: "Plan, schedule, and stay ahead with a focused calendar.",
  },
  heroVariant = "pattern",
  heroImageUrl,
}: {
  children: React.ReactNode;
  headline: string;
  subcopy?: string;
  hero?: { title: string; copy?: string };
  heroVariant?: HeroVariant;
  heroImageUrl?: string;
}) {
  return (
    // Full-bleed wrapper: no max-width clamp = no extra white margins
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12">
        {/* LEFT HERO */}
        <aside className="relative hidden overflow-hidden lg:block lg:col-span-7">
          {/* Background layers (z-0) */}
          {heroVariant === "photo" ? (
            <>
              <img
                src={heroImageUrl ?? "/images/calendar-hero.jpg"}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
              />
              {/* Strong darkening for readability */}
              <div className="absolute inset-0 bg-slate-900/60" />
            </>
          ) : heroVariant === "pattern" ? (
            <>
              <div className="absolute inset-0 bg-grid-slate/12" />
              <div className="absolute inset-0 bg-[radial-gradient(700px_380px_at_10%_10%,rgba(99,102,241,0.3),transparent),radial-gradient(700px_380px_at_90%_90%,rgba(56,189,248,0.3),transparent)]" />
              {/* Much stronger background for maximum contrast */}
              <div className="absolute inset-0 bg-slate-900/70" />
            </>
          ) : (
            <div className="absolute inset-0 bg-slate-100 dark:bg-slate-900" />
          )}

          {/* Narrow fade into the form side (only the last 6%) */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              WebkitMaskImage: "linear-gradient(to right, black 94%, transparent 100%)",
              maskImage: "linear-gradient(to right, black 94%, transparent 100%)",
            }}
          />

          {/* Foreground content */}
          <div className="relative z-10 flex h-full flex-col justify-between px-12 py-10 text-white">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/40 backdrop-blur-sm font-semibold">
                <img src="/logo.png" alt=""/>
              </div>
              <div>
                <div className="font-medium leading-tight">Team Tajinder Singh Tiwana</div>
                <div className="text-sm text-white/90">Official Calendar</div>
              </div>
            </div>

            {/* Messaging */}
            <div>
              <h1 className="text-5xl font-semibold leading-tight drop-shadow-lg">
                {hero?.title}
              </h1>
              {hero?.copy && (
                <p className="mt-4 max-w-xl text-white drop-shadow-sm">{hero.copy}</p>
              )}
            </div>

            <div aria-hidden className="h-6" />
          </div>
        </aside>

        {/* RIGHT FORM */}
        <main className="col-span-12 flex items-start justify-center px-6 py-12 lg:col-span-5 lg:pt-20">
          <div className="w-full max-w-md">
            {/* Logo and Branding for small screens */}
            <div className="mb-8 flex flex-col items-center">
              <div className="mb-4">
                <img 
                  src="/logo.png" 
                  alt="Tagendra Singh Tiwana" 
                  className="h-20 w-20 rounded-full object-cover border-2 border-slate-200 shadow-lg"
                  onError={(e) => {
                    console.error('Logo failed to load:', e);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-center">
                <div className="font-bold text-slate-900 dark:text-slate-100 text-xl">Team Tagendra Singh Tiwana</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Official Calendar</div>
              </div>
            </div>
            
            <header className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {headline}
              </h2>
              {subcopy && (
                <p className="mt-2 text-slate-600 dark:text-slate-300">{subcopy}</p>
              )}
            </header>

            <div className="rounded-2xl bg-white p-6 shadow-xl ring-1 ring-black/5 dark:bg-slate-900">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 