import { Component, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { createApi } from './api.js';
import { createCatalogApi } from './catalog.js';
import { Button, Empty, Field, Form } from './ui.jsx';
import { Breeds, Care, NewPet, Pets, Profile, Users } from './views.jsx';
const readRoute = () => location.hash.slice(1) || 'inicio';
const publicRoutes = ['inicio', 'razas', 'login', 'registro'];
const specialRoutes = ['nueva-mascota', 'detalle', 'nueva-actividad'];
class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <main><Empty title="No pudimos mostrar esta pantalla">Recarga Pawly para volver a intentarlo.</Empty><Button onClick={() => location.reload()}>Recargar</Button></main> : this.props.children; }
}
function Home({ user, preview }) {
  return <><section className="hero"><div><p className="eyebrow">Su bienestar empieza contigo</p><h1>Pequeños cuidados.<br />Grandes momentos.</h1><p>Un lugar para conocer mejor a tu mascota, acompañar su actividad y tener a mano sus cuidados.</p><div className="hero-actions"><Button to={preview ? 'razas' : user ? 'MASCOTAS' : 'registro'} className="primary">{preview ? 'Explorar el catálogo' : user ? 'Ver mis mascotas' : 'Empezar juntos'}</Button><Button to="razas" className="outline">Conocer las razas</Button></div><span className="muted">Cada mascota tiene su propia historia.</span></div><div className="hero-visual"><img src="/assets/dog-hero.png" alt="Un golden retriever disfrutando de un día tranquilo" /><div className="tag">Más tiempo juntos. Mejor cuidado.</div></div></section><section className="features" aria-label="Lo que puedes hacer">{[['Su propio espacio','Guarda el perfil de tus mascotas y sus datos importantes.'],['Un día más activo','Registra sus paseos, pasos y momentos de actividad.'],['Cuidados al día','Consulta su historial médico, vacunas y próximas citas.']].map(([title, text],i) => <article key={title} className="card"><span className="feature-number">0{i+1}</span><h3>{title}</h3><p className="muted">{text}</p></article>)}</section></>;
}
function Auth({ signup, api, onLogin, onError }) {
  const [registered, setRegistered] = useState(false);
  async function authenticate(values) {
    if (signup && !registered) {
      await api.query('mutation($input:CrearUsuarioInput!){crearUsuario(input:$input){id}}', { input: { nombre: values.nombre.trim(), correo: values.correo.trim().toLowerCase(), password: values.password } });
      setRegistered(true);
    }
    const { login } = await api.query('mutation($correo:String!,$password:String!){login(correo:$correo,password:$password){token usuario{id nombre correo}}}', { correo: values.correo.trim().toLowerCase(), password: values.password });
    api.setToken(login.token);
    try { const { miMenu } = await api.query('{miMenu{id title parentId order path}}'); onLogin(login.usuario, miMenu); }
    catch (error) { api.setToken(null); throw error; }
  }
  return <section className="auth"><div className="card"><p className="eyebrow">{signup ? 'Un nuevo comienzo' : 'Qué gusto verte'}</p><h1>{signup ? 'Tu familia, en Pawly.' : 'Volvamos a cuidarlos.'}</h1><p className="muted">{registered ? 'Tu cuenta está creada. Inicia sesión para continuar.' : signup ? 'Crea tu cuenta para añadir a tus mascotas.' : 'Entra a tu cuenta y continúa donde te quedaste.'}</p><Form action={authenticate} onError={onError} label={signup && !registered ? 'Crear mi cuenta' : 'Iniciar sesión'}>{signup && <Field name="nombre" label="Tu nombre" required maxLength={100} autoComplete="name" />}<Field name="correo" label="Correo electrónico" type="email" required autoComplete="username" /><Field name="password" label="Contraseña" type="password" required minLength={signup ? 8 : 1} maxLength={128} autoComplete={signup ? 'new-password' : 'current-password'} /></Form><p className="muted" style={{marginTop:22}}>{signup ? <>¿Ya tienes cuenta? <a href="#login">Inicia sesión</a></> : <>¿Primera vez? <a href="#registro">Crea tu cuenta</a></>}</p></div></section>;
}
function Pawly() {
  const preview = import.meta.env.VITE_PREVIEW === 'true';
  const api = useMemo(() => createApi(import.meta.env.VITE_API_URL?.trim()), []);
  const catalog = useMemo(() => createCatalogApi(), []);
  const [page, setPage] = useState(readRoute);
  const [session, setSession] = useState(null);
  const [petId, setPetId] = useState(null);
  const [status, setStatus] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const reset = useCallback(() => { api.setToken(null); setSession(null); setPetId(null); }, [api]);
  const onError = useCallback(error => {
    if (error.code === 'UNAUTHENTICATED') { reset(); location.hash = 'login'; setStatus('Tu sesión terminó. Vuelve a iniciar sesión.'); }
    else setStatus(error.message);
  }, [reset]);
  useEffect(() => { const change = () => { setPage(readRoute()); setStatus(''); window.scrollTo(0,0); }; window.addEventListener('hashchange',change); return () => window.removeEventListener('hashchange',change); }, []);
  useEffect(() => { if (!publicRoutes.includes(page) && !session) location.hash = 'login'; }, [page, session]);
  async function logout() {
    setSigningOut(true);
    try { await api.query('mutation{logout}'); reset(); location.hash='inicio'; }
    catch(error) { onError(error); }
    finally { setSigningOut(false); }
  }
  const shared = { api, onError };
  let content;
  if (page === 'inicio') content=<Home user={session?.user} preview={preview} />;
  else if (preview && page !== 'razas') content=<Empty title="Próximamente en Pawly">El acceso a cuentas y los cuidados de tus mascotas están en construcción. Mientras tanto, explora nuestro catálogo de razas.</Empty>;
  else if (page === 'login' || page === 'registro') content=<Auth key={page} {...shared} signup={page==='registro'} onLogin={(user,menu)=>{setSession({user,menu});setStatus('');location.hash='MASCOTAS';}} />;
  else if (page === 'razas') content=<Breeds {...shared} api={preview ? catalog : api} />;
  else if (!session) content=<p className="loading">Abriendo el inicio de sesión…</p>;
  else if (!specialRoutes.includes(page) && !session.menu.some(x=>x.id===page)) content=<Empty title="Esta sección no está disponible">Vuelve a una de las opciones de tu cuenta.</Empty>;
  else if (page === 'PERFIL') content=<Profile {...shared} />;
  else if (page === 'MASCOTAS') content=<Pets {...shared} user={session.user} selectPet={id=>{setPetId(id);location.hash='detalle';}} />;
  else if (page === 'nueva-mascota') content=<NewPet {...shared} user={session.user} />;
  else if (page === 'USUARIOS') content=<Users {...shared} />;
  else if (['ACTIVIDAD','HISTORIAL','CITAS','detalle','nueva-actividad'].includes(page)) content=<Care {...shared} page={page} petId={petId} setPetId={setPetId} />;
  else content=<Empty title="Esta sección no está disponible">Elige otra opción de tu cuenta.</Empty>;
  const workspace = session && !['inicio','login','registro'].includes(page);
  return <><header><a className="logo" href="#inicio" aria-label="Pawly inicio"><img src="/assets/pawly-mark.png" alt="" />pawly</a><nav aria-label="Navegación principal"><Button to="razas" className="quiet">Explorar razas</Button>{preview ? <Button to="inicio" className="quiet">Conoce Pawly</Button> : session ? <><Button to="MASCOTAS" className="quiet">Mis mascotas</Button><Button onClick={logout} className="outline" disabled={signingOut}>Salir</Button></> : <><Button to="login" className="quiet">Entrar</Button><Button to="registro" className="primary">Crear cuenta</Button></>}</nav></header><div className="status" role="status" aria-live="polite">{status}</div><main>{preview && <p className="notice">Avance de Pawly · El catálogo ya está disponible. Las funciones de cuenta y cuidado se incorporarán en una próxima etapa.</p>}{workspace ? <div className="workspace"><aside className="sidebar" aria-label="Opciones de tu cuenta">{session.menu.filter(x=>!x.parentId).sort((a,b)=>a.order-b.order).map(group=><Fragment key={group.id}><small>{group.title}</small>{session.menu.filter(x=>x.parentId===group.id).sort((a,b)=>a.order-b.order).map(item=><Button key={item.id} to={item.id} className={page===item.id?'primary':'quiet'} aria-current={page===item.id?'page':undefined}>{item.title}</Button>)}</Fragment>)}</aside><div key={page}>{content}</div></div> : content}</main><footer><span>Pawly · Más momentos juntos.</span><span>Cuidado, actividad y compañía en un solo lugar.</span></footer></>;
}
export default function App() { return <ErrorBoundary><Pawly /></ErrorBoundary>; }
