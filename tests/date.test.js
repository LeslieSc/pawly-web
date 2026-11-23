import test from 'node:test';
import assert from 'node:assert/strict';
import { displayDate } from '../src/date.js';
test('una fecha guardada a medianoche UTC conserva el día en Chihuahua',()=>{
 assert.equal(displayDate('2023-05-10T00:00:00.000Z'),'10/5/2023');
 assert.equal(displayDate(String(Date.UTC(2026,10,23))),'23/11/2026');
});
test('fechas no registradas no muestran Invalid Date',()=>{
 assert.equal(displayDate(null),'Sin fecha');assert.equal(displayDate('fecha incorrecta'),'Sin fecha');
});
