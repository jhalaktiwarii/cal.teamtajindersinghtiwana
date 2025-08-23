import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function isValidPhone(v: string) {
  return /^\+?[0-9\s-]{8,}$/.test(v.trim());
}

export function LoginForm() {
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(false);
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  const canSubmit = isValidPhone(phone) && password.length >= 1 && !loading;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    
    setLoading(true);
    setError(null);
    
     const loadingToast = toast.loading("Signing in...", {
      description: "Please wait while we authenticate your credentials"
    });
    
    try {
      const result = await signIn("credentials", {
        phone: phone.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Dismiss loading toast and show error
        toast.dismiss(loadingToast);
        setError("Invalid phone number or password");
        toast.error("Login failed", {
          description: "Invalid phone number or password. Please try again."
        });
      } else if (result?.ok) {
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success("Login successful!", {
          description: "Redirecting to calendar..."
        });
        
        // Reset form
        setPhone("");
        setPassword("");
        setRemember(false);
        
        // Small delay to show success message before redirect
        setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 1000);
      }
    } catch (err: unknown) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      const errorMessage = err instanceof Error ? err.message : "Unable to sign in. Please try again.";
      setError(errorMessage);
      toast.error("Login failed", {
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="phone" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Phone Number
        </Label>
        <div className="relative">
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., 9342489898"
            className="peer w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            disabled={loading}
          />
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
        </div>
        {!isValidPhone(phone) && phone.length > 0 && (
          <p className="text-xs text-rose-600 dark:text-rose-400">Please enter a valid 10-digit phone number (e.g., 9572167233)</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password" className="text-sm font-medium text-slate-700 dark:text-slate-200">
          Password
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="peer w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            disabled={loading}
          />
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <button
            type="button"
            aria-label={showPwd ? "Hide password" : "Show password"}
            aria-pressed={showPwd}
            onClick={() => setShowPwd((s) => !s)}
            className="absolute inset-y-0 right-2 flex items-center rounded-md px-2 text-slate-500 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 dark:hover:text-slate-300"
          >
            {showPwd ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={remember}
            onCheckedChange={(checked) => setRemember(checked as boolean)}
            className="border-slate-300 dark:border-slate-600"
          />
          <Label htmlFor="remember" className="text-sm text-slate-700 dark:text-slate-300">
            Remember me
          </Label>
        </div>
        {/* Intentionally empty right side—do NOT add forgot/signup */}
        <span aria-hidden className="text-sm text-transparent">.</span>
      </div>

      {error && (
        <div 
          role="alert" 
          aria-live="polite" 
          className="rounded-lg bg-rose-50 text-rose-700 px-3 py-2 text-sm ring-1 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-900/50"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-white font-medium shadow-sm transition-all duration-200 active:translate-y-[1px] disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
      >
        {loading ? (
          <span role="status" className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            Signing in...
          </span>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
} 