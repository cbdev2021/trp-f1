import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { detectCity } from '../store/tourSlice'

export default function Home() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { detectedCity, cityLoading } = useSelector(state => state.tour)
  const [showMessage, setShowMessage] = useState(false)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    dispatch(detectCity())
  }, [dispatch])

  useEffect(() => {
    if (detectedCity && !cityLoading) {
      setTimeout(() => setShowMessage(true), 1000)
      setTimeout(() => setShowButton(true), 3000)
    }
  }, [detectedCity, cityLoading])

  const handleContinue = () => {
    router.push('/tour-planner')
  }

  const getCityMessage = () => {
    if (cityLoading) return 'Detectando tu ubicación...'
    if (!detectedCity) return 'Preparando tu experiencia...'
    
    const { city, country } = detectedCity
    return `¡Bienvenido! Crea tu tour personalizado en ${city}, ${country} o en cualquier ciudad del mundo. Descubre experiencias únicas, lugares emblemáticos y joyas ocultas con itinerarios diseñados especialmente para ti.`
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      padding: '20px',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem' }}>🌍 Tour Planner</h1>
      <div style={{
        maxWidth: '600px',
        fontSize: '1.2rem',
        lineHeight: '1.6',
        marginBottom: '2rem',
        opacity: showMessage ? 1 : 0,
        transition: 'opacity 1.5s ease-in-out'
      }}>
        {getCityMessage()}
      </div>
      {showButton && (
        <button 
          onClick={handleContinue}
          style={{
            padding: '15px 30px',
            fontSize: '1.1rem',
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '2px solid white',
            borderRadius: '50px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            backdropFilter: 'blur(10px)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'
            e.target.style.transform = 'translateY(-2px)'
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'
            e.target.style.transform = 'translateY(0)'
          }}
        >
          Haz click para continuar →
        </button>
      )}
    </div>
  )
}