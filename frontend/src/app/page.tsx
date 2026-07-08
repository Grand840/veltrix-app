"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Server,
  Bell,
  BarChart3,
  Shield,
  Zap,
  CheckCircle2,
  ArrowRight,
  Globe,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Veltrix</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden sm:block">
            Tarifs
          </Link>
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
            Connexion
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Essai gratuit
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Zap className="h-3 w-3" />
          30 jours d&apos;essai gratuit — aucune carte requise
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Surveillez votre{" "}
          <span className="text-blue-600">infrastructure</span>
          <br />
          en temps r&eacute;el
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Veltrix monitore vos serveurs — CPU, RAM, Disque, r&eacute;seau — et vous
          alerte avant que vos clients ne remarquent le probl&egrave;me. Con&ccedil;u pour
          les &eacute;quipes tech en Afrique et &agrave; l&apos;international.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            D&eacute;marrer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Voir les fonctionnalit&eacute;s
          </Link>
        </div>
        <p className="mt-6 text-xs text-gray-400">
          D&eacute;ploy&eacute; sur des infrastructures Linux · Compatible Ubuntu, Debian, CentOS
        </p>
      </motion.div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="px-4 pb-20">
      <motion.div
        className="max-w-5xl mx-auto"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-3 text-xs text-gray-400 font-mono">
              veltrix.ddns.net/dashboard
            </span>
          </div>
          <div className="p-6 bg-gray-50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: "En ligne",   value: "3", color: "text-green-600 bg-green-50 border-green-200"  },
                { label: "Hors ligne", value: "0", color: "text-gray-400  bg-gray-50  border-gray-200"   },
                { label: "En attente", value: "1", color: "text-yellow-600 bg-yellow-50 border-yellow-200"},
                { label: "Alertes",    value: "0", color: "text-blue-600  bg-blue-50  border-blue-200"   },
              ].map(({ label, value, color }) => (
                <div key={label} className={`rounded-xl p-3 border ${color.split(" ").slice(1).join(" ")}`}>
                  <p className={`text-xl font-bold ${color.split(" ")[0]}`}>{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "prod-server-01", cpu: 42, ram: 67, disk: 23 },
                { name: "db-master",      cpu: 18, ram: 45, disk: 61 },
                { name: "web-nginx-01",   cpu: 71, ram: 82, disk: 44 },
              ].map(({ name, cpu, ram, disk }) => (
                <div key={name} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {name}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      En ligne
                    </span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "CPU",    value: cpu,  color: cpu  > 70 ? "bg-yellow-400" : "bg-blue-500"  },
                      { label: "RAM",    value: ram,  color: ram  > 80 ? "bg-red-400"    : "bg-purple-500" },
                      { label: "Disque", value: disk, color: disk > 80 ? "bg-red-400"    : "bg-green-500"  },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400 w-10">{label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${color}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className="text-gray-600 w-8 text-right">{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Activity,
      title: "Monitoring temps réel",
      desc: "CPU, RAM, Disque, réseau — données fraîches toutes les 30 secondes. Graphes historiques sur 1h, 24h, 7 jours.",
    },
    {
      icon: Bell,
      title: "Alertes automatiques",
      desc: "Seuils configurables. Alerte immédiate quand CPU dépasse 85% ou qu’un serveur devient inaccessible.",
    },
    {
      icon: Server,
      title: "Agent ultra-léger",
      desc: "Binaire Go de 7MB. S’installe en une commande. Fonctionne même sur les connexions instables grâce au buffer local.",
    },
    {
      icon: BarChart3,
      title: "Historique 90 jours",
      desc: "Conservez 3 mois de métriques. Identifiez les tendances et anticipez les problèmes de capacité.",
    },
    {
      icon: Globe,
      title: "Conçu pour l’Afrique",
      desc: "Paiement Mobile Money (T-Money, Moov). Interface en français. Optimisé pour les connexions lentes.",
    },
    {
      icon: Shield,
      title: "Sécurisé par design",
      desc: "Isolation multi-tenant stricte. Chaque organisation ne voit que ses données. HTTPS, JWT, clés API uniques.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Veltrix couvre tous les aspects du monitoring d&apos;infrastructure
            sans la complexité des outils enterprise.
          </p>
        </div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div
              key={title}
              variants={cardUp}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Créez votre compte",
      desc: "Inscription en 30 secondes. Aucune carte de crédit requise pour l’essai gratuit de 30 jours.",
    },
    {
      step: "02",
      title: "Installez l’agent",
      desc: "Une commande sur votre serveur. L’agent Go démarre et envoie les premières métriques en moins d’une minute.",
    },
    {
      step: "03",
      title: "Surveillez et alertez",
      desc: "Configurez vos seuils d’alerte. Recevez des notifications quand quelque chose ne va pas.",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Opérationnel en 5 minutes</h2>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {steps.map(({ step, title, desc }) => (
            <motion.div key={step} variants={cardUp} className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Gratuit",
      price: "0",
      currency: "XOF",
      period: "/ mois",
      desc: "Pour découvrir Veltrix",
      features: [
        "3 agents maximum",
        "30 jours de rétention",
        "Alertes email",
        "Dashboard temps réel",
        "Support communauté",
      ],
      cta: "Commencer gratuitement",
      href: "/register",
      highlight: false,
    },
    {
      name: "Starter",
      price: "10 000",
      currency: "XOF",
      period: "/ mois",
      desc: "Pour les petites équipes",
      features: [
        "10 agents",
        "90 jours de rétention",
        "Alertes SMS + Email",
        "Graphes historiques",
        "Support email prioritaire",
      ],
      cta: "Essai 30 jours gratuit",
      href: "/register",
      highlight: true,
    },
    {
      name: "Pro",
      price: "25 000",
      currency: "XOF",
      period: "/ mois",
      desc: "Pour les équipes DevOps",
      features: [
        "50 agents",
        "1 an de rétention",
        "Alertes SMS + WhatsApp + Email",
        "API complète",
        "Support dédié",
      ],
      cta: "Contacter l’équipe",
      href: "mailto:contact@veltrix.io",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Tarifs simples</h2>
          <p className="text-gray-500 mt-3">
            Paiement par Mobile Money (T-Money, Moov) ou carte bancaire.
            <br />
            Pas de surprise, pas d’engagement.
          </p>
        </div>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {plans.map(({ name, price, currency, period, desc, features, cta, href, highlight }) => (
            <motion.div
              key={name}
              variants={cardUp}
              className={`bg-white rounded-2xl p-6 border-2 transition-shadow hover:shadow-lg ${
                highlight ? "border-blue-500 shadow-md" : "border-gray-200"
              }`}
            >
              {highlight && (
                <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full inline-block mb-3">
                  LE PLUS POPULAIRE
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">{name}</h3>
              <p className="text-gray-500 text-sm mt-1 mb-4">{desc}</p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">{price}</span>
                <span className="text-sm text-gray-500 ml-1">{currency}{period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={href}
                className={`block text-center py-2.5 px-4 rounded-xl font-medium text-sm transition-colors ${
                  highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Paiement sécurisé · Annulation à tout moment · Données hébergées en Afrique de l&apos;Ouest
        </p>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4">
      <motion.div
        className="max-w-3xl mx-auto text-center"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <h2 className="text-3xl font-bold text-gray-900">
          Commencez à surveiller votre infrastructure aujourd&apos;hui
        </h2>
        <p className="text-gray-500 mt-3 mb-8">
          Rejoignez les équipes tech qui font confiance à Veltrix pour garder
          leurs serveurs en bonne santé.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Créer un compte gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 py-10 px-4">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Activity className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Veltrix</span>
            <span className="text-gray-400 text-sm">— Infrastructure Monitoring</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/register" className="hover:text-gray-900">S&apos;inscrire</Link>
            <Link href="/login" className="hover:text-gray-900">Connexion</Link>
            <Link href="#pricing" className="hover:text-gray-900">Tarifs</Link>
            <a href="mailto:contact@veltrix.io" className="hover:text-gray-900">Contact</a>
          </div>
          <p className="text-xs text-gray-400">
            &copy; 2026 Veltrix · Made in Togo
          </p>
        </div>
      </motion.div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      <Hero />
      <DashboardPreview />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
