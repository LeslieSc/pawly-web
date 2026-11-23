import { useState } from 'react';
import { displayDate } from './date.js';
import { Button, Empty, Field, Form, QueryState, useQuery } from './ui.jsx';
const petFields = 'id nombre razaId sexo peso tamano fechaNacimiento color metaPasos';
const today = () => new Date().toISOString().slice(0,10);
export function Breeds({ api, onError }) {
  const result=useQuery(api,'{listarRazas{id nombre tamanoPromedio descripcion nivelEnergia paisOrigen}}',{},onError);
  const [search,setSearch]=useState('');
  return <><p className="eyebrow">Conoce su mundo</p><div className="toolbar"><h1>Una raza, muchas historias.</h1></div><p className="muted">Explora el catálogo y descubre lo que los hace únicos.</p><label htmlFor="search">Buscar una raza</label><input className="search" id="search" type="search" placeholder="Escribe su nombre" value={search} onChange={event=>setSearch(event.target.value)} /><QueryState result={result}>{({listarRazas})=>{
    const rows=listarRazas.filter(b=>b.nombre.toLocaleLowerCase('es').includes(search.toLocaleLowerCase('es')));
    return rows.length ? <div className="grid">{rows.map(b=><article className="card" key={b.id}><span className="pill">{b.tamanoPromedio}</span><h3 style={{marginTop:18}}>{b.nombre}</h3><p className="muted">{b.descripcion || 'Cada perro tiene su propia personalidad. Conoce sus necesidades con ayuda de tu veterinario.'}</p><p><small>Energía: {b.nivelEnergia}{b.paisOrigen && ` · ${b.paisOrigen}`}</small></p></article>)}</div> : <Empty title="Sin resultados">Prueba con otro nombre.</Empty>;
  }}</QueryState></>;
}
export function Profile({ api, onError }) {
  const result=useQuery(api,'{me{id nombre correo ciudad telefono estado}}',{},onError);
  return <QueryState result={result}>{({me})=><><p className="eyebrow">Mi cuenta</p><div className="toolbar"><h1>Hola, {me.nombre}.</h1></div><section className="card"><h2>Tu perfil</h2><p>Correo: {me.correo}</p><p>Ciudad: {me.ciudad || 'Sin registrar'}</p><p>Teléfono: {me.telefono || 'Sin registrar'}</p><span className="pill">{me.estado}</span></section></>}</QueryState>;
}
export function Pets({ api, onError, user, selectPet }) {
  const result=useQuery(api,`{listarPerros{${petFields}}}`,{},onError);
  return <><p className="eyebrow">Tu familia Pawly</p><div className="toolbar"><h1>Hola, {user.nombre.split(' ')[0]}.</h1><Button to="nueva-mascota" className="primary">+ Añadir mascota</Button></div><p className="muted">Cada día juntos cuenta. Aquí están tus compañeros de aventuras.</p><QueryState result={result}>{({listarPerros})=>listarPerros.length ? <div className="grid">{listarPerros.map(p=><article className="card" key={p.id}><div className="pet-avatar" aria-hidden="true">🐾</div><h2>{p.nombre}</h2><p className="muted">{p.tamano} · {p.peso} kg</p><p>Nació el {displayDate(p.fechaNacimiento)}</p><Button className="outline" onClick={()=>selectPet(p.id)}>Ver sus cuidados →</Button></article>)}</div> : <Empty title="Su historia empieza aquí">Añade tu primera mascota para llevar sus cuidados contigo.</Empty>}</QueryState></>;
}
export function NewPet({ api, onError, user }) {
  const result=useQuery(api,'{listarRazas{id nombre}}',{},onError);
  async function save(values) {
    await api.query('mutation($input:CrearPerroInput!){crearPerro(input:$input){id nombre}}',{input:{...values,nombre:values.nombre.trim(),usuarioId:user.id,peso:Number(values.peso)}});
    location.hash='MASCOTAS';
  }
  return <><Button to="MASCOTAS" className="quiet back">← Mis mascotas</Button><h2>Un nuevo compañero</h2><p className="muted">Cuéntanos un poco sobre tu mascota.</p><QueryState result={result}>{({listarRazas})=>!listarRazas.length ? <Empty title="El catálogo aún no tiene razas">Vuelve cuando se haya registrado una raza en el catálogo.</Empty> : <Form action={save} onError={onError} label="Guardar mascota" className="card form-panel"><Field name="nombre" label="Nombre" required maxLength={80} /><label htmlFor="razaId">Raza</label><select name="razaId" id="razaId">{listarRazas.map(b=><option key={b.id} value={b.id}>{b.nombre}</option>)}</select><div className="split"><div><label htmlFor="sexo">Sexo</label><select id="sexo" name="sexo"><option value="MACHO">Macho</option><option value="HEMBRA">Hembra</option></select></div><div><label htmlFor="tamano">Tamaño</label><select id="tamano" name="tamano"><option>PEQUEÑO</option><option>MEDIANO</option><option>GRANDE</option></select></div></div><div className="split"><div><Field name="fechaNacimiento" label="Fecha de nacimiento" type="date" required max={today()} /></div><div><Field name="peso" label="Peso en kg" type="number" required min="0.1" step="0.1" /></div></div><Field name="color" label="Color" maxLength={100} /></Form>}</QueryState></>;
}
export function Care({api,onError,page,petId,setPetId}) {
  const result=useQuery(api,`{listarPerros{${petFields} cartilla{vacunas{nombre fechaAplicacion estado}}}}`,{},onError);
  return <QueryState result={result}>{({listarPerros})=>{
    const pet=listarPerros.find(p=>p.id===petId) || listarPerros[0];
    if(!pet) return <><h2>Primero, su perfil</h2><Empty title="Añade a tu mascota">Después podrás consultar sus cuidados y registrar su actividad.</Empty><Button to="nueva-mascota" className="primary">Añadir mascota</Button></>;
    return <><div className="toolbar"><h2>{pet.nombre} y sus cuidados</h2></div><label htmlFor="pet-select">Tu mascota</label><select id="pet-select" value={pet.id} onChange={event=>setPetId(event.target.value)}>{listarPerros.map(p=><option key={p.id} value={p.id}>{p.nombre}</option>)}</select><div style={{marginTop:24}}><PetCare key={`${page}:${pet.id}`} api={api} onError={onError} page={page} pet={pet} /></div></>;
  }}</QueryState>;
}
function PetCare({api,onError,page,pet}) {
  if(page==='nueva-actividad') return <NewActivity api={api} onError={onError} pet={pet} />;
  if(page==='detalle') return <div className="card"><span className="pill">{pet.sexo}</span><h2 style={{marginTop:20}}>Pequeños detalles sobre {pet.nombre}</h2><p>{pet.peso} kg · {pet.tamano} · {pet.color || 'Color sin registrar'}</p><p>Nacimiento: {displayDate(pet.fechaNacimiento)}</p><div className="hero-actions"><Button to="ACTIVIDAD" className="primary">Ver actividad</Button><Button to="HISTORIAL" className="outline">Historial y vacunas</Button><Button to="CITAS" className="outline">Citas</Button></div></div>;
  if(page==='ACTIVIDAD') return <Activity api={api} onError={onError} pet={pet} />;
  if(page==='HISTORIAL') return <Health api={api} onError={onError} pet={pet} />;
  return <Appointments api={api} onError={onError} pet={pet} />;
}
function NewActivity({api,onError,pet}) {
  async function save(values) {
    await api.query('mutation($input:RegistrarActividadInput!){registrarActividad(input:$input){id pasos}}',{input:{perroId:pet.id,fecha:values.fecha,pasos:Number(values.pasos),distancia:Number(values.distancia),tiempoActividad:Number(values.tiempoActividad)}});location.hash='ACTIVIDAD';
  }
  return <><Button to="ACTIVIDAD" className="quiet">← Actividad</Button><h2 style={{marginTop:20}}>Un paseo para recordar</h2><Form action={save} onError={onError} label="Guardar actividad" className="card form-panel"><Field name="fecha" label="Fecha" type="date" required defaultValue={today()} max={today()} /><div className="split"><div><Field name="pasos" label="Pasos" type="number" required min="0" step="1" /></div><div><Field name="distancia" label="Distancia en km" type="number" required min="0" step="0.01" /></div></div><Field name="tiempoActividad" label="Duración en minutos" type="number" required min="0" step="1" /></Form></>;
}
function Activity({api,onError,pet}) {
  const result=useQuery(api,'query($perroId:ID!){listarActividadPorPerro(perroId:$perroId){id fecha pasos distancia tiempoActividad metaCumplida}}',{perroId:pet.id},onError);
  return <><div className="toolbar"><h2>Sus momentos en movimiento</h2><Button to="nueva-actividad" className="primary">+ Registrar actividad</Button></div><QueryState result={result}>{({listarActividadPorPerro:rows})=>rows.length ? <section className="card">{rows.map(r=><article className="record" key={r.id}><h3>{displayDate(r.fecha)}</h3><p>{r.pasos} pasos · {r.distancia} km · {r.tiempoActividad} min</p>{r.metaCumplida && <span className="pill">Meta cumplida</span>}</article>)}</section> : <Empty title="Todavía no hay paseos guardados">Registra su próxima actividad y empieza a conocer su ritmo.</Empty>}</QueryState></>;
}
function Health({api,onError,pet}) {
  const result=useQuery(api,'query($perroId:ID!){listarRegistrosMedicos(perroId:$perroId){id tipoRegistro descripcion fechaRegistro diagnostico tratamiento}}',{perroId:pet.id},onError);
  const vaccines=pet.cartilla?.vacunas || [];
  return <><h2>Su salud, a mano</h2><section className="card"><h3>Historial médico</h3><QueryState result={result}>{({listarRegistrosMedicos:rows})=>rows.length ? rows.map(r=><article className="record" key={r.id}><strong>{r.tipoRegistro} · {displayDate(r.fechaRegistro)}</strong><p>{r.descripcion}</p>{r.diagnostico && <p>Diagnóstico: {r.diagnostico}</p>}{r.tratamiento && <p>Tratamiento: {r.tratamiento}</p>}</article>) : <p className="muted">No hay registros médicos para esta mascota.</p>}</QueryState></section><section className="card" style={{marginTop:20}}><h3>Vacunas</h3>{vaccines.length ? vaccines.map((v,i)=><article className="record" key={`${v.nombre}:${i}`}><strong>{v.nombre}</strong><p>{displayDate(v.fechaAplicacion)} · {v.estado}</p></article>) : <p className="muted">No hay vacunas registradas.</p>}</section></>;
}
function Appointments({api,onError,pet}) {
  const result=useQuery(api,'query($perroId:ID!){listarCitasPorPerro(perroId:$perroId){id fechaHora motivo estado notas}}',{perroId:pet.id},onError);
  return <><h2>Una cita con su bienestar</h2><QueryState result={result}>{({listarCitasPorPerro:rows})=>rows.length ? <section className="card">{rows.map(r=><article className="record" key={r.id}><h3>{r.motivo}</h3><p>{displayDate(r.fechaHora)} · {r.estado}</p><p className="muted">{r.notas}</p></article>)}</section> : <Empty title="Sin citas por ahora">Aquí aparecerán las citas registradas para tu mascota.</Empty>}</QueryState></>;
}
export function Users({api,onError}) {
  const result=useQuery(api,'{listarUsuarios{id nombre correo estado}}',{},onError);
  return <><p className="eyebrow">Administración</p><h2>Usuarios de Pawly</h2><QueryState result={result}>{({listarUsuarios:rows})=><section className="card">{rows.map(u=><article className="record" key={u.id}><h3>{u.nombre}</h3><p>{u.correo}</p><span className="pill">{u.estado}</span></article>)}</section>}</QueryState></>;
}
