import { isValid, parseISO, differenceInYears } from 'date-fns';

export function ageFromBirthDate(birthDate, today = new Date()) {
  if (!birthDate) return null;
  const date = parseISO(birthDate);
  if (!isValid(date) || date > today) return null;
  return differenceInYears(today, date);
}

export function matchesAgeRange(birthDate, minAge, maxAge, today = new Date()) {
  if (minAge === '' && maxAge === '') return true;
  const age = ageFromBirthDate(birthDate, today);
  if (age === null) return false;
  return (minAge === '' || age >= Number(minAge)) && (maxAge === '' || age <= Number(maxAge));
}
