import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🔍</span>
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Page introuvable</h2>
        <p className="text-gray-500 mb-8 text-sm">
          La page que vous cherchez n&apos;existe pas ou a été déplacée.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard" className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">Retour au dashboard</Link>
          <Link href="/login" className="bg-white text-gray-700 border border-gray-200 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
