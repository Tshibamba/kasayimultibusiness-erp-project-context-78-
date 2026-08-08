import Link from "next/link";
import { Leaf, ArrowLeft } from "lucide-react";
import { StaffAuthForm } from "./staff-auth-form";

export const metadata = { title: "Connexion agent" };

export default function LoginPage() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-gradient-to-br from-marine to-[#163a59] p-10 text-white lg:flex lg:p-14">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-or/90 text-white"><Leaf size={22} /></span>
          <span className="font-display text-lg font-bold">KasayiMultiBusiness</span>
        </Link>
        <div>
          <h1 className="font-display text-3xl font-extrabold leading-tight">Espace agent<br /><span className="text-or">Back-office ERP</span></h1>
          <p className="mt-4 max-w-sm text-slate-300">
            Accédez à l'ERP : agriculture, commerce, transport, RH, comptabilité et rapports. Plateforme réservée au personnel de l'entreprise.
          </p>
          <ul className="mt-8 space-y-2 text-sm text-slate-200">
            <li>✓ Nouveau : inscrivez-vous en tant qu'agent (comptable, responsable...)</li>
            <li>✓ Votre compte sera activé par l'administrateur</li>
            <li>✓ Gestion des stocks, ventes, paie et rapports</li>
            <li>✓ Documents PDF & exports Excel</li>
            <li>✓ Rapports consolidés de direction</li>
          </ul>
        </div>
        <div className="space-y-3">
          <Link href="/connexion" className="block rounded-xl bg-white/5 px-4 py-3 text-sm text-ciel-clair transition hover:bg-white/10">
            👤 Client / Partenaire ? <span className="font-semibold text-white">Espace client →</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ciel-clair hover:text-white">
            <ArrowLeft size={15} /> Retour au site public
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-marine text-or"><Leaf size={22} /></span>
            <span className="font-display text-lg font-bold text-marine">KasayiMultiBusiness</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Espace agent</h2>
          <p className="mt-1 text-sm text-slate-500">Connectez-vous ou créez votre compte agent.</p>
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <StaffAuthForm />
          </div>
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
            🔑 Démo : <strong>admin@kasayimulti.cd</strong> / <strong>admin123</strong> (à changer après déploiement)
          </p>
        </div>
      </div>
    </div>
  );
}
