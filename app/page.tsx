"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { CheckCircle2, AlertCircle, User, Hash, MapPin, Calendar, Clock, Sun } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

// Función para formatear nombres (primera letra mayúscula, resto minúscula)
const formatearTexto = (texto: string): string => {
  return texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
}

export default function LandingPage() {
  const [currentView, setCurrentView] = useState<'info' | 'form'>('info')
  const [showContent, setShowContent] = useState(false)
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    numeroDespacho: "",
    municipio: "",
    asistenciaSabado: "",
  })
  const [errors, setErrors] = useState({
    nombreCompleto: "",
    numeroDespacho: "",
    municipio: "",
    asistenciaSabado: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const handleShowForm = () => {
    setCurrentView('form')
  }

  const validateNombreCompleto = (value: string): string => {
    if (!value.trim()) return "El nombre es requerido"
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) {
      return "Solo se permiten letras"
    }
    return ""
  }

  const validateNumeroDespacho = (value: string): string => {
    if (!value.trim()) return "El número es requerido"
    if (!/^\d+$/.test(value)) {
      return "Solo se permiten números"
    }
    return ""
  }

  const validateMunicipio = (value: string): string => {
    if (!value.trim()) return "El municipio es requerido"
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) {
      return "Solo se permiten letras"
    }
    return ""
  }

  const validateAsistenciaSabado = (value: string): string => {
    if (!value) return "Seleccione una opción de asistencia"
    return ""
  }

  const handleChange = (field: keyof typeof formData, value: string) => {
    let formattedValue = value
    
    // Validaciones en tiempo real con notificaciones
    if (field === 'numeroDespacho') {
      // Solo permitir números
      if (!/^\d*$/.test(value)) {
        toast.error("¡Solo se permiten números en este campo!", {
          duration: 2000,
          position: "top-center"
        })
        return // No actualizar si contiene caracteres no válidos
      }
      formattedValue = value
    } else if (field === 'nombreCompleto' || field === 'municipio') {
      // Solo permitir letras y espacios
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) {
        toast.error("¡Solo se permiten letras en este campo!", {
          duration: 2000,
          position: "top-center"
        })
        return // No actualizar si contiene caracteres no válidos
      }
      // Formatear nombres y municipios con la función personalizada
      formattedValue = formatearTexto(value)
    }
    
    setFormData((prev) => ({ ...prev, [field]: formattedValue }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = {
      nombreCompleto: validateNombreCompleto(formData.nombreCompleto),
      numeroDespacho: validateNumeroDespacho(formData.numeroDespacho),
      municipio: validateMunicipio(formData.municipio),
      asistenciaSabado: validateAsistenciaSabado(formData.asistenciaSabado),
    }
    setErrors(newErrors)

    if (Object.values(newErrors).every((error) => !error)) {
      setIsSubmitting(true)
      
      try {
        const supabase = createClient()
        const { error } = await supabase
          .from('registros')
          .insert([
            {
              nombre_completo: formData.nombreCompleto,
              numero_despacho: formData.numeroDespacho,
              municipio: formData.municipio,
              asistencia_sabado: formData.asistenciaSabado,
              fecha_registro: new Date().toISOString()
            }
          ])
          
        if (error) {
          console.error('Error al guardar en Supabase:', error)
          alert('Error al registrar. Por favor intente nuevamente.')
        } else {
          setIsSubmitted(true)
        }
      } catch (error) {
        console.error('Error de conexión:', error)
        alert('Error de conexión. Por favor intente nuevamente.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  return (
    <main className="min-h-screen bg-[#11357b] relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-white/3" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Card Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            {currentView === 'info' ? (
              // Vista de Información de la Asamblea
              <>
                {/* Header with Logo */}
                <div className="bg-white px-8 pt-10 pb-6">
                  <motion.div
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ 
                      scale: showContent ? 1 : 1.1, 
                      opacity: 1 
                    }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="flex justify-center"
                  >
                    <Image
                      src="/logooooo.webp"
                      alt="Colegio Nacional de Curadores Urbanos"
                      width={200}
                      height={150}
                      priority
                      className="w-auto h-auto max-w-[180px]"
                    />
                  </motion.div>
                </div>

                {/* Información de la Asamblea - Vista Principal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="px-8 pb-10"
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#11357b] mb-6">
                      ASAMBLEA NACIONAL ESTATUTARIA
                    </h1>
                    
                    <div className="space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : -20 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="flex items-center justify-center gap-3"
                      >
                        <Calendar className="w-6 h-6 text-[#11357b]" />
                        <div className="text-left">
                          <p className="text-sm text-[#11357b]/60 font-medium">Fecha</p>
                          <p className="text-lg font-bold text-[#11357b]">Viernes 20 de marzo</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : 20 }}
                        transition={{ delay: 0.6, duration: 0.5 }}
                        className="flex items-center justify-center gap-3"
                      >
                        <Clock className="w-6 h-6 text-[#11357b]" />
                        <div className="text-left">
                          <p className="text-sm text-[#11357b]/60 font-medium">Horario</p>
                          <p className="text-lg font-bold text-[#11357b]">8:00 a.m. - 6:00 p.m.</p>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
                        transition={{ delay: 0.7, duration: 0.5 }}
                        className="bg-gradient-to-br from-[#11357b]/5 to-[#11357b]/10 rounded-xl p-6 border border-[#11357b]/20"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <MapPin className="w-6 h-6 text-[#11357b]" />
                          <h3 className="font-bold text-[#11357b] text-lg">Ubicación</h3>
                        </div>
                        
                        <div className="space-y-3 text-[#11357b]">
                          <div>
                            <p className="text-sm font-medium text-[#11357b]/60">Lugar</p>
                            <p className="font-bold text-lg">Santa Marta</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-[#11357b]/60">Sede</p>
                            <p className="font-semibold">Salón "Arrecifes" Torre 2</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-[#11357b]/60">Hotel</p>
                            <p className="font-semibold">Zuana Beach Resort</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-[#11357b]/60">Dirección</p>
                            <p className="font-semibold">Carrera 2 # 6 – 80</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleShowForm}
                        className="w-full bg-[#11357b] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#0d2a5a] transition-all duration-200 shadow-lg hover:shadow-xl"
                      >
                        Registrarme para la Asamblea
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </>
            ) : (
              // Vista del Formulario de Registro
              <>
                {/* Header with Logo - Solo para formulario */}
                <div className="bg-white px-8 pt-8 pb-6">
                  <div className="flex flex-col items-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentView('info')}
                      className="self-start mb-4 flex items-center gap-2 text-[#11357b]/60 hover:text-[#11357b] transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="text-sm font-medium">Volver</span>
                    </motion.button>
                    
                    <Image
                      src="/logooooo.webp"
                      alt="Colegio Nacional de Curadores Urbanos"
                      width={160}
                      height={120}
                      priority
                      className="w-auto h-auto max-w-[160px]"
                    />
                  </div>
                </div>

            {/* Form Section */}
            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="px-8 pb-10"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <h1 className="text-2xl font-bold text-[#11357b] text-center mb-1">
                      Registro de Curador
                    </h1>
                    <p className="text-[#11357b]/50 text-center text-sm mb-8">
                      Complete los campos para continuar
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <label className="block text-sm font-semibold text-[#11357b] mb-2">
                          Nombre Completo
                        </label>
                        <div className="relative">
                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                            focusedField === 'nombreCompleto' ? 'text-[#11357b]' : 'text-[#11357b]/30'
                          }`}>
                            <User className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={formData.nombreCompleto}
                            onChange={(e) => handleChange("nombreCompleto", e.target.value)}
                            onFocus={() => setFocusedField('nombreCompleto')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none bg-[#f8fafc] text-[#11357b] font-medium ${
                              errors.nombreCompleto 
                                ? 'border-red-400 bg-red-50/50' 
                                : focusedField === 'nombreCompleto'
                                  ? 'border-[#11357b] bg-white shadow-[0_0_0_4px_rgba(17,53,123,0.1)]'
                                  : 'border-transparent hover:border-[#11357b]/20'
                            }`}
                          />
                        </div>
                        <AnimatePresence>
                          {errors.nombreCompleto && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-red-500 text-xs mt-2 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.nombreCompleto}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Número de Despacho */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                      >
                        <label className="block text-sm font-semibold text-[#11357b] mb-2">
                          Número de Despacho
                        </label>
                        <div className="relative">
                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                            focusedField === 'numeroDespacho' ? 'text-[#11357b]' : 'text-[#11357b]/30'
                          }`}>
                            <Hash className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={formData.numeroDespacho}
                            onChange={(e) => handleChange("numeroDespacho", e.target.value)}
                            onFocus={() => setFocusedField('numeroDespacho')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none bg-[#f8fafc] text-[#11357b] font-medium ${
                              errors.numeroDespacho 
                                ? 'border-red-400 bg-red-50/50' 
                                : focusedField === 'numeroDespacho'
                                  ? 'border-[#11357b] bg-white shadow-[0_0_0_4px_rgba(17,53,123,0.1)]'
                                  : 'border-transparent hover:border-[#11357b]/20'
                            }`}
                          />
                        </div>
                        <AnimatePresence>
                          {errors.numeroDespacho && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-red-500 text-xs mt-2 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.numeroDespacho}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Municipio o Ciudad */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5, duration: 0.4 }}
                      >
                        <label className="block text-sm font-semibold text-[#11357b] mb-2">
                          Municipio o Ciudad
                        </label>
                        <div className="relative">
                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                            focusedField === 'municipio' ? 'text-[#11357b]' : 'text-[#11357b]/30'
                          }`}>
                            <MapPin className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            value={formData.municipio}
                            onChange={(e) => handleChange("municipio", e.target.value)}
                            onFocus={() => setFocusedField('municipio')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none bg-[#f8fafc] text-[#11357b] font-medium ${
                              errors.municipio 
                                ? 'border-red-400 bg-red-50/50' 
                                : focusedField === 'municipio'
                                  ? 'border-[#11357b] bg-white shadow-[0_0_0_4px_rgba(17,53,123,0.1)]'
                                  : 'border-transparent hover:border-[#11357b]/20'
                            }`}
                          />
                        </div>
                        <AnimatePresence>
                          {errors.municipio && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-red-500 text-xs mt-2 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.municipio}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Asistencia Sábado - Día de Playa */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.55, duration: 0.4 }}
                      >
                        <label className="block text-sm font-semibold text-[#11357b] mb-2">
                          Asistencia - Día de Playa (Sábado 21 de marzo)
                        </label>
                        <div className="relative">
                          <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                            focusedField === 'asistenciaSabado' ? 'text-[#11357b]' : 'text-[#11357b]/30'
                          }`}>
                            <Sun className="w-5 h-5" />
                          </div>
                          <select
                            value={formData.asistenciaSabado}
                            onChange={(e) => handleChange("asistenciaSabado", e.target.value)}
                            onFocus={() => setFocusedField('asistenciaSabado')}
                            onBlur={() => setFocusedField(null)}
                            className={`w-full pl-12 pr-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none bg-[#f8fafc] text-[#11357b] font-medium appearance-none cursor-pointer ${
                              errors.asistenciaSabado 
                                ? 'border-red-400 bg-red-50/50' 
                                : focusedField === 'asistenciaSabado'
                                  ? 'border-[#11357b] bg-white shadow-[0_0_0_4px_rgba(17,53,123,0.1)]'
                                  : 'border-transparent hover:border-[#11357b]/20'
                            }`}
                          >
                            <option value="">Seleccione una opción...</option>
                            <option value="solo_viernes">Solo asistiré el viernes</option>
                            <option value="viernes_y_sabado">Asistiré viernes y sábado</option>
                            <option value="no_asistire">No asistiré al evento</option>
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-[#11357b]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                        <AnimatePresence>
                          {errors.asistenciaSabado && (
                            <motion.p
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              className="text-red-500 text-xs mt-2 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                              {errors.asistenciaSabado}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* Submit Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, duration: 0.4 }}
                        className="pt-3"
                      >
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-[#11357b] text-white py-4 px-6 rounded-xl font-semibold text-base
                            hover:bg-[#0d2a63] active:scale-[0.98] transition-all duration-200
                            shadow-[0_4px_20px_rgba(17,53,123,0.4)] hover:shadow-[0_6px_30px_rgba(17,53,123,0.5)]
                            disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {isSubmitting ? (
                            <>
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                              />
                              Registrando...
                            </>
                          ) : (
                            "Registrar"
                          )}
                        </button>
                      </motion.div>
                    </form>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-8 pb-10 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 mx-auto mb-5 bg-[#11357b]/10 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-10 h-10 text-[#11357b]" />
                  </motion.div>
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold text-[#11357b] mb-2"
                  >
                    Registro Exitoso
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-[#11357b]/60 mb-6"
                  >
                    Su información ha sido registrada
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-[#f8fafc] rounded-xl p-5 text-left space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#11357b]/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-[#11357b]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#11357b]/50">Nombre</p>
                        <p className="text-sm font-semibold text-[#11357b]">{formData.nombreCompleto}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#11357b]/10 flex items-center justify-center">
                        <Hash className="w-4 h-4 text-[#11357b]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#11357b]/50">Despacho</p>
                        <p className="text-sm font-semibold text-[#11357b]">{formData.numeroDespacho}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#11357b]/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#11357b]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#11357b]/50">Municipio</p>
                        <p className="text-sm font-semibold text-[#11357b]">{formData.municipio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#11357b]/10 flex items-center justify-center">
                        <Sun className="w-4 h-4 text-[#11357b]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#11357b]/50">Asistencia</p>
                        <p className="text-sm font-semibold text-[#11357b]">
                          {formData.asistenciaSabado === 'solo_viernes' && 'Solo viernes'}
                          {formData.asistenciaSabado === 'viernes_y_sabado' && 'Viernes y sábado'}
                          {formData.asistenciaSabado === 'no_asistire' && 'No asistirá'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
              </>
            )}
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-white/40 text-xs mt-6"
          >
            Colegio Nacional de Curadores Urbanos
          </motion.p>
        </div>
      </div>
    </main>
  )
}
