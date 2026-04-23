import Link from "next/link";

const features = [
  {
    title: "Triage Digital en Segundos",
    description:
      "Captura biométrica sin contacto para priorizar pacientes con datos clínicos objetivos desde el primer minuto.",
  },
  {
    title: "Lista de Espera Operativa",
    description:
      "Gestión unificada de espera, cama y pacientes atendidos con visibilidad en tiempo real para el equipo médico.",
  },
  {
    title: "Flujo Clínico Integrado",
    description:
      "Registro, historia clínica, visita y diagnóstico en un mismo sistema, sin cambiar de plataforma durante emergencia.",
  },
];

const numbers = [
  { label: "Tiempo de clasificación", value: "-75%" },
  { label: "Cobertura operativa", value: "24/7" },
  { label: "Flujo sin papel", value: "100%" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <img
              src="/images/logo/SignaApp.png"
              alt="SignaLife"
              className="h-10 w-auto"
            />
            <span className="text-sm font-semibold tracking-[0.2em] text-emerald-300">
              SIGNALIFE
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#solucion" className="transition hover:text-white">
              Solución
            </a>
            <a href="#tecnologia" className="transition hover:text-white">
              Tecnología
            </a>
            <a href="#contacto" className="transition hover:text-white">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            >
              Ingresar
            </Link>
            <Link
              href="/signin"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
            >
              Demo
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.2),transparent_40%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
              Ecosistema de Emergencia
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
              Triage médico, camas y atención en una sola plataforma.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300">
              SignaLife unifica la landing comercial y el sistema clínico en un mismo proyecto para
              acelerar despliegue, operación y adopción hospitalaria.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/signin"
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Abrir Plataforma
              </Link>
              <a
                href="#solucion"
                className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Ver Solución
              </a>
            </div>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {numbers.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur"
                >
                  <p className="text-2xl font-semibold text-emerald-300">{item.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-300">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-emerald-400/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-black/40">
              <img
                src="/images/landing/triaje.png"
                alt="Flujo de triaje SignaLife"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="solucion" className="bg-white py-20 text-slate-900">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold md:text-4xl">
              Plataforma integral para urgencias y admisión clínica
            </h2>
            <p className="mt-4 text-slate-600">
              Desde la recepción del paciente hasta la salida de la cama, todo queda conectado en el
              mismo flujo de trabajo.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm"
              >
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tecnologia" className="bg-slate-100 py-20 text-slate-900">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 lg:grid-cols-2">
          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img
              src="/images/landing/emergencia.png"
              alt="Panel de emergencia"
              className="h-72 w-full object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold">Tablero de Emergencia</h3>
              <p className="mt-2 text-sm text-slate-600">
                Priorización por triaje, especialidad y estado operativo del paciente en una sola vista.
              </p>
            </div>
          </article>

          <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <img
              src="/images/landing/habitaciones.png"
              alt="Gestión de camas y cubículos de emergencia"
              className="h-72 w-full object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold">Camas y Cubículos</h3>
              <p className="mt-2 text-sm text-slate-600">
                Distribución visual de ocupación por cubículo para administrar disponibilidad y egresos.
              </p>
            </div>
          </article>
        </div>
      </section>

      <section id="contacto" className="bg-slate-950 py-20">
        <div className="mx-auto w-full max-w-4xl px-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
            <h2 className="text-3xl font-semibold text-white">Implementa SignaLife en tu institución</h2>
            <p className="mt-4 text-slate-300">
              Escríbenos a{" "}
              <a
                href="mailto:signalife@engidea.com.ve"
                className="font-semibold text-emerald-300 underline decoration-emerald-500/60 underline-offset-4"
              >
                signalife@engidea.com.ve
              </a>{" "}
              y te apoyamos con una demo operativa.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signin"
                className="rounded-2xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Ir al sistema
              </Link>
              <a
                href="https://engidea.com.ve/"
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
              >
                Ecosistema Engidea
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
