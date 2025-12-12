import type { TestimonioAprobado } from "@/interfaces";

export const fallbackTestimonials: TestimonioAprobado[] = [
  {
    id: 1,
    usuario_registrado: "María González",
    usuario_anonimo_username: undefined,
    comentario: "Esta plataforma transformó completamente la manera en que recolectamos feedback de nuestros clientes. Ahora tenemos un proceso automatizado y profesional.",
    ranking: "5.0",
    categoria_nombre: "Empresas",
    categoria: 1,
    api_key: "",
    fecha_comentario: new Date().toISOString(),
    organizacion_nombre: "Tech Solutions",
    archivos_urls: [
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400"
    ],
    estado: 'P'
  },
  {
    id: 2,
    usuario_registrado: "Carlos Ruiz",
    usuario_anonimo_username: undefined,
    comentario: "Los testimonios reales han aumentado nuestra tasa de conversión en un 40%. Es una herramienta indispensable para cualquier negocio serio.",
    ranking: "5.0",
    categoria_nombre: "Marketing",
    categoria: 2,
    api_key: "",
    fecha_comentario: new Date().toISOString(),
    organizacion_nombre: "Digital Marketing Pro",
    archivos_urls: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400"
    ],
    estado: 'P'
  },
  {
    id: 3,
    usuario_registrado: "Ana Martínez",
    usuario_anonimo_username: undefined,
    comentario: "Implementación súper sencilla y resultados inmediatos. Nuestros clientes ahora pueden dejar testimonios en minutos y nosotros podemos gestionarlos fácilmente.",
    ranking: "5.0",
    categoria_nombre: "Startups",
    categoria: 3,
    api_key: "",
    fecha_comentario: new Date().toISOString(),
    organizacion_nombre: "Innovation Hub",
    archivos_urls: [],
    estado: 'P'
  },
  {
    id: 4,
    usuario_registrado: "Roberto Silva",
    usuario_anonimo_username: undefined,
    comentario: "La mejor inversión que hemos hecho este año. La credibilidad que nos dan los testimonios verificados es invaluable.",
    ranking: "5.0",
    categoria_nombre: "E-commerce",
    categoria: 4,
    api_key: "",
    fecha_comentario: new Date().toISOString(),
    organizacion_nombre: "ShopOnline",
    archivos_urls: [],
    estado: 'P'
  },
  {
    id: 5,
    usuario_registrado: "Laura Fernández",
    usuario_anonimo_username: undefined,
    comentario: "Interface intuitiva y funcionalidades potentes. Exactamente lo que necesitábamos para fortalecer nuestra presencia online.",
    ranking: "5.0",
    categoria_nombre: "SaaS",
    categoria: 5,
    api_key: "",
    fecha_comentario: new Date().toISOString(),
    organizacion_nombre: "CloudServe",
    archivos_urls: [],
    estado: 'P'
  },
];
