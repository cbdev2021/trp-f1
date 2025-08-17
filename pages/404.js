import { useRouter } from 'next/router'

export default function Custom404() {
  const router = useRouter()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ marginBottom: '2rem' }}>Página no encontrada</h2>
      <button 
        onClick={() => router.push('/')}
        style={{
          padding: '15px 30px',
          fontSize: '1.1rem',
          backgroundColor: 'rgba(255,255,255,0.2)',
          color: 'white',
          border: '2px solid white',
          borderRadius: '50px',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)'
        }}
      >
        🏠 Volver al inicio
      </button>
    </div>
  )
}