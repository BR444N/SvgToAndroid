<h1 align="center">🚀 SVG to Android Vector</h1>

<p align="center">
  <img src="docs/assets/preview.png" alt="SVG to Android Vector Preview" width="100%" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Astro-ffffff.svg?style=for-the-badge&logo=astro&logoColor=black" alt="ASTRO" />
  <img src="https://img.shields.io/badge/TypeScript-ffffff.svg?style=for-the-badge&logo=typescript&logoColor=black" alt="TYPESCRIPT" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-ffffff.svg?style=for-the-badge&logo=tailwindcss&logoColor=black" alt="TAILWIND CSS" />
  <img src="https://img.shields.io/badge/Android_Studio-ffffff.svg?style=for-the-badge&logo=android-studio&logoColor=black" alt="ANDROID STUDIO" />
  <img src="https://img.shields.io/badge/Jetpack_Compose-ffffff.svg?style=for-the-badge&logo=jetpack-compose&logoColor=black" alt="JETPACK COMPOSE" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/License-MIT-ffffff.svg?style=for-the-badge&logo=open-source-initiative&logoColor=black" alt="LICENSE" />
  <img src="https://img.shields.io/badge/Package_Manager-pnpm-ffffff.svg?style=for-the-badge&logo=pnpm&logoColor=black" alt="PNPM" />
  <img src="https://img.shields.io/badge/Architecture-Clean_SOLID-ffffff.svg?style=for-the-badge&logo=buffer&logoColor=black" alt="CLEAN ARCHITECTURE" />
</p>

---

## 📌 Descripción

**SVG to Android Vector** es una herramienta web moderna, ultrarrápida y minimalista construida con **Astro** y **TypeScript puro**, diseñada para convertir archivos SVG a **Android Vector Drawable (`.xml`)** directamente en el navegador.

Optimizado para desarrolladores de Android nativo (XML tradicional) y **Jetpack Compose**, genera código limpio, sin comentarios innecesarios y con la cabecera estándar `<?xml version="1.0" encoding="utf-8"?>`, listo para copiar y pegar en `res/drawable/`.

---

## ✨ Características Principales

- **Cero Frameworks Pesados de UI:** Implementado con Astro y TypeScript nativo (sin React, carga instantánea y bundle ultra reducido).
- **Procesamiento 100% Client-Side:** Tus archivos gráficos nunca se suben a ningún servidor externo. Máxima privacidad, seguridad y funcionamiento offline.
- **Seguridad en 4 Capas (Detrás de escena):**
  - Filtro estricto a nivel de navegador (`accept=".svg,image/svg+xml"`).
  - Verificación de extensión `.svg` y tipo MIME.
  - Validación de XML bien formado mediante `DOMParser`.
  - Sanitización profunda contra ataques XSS/XXE (eliminación automática de `<script>`, `<iframe>`, eventos `onload`/`onclick` y URLs con protocolo `javascript:`).
- **Previsualización Interactiva y Zoom Detallado:** Toca cualquier icono para abrir un modal con controles de zoom (`+`, `-`, rueda del ratón y restablecimiento al 100%).
- **Copiado en 1 Clic:** Copia el código XML formateado y listo para Android al portapapeles.
- **Descarga Individual y Masiva en ZIP:** Descarga archivos independientes con nomenclatura válida para Android (`ic_nombre.xml`) o empaqueta todos los vectores en un archivo `.zip`.
- **Botón de Borrado Rápido:** Descarte instantáneo para flujos de trabajo rápidos de "copiar y listo".
- **Diseño Espacial Minimalista:** Fondo animado con estrellas de 2px y destellos lentos a 60fps, paleta en negro puro `#000000` con bordes redondeados y barra de navegación flotante con auto-ocultamiento al desplazarse.

---

## 🏛️ Arquitectura Limpia (Clean Architecture) & SOLID

El proyecto sigue una separación estricta de responsabilidades:

```text
src/
├── domain/                      # Entidades del núcleo, errores y contratos
│   ├── entities/                # SvgFile, VectorDrawable
│   ├── errors/                  # SvgValidationError
│   └── ports/                   # Interfaces (ISvgValidator, ISvgConverter, IZipExporter...)
│
├── application/                 # Casos de uso (Orquestación del negocio)
│   ├── dtos/                    # ProcessedItemDto
│   └── use-cases/               # ProcessSingleSvgFile, ExportAllAsZip, CopyXmlToClipboard...
│
├── infrastructure/              # Implementaciones concretas y adaptadores
│   ├── security/                # StrictSvgValidator, SvgSanitizer
│   ├── converter/               # SvgToAndroidConverter, ColorUtils
│   │   └── node-transformers/   # PathTransformer, BasicShapesTransformer, GroupTransformer
│   └── services/                # BrowserZipExporter, BrowserClipboardService, BrowserDownloadService
│
└── presentation/                # Capa de Presentación (Patrón MVP)
    ├── components/              # Header, Dropzone, GlobalActions, PreviewModal, Toast, SpaceBackground
    ├── presenters/              # ConverterAppPresenter, AppBootstrap
    ├── state/                   # AppStateStore (Pub-Sub Reactivo)
    └── styles/                  # global.css (Tailwind CSS)
```

### Principios SOLID Aplicados:
- **S (Single Responsibility):** Cada componente, transformador y caso de uso realiza exclusivamente una tarea específica.
- **O (Open/Closed):** Nuevas etiquetas SVG se incorporan implementando la interfaz `INodeTransformer` sin modificar el motor central.
- **L (Liskov Substitution):** Todas las implementaciones de puertos (`ISvgValidator`, `ISvgConverter`) son intercambiables.
- **I (Interface Segregation):** Interfaces pequeñas y específicas para cada capacidad del sistema.
- **D (Dependency Inversion):** Los casos de uso dependen de abstracciones del dominio, no de implementaciones del navegador ni del DOM.

---

## 🛠️ Instalación y Uso Local

Este proyecto utiliza **pnpm** como gestor de paquetes.

```bash
# 1. Clonar el repositorio
git clone https://github.com/BR444N/SvgToAndroid.git
cd SvgToAndroid

# 2. Instalar dependencias con pnpm
pnpm install

# 3. Iniciar servidor de desarrollo local
pnpm dev

# 4. Ejecutar pruebas unitarias
pnpm test

# 5. Compilar para producción
pnpm build
```

---

## 🧪 Pruebas Unitarias

El proyecto incluye tests automáticos para asegurar la integridad de:
- Sanitización de nombres válidos para recursos de Android (`ic_nombre.xml`).
- Normalización de colores CSS/SVG a formato hexadecimal Android (`#AARRGGBB`).
- Transformación geométrica de formas básicas (`<rect>`, `<circle>`, `<polygon>`, etc.) a datos de trazado `<path>`.

Para ejecutarlas:
```bash
pnpm test
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.
