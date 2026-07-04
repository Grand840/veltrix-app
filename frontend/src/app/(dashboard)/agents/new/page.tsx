"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { agentsApi, getErrorMessage } from "@/lib/api";
import type { AgentInstallCommand } from "@/types";

export default function NewAgentPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentInstallCommand | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const resp = await agentsApi.create({ name: name.trim(), description });
      setResult(resp.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const copyKey = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.api_key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Agent créé !</CardTitle>
            <CardDescription>Copiez la clé API maintenant — elle ne sera plus affichée.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">{result.note}</div>
            <div className="space-y-1">
              <Label>Clé API</Label>
              <div className="flex gap-2">
                <code className="flex-1 bg-gray-100 rounded px-3 py-2 text-sm font-mono break-all">{result.api_key}</code>
                <Button variant="outline" size="sm" onClick={copyKey}>
                  {copied ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Commande d'installation</Label>
              <code className="block bg-gray-900 text-green-400 rounded px-3 py-3 text-xs font-mono break-all">{result.install_command}</code>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={() => router.push("/agents")} className="flex-1">Voir mes agents</Button>
              <Button variant="outline" onClick={() => { setResult(null); setName(""); }}>Créer un autre</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Ajouter un agent</h1>
        <p className="text-gray-500 mt-1 text-sm">Installez l'agent sur le serveur à surveiller</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleCreate} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{error}</div>}
            <div className="space-y-1">
              <Label htmlFor="name">Nom du serveur *</Label>
              <Input id="name" placeholder="prod-server-01" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} autoFocus />
              <p className="text-xs text-gray-400">Un nom lisible pour identifier ce serveur</p>
            </div>
            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Input id="description" placeholder="Serveur de production principal" value={description} onChange={(e) => setDescription(e.target.value)} disabled={isLoading} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isLoading || !name.trim()} className="flex-1">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Création...</> : "Créer l'agent"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Annuler</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
