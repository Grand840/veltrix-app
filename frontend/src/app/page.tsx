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
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Zap className="h-3 w-3" />
          30 jours d&apos;essai gratuit — aucune carte requise
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Surveillez votre{" "}
          <span className="text-blue-600">infrastructure</span>
          <br />
          en temps réel
        </h1>
        <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Veltrix monitore vos serveurs — CPU, RAM, Disque, réseau — et vous
          alerte avant que vos clients ne remarquent le problème. Conçu pour
          les équipes tech en Afrique et à l&apos;international.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Démarrer gratuitement
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
          >
            Voir les fonctionnalités
          </Link>
        </div>
        <p className="mt-6 text-xs text-gray-400">
          Déployé sur des infrastructures Linux · Compatible Ubuntu, Debian, CentOS
        </p>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="px-4 pb-20">
      <div className="max-w-5xl mx-auto">
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
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Activity,
      title: "Monitoring temps r\u00e9el",
      desc: "CPU, RAM, Disque, r\u00e9seau \u2014 donn\u00e9es fra\u00eeches toutes les 30 secondes. Graphes historiques sur 1h, 24h, 7 jours.",
    },
    {
      icon: Bell,
      title: "Alertes automatiques",
      desc: "Seuils configurables. Alerte imm\u00e9diate quand CPU d\u00e9passe 85% ou qu\u2019un serveur devient inaccessible.",
    },
    {
      icon: Server,
      title: "Agent ultra-l\u00e9ger",
      desc: "Binaire Go de 7MB. S\u2019installe en une commande. Fonctionne m\u00eame sur les connexions instables gr\u00e2ce au buffer local.",
    },
    {
      icon: BarChart3,
      title: "Historique 90 jours",
      desc: "Conservez 3 mois de m\u00e9triques. Identifiez les tendances et anticipez les probl\u00e8mes de capacit\u00e9.",
    },
    {
      icon: Globe,
      title: "Con\u00e7u pour l\u2019Afrique",
      desc: "Paiement Mobile Money (T-Money, Moov). Interface en fran\u00e7ais. Optimis\u00e9 pour les connexions lentes.",
    },
    {
      icon: Shield,
      title: "S\u00e9curis\u00e9 par design",
      desc: "Isolation multi-tenant stricte. Chaque organisation ne voit que ses donn\u00e9es. HTTPS, JWT, cl\u00e9s API uniques.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Tout ce dont vous avez besoin</h2>
          <p className="text-gray-500 mt-3 max-w-xl mx-auto">
            Veltrix couvre tous les aspects du monitoring d&apos;infrastructure
            sans la complexit\u00e9 des outils enterprise.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Cr\u00e9ez votre compte",
      desc: "Inscription en 30 secondes. Aucune carte de cr\u00e9dit requise pour l\u2019essai gratuit de 30 jours.",
    },
    {
      step: "02",
      title: "Installez l\u2019agent",
      desc: "Une commande sur votre serveur. L\u2019agent Go d\u00e9marre et envoie les premi\u00e8res m\u00e9triques en moins d\u2019une minute.",
    },
    {
      step: "03",
      title: "Surveillez et alertez",
      desc: "Configurez vos seuils d\u2019alerte. Recevez des notifications quand quelque chose ne va pas.",
    },
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Op\u00e9rationnel en 5 minutes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
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
      desc: "Pour d\u00e9couvrir Veltrix",
      features: [
        "3 agents maximum",
        "30 jours de r\u00e9tention",
        "Alertes email",
        "Dashboard temps r\u00e9el",
        "Support communaut\u00e9",
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
      desc: "Pour les petites \u00e9quipes",
      features: [
        "10 agents",
        "90 jours de r\u00e9tention",
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
      desc: "Pour les \u00e9quipes DevOps",
      features: [
        "50 agents",
        "1 an de r\u00e9tention",
        "Alertes SMS + WhatsApp + Email",
        "API compl\u00e8te",
        "Support d\u00e9di\u00e9",
      ],
      cta: "Contacter l\u2019\u00e9quipe",
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
            Pas de surprise, pas d\u2019engagement.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(({ name, price, currency, period, desc, features, cta, href, highlight }) => (
            <div
              key={name}
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
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          Paiement s\u00e9curis\u00e9 \u00b7 Annulation \u00e0 tout moment \u00b7 Donn\u00e9es h\u00e9berg\u00e9es en Afrique de l&apos;Ouest
        </p>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Commencez \u00e0 surveiller votre infrastructure aujourd&apos;hui
        </h2>
        <p className="text-gray-500 mt-3 mb-8">
          Rejoignez les \u00e9quipes tech qui font confiance \u00e0 Veltrix pour garder
          leurs serveurs en bonne sant\u00e9.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Cr\u00e9er un compte gratuit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Activity className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-sm">Veltrix</span>
            <span className="text-gray-400 text-sm">\u2014 Infrastructure Monitoring</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/register" className="hover:text-gray-900">S&apos;inscrire</Link>
            <Link href="/login" className="hover:text-gray-900">Connexion</Link>
            <Link href="#pricing" className="hover:text-gray-900">Tarifs</Link>
            <a href="mailto:contact@veltrix.io" className="hover:text-gray-900">Contact</a>
          </div>
          <p className="text-xs text-gray-400">
            &copy; 2026 Veltrix \u00b7 Made in Togo
          </p>
        </div>
      </div>
    </section>
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
