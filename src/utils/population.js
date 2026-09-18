import { ageFromBirthDate } from './age';

export function censusYear(vigencia) {
  const match = String(vigencia || '').match(/(?:^|\D)(\d{4})$/);
  return match ? Number(match[1]) : null;
}

export function sexGroup(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'M' || normalized === 'MASCULINO') return 'hombres';
  if (normalized === 'F' || normalized === 'FEMENINO') return 'mujeres';
  return 'otro';
}

export function filterPopulation(people, group) {
  switch (group) {
    case 'hombres':
    case 'mujeres':
    case 'otro':
      return people.filter((person) => person.sexGroup === group);
    case 'menores':
      return people.filter((person) => person.age !== null && person.age < 18);
    case 'ninos':
      return people.filter((person) => person.age !== null && person.age < 18 && person.sexGroup === 'hombres');
    case 'ninas':
      return people.filter((person) => person.age !== null && person.age < 18 && person.sexGroup === 'mujeres');
    case 'mayores':
      return people.filter((person) => person.age !== null && person.age >= 60);
    case 'discapacidad':
      return people.filter((person) => person.discapacidad === 'SI');
    case 'nuevos':
      return people.filter((person) => person.isNew);
    case 'actualizados':
      return people.filter((person) => person.hasCurrentCensus);
    default:
      return people;
  }
}

export function buildPopulation(personas, familias, censos, year = new Date().getFullYear(), today = new Date()) {
  const censusByPerson = new Map();
  censos.forEach((censo) => {
    const personId = censo.persona?.id;
    if (!personId) return;
    if (!censusByPerson.has(personId)) censusByPerson.set(personId, []);
    censusByPerson.get(personId).push(censo);
  });

  const people = personas.map((persona) => {
    const records = censusByPerson.get(persona.id) || [];
    const years = records.map((censo) => censusYear(censo.vigencia));
    const hasCurrentCensus = years.includes(year);
    return {
      ...persona,
      age: ageFromBirthDate(persona.fecha_nacimiento, today),
      sexGroup: sexGroup(persona.sexo),
      hasCurrentCensus,
      isNew: hasCurrentCensus && years.every((value) => value !== null) && Math.min(...years) === year,
      currentCensusId: records.find((censo) => censusYear(censo.vigencia) === year)?.id || null,
    };
  });

  const familiesById = new Map(familias.map((familia) => [familia.id, familia]));
  const currentCensusByFamily = new Map();
  censos.forEach((censo) => {
    if (censusYear(censo.vigencia) !== year || !censo.persona?.familida_id) return;
    const familyId = censo.persona.familida_id;
    if (!currentCensusByFamily.has(familyId)) currentCensusByFamily.set(familyId, new Set());
    currentCensusByFamily.get(familyId).add(censo.persona.id);
  });

  let planned = 0;
  let completed = 0;
  let pending = 0;
  const pendingFamilyIds = [];
  familiesById.forEach((familia) => {
    const metas = (familia.metas_censo || []).filter((meta) => censusYear(meta.vigencia) === year);
    const meta = metas.find((item) => item.vigencia === String(year)) || metas[0];
    if (!meta) return;
    const censados = currentCensusByFamily.get(familia.id)?.size || 0;
    const remaining = Math.max(meta.integrantes_previstos - censados, 0);
    planned += meta.integrantes_previstos;
    completed += Math.min(censados, meta.integrantes_previstos);
    pending += remaining;
    if (remaining) pendingFamilyIds.push(familia.id);
  });

  const count = (group) => filterPopulation(people, group).length;
  const ageBands = [
    { label: '0-5', min: 0, max: 5 },
    { label: '6-17', min: 6, max: 17 },
    { label: '18-29', min: 18, max: 29 },
    { label: '30-59', min: 30, max: 59 },
    { label: '60+', min: 60, max: Infinity },
  ].map(({ label, min, max }) => ({
    label, value: people.filter((person) => person.age !== null && person.age >= min && person.age <= max).length,
  }));

  return {
    people,
    year,
    total: people.length,
    families: familias.length,
    hombres: count('hombres'),
    mujeres: count('mujeres'),
    otro: count('otro'),
    menores: count('menores'),
    ninos: count('ninos'),
    ninas: count('ninas'),
    mayores: count('mayores'),
    discapacidad: count('discapacidad'),
    discapacidadSinDato: people.filter((person) => !person.discapacidad).length,
    nuevos: count('nuevos'),
    censadosActuales: count('actualizados'),
    pending,
    pendingFamilyIds,
    completionPercent: planned ? Math.round((completed / planned) * 100) : null,
    ageBands,
  };
}
