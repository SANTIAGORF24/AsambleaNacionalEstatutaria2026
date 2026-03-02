"use client"

import React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { CheckCircle2, AlertCircle, User, Hash, MapPin, Calendar, Clock, Sun, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const formatearTexto = (texto: string): string =>
  texto.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())

export default function LandingPage() {
  const [currentView, setCurrentView] = useState<'info' | 'agenda' | 'form'>('info')
  const [showContent, setShowContent] = useState(false)
  const [formData, setFormData] = useState({
    nombreCompleto: "",
    numeroDespacho: "",
    municipio: "",
    confirmacionAsistencia: "",
    asistenciaAsamblea: "",
    enviaPoder: "",
    personaPoder: "",
    asistenciaSabado: "",
    acompanantesSabado: "",
  })
  const [errors, setErrors] = useState({
    nombreCompleto: "",
    numeroDespacho: "",
    municipio: "",
    confirmacionAsistencia: "",
    asistenciaAsamblea: "",
    enviaPoder: "",
    personaPoder: "",
    asistenciaSabado: "",
    acompanantesSabado: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 800)
    return () => clearTimeout(timer)
  }, [])

  const validateNombreCompleto = (value: string) => {
    if (!value.trim()) return "El nombre es requerido"
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) return "Solo se permiten letras"
    return ""
  }
  const validateNumeroDespacho = (value: string) => {
    if (!value.trim()) return "El número es requerido"
    if (!/^\d+$/.test(value)) return "Solo se permiten números"
    return ""
  }
  const validateMunicipio = (value: string) => {
    if (!value.trim()) return "El municipio es requerido"
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(value)) return "Solo se permiten letras"
    return ""
  }
  const validateRequired = (value: string, msg: string) => (!value ? msg : "")

  const handleChange = (field: keyof typeof formData, value: string) => {
    let v = value
    if (field === 'numeroDespacho' || field === 'acompanantesSabado') {
      if (!/^\d*$/.test(value)) {
        toast.error("¡Solo se permiten números!", { duration: 2000, position: "top-center" }); return
      }
    } else if (['nombreCompleto', 'municipio', 'personaPoder'].includes(field)) {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/.test(value)) {
        toast.error("¡Solo se permiten letras!", { duration: 2000, position: "top-center" }); return
      }
      v = formatearTexto(value)
    }
    if (field === 'confirmacionAsistencia') {
      setFormData(p => ({ ...p, confirmacionAsistencia: v, asistenciaAsamblea: "", enviaPoder: "", personaPoder: "" }))
      setErrors(p => ({ ...p, confirmacionAsistencia: "" })); return
    }
    if (field === 'asistenciaAsamblea') {
      setFormData(p => ({ ...p, asistenciaAsamblea: v, enviaPoder: "", personaPoder: "" }))
      setErrors(p => ({ ...p, asistenciaAsamblea: "" })); return
    }
    if (field === 'enviaPoder') {
      setFormData(p => ({ ...p, enviaPoder: v, personaPoder: "" }))
      setErrors(p => ({ ...p, enviaPoder: "" })); return
    }
    if (field === 'asistenciaSabado') {
      setFormData(p => ({ ...p, asistenciaSabado: v, acompanantesSabado: "" }))
      setErrors(p => ({ ...p, asistenciaSabado: "" })); return
    }
    setFormData(p => ({ ...p, [field]: v }))
    setErrors(p => ({ ...p, [field]: "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const noAsamblea = formData.asistenciaAsamblea === "no"
    const conPoder = formData.enviaPoder === "si"
    const conSabado = formData.asistenciaSabado === "si"
    const newErrors = {
      nombreCompleto: validateNombreCompleto(formData.nombreCompleto),
      numeroDespacho: validateNumeroDespacho(formData.numeroDespacho),
      municipio: validateMunicipio(formData.municipio),
      confirmacionAsistencia: validateRequired(formData.confirmacionAsistencia, "Seleccione una opción"),
      asistenciaAsamblea: validateRequired(formData.asistenciaAsamblea, "Seleccione una opción"),
      enviaPoder: noAsamblea ? validateRequired(formData.enviaPoder, "Seleccione una opción") : "",
      personaPoder: conPoder ? validateRequired(formData.personaPoder, "Indique el nombre de quien recibe el poder") : "",
      asistenciaSabado: validateRequired(formData.asistenciaSabado, "Seleccione una opción"),
      acompanantesSabado: conSabado ? validateRequired(formData.acompanantesSabado, "Indique el número de acompañantes (0 si va solo)") : "",
    }
    setErrors(newErrors)
    if (Object.values(newErrors).every(e => !e)) {
      setIsSubmitting(true)
      try {
        const supabase = createClient()
        const { error } = await supabase.from('registros').insert([{
          nombre_completo: formData.nombreCompleto,
          numero_despacho: formData.numeroDespacho,
          municipio: formData.municipio,
          confirmacion_asistencia: formData.confirmacionAsistencia,
          asistencia_asamblea: formData.asistenciaAsamblea,
          envia_poder: noAsamblea ? formData.enviaPoder : null,
          persona_poder: conPoder ? formData.personaPoder : null,
          asistencia_sabado: formData.asistenciaSabado,
          acompanantes_sabado: conSabado ? (parseInt(formData.acompanantesSabado) || 0) : null,
          fecha_registro: new Date().toISOString(),
        }])
        if (error) { console.error(error); toast.error('Error al registrar.', { position: "top-center" }) }
        else setIsSubmitted(true)
      } catch (err) { console.error(err); toast.error('Error de conexión.', { position: "top-center" }) }
      finally { setIsSubmitting(false) }
    }
  }

  const inputCls = (f: string) =>
    `w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none bg-[#f8fafc] text-[#11357b] font-medium ${
      errors[f as keyof typeof errors] ? 'border-red-400 bg-red-50/50'
      : focusedField === f ? 'border-[#11357b] bg-white shadow-[0_0_0_4px_rgba(17,53,123,0.1)]'
      : 'border-transparent hover:border-[#11357b]/20'}`

  const ErrMsg = ({ f }: { f: keyof typeof errors }) => (
    <AnimatePresence>
      {errors[f] && (
        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
          className="text-red-500 text-xs mt-2 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />{errors[f]}
        </motion.p>
      )}
    </AnimatePresence>
  )

  const RadioGroup = ({ field, label, opts, icon, bgCard = "bg-[#f8fafc]" }: {
    field: keyof typeof formData; label: string
    opts: { v: string; l: string }[]; icon: React.ReactNode; bgCard?: string
  }) => (
    <div>
      <label className="block text-sm font-semibold text-[#11357b] mb-2 flex items-center gap-2">{icon}{label}</label>
      <div className="flex gap-3">
        {opts.map(o => (
          <button key={o.v} type="button" onClick={() => handleChange(field, o.v)}
            className={`flex-1 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 ${
              formData[field] === o.v ? 'bg-[#11357b] text-white border-[#11357b] shadow-md'
              : `${bgCard} text-[#11357b] border-transparent hover:border-[#11357b]/30`}`}>
            {o.l}
          </button>
        ))}
      </div>
      <ErrMsg f={field} />
    </div>
  )

  const Logo = ({ size = 160 }: { size?: number }) => (
    <Image src="/logooooo.webp" alt="CNCU" width={size} height={Math.round(size * 0.75)} priority className="w-auto h-auto" style={{ maxWidth: size }} />
  )

  return (
    <main className={`min-h-screen bg-[#11357b] relative ${currentView === 'agenda' ? 'overflow-auto' : 'overflow-hidden'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-white/5" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-white/5" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-white/3" />
      </div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

      <div className={`relative px-4 py-8 ${currentView === 'agenda' ? 'min-h-fit' : 'min-h-screen flex items-center justify-center'}`}>
        <div className={`w-full max-w-lg ${currentView === 'agenda' ? 'mx-auto' : ''}`}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-3xl shadow-2xl overflow-hidden">

            {/* INFO */}
            {currentView === 'info' ? (
              <>
                <div className="bg-white px-8 pt-10 pb-6">
                  <motion.div initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: showContent ? 1 : 1.1, opacity: 1 }} transition={{ duration: 0.8 }} className="flex justify-center">
                    <Logo size={180} />
                  </motion.div>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }} transition={{ delay: 0.3, duration: 0.6 }} className="px-8 pb-10">
                  <h1 className="text-3xl font-bold text-[#11357b] text-center mb-6">ASAMBLEA NACIONAL ESTATUTARIA</h1>
                  <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : -20 }} transition={{ delay: 0.5, duration: 0.5 }} className="flex items-center justify-center gap-3">
                      <Calendar className="w-6 h-6 text-[#11357b]" />
                      <div className="text-left"><p className="text-sm text-[#11357b]/60 font-medium">Asamblea</p><p className="text-lg font-bold text-[#11357b]">Viernes 20 de marzo</p></div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : 20 }} transition={{ delay: 0.6, duration: 0.5 }} className="flex items-center justify-center gap-3">
                      <Clock className="w-6 h-6 text-[#11357b]" />
                      <div className="text-left"><p className="text-sm text-[#11357b]/60 font-medium">Horario</p><p className="text-lg font-bold text-[#11357b]">8:00 a.m. – 6:00 p.m.</p></div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : 20 }} transition={{ delay: 0.55, duration: 0.5 }} className="flex items-center justify-center gap-3">
                      <Sun className="w-6 h-6 text-[#11357b]" />
                      <div className="text-left"><p className="text-sm text-[#11357b]/60 font-medium">Actividad de integración</p><p className="text-lg font-bold text-[#11357b]">Sábado 21 de marzo</p></div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }} transition={{ delay: 0.7, duration: 0.5 }} className="bg-gradient-to-br from-[#11357b]/5 to-[#11357b]/10 rounded-xl p-6 border border-[#11357b]/20">
                      <div className="flex items-center gap-3 mb-4"><MapPin className="w-6 h-6 text-[#11357b]" /><h3 className="font-bold text-[#11357b] text-lg">Ubicación</h3></div>
                      <div className="space-y-3 text-[#11357b]">
                        <div><p className="text-sm font-medium text-[#11357b]/60">Lugar</p><p className="font-bold text-lg">Santa Marta</p></div>
                        <div><p className="text-sm font-medium text-[#11357b]/60">Sede</p><p className="font-semibold">Salón "Arrecifes" Torre 2</p></div>
                        <div><p className="text-sm font-medium text-[#11357b]/60">Hotel</p><p className="font-semibold">Zuana Beach Resort</p></div>
                        <div><p className="text-sm font-medium text-[#11357b]/60">Dirección</p><p className="font-semibold">Carrera 2 # 6 – 80</p></div>
                      </div>
                    </motion.div>
                    <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: showContent ? 1 : 0, scale: showContent ? 1 : 0.9 }} transition={{ delay: 0.8, duration: 0.5 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentView('agenda')} className="w-full bg-[#11357b] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#0d2a5a] transition-all duration-200 shadow-lg">
                      Ver Orden del Día
                    </motion.button>
                  </div>
                </motion.div>
              </>

            /* AGENDA */
            ) : currentView === 'agenda' ? (
              <>
                <div className="bg-white px-8 pt-8 pb-6">
                  <div className="flex flex-col items-center">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentView('info')} className="self-start mb-4 flex items-center gap-2 text-[#11357b]/60 hover:text-[#11357b] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      <span className="text-sm font-medium">Volver</span>
                    </motion.button>
                    <Logo size={160} />
                  </div>
                </div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="px-6 pb-8">
                  <h2 className="text-2xl font-bold text-[#11357b] text-center mb-6">ORDEN DEL DÍA</h2>

                  {/* VIERNES */}
                  <div className="mb-6">
                    <div className="bg-[#11357b] text-white py-2 px-4 rounded-lg mb-4"><h3 className="font-bold text-center">VIERNES 20 DE MARZO</h3></div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center border-b border-[#11357b]/10 pb-3">
                        <span className="text-[#11357b] font-semibold">Registro de Asistencia</span>
                        <span className="text-[#11357b]/70 font-bold shrink-0 ml-2">8:00 a.m.</span>
                      </div>

                      {/* I Instalación */}
                      <div className="bg-[#11357b]/5 rounded-xl p-4">
                        <h4 className="font-bold text-[#11357b] mb-3 text-xs uppercase tracking-wide">I. Instalación</h4>
                        <div className="space-y-4">
                          {[
                            { org: "Colegio Nacional de Curadores Urbanos", name: "Arq. William Taboada Díaz", role: "Presidente del CNCU", time: "8:30 a.m." },
                            { org: "Ministerio de Vivienda, Ciudad y Territorio", name: "Dra. Aydee Marqueza Marsiglia Bello", role: "Viceministra de Vivienda", time: "8:40 a.m." },
                            { org: "Superintendencia de Notariado y Registro", name: "Dr. Ricardo Agudelo Sedano", role: "Superintendente", time: "8:50 a.m." },
                          ].map((item, i) => (
                            <div key={i} className="flex justify-between items-start gap-2">
                              <div>
                                <p className="font-semibold text-[#11357b] leading-tight">{item.org}</p>
                                <p className="text-[#11357b]/70 text-xs mt-0.5">{item.name}</p>
                                <p className="text-[#11357b]/50 text-xs">{item.role}</p>
                              </div>
                              <span className="text-[#11357b]/70 font-bold shrink-0">{item.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* II Evento Académico */}
                      <div className="bg-[#11357b]/5 rounded-xl p-4">
                        <h4 className="font-bold text-[#11357b] mb-3 text-xs uppercase tracking-wide">II. Evento Académico</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-semibold text-[#11357b] leading-tight">Instrumentos normativos para el fortalecimiento de la figura del Curador</p>
                              <p className="text-[#11357b]/70 text-xs mt-0.5">Dr. Luis Hair Dueñas Gómez</p>
                              <p className="text-[#11357b]/50 text-xs">Subdirector de Políticas de Desarrollo Urbano y Territorial – MinVivienda</p>
                            </div>
                            <span className="text-[#11357b]/70 font-bold shrink-0">9:00 a.m.</span>
                          </div>
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-semibold text-[#11357b]">Ponencia Superintendencia de Notariado y Registro</p>
                            <span className="text-[#11357b]/70 font-bold shrink-0">9:45 a.m.</span>
                          </div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-semibold text-[#11357b] leading-tight">Situaciones administrativas Curadores Urbanos</p>
                              <p className="text-[#11357b]/70 text-xs mt-0.5">Dr. Antonio José De Santis Cassab</p>
                              <p className="text-[#11357b]/50 text-xs">Abogado – Especialista Derecho Comercial, Laboral y Seguridad Social</p>
                            </div>
                            <span className="text-[#11357b]/70 font-bold shrink-0">10:30 a.m.</span>
                          </div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <p className="font-semibold text-[#11357b]">Poniendo a prueba tu conocimiento</p>
                              <p className="text-[#11357b]/70 text-xs mt-0.5">Miembros de Junta Directiva</p>
                            </div>
                            <span className="text-[#11357b]/70 font-bold shrink-0">12:30 p.m.</span>
                          </div>
                        </div>
                        <p className="text-[#11357b]/40 text-xs italic mt-3">* El evento académico está sujeto a modificaciones.</p>
                      </div>

                      {/* Almuerzo */}
                      <div className="flex justify-between items-center bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <span className="font-semibold text-[#11357b]">🍽️ Almuerzo de Integración</span>
                        <span className="text-[#11357b]/70 font-bold shrink-0">1:00 p.m.</span>
                      </div>

                      {/* III Asamblea */}
                      <div className="bg-[#11357b]/5 rounded-xl p-4">
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <h4 className="font-bold text-[#11357b] text-xs uppercase tracking-wide">III. Asamblea Nacional Estatutaria</h4>
                          <span className="text-[#11357b]/70 font-bold shrink-0">2:30 p.m.</span>
                        </div>
                        <p className="text-[#11357b]/60 text-xs mb-3">Colegio Nacional de Curadores Urbanos</p>
                        <div className="space-y-1.5 text-xs text-[#11357b]">
                          {["Verificación del Quórum","Aprobación del Orden del Día","Nombramiento Comité, Revisión del Acta Asamblea","Informe Comité aprobación Acta anterior","Informe Junta Directiva","Presentación y aprobación Estados Financieros y presupuesto 2026 por el Contador","Elección de Junta Directiva","Proposiciones y varios"].map((item, i) => (
                            <p key={i} className="flex gap-2"><span className="text-[#11357b]/40 font-bold">{i+1}.</span><span>{item}</span></p>
                          ))}
                        </div>
                      </div>

                      {/* Clausura */}
                      <div className="flex justify-between items-center border-t border-[#11357b]/20 pt-3">
                        <span className="font-bold text-[#11357b]">CLAUSURA</span>
                        <span className="text-[#11357b]/70 font-bold">6:00 p.m.</span>
                      </div>
                    </div>
                  </div>

                  {/* SÁBADO */}
                  <div className="mb-6">
                    <div className="bg-[#11357b] text-white py-2 px-4 rounded-lg mb-4"><h3 className="font-bold text-center">SÁBADO 21 DE MARZO</h3></div>
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200 rounded-xl p-4">
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <div>
                          <p className="text-2xl mb-1">⛵</p>
                          <p className="font-bold text-[#11357b]">Actividad de Integración</p>
                          <p className="font-semibold text-[#11357b]/80 text-sm">Tour marítimo – Bahía Concha</p>
                          <p className="text-[#11357b]/60 text-xs">Katamarán Tayrona</p>
                        </div>
                        <span className="text-[#11357b]/70 font-bold shrink-0 text-sm text-right">9:00 a.m.<br/>– 4:00 p.m.</span>
                      </div>
                      <div className="border-t border-sky-200 pt-3 space-y-1 text-xs text-[#11357b]/70">
                        <p>✅ El CNCU cubre los costos del Curador Urbano participante.</p>
                        <p>👫 Acompañantes: <span className="font-semibold text-[#11357b]">$165.000 por persona</span></p>
                      </div>
                    </div>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setCurrentView('form')} className="w-full bg-[#11357b] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#0d2a5a] transition-all duration-200 shadow-lg">
                    Confirmar Asistencia
                  </motion.button>
                </motion.div>
              </>

            /* FORMULARIO */
            ) : (
              <>
                <div className="bg-white px-8 pt-8 pb-6">
                  <div className="flex flex-col items-center">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setCurrentView('agenda')} className="self-start mb-4 flex items-center gap-2 text-[#11357b]/60 hover:text-[#11357b] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      <span className="text-sm font-medium">Volver</span>
                    </motion.button>
                    <Logo size={160} />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {!isSubmitted ? (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="px-8 pb-10">
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
                        <h1 className="text-2xl font-bold text-[#11357b] text-center mb-1">Confirmación de Asistencia</h1>
                        <p className="text-[#11357b]/50 text-center text-sm mb-8">Complete los campos para registrarse</p>

                        <form onSubmit={handleSubmit} className="space-y-5">

                          {/* Nombre */}
                          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
                            <label className="block text-sm font-semibold text-[#11357b] mb-2 flex items-center gap-2"><User className="w-4 h-4" />Nombre Completo</label>
                            <input type="text" value={formData.nombreCompleto} onChange={e => handleChange("nombreCompleto", e.target.value)} onFocus={() => setFocusedField('nombreCompleto')} onBlur={() => setFocusedField(null)} placeholder="Ingrese su nombre completo" className={inputCls('nombreCompleto')} />
                            <ErrMsg f="nombreCompleto" />
                          </motion.div>

                          {/* Municipio */}
                          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35, duration: 0.4 }}>
                            <label className="block text-sm font-semibold text-[#11357b] mb-2 flex items-center gap-2"><MapPin className="w-4 h-4" />Municipio o Ciudad</label>
                            <input type="text" value={formData.municipio} onChange={e => handleChange("municipio", e.target.value)} onFocus={() => setFocusedField('municipio')} onBlur={() => setFocusedField(null)} placeholder="Ciudad donde ejerce" className={inputCls('municipio')} />
                            <ErrMsg f="municipio" />
                          </motion.div>

                          {/* Despacho */}
                          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
                            <label className="block text-sm font-semibold text-[#11357b] mb-2 flex items-center gap-2"><Hash className="w-4 h-4" />Número de Despacho</label>
                            <input type="text" inputMode="numeric" value={formData.numeroDespacho} onChange={e => handleChange("numeroDespacho", e.target.value)} onFocus={() => setFocusedField('numeroDespacho')} onBlur={() => setFocusedField(null)} placeholder="Ej: 12" className={inputCls('numeroDespacho')} />
                            <ErrMsg f="numeroDespacho" />
                          </motion.div>

                          {/* Sección asistencia */}
                          <div className="border-t border-[#11357b]/10 pt-1">
                            <p className="text-xs font-bold text-[#11357b]/40 uppercase tracking-wider mb-3">Confirmación de Asistencia</p>
                          </div>

                          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 0.4 }}>
                            <RadioGroup field="confirmacionAsistencia" label="¿Confirma su asistencia a los eventos?" opts={[{ v: "si", l: "Sí asisto" }, { v: "no", l: "No asisto" }]} icon={<Calendar className="w-4 h-4" />} />
                          </motion.div>

                          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
                            <RadioGroup field="asistenciaAsamblea" label="¿Asistirá a la Asamblea Nacional Estatutaria?" opts={[{ v: "si", l: "Sí" }, { v: "no", l: "No" }]} icon={<Users className="w-4 h-4" />} />
                          </motion.div>

                          {/* Poder (condicional) */}
                          <AnimatePresence>
                            {formData.asistenciaAsamblea === "no" && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-4">
                                  <p className="text-xs font-semibold text-amber-800">Al no asistir a la Asamblea, indique si envía poder para voz y voto.</p>
                                  <RadioGroup field="enviaPoder" label="¿Envía poder para la Asamblea?" opts={[{ v: "si", l: "Sí envío poder" }, { v: "no", l: "No envío poder" }]} icon={<User className="w-4 h-4" />} bgCard="bg-white" />
                                  <AnimatePresence>
                                    {formData.enviaPoder === "si" && (
                                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <label className="block text-sm font-semibold text-[#11357b] mb-2">¿A quién le otorga el poder (voz y voto)?</label>
                                        <input type="text" value={formData.personaPoder} onChange={e => handleChange("personaPoder", e.target.value)} onFocus={() => setFocusedField('personaPoder')} onBlur={() => setFocusedField(null)} placeholder="Nombre completo de quien recibe el poder"
                                          className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none bg-white text-[#11357b] font-medium ${errors.personaPoder ? 'border-red-400' : focusedField === 'personaPoder' ? 'border-[#11357b] shadow-[0_0_0_4px_rgba(17,53,123,0.1)]' : 'border-amber-200 hover:border-[#11357b]/30'}`} />
                                        <ErrMsg f="personaPoder" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Sección sábado */}
                          <div className="border-t border-[#11357b]/10 pt-1">
                            <p className="text-xs font-bold text-[#11357b]/40 uppercase tracking-wider mb-3">Actividad Sábado 21 de Marzo</p>
                          </div>

                          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55, duration: 0.4 }}>
                            <RadioGroup field="asistenciaSabado" label="¿Asistirá al tour marítimo del sábado?" opts={[{ v: "si", l: "Sí asisto" }, { v: "no", l: "No asisto" }]} icon={<Sun className="w-4 h-4" />} />
                          </motion.div>

                          {/* Acompañantes (condicional) */}
                          <AnimatePresence>
                            {formData.asistenciaSabado === "si" && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                <div className="bg-sky-50 border border-sky-200 rounded-xl p-4">
                                  <label className="block text-sm font-semibold text-[#11357b] mb-1 flex items-center gap-2"><Users className="w-4 h-4" />¿Cuántos acompañantes lleva?</label>
                                  <p className="text-xs text-sky-700 mb-3">Acompañantes pagan $165.000 por persona. Ingrese 0 si va solo.</p>
                                  <input type="text" inputMode="numeric" value={formData.acompanantesSabado} onChange={e => handleChange("acompanantesSabado", e.target.value)} onFocus={() => setFocusedField('acompanantesSabado')} onBlur={() => setFocusedField(null)} placeholder="Número de acompañantes"
                                    className={`w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-200 outline-none bg-white text-[#11357b] font-medium ${errors.acompanantesSabado ? 'border-red-400' : focusedField === 'acompanantesSabado' ? 'border-[#11357b] shadow-[0_0_0_4px_rgba(17,53,123,0.1)]' : 'border-sky-200 hover:border-[#11357b]/30'}`} />
                                  <ErrMsg f="acompanantesSabado" />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Submit */}
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }} className="pt-3">
                            <button type="submit" disabled={isSubmitting} className="w-full bg-[#11357b] text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-[#0d2a63] active:scale-[0.98] transition-all duration-200 shadow-[0_4px_20px_rgba(17,53,123,0.4)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3">
                              {isSubmitting
                                ? <><motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full block" />Registrando...</>
                                : "Confirmar Registro"}
                            </button>
                          </motion.div>

                        </form>
                      </motion.div>
                    </motion.div>

                  ) : (
                    /* ÉXITO */
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-8 pb-10 text-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="w-20 h-20 mx-auto mb-5 bg-[#11357b]/10 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-10 h-10 text-[#11357b]" />
                      </motion.div>
                      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-[#11357b] mb-2">Registro Exitoso</motion.h2>
                      <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-[#11357b]/60 mb-6">Su confirmación ha sido registrada correctamente.</motion.p>
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#f8fafc] rounded-xl p-5 text-left space-y-3">
                        {[
                          { icon: <User className="w-4 h-4 text-[#11357b]" />, label: "Nombre", value: formData.nombreCompleto },
                          { icon: <Hash className="w-4 h-4 text-[#11357b]" />, label: "Despacho", value: formData.numeroDespacho },
                          { icon: <MapPin className="w-4 h-4 text-[#11357b]" />, label: "Municipio", value: formData.municipio },
                          { icon: <Calendar className="w-4 h-4 text-[#11357b]" />, label: "Asistencia", value: formData.confirmacionAsistencia === "si" ? "Confirma asistencia" : "No asistirá" },
                          {
                            icon: <Users className="w-4 h-4 text-[#11357b]" />, label: "Asamblea",
                            value: formData.asistenciaAsamblea === "si" ? "Asistirá a la Asamblea"
                              : formData.enviaPoder === "si" ? `No asiste – Poder a: ${formData.personaPoder}`
                              : "No asiste – Sin poder",
                          },
                          {
                            icon: <Sun className="w-4 h-4 text-[#11357b]" />, label: "Sábado",
                            value: formData.asistenciaSabado === "si"
                              ? `Asistirá${parseInt(formData.acompanantesSabado) > 0 ? ` con ${formData.acompanantesSabado} acompañante(s)` : " (sin acompañantes)"}`
                              : "No asistirá al tour",
                          },
                        ].map((it, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#11357b]/10 flex items-center justify-center shrink-0">{it.icon}</div>
                            <div><p className="text-xs text-[#11357b]/50">{it.label}</p><p className="text-sm font-semibold text-[#11357b]">{it.value}</p></div>
                          </div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center text-white/40 text-xs mt-6">
            Colegio Nacional de Curadores Urbanos
          </motion.p>
        </div>
      </div>
    </main>
  )
}
