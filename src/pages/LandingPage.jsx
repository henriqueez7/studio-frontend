import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Instagram,
  MapPin,
  Phone,
  Scissors,
  ShieldCheck,
  Sparkles,
  CalendarCheck2,
  MessageCircleMore,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import carouselOne from "../assets/Carrosel 1.jpg";
import carouselTwo from "../assets/carrosel 2.jpg";
import carouselThree from "../assets/Carrosel 3.jpg";
import carouselFour from "../assets/carrosel 4.jpg";
import carouselFive from "../assets/carrosel 5.jpg";
import carouselSix from "../assets/carrosel 6.jpg";
import carouselSeven from "../assets/carrosel 7.jpg";
import logo from "../assets/logo-optimized.png";
import studioHeroImage from "../assets/studio-hero-full.jpeg";
import studioImage from "../assets/studio.jpeg";
import "./LandingPage.css";

const serviceCards = [
  {
    title: "Corte com leitura do estilo",
    description: "Degradê, desenho e acabamento limpo para sair do studio no ponto.",
    icon: Scissors,
  },
  {
    title: "Barba alinhada",
    description: "Desenho da barba pensado para reforçar o rosto e a presença.",
    icon: ShieldCheck,
  },
  {
    title: "Atendimento reservado",
    description: "Horário marcado, ambiente confortável e experiência mais tranquila do início ao fim.",
    icon: Sparkles,
  },
];

const operationalCards = [
  {
    title: "Agendamento rápido",
    description: "O cliente escolhe o serviço, vê datas livres e confirma em poucos toques.",
    icon: CalendarCheck2,
  },
  {
    title: "Confirmação organizada",
    description: "A agenda fica clara para o studio e reduz ruído no atendimento do dia.",
    icon: MessageCircleMore,
  },
  {
    title: "Fluxo com hora marcada",
    description: "Menos espera, mais previsibilidade e uma rotina mais profissional.",
    icon: Clock3,
  },
];

const showcaseSlides = [
  {
    image: studioImage,
    alt: "Entrada e ambiente do Studio Henrique Corte",
  },
  {
    image: carouselTwo,
    alt: "Ambiente do studio",
  },
  {
    image: carouselFour,
    alt: "Acabamento de corte",
  },
  {
    image: carouselSeven,
    alt: "Resultado final do atendimento",
  },
  {
    image: carouselOne,
    alt: "Corte artistico realizado no studio",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const softReveal = {
  hidden: { opacity: 0, y: 34, scale: 0.97, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.56, ease: [0.22, 1, 0.36, 1] },
  },
};

const staggerWrap = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.04,
    },
  },
};

const revealViewport = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -8% 0px",
};

function FramedImage({ src, alt, className = "", imageClassName = "", ...props }) {
  return (
    <div className={`landing-page__image-fill ${className}`.trim()}>
      <img
        src={src}
        alt={alt}
        className={`landing-page__image-fill-main ${imageClassName}`.trim()}
        {...props}
      />
    </div>
  );
}

export default function LandingPage() {
  const [activeShowcase, setActiveShowcase] = useState(0);
  const [isShowcasePaused, setIsShowcasePaused] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showMobileDock, setShowMobileDock] = useState(false);
  const touchStartX = useRef(null);
  const heroShellRef = useRef(null);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

      setScrollProgress(progress);
      setShowMobileDock(scrollTop > 280 && progress < 94);
    };

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);

    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  useEffect(() => {
    if (isShowcasePaused) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveShowcase((current) => (current + 1) % showcaseSlides.length);
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, [isShowcasePaused]);

  const handlePrevShowcase = () => {
    setActiveShowcase((current) =>
      current === 0 ? showcaseSlides.length - 1 : current - 1,
    );
  };

  const handleNextShowcase = () => {
    setActiveShowcase((current) => (current + 1) % showcaseSlides.length);
  };

  const getShowcaseSlide = (offset) =>
    showcaseSlides[
      (activeShowcase + offset + showcaseSlides.length) % showcaseSlides.length
    ];

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current == null) return;

    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = touchEndX - touchStartX.current;

    if (Math.abs(deltaX) > 40) {
      if (deltaX > 0) {
        handlePrevShowcase();
      } else {
        handleNextShowcase();
      }
    }

    touchStartX.current = null;
  };

  const handleHeroPointerMove = (event) => {
    const target = heroShellRef.current;
    if (!target) return;

    const bounds = target.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;

    target.style.setProperty("--landing-pointer-x", `${x}%`);
    target.style.setProperty("--landing-pointer-y", `${y}%`);
  };

  return (
    <div className="landing-page">
      <div
        className="landing-page__scroll-progress"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />
      <div className="landing-page__frame">
        <section
          className="landing-page__hero-shell"
          ref={heroShellRef}
          onPointerMove={handleHeroPointerMove}
        >
          <div className="landing-page__hero-topbar">
            <p>Corte personalizado com atendimento exclusivo em estúdio</p>
            <Link to="/login?next=/agendar">Agendar atendimento</Link>
          </div>

          <header className="landing-page__header">
            <div className="landing-page__container">
              <Link to="/" className="landing-page__brand">
                <img
                  src={logo}
                  alt="Studio Henrique Corte"
                  className="landing-page__brand-image"
                  decoding="async"
                  fetchPriority="high"
                />
              </Link>

              <nav className="landing-page__navigation">
                <a href="#about" className="landing-page__nav-link">
                  Sobre
                </a>
                <a href="#services" className="landing-page__nav-link">
                  Serviços
                </a>
                <a href="#gallery" className="landing-page__nav-link">
                  Ambiente
                </a>
                <a href="#contact" className="landing-page__nav-link">
                  Contato
                </a>
              </nav>

              <div className="landing-page__actions">
                <Link
                  to="/login"
                  className="landing-page__button landing-page__button--ghost"
                >
                  Login
                </Link>
                <Link
                  to="/login?next=/agendar"
                  className="landing-page__button landing-page__button--primary"
                >
                  Agendar
                </Link>
              </div>
            </div>
          </header>

          <main className="landing-page__hero">
            <motion.div
              className="landing-page__hero-copy"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="landing-page__eyebrow">Studio de barbearia</p>
              <h1 className="landing-page__hero-title">
                Um studio para quem quer agendar rápido e sair com presença no ponto.
              </h1>
              <p className="landing-page__hero-subtitle">
                Corte, barba e acabamento com hora marcada, atendimento reservado
                e um fluxo simples para o cliente escolher o horário sem complicação.
              </p>

              <div className="landing-page__hero-buttons">
                <Link
                  to="/login?next=/agendar"
                  className="landing-page__button landing-page__button--primary"
                >
                  Reservar horário
                  <ArrowRight className="landing-page__hero-icon" />
                </Link>
                <a
                  href="#services"
                  className="landing-page__button landing-page__button--outline"
                >
                  Explorar serviços
                </a>
              </div>

            </motion.div>

            <motion.div
              className="landing-page__hero-visual"
              initial={{ opacity: 0, y: 32, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            >
              <div className="landing-page__hero-stat">
                <strong>Agenda enxuta</strong>
                <span>Escolha rápida e atendimento sem fila</span>
              </div>

              <FramedImage
                src={studioHeroImage}
                alt="Ambiente do Studio Henrique Corte"
                className="landing-page__hero-image-frame"
                imageClassName="landing-page__hero-image"
                decoding="async"
                fetchPriority="high"
              />
            </motion.div>

            <div className="landing-page__hero-mobile-content">
              <h1>Studio Henrique Cortes</h1>
              <p>Uma nova experiência para um antigo padrão.</p>
              <Link to="/login?next=/agendar" className="landing-page__hero-mobile-button">
                Reserve sua experiência
              </Link>
            </div>
          </main>
        </section>

        <section id="about" className="landing-page__section landing-page__section--light">
          <div className="landing-page__about-grid">
            <motion.div
              className="landing-page__about-media"
              initial="hidden"
              whileInView="visible"
              viewport={revealViewport}
              variants={fadeLeft}
            >
              <motion.div className="landing-page__about-photo landing-page__about-photo--large" variants={softReveal}>
                <FramedImage src={carouselSix} alt="Atendimento no studio" loading="lazy" decoding="async" />
              </motion.div>
              <motion.div className="landing-page__about-photo landing-page__about-photo--small" variants={softReveal}>
                <FramedImage src={carouselThree} alt="Detalhe de corte no studio" loading="lazy" decoding="async" />
              </motion.div>
            </motion.div>

            <motion.div
              className="landing-page__about-copy"
              initial="hidden"
              whileInView="visible"
              viewport={revealViewport}
              variants={fadeRight}
            >
              <p className="landing-page__section-kicker">Sobre o studio</p>
              <h2 className="landing-page__section-title landing-page__section-title--dark">
                Um ambiente preparado para atender bem sem correria.
              </h2>
              <p className="landing-page__section-text landing-page__section-text--dark">
                O Studio Henrique Corte trabalha com atendimento reservado para entregar
                uma experiência melhor do início ao acabamento final. O foco é unir imagem,
                organização e conforto em um fluxo simples para o cliente.
              </p>

              <motion.div className="landing-page__about-list" variants={staggerWrap}>
                <motion.article className="landing-page__about-item" variants={softReveal}>
                  <span className="landing-page__about-marker" />
                  <div>
                    <strong>Trabalhamos apenas com horário marcado</strong>
                    <p>Mais pontualidade, mais foco no cliente e menos correria no dia.</p>
                  </div>
                </motion.article>
                <motion.article className="landing-page__about-item" variants={softReveal}>
                  <span className="landing-page__about-marker" />
                  <div>
                    <strong>Ambiente climatizado</strong>
                    <p>Conforto para transformar o atendimento em experiência de studio.</p>
                  </div>
                </motion.article>
                <motion.article className="landing-page__about-item" variants={softReveal}>
                  <span className="landing-page__about-marker" />
                  <div>
                    <strong>Atendimento mais profissional</strong>
                    <p>Fluxo claro para quem agenda e rotina mais organizada para o studio.</p>
                  </div>
                </motion.article>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <motion.section
          className="landing-page__section landing-page__section--light landing-page__section--compact"
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerWrap}
        >
          <div className="landing-page__services-head">
            <motion.div variants={fadeUp}>
              <p className="landing-page__section-kicker">Experiência</p>
              <h2 className="landing-page__section-title landing-page__section-title--dark">
                Uma experiência premium, clara e feita para agendar sem complicação.
              </h2>
            </motion.div>
          </div>

          <div className="landing-page__services-grid landing-page__services-grid--operations">
            {operationalCards.map((item, index) => (
              <motion.article
                key={item.title}
                className="landing-page__service-card landing-page__service-card--soft"
                variants={fadeUp}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div className="landing-page__service-icon">
                  <item.icon />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="services"
          className="landing-page__section landing-page__section--light"
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerWrap}
        >
          <motion.div className="landing-page__services-head" variants={fadeUp} transition={{ duration: 0.6 }}>
            <div>
              <p className="landing-page__section-kicker">Serviços</p>
              <h2 className="landing-page__section-title landing-page__section-title--dark">
                O que o studio entrega em cada atendimento.
              </h2>
            </div>

            <div className="landing-page__services-mosaic">
              <motion.div variants={softReveal}>
                <FramedImage src={carouselOne} alt="Corte realizado no studio" loading="lazy" decoding="async" />
              </motion.div>
              <motion.div variants={softReveal}>
                <FramedImage src={carouselFive} alt="Acabamento de barba no studio" loading="lazy" decoding="async" />
              </motion.div>
            </div>
          </motion.div>

          <div className="landing-page__services-grid">
            {serviceCards.map((item, index) => (
              <motion.article
                key={item.title}
                className="landing-page__service-card"
                variants={fadeUp}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div className="landing-page__service-icon">
                  <item.icon />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          id="gallery"
          className="landing-page__section landing-page__showcase"
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerWrap}
        >
          <div className="landing-page__showcase-layout">
            <motion.div
              className="landing-page__showcase-header"
              variants={fadeUp}
              transition={{ duration: 0.55 }}
            >
              <p className="landing-page__section-kicker">Ambiente</p>
              <h2 className="landing-page__section-title landing-page__showcase-title">
                Preparado para receber você.
              </h2>
            </motion.div>

            <motion.div
              className="landing-page__showcase-carousel"
              variants={softReveal}
              onMouseEnter={() => setIsShowcasePaused(true)}
              onMouseLeave={() => setIsShowcasePaused(false)}
              onFocus={() => setIsShowcasePaused(true)}
              onBlur={() => setIsShowcasePaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <motion.div className="landing-page__showcase-stage" variants={staggerWrap}>
                {[-1, 0, 1].map((offset) => {
                  const slide = getShowcaseSlide(offset);
                  const isActive = offset === 0;

                  return (
                    <div
                      key={`${slide.alt}-${offset}`}
                      className={`landing-page__showcase-card${
                        isActive ? " landing-page__showcase-card--active" : ""
                      }`}
                    >
                      <FramedImage src={slide.image} alt={slide.alt} loading="lazy" decoding="async" />
                    </div>
                  );
                })}
              </motion.div>

              <motion.div className="landing-page__showcase-controls" variants={softReveal}>
                <motion.button
                  type="button"
                  className="landing-page__showcase-control"
                  aria-label="Imagem anterior"
                  onClick={handlePrevShowcase}
                  whileTap={{ scale: 0.94 }}
                >
                  <ChevronLeft />
                </motion.button>
                <div className="landing-page__showcase-dots">
                  {showcaseSlides.map((slide, index) => (
                    <motion.button
                      key={slide.alt}
                      type="button"
                      aria-label={`Ir para imagem ${index + 1}`}
                      className={`landing-page__showcase-dot${
                        index === activeShowcase ? " landing-page__showcase-dot--active" : ""
                      }`}
                      onClick={() => setActiveShowcase(index)}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>
                <motion.button
                  type="button"
                  className="landing-page__showcase-control"
                  aria-label="Proxima imagem"
                  onClick={handleNextShowcase}
                  whileTap={{ scale: 0.94 }}
                >
                  <ChevronRight />
                </motion.button>
              </motion.div>

              <motion.p className="landing-page__showcase-hint" variants={softReveal}>
                Arraste para o lado no celular ou use os controles
              </motion.p>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          className="landing-page__section landing-page__section--light"
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerWrap}
        >
          <div className="landing-page__booking-layout">
            <motion.div
              className="landing-page__booking-copy"
              variants={fadeUp}
              transition={{ duration: 0.55 }}
            >
              <p className="landing-page__section-kicker">Como agendar</p>
              <h2 className="landing-page__section-title landing-page__section-title--dark">
                Um processo simples para reservar seu horário no studio.
              </h2>
            </motion.div>

            <motion.div
              className="landing-page__booking-steps"
              variants={staggerWrap}
              transition={{ delayChildren: 0.08 }}
            >
              <motion.article className="landing-page__booking-step" variants={fadeUp} transition={{ duration: 0.45 }}>
                <span>01</span>
                <div>
                  <strong>Entre na area de agendamento</strong>
                  <p>Acesse seu perfil e inicie a reserva do atendimento.</p>
                </div>
              </motion.article>
              <motion.article className="landing-page__booking-step" variants={fadeUp} transition={{ duration: 0.45 }}>
                <span>02</span>
                <div>
                  <strong>Escolha o melhor horário</strong>
                  <p>Selecione o horário ideal para a sua rotina.</p>
                </div>
              </motion.article>
              <motion.article className="landing-page__booking-step" variants={fadeUp} transition={{ duration: 0.45 }}>
                <span>03</span>
                <div>
                  <strong>Chegue com tranquilidade</strong>
                  <p>Com tudo marcado, o atendimento acontece sem fila e sem pressa.</p>
                </div>
              </motion.article>
            </motion.div>
          </div>
        </motion.section>

        <motion.section
          id="contact"
          className="landing-page__section landing-page__final"
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={softReveal}
        >
          <div className="landing-page__final-card">
            <motion.div className="landing-page__final-copy" variants={fadeLeft}>
              <p className="landing-page__section-kicker">Studio Henrique Corte</p>
              <h2 className="landing-page__section-title">
                Entre no studio com hora marcada e saia com corte, barba e presença no ponto.
              </h2>
              <p className="landing-page__section-text">
                Atendimento de terca a sabado, das 09h as 20h.
              </p>
            </motion.div>

            <motion.div className="landing-page__final-actions" variants={fadeRight}>
              <Link
                to="/login?next=/agendar"
                className="landing-page__button landing-page__button--primary"
              >
                Quero agendar
              </Link>
            </motion.div>
          </div>
        </motion.section>

        <motion.footer
          className="landing-page__footer"
          initial="hidden"
          whileInView="visible"
          viewport={revealViewport}
          variants={staggerWrap}
        >
          <motion.div className="landing-page__footer-brand" variants={fadeUp} transition={{ duration: 0.5 }}>
            <img
              src={logo}
              alt="Studio Henrique Corte"
              className="landing-page__footer-logo"
              loading="lazy"
              decoding="async"
            />
            <p>Studio de barbearia com foco em corte, barba, acabamento e atendimento reservado.</p>
          </motion.div>

          <motion.div className="landing-page__footer-info" variants={fadeUp} transition={{ duration: 0.5, delay: 0.06 }}>
            <motion.div variants={softReveal}>
              <p className="landing-page__footer-label">Telefone</p>
              <p>(61) 99213-7065</p>
            </motion.div>
            <motion.div variants={softReveal}>
              <p className="landing-page__footer-label">Endereco</p>
              <p>AV. Lucena Roriz QD 90 Lote A Casa 05, Jardim Inga</p>
            </motion.div>
            <motion.div variants={softReveal}>
              <p className="landing-page__footer-label">Horario</p>
              <p>Terca a sabado, das 09h as 20h</p>
            </motion.div>
          </motion.div>

          <motion.div className="landing-page__footer-side" variants={fadeUp} transition={{ duration: 0.5, delay: 0.12 }}>
            <div className="landing-page__footer-links">
              <p className="landing-page__footer-label">Navegação</p>
              <div className="landing-page__footer-link-list">
                <a href="#about">Sobre</a>
                <a href="#services">Serviços</a>
                <a href="#gallery">Ambiente</a>
                <a href="#contact">Contato</a>
              </div>
            </div>

            <div className="landing-page__footer-socials">
              <a
                href="https://instagram.com/henriqcortes/"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <Instagram />
              </a>
              <a href="tel:+5561992137065" aria-label="Telefone">
                <Phone />
              </a>
              <a
                href="https://google.com/maps/dir//Studio+Henrique+Cortes,+Av.+Lucena+Roriz,+QUADRA+90+LOTE+A+CASA+05+-+Jardim+do+Inga,+Luzi%C3%A2nia+-+GO,+72850-300/@-16.0628736,-48.0116736,15z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x93599b17954468c1:0x7b8fb16ff12aa881!2m2!1d-47.9551615!2d-16.1497455?entry=ttu&g_ep=EgoyMDI2MDMyOS4wIKXMDSoASAFQAw%3D%3D"
                aria-label="Localizacao"
                target="_blank"
                rel="noreferrer"
              >
                <MapPin />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="landing-page__footer-bottom"
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.18 }}
          >
            <p>© 2026 Studio Henrique Corte. Atendimento com hora marcada.</p>
          </motion.div>
        </motion.footer>
      </div>

      <div
        className={`landing-page__mobile-dock${
          showMobileDock ? " landing-page__mobile-dock--visible" : ""
        }`}
        aria-hidden={!showMobileDock}
      >
        <a
          href="tel:+5561992137065"
          className="landing-page__mobile-dock-button landing-page__mobile-dock-button--ghost"
          tabIndex={showMobileDock ? 0 : -1}
        >
          <Phone />
          Ligar
        </a>
        <Link
          to="/login?next=/agendar"
          className="landing-page__mobile-dock-button landing-page__mobile-dock-button--primary"
          tabIndex={showMobileDock ? 0 : -1}
        >
          <CalendarCheck2 />
          Agendar
        </Link>
      </div>
    </div>
  );
}
