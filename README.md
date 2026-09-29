# SVG to Android Vector Converter

Herramienta web moderna, rápida y segura para convertir archivos SVG a **Android Vector Drawable (`.xml`)** directamente en el navegador, creada con **Astro**, **TypeScript puro** y **Tailwind CSS**.

---

## 🚀 Características Principales

- **Sin Frameworks Pesados de UI:** Implementado con Astro y TypeScript nativo (cero React, rendimiento instantáneo).
- **Procesamiento 100% Client-Side:** Tus archivos nunca salen de tu ordenador; funciona sin conexión y respeta la privacidad.
- **Seguridad en 4 Capas (Anti-XSS & Anti-Malware):**
  1. Filtro estricto de entrada (`accept=".svg,image/svg+xml"`).
  2. Validación de extensión (`.svg`) y tipo MIME.
  3. Parseo estricto XML con `DOMParser` (detección de `<parsererror>`).
  4. Sanitización profunda que elimina nodos `<script>`, `<iframe>`, eventos `onload`/`onclick` y protocolos `javascript:`.
- **Flujo de Trabajo Flexible:**
  - Carga secuencial ordenada de 1 en 1 con barra de progreso.
  - Vista previa gráfica del SVG.
  - Visor de código XML plegable.
  - **Copiar Código XML:** Botón de 1 clic al portapapeles con confirmación visual.
  - **Descarga Individual:** Exporta archivos con formato de recurso Android (`ic_nombre.xml`).
  - **Borrado en 1 Clic:** Botón directo para descartar archivos que solo querías copiar.
  - **Exportación Masiva (.ZIP):** Empaqueta todos los XML convertidos en un archivo `.zip`.

---

## 🏛️ Arquitectura Limpia (Clean Architecture) & Principios SOLID

El proyecto sigue una separación rigurosa por capas:

```text
src/
├── domain/                  # Entidades de negocio, errores y puertos (interfaces)
│   ├── entities/            # SvgFile, VectorDrawable
│   ├── errors/              # SvgValidationError
│   └── ports/               # ISvgValidator, ISvgConverter, IZipExporter, IClipboardService
├── application/             # Casos de uso
│   ├── dtos/                # ProcessedItemDto
│   └── use-cases/           # ProcessSingleSvgFile, ExportAllAsZip, CopyXmlToClipboard...
├── infrastructure/          # Adaptadores y servicios concretos
│   ├── security/            # StrictSvgValidator, SvgSanitizer
│   ├── converter/           # SvgToAndroidConverter, ColorUtils
│   │   └── node-transformers/ # PathTransformer, BasicShapesTransformer, GroupTransformer
│   └── services/            # BrowserZipExporter, BrowserClipboardService, BrowserDownloadService
└── presentation/            # Patrón MVP (Model-View-Presenter)
    ├── components/          # Header.astro, Dropzone.astro, GlobalActions.astro, Toast.astro
    ├── presenters/          # ConverterAppPresenter, AppBootstrap
    ├── state/               # AppStateStore (Pub-Sub Reactivo)
    └── styles/              # global.css (Tailwind CSS)
```

### Principios SOLID Aplicados:
- **S (Single Responsibility):** Cada componente, transformador y caso de uso realiza exclusivamente una tarea delimitada.
- **O (Open/Closed):** Nuevos elementos SVG pueden soportarse agregando nuevos `INodeTransformer` sin alterar el conversor central.
- **L (Liskov Substitution):** Cualquier implementación de puerto (`ISvgValidator`, `ISvgConverter`) es intercambiable sin alterar los casos de uso.
- **I (Interface Segregation):** Puertos pequeños y específicos en lugar de interfaces monolíticas.
- **D (Dependency Inversion):** Los casos de uso dependen exclusivamente de interfaces del dominio (`domain/ports`), no de implementaciones del navegador ni del DOM.

---

## 🛠️ Comandos de Desarrollo (usando pnpm)

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo local
pnpm dev

# Ejecutar suite de pruebas unitarias
pnpm test

# Compilar para producción
pnpm build

# Previsualizar compilación de producción
pnpm preview
```
