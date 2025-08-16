// JSON de entrada (datos del usuario)
export interface TripInput {
  usuario: {
    demografia: 'solo' | 'pareja' | 'familia' | 'adulto_mayor' | 'grupo_amigos'
    presupuesto: 'economico' | 'medio' | 'alto' | 'elite'
    movil_reducida: boolean
  }
  viaje: {
    inicio: string // ISO datetime
    fin: string // ISO datetime
    ubicacion_inicio: {
      tipo: 'hotel' | 'casa' | 'aeropuerto' | 'estacion'
      direccion: string
      coordenadas: {
        lat: number
        lon: number
      }
    }
    transporte: 'caminata' | 'bicicleta' | 'transporte_publico' | 'vehiculo' | 'taxi' | 'scooter' | 'combinado'
    temporada: 'verano' | 'invierno' | 'primavera' | 'otono'
    clima: {
      probabilidad_lluvia: number
    }
  }
  preferencias: {
    motivos: string[]
    estilo: 'relajado' | 'activo' | 'intenso'
    intereses: string[]
    eventos: boolean
  }
}

// JSON de salida (ruta generada)
export interface TripOutput {
  ruta: Array<{
    orden: number
    nombre: string
    tipo: string
    duracion_min: number
    coordenadas: {
      lat: number
      lon: number
    }
  }>
  tiempo_total_min: number
  transporte_total_min: number
  sugerencias_alternativas: Array<{
    nombre: string
    tipo: string
  }>
  recomendaciones_clima: string
}