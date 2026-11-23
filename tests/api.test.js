import test from 'node:test';
import assert from 'node:assert/strict';
import { createApi } from '../src/api.js';
test('GraphQL 200 con errors rechaza la operación de autenticación', async () => {
 const api=createApi('https://api.example.test',async()=>({ok:true,json:async()=>({errors:[{message:'Credenciales incorrectas',extensions:{code:'UNAUTHENTICATED'}}]})}));
 await assert.rejects(api.query('mutation { login }'),e=>e.code==='UNAUTHENTICATED');
});
test('el token solo se envía mientras la sesión está activa', async () => {
 const calls=[];const api=createApi('https://api.example.test',async(url,options)=>{calls.push(options);return {ok:true,json:async()=>({data:{me:{id:'1'}}})};});
 await api.query('{me{id}}');api.setToken('session-test');await api.query('{me{id}}');api.setToken(null);await api.query('{me{id}}');
 assert.equal(calls[0].headers.authorization,undefined);assert.equal(calls[1].headers.authorization,'Bearer session-test');assert.equal(calls[2].headers.authorization,undefined);
});
test('una caída del servicio produce un error visible y controlado',async()=>{
 const api=createApi('https://api.example.test',async()=>{throw new TypeError('Failed to fetch');});
 await assert.rejects(api.query('{listarRazas{id}}'),e=>e.code==='NETWORK');
});
test('la falta de configuración no envía peticiones a una URL accidental',async()=>{
 let called=false;const api=createApi('',async()=>{called=true;});await assert.rejects(api.query('{}'),e=>e.code==='CONFIGURATION');assert.equal(called,false);
});
test('las variables se serializan fuera del documento GraphQL',async()=>{
 let sent;const api=createApi('https://api.example.test',async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({data:{}})};});
 const name='Luna " especial';await api.query('mutation($nombre:String!){crear(nombre:$nombre)}',{nombre:name});assert.equal(sent.variables.nombre,name);assert.ok(!sent.query.includes(name));
});
