import type { Locale } from '@cv/core';

export const labels = {
  de: {
    personal: 'Persönliche Daten',
    summary: 'Profil',
    experience: 'Berufserfahrung',
    education: 'Bildungsweg',
    skills: 'Kenntnisse',
    languages: 'Sprachen',
    projects: 'Projekte',
    certificates: 'Zertifikate',
    publications: 'Publikationen',
    awards: 'Auszeichnungen',
    volunteer: 'Ehrenamt',
    interests: 'Interessen',
    references: 'Referenzen',
    custom: 'Weitere',
    contact: 'Kontakt',
    birthDate: 'Geburtsdatum',
    birthPlace: 'Geburtsort',
    nationality: 'Nationalität',
    present: 'heute',
    level_beginner: 'Grundkenntnisse',
    level_elementary: 'Grundlegende Kenntnisse',
    level_intermediate: 'Gute Kenntnisse',
    level_upper_intermediate: 'Fortgeschritten',
    level_advanced: 'Sehr gute Kenntnisse',
    level_proficient: 'Verhandlungssicher',
    level_expert: 'Experte',
    fluency_a1: 'Grundkenntnisse',
    fluency_a2: 'Erweiterte Grundkenntnisse',
    fluency_b1: 'Gute Kenntnisse',
    fluency_b2: 'Fließend in Wort und Schrift',
    fluency_c1: 'Verhandlungssicher',
    fluency_c2: 'Annähernd muttersprachlich',
    fluency_native: 'Muttersprache',
    authorship_first: 'Erstautorschaft',
    authorship_shared_first: 'Geteilte Erstautorschaft',
    authorship_second: 'Zweitautorschaft',
    authorship_co: 'Koautorschaft',
    authorship_last: 'Letztautorschaft',
  },
  en: {
    personal: 'Personal Details',
    summary: 'About Me',
    experience: 'Work Experience',
    education: 'Education',
    skills: 'Skills',
    languages: 'Languages',
    projects: 'Projects',
    certificates: 'Certificates',
    publications: 'Publications',
    awards: 'Awards',
    volunteer: 'Volunteering',
    interests: 'Interests',
    references: 'References',
    custom: 'Other',
    contact: 'Contact',
    birthDate: 'Date of birth',
    birthPlace: 'Place of birth',
    nationality: 'Nationality',
    present: 'present',
    level_beginner: 'Basic Knowledge',
    level_elementary: 'Elementary',
    level_intermediate: 'Intermediate',
    level_upper_intermediate: 'Upper Intermediate',
    level_advanced: 'Advanced',
    level_proficient: 'Proficient',
    level_expert: 'Expert',
    fluency_a1: 'Elementary',
    fluency_a2: 'Pre-Intermediate',
    fluency_b1: 'Intermediate',
    fluency_b2: 'Upper Intermediate',
    fluency_c1: 'Advanced',
    fluency_c2: 'Near-Native',
    fluency_native: 'Native',
    authorship_first: 'First author',
    authorship_shared_first: 'Shared first author',
    authorship_second: 'Second author',
    authorship_co: 'Co-author',
    authorship_last: 'Last author',
  },
} as const satisfies Record<Locale, Record<string, string>>;

/**
 *
 */
export type LabelKey = keyof (typeof labels)['de'];

/**
 *
 * @param locale
 * @param key
 * @returns The localized label string
 */
export function getLabel(locale: Locale, key: LabelKey): string {
  return labels[locale][key];
}
