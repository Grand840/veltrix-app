/**
 * Landing page Veltrix — version animee.
 * CSS pur + Intersection Observer. Zero lib externe.
 */
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Activity, Server, Bell, BarChart3, Shield, Zap,
  CheckCircle2, ArrowRight, Globe, Smartphone, Menu, X,
} from "lucide-react";
import { useScrollAnimation, useStaggerAnimation } from "@/hooks/useScrollAnimation";

function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled
        ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200/80"
        : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Veltrix</span>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Fonctionnalites
          </a>
          <a href="#how" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Comment ca marche
          </a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Tarifs
          </a>
          <a href="/beta" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">
            Programme Beta
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Connexion
          </Link>
          <Link
            href="/register"
            className="btn-shimmer bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            Essai gratuit
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-3 animate-fade-in">
          {[
            { href: "#features", label: "Fonctionnalites" },
            { href: "#how", label: "Comment ca marche" },
            { href: "#pricing", label: "Tarifs" },
          { href: "/beta", label: "Programme Beta" },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="block text-sm text-gray-600 hover:text-blue-600 py-1" onClick={() => setMenuOpen(false)}>
              {label}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login" className="text-center text-sm border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition-colors">
              Connexion
            </Link>
            <Link href="/register" className="text-center text-sm bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700 transition-colors font-medium">
              Essai gratuit
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero-gradient min-h-screen flex items-center pt-16 px-4">
      <div className="max-w-4xl mx-auto text-center w-full py-20">
        <div className="animate-fade-slide-up inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-blue-200 text-blue-700 text-xs font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
          <Zap className="h-3 w-3 text-blue-500" />
          30 jours d&apos;essai gratuit — aucune carte requise
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
        </div>

        <h1 className="animate-fade-slide-up delay-200 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">
          Surveillez votre{" "}
          <span className="relative inline-block">
            <span className="text-blue-600">infrastructure</span>
            <span className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-200 rounded-full" />
          </span>
          <br />
          <span className="text-gray-700">en temps reel</span>
        </h1>

        <p className="animate-fade-slide-up delay-300 mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Veltrix monitore vos serveurs — CPU, RAM, Disque, reseau — et vous
          alerte avant que vos clients ne remarquent le probleme.
          <strong className="text-gray-700"> Concu pour l&apos;Afrique.</strong>
        </p>

        <div className="animate-fade-slide-up delay-400 mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="btn-shimmer group inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 hover:shadow-xl text-sm"
          >
            Demarrer gratuitement
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="group inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm text-sm"
          >
            Voir les fonctionnalites
            <span className="text-gray-400 group-hover:translate-y-0.5 transition-transform inline-block">&darr;</span>
          </a>
        </div>

        <div className="animate-fade-slide-up delay-500 mt-10 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400">
          {["Linux & Ubuntu", "Agent 7MB", "Donnees securisees", "Made in Togo"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              {t}
            </span>
          ))}
        </div>

        <div className="animate-float absolute top-32 left-10 w-12 h-12 bg-blue-100 rounded-xl opacity-60 hidden lg:block" />
        <div className="animate-float absolute top-48 right-16 w-8 h-8 bg-green-100 rounded-lg opacity-60 hidden lg:block" style={{ animationDelay: "1s" }} />
        <div className="animate-float absolute bottom-32 left-24 w-6 h-6 bg-purple-100 rounded-full opacity-60 hidden lg:block" style={{ animationDelay: "2s" }} />
      </div>
    </section>
  );
}

function AnimatedBar({ value, color, label }: { value: number; color: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimated(true); observer.disconnect(); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs" ref={ref}>
      <span className="text-gray-400 w-10">{label}</span>
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${color} transition-all duration-1000 ease-out`}
          style={{ width: animated ? `${value}%` : "0%" }}
        />
      </div>
      <span className="text-gray-600 w-8 text-right">{value}%</span>
    </div>
  );
}

function DashboardPreview() {
  const ref = useScrollAnimation();
  const servers = [
    { name: "prod-server-01", cpu: 42, ram: 67, disk: 23 },
    { name: "db-master",      cpu: 18, ram: 45, disk: 61 },
    { name: "web-nginx-01",   cpu: 71, ram: 82, disk: 44 },
  ];

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div ref={ref} className="scroll-hidden">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden">
            <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-md mx-4 px-3 py-1 text-xs text-gray-400 font-mono border border-gray-200">
                veltrix.ddns.net/dashboard
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "En ligne",   value: "3", color: "text-green-600",  bg: "bg-green-50  border-green-200"  },
                  { label: "Hors ligne", value: "0", color: "text-gray-400",   bg: "bg-gray-50   border-gray-200"   },
                  { label: "En attente", value: "1", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
                  { label: "Alertes",    value: "0", color: "text-blue-600",   bg: "bg-blue-50   border-blue-200"   },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`rounded-xl p-3 border ${bg} card-hover cursor-default`}>
                    <p className={`text-xl font-bold ${color}`}>{value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {servers.map(({ name, cpu, ram, disk }) => (
                  <div key={name} className="bg-white rounded-xl border border-gray-200 p-4 card-hover cursor-default">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-900 truncate">{name}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        En ligne
                      </span>
                    </div>
                    <div className="space-y-2">
                      <AnimatedBar value={cpu}  color={cpu  > 70 ? "bg-yellow-400" : "bg-blue-500"}   label="CPU"    />
                      <AnimatedBar value={ram}  color={ram  > 80 ? "bg-red-400"    : "bg-purple-500"}  label="RAM"    />
                      <AnimatedBar value={disk} color={disk > 80 ? "bg-red-400"    : "bg-green-500"}   label="Disk"   />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const titleRef = useScrollAnimation();
  const gridRef  = useStaggerAnimation(100);

  const features = [
    { icon: Activity,   title: "Monitoring temps reel",   desc: "CPU, RAM, Disque, reseau — donnees fraiches toutes les 30 secondes. Graphes sur 1h, 24h, 7 jours.", color: "bg-blue-100 text-blue-600"    },
    { icon: Bell,       title: "Alertes automatiques",    desc: "Seuils configurables. Alerte immediate quand CPU depasse 85% ou qu'un serveur devient inaccessible.",  color: "bg-red-100 text-red-600"      },
    { icon: Server,     title: "Agent ultra-leger",       desc: "Binaire Go de 7MB. Une commande d'installation. Fonctionne meme sur connexions instables.",             color: "bg-purple-100 text-purple-600" },
    { icon: BarChart3,  title: "Historique 90 jours",     desc: "Conservez 3 mois de metriques. Identifiez les tendances et anticipez les problemes de capacite.",       color: "bg-green-100 text-green-600"   },
    { icon: Globe,      title: "Concu pour l'Afrique",    desc: "Paiement Mobile Money (T-Money, Moov). Interface francais. Optimise pour les connexions lentes.",       color: "bg-amber-100 text-amber-600"   },
    { icon: Shield,     title: "Securise par design",     desc: "Isolation multi-tenant stricte. Chaque organisation ne voit que ses donnees. HTTPS, JWT, cles API.",    color: "bg-cyan-100 text-cyan-600"     },
  ];

  return (
    <section id="features" className="py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div ref={titleRef} className="scroll-hidden text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto text-lg">
            Sans la complexite des outils enterprise. Sans le prix non plus.
          </p>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="stagger-child scroll-hidden bg-white rounded-2xl p-6 border border-gray-200 card-hover glow-hover cursor-default"
            >
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-5`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const ref = useStaggerAnimation(150);

  const steps = [
    { step: "01", title: "Creez votre compte",    desc: "Inscription en 30 secondes. Aucune carte de credit pour l'essai gratuit 30 jours." },
    { step: "02", title: "Installez l'agent",     desc: "Une commande sur votre serveur. Premieres metriques en moins d'une minute." },
    { step: "03", title: "Surveillez et alertez", desc: "Seuils configurables. Notifications quand quelque chose ne va pas." },
  ];

  return (
    <section id="how" className="py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Operationnel en 5 minutes
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-8 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

          {steps.map(({ step, title, desc }) => (
            <div key={step} className="stagger-child scroll-hidden text-center relative">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 text-white font-bold text-xl relative z-10">
                {step}
              </div>
              <div className="text-xs font-bold text-blue-400 mb-1">ETAPE {step}</div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const ref = useStaggerAnimation(120);

  const plans = [
    {
      name: "Gratuit", price: "0", period: "/ mois",
      desc: "Pour decouvrir Veltrix",
      features: ["3 agents maximum", "30 jours de retention", "Alertes email", "Dashboard temps reel", "Support communaute"],
      cta: "Commencer gratuitement", href: "/register", highlight: false,
    },
    {
      name: "Starter", price: "10 000", period: "XOF / mois",
      desc: "Pour les petites equipes",
      features: ["10 agents", "90 jours de retention", "Alertes SMS + Email", "Graphes historiques", "Support email prioritaire"],
      cta: "Essai 30 jours gratuit", href: "/register", highlight: true,
    },
    {
      name: "Pro", price: "25 000", period: "XOF / mois",
      desc: "Pour les equipes DevOps",
      features: ["50 agents", "1 an de retention", "SMS + WhatsApp + Email", "API complete", "Support dedie"],
      cta: "Contacter l'equipe", href: "mailto:contact@veltrix.io", highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Tarifs simples</h2>
          <p className="text-gray-500 mt-4 text-lg">
            Paiement Mobile Money (T-Money, Moov) ou carte bancaire.
            <br />Pas de surprise, pas d&apos;engagement.
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map(({ name, price, period, desc, features, cta, href, highlight }) => (
            <div
              key={name}
              className={`stagger-child scroll-hidden bg-white rounded-2xl p-6 border-2 transition-all duration-300 ${
                highlight
                  ? "border-blue-500 animate-glow-pulse scale-105"
                  : "border-gray-200 card-hover"
              }`}
            >
              {highlight && (
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                  LE PLUS POPULAIRE
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900">{name}</h3>
              <p className="text-gray-500 text-sm mt-1 mb-4">{desc}</p>

              <div className="mb-6">
                <span className="text-3xl font-extrabold text-gray-900">{price}</span>
                <span className="text-sm text-gray-400 ml-1">{period}</span>
              </div>

              <ul className="space-y-3 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={href}
                className={`btn-shimmer block text-center py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Paiement securise · Annulation a tout moment · Donnees hebergees en Afrique de l&apos;Ouest
        </p>
      </div>
    </section>
  );
}

function FinalCTA() {
  const ref = useScrollAnimation();

  return (
    <section className="py-24 px-4">
      <div ref={ref} className="scroll-hidden max-w-3xl mx-auto text-center">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 shadow-2xl shadow-blue-200 relative overflow-hidden">
          <div className="absolute top-4 right-4 w-24 h-24 bg-white/5 rounded-full" />
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full" />

          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative z-10">
            Pret a surveiller votre infrastructure ?
          </h2>
          <p className="text-blue-100 mb-8 text-lg relative z-10">
            Rejoignez les equipes tech qui font confiance a Veltrix.
            30 jours gratuits, sans carte bancaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <Link
              href="/register"
              className="btn-shimmer inline-flex items-center justify-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg text-sm"
            >
              Creer mon compte gratuit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-500/40 text-white border border-white/20 px-8 py-4 rounded-xl font-semibold hover:bg-blue-500/60 transition-all text-sm"
            >
              <Smartphone className="h-4 w-4" />
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 py-12 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold text-gray-900">Veltrix</span>
            <span className="text-gray-400 text-sm">— Infrastructure Monitoring</span>
          </div>

          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/register" className="hover:text-blue-600 transition-colors">S&apos;inscrire</Link>
            <Link href="/login"    className="hover:text-blue-600 transition-colors">Connexion</Link>
            <a href="#pricing"     className="hover:text-blue-600 transition-colors">Tarifs</a>
            <a href="/beta" className="hover:text-blue-600 transition-colors">Programme Beta</a>
                        <a href="mailto:contact@veltrix.io" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>

          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Veltrix · Made in Togo
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <NavBar />
      <Hero />
      <DashboardPreview />
      <Features />
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
