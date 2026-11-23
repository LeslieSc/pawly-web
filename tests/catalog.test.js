import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createCatalogApi} from '../src/catalog.js';
test('el avance público obtiene el catálogo sin conectar a la API privada',async()=>{
 let path;const rows=[{id:'1',nombre:'Beagle'}];const api=createCatalogApi(async url=>{path=url;return{ok:true,json:async()=>rows};});assert.deepEqual((await api.query()).listarRazas,rows);assert.equal(path,'/data/razas.json');
});
test('el catálogo publicado no contiene registros de prueba ni campos de cuentas',()=>{
 const rows=JSON.parse(fs.readFileSync(new URL('../public/data/razas.json',import.meta.url)));assert.equal(rows.length,18);
 const fields=['descripcion','id','nivelEnergia','nombre','paisOrigen','tamanoPromedio'];
 for(const row of rows){assert.deepEqual(Object.keys(row).sort(),fields);assert.ok(!/Defensa|demo/i.test(row.nombre));assert.ok(row.descripcion.length>50);}
});
