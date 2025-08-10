"use client"

import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      headline="Welcome Back"
      subcopy="Please enter your details to sign in."
      hero={{ title: "Your time, organized.", copy: "Plan, schedule, and stay ahead with a focused calendar." }}
      heroVariant="pattern" // or "photo" with heroImageUrl below
      // heroImageUrl="/images/team-planning.jpg"
    >
      <LoginForm />
    </AuthLayout>
  );
}
