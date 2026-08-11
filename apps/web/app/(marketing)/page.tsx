import { Hero } from "./Hero";
import { Portfolio } from "./Portfolio";
import { About } from "./About";
import { PricingCalculator } from "./PricingCalculator";
import { Testimonials } from "./Testimonials";
import { BookingSection } from "./BookingSection";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Portfolio />
      <About />
      <PricingCalculator />
      <Testimonials />
      <BookingSection />
    </>
  );
}
