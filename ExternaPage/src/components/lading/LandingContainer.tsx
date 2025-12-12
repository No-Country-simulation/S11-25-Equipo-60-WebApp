import { HeaderContainer } from "@/components";
import { HeroSection } from "./hero-section";
import { FeaturesSection } from "./features-section";
import { TestimonialsSection } from "./testimonials-section";
import { ContactSection } from "./contact-section";
import { Footer } from "./footer-section";

export const LandingContainer = () => {
  return (
    <>
      <HeaderContainer />
      <main className="bg-blue-200">
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
};
