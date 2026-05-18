import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Calculator,
  Clock,
  Users,
  Briefcase,
  Zap,
  Tag,
  Megaphone,
  ArrowRight,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import './styles.css';

function App() {
  const [inputs, setInputs] = useState({
    contratacionesMes: 100,
    vacantesAbiertas: 20,
    diasActuales: 12,
    sueldoOperativo: 14000,
    costoDiaVacanteManual: 700,
    calculoAutomaticoVacante: true,
    factorImpactoVacante: 1.5,
    reclutadores: 4,
    sueldoReclutador: 25000,
    porcentajeTiempoRH: 80,
    automatizacion: 70,
    porcentajeAgencia: 30,
    feeAgencia: 8000,
    pautaDigital: 30000,
    licenciaAnual: 750000,
  });

  const money = (value, compact = false) => {
    const safe = Number.isFinite(value) ? value : 0;
    if (compact && Math.abs(safe) >= 1000000) return `$${(safe / 1000000).toFixed(1)}M`;
    if (compact && Math.abs(safe) >= 1000) return `$${Math.round(safe / 1000)}K`;
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(safe);
  };

  const num = (value, decimals = 0) =>
    new Intl.NumberFormat('es-MX', {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(Number.isFinite(value) ? value : 0);

  const update = (key, value) => {
    const numeric = Number(value);
    setInputs((prev) => ({ ...prev, [key]: numeric < 0 ? 0 : numeric }));
  };

  const results = useMemo(() => {
    const contratacionesAnuales = inputs.contratacionesMes * 12;
    const adopcion = [0.5, 0.8, 0.9];
    const reduccionAgencia = [0.3, 0.5, 0.65];
    const diasSofiaHR = 3;

    const costoDiaVacanteAutomatico =
      (inputs.sueldoOperativo / 30) * inputs.factorImpactoVacante;

    const costoDiaVacante = inputs.calculoAutomaticoVacante
      ? costoDiaVacanteAutomatico
      : inputs.costoDiaVacanteManual;

    const diasReducidos = Math.max(inputs.diasActuales - diasSofiaHR, 0);
    const costoAnualRH = inputs.reclutadores * inputs.sueldoReclutador * 12;
    const costoRHReclutamiento = costoAnualRH * (inputs.porcentajeTiempoRH / 100);
    const costoActualAgencias =
      contratacionesAnuales * (inputs.porcentajeAgencia / 100) * inputs.feeAgencia;
    const inversionMensual = inputs.licenciaAnual / 12;
    const costoSofiaPorContratacion =
      contratacionesAnuales > 0 ? inputs.licenciaAnual / contratacionesAnuales : 0;

    const years = adopcion.map((a, i) => {
      const contratacionesSofiaHR = contratacionesAnuales * a;
      const ahorroCobertura = diasReducidos * costoDiaVacante * contratacionesSofiaHR;
      const ahorroRH = costoRHReclutamiento * (inputs.automatizacion / 100) * a;
      const ahorroAgencias = costoActualAgencias * reduccionAgencia[i];
      const ahorroTotal = ahorroCobertura + ahorroRH + ahorroAgencias;
      const beneficioNeto = ahorroTotal - inputs.licenciaAnual;
      const roi = inputs.licenciaAnual > 0 ? beneficioNeto / inputs.licenciaAnual : 0;
      const payback = ahorroTotal > 0 ? inputs.licenciaAnual / (ahorroTotal / 12) : 0;

      return {
        year: i + 1,
        adopcion: a,
        reduccionAgencia: reduccionAgencia[i],
        contratacionesSofiaHR,
        ahorroCobertura,
        ahorroRH,
        ahorroAgencias,
        ahorroTotal,
        beneficioNeto,
        roi,
        payback,
        automatizacionEfectiva: (inputs.automatizacion / 100) * a,
      };
    });

    const totalAhorro3 = years.reduce((s, y) => s + y.ahorroTotal, 0);
    const totalInversion3 = inputs.licenciaAnual * 3;
    const beneficio3 = totalAhorro3 - totalInversion3;
    const roi3 = totalInversion3 > 0 ? beneficio3 / totalInversion3 : 0;

    return {
      contratacionesAnuales,
      costoDiaVacante,
      costoDiaVacanteAutomatico,
      diasReducidos,
      costoAnualRH,
      costoRHReclutamiento,
      costoActualAgencias,
      inversionMensual,
      costoSofiaPorContratacion,
      years,
      totalAhorro3,
      totalInversion3,
      beneficio3,
      roi3,
    };
  }, [inputs]);

  const y1 = results.years[0];
  const totalAhorro = y1.ahorroTotal || 1;
  const mixCobertura = y1.ahorroCobertura / totalAhorro;
  const mixRH = y1.ahorroRH / totalAhorro;
  const mixAgencia = y1.ahorroAgencias / totalAhorro;

  const InputBox = ({ label, value, field, prefix, suffix, note, step = 1, disabled = false }) => (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">{label}</label>
      <div className={`flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm ${disabled ? 'opacity-70' : 'focus-within:border-[#13206b] focus-within:ring-2 focus-within:ring-[#13206b]/10'}`}>
        {prefix && <span className="mr-1 text-sm text-slate-400">{prefix}</span>}
        <input
          type="number"
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => update(field, e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none"
        />
        {suffix && <span className="ml-1 text-xs text-slate-400">{suffix}</span>}
      </div>
      {note && <p className="mt-1 text-[11px] text-slate-500">{note}</p>}
    </div>
  );

  const RangeBox = ({ label, value, field, min = 0, max = 100, suffix = '%' }) => (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        <span className="text-xs font-bold text-[#13206b]">{num(value)}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => update(field, e.target.value)}
        className="w-full accent-[#ff5a2c]"
      />
    </div>
  );

  const SectionCard = ({ icon: Icon, badge, title, subtitle, children, color = 'blue' }) => {
    const colorMap = {
      blue: 'bg-blue-50 text-[#13206b]',
      orange: 'bg-orange-50 text-[#ff5a2c]',
      green: 'bg-emerald-50 text-emerald-700',
      purple: 'bg-violet-50 text-violet-700',
    };
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#ff5a2c]">{badge}</p>
            <h3 className="text-base font-bold text-[#13206b]">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
        {children}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] font-sans text-slate-900">
      <header className="bg-[#101b63] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#ff5a2c] bg-white text-[#101b63]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-black leading-none">SofiaHR</p>
              <p className="text-xs font-semibold text-slate-300">IA que contrata por ti</p>
            </div>
          </div>
          <a href="#lead" className="hidden rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-[#101b63] shadow-lg md:inline-flex">
            Solicitar demo personalizada
          </a>
        </div>
      </header>

      <section className="bg-[#101b63] px-6 pb-16 pt-8 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex rounded-xl border border-[#ff5a2c]/60 bg-[#ff5a2c]/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#ff8a66]">
              Simulador ROI
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Descubre cuánto dinero puede <span className="text-[#ff5a2c]">ahorrar</span> tu empresa con SofiaHR
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
              Ingresa los datos de tu operación y calcula en segundos el impacto económico real de automatizar tu reclutamiento operativo.
            </p>
            <div className="mt-8 grid max-w-3xl gap-4 md:grid-cols-3">
              <div className="border-l border-white/20 pl-4">
                <Zap className="mb-3 h-6 w-6 text-[#ff5a2c]" />
                <p className="text-sm text-slate-300">Contrata hasta</p>
                <p className="font-black">3x más rápido</p>
              </div>
              <div className="border-l border-white/20 pl-4">
                <Users className="mb-3 h-6 w-6 text-[#ff5a2c]" />
                <p className="text-sm text-slate-300">Reduce hasta</p>
                <p className="font-black">70% trabajo manual</p>
              </div>
              <div className="border-l border-white/20 pl-4">
                <Tag className="mb-3 h-6 w-6 text-[#ff5a2c]" />
                <p className="text-sm text-slate-300">Disminuye tu dependencia</p>
                <p className="font-black">de agencias</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/8 p-6 shadow-2xl backdrop-blur">
            <p className="text-center text-sm font-bold text-slate-200">Tu impacto estimado anual</p>
            <p className="mt-3 text-center text-5xl font-black text-[#ff5a2c]">{money(y1.ahorroTotal)}</p>
            <p className="mt-2 text-center text-sm text-slate-300">Ahorro total estimado Año 1</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ['ROI primer año', `${num(y1.roi * 100)}%`, 'text-emerald-400'],
                ['Payback', `${num(y1.payback, 1)} meses`, 'text-emerald-400'],
                ['Tiempo con SofiaHR', '3 días', 'text-[#ff5a2c]'],
                ['Adopción Año 1', '50%', 'text-[#ff5a2c]'],
                ['Inversión mensual', money(results.inversionMensual), 'text-[#ff5a2c]'],
                ['Costo por contratación', money(results.costoSofiaPorContratacion), 'text-[#ff5a2c]'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className={`text-2xl font-black ${color}`}>{value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-300">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-xs text-slate-400">Resultados basados en los datos capturados.</p>
          </div>
        </div>
      </section>

      <main id="simulador" className="mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-5">
          <SectionCard icon={Briefcase} badge="A" title="Tu operación actual" subtitle="Información general de tus contrataciones">
            <div className="grid gap-4 md:grid-cols-3">
              <InputBox label="Contrataciones operativas por mes" value={inputs.contratacionesMes} field="contratacionesMes" />
              <InputBox label="Vacantes abiertas promedio" value={inputs.vacantesAbiertas} field="vacantesAbiertas" note="Vacantes operativas abiertas simultáneamente en un mes." />
              <InputBox label="Contrataciones anuales estimadas" value={results.contratacionesAnuales} field="contratacionesMes" suffix="año" disabled note="Contrataciones mensuales x 12." />
            </div>
          </SectionCard>

          <SectionCard icon={Zap} badge="B" title="Velocidad de contratación" subtitle="Costos asociados a vacantes sin cubrir" color="orange">
            <div className="grid gap-4 md:grid-cols-3">
              <InputBox label="Días actuales para contratar" value={inputs.diasActuales} field="diasActuales" suffix="días" />
              <InputBox label="Días con SofiaHR" value={3} field="diasActuales" suffix="días" disabled note="Supuesto fijo del modelo." />
              <InputBox label="Sueldo mensual promedio operativo" value={inputs.sueldoOperativo} field="sueldoOperativo" prefix="$" />
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-slate-700">Costo estimado por día de vacante sin cubrir</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Incluye sueldo, horas extra, productividad perdida y afectación operativa.
                  </p>
                </div>
                <strong className="text-2xl text-[#13206b]">{money(results.costoDiaVacante)}</strong>
              </div>

              <label className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={inputs.calculoAutomaticoVacante}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      calculoAutomaticoVacante: e.target.checked,
                    }))
                  }
                />
                Calcular automáticamente con salario + factor operativo
              </label>

              {inputs.calculoAutomaticoVacante ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <InputBox
                    label="Factor de impacto operativo"
                    value={inputs.factorImpactoVacante}
                    field="factorImpactoVacante"
                    step="0.1"
                    suffix="x"
                    note="Sugerido: 1.5x para operación, almacén o tienda. 1.8x para ventas. 2.0x supervisión."
                  />
                  <div className="rounded-xl bg-white p-3 text-xs text-slate-600">
                    <strong>Fórmula:</strong> sueldo mensual / 30 × factor operativo.<br />
                    Base actual: {money(inputs.sueldoOperativo / 30)} × {inputs.factorImpactoVacante} = {money(results.costoDiaVacante)}
                  </div>
                </div>
              ) : (
                <InputBox
                  label="Captura tu costo real por día"
                  value={inputs.costoDiaVacanteManual}
                  field="costoDiaVacanteManual"
                  prefix="$"
                  note="Úsalo si Finanzas u Operaciones ya tiene este dato calculado."
                />
              )}
            </div>
          </SectionCard>

          <SectionCard icon={Users} badge="C" title="Tu equipo de RH" subtitle="Costo y tiempo del área de reclutamiento" color="green">
            <div className="grid gap-4 md:grid-cols-2">
              <InputBox label="Número de reclutadores" value={inputs.reclutadores} field="reclutadores" />
              <InputBox label="Sueldo mensual promedio por reclutador" value={inputs.sueldoReclutador} field="sueldoReclutador" prefix="$" />
            </div>
            <div className="mt-5 space-y-5">
              <RangeBox label="% del tiempo dedicado a reclutamiento" value={inputs.porcentajeTiempoRH} field="porcentajeTiempoRH" />
              <RangeBox label="% de automatización con SofiaHR" value={inputs.automatizacion} field="automatizacion" />
            </div>
          </SectionCard>

          <SectionCard icon={Tag} badge="D" title="Uso de agencias externas" subtitle="El gasto más fácil de reducir con IA" color="orange">
            <div className="grid gap-4 md:grid-cols-3">
              <InputBox label="% contrataciones actuales por agencia" value={inputs.porcentajeAgencia} field="porcentajeAgencia" suffix="%" />
              <InputBox label="Fee promedio por contratación agencia" value={inputs.feeAgencia} field="feeAgencia" prefix="$" />
              <InputBox label="Gasto anual actual en agencias" value={Math.round(results.costoActualAgencias)} field="feeAgencia" prefix="$" disabled note="Calculado automáticamente." />
            </div>
          </SectionCard>

          <SectionCard icon={Megaphone} badge="E" title="Inversión en atracción" subtitle="La pauta acelera el volumen de candidatos" color="purple">
            <div className="grid gap-4 md:grid-cols-2">
              <InputBox label="Presupuesto mensual estimado para pauta" value={inputs.pautaDigital} field="pautaDigital" prefix="$" />
              <InputBox label="Licencia anual SofiaHR" value={inputs.licenciaAnual} field="licenciaAnual" prefix="$" note="Referencia: $750,000 anual para 1,000 a 1,500 contrataciones." />
            </div>
            <div className="mt-4 rounded-xl bg-orange-50 p-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="font-semibold text-slate-700">Inversión mensual SofiaHR</span>
                <strong className="text-[#ff5a2c]">{money(results.inversionMensual)}</strong>
              </div>
            </div>
          </SectionCard>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
          <div className="rounded-3xl bg-[#101b63] p-6 text-white shadow-2xl">
            <div className="mb-5 flex items-center gap-3">
              <Calculator className="h-6 w-6 text-[#ff5a2c]" />
              <div>
                <h3 className="font-black">Resultados estimados</h3>
                <p className="text-xs text-slate-300">Año 1 con adopción del 50%</p>
              </div>
            </div>
            <div className="rounded-2xl border border-[#ff5a2c]/50 bg-[#ff5a2c]/10 p-5 text-center">
              <p className="text-xs text-slate-300">ROI Año 1</p>
              <p className="text-5xl font-black text-[#ff5a2c]">{num(y1.roi * 100)}%</p>
              <p className="mt-1 text-xs text-slate-300">Por cada $1 invertido recuperas ${(y1.roi + 1).toFixed(1)}</p>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span>Contratar más rápido</span><strong className="text-emerald-400">{money(y1.ahorroCobertura, true)}</strong></div>
              <div className="flex justify-between"><span>Productividad RH</span><strong className="text-emerald-400">{money(y1.ahorroRH, true)}</strong></div>
              <div className="flex justify-between"><span>Dejar agencias externas</span><strong className="text-emerald-400">{money(y1.ahorroAgencias, true)}</strong></div>
            </div>
            <div className="mt-5 rounded-2xl bg-white/10 p-4">
              <div className="flex justify-between text-sm"><span>Ahorro mensual total</span><strong className="text-2xl text-emerald-400">{money(y1.ahorroTotal / 12, true)}/mes</strong></div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-3 text-center">
                <p className="text-xs text-slate-300">Beneficio neto Año 1</p>
                <p className="font-black text-[#ff5a2c]">{money(y1.beneficioNeto, true)}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3 text-center">
                <p className="text-xs text-slate-300">Payback</p>
                <p className="font-black text-[#ff5a2c]">{num(y1.payback, 1)} meses</p>
              </div>
            </div>
            <a href="#lead" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ff5a2c] px-5 py-3 font-black text-white shadow-lg shadow-orange-900/20">
              Quiero ver mi demo personalizada <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-black text-[#13206b]">¿De dónde viene el ahorro?</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="mb-1 flex justify-between"><span>Velocidad de contratación</span><strong>{num(mixCobertura * 100, 1)}%</strong></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-[#ff5a2c]" style={{ width: `${Math.min(mixCobertura * 100, 100)}%` }} /></div>
              </div>
              <div>
                <div className="mb-1 flex justify-between"><span>Productividad RH</span><strong>{num(mixRH * 100, 1)}%</strong></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(mixRH * 100, 100)}%` }} /></div>
              </div>
              <div>
                <div className="mb-1 flex justify-between"><span>Ahorro en agencias</span><strong>{num(mixAgencia * 100, 1)}%</strong></div>
                <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(mixAgencia * 100, 100)}%` }} /></div>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <section className="bg-[#101b63] px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="mb-5 inline-flex rounded-full bg-[#ff5a2c]/15 px-4 py-2 text-xs font-black uppercase tracking-widest text-[#ff8a66]">
            Para presentar a dirección
          </div>
          <h2 className="max-w-3xl text-3xl font-black md:text-4xl">El argumento que necesitas, con tus propios números</h2>
          <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-6 text-lg italic leading-8 text-slate-100">
            “Hoy perdemos dinero porque tardamos <strong>{inputs.diasActuales} días</strong> en contratar y el <strong>{inputs.porcentajeAgencia}%</strong> de nuestras contrataciones pasa por agencias. Con SofiaHR reducimos el tiempo de cobertura a <strong>3 días</strong>, liberamos capacidad operativa del equipo de RH y reducimos dependencia externa. El ahorro estimado del primer año es de <strong className="text-[#ff8a66]">{money(y1.ahorroTotal)}</strong>, con un ROI de <strong className="text-[#ff8a66]">{num(y1.roi * 100)}%</strong>.”
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5"><p className="text-2xl font-black text-[#ff5a2c]">{money(y1.ahorroTotal / 12, true)}/mes</p><p className="text-sm text-slate-300">Ahorro mensual total</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5"><p className="text-2xl font-black text-[#ff5a2c]">{num(y1.roi * 100)}%</p><p className="text-sm text-slate-300">ROI primer año</p></div>
            <div className="rounded-2xl border border-white/15 bg-white/10 p-5"><p className="text-2xl font-black text-[#ff5a2c]">{num(y1.payback, 1)} meses</p><p className="text-sm text-slate-300">Recuperación de inversión</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#ff5a2c]">Comparativo</p>
          <h2 className="text-3xl font-black text-[#101b63] md:text-4xl">Antes vs. Después de SofiaHR</h2>
          <p className="mt-2 text-slate-500">Números calculados con los datos capturados.</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-[#101b63] text-white">
              <tr>
                <th className="px-5 py-4">Concepto</th>
                <th className="px-5 py-4">Hoy</th>
                <th className="px-5 py-4">→</th>
                <th className="px-5 py-4">Con SofiaHR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr><td className="px-5 py-4 font-semibold">Días para cubrir una vacante</td><td>{inputs.diasActuales} días</td><td>→</td><td className="font-black text-emerald-600">3 días</td></tr>
              <tr><td className="px-5 py-4 font-semibold">Costo estimado por día de vacante sin cubrir</td><td>{money(results.costoDiaVacante)}</td><td>→</td><td className="font-black text-emerald-600">Base para calcular ahorro por cobertura</td></tr>
              <tr><td className="px-5 py-4 font-semibold">% contrataciones gestionadas por SofiaHR</td><td>0%</td><td>→</td><td className="font-black text-emerald-600">50% año 1 / 80% año 2 / 90% año 3</td></tr>
              <tr><td className="px-5 py-4 font-semibold">Gasto anual en agencias</td><td>{money(results.costoActualAgencias)}</td><td>→</td><td className="font-black text-emerald-600">-{money(y1.ahorroAgencias)} año 1</td></tr>
              <tr><td className="px-5 py-4 font-semibold">Tiempo operativo recuperado RH</td><td>0%</td><td>→</td><td className="font-black text-emerald-600">{num(y1.automatizacionEfectiva * 100)}%</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-widest text-[#ff5a2c]">Proyección</p>
          <h2 className="text-3xl font-black text-[#101b63] md:text-4xl">Proyección de impacto a 3 años</h2>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-[#101b63] text-white">
              <tr>
                <th className="px-5 py-4">Concepto</th>
                <th className="px-5 py-4">Hoy</th>
                <th className="px-5 py-4">Año 1<br/><span className="text-xs font-normal">50% adopción</span></th>
                <th className="px-5 py-4">Año 2<br/><span className="text-xs font-normal">80% adopción</span></th>
                <th className="px-5 py-4">Año 3<br/><span className="text-xs font-normal">90% adopción</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr><td className="px-5 py-4 font-semibold">Tiempo de cobertura</td><td>{inputs.diasActuales} días</td>{results.years.map((y) => <td key={y.year}>3 días</td>)}</tr>
              <tr><td className="px-5 py-4 font-semibold">Ahorro por cobertura</td><td>$0</td>{results.years.map((y) => <td key={y.year}>{money(y.ahorroCobertura)}</td>)}</tr>
              <tr><td className="px-5 py-4 font-semibold">Capacidad RH recuperada</td><td>$0</td>{results.years.map((y) => <td key={y.year}>{money(y.ahorroRH)}</td>)}</tr>
              <tr><td className="px-5 py-4 font-semibold">Reducción en agencias</td><td>$0</td>{results.years.map((y) => <td key={y.year}>{money(y.ahorroAgencias)}</td>)}</tr>
              <tr className="bg-orange-50"><td className="px-5 py-4 font-black">Ahorro total estimado</td><td>$0</td>{results.years.map((y) => <td key={y.year} className="font-black text-[#ff5a2c]">{money(y.ahorroTotal)}</td>)}</tr>
              <tr><td className="px-5 py-4 font-semibold">Inversión SofiaHR</td><td>$0</td>{results.years.map((y) => <td key={y.year}>{money(inputs.licenciaAnual)}</td>)}</tr>
              <tr className="bg-orange-50"><td className="px-5 py-4 font-black">Beneficio neto</td><td>$0</td>{results.years.map((y) => <td key={y.year} className="font-black">{money(y.beneficioNeto)}</td>)}</tr>
              <tr><td className="px-5 py-4 font-black text-[#ff5a2c]">ROI</td><td>—</td>{results.years.map((y) => <td key={y.year} className="font-black text-[#ff5a2c]">{num(y.roi * 100)}%</td>)}</tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 grid gap-4 rounded-2xl border border-[#ff5a2c]/40 bg-orange-50 p-5 md:grid-cols-2">
          <div className="text-center text-[#101b63]"><span className="font-bold">ROI acumulado 3 años</span> <strong className="ml-3 text-4xl text-[#ff5a2c]">{num(results.roi3 * 100)}%</strong></div>
          <div className="text-center text-[#101b63]"><span className="font-bold">Beneficio neto acumulado</span> <strong className="ml-3 text-4xl text-[#ff5a2c]">{money(results.beneficio3)}</strong></div>
        </div>
      </section>

      <section id="lead" className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-8 rounded-3xl bg-[#101b63] p-8 text-white md:grid-cols-[0.9fr_1.1fr] md:p-10">
          <div>
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10">
              <BarChart3 className="h-10 w-10 text-[#ff5a2c]" />
            </div>
            <h2 className="text-3xl font-black">Lleva este análisis al siguiente nivel</h2>
            <p className="mt-4 leading-7 text-slate-300">Agenda una demo personalizada y descubre cómo SofiaHR puede transformar tu proceso de reclutamiento operativo.</p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold">
              <span className="rounded-full bg-white/10 px-3 py-2">Análisis personalizado</span>
              <span className="rounded-full bg-white/10 px-3 py-2">Demo en vivo</span>
              <span className="rounded-full bg-white/10 px-3 py-2">Plan de implementación</span>
            </div>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
            <input className="rounded-xl border border-white/10 bg-white px-4 py-3 text-slate-900 outline-none" placeholder="Nombre completo" />
            <input className="rounded-xl border border-white/10 bg-white px-4 py-3 text-slate-900 outline-none" placeholder="Correo corporativo" />
            <input className="rounded-xl border border-white/10 bg-white px-4 py-3 text-slate-900 outline-none" placeholder="Teléfono / WhatsApp" />
            <input className="rounded-xl border border-white/10 bg-white px-4 py-3 text-slate-900 outline-none" placeholder="Empresa" />
            <button className="md:col-span-2 rounded-xl bg-[#ff5a2c] px-5 py-4 font-black text-white shadow-lg shadow-orange-950/20">
              Quiero mi demo personalizada
            </button>
            <p className="md:col-span-2 text-center text-xs text-slate-400">Sin compromiso. Respuesta en menos de 24 horas.</p>
          </form>
        </div>
      </section>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

