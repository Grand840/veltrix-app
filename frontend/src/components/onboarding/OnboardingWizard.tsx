"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Server, Activity, Wifi, CheckCircle, Copy, Check,
  ChevronRight, Terminal, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { agentsApi, metricsApi } from "@/lib/api";
import type { AgentInstallCommand } from "@/types";

interface OnboardingWizardProps {
  onDismiss: () => void;
}

type Step = "welcome" | "create-agent" | "verify";

export function OnboardingWizard({ onDismiss }: OnboardingWizardProps) {
  const [step, setStep] = useState<Step>("welcome");
  const [agentName, setAgentName] = useState("");
  const [installInfo, setInstallInfo] = useState<AgentInstallCommand | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeout, setTimeout_] = useState(false);
  const router = useRouter();

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }, []);

  const handleCreateAgent = useCallback(async () => {
    if (!agentName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const resp = await agentsApi.create({ name: agentName.trim() });
      setInstallInfo(resp.data);
      setStep("verify");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  }, [agentName]);

  const startVerification = useCallback(() => {
    if (!installInfo) return;
    setVerifying(true);
    setProgress(0);
    setTimeout_(false);

    const maxAttempts = 20;
    const interval = 5000;
    let attempts = 0;

    const poll = setInterval(async () => {
      attempts++;
      setProgress(Math.min((attempts / maxAttempts) * 100, 95));

      try {
        const resp = await metricsApi.overview();
        const found = resp.data.find((s) => s.agent_id === installInfo.agent_id);
        if (found && found.status !== "pending") {
          setVerified(true);
          setProgress(100);
          clearInterval(poll);
          setTimeout(() => router.refresh(), 1500);
          return;
        }
      } catch { /* ignore */ }

      if (attempts >= maxAttempts) {
        clearInterval(poll);
        setTimeout_(true);
        setProgress(100);
      }
    }, interval);

    return () => clearInterval(poll);
  }, [installInfo, router]);

  useEffect(() => {
    if (verifying && !verified && !timeout) {
      const cleanup = startVerification();
      return cleanup;
    }
  }, [verifying, verified, timeout, startVerification]);

  const handleFinish = useCallback(() => {
    onDismiss();
    router.refresh();
  }, [onDismiss, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Progress bar */}
        <div className="w-full h-1 bg-gray-100 rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all duration-500"
            style={{
              width: step === "welcome" ? "5%" : step === "create-agent" ? "35%" : verified ? "100%" : timeout ? "100%" : `${5 + (progress || 0) * 0.6}%`,
            }}
          />
        </div>

        <CardContent className="p-8">
          {/* Step 1: Welcome */}
          {step === "welcome" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Server className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Bienvenue sur Veltrix</h2>
                <p className="text-gray-500">Votre plateforme de monitoring en <span className="font-semibold">3 étapes</span></p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="border-blue-100 bg-blue-50/50">
                  <CardContent className="p-4 text-center space-y-2">
                    <Server className="h-8 w-8 text-blue-600 mx-auto" />
                    <p className="font-medium text-sm">Surveillance serveur</p>
                    <p className="text-xs text-gray-500">CPU, RAM, disque en temps réel</p>
                  </CardContent>
                </Card>
                <Card className="border-green-100 bg-green-50/50">
                  <CardContent className="p-4 text-center space-y-2">
                    <Activity className="h-8 w-8 text-green-600 mx-auto" />
                    <p className="font-medium text-sm">Alertes intelligentes</p>
                    <p className="text-xs text-gray-500">Seuils configurables, notifications</p>
                  </CardContent>
                </Card>
                <Card className="border-purple-100 bg-purple-50/50">
                  <CardContent className="p-4 text-center space-y-2">
                    <Wifi className="h-8 w-8 text-purple-600 mx-auto" />
                    <p className="font-medium text-sm">Vue centralisée</p>
                    <p className="text-xs text-gray-500">Tous vos serveurs, un tableau de bord</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" onClick={onDismiss}>Passer</Button>
                <Button onClick={() => setStep("create-agent")} className="gap-2">
                  Commencer <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Create Agent */}
          {step === "create-agent" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Terminal className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Ajoutez votre premier serveur</h2>
                <p className="text-gray-500">Donnez un nom à votre serveur pour commencer</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du serveur</label>
                  <Input
                    placeholder="Ex: Production-01"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateAgent()}
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</p>
                )}

                <Button
                  className="w-full gap-2"
                  onClick={handleCreateAgent}
                  disabled={!agentName.trim() || creating}
                >
                  {creating ? (
                    <>Création...</>
                  ) : (
                    <>Créer l'agent <ArrowRight className="h-4 w-4" /></>
                  )}
                </Button>
              </div>

              <div className="flex justify-between items-center pt-2">
                <Button variant="ghost" size="sm" onClick={onDismiss}>Passer</Button>
              </div>
            </div>
          )}

          {/* Step 3: Verify Connection */}
          {step === "verify" && installInfo && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${verified ? "bg-green-100" : timeout ? "bg-yellow-100" : "bg-blue-100"}`}>
                  {verified ? (
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  ) : timeout ? (
                    <Server className="h-8 w-8 text-yellow-600" />
                  ) : (
                    <Terminal className="h-8 w-8 text-blue-600" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {verified ? "Connecté !" : timeout ? "Temps écoulé" : "Installez l'agent"}
                </h2>
                <p className="text-gray-500">
                  {verified
                    ? "Votre serveur est maintenant surveillé"
                    : timeout
                      ? "L'agent ne s'est pas connecté. Vérifiez la commande."
                      : "Copiez-collez cette commande sur votre serveur"}
                </p>
              </div>

              {!verified && !timeout && (
                <div className="space-y-3">
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                      {installInfo.install_command}
                    </pre>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => handleCopy(installInfo.install_command)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">{installInfo.note}</p>

                  {verifying && (
                    <div className="space-y-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 text-center">En attente de connexion... ({Math.round(progress)}%)</p>
                    </div>
                  )}

                  {!verifying && (
                    <Button className="w-full gap-2" onClick={() => setVerifying(true)}>
                      Vérifier la connexion <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {(verified || timeout) && (
                <div className="space-y-3">
                  {verified && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-green-800 font-medium">✅ Agent connecté avec succès</p>
                    </div>
                  )}
                  {timeout && (
                    <div className="space-y-2">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm font-medium">L'agent ne répond pas encore</p>
                        <p className="text-yellow-700 text-xs mt-1">
                          Vérifiez que la commande a bien été exécutée sur votre serveur.
                          La connexion est automatique dès que l'agent démarre.
                        </p>
                      </div>
                      <div className="relative">
                        <pre className="bg-gray-900 text-green-300 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                          {installInfo.install_command}
                        </pre>
                        <Button
                          variant="ghost" size="sm"
                          className="absolute top-2 right-2 text-gray-400 hover:text-white"
                          onClick={() => handleCopy(installInfo.install_command)}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {timeout && (
                      <Button variant="outline" className="flex-1" onClick={() => { setVerifying(false); setTimeout_(false); setProgress(0); }}>
                        Réessayer
                      </Button>
                    )}
                    <Button className="flex-1 gap-2" onClick={handleFinish}>
                      {verified ? "Accéder au tableau de bord" : "Terminer"} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
