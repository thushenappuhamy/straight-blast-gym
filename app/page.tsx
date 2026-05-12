import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Dumbbell,
  HeartPulse,
  ShieldCheck,
  TimerReset,
  Flame,
  Users,
} from "lucide-react";
import { Footer } from "@/src/components/Footer";

const metrics = [
  { value: "01", label: "Personalized workout blueprint" },
  { value: "02", label: "Meal plans matched to your goal" },
  { value: "03", label: "Trainer-led support and accountability" },
];

const programs = [
  {
    title: "Strength",
    description: "Progressive overload, compound lifts, and coaching built for measurable power gains.",
    icon: Dumbbell,
  },
  {
    title: "Conditioning",
    description: "Fast-paced classes and structured conditioning sessions for sharp, athletic output.",
    icon: HeartPulse,
  },
  {
    title: "Transformation",
    description: "Calorie-aware nutrition, plan tracking, and habit loops designed for body recomposition.",
    icon: Flame,
  },
];

const features = [
  "Strict workout logic based on your questionnaire answers.",
  "Meal plans shaped by your body goals, activity, and diet preferences.",
  "Membership, supplements, and trainer access in one system.",
  "Clear plan history so you can track what changed over time.",
];

const supportPoints = [
  "Beginner, intermediate, and advanced pathways.",
  "Calorie targets adjusted by goal and body composition.",
  "Built for mobile-first training and easy check-ins.",
];

export default function Home() {
  const videoSrc = encodeURI("/home page.mp4");

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-[#090909] text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-60"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(230,60,47,0.28),transparent_34%),linear-gradient(180deg,rgba(10,10,10,0.35)_0%,rgba(10,10,10,0.78)_52%,#090909_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_74px)] opacity-25" />

      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#0b0b0b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-[#E63C2F]/60 bg-[#111111] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
              <Image src="/logo_new.jpeg" alt="Straight Blast Gym" width={48} height={48} className="h-full w-full object-cover" />
            </div>
            <div className="leading-none">
              <div className="text-[10px] font-semibold uppercase tracking-[0.45em] text-white/55">Straight</div>
              <div className="text-sm font-black uppercase tracking-[0.35em] text-[#F5F5F5]">
                Blast Gym
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 lg:flex">
            <Link href="#programs" className="transition-colors hover:text-white">
              Programs
            </Link>
            <Link href="#plans" className="transition-colors hover:text-white">
              Plans
            </Link>
            <Link href="#results" className="transition-colors hover:text-white">
              Results
            </Link>
            <Link href="#join" className="transition-colors hover:text-white">
              Join
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-full border border-white/20 px-5 py-2 text-xs font-bold uppercase tracking-[0.28em] text-white transition-colors hover:border-white/40 hover:bg-white/5 sm:inline-flex"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#E63C2F] px-5 py-2 text-xs font-black uppercase tracking-[0.3em] text-white shadow-[0_0_30px_rgba(230,60,47,0.28)] transition-transform hover:-translate-y-0.5"
            >
              Join Now
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 pb-16 pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pt-40">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-[#E63C2F]/30 bg-black/35 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.35em] text-[#F5F5F5]/85 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#E63C2F]" />
              Negombo&apos;s combat training system
            </div>

            <h1 className="max-w-2xl text-5xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-6xl lg:text-8xl">
              Forge a
              <span className="mt-2 block text-[#E63C2F]">stronger body</span>
              with precision.
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-white/72 sm:text-lg">
              Straight Blast Gym combines personalized workout plans, strict calorie-aware meal plans,
              elite coaching, and premium supplements inside one focused training platform.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 rounded-full bg-[#E63C2F] px-6 py-4 text-sm font-black uppercase tracking-[0.28em] text-white transition-transform hover:-translate-y-0.5"
              >
                Start Training
                <ArrowRight size={16} />
              </Link>
              <Link
                href="#programs"
                className="inline-flex items-center gap-3 rounded-full border border-white/18 bg-white/5 px-6 py-4 text-sm font-bold uppercase tracking-[0.28em] text-white backdrop-blur-md transition-colors hover:border-white/30 hover:bg-white/10"
              >
                View Programs
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.value}
                  className="rounded-3xl border border-white/10 bg-black/40 p-5 backdrop-blur-xl"
                >
                  <div className="text-2xl font-black text-[#E63C2F]">{metric.value}</div>
                  <div className="mt-2 text-sm leading-6 text-white/70">{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-[2rem] bg-[#E63C2F]/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/45 p-6 shadow-[0_20px_100px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.45em] text-white/45">
                    Live Training Hub
                  </div>
                  <div className="mt-2 text-xl font-black uppercase tracking-[0.22em] text-white">
                    SBG System
                  </div>
                </div>
                <div className="rounded-full border border-[#E63C2F]/35 bg-[#E63C2F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-[#F5F5F5]">
                  Active
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-[#111111]/80 p-5">
                  <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.3em] text-white/55">
                    <ShieldCheck size={16} className="text-[#E63C2F]" />
                    Structured Coaching
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/68">
                    Every plan starts from your questionnaire answers and follows a clear training rule set.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl border border-white/10 bg-[#111111]/80 p-5">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.3em] text-white/55">
                      <TimerReset size={16} className="text-[#E63C2F]" />
                      Fast Adjustments
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      Update your plan as your weight, goal, or schedule changes.
                    </p>
                  </div>

                  <div className="rounded-3xl border border-white/10 bg-[#111111]/80 p-5">
                    <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.3em] text-white/55">
                      <Users size={16} className="text-[#E63C2F]" />
                      Trainer Support
                    </div>
                    <p className="mt-3 text-sm leading-7 text-white/68">
                      Keep your momentum with memberships, training help, and progress tracking.
                    </p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#E63C2F]/25 bg-[linear-gradient(135deg,rgba(230,60,47,0.22),rgba(255,255,255,0.04))] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-[0.45em] text-white/50">
                        Today&apos;s Focus
                      </div>
                      <div className="mt-2 text-lg font-black uppercase tracking-[0.25em] text-white">
                        Train hard. Recover smart.
                      </div>
                    </div>
                    <Image src="/logo_new.jpeg" alt="Straight Blast Gym logo" width={84} height={84} className="rounded-full border border-white/10 bg-black/20 object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="programs" className="mx-auto max-w-7xl px-6 pb-10 lg:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {programs.map((program) => {
              const Icon = program.icon;

              return (
                <article
                  key={program.title}
                  className="rounded-[1.75rem] border border-white/10 bg-black/35 p-6 backdrop-blur-xl"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E63C2F]/15 text-[#E63C2F]">
                    <Icon size={22} />
                  </div>
                  <h2 className="mt-6 text-2xl font-black uppercase tracking-[0.2em] text-white">
                    {program.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-white/66">{program.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="plans" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-white/10 bg-black/40 p-8 backdrop-blur-xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E63C2F]/25 bg-[#E63C2F]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.35em] text-[#F5F5F5]">
                <BadgeCheck size={14} />
                Strict plan logic
              </div>
              <h2 className="mt-5 max-w-md text-3xl font-black uppercase leading-tight tracking-tight sm:text-4xl">
                Built to turn your input into a plan that makes sense.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/68 sm:text-base">
                The home page now mirrors the new template direction: deep black surfaces, steel gray panels,
                and red accents that feel aggressive without losing clarity.
              </p>

              <div className="mt-6 space-y-3">
                {supportPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/5 px-4 py-4">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-[#E63C2F]" />
                    <span className="text-sm leading-7 text-white/72">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2" id="results">
              {features.map((feature, index) => (
                <div
                  key={feature}
                  className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(0,0,0,0.28))] p-6 backdrop-blur-xl"
                >
                  <div className="text-sm font-black uppercase tracking-[0.35em] text-[#E63C2F]">
                    0{index + 1}
                  </div>
                  <p className="mt-4 text-base leading-7 text-white/78">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="join" className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
          <div className="rounded-[2.25rem] border border-[#E63C2F]/25 bg-[linear-gradient(135deg,rgba(230,60,47,0.24),rgba(17,17,17,0.82))] p-8 shadow-[0_30px_120px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.45em] text-white/55">
                  Ready to start
                </div>
                <h2 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">
                  Join the system and start training with purpose.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72 sm:text-base">
                  Sign up, log in, and move into your dashboard to get workouts, meals, and support aligned to your goal.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.28em] text-black transition-transform hover:-translate-y-0.5"
                >
                  Join Now
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-3 rounded-full border border-white/20 px-6 py-4 text-sm font-bold uppercase tracking-[0.28em] text-white transition-colors hover:border-white/35 hover:bg-white/5"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}