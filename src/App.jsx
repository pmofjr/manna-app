import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthScreen from './components/AuthScreen'
import NoAccessScreen from './components/NoAccessScreen'
import HomeScreen from './components/HomeScreen'
import FlowScreen from './components/FlowScreen'
import LoadingScreen from './components/LoadingScreen'
import DevocionalScreen from './components/DevocionalScreen'
import HistoryScreen from './components/HistoryScreen'

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''
}

export default function App() {
  const [screen, setScreen] = useState('auth')
  const [user, setUser] = useState(null)
  const [hasAccess, setHasAccess] = useState(false)
  const [trilha, setTrilha] = useState(null)
  const [currentDevo, setCurrentDevo] = useState(null)
  const [history, setHistory] = useState([])
  const [loadingMessage, setLoadingMessage] = useState('')

  // Restore session
  useEffect(() => {
    const saved = sessionStorage.getItem('manna_user')
    const access = sessionStorage.getItem('manna_access')
    if (saved) {
      const u = JSON.parse(saved)
      setUser(u)
      setHasAccess(access === 'true')
      if (access === 'true') {
        setScreen('home')
        loadHistory(u.email)
      } else {
        setScreen('no-access')
      }
    }
  }, [])

  async function loadHistory(email) {
    try {
      const { data } = await supabase
        .from('devotionals')
        .select('*')
        .eq('user_email', email)
        .order('created_at', { ascending: false })
        .limit(50)
      if (data) {
        setHistory(data.map(d => ({
          id: d.id,
          date: d.created_at,
          emotion: d.emotion,
          cause: d.cause,
          firstName: email.split('@')[0], // fallback
          abertura: d.abertura,
          versiculo: d.versiculo,
          referencia: d.referencia,
          reflexao: d.reflexao,
          oracao: d.oracao
        })))
      }
    } catch (e) {
      console.error('History load error:', e)
    }
  }

  function handleLogin(userData, access) {
    setUser(userData)
    setHasAccess(access)
    sessionStorage.setItem('manna_user', JSON.stringify(userData))
    sessionStorage.setItem('manna_access', String(access))
    if (access) {
      setScreen('home')
      loadHistory(userData.email)
    } else {
      setScreen('no-access')
    }
  }

  function handleLogout() {
    setUser(null)
    setHasAccess(false)
    setHistory([])
    sessionStorage.removeItem('manna_user')
    sessionStorage.removeItem('manna_access')
    setScreen('auth')
  }

  function handleTrilha(t) {
    setTrilha(t)
    setScreen('flow')
  }

  async function handleGenerate({ emotion, cause, blessName }) {
    const firstName = trilha === 'outro'
      ? capitalize((blessName || '').split(' ')[0])
      : capitalize(user.name.split(' ')[0])

    const message = trilha === 'outro'
      ? `Estamos preparando uma palavra personalizada para o momento vivido por ${firstName}…`
      : 'Estamos preparando uma palavra personalizada para o seu momento…'

    setLoadingMessage(message)
    setScreen('loading')

    try {
      const res = await fetch('/api/devotional', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          emotion,
          cause,
          trilha,
          blessName: blessName || null
        })
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'API error')
      }

      const data = await res.json()
      const devo = {
        ...data,
        firstName,
        emotion,
        cause,
        date: new Date().toISOString()
      }

      setCurrentDevo(devo)

      // Save to Supabase if trilha 'eu'
      if (trilha === 'eu') {
        const newEntry = {
          id: Date.now(),
          date: new Date().toISOString(),
          emotion,
          cause,
          firstName,
          ...data
        }
        setHistory(prev => [newEntry, ...prev])

        supabase.from('devotionals').insert({
          user_email: user.email,
          emotion,
          cause,
          abertura: data.abertura,
          versiculo: data.versiculo,
          referencia: data.referencia,
          reflexao: data.reflexao,
          oracao: data.oracao,
          content: JSON.stringify(data)
        }).then(({ error }) => {
          if (error) console.error('Save error:', error)
        })
      }

      setScreen('devotional')
    } catch (e) {
      console.error('Generate error:', e)
      alert('Erro ao gerar devocional. Tente novamente.')
      setScreen('home')
    }
  }

  function handleOpenHistory(entry) {
    setCurrentDevo(entry)
    setScreen('devotional')
  }

  // Render
  if (screen === 'auth') return <AuthScreen onLogin={handleLogin} />
  if (screen === 'no-access') return <NoAccessScreen onLogout={handleLogout} />
  if (screen === 'loading') return <LoadingScreen message={loadingMessage} />

  if (screen === 'home') return (
    <HomeScreen
      user={user}
      onTrilha={handleTrilha}
      onHistory={() => setScreen('history')}
      onLogout={handleLogout}
    />
  )

  if (screen === 'flow') return (
    <FlowScreen
      trilha={trilha}
      user={user}
      onGenerate={handleGenerate}
      onBack={() => setScreen('home')}
      onHistory={() => setScreen('history')}
      onLogout={handleLogout}
    />
  )

  if (screen === 'devotional') return (
    <DevocionalScreen
      devo={currentDevo}
      trilha={trilha}
      onNew={() => setScreen('home')}
      onHistory={() => setScreen('history')}
      onLogout={handleLogout}
    />
  )

  if (screen === 'history') return (
    <HistoryScreen
      history={history}
      onOpen={handleOpenHistory}
      onBack={() => setScreen('home')}
      onLogout={handleLogout}
    />
  )
}
