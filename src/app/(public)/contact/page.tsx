import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "./contact-form";

export const metadata = { title: "Contact" };

export default function ContactPage() {
  const infos = [
    { icon: MapPin, titre: "Adresse", valeur: "Kasayi, Kananga — RD Congo" },
    { icon: Phone, titre: "Téléphone", valeur: "+243 000 000 000" },
    { icon: Mail, titre: "Email", valeur: "contact@kasayimultibusiness.cd" },
    { icon: Clock, titre: "Horaires", valeur: "Lun – Sam : 08h00 – 17h00" },
  ];

  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-or">Contact</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900 lg:text-5xl">Parlons de votre projet</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-500">
            Une question, un devis ou une demande de partenariat ? Notre équipe vous répond avec plaisir.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900">Nos coordonnées</h2>
            <div className="mt-6 space-y-4">
              {infos.map((i) => {
                const Icon = i.icon;
                return (
                  <div key={i.titre} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-marine/10 text-marine">
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{i.titre}</p>
                      <p className="mt-0.5 font-medium text-slate-800">{i.valeur}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
              <div className="grid h-48 place-items-center bg-gradient-to-br from-marine to-ciel text-center text-white">
                <div>
                  <MapPin size={32} className="mx-auto" />
                  <p className="mt-2 text-sm font-medium">Kasayi, Kananga</p>
                  <p className="text-xs text-slate-200">Carte interactive bientôt disponible</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:p-8">
            <h2 className="font-display text-xl font-bold text-slate-900">Envoyez-nous un message</h2>
            <p className="mb-5 text-sm text-slate-500">Renseignez le formulaire ci-dessous.</p>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
