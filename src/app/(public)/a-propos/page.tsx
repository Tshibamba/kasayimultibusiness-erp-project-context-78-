import Link from "next/link";
import { Target, Eye, Heart, ArrowRight } from "lucide-react";
import { ACTIVITES } from "@/lib/public/site-data";

export const metadata = { title: "À propos" };

const VALEURS = [
  { icon: Target, titre: "Mission", texte: "Contribuer au développement socio-économique du KasaÃ¯ Central par des activités durables, créatrices d'emplois et de valeur locale." },
  { icon: Eye, titre: "Vision", texte: "Devenir une référence régionale dans la gestion intégrée multi-activités, alliant professionnalisme et ancrage communautaire." },
  { icon: Heart, titre: "Valeurs", texte: "Intégrité, rigueur, proximité et Excellence. Une gestion transparente conforme aux normes SYSCOHADA." },
];

export default function AProposPage() {
  return (
    <>
      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8 lg:py-20">
          <p className="text-sm font-semibold uppercase tracking-wider text-or">À propos</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-bold text-slate-900 lg:text-5xl">
            Une entreprise locale, une ambition régionale
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-500">
            KasayiMultiBusiness est une entreprise congolaise multi-activités établie au KasaÃ¯ Central.
            Nous combinons agriculture, commerce, transport, sous-traitance et service traiteur pour
            offrir des solutions complètes à nos clients et partenaires.
          </p>
        </div>
      </section>

      {/* Histoire */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center">
          <div className="overflow-hidden rounded-3xl shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.pexels.com/photos/34792534/pexels-photo-34792534.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=700&w=1000"
              alt="Équipe agricole"
              className="h-80 w-full object-cover lg:h-[28rem]"
            />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Notre histoire</h2>
            <p className="mt-4 text-slate-600">
              Née d'une volonté de valoriser le potentiel du sol et des hommes du KasaÃ¯ Central,
              KasayiMultiBusiness a bâti son développement sur l'activité agricole, avant de
              diversifier ses métiers pour mieux servir ses clients.
            </p>
            <p className="mt-3 text-slate-600">
              Aujourd'hui, nos cinq pôles d'activité fonctionnent en synergie : nous produisons,
              nous échangeons, nous transportons, nous bâtissons et nous recevons — toujours avec la
              même exigence de qualité et de conformité.
            </p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              <Stat nombre="5" label="Activités" />
              <Stat nombre="100%" label="Conformité" />
              <Stat nombre="24/7" label="Disponibilité" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision / Valeurs */}
      <section className="bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {VALEURS.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.titre} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                  <span className="grid h-12 w-12 place-items-center rounded-xl bg-marine/10 text-marine">
                    <Icon size={24} />
                  </span>
                  <h3 className="mt-4 font-display text-xl font-bold text-slate-900">{v.titre}</h3>
                  <p className="mt-2 text-sm text-slate-600">{v.texte}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Activités résumé */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="font-display text-2xl font-bold text-slate-900 lg:text-3xl">Nos pôles d'activité</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {ACTIVITES.map((a) => (
            <div key={a.slug} className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
              <span className="text-3xl">{a.emoji}</span>
              <h3 className="mt-2 font-display text-sm font-bold text-slate-900">{a.nom}</h3>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-or px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-95"
          >
            Travaillons ensemble <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ nombre, label }: { nombre: string; label: string }) {
  return (
    <div className="rounded-xl bg-marine/5 p-4 text-center">
      <p className="font-display text-2xl font-extrabold text-marine">{nombre}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
