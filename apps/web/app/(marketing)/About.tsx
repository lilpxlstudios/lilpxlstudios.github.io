const HIGHLIGHTS = [
  {
    title: "Climate-Controlled Studio",
    body: "We maintain a warm 26°C temperature during newborn sessions to ensure baby stays sleepy and comfortable.",
  },
  {
    title: "Sanitization Protocol",
    body: "Every wrap, prop, and surface is deep-sanitized before and after every session. We only book one newborn shoot a day.",
  },
  {
    title: "Curated Prop & Gown Closet",
    body: "We provide a premium collection of flowy maternity gowns and imported, organic, hypoallergenic baby swaddles.",
  },
];

export function About() {
  return (
    <section id="about" className="bg-paper-100">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl shadow-lg">
            <img
              src="/images/about/newborn_safety.png"
              alt="Safety first baby photoshoot Chennai"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-8 -right-6 hidden w-2/5 overflow-hidden rounded-xl border-4 border-paper-50 shadow-lg sm:block">
            <img
              src="/images/about/maternity_about.png"
              alt="Outdoor maternity photoshoot ECR beach"
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="inline-flex w-fit items-center rounded-full bg-accent-400/20 px-4 py-1.5 text-sm text-accent-600">
            Our Philosophy
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-ink-900 sm:text-4xl">
            A Safety-First Studio Designed for Young Families
          </h2>
          <div className="h-0.5 w-12 bg-accent-500" />
          <p className="text-ink-500">
            At Little Pixel Studios, we believe photography is more than just taking
            pictures—it&apos;s about creating a safe, comfortable, and beautiful space where you
            can celebrate life&apos;s finest milestones.
          </p>
          <p className="text-ink-500">
            Led by founder and lead photographer Magesh S., our studio in Palavakkam, Chennai is
            specifically curated for expectant mothers and delicate newborn babies.
          </p>

          <div className="mt-2 flex flex-col gap-5">
            {HIGHLIGHTS.map((item) => (
              <div key={item.title} className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-50 text-accent-600 shadow-sm">
                  ✦
                </div>
                <div>
                  <h4 className="font-medium text-ink-900">{item.title}</h4>
                  <p className="text-sm text-ink-500">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
