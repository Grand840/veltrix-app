"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const USE_CASES = [
  "Surveiller mon VPS / serveur dedie",
  "Monitoring de mes apps web (Node, Django, etc.)",
  "Surveillance de ma base de donnees",
  "Monitoring de plusieurs serveurs",
  "Infrastructure d'entreprise / PME",
  "Autre",
];

const HOW_HEARD = [
  "Bouche a oreille",
  "LinkedIn / Reseaux sociaux",
  "Communaute tech (WhatsApp, Telegram)",
  "Google / Recherche web",
  "Autre",
];

export default function BetaPage() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    company: "",
    use_case: "",
    nb_servers: "",
    how_heard: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const update = (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.use_case) {
      setError("Veuillez remplir les champs obligatoires.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const resp = await fetch("/api/v1/beta/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!resp.ok) throw new Error("Erreur serveur");
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Une erreur est survenue. Reessayez ou ecrivez a contact@veltrix.io");
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Candidature recue ! 🎉
            </h1>
            <p className="text-gray-500 mt-2">
              Merci <strong>{form.full_name}</strong>. Nous vous contacterons
              sous 48h pour vous donner acces au programme beta.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <p className="font-semibold mb-1">En attendant :</p>
            <p>Vous pouvez creer un compte gratuit des maintenant et tester Veltrix avec 3 agents.</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/register">
              <Button className="w-full">Creer mon compte gratuit</Button>
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              &larr; Retour a l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Veltrix</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            🚀 Programme Beta &mdash; Acces limite
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Rejoignez les premiers utilisateurs de Veltrix
          </h1>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Acces gratuit de 60 jours (au lieu de 30), support direct avec
            l&apos;equipe, et la possibilite d&apos;influencer les prochaines
            fonctionnalites.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { emoji: "⏱️", title: "60 jours gratuits",    desc: "Au lieu de 30"            },
            { emoji: "💬", title: "Support direct",        desc: "Reponse en moins de 24h"  },
            { emoji: "🎯", title: "Influence le produit",  desc: "Vos retours comptent"     },
          ].map(({ emoji, title, desc }) => (
            <div key={title} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-sm font-semibold text-gray-900">{title}</div>
              <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Candidater au programme beta
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="full_name">
                  Nom complet <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="full_name"
                  placeholder="Jean Dupont"
                  value={form.full_name}
                  onChange={update("full_name")}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="jean@exemple.com"
                  value={form.email}
                  onChange={update("email")}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company">Entreprise / Organisation</Label>
              <Input
                id="company"
                placeholder="Mon Entreprise SARL"
                value={form.company}
                onChange={update("company")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="use_case">
                Cas d&apos;usage principal <span className="text-red-500">*</span>
              </Label>
              <select
                id="use_case"
                value={form.use_case}
                onChange={update("use_case")}
                required
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selectionner...</option>
                {USE_CASES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nb_servers">Nombre de serveurs a surveiller</Label>
              <Input
                id="nb_servers"
                placeholder="Ex: 3"
                value={form.nb_servers}
                onChange={update("nb_servers")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="how_heard">Comment avez-vous connu Veltrix ?</Label>
              <select
                id="how_heard"
                value={form.how_heard}
                onChange={update("how_heard")}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selectionner...</option>
                {HOW_HEARD.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="message">
                Message (attentes, questions, contexte)
              </Label>
              <textarea
                id="message"
                rows={3}
                placeholder="Dites-nous ce que vous attendez de Veltrix..."
                value={form.message}
                onChange={update("message")}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <Button
              type="submit"
              disabled={status === "loading"}
              className="w-full"
              size="lg"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                "Candidater au programme beta →"
              )}
            </Button>

            <p className="text-xs text-center text-gray-400">
              Vos donnees ne seront jamais partagees. Reponse garantie sous 48h.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
