import { useEffect, useState } from "react";

const banners = [
  {
    image: "/banner1.jpg",
    title: "Garlic Naan",
    subtitle: "30% off on Tuesdays",
  },
  {
    image: "/banner2.jpg",
    title: "Chicken Biryani",
    subtitle: "Chef's Special",
  },
  {
    image: "/banner3.jpg",
    title: "Paneer Tikka",
    subtitle: "Try our new recipe!",
  },
];

export default function BannerCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md mx-auto mt-4 rounded-2xl overflow-hidden bg-gray-100 shadow h-48">
      {banners.map((banner, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}
        >
          <img src={banner.image} alt={banner.title} className="object-cover w-full h-full" />
          <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col justify-end p-6 rounded-2xl">
            <div className="text-white font-bold text-lg">Restaurant top #1</div>
            <div className="text-3xl font-extrabold text-white leading-tight">{banner.title}</div>
            <div className="text-xl font-bold text-white mb-2">{banner.subtitle}</div>
            <div className="flex gap-1 mb-2">
              {banners.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`w-2 h-2 rounded-full ${dotIdx === current ? "bg-white opacity-80" : "bg-white opacity-40"}`}
                ></span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 