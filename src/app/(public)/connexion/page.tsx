import { UserCircle2 } from "lucide-react";
import { AuthForm } from "@/components/public/auth-form";

export const metadata = { title: "Connexion / Inscription" };

export default function ConnexionPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 lg:px-8 lg:py-16">
      <div className="grid grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 shadow-sm lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-marine to-ciel p-8 text-white lg:flex lg:p-10">
          <div>
            <UserCircle2 size={40} className="text-or" />
            <h1 className="mt-4 font-display text-2xl font-bold">Espace client & partenaire</h1>
            <p className="mt-2 text-slate-200">
              Créez votre compte pour solliciter nos services, suivre vos demandes et rester en contact avec KasayiMultiBusiness.
            </p>
          </div>
          <ul className="mt-8 space-y-3 text-sm">
            {[
              "Demandez un devis en quelques clics",
              "Suivez l'état de vos demandes de service",
              "Recevez notre newsletter et nos offres",
              "Accès sécurisé à vos informations",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-or/30 text-or">✓</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white p-6 lg:p-10">
          <AuthForm />
        </div>
      </div>
    </section>
  );
}
