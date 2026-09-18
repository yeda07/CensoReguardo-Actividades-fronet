import assert from 'node:assert/strict';
import test from 'node:test';

import { buildPopulation, censusYear, filterPopulation } from './population.js';

test('counts people once across vigencias and tracks family goals', () => {
  const families = [
    { id: 1, metas_censo: [{ vigencia: 'DEMO-2026', integrantes_previstos: 3 }] },
    { id: 2, metas_censo: [{ vigencia: 'DEMO-2026', integrantes_previstos: 1 }] },
  ];
  const people = [
    { id: 10, familida_id: 1, fecha_nacimiento: '2018-01-01', sexo: 'M', discapacidad: 'NO' },
    { id: 11, familida_id: 1, fecha_nacimiento: '1990-01-01', sexo: 'Femenino', discapacidad: 'SI' },
  ];
  const censos = [
    { id: 1, vigencia: 'DEMO-2025', persona: people[0] },
    { id: 2, vigencia: 'DEMO-2026', persona: people[0] },
    { id: 3, vigencia: 'DEMO-2026', persona: people[0] },
    { id: 4, vigencia: 'DEMO-2026', persona: people[1] },
  ];
  const result = buildPopulation(people, families, censos, 2026, new Date('2026-09-17'));

  assert.equal(result.total, 2);
  assert.equal(result.hombres, 1);
  assert.equal(result.mujeres, 1);
  assert.equal(result.ninos, 1);
  assert.equal(result.nuevos, 1);
  assert.equal(result.censadosActuales, 2);
  assert.equal(result.discapacidad, 1);
  assert.equal(result.pending, 2);
  assert.equal(result.completionPercent, 50);
  assert.deepEqual(result.pendingFamilyIds, [1, 2]);
  assert.deepEqual(filterPopulation(result.people, 'nuevos').map((person) => person.id), [11]);
  assert.equal(censusYear('DEMO-2026'), 2026);
  assert.equal(censusYear('2026'), 2026);
});
