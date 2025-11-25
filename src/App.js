import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import {
  Home,
  User,
  Mail,
  Download,
  Github,
  Linkedin,
  ExternalLink,
  Code,
  Award,
  MapPin,
  Globe,
  CheckCircle,
  XCircle,
} from "lucide-react";

// EmailJS Configuration from environment variables
const EMAILJS_SERVICE_ID =
  process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_tubwglj";
const EMAILJS_TEMPLATE_EN =
  process.env.REACT_APP_EMAILJS_TEMPLATE_EN || "template_oh47p15";
const EMAILJS_TEMPLATE_ES =
  process.env.REACT_APP_EMAILJS_TEMPLATE_ES || "template_00hj6q2";
const EMAILJS_PUBLIC_KEY =
  process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "bJnfzVLxx5JK77Lgv";

const MIXPANEL_TOKEN =
  process.env.REACT_APP_MIXPANEL_TOKEN || "a38a6763405e1636c2a7d6646bd1f0f2";

// Mixpanel tracking utility
const mixpanel = {
  init: (token) => {
    try {
      if (
        typeof window !== "undefined" &&
        window.mixpanel &&
        window.mixpanel.init
      ) {
        window.mixpanel.init(token);
        console.log("Mixpanel initialized with token:", token);
      }
    } catch (error) {
      console.log("Mixpanel init error:", error);
    }
  },
  track: (event, properties = {}) => {
    try {
      if (
        typeof window !== "undefined" &&
        window.mixpanel &&
        typeof window.mixpanel.track === "function"
      ) {
        window.mixpanel.track(event, properties);
        console.log("Mixpanel tracked:", event, properties);
      } else {
        console.log("Mixpanel not ready, would track:", event, properties);
      }
    } catch (error) {
      console.log("Mixpanel track error:", error);
    }
  },
};

const Portfolio = () => {
  const [currentSection, setCurrentSection] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [isHoveringInput, setIsHoveringInput] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [language, setLanguage] = useState("en");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState("success");

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    const timer = setTimeout(() => setIsLoading(false), 2000);

    // Initialize Mixpanel properly
    const initMixpanel = () => {
      if (typeof window !== "undefined" && window.mixpanel) {
        // Initialize with your token
        mixpanel.init(MIXPANEL_TOKEN);

        // Get the anonymous distinct_id
        const anonymousId = window.mixpanel.get_distinct_id();

        // Track initial page load with anonymous ID
        mixpanel.track("Portfolio Loaded", {
          timestamp: new Date().toISOString(),
          anonymous_id: anonymousId,
        });
      } else {
        setTimeout(initMixpanel, 500);
      }
    };

    // Start initialization after a brief delay
    setTimeout(initMixpanel, 1000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  const handleLanguageToggle = () => {
    const newLang = language === "en" ? "es" : "en";
    setLanguage(newLang);
    mixpanel.track("Language Changed", { language: newLang });
  };

  const t = (en, es) => (language === "en" ? en : es);

  const handleNavClick = (section) => {
    setCurrentSection(section);
    mixpanel.track("Navigation Click", { section });
  };

  const handleDownloadResume = () => {
    const filename =
      language === "en"
        ? "Michelle_Medina_Resume_EN.pdf"
        : "Michelle_Medina_Resume_ES.pdf";

    const link = document.createElement("a");
    link.href = `/${filename}`;
    link.download = filename;
    link.click();

    mixpanel.track("Resume Downloaded", {
      language: language,
      filename: filename,
    });
  };

  const handleContactSubmit = async () => {
    const nameInput = document.querySelector(
      'input[placeholder*="name"], input[placeholder*="nombre"]'
    );
    const emailInput = document.querySelector('input[type="email"]');
    const messageInput = document.querySelector("textarea");

    const name = nameInput?.value || "";
    const email = emailInput?.value || "";
    const message = messageInput?.value || "";

    // Basic validation
    if (!name || !email || !message) {
      setNotificationMessage(
        t("Please fill in all fields", "Por favor completa todos los campos")
      );
      setNotificationType("error");
      setShowNotification(true);
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNotificationMessage(
        t(
          "Please enter a valid email address",
          "Por favor ingresa una dirección de correo válida"
        )
      );
      setNotificationType("error");
      setShowNotification(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const templateId =
        language === "en" ? EMAILJS_TEMPLATE_EN : EMAILJS_TEMPLATE_ES;

      const templateParams = {
        from_name: name,
        from_email: email,
        message: message,
        to_email: "michellemedflo@gmail.com",
      };

      await emailjs.send(
        EMAILJS_SERVICE_ID,
        templateId,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      // Enhanced Mixpanel tracking with user identification and aliasing
      try {
        // Get the anonymous ID that was tracking events before identification
        const anonymousId =
          typeof window !== "undefined" && window.mixpanel
            ? window.mixpanel.get_distinct_id()
            : null;

        // Alias the anonymous ID to the email (merges anonymous data with identified user)
        if (
          typeof window !== "undefined" &&
          window.mixpanel &&
          typeof window.mixpanel.alias === "function"
        ) {
          // Only alias if the current distinct_id is different from the email (i.e., still anonymous)
          if (anonymousId && anonymousId !== email) {
            window.mixpanel.alias(email, anonymousId);
          }
        }

        // Now identify user with their email
        if (
          typeof window !== "undefined" &&
          window.mixpanel &&
          typeof window.mixpanel.identify === "function"
        ) {
          window.mixpanel.identify(email);

          // Set user properties if people tracking is available
          if (
            window.mixpanel.people &&
            typeof window.mixpanel.people.set === "function"
          ) {
            window.mixpanel.people.set({
              $email: email,
              $name: name,
              $first_name: name.split(" ")[0] || name,
              $last_name: name.split(" ").slice(1).join(" ") || "",
              "Contact Source": "Portfolio Website",
              "Preferred Language": language,
              "Contact Date": new Date().toISOString(),
              "User Agent": navigator.userAgent,
              Referrer: document.referrer || "Direct",
              "First Contact Anonymous ID": anonymousId,
            });
          }
        }

        // Track the contact form submission event
        mixpanel.track("Contact Form Submitted", {
          user_email: email,
          user_name: name,
          message_length: message.length,
          language: language,
          form_source: "Portfolio Contact Form",
          success: true,
          timestamp: new Date().toISOString(),
          previous_anonymous_id: anonymousId,
        });
      } catch (mixpanelError) {
        // Still track the basic event even if user identification fails
        mixpanel.track("Contact Form Submitted", {
          language: language,
          success: true,
        });
      }

      setNotificationMessage(
        t(
          "Message sent successfully! I'll get back to you soon.",
          "¡Mensaje enviado exitosamente! Te responderé pronto."
        )
      );
      setNotificationType("success");
      setShowNotification(true);

      if (nameInput) nameInput.value = "";
      if (emailInput) emailInput.value = "";
      if (messageInput) messageInput.value = "";
    } catch (error) {
      console.error("EmailJS error:", error);
      setNotificationMessage(
        t(
          "Failed to send message. Please try emailing me directly at michellemedflo@gmail.com",
          "Error al enviar mensaje. Por favor envíame un email directamente a michellemedflo@gmail.com"
        )
      );
      setNotificationType("error");
      setShowNotification(true);

      mixpanel.track("Contact Form Error", {
        error_message: error.message,
        language: language,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProjectClick = (projectName) => {
    mixpanel.track("Project Clicked", { project: projectName });
  };

  const handleSocialClick = (platform) => {
    mixpanel.track("Social Link Clicked", { platform });
  };

  const navItems = [
    { id: "home", label: t("Home", "Inicio"), icon: Home },
    { id: "resume", label: t("Resume", "Currículum"), icon: User },
    // { id: "projects", label: t("Projects", "Proyectos"), icon: FolderOpen },
    { id: "contact", label: t("Contact", "Contacto"), icon: Mail },
  ];

  const projects = [
    {
      title: t("Support Portal Dashboard", "Panel de Soporte"),
      description: t(
        "Modern customer support dashboard built with React, featuring real-time ticket tracking and user analytics.",
        "Panel moderno de soporte al cliente construido con React, con seguimiento de tickets en tiempo real y análisis de usuarios."
      ),
      technologies: ["React", "JavaScript", "REST APIs", "Chart.js"],
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      demo: "#",
      github: "#",
    },
    {
      title: t("Internal Tools Suite", "Suite de Herramientas Internas"),
      description: t(
        "Collection of web-based tools to streamline support workflows and improve team efficiency.",
        "Colección de herramientas web para optimizar los flujos de trabajo de soporte y mejorar la eficiencia del equipo."
      ),
      technologies: ["HTML/CSS", "JavaScript", "Node.js", "Express"],
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      demo: "#",
      github: "#",
    },
    {
      title: t("Knowledge Base Frontend", "Frontend de Base de Conocimientos"),
      description: t(
        "Responsive documentation website with search functionality and user-friendly navigation.",
        "Sitio web de documentación responsivo con funcionalidad de búsqueda y navegación amigable."
      ),
      technologies: ["React", "Markdown", "Tailwind CSS", "Algolia"],
      image:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop",
      demo: "#",
      github: "#",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-rose-300 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-rose-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  const renderHome = () => (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-rose-200/10 to-transparent rounded-full blur-3xl animate-pulse transform -translate-x-1/2 -translate-y-1/2"></div>
          <div
            className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-200/8 to-transparent rounded-full blur-3xl animate-pulse transform translate-x-1/2 translate-y-1/2"
            style={{ animationDelay: "2s" }}
          ></div>
          <div
            className="absolute top-1/2 left-3/4 w-48 h-48 bg-gradient-to-br from-blue-200/12 to-transparent rounded-full blur-2xl animate-pulse transform translate-x-1/2 -translate-y-1/2"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <div className="relative mb-16">
          <div className="relative w-56 h-56 mx-auto mb-12 group">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-300/40 to-purple-300/40 rounded-full animate-pulse"></div>
            <div className="absolute inset-1 bg-gradient-to-br from-blue-200/30 to-pink-200/30 rounded-full animate-spin-slow"></div>
            <div className="absolute inset-3 bg-gradient-to-br from-white/80 to-white/60 rounded-full backdrop-blur-sm"></div>
            <div className="absolute inset-5 bg-gradient-to-br from-rose-100/60 to-purple-100/60 rounded-full"></div>

            <div className="absolute -top-2 -right-2 w-4 h-4 bg-rose-400 rounded-full animate-float opacity-60"></div>
            <div
              className="absolute -bottom-3 -left-3 w-3 h-3 bg-purple-400 rounded-full animate-float opacity-50"
              style={{ animationDelay: "1s" }}
            ></div>
            <div
              className="absolute top-1/4 -right-4 w-2 h-2 bg-pink-300 rounded-full animate-float opacity-70"
              style={{ animationDelay: "2s" }}
            ></div>

            <img
              src="/profile.jpg"
              alt="Profile"
              className="absolute inset-8 w-40 h-40 rounded-full object-cover shadow-2xl ring-4 ring-white/60 group-hover:ring-rose-200/60 transition-all duration-500"
            />
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl font-light text-gray-800 mb-4 tracking-wide">
              Michelle Medina
            </h1>

            <div className="flex items-center justify-center mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent w-24"></div>
              <div className="mx-6 w-2 h-2 bg-rose-300 rounded-full"></div>
              <div className="h-px bg-gradient-to-r from-transparent via-rose-300 to-transparent w-24"></div>
            </div>

            <p className="text-xl text-gray-600 font-light tracking-wide mb-8">
              {t(
                "Support Engineer & Web Developer",
                "Ingeniera de Soporte y Desarrolladora Web"
              )}
            </p>

            <p className="text-lg text-gray-700 max-w-2xl mx-auto leading-relaxed font-light">
              {t(
                "Passionate about creating seamless user experiences through thoughtful problem-solving and elegant web solutions. Bridging the gap between technical support and modern development.",
                "Apasionada por crear experiencias de usuario fluidas a través de la resolución reflexiva de problemas y soluciones web elegantes. Conectando el soporte técnico con el desarrollo moderno."
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-8 mb-20">
          {[
            {
              icon: Github,
              platform: "github",
              label: "GitHub",
              url: "https://github.com/mmedina3",
            },
            {
              icon: Linkedin,
              platform: "linkedin",
              label: "LinkedIn",
              url: "https://www.linkedin.com/in/michellemed/",
            },
            // {
            //   icon: Code,
            //   platform: "portfolio",
            //   label: t("Projects", "Proyectos"),
            //   url: "#projects",
            // },
          ].map(({ icon: Icon, platform, label, url }) => (
            <button
              key={platform}
              onClick={() => {
                handleSocialClick(platform);
                if (url.startsWith("http")) {
                  window.open(url, "_blank");
                } else if (url.startsWith("#")) {
                  handleNavClick("projects");
                }
              }}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="group relative p-4 bg-white/60 backdrop-blur-sm border border-white/40 rounded-full hover:bg-white/80 hover:shadow-lg hover:shadow-rose-200/50 transition-all duration-300 hover:-translate-y-1"
            >
              <Icon
                size={24}
                className="text-gray-700 group-hover:text-rose-600 transition-colors duration-300"
              />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {label}
              </span>
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              title: t("Technical Support", "Soporte Técnico"),
              icon: Award,
              skills: t(
                "Customer Success, Quality Assurance, Issue Resolution, Documentation",
                "Éxito del Cliente, Control de Calidad, Resolución de Problemas, Documentación"
              ),
            },
            {
              title: t("Web Development", "Desarrollo Web"),
              icon: Code,
              skills: t(
                "React, JavaScript, Modern CSS, API Integration",
                "React, JavaScript, CSS Moderno, Integración de APIs"
              ),
            },
            {
              title: t("Tools & Platforms", "Herramientas y Plataformas"),
              icon: MapPin,
              skills: "Zendesk, Jira, GitHub, Notion, Statuspage, PagerDuty",
            },
          ].map((skill, index) => (
            <div
              key={index}
              className="group relative bg-white/40 backdrop-blur-sm border border-white/50 rounded-2xl p-8 hover:bg-white/60 hover:shadow-xl hover:shadow-rose-200/20 transition-all duration-500 hover:-translate-y-2"
            >
              <div className="relative z-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                  <skill.icon className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-4">
                  {skill.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-light">
                  {skill.skills}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderResume = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center mb-16">
          <div>
            <h2 className="text-4xl font-light text-gray-800 mb-4">
              {t("Professional Journey", "Trayectoria Profesional")}
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full"></div>
          </div>
          <button
            onClick={handleDownloadResume}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="group relative px-8 py-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-full hover:bg-white/80 hover:shadow-lg hover:shadow-rose-200/50 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 text-gray-700 group-hover:text-rose-600">
              <Download size={20} />
              <span className="font-medium">
                {t("Download Resume", "Descargar CV")}
              </span>
            </div>
          </button>
        </div>

        <div className="space-y-12">
          <section className="relative bg-white/40 backdrop-blur-sm border border-white/50 rounded-3xl p-10 hover:bg-white/60 transition-all duration-500">
            <h3 className="text-2xl font-medium text-gray-800 mb-10 flex items-center">
              <div className="w-3 h-8 bg-gradient-to-b from-rose-400 to-purple-400 rounded-full mr-4"></div>
              {t("Experience", "Experiencia")}
            </h3>
            <div className="space-y-10">
              {[
                {
                  title: t("Support Engineer", "Ingeniera de Soporte"),
                  company: "Mixpanel",
                  period: t("2018 - Present", "2018 - Presente"),
                  achievements: [
                    t(
                      "Led support strategy for product launches, ensuring smooth rollouts and proactive issue resolution",
                      "Lideró la estrategia de soporte para lanzamientos de productos, asegurando implementaciones fluidas y resolución proactiva de problemas"
                    ),
                    t(
                      "Sustained 93%+ customer satisfaction rating while managing high-volume technical support operations",
                      "Mantuvo una calificación de satisfacción del cliente del 93%+ mientras gestionaba operaciones de soporte técnico de alto volumen"
                    ),
                    t(
                      "Mentored junior team members in advanced troubleshooting methodologies",
                      "Mentoró a miembros junior del equipo en metodologías avanzadas de resolución de problemas"
                    ),
                  ],
                },
                {
                  title: t(
                    "Software Engineer Apprentice",
                    "Aprendiz de Ingeniera de Software"
                  ),
                  company: "Techtonica",
                  period: t("2018", "2018"),
                  achievements: [
                    t(
                      "Completed intensive 6-month full-stack development program, mastering HTML/CSS, JavaScript, and modern web development frameworks",
                      "Completó un programa intensivo de desarrollo full-stack de 6 meses, dominando HTML/CSS, JavaScript y frameworks modernos de desarrollo web"
                    ),
                    t(
                      "Presented technical projects to industry professionals and potential employers during program showcase events",
                      "Presentó proyectos técnicos a profesionales de la industria y empleadores potenciales durante eventos de exhibición del programa"
                    ),
                    t(
                      "Participated in weekly code reviews and technical discussions, developing skills in constructive feedback and problem-solving",
                      "Participó en revisiones de código semanales y discusiones técnicas, desarrollando habilidades en retroalimentación constructiva y resolución de problemas"
                    ),
                  ],
                },
              ].map((job, index) => (
                <div key={index} className="relative pl-8">
                  <div className="absolute left-0 top-2 w-3 h-3 bg-rose-400 rounded-full shadow-md"></div>
                  <div className="absolute left-1.5 top-5 w-px h-full bg-gradient-to-b from-rose-300 to-transparent"></div>

                  <div className="space-y-3">
                    <h4 className="text-xl font-medium text-gray-800">
                      {job.title}
                    </h4>
                    <p className="text-rose-600 font-medium">
                      {job.company} • {job.period}
                    </p>
                    <ul className="space-y-2 mt-4">
                      {job.achievements.map((achievement, i) => (
                        <li
                          key={i}
                          className="text-gray-700 flex items-start font-light"
                        >
                          <div className="w-1.5 h-1.5 bg-rose-300 rounded-full mt-2.5 mr-4 flex-shrink-0"></div>
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <section className="bg-white/40 backdrop-blur-sm border border-white/50 rounded-3xl p-8 hover:bg-white/60 transition-all duration-500">
              <h3 className="text-2xl font-medium text-gray-800 mb-8 flex items-center">
                <div className="w-3 h-8 bg-gradient-to-b from-purple-400 to-rose-400 rounded-full mr-4"></div>
                {t("Education", "Educación")}
              </h3>
              <div className="space-y-4">
                <h4 className="text-xl font-medium text-gray-800">
                  {t("B.A. Sociology", "Licenciatura en Sociología")}
                </h4>
                <p className="text-gray-700 font-light">
                  {t(
                    "Latin America and Latino Studies",
                    "Estudios de América Latina y Latinos"
                  )}
                </p>
                <p className="text-rose-600 font-medium">
                  University of California, Santa Cruz • 2008 - 2012
                </p>
              </div>
            </section>

            <section className="bg-white/40 backdrop-blur-sm border border-white/50 rounded-3xl p-8 hover:bg-white/60 transition-all duration-500">
              <h3 className="text-2xl font-medium text-gray-800 mb-8 flex items-center">
                <div className="w-3 h-8 bg-gradient-to-b from-rose-400 to-purple-400 rounded-full mr-4"></div>
                {t("Core Skills", "Habilidades Principales")}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  t("Customer Success", "Éxito del Cliente"),
                  t("Quality Assurance", "Control de Calidad"),
                  t("Web Development", "Desarrollo Web"),
                  t(
                    "Cross-functional Collaboration",
                    "Colaboración Interfuncional"
                  ),
                  t("API Integration", "Integración de APIs"),
                  t("Documentation", "Documentación"),
                ].map((skill, index) => (
                  <div
                    key={index}
                    className="bg-white/50 rounded-lg px-4 py-3 border border-rose-200/50 hover:bg-white/70 transition-colors duration-300"
                  >
                    <span className="text-gray-700 text-sm font-light">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-800 mb-4">
            {t("Development Projects", "Proyectos de Desarrollo")}
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full mx-auto"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="group relative bg-white/40 backdrop-blur-sm border border-white/50 rounded-3xl overflow-hidden hover:bg-white/60 hover:shadow-2xl hover:shadow-rose-200/30 transition-all duration-500 hover:-translate-y-4"
            >
              <div className="relative overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>

              <div className="p-8">
                <h3 className="text-xl font-medium text-gray-800 mb-4 group-hover:text-rose-700 transition-colors duration-300">
                  {project.title}
                </h3>
                <p className="text-gray-700 mb-6 leading-relaxed font-light">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-rose-100/60 text-rose-700 text-sm rounded-full border border-rose-200/50 font-light"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-4">
                  {[
                    { icon: ExternalLink, label: t("View Demo", "Ver Demo") },
                    { icon: Github, label: t("Source Code", "Código Fuente") },
                  ].map(({ icon: Icon, label }) => (
                    <button
                      key={label}
                      onClick={() => handleProjectClick(project.title)}
                      onMouseEnter={() => setIsHovering(true)}
                      onMouseLeave={() => setIsHovering(false)}
                      className="group/btn flex items-center space-x-2 px-4 py-2 bg-white/50 border border-white/60 rounded-full hover:bg-white/80 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Icon
                        size={16}
                        className="text-gray-700 group-hover/btn:text-rose-600 transition-colors duration-300"
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover/btn:text-rose-600 transition-colors duration-300">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContact = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-gray-800 mb-4">
            {t("Let's Connect", "Conectemos")}
          </h2>
          <div className="h-1 w-20 bg-gradient-to-r from-rose-400 to-purple-400 rounded-full mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-light">
            {t(
              "Open to new opportunities and collaborations",
              "Abierta a nuevas oportunidades y colaboraciones"
            )}
          </p>
        </div>

        <div className="relative bg-white/40 backdrop-blur-sm border border-white/50 rounded-3xl p-10">
          <div className="text-center mb-10">
            <p className="text-lg text-gray-700 font-light leading-relaxed">
              {t(
                "Let's connect! I enjoy meeting new people and discussing ideas. Whether it's about work, projects, or just saying hello, I'd love to hear from you.",
                "¡Conectemos! Me gusta conocer gente nueva y discutir ideas. Ya sea sobre trabajo, proyectos, o simplemente saludar, me encantaría saber de ti."
              )}
            </p>
          </div>

          <div className="space-y-6 mb-10">
            {[
              {
                label: t("Name", "Nombre"),
                placeholder: t("Your name", "Tu nombre"),
                type: "text",
              },
              {
                label: t("Email", "Correo"),
                placeholder: t(
                  "your.email@example.com",
                  "tu.email@ejemplo.com"
                ),
                type: "email",
              },
              {
                label: t("Message", "Mensaje"),
                placeholder: t(
                  "Share your thoughts or questions...",
                  "Comparte tus pensamientos o preguntas..."
                ),
                type: "textarea",
              },
            ].map((field, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    rows="4"
                    placeholder={field.placeholder}
                    onMouseEnter={() => {
                      setIsHovering(false);
                      setIsHoveringInput(true);
                    }}
                    onMouseLeave={() => {
                      setIsHoveringInput(false);
                    }}
                    className="w-full px-4 py-4 bg-white/50 border border-white/60 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-rose-300 focus:bg-white/70 transition-all duration-300 font-light"
                  />
                ) : (
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    onMouseEnter={() => {
                      setIsHovering(false);
                      setIsHoveringInput(true);
                    }}
                    onMouseLeave={() => {
                      setIsHoveringInput(false);
                    }}
                    className="w-full px-4 py-4 bg-white/50 border border-white/60 rounded-2xl text-gray-800 placeholder-gray-500 focus:outline-none focus:border-rose-300 focus:bg-white/70 transition-all duration-300 font-light"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleContactSubmit}
            disabled={isSubmitting}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`group relative w-full py-4 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 hover:shadow-lg hover:shadow-rose-200/50"
            }`}
          >
            <span className="text-white font-medium text-lg">
              {isSubmitting
                ? t("Sending...", "Enviando...")
                : t("Send Message", "Enviar Mensaje")}
            </span>
          </button>

          <div className="mt-10 pt-8 border-t border-rose-200/50 text-center">
            <p className="text-gray-600 mb-6 font-light">
              {t("Prefer direct contact?", "¿Prefieres contacto directo?")}
            </p>
            <div className="flex justify-center space-x-8">
              <a
                href="mailto:michellemedflo@gmail.com"
                onClick={() => handleSocialClick("email")}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="text-rose-600 hover:text-rose-700 transition-colors duration-300 font-medium"
              >
                michellemedflo@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (currentSection) {
      case "home":
        return renderHome();
      case "resume":
        return renderResume();
      case "projects":
        return renderProjects();
      case "contact":
        return renderContact();
      default:
        return renderHome();
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
      style={{ cursor: "none" }}
    >
      {/* Enhanced Custom Cursor */}
      <div
        className="fixed pointer-events-none z-50"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          width: "16px",
          height: "16px",
          background: isHovering
            ? "linear-gradient(45deg, #ec4899, #f472b6, #a855f7)"
            : "linear-gradient(45deg, #f472b6, #ec4899)",
          borderRadius: "50%",
          transform: isHovering ? "scale(1.8)" : "scale(1)",
          transition: "transform 150ms ease-out, background 150ms ease-out",
          boxShadow: isHovering
            ? "0 0 20px rgba(236, 72, 153, 0.8), 0 0 40px rgba(244, 114, 182, 0.6)"
            : "0 0 15px rgba(244, 114, 182, 0.8)",
          mixBlendMode: "difference",
        }}
      />

      <div
        className="fixed pointer-events-none z-50 border-2 rounded-full"
        style={{
          left: mousePosition.x - (isHoveringInput ? 15 : isHovering ? 30 : 20),
          top: mousePosition.y - (isHoveringInput ? 15 : isHovering ? 30 : 20),
          width: isHoveringInput ? "30px" : isHovering ? "60px" : "40px",
          height: isHoveringInput ? "30px" : isHovering ? "60px" : "40px",
          borderColor: isHoveringInput
            ? "#a855f7"
            : isHovering
            ? "#ec4899"
            : "#f472b6",
          opacity: isHovering ? 1 : isHoveringInput ? 0.8 : 0.9,
          transform: isHovering
            ? "rotate(180deg)"
            : isHoveringInput
            ? "scale(0.8)"
            : "scale(1)",
          transition: "all 200ms ease-out",
          boxShadow: isHovering
            ? "0 0 25px rgba(236, 72, 153, 0.6)"
            : isHoveringInput
            ? "0 0 15px rgba(168, 85, 247, 0.4)"
            : "0 0 20px rgba(244, 114, 182, 0.6)",
          borderStyle: isHovering ? "dashed" : "solid",
          borderWidth: isHovering ? "3px" : "2px",
        }}
      />

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="text-2xl font-light text-gray-800 tracking-[0.2em]">
                  MM
                </div>
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-rose-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
              <div className="h-8 w-px bg-gradient-to-b from-rose-300 to-purple-300"></div>
              <span className="text-lg font-light text-gray-700 tracking-wide">
                Portfolio
              </span>
            </div>

            <div className="hidden md:flex space-x-1 items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    className={`group relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      currentSection === item.id
                        ? "bg-white/60 text-rose-600 shadow-md"
                        : "text-gray-600 hover:text-gray-800 hover:bg-white/30"
                    }`}
                  >
                    <div className="flex items-center space-x-2 group-hover:animate-bounce">
                      <Icon
                        size={16}
                        className="group-hover:-translate-y-1 transition-transform duration-300"
                      />
                      <span className="group-hover:-translate-y-1 transition-transform duration-300">
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              })}

              <button
                onClick={handleLanguageToggle}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="ml-4 px-4 py-2 bg-rose-500/20 border border-rose-300/50 rounded-full text-sm font-medium text-gray-700 hover:bg-rose-500/30 hover:text-rose-700 transition-all duration-300 flex items-center space-x-2"
              >
                <Globe size={16} />
                <span>{language === "en" ? "ES" : "EN"}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">{renderSection()}</main>

      {/* Beautiful Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div
            className={`relative bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl transform transition-all duration-300 ${
              notificationType === "success"
                ? "shadow-rose-200/50"
                : "shadow-red-200/50"
            }`}
          >
            <div className="text-center">
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center ${
                  notificationType === "success"
                    ? "bg-gradient-to-br from-rose-100 to-purple-100"
                    : "bg-gradient-to-br from-red-100 to-orange-100"
                }`}
              >
                {notificationType === "success" ? (
                  <CheckCircle className="w-8 h-8 text-rose-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>

              <p className="text-lg text-gray-800 font-light leading-relaxed mb-8">
                {notificationMessage}
              </p>

              <button
                onClick={() => setShowNotification(false)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="px-8 py-3 bg-gradient-to-r from-rose-400 to-purple-400 text-white rounded-2xl hover:from-rose-500 hover:to-purple-500 transition-all duration-300 font-medium hover:shadow-lg hover:shadow-rose-200/50 hover:-translate-y-1"
              >
                {t("Close", "Cerrar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
