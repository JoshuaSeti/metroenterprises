import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCarouselSlides } from "@/hooks/use-store-data";

interface Slide {
  image: string;
  headline: string;
  subtext: string;
  ctaLabel: string;
  ctaLink: string;
}

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const { data: dbSlides, isPending } = useCarouselSlides();

  const slides: Slide[] = dbSlides?.map((s) => ({
          image: s.image_url,
          headline: s.headline,
          subtext: s.subtext || "",
          ctaLabel: s.cta_label || "",
          ctaLink: s.cta_link || "/shop",
        })) || [];

  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);


  if (isPending) {
    return <section className="w-full h-[70vh] min-h-[500px] bg-secondary animate-pulse" aria-label="Loading carousel" />;
  }

  if (slides.length === 0) return null;

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
                {slide.ctaLabel && (
                  <Link
                    to={slide.ctaLink}
                    className="inline-block bg-background text-foreground px-8 py-3 text-sm font-semibold uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {slide.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrent((c) => (c - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-none bg-background/20 hover:bg-background/40 text-background hover:text-background"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrent((c) => (c + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-none bg-background/20 hover:bg-background/40 text-background hover:text-background"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </Button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <Button
                key={i}
                variant="ghost"
                onClick={() => setCurrent(i)}
                className="group h-8 w-8 rounded-none p-0 hover:bg-transparent"
                aria-label={`Go to slide ${i + 1}`}
              >
                <span className={`w-8 h-0.5 transition-colors ${i === current ? "bg-background" : "bg-background/40 group-hover:bg-background/70"}`} />
              </Button>
            ))}
          </div>
        </>
      )}

    </section>
  );
}
