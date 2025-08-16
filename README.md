# Tour Planner

Aplicación web para crear recorridos turísticos personalizados por cualquier ciudad del mundo usando IA.

## Características

- **Stepper de 5 pasos** para capturar preferencias del usuario
- **Integración con IA Agent** en Railway para generar rutas personalizadas
- **Interfaz responsive** con React y Next.js
- **Estado global** con Redux Toolkit
- **API Routes** de Next.js como proxy

## Estructura del Proyecto

```
trp-f1/
├── components/
│   ├── steps/
│   │   ├── StepA.jsx    # Datos básicos
│   │   ├── StepB.jsx    # Preferencias
│   │   ├── StepC.jsx    # Contexto
│   │   ├── StepD.jsx    # Intereses
│   │   └── StepE.jsx    # Ubicación
│   ├── TourStepper.jsx  # Componente principal del stepper
│   ├── MapView.jsx      # Vista del mapa (placeholder)
│   └── ItineraryList.jsx # Lista del itinerario
├── pages/
│   ├── api/
│   │   └── tour-agent.js # API que conecta con Railway
│   ├── _app.js          # Configuración Redux
│   ├── index.js         # Página de inicio
│   └── tour-planner.jsx # Página principal
├── store/
│   ├── index.js         # Store de Redux
│   └── tourSlice.js     # Slice principal
├── hooks/
│   └── useTourData.js   # Hook personalizado
└── styles/
    └── globals.css      # Estilos globales
```

## Instalación y Uso

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en desarrollo:
```bash
npm run dev
```

3. Abrir [http://localhost:3000](http://localhost:3000)

## Flujo de la Aplicación

1. **Paso A**: Usuario ingresa datos básicos (tipo viajero, presupuesto, horarios)
2. **Paso B**: Selecciona preferencias (motivos, estilo de viaje)
3. **Paso C**: Define contexto (restricciones, transporte)
4. **Paso D**: Especifica intereses detallados
5. **Paso E**: Selecciona ubicación de inicio
6. **Generación**: IA Agent crea ruta personalizada
7. **Resultado**: Muestra mapa e itinerario detallado

## API Integration

La aplicación se conecta con un agente IA en Railway:
- **Endpoint**: `https://primary-production-e9dc.up.railway.app/webhook/postman-webhook`
- **Formato**: JSON estructurado con datos del usuario
- **Respuesta**: Itinerario con puntos, tiempos y descripciones

## Próximas Mejoras

- [ ] Integración real de mapas (Google Maps/Leaflet)
- [ ] Sistema de feedback post-tour
- [ ] Guardado de tours favoritos
- [ ] Compartir rutas en redes sociales
- [ ] Integración con APIs de clima y eventos

## Tecnologías

- Next.js 14
- React 18
- Redux Toolkit
- CSS3 (Responsive)
- Railway (IA Agent)