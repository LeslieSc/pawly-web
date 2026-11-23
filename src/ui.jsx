import { useEffect, useState } from 'react';
export function Button({ to, children, className = '', onClick, ...props }) {
  return <button className={className} onClick={to ? () => { location.hash = to; } : onClick} {...props}>{children}</button>;
}
export function Empty({ title, children }) { return <section className="empty"><h3>{title}</h3><p>{children}</p></section>; }
export function Field({ name, label, ...props }) { return <><label htmlFor={name}>{label}</label><input name={name} id={name} {...props} /></>; }
export function Form({ action, onError, children, label, className = '' }) {
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    try { await action(values); } catch (error) { onError(error); } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className={className}><fieldset disabled={busy}>{children}<button type="submit" className="primary">{busy ? 'Guardando…' : label}</button></fieldset></form>;
}
export function useQuery(api, query, variables, onError) {
  const key = JSON.stringify(variables || {});
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState({ data: null, error: null, loading: true });
  useEffect(() => {
    let active = true;
    setResult({ data: null, error: null, loading: true });
    api.query(query, JSON.parse(key)).then(data => {
      if (active) setResult({ data, error: null, loading: false });
    }, error => {
      if (active) { setResult({ data: null, error, loading: false }); if (error.code === 'UNAUTHENTICATED') onError(error); }
    });
    return () => { active = false; };
  }, [api, query, key, attempt, onError]);
  return { ...result, retry: () => setAttempt(x => x + 1) };
}
export function QueryState({ result, children }) {
  if (result.loading) return <p className="loading" role="status">Buscando los datos de tu cuenta…</p>;
  if (result.error) return <><Empty title="No pudimos cargar esta sección">{result.error.message}</Empty><Button className="outline" onClick={result.retry}>Intentar de nuevo</Button></>;
  return children(result.data);
}
