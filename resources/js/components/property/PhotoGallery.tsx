import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Grid2X2, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import galleryMain from "@/assets/gallery-main.jpg";
import galleryBedroom from "@/assets/gallery-bedroom.jpg";
import galleryKitchen from "@/assets/gallery-kitchen.jpg";
import galleryPool from "@/assets/gallery-pool.jpg";
import galleryBathroom from "@/assets/gallery-bathroom.jpg";

const defaultImages = [
  { src: galleryMain, alt: "Vue extérieure avec piscine à débordement" },
  { src: galleryBedroom, alt: "Chambre principale vue mer" },
  { src: galleryKitchen, alt: "Cuisine et salle à manger panoramique" },
  { src: galleryPool, alt: "Piscine à débordement au coucher du soleil" },
  { src: galleryBathroom, alt: "Salle de bain spa avec baignoire îlot" },
];

interface Props {
  image?: string | null;
  images?: string[];
  title?: string;
}

export default function PhotoGallery({ image, images: propImages, title = "" }: Props) {
  // Build image list: use DB images if available, else static defaults
  const imageList = (() => {
    const custom: { src: string; alt: string }[] = [];
    if (image) custom.push({ src: image, alt: title });
    if (propImages && propImages.length > 0) {
      propImages.forEach((src, i) => custom.push({ src, alt: `${title} — photo ${i + 2}` }));
    }
    if (custom.length >= 5) return custom.slice(0, 5);
    // Pad with defaults if we don't have enough
    const padded = [...custom];
    for (const d of defaultImages) {
      if (padded.length >= 5) break;
      padded.push(d);
    }
    return padded.length > 0 ? padded : defaultImages;
  })();

  const images = imageList;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const prev = () => setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrentIndex((i) => (i + 1) % images.length);

  return (
    <>
      {/* Grid layout */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] md:h-[500px] rounded-2xl overflow-hidden">
        {/* Main large image */}
        <div
          className="col-span-4 md:col-span-2 row-span-2 relative cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={images[0].src}
            alt={images[0].alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
          <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Expand className="w-5 h-5 text-white drop-shadow-lg" />
          </div>
        </div>
        {/* Thumbnails */}
        {images.slice(1).map((img, i) => (
          <div
            key={i}
            className="col-span-2 md:col-span-1 relative cursor-pointer group overflow-hidden"
            onClick={() => openLightbox(i + 1)}
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
            {/* Last thumb — show all photos button */}
            {i === 3 && (
              <div className="absolute inset-0 bg-foreground/45 flex items-center justify-center">
                <div className="text-center text-white">
                  <Grid2X2 className="w-6 h-6 mx-auto mb-1" />
                  <span className="font-body text-sm font-semibold">Voir toutes</span>
                  <br />
                  <span className="font-body text-xs opacity-80">les photos</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center animate-fade-in">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <span className="font-body text-white/70 text-sm">
              {currentIndex + 1} / {images.length}
            </span>
          </div>

          {/* Main image */}
          <div className="relative w-full max-w-4xl mx-4">
            <img
              src={images[currentIndex].src}
              alt={images[currentIndex].alt}
              className="w-full max-h-[75vh] object-contain rounded-xl"
            />
            <p className="font-body text-white/60 text-sm text-center mt-3">
              {images[currentIndex].alt}
            </p>
          </div>

          {/* Arrows */}
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Thumbnails strip */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-14 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                  i === currentIndex ? "border-accent scale-110" : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img.src} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
