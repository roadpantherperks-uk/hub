"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useScroll, useTransform, type Variants } from "framer-motion";
import { Header } from "@/components/Header";
import { ScrollProgress } from "@/components/landing/ScrollProgress";
import { MagneticButton } from "@/components/landing/MagneticButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  ArrowUpRight,
  UtensilsCrossed,
  Car,
  Wrench,
  CircleDot,
  Dumbbell,
  Scissors,
  Flower2,
  Smartphone,
  ClipboardCheck,
  BadgeCheck,
  Sparkles,
  Coffee,
  Fuel,
  Mail,
  Instagram,
  Facebook,
  Plus,
  Siren,
  Droplets,
  KeyRound,
  Wind,
} from "lucide-react";

/* -------------------------------------------------------------- DATA */

const benefits = [
  {
    title: "Members-only rates",
    desc: "Negotiated discounts from local businesses across the North East — exclusive to verified drivers.",
  },
  {
    title: "Verified network",
    desc: "Every member is hand-checked. The perks stay with the people they're meant for.",
  },
  {
    title: "Save daily",
    desc: "From your morning coffee to your annual MOT — every fixed cost gets cheaper.",
  },
  {
    title: "Built by drivers",
    desc: "Designed with people who drive for a living. Honest, useful, no marketing fluff.",
  },
];

const categories = [
  { icon: Siren, name: "Emergency Services" },
  { icon: Wrench, name: "MOT & Service" },
  { icon: Scissors, name: "Barbers" },
  { icon: UtensilsCrossed, name: "Food & Drink" },
  { icon: Droplets, name: "Car Wash" },
  { icon: Smartphone, name: "Mobile Phone Shops" },
  { icon: CircleDot, name: "Tyres" },
  { icon: KeyRound, name: "Car Sales Garages" },
  { icon: Dumbbell, name: "Gyms" },
  { icon: Flower2, name: "Beauty Salons" },
  { icon: Sparkles, name: "Nail Salons" },
  { icon: Wind, name: "Hair Salons" },
];

const driverTypes = [
  "Taxi Drivers",
  "Uber Drivers",
  "Bolt Drivers",
  "Delivery Drivers",
  "Driving Instructors",
  "Tradespeople",
  "Couriers",
];

const sampleDeals = [
  { icon: Wrench, business: "Local MOT garage", deal: "20% off MOT & Service", location: "Newcastle area" },
  { icon: Coffee, business: "Local coffee shop", deal: "Buy 1, get 1 free", location: "Gateshead area" },
  { icon: Car, business: "Local hand wash", deal: "£5 off premium wash", location: "Sunderland area" },
  { icon: CircleDot, business: "Local tyre fitter", deal: "15% off new tyres", location: "Teesside" },
  { icon: Fuel, business: "Local fuel partner", deal: "3p / litre off diesel", location: "Stockton area" },
  { icon: Dumbbell, business: "Local gym", deal: "First month free", location: "Durham area" },
];

const howSteps = [
  {
    icon: ClipboardCheck,
    title: "Sign up free",
    desc: "Tell us about yourself and upload a photo of your driver badge or platform screenshot.",
  },
  {
    icon: BadgeCheck,
    title: "Get verified",
    desc: "Our team checks your details — usually within 24 hours. No fee, no nonsense.",
  },
  {
    icon: Sparkles,
    title: "Start saving",
    desc: "Show your member status and unlock local discounts every time you stop by.",
  },
];

const faqs = [
  {
    q: "Is Road Panther Perks really free?",
    a: "Yes. 100% free for verified drivers — no subscriptions, no hidden fees. Local businesses fund the discounts because they want loyal driver customers.",
  },
  {
    q: "When does the platform launch?",
    a: "We're rolling out across the North East and Teesside in waves. Create your account now and you'll be in the first group of drivers to get access.",
  },
  {
    q: "What kind of drivers can join?",
    a: "Taxi, private hire (Uber, Bolt and similar), delivery riders, courier drivers, driving instructors and tradespeople with a registered work vehicle.",
  },
  {
    q: "What do I need to get verified?",
    a: "One piece of proof: a taxi or private hire badge photo, an Uber or Bolt account screenshot, a delivery platform account, or an instructor badge. We never share your documents.",
  },
  {
    q: "Which areas are covered?",
    a: "Newcastle, Gateshead, Sunderland, Durham, Middlesbrough, Stockton and Hartlepool at launch. Expanding as more partners come on board.",
  },
];

/* -------------------------------------------------------------- ROOT */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ScrollProgress />
      <Header />
      <Hero />
      <Stats />
      <Benefits />
      <HowItWorks />
      <Categories />
      <SampleDeals />
      <DriverTypes />
      <FAQ />
      <FinalCTA />
      <Footer />
      <MobileStickyCTA />
    </div>
  );
}

/* Reveal helper used across the page */
const easeOut = [0.22, 1, 0.36, 1] as const;
const reveal: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: easeOut },
  },
};
const lineStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

/* -------------------------------------------------------------- HERO */

function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  // Parallax — image drifts down, text drifts up as you scroll past the hero
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-20%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100svh] flex items-center overflow-hidden"
    >
      {/* Hero image as background — parallaxed */}
      <motion.div
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0 -top-10 -bottom-10"
      >
        <img
          src="/hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover"
        />
        {/* Layered gradient — dark at edges, lifts the photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
      </motion.div>

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative w-full max-w-6xl mx-auto px-6 lg:px-8 pt-32 pb-24"
      >
        <motion.div
          initial="hidden"
          animate="show"
          variants={lineStagger}
          className="max-w-3xl"
        >
          <motion.div
            variants={reveal}
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground tracking-wide mb-8"
          >
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 rounded-full bg-brand animate-ping opacity-60" />
              <span className="relative size-1.5 rounded-full bg-brand" />
            </span>
            Driver support · Real savings · Built for you
          </motion.div>
          <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-shadow-soft">
            <motion.span variants={reveal} className="block">
              Drive more.
            </motion.span>
            <motion.span variants={reveal} className="block text-brand">
              Spend less.
            </motion.span>
          </h1>
          <motion.p
            variants={reveal}
            className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed"
          >
            Exclusive local discounts for verified drivers across the
            North East and Teesside. Always free, always growing. Coming soon.
          </motion.p>
          <motion.div
            variants={reveal}
            className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-4"
          >
            <MagneticButton className="inline-block">
              <Link
                href="/signup"
                className="group relative inline-flex items-center gap-2 bg-foreground text-background font-semibold text-[15px] px-6 h-12 rounded-full overflow-hidden hover:bg-foreground transition-colors"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <span className="relative">Get started</span>
                <ArrowRight className="relative size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </MagneticButton>
            <a
              href="#how"
              className="group inline-flex items-center gap-1.5 text-foreground font-semibold text-[15px] px-6 h-12 hover:text-brand transition-colors"
            >
              Learn more
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Scroll hint — animated continuously */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 text-[10px] text-muted-foreground tracking-[0.3em] uppercase"
      >
        Scroll
        <span className="relative block w-px h-10 bg-border overflow-hidden">
          <span className="absolute top-0 left-0 w-px h-3 bg-brand animate-scroll-hint" />
        </span>
      </motion.div>
    </section>
  );
}

/* -------------------------------------------------------------- STATS */

function Stats() {
  const stats = [
    { value: 7, suffix: "+", label: "Towns at launch" },
    { value: 10, suffix: "", label: "Discount categories" },
    { value: 24, suffix: "h", label: "Verification time" },
    { value: 247, suffix: "+", label: "Drivers waiting" },
  ];
  return (
    <section className="py-24 md:py-32 hairline-b">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
            >
              <div className="text-5xl md:text-6xl font-semibold tracking-[-0.04em]">
                <Counter from={0} to={s.value} />
                <span className="text-brand">{s.suffix}</span>
              </div>
              <div className="text-sm text-muted-foreground mt-3">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- BENEFITS */

function Benefits() {
  return (
    <Section eyebrow="Why drivers join" title="Built for the people who drive every day.">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        className="grid md:grid-cols-2 gap-x-16 gap-y-14 mt-20"
      >
        {benefits.map((b) => (
          <motion.div
            key={b.title}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
            }}
            className="max-w-md"
          >
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {b.title}
            </h3>
            <p className="mt-3 text-muted-foreground leading-relaxed text-[15px]">
              {b.desc}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* -------------------------------------------------------------- HOW IT WORKS */

function HowItWorks() {
  return (
    <Section
      id="how"
      eyebrow="How it works"
      title="Three simple steps."
    >
      <div className="grid md:grid-cols-3 gap-x-12 gap-y-16 mt-20">
        {howSteps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, delay: i * 0.12 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl font-semibold text-brand tracking-tight">
                0{i + 1}
              </span>
              <span className="block w-12 h-px bg-border" />
              <s.icon className="size-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {s.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed text-[15px] max-w-xs">
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------- CATEGORIES */

function Categories() {
  return (
    <Section
      eyebrow="Categories"
      title="Save where you actually spend."
      subtitle="Ten everyday categories at launch, covering daily essentials and big annual costs."
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        className="mt-20 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-3 gap-y-6"
      >
        {categories.map((c) => (
          <motion.div
            key={c.name}
            variants={{
              hidden: { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="group flex flex-col items-center text-center gap-3 p-6 rounded-2xl hover:bg-card-soft transition-colors cursor-default"
          >
            <motion.div
              whileHover={{ rotate: -8, scale: 1.12 }}
              transition={{ type: "spring", stiffness: 280, damping: 14 }}
            >
              <c.icon
                className="size-7 text-muted-foreground group-hover:text-brand transition-colors"
                strokeWidth={1.4}
              />
            </motion.div>
            <div className="text-sm font-medium">{c.name}</div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* -------------------------------------------------------------- SAMPLE DEALS */

function SampleDeals() {
  return (
    <Section
      eyebrow="A preview"
      title="Real local deals coming soon."
      subtitle="A taste of the kind of perks members will unlock at launch. Final partners and rates may change."
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }}
        className="mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {sampleDeals.map((d) => (
          <motion.div
            key={d.business}
            variants={{
              hidden: { opacity: 0, y: 16 },
              show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
            }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="panel rounded-2xl p-7 group hover:border-brand/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <d.icon className="size-6 text-brand" strokeWidth={1.5} />
              <span className="text-xs text-muted-foreground">{d.location}</span>
            </div>
            <div className="mt-12 text-xs text-muted-foreground">{d.business}</div>
            <div className="mt-1.5 text-xl md:text-2xl font-semibold tracking-tight leading-snug">
              {d.deal}
            </div>
            <div className="mt-8 inline-flex items-center gap-1.5 text-xs font-medium text-brand">
              Coming at launch
              <ArrowUpRight className="size-3" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/* -------------------------------------------------------------- DRIVER TYPES */

function DriverTypes() {
  return (
    <Section
      eyebrow="Who it's for"
      title="If you drive for a living, you're in."
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        className="mt-20 flex flex-wrap justify-center gap-2.5 max-w-4xl mx-auto"
      >
        {driverTypes.map((t) => (
          <motion.div
            key={t}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
            }}
            className="hairline rounded-full px-5 py-2.5 text-sm font-medium hover:border-brand/40 hover:text-foreground transition-colors cursor-default text-muted-foreground"
          >
            {t}
          </motion.div>
        ))}
      </motion.div>
      <p className="text-center mt-10 text-sm text-muted-foreground">
        Don&apos;t see your role? Choose &quot;Other&quot; when you sign up.
      </p>
    </Section>
  );
}

/* -------------------------------------------------------------- FAQ */

function FAQ() {
  return (
    <Section eyebrow="Questions" title="Common questions." narrow>
      <div className="mt-16">
        <Accordion type="single" collapsible className="hairline-t">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <AccordionItem
                value={`item-${i}`}
                className="hairline-b border-0 group"
              >
                <AccordionTrigger className="text-base md:text-lg font-medium hover:no-underline py-6 text-left tracking-tight [&>svg]:hidden">
                  <span className="flex-1 pr-6">{f.q}</span>
                  <Plus
                    className="size-4 text-muted-foreground shrink-0 transition-transform group-data-[state=open]:rotate-45"
                    strokeWidth={2}
                  />
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-[15px] leading-relaxed pb-6 max-w-3xl">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------------- FINAL CTA */

function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero photo as backdrop again — bookends the page */}
      <div className="absolute inset-0">
        <img
          src="/hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 lg:px-8 py-32 md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-[clamp(2.5rem,7vw,5rem)] font-semibold leading-[1.02] tracking-[-0.04em]">
            Be the first to <span className="text-brand">benefit</span>.
          </h2>
          <p className="mt-8 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join for free. Save every day. Make every mile more rewarding.
          </p>
          <div className="mt-12 flex flex-wrap justify-center items-center gap-3 gap-y-2">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-foreground text-background font-semibold text-[15px] px-7 h-12 rounded-full hover:bg-foreground/90 transition-colors"
            >
              Create your free account
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-foreground font-semibold text-[15px] px-4 h-12 hover:text-brand transition-colors"
            >
              Already have one? Sign in
            </Link>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            Under 90 seconds &nbsp;·&nbsp; No card required
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- FOOTER */

function Footer() {
  return (
    <footer className="hairline-t">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-12 gap-10">
          <div className="md:col-span-5 space-y-5">
            <Link href="/" className="inline-flex items-center gap-2">
              <img src="/logo.png" alt="Road Panther Perks" width={28} height={28} className="rounded-md" />
              <span className="font-semibold tracking-tight text-[15px]">
                Road Panther <span className="text-brand">Perks</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              The driver support platform for the North East and Teesside. Free, verified,
              hyper-local.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <SocialIcon
                icon={Instagram}
                label="Instagram"
                href="https://www.instagram.com/road_panther_perks"
                external
              />
              <SocialIcon
                icon={Facebook}
                label="Facebook"
                href="https://www.facebook.com/profile.php?id=61589263567164"
                external
              />
              <SocialIcon
                icon={Mail}
                label="Email"
                href="mailto:hello@roadpantherperks.co.uk"
              />
            </div>
          </div>
          <div className="md:col-span-3 md:col-start-7">
            <div className="text-sm font-semibold mb-5">Platform</div>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/signup">Create account</FooterLink>
              <FooterLink href="/login">Sign in</FooterLink>
              <FooterLink href="#benefits">Benefits</FooterLink>
              <FooterLink href="#how">How it works</FooterLink>
            </ul>
          </div>
          <div className="md:col-span-3">
            <div className="text-sm font-semibold mb-5">Company</div>
            <ul className="space-y-3 text-sm">
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/privacy">Privacy</FooterLink>
              <FooterLink href="/terms">Terms</FooterLink>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-6 hairline-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} Road Panther Perks</div>
          <div>North East · Teesside · United Kingdom</div>
        </div>
      </div>
    </footer>
  );
}

/* -------------------------------------------------------------- HELPERS */

function Section({
  id,
  eyebrow,
  title,
  subtitle,
  narrow = false,
  children,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  narrow?: boolean;
  children: ReactNode;
}) {
  return (
    <section id={id} className="py-28 md:py-36">
      <div
        className={`mx-auto px-6 lg:px-8 ${narrow ? "max-w-3xl" : "max-w-6xl"}`}
      >
        <SectionHeader eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {children}
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
      className="max-w-3xl"
    >
      <motion.div
        variants={reveal}
        className="inline-flex items-center gap-3 mb-5"
      >
        <span className="block w-6 h-px bg-brand" />
        <span className="text-sm font-medium text-brand">{eyebrow}</span>
      </motion.div>
      <motion.h2
        variants={reveal}
        className="text-[clamp(2rem,5vw,3.75rem)] font-semibold tracking-[-0.03em] leading-[1.05]"
      >
        {title}
      </motion.h2>
      {subtitle ? (
        <motion.p
          variants={reveal}
          className="text-muted-foreground mt-6 text-lg leading-relaxed max-w-2xl"
        >
          {subtitle}
        </motion.p>
      ) : null}
    </motion.div>
  );
}

/* Mobile sticky CTA — slides in once you scroll past the hero */
function MobileStickyCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 540);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.div
      initial={false}
      animate={{ y: show ? 0 : 90, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.5, ease: easeOut }}
      className="md:hidden fixed bottom-4 inset-x-4 z-40"
    >
      <Link
        href="/signup"
        className="flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-[15px] h-12 rounded-full shadow-elegant"
      >
        Get started
        <ArrowRight className="size-4" />
      </Link>
    </motion.div>
  );
}

function Counter({ from, to, duration = 1.4 }: { from: number; to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, from, to, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

function SocialIcon({
  icon: Icon,
  label,
  href,
  external = false,
}: {
  icon: typeof Instagram;
  label: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="size-9 rounded-full hairline grid place-items-center text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors"
    >
      <Icon className="size-4" strokeWidth={1.5} />
    </a>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
