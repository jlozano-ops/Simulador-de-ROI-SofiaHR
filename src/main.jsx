import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Calculator, Clock, Users, Briefcase, Zap, Tag, Megaphone, ArrowRight, BarChart3, ShieldCheck } from 'lucide-react';
import './styles.css';

function App() {
  const [inputs, setInputs] = useState({
    contratacionesMes: 100,
    vacantesAbiertas: 20,
    diasActuales: 12,
    sueldoOperativo: 14000,
    reclutadores: 4,
    sueldoReclutador: 25000,
    porcentajeTiempoRH: 80,
    automatizacion: 70,
    porcentajeAgencia: 30,
    feeAgencia: 8000,
    pautaDigital: 30000,
    licenciaAnual: 750000,
  });

  const money = (v, compact = false) => {
    if (!isFinite(v)) v = 0;
    if (compact && Math.abs(v) >= 1000000) return `$${(v / 1000000).toFixed(1)}M`;
    if (compact && Math.abs(v) >= 1000) return `$${Math.round(v / 1000)}K`;
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(v);
  };
  const num = (v, d = 0) => new Intl.NumberFormat('es-MX', { maximumFractionDigits: d, minimumFractionDigits: d }).format(isFinite(v) ? v : 0);
  const update = (key, value) => setInputs((p) => ({ ...p, [key]: Math.max(0, Number(value)) }));

  const results = useMemo(() => {
    const contratacionesAnuales = inputs.contratacionesMes * 12;
    const adopcion = [0.5, 0.8, 0.9];
    const reduccionAgencia = [0.3, 0.5, 0.65];
    const diasSofiaHR = 3;
    const costoDiaVacante = inputs.sueldoOperativo / 30;
    const diasReducidos = Math.max(inputs.diasActuales - diasSofiaHR, 0);
    const costoAnualRH = inputs.reclutadores * inputs.sueldoReclutador * 12;
    const costoRHReclutamiento = costoAnualRH * (inputs.porcentajeTiempoRH / 100);
    const costoActualAgencias = contratacionesAnuales * (inputs.porcentajeAgencia / 100) * inputs.feeAgencia;
    const inversionMensual = inputs.licenciaAnual / 12;
    const costoSofiaPorContratacion = contratacionesAnuales > 0 ? inputs.licenciaAnual / contratacionesAnuales : 0;
    const years = adopcion.map((a, i) => {
      const contratacionesSofiaHR = contratacionesAnuales * a;
      const ahorroCobertura = diasReducidos * costoDiaVacante * contratacionesSofiaHR;
      const ahorroRH = costoRHReclutamiento * (inputs.automatizacion / 100) * a;
      const ahorroAgencias = costoActualAgencias * reduccionAgencia[i];
      const ahorroTotal = ahorroCobertura + ahorroRH + ahorroAgencias;
      const beneficioNeto = ahorroTotal - inputs.licenciaAnual;
      const roi = inputs.licenciaAnual > 0 ? beneficioNeto / inputs.licenciaAnual : 0;
      const payback = ahorroTotal > 0 ? inputs.licenciaAnual / (ahorroTotal / 12) : 0;
      return { year: i + 1, adopcion: a, reduccionAgencia: reduccionAgencia[i], contratacionesSofiaHR, ahorroCobertura, ahorroRH, ahorroAgencias, ahorroTotal, beneficioNeto, roi, payback, automatizacionEfectiva: (inputs.automatizacion / 100) * a };
    });
    const totalAhorro3 = years.reduce((s, y) => s + y.ahorroTotal, 0);
    const totalInversion3 = inputs.licenciaAnual * 3;
    const beneficio3 = totalAhorro3 - totalInversion3;
    const roi3 = totalInversion3 > 0 ? beneficio3 / totalInversion3 : 0;
    return { contratacionesAnuales, costoDiaVacante, diasReducidos, costoActualAgencias, inversionMensual, costoSofiaPorContratacion, years, beneficio3, roi3 };
  }, [inputs]);

  const y1 = results.years[0];
  const totalAhorro = y1.ahorroTotal || 1;
  const mixCobertura = y1.ahorroCobertura / totalAhorro;
  const mixRH = y1.ahorroRH / totalAhorro;
  const mixAgencia = y1.ahorroAgencias / totalAhorro;

  const InputBox = ({ label, value, field, prefix, suffix, note }) => <div className="field"><label>{label}</label><div className="inputWrap">{prefix && <span>{prefix}</span>}<input type="number" value={value} onChange={(e) => update(field, e.target.value)} />{suffix && <span>{suffix}</span>}</div>{note && <small>{note}</small>}</div>;
  const RangeBox = ({ label, value, field }) => <div className="range"><div><label>{label}</label><b>{num(value)}%</b></div><input type="range" min="0" max="100" value={value} onChange={(e) => update(field, e.target.value)} /></div>;
  const Card = ({ icon: Icon, badge, title, subtitle, children, color = 'blue' }) => <section className="card"><div className="cardHead"><div className={`icon ${color}`}><Icon size={22} /></div><div><p>{badge}</p><h3>{title}</h3><span>{subtitle}</span></div></div>{children}</section>;

  return <div>
    <header className="top"><div className="nav"><div className="logo"><div><ShieldCheck size={25}/></div><section><strong>SofiaHR</strong><span>IA que contrata por ti</span></section></div><a href="#lead">Solicitar demo personalizada</a></div></header>
    <section className="hero"><div className="heroGrid"><div><div className="pill">Simulador ROI</div><h1>Descubre cuánto dinero puede <em>ahorrar</em> tu empresa con SofiaHR</h1><p>Ingresa los datos de tu operación y calcula en segundos el impacto económico real de automatizar tu reclutamiento operativo.</p><div className="benefits"><div><Zap/><span>Contrata hasta</span><b>3x más rápido</b></div><div><Users/><span>Reduce hasta</span><b>70% trabajo manual</b></div><div><Tag/><span>Disminuye dependencia</span><b>de agencias</b></div></div></div><div className="heroResult"><h4>Tu impacto estimado anual</h4><strong>{money(y1.ahorroTotal)}</strong><span>Ahorro total estimado Año 1</span><div>{[['ROI primer año',`${num(y1.roi*100)}%`],['Payback',`${num(y1.payback,1)} meses`],['Tiempo con SofiaHR','3 días'],['Adopción Año 1','50%'],['Inversión mensual',money(results.inversionMensual)],['Costo por contratación',money(results.costoSofiaPorContratacion)]].map(([a,b])=><article key={a}><b>{b}</b><p>{a}</p></article>)}</div></div></div></section>
    <main className="layout" id="simulador"><div className="left">
      <Card icon={Briefcase} badge="A" title="Tu operación actual" subtitle="Información general de tus contrataciones"><div className="grid3"><InputBox label="Contrataciones operativas por mes" value={inputs.contratacionesMes} field="contratacionesMes"/><InputBox label="Vacantes abiertas promedio" value={inputs.vacantesAbiertas} field="vacantesAbiertas"/><InputBox label="Contrataciones anuales estimadas" value={results.contratacionesAnuales} field="contratacionesMes" suffix="año" note="Contrataciones mensuales x 12"/></div></Card>
      <Card icon={Zap} badge="B" title="Velocidad de contratación" subtitle="Costos asociados a vacantes sin cubrir" color="orange"><div className="grid3"><InputBox label="Días actuales para contratar" value={inputs.diasActuales} field="diasActuales" suffix="días"/><InputBox label="Días con SofiaHR" value={3} field="diasActuales" suffix="días" note="Supuesto fijo"/><InputBox label="Sueldo mensual promedio operativo" value={inputs.sueldoOperativo} field="sueldoOperativo" prefix="$"/></div><div className="note"><span>Costo por día de vacante abierta</span><b>{money(results.costoDiaVacante)}</b><small>Cálculo: sueldo mensual / 30 días.</small></div></Card>
      <Card icon={Users} badge="C" title="Tu equipo de RH" subtitle="Costo y tiempo del área de reclutamiento" color="green"><div className="grid2"><InputBox label="Número de reclutadores" value={inputs.reclutadores} field="reclutadores"/><InputBox label="Sueldo mensual promedio por reclutador" value={inputs.sueldoReclutador} field="sueldoReclutador" prefix="$"/></div><RangeBox label="% tiempo dedicado a reclutamiento" value={inputs.porcentajeTiempoRH} field="porcentajeTiempoRH"/><RangeBox label="% automatización con SofiaHR" value={inputs.automatizacion} field="automatizacion"/></Card>
      <Card icon={Tag} badge="D" title="Uso de agencias externas" subtitle="El gasto más fácil de reducir con IA" color="orange"><div className="grid3"><InputBox label="% contrataciones actuales por agencia" value={inputs.porcentajeAgencia} field="porcentajeAgencia" suffix="%"/><InputBox label="Fee promedio por contratación agencia" value={inputs.feeAgencia} field="feeAgencia" prefix="$"/><InputBox label="Gasto anual actual en agencias" value={Math.round(results.costoActualAgencias)} field="feeAgencia" prefix="$" note="Calculado automáticamente"/></div></Card>
      <Card icon={Megaphone} badge="E" title="Inversión en atracción" subtitle="La pauta acelera el volumen de candidatos" color="purple"><div className="grid2"><InputBox label="Presupuesto mensual estimado para pauta" value={inputs.pautaDigital} field="pautaDigital" prefix="$"/><InputBox label="Licencia anual SofiaHR" value={inputs.licenciaAnual} field="licenciaAnual" prefix="$" note="Referencia: $750,000 anual"/></div><div className="note orangeNote"><span>Inversión mensual SofiaHR</span><b>{money(results.inversionMensual)}</b></div></Card>
    </div><aside className="right"><section className="resultPanel"><div className="panelTitle"><Calculator/><div><h3>Resultados estimados</h3><span>Año 1 con adopción del 50%</span></div></div><div className="roiBox"><span>ROI Año 1</span><b>{num(y1.roi*100)}%</b><small>Por cada $1 invertido recuperas ${(y1.roi+1).toFixed(1)}</small></div><p><span>Contratar más rápido</span><b>{money(y1.ahorroCobertura,true)}</b></p><p><span>Productividad RH</span><b>{money(y1.ahorroRH,true)}</b></p><p><span>Dejar agencias externas</span><b>{money(y1.ahorroAgencias,true)}</b></p><div className="monthly"><span>Ahorro mensual total</span><b>{money(y1.ahorroTotal/12,true)}/mes</b></div><div className="mini"><article><span>Beneficio neto Año 1</span><b>{money(y1.beneficioNeto,true)}</b></article><article><span>Payback</span><b>{num(y1.payback,1)} meses</b></article></div><a href="#lead">Quiero ver mi demo personalizada <ArrowRight size={16}/></a></section><section className="source"><h3>¿De dónde viene el ahorro?</h3>{[['Velocidad de contratación',mixCobertura,'orange'],['Productividad RH',mixRH,'blue'],['Ahorro en agencias',mixAgencia,'green']].map(([l,v,c])=><div key={l}><p><span>{l}</span><b>{num(v*100,1)}%</b></p><div className="bar"><i className={c} style={{width:`${Math.min(v*100,100)}%`}}/></div></div>)}</section></aside></main>
    <section className="argument"><div><div className="pill">Para presentar a dirección</div><h2>El argumento que necesitas, con tus propios números</h2><blockquote>“Hoy perdemos dinero porque tardamos <b>{inputs.diasActuales} días</b> en contratar y el <b>{inputs.porcentajeAgencia}%</b> de nuestras contrataciones pasa por agencias. Con SofiaHR reducimos el tiempo de cobertura a <b>3 días</b>, liberamos capacidad operativa del equipo de RH y reducimos dependencia externa. El ahorro estimado del primer año es de <b>{money(y1.ahorroTotal)}</b>, con un ROI de <b>{num(y1.roi*100)}%</b>.”</blockquote><div className="argumentCards"><article><b>{money(y1.ahorroTotal/12,true)}/mes</b><span>Ahorro mensual total</span></article><article><b>{num(y1.roi*100)}%</b><span>ROI primer año</span></article><article><b>{num(y1.payback,1)} meses</b><span>Recuperación de inversión</span></article></div></div></section>
    <section className="tableSec"><h2>Antes vs. Después de SofiaHR</h2><p>Números calculados con los datos capturados.</p><div className="tableWrap"><table><thead><tr><th>Concepto</th><th>Hoy</th><th>→</th><th>Con SofiaHR</th></tr></thead><tbody><tr><td>Días para cubrir una vacante</td><td>{inputs.diasActuales} días</td><td>→</td><td>3 días</td></tr><tr><td>Costo mensual por vacantes abiertas</td><td>{money(inputs.vacantesAbiertas*results.costoDiaVacante*30)}/mes</td><td>→</td><td>{money(inputs.vacantesAbiertas*results.costoDiaVacante*3)}/mes</td></tr><tr><td>% contrataciones gestionadas por SofiaHR</td><td>0%</td><td>→</td><td>50% año 1 / 80% año 2 / 90% año 3</td></tr><tr><td>Gasto anual en agencias</td><td>{money(results.costoActualAgencias)}</td><td>→</td><td>-{money(y1.ahorroAgencias)} año 1</td></tr><tr><td>Tiempo operativo recuperado RH</td><td>0%</td><td>→</td><td>{num(y1.automatizacionEfectiva*100)}%</td></tr></tbody></table></div></section>
    <section className="tableSec"><h2>Proyección de impacto a 3 años</h2><div className="tableWrap"><table><thead><tr><th>Concepto</th><th>Hoy</th><th>Año 1<br/>50%</th><th>Año 2<br/>80%</th><th>Año 3<br/>90%</th></tr></thead><tbody><tr><td>Tiempo de cobertura</td><td>{inputs.diasActuales} días</td>{results.years.map(y=><td key={y.year}>3 días</td>)}</tr><tr><td>Ahorro por cobertura</td><td>$0</td>{results.years.map(y=><td key={y.year}>{money(y.ahorroCobertura)}</td>)}</tr><tr><td>Capacidad RH recuperada</td><td>$0</td>{results.years.map(y=><td key={y.year}>{money(y.ahorroRH)}</td>)}</tr><tr><td>Reducción en agencias</td><td>$0</td>{results.years.map(y=><td key={y.year}>{money(y.ahorroAgencias)}</td>)}</tr><tr className="hl"><td>Ahorro total estimado</td><td>$0</td>{results.years.map(y=><td key={y.year}>{money(y.ahorroTotal)}</td>)}</tr><tr><td>Inversión SofiaHR</td><td>$0</td>{results.years.map(y=><td key={y.year}>{money(inputs.licenciaAnual)}</td>)}</tr><tr className="hl"><td>Beneficio neto</td><td>$0</td>{results.years.map(y=><td key={y.year}>{money(y.beneficioNeto)}</td>)}</tr><tr><td>ROI</td><td>—</td>{results.years.map(y=><td key={y.year}>{num(y.roi*100)}%</td>)}</tr></tbody></table></div><div className="accum"><p>ROI acumulado 3 años <b>{num(results.roi3*100)}%</b></p><p>Beneficio neto acumulado <b>{money(results.beneficio3)}</b></p></div></section>
    <section id="lead" className="lead"><div><BarChart3 size={46}/><h2>Lleva este análisis al siguiente nivel</h2><p>Agenda una demo personalizada y descubre cómo SofiaHR puede transformar tu proceso de reclutamiento operativo.</p></div><form onSubmit={(e)=>e.preventDefault()}><input placeholder="Nombre completo"/><input placeholder="Correo corporativo"/><input placeholder="Teléfono / WhatsApp"/><input placeholder="Empresa"/><button>Quiero mi demo personalizada</button><small>Sin compromiso. Respuesta en menos de 24 horas.</small></form></section>
    <footer><b>SofiaHR</b><span>© 2026 SofiaHR. Todos los derechos reservados.</span><span>sofiahr.com</span></footer>
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
