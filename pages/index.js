import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente al tour planner
    router.push('/tour-planner')
  }, [router])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>🏛️ Santiago Tour Planner</h1>
      <p>Redirigiendo...</p>
    </div>
  )
}