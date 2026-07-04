"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

const PASSWORD_RULES = [
  { label: "8 caracteres minimum", test: (p: string) => p.length >= 8 },
  { label: "Une majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Un chiffre", test: (p: string) => /\d/.test(p) },
];

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", full_name: "", organization_name: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.email) errors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Format invalide";
    if (!form.organization_name.trim()) errors.organization_name = "Le nom de l'organisation est requis";
    if (form.organization_name.trim().length < 2) errors.organization_name = "Au moins 2 caracteres";
    if (!PASSWORD_RULES.every((r) => r.test(form.password))) errors.password = "Le mot de passe ne respecte pas les regles";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await register(form);
  };

  const passwordStrength = PASSWORD_RULES.filter((r) => r.test(form.password)).length;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Creer un compte</CardTitle>
        <CardDescription>Commencez a surveiller votre infrastructure gratuitement</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">{error}</div>
          )}
          <div className="space-y-1">
            <Label htmlFor="full_name">Nom complet</Label>
            <Input id="full_name" placeholder="Jean Dupont" value={form.full_name} onChange={update("full_name")} disabled={isLoading} autoFocus />
          </div>
          <div className="space-y-1">
            <Label htmlFor="organization_name">Nom de l'organisation <span className="text-red-500">*</span></Label>
            <Input id="organization_name" placeholder="Mon Entreprise SARL" value={form.organization_name}
              onChange={update("organization_name")} className={fieldErrors.organization_name ? "border-red-400" : ""} disabled={isLoading} />
            {fieldErrors.organization_name && <p className="text-xs text-red-600">{fieldErrors.organization_name}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input id="email" type="email" placeholder="vous@exemple.com" value={form.email}
              onChange={update("email")} className={fieldErrors.email ? "border-red-400" : ""} disabled={isLoading} autoComplete="email" />
            {fieldErrors.email && <p className="text-xs text-red-600">{fieldErrors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                value={form.password} onChange={update("password")}
                className={`pr-10 ${fieldErrors.password ? "border-red-400" : ""}`} disabled={isLoading} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" tabIndex={-1}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {form.password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {PASSWORD_RULES.map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      i < passwordStrength ? (passwordStrength === 1 ? "bg-red-400" : passwordStrength === 2 ? "bg-yellow-400" : "bg-green-500") : "bg-gray-200"
                    }`} />
                  ))}
                </div>
                <div className="space-y-0.5">
                  {PASSWORD_RULES.map((rule) => {
                    const ok = rule.test(form.password);
                    return (
                      <div key={rule.label} className={`flex items-center gap-1 text-xs ${ok ? "text-green-600" : "text-gray-400"}`}>
                        {ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                        {rule.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-md px-4 py-3 text-sm text-blue-700">
            <strong>Plan gratuit inclus :</strong> 3 agents, 30 jours de retention, alertes email. Pas de carte de credit requise.
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creation du compte...</> : "Creer mon compte"}
          </Button>
          <p className="text-sm text-center text-gray-500">
            Deja un compte ?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">Se connecter</Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
