import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { NavigationProvider } from '@/context/NavigationContext'
import { Layout } from '@/components/Layout'
import Home from '@/pages/Home'
import Scan from '@/pages/Scan'
import Survey from '@/pages/Survey'
import PlanUpload from '@/pages/PlanUpload'
import MyMap from '@/pages/MyMap'
import MyAnchors from '@/pages/MyAnchors'
import Anchors from '@/pages/Anchors'
import Auth from '@/pages/Auth'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NavigationProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/scan" element={<Scan />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/plan" element={<PlanUpload />} />
              <Route path="/my-map" element={<MyMap />} />
              <Route path="/my-anchors" element={<MyAnchors />} />
              <Route path="/anchors" element={<Anchors />} />
              <Route path="/auth" element={<Auth />} />
            </Route>
          </Routes>
        </NavigationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
