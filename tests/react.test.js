import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
let server;
before(async () => {
  server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
});
after(async () => { await server?.close(); });
test('React renderiza el árbol completo del inicio sin depender de innerHTML', async () => {
  const { default: App } = await server.ssrLoadModule('/src/App.jsx');
  const saved = globalThis.location;
  globalThis.location = { hash: '#inicio' };
  try {
    const html = renderToStaticMarkup(createElement(App));
    assert.ok(html.includes('Pequeños cuidados.'));
    assert.ok(html.includes('Crear cuenta'));
    assert.ok(html.includes('dog-hero.png'));
    assert.ok(html.includes('aria-label="Navegación principal"'));
  } finally { globalThis.location = saved; }
});
test('los componentes React escapan texto y conservan etiquetas accesibles', async () => {
  const { Empty, Field } = await server.ssrLoadModule('/src/ui.jsx');
  const html = renderToStaticMarkup(createElement(Empty, { title: '<script>alert(1)</script>' }, 'Sin registros'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes('&lt;script&gt;'));
  const field = renderToStaticMarkup(createElement(Field,{ name: 'nombre', label: 'Nombre', required: true }));
  assert.ok(field.includes('for="nombre"'));
  assert.ok(field.includes('id="nombre"'));
});
