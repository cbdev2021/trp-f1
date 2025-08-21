// Modificadores críticos para optimizar el prompt de IA
export const criticalModifiers = {
  // 1. Presupuesto - Define tipo de lugares
  presupuesto: {
    economico: "opciones gratuitas, transporte público, comida local",
    medio: "mix gratuito-pago, restaurantes locales, atracciones principales", 
    alto: "experiencias premium, restaurantes reconocidos, tours guiados",
    premium: "lugares exclusivos, experiencias VIP, servicios de lujo"
  },

  // 2. Demografía - Ajusta enfoque completo
  demografia: {
    solo: "flexibilidad horaria, espacios seguros, actividades individuales",
    pareja: "experiencias románticas, cenas íntimas, vistas panorámicas",
    familia: "actividades para niños, espacios seguros, horarios flexibles",
    adulto_mayor: "ritmo pausado, acceso fácil, descansos frecuentes",
    grupo_amigos: "actividades grupales, vida nocturna, experiencias compartidas"
  },

  // 3. Tipo de experiencia - Determina actividades principales
  tipoExperiencia: {
    cultural: "museos principales, sitios históricos, arte local",
    gastronomica: "restaurantes típicos, mercados locales, tours culinarios",
    aventura: "actividades al aire libre, deportes, naturaleza",
    relajacion: "spas, parques tranquilos, cafés, ritmo pausado",
    nocturna: "bares locales, vida nocturna, shows nocturnos",
    naturaleza: "parques naturales, jardines, miradores, paisajes"
  },

  // 4. Intensidad - Controla ritmo y cantidad
  intensidad: {
    relajado: "ritmo pausado, descansos frecuentes, menos traslados",
    moderado: "equilibrio actividad-descanso, ritmo cómodo",
    activo: "múltiples actividades, ritmo dinámico, aprovechamiento máximo",
    intenso: "máximo aprovechamiento, múltiples puntos, eficiencia total"
  },

  // 5. Restricciones - Filtros obligatorios
  restricciones: {
    movilidad_reducida: "acceso para sillas de ruedas, ascensores, rampas",
    vegetariano: "opciones vegetarianas, restaurantes plant-based",
    sin_alcohol: "actividades sin alcohol, espacios familiares",
    presupuesto_limitado: "actividades gratuitas, opciones económicas"
  }
}

// Generar modificadores para el prompt
export const generateCriticalPrompt = (userPreferences) => {
  const modifiers = []
  
  // Solo procesar campos críticos
  const criticalFields = ['presupuesto', 'demografia', 'tipoExperiencia', 'intensidad', 'restricciones']
  
  criticalFields.forEach(field => {
    const value = userPreferences[field]
    
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (criticalModifiers[field]?.[item]) {
          modifiers.push(criticalModifiers[field][item])
        }
      })
    } else if (value && criticalModifiers[field]?.[value]) {
      modifiers.push(criticalModifiers[field][value])
    }
  })
  
  return modifiers.join(', ')
}