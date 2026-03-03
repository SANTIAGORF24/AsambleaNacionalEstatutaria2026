"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { User, Lock, Download, Eye, LogOut, Users, Calendar } from "lucide-react"
import * as XLSX from 'xlsx'

interface Registro {
  id: number
  nombre_completo: string
  numero_despacho: string
  municipio: string
  asistencia_asamblea: string
  envia_poder: string
  persona_poder: string
  asistencia_sabado: string
  acompanantes_sabado: number
  fecha_registro: string
}

export default function LoginPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [loginError, setLoginError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [loadingRegistros, setLoadingRegistros] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    console.log('Checking current user...')
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('Current user:', user, 'Error:', error)
      
      if (user) {
        console.log('User found, setting logged in state')
        setIsLoggedIn(true)
        fetchRegistros()
      } else {
        console.log('No user found')
      }
    } catch (error) {
      console.error('Error checking user:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("")

    console.log('Attempting login with:', { email: loginData.email, password: '***' })

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })

      console.log('Supabase response:', { data, error })

      if (error) {
        console.error('Login error:', error)
        setLoginError(`Error: ${error.message}`)
      } else if (data.user) {
        console.log('Login successful:', data.user)
        setIsLoggedIn(true)
        fetchRegistros()
      } else {
        setLoginError("Error desconocido al iniciar sesión")
      }
    } catch (error) {
      console.error('Catch error:', error)
      setLoginError(`Error de conexión: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRegistros = async () => {
    setLoadingRegistros(true)
    try {
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .order('fecha_registro', { ascending: false })

      if (error) {
        console.error('Error al cargar registros:', error)
      } else {
        setRegistros(data || [])
      }
    } catch (error) {
      console.error('Error de conexión:', error)
    } finally {
      setLoadingRegistros(false)
    }
  }

  const exportToExcel = () => {
    if (registros.length === 0) {
      alert('No hay registros para exportar')
      return
    }

    const dataToExport = registros.map(registro => ({
      'ID': registro.id,
      'Nombre Completo': registro.nombre_completo,
      'Número de Despacho': registro.numero_despacho,
      'Municipio': registro.municipio,
      'Asiste a Asamblea': registro.asistencia_asamblea === 'si' ? 'Sí' : registro.asistencia_asamblea === 'no' ? 'No' : registro.asistencia_asamblea || 'No especificado',
      'Envía Poder': registro.envia_poder === 'si' ? 'Sí' : registro.envia_poder === 'no' ? 'No' : registro.envia_poder || 'N/A',
      'Persona con Poder': registro.persona_poder || 'N/A',
      'Asistencia Sábado': registro.asistencia_sabado === 'si' ? 'Sí' : registro.asistencia_sabado === 'no' ? 'No' : registro.asistencia_sabado || 'No especificado',
      'Acompañantes Sábado': registro.acompanantes_sabado ?? 0,
      'Fecha de Registro': new Date(registro.fecha_registro).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }))

    const ws = XLSX.utils.json_to_sheet(dataToExport)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Registros')
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 8 },   // ID
      { wch: 30 },  // Nombre
      { wch: 15 },  // Despacho
      { wch: 20 },  // Municipio
      { wch: 18 },  // Asiste a Asamblea
      { wch: 14 },  // Envía Poder
      { wch: 25 },  // Persona con Poder
      { wch: 18 },  // Asistencia Sábado
      { wch: 20 },  // Acompañantes Sábado
      { wch: 20 },  // Fecha
    ]
    ws['!cols'] = colWidths

    XLSX.writeFile(wb, `registros_curadores_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setRegistros([])
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#11357b] relative overflow-hidden flex items-center justify-center">
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5" />
          <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5" />
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-white/3" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-4"
        >
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
            <div className="text-center mb-8">
              <Lock className="w-16 h-16 mx-auto mb-4 text-[#11357b]" />
              <h1 className="text-2xl font-bold text-[#11357b]">
                Panel de Administración
              </h1>
              <p className="text-[#11357b]/60 text-sm mt-2">
                Acceso exclusivo para administradores
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Debug info */}
              <div className="text-xs text-gray-500">
                Debug: Email: {loginData.email ? '✓' : '✗'} | Password: {loginData.password ? '✓' : '✗'} | Loading: {isLoading ? 'Yes' : 'No'}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#11357b] mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#11357b]/30" />
                  <input
                    type="email"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#11357b]/20 focus:border-[#11357b] outline-none transition-colors"
                    placeholder="CuradorAdmin@cncu.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#11357b] mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#11357b]/30" />
                  <input
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-[#11357b]/20 focus:border-[#11357b] outline-none transition-colors"
                    placeholder="Curador2025"
                  />
                </div>
              </div>

              {loginError && (
                <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !loginData.email || !loginData.password}
                onClick={(e) => {
                  console.log('Button clicked!', { isLoading, email: loginData.email, password: '***' })
                }}
                className="w-full bg-[#11357b] text-white py-3 rounded-xl font-semibold hover:bg-[#0d2a5a] transition-colors disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Iniciando sesión...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="bg-[#11357b] text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">Panel de Administración</h1>
                <p className="text-white/80 text-sm">Gestión de Registros CNCU</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Registros de Curadores
            </h2>
            <p className="text-gray-600">
              Total de registros: {registros.length}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            Exportar a Excel
          </motion.button>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loadingRegistros ? (
            <div className="flex items-center justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-[#11357b]/30 border-t-[#11357b] rounded-full"
              />
              <span className="ml-3 text-gray-600">Cargando registros...</span>
            </div>
          ) : registros.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No hay registros
              </h3>
              <p className="text-gray-600">
                Aún no se han registrado curadores
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Nombre Completo</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Núm. Despacho</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Municipio</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Asiste a Asamblea</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Envía Poder</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Persona con Poder</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Sábado</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Acompañantes</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-800">Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {registros.map((registro, index) => (
                      <motion.tr
                        key={registro.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-gray-800 font-medium">
                          {registro.id}
                        </td>
                        <td className="py-4 px-6 text-gray-800">
                          {registro.nombre_completo}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {registro.numero_despacho}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {registro.municipio}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            registro.asistencia_asamblea === 'si' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {registro.asistencia_asamblea === 'si' ? 'Sí' : registro.asistencia_asamblea === 'no' ? 'No' : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            registro.envia_poder === 'si' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {registro.envia_poder === 'si' ? 'Sí' : registro.envia_poder === 'no' ? 'No' : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-sm">
                          {registro.persona_poder || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            registro.asistencia_sabado === 'si' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {registro.asistencia_sabado === 'si' ? 'Sí' : registro.asistencia_sabado === 'no' ? 'No' : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 text-center">
                          {registro.asistencia_sabado === 'si' ? (registro.acompanantes_sabado ?? 0) : <span className="text-gray-400">—</span>}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {new Date(registro.fecha_registro).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}