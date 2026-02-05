import { useState, useEffect, useRef } from "react";
import primaryLogo from "../assets/Logo/primary_logo.png";
import primaryLogoOrange from "../assets/Logo/primary_logo_orange.png";
import secondaryLogo from "../assets/Logo/secondary_logo.png";
import secondaryLogoWhite from "../assets/Logo/secondary_logo_white.png";
import { CheckBadgeIcon, Cog6ToothIcon, UserIcon } from "@heroicons/react/24/outline";

import StickyNavbar from '../components/Navbar'
import Carousel from "../components/Carousel";
import Footer from "../components/Footer";
import BackToTopButton from "../components/BackToTopButton";
import sliderImage1 from "../assets/Slider/slider_1.jpg";
import sliderImage2 from "../assets/Slider/slider_2.jpg";
import sliderImage3 from "../assets/Slider/slider_3.jpg";
import kenapaZumarImage from "../assets/Image/Beranda_Sec_2_Pic_4.jpg";
import aboutImage1 from "../assets/Image/Beranda_Sec_2_Pic_1.jpg";
import aboutImage2 from "../assets/Image/Beranda_Sec_2_Pic_2.jpg";
import aboutImage3 from "../assets/Image/Beranda_Sec_2_Pic_3.jpg";
import aboutImage4 from "../assets/Image/Beranda_Sec_2_Pic_4.jpg";
import categoryImage1 from "../assets/Image/Beranda_Sec_3_Busana Muslim.jpg";
import categoryImage2 from "../assets/Image/Beranda_Sec_3_Medis.jpg";
import categoryImage3 from "../assets/Image/Beranda_Sec_3_Apparel.jpg";
import categoryImage4 from "../assets/Image/Beranda_Sec_3_Non Apparel.jpg";

const homeSlides = [
  {
    id: 1,
    title: "Produksi Apparel Berkualitas untuk Brand & Kebutuhan Anda",
    description: "Zumar Garment menghadirkan layanan jahit dan bordir professional dengan hasil rapi, presisi, dan konsisten. Siap untuk seragam, komunitas, hingga produksi brang.",
    cta: "Pesan dulu aja",
    image: sliderImage1,
  },
  {
    id: 2,
    title: "Tingkatkan Tampilan Kerja Anda",
    description: "dengan Seragam yang Dirancang Nyaman dan Tetap Stylish",
    cta: "Pesan Sekarang",
    image: sliderImage2,
    backgroundPosition: 'center 0%',
  },
  {
    id: 3,
    title: "Fleksibel untuk Setiap Skala Produksi",
    description: "Mulai dari 1pcs hingga ribuan pcs, Zumar siap menyesuaikan kebutuhan Anda dengan kualitas konsisten, proses transparan, dan timeline yang jelas.",
    cta: "Mulai Sekarang",
    image: sliderImage3,
  },
];

// Komponen marquee logo perusahaan
function CompanyLogoMarquee({ logos, speed = 20 }) {
  // Duplikat logo untuk efek looping
  const marqueeLogos = [...logos, ...logos];
  return (
    <div className="overflow-hidden w-full">
      <div
        className="flex items-center gap-16 animate-marquee"
        style={{
          animationDuration: `${speed}s`,
        }}
      >
        {marqueeLogos.map((logo, idx) => (
          <img
            key={idx}
            src={logo.src}
            alt={logo.alt}
            className="h-10 md:h-12 object-contain select-none"
            draggable="false"
            role="listitem"
          />
        ))}
      </div>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
      `}</style>
    </div>
  );
}

// Hook untuk animasi fade-in/slide-in saat section muncul
function useInViewAnimation(threshold = 0.2) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// Komponen animated counter
function AnimatedCounter({ to, duration = 3000, className = "", start = false }) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  useEffect(() => {
    if (start && !hasAnimated.current) {
      let startVal = 0;
      hasAnimated.current = true;
      const step = Math.ceil(to / (duration / 16));
      const interval = setInterval(() => {
        startVal += step;
        if (startVal >= to) {
          setCount(to);
          clearInterval(interval);
        } else {
          setCount(startVal);
        }
      }, 16);
      return () => clearInterval(interval);
    } else if (!start) {
      setCount(0);
      hasAnimated.current = false;
    }
  }, [to, duration, start]);
  return <span className={className}>{count}</span>;
}

// Komponen judul section dengan typing effect (support React children)
function SectionTitle({ children, inView, className = '', speed = 80, ...props }) {
  // Helper untuk flatten children menjadi string dan array of nodes
  function flattenChildren(children) {
    let text = '';
    let nodes = [];
    function traverse(child) {
      if (typeof child === 'string') {
        text += child;
        nodes.push(child);
      } else if (Array.isArray(child)) {
        child.forEach(traverse);
      } else if (child && child.props && child.props.children) {
        traverse(child.props.children);
      } else if (child) {
        // For React elements without children (e.g. <span/>)
        nodes.push(child);
      }
    }
    traverse(children);
    return { text, nodes };
  }
  const { text } = flattenChildren(children);
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!inView) {
      setDisplayed('');
      return;
    }
    let i = 0;
    setDisplayed('');
    if (!text) return;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [inView, text, speed]);
  // Render: tampilkan children, tapi hanya sampai displayed.length
  function renderTyped(children, max) {
    let count = 0;
    function render(child) {
      if (typeof child === 'string') {
        const remain = max - count;
        if (remain <= 0) return null;
        const part = child.slice(0, remain);
        count += part.length;
        return part;
      } else if (Array.isArray(child)) {
        return child.map(render);
      } else if (child && child.props && child.props.children) {
        const inner = render(child.props.children);
        if (inner === null) return null;
        return { ...child, props: { ...child.props, children: inner } };
      } else if (child) {
        return child;
      }
      return null;
    }
    return render(children);
  }
  return (
    <h2 className={`font-bold ${className}`} {...props}>
      {renderTyped(children, displayed.length)}
      <span className="inline-block w-2 h-6 align-middle bg-primaryColor animate-pulse ml-1" style={{visibility: inView && displayed.length < text.length ? 'visible' : 'hidden'}} />
    </h2>
  );
}

export default function Home() {
  // Data kategori (urutan: Fashion, Medis, Casual, Non Medis)
  const categories = [
    {
      title: "Produk Busana Muslim",
      img: categoryImage1,
      desc: "Lihat",
    },
    {
      title: "Produk Kebutuhan Medis",
      img: categoryImage2,
      desc: "Lihat",
    },
    {
      title: "Produk Apparel",
      img: categoryImage3,
      desc: "Lihat",
    },
    {
      title: "Produk Non Apparel",
      img: categoryImage4,
      desc: "Lihat",
    },
  ];

  // State untuk card aktif (default 1 = Medis)
  const [active, setActive] = useState(1);

  // Section refs for animation
  const [aboutRef, aboutInView] = useInViewAnimation();
  const [categoryRef, categoryInView] = useInViewAnimation();
  const [whyRef, whyInView] = useInViewAnimation();
  const [companiesRef, companiesInView] = useInViewAnimation();
  const [videoRef, videoInView] = useInViewAnimation();

  // Statistik bawah observer
  const [statRef, statInView] = useInViewAnimation(0.3);

  const aboutImages = [
    aboutImage1,
    aboutImage2,
    aboutImage3,
    aboutImage4,
  ];

  return (
    <>
      <StickyNavbar />
      <main role="main" className="bg-gray-100">
        <Carousel slides={homeSlides} />
        
        {/* Section About (TrustedFactory) */}
        <section
          ref={aboutRef}
          aria-labelledby="about-heading"
          className={`relative bg-gray-100 p-4 md:p-10 max-w-7xl mx-auto mt-10 rounded-lg transition-all duration-1000 ${aboutInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="flex border-r-[12px] border-primaryColor flex-col lg:flex-row gap-6 items-center lg:items-center">
            {/* Bagian gambar */}
            <div className="flex flex-row gap-4 md:gap-6 justify-center md:justify-start items-center">
              {/* 3 gambar kecil */}
              <div className="flex flex-col gap-3 md:gap-4 justify-center">
                {aboutImages.slice(0, 2).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt={`factory${i + 1}`}
                    className={`rounded-lg object-cover w-[140px] h-[84px] sm:w-[160px] sm:h-[96px] md:w-[250px] md:h-[120px]`}
                  />
                ))}
                <img
                  src={aboutImages[2]}
                  alt="factory3"
                  className="rounded-lg object-cover w-[140px] h-[84px] sm:w-[160px] sm:h-[96px] md:w-[250px] md:h-[180px]"
                />
              </div>
              {/* Gambar besar */}
              <div className="flex items-center justify-center">
                <img
                  src={aboutImages[3]}
                  alt="factory4"
                  className="rounded-lg object-cover w-[180px] h-[270px] sm:w-[200px] sm:h-[300px] md:w-[310px] md:h-[450px]"
                />
              </div>
            </div>
            {/* Kanan: Text dan Logo */}
            <article className="flex-1 flex flex-col justify-start px-4 pr-6 lg:px-0 lg:pr-8 mt-6 lg:mt-0">
              <div className="flex flex-row justify-between items-start gap-6 lg:gap-4">
                <div className="lg:text-left text-center w-full lg:w-auto">
                  <span className="text-base sm:text-lg text-gray-600 font-inter block">PABRIK GARMEN</span>
                  <SectionTitle inView={aboutInView} id="about-heading" className="text-xl text-primaryColor sm:text-2xl md:text-3xl font-bold font-inter mt-2 mb-2">
                    PALING TERPERCAYA
                  </SectionTitle>
                </div>
                <img src={secondaryLogo} alt="Zumar Garment" className="w-14 sm:w-16 md:w-24 h-auto flex-shrink-0 mt-1" />
              </div>
              <p className="text-gray-600 font-montserrat text-xs sm:text-sm md:text-base leading-relaxed mt-2 text-center lg:text-left">
                CV Zumar Garmen Indonesia adalah perusahaan yang bergerak di bidang jasa, perdagangan, dan industri konveksi. Berdiri sejak 1977 dengan nama “Puspa Sari”, perusahaan ini terus berkembang mengikuti perubahan zaman hingga menjadi pemain kuat di pasar domestik dan internasional. Meski sempat terdampak krisis ekonomi 1998 dan pandemi COVID-19, perusahaan mampu bertahan melalui inovasi dan digitalisasi di bidang produksi, manajemen, serta pemasaran.
                <br /><br />
                Kini, CV Zumar Garmen Indonesia dikenal sebagai produsen pakaian berkualitas tinggi seperti seragam kerja, pakaian olahraga, dan fashion casual, dengan komitmen pada kepuasan pelanggan, integritas, serta ketepatan waktu.
              </p>
            </article>
          </div>
        </section>

        {/* Section Production Category (Expanding Card Horizontal) */}
        <section
          ref={categoryRef}
          aria-labelledby="category-heading"
          className={`bg-gray-100 max-w-7xl mx-auto mt-16 px-4 md:px-0 transition-all duration-1000 ${categoryInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Logo dan judul sejajar horizontal */}
          <header className="flex flex-row items-center justify-center gap-4 mb-4">
            <img src={primaryLogo} alt="Zumar Garment" className="h-8 md:h-16" />
            <SectionTitle inView={categoryInView} color="primaryColor" id="category-heading" className="text-2xl md:text-3xl font-montserrat font-semibold flex items-end gap-2 text-center">
              <span className="text-primaryColor">Kategori</span> <span className="text-secondaryColor">Produk</span>
            </SectionTitle>
          </header>
          {/* Deskripsi */}
          <p className="text-center text-gray-500 font-montserrat font-light mb-6 text-sm md:text-base">
            Lihat berbagai kategori produk yang bisa Anda pilih sesuai kebutuhan.
          </p>
          {/* Expanding Card Grid */}
          <div className="flex gap-4 w-full max-w-5xl mx-auto mb-10" role="list" aria-label="Production categories">
            {categories.map((cat, i) => {
              const isActive = active === i;
              return (
                <article
                  key={i}
                  role="listitem"
                  onMouseEnter={() => setActive(i)}
                  className={`
                    group relative rounded-xl overflow-hidden shadow flex flex-col justify-end cursor-pointer
                    transition-all duration-500
                    ${isActive ? "flex-[2.5]" : "flex-1"}
                    min-h-[180px] md:min-h-[250px] bg-gray-200
                    hover:scale-105 hover:shadow-xl
                  `}
                  style={{
                    minWidth: 0,
                    maxWidth: isActive ? "420px" : "180px",
                  }}
                >
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
                    style={{
                      filter: isActive ? "brightness(1)" : "brightness(0.7)",
                      transform: isActive ? "scale(1.05)" : "scale(1)",
                    }}
                  />
                  {/* Konten hanya muncul di card aktif */}
                  <div className={`relative z-10 transition-all duration-500 ${isActive ? "opacity-100 p-4" : "opacity-0 p-0"}`}>
                    {isActive && (
                      <>
                        <h3 className="text-white text-lg md:text-xl font-montserrat font-bold mb-2">{cat.title}</h3>
                        <button className="self-start px-6 py-2 bg-primaryColor text-white rounded-full font-semibold shadow hover:scale-110 hover:bg-secondaryColor transition-transform duration-300">
                          <span className="font-montserrat font-bold text-white text-base md:text-lg"> {cat.desc} </span>
                        </button>
                      </>
                    )}
                  </div>
                  {/* Overlay untuk efek gelap hanya pada card inactive */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 pointer-events-none ${!isActive ? "bg-black/40" : "bg-black/0"}`}
                  />
                </article>
              );
            })}
          </div>
        </section>

        {/* Section Kenapa Zumar (Revisi Final) */}
        <section
          ref={whyRef}
          aria-labelledby="why-zumar-heading"
          className={`w-full bg-[linear-gradient(to_right,_#245156_28%,_#f3f4f6_28%)] mt-16 pt-16 pb-0 transition-all duration-1000 ${whyInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-4 md:px-0 items-start">
            <div className="relative h-[280px] sm:h-[380px] md:h-[483px] px-6 sm:px-10 md:px-0">
              <img
                src={kenapaZumarImage}
                alt="Kenapa Zumar"
                className="rounded-2xl object-cover shadow-lg h-full w-full md:absolute md:w-[370px] md:h-[462.5px]"
                style={{ top: '20px', left: '40px' }}
              />
            </div>
            <article className="flex flex-col justify-end gap-6 font-montserrat pl-[30%] pr-4 sm:pl-[30%] sm:pr-6 md:pl-0 md:pr-0">
              <SectionTitle inView={whyInView} id="why-zumar-heading" className="text-2xl md:text-3xl font-bold mb-2 pl-[1.5rem]">
                <span className="text-primaryColor">Kenapa Harus</span> <span className="text-secondaryColor">Zumar Garment?</span>
              </SectionTitle>
              <div className="flex flex-col gap-0">
                {/* Item 1 */}
                <div className="flex items-center gap-4">
                  <UserIcon className={`w-6 md:w-8 h-6 md:h-8 text-primaryColor ${whyInView ? 'animate-bounce' : ''}`} aria-hidden="true" />
                  <h3 className="font-bold text-primaryColor text-lg md:text-xl">Jahit Rapi & Presisi</h3>
                </div>
                <p className="text-gray-500 text-sm md:text-base pl-12">
                Setiap jahitan dikerjakan dengan standar kualitas tinggi oleh tim berpengalaman. Hasilnya bukan cuma kuat dan nyaman dipakai, tapi juga terlihat profesional. Cocok untuk seragam, brand, dan kebutuhan produksi skala apa pun.
                </p>

                {/* Item 2 */}
                <div className="flex items-center gap-4">
                  <Cog6ToothIcon className={`w-6 md:w-8 h-6 md:h-8 text-primaryColor ${whyInView ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <h3 className="font-bold text-primaryColor text-lg md:text-xl">Terus Berinovasi</h3>
                </div>
                <p className="text-gray-500 text-sm md:text-base pl-12">
                Kami terus mengembangkan desain, pilihan bahan, dan proses produksi agar tetap relevan dengan tren dan kebutuhan pasar. Tujuannya satu: hasil produksi yang efisien, berkualitas, dan sesuai ekspektasi Anda.
                </p>

                {/* Item 3 */}
                <div className="flex items-center gap-4">
                  <CheckBadgeIcon className={`w-6 md:w-8 h-6 md:h-8 text-primaryColor ${whyInView ? 'animate-pulse' : ''}`} aria-hidden="true" />
                  <h3 className="font-bold text-primaryColor text-lg md:text-xl">Fleksibel & Siap Produksi</h3>
                </div>
                <p className="text-gray-500 text-sm md:text-base pl-12">
                Mulai dari 1 pcs hingga ribuan pcs, Zumar siap menyesuaikan kebutuhan Anda dengan layanan konsultasi yang responsif dan proses yang transparan.
                </p>
              </div>
            </article>
            <div className="hidden md:flex justify-center items-start">
              <div className="bg-secondaryColor rounded-bl-[80px] w-[200px] h-[200px] flex items-center justify-center">
                <img src={secondaryLogoWhite} alt="Zumar Logo" className="w-28 h-28 object-contain" />
              </div>
            </div>
          </div>
          {/* Statistik bawah */}
          <div className="relative mt-12" ref={statRef}>
            {/* Background gambar pabrik */}
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
              alt="Pabrik"
              className="w-full h-[160px] object-cover"
            />
            {/* Overlay hijau tua */}
            <div className="absolute inset-0 bg-primaryColor/80" />
            {/* Statistik */}
            <div className="absolute font-inter inset-0 grid grid-cols-4 items-center px-4 md:px-16 lg:px-32" role="list" aria-label="Company statistics">
              <div className="text-center" role="listitem">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter to={1977} duration={1200} start={statInView} />
                </div>
                <div className="text-lg md:text-xl text-white/80">Founded</div>
              </div>
              <div className="text-center" role="listitem">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter to={634} duration={1200} start={statInView} />
                </div>
                <div className="text-lg md:text-xl text-white/80">Clients</div>
              </div>
              <div className="text-center" role="listitem">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter to={752} duration={1200} start={statInView} />
                </div>
                <div className="text-lg md:text-xl text-white/80">Projects done</div>
              </div>
              <div className="text-center" role="listitem">
                <div className="text-3xl md:text-4xl font-bold text-white">
                  <AnimatedCounter to={580} duration={1200} start={statInView} />
                </div>
                <div className="text-lg md:text-xl text-white/80">5-Stars Review</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Big Companies With Us */}
        <section
          ref={companiesRef}
          aria-labelledby="companies-heading"
          className={`bg-gray-100 py-16 transition-all duration-1000 ${companiesInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="max-w-5xl mx-auto px-4 text-center font-montserrat">
            <SectionTitle inView={companiesInView} color="primaryColor" id="companies-heading" className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-primaryColor">Big Companies </span> <span className="text-secondaryColor">With Us</span>
            </SectionTitle>
            <img src={primaryLogoOrange} alt="Zumar Garment" className="w-auto h-11 mx-auto mb-6" />
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-12">
            Zumar Garmen Indonesia bangga menjadi mitra berbagai perusahaan besar, baik dalam maupun luar negeri. Melalui kerja sama ini, kami menghadirkan produk konveksi berkualitas tinggi yang mendukung kebutuhan korporasi, event, dan brand fashion ternama. Kepercayaan mereka menjadi bukti komitmen kami dalam memberikan layanan terbaik dan hasil yang memuaskan.
            </p>
            <CompanyLogoMarquee
              logos={[
                { src: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", alt: "Google" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg", alt: "Amazon" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg", alt: "Microsoft" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png", alt: "Facebook" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg", alt: "Netflix" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", alt: "Apple" },
              ]}
              speed={30}
            />
          </div>
        </section>

        {/* Section Video Production */}
        <section
          ref={videoRef}
          aria-labelledby="video-heading"
          className={`bg-gray-100 py-16 transition-all duration-1000 ${videoInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="max-w-5xl mx-auto px-4">
            <div className="relative w-full aspect-video md:aspect-[16/7] bg-gray-300 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/OblL026SvD4"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="mt-8 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="md:w-1/2 font-montserrat">
                <p className="text-gray-600 text-sm font-semibold mb-2">
                  <span className="text-primaryColor">ZUMAR </span> <span className="text-secondaryColor">GARMENT</span>
                </p>
                <h2 id="video-heading" className="text-2xl font-bold text-primaryColor font-montserrat leading-tight">
                  Your wishes are my stitches.
                </h2>
              </div>
              <div className="md:w-1/2 md:pl-8 mt-4 md:mt-0 font-montserrat">
                <p className="text-primaryColor text-sm md:text-base leading-relaxed">
                Dari seragam kerja hingga fashion casual, semua kami buat dengan penuh ketelitian dan cinta. Tetap terhubung dengan Zumar Garmen Indonesia dan temukan inspirasi gaya terbaikmu di sini!.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BackToTopButton />
    </>
  );
}
