import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroImage1 from "@/assets/hero-1.jpg";
import heroImage2 from "@/assets/hero-2.jpg";

interface Slide {
  image: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaLink: string;
}

const defaultSlides: Slide[] = [
  {
    image: heroImage1,
    headline: "Refined Essentials",
    subtext: "Curated pieces for the discerning individual",
    ctaLabel: "Shop Now",
    ctaLink: "/shop",
  },
  {
    image: heroImage2,
    headline: "New Season",
    subtext: "Timeless silhouettes, modern sensibility",
    ctaLabel: "Explore",
    ctaLink: "/shop",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const slides = defaultSlides;

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative w-full h-[70vh] min-h-[500px] overflow-hidden bg-foreground">
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={slide.headline}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/40" />
          <div className="absolute inset-0 flex items-center">
            <div className="container">
              <div className="max-w-lg animate-fade-in" key={current}>
                <h1 className="font-heading text-4xl md:text-6xl font-bold text-background mb-4 leading-tight">
                  {slide.headline}
                </h1>
                <p className="text-background/80 text-lg mb-8 font-body">
                  {slide.subtext}
                </p>
                <Link
                  to={slide.ctaLink}
                  className="inline-block bg-background text-foreground px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {slide.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-background p-2 transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => setCurrent((c) => (c + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-background p-2 transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-8 h-0.5 transition-colors ${i === current ? "bg-background" : "bg-background/40"}`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
