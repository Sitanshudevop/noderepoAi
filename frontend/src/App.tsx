import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoadRepository from './pages/LoadRepository'
import GraphExplorer from './pages/GraphExplorer'
import FileListView from './pages/FileListView'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/load" element={<LoadRepository />} />
        <Route path="/graph" element={<GraphExplorer />} />
        <Route path="/list" element={<FileListView />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  )
}

export default App

// Made with Bob
