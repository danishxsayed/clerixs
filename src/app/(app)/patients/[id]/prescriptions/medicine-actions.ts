'use server';

import { createClient } from '@/lib/supabase/server';

// Simple prioritization helper
const matchesSpecialty = (medCategory: string | null, doctorSpecialty: string) => {
  if (!medCategory || !doctorSpecialty) return false;
  const cat = medCategory.toLowerCase();
  const spec = doctorSpecialty.toLowerCase();
  
  // Exact match or contains
  if (cat.includes(spec) || spec.includes(cat)) return true;
  
  // Common mappings
  if (spec.includes('dentist')) {
    return ['dental', 'analgesic', 'antibiotic', 'mouthwash', 'anesthetic'].some(k => cat.includes(k));
  }
  if (spec.includes('dermatologist') || spec.includes('skin') || spec.includes('cosmetic') || spec.includes('hair') || spec.includes('plastic')) {
    return ['dermatology', 'topical', 'skin', 'anti-inflammatory', 'corticosteroid', 'acne', 'cream', 'ointment'].some(k => cat.includes(k));
  }
  if (spec.includes('pediatrician') || spec.includes('child')) {
    return ['pediatric', 'syrup', 'analgesic', 'antipyretic', 'suspension'].some(k => cat.includes(k));
  }
  if (spec.includes('cardiologist') || spec.includes('heart')) {
    return ['cardiology', 'beta-blocker', 'antihypertensive', 'statin', 'heart'].some(k => cat.includes(k));
  }
  if (spec.includes('gynecologist') || spec.includes('obstetrician')) {
    return ['gynecology', 'hormone', 'contraceptive', 'obstetrics'].some(k => cat.includes(k));
  }
  if (spec.includes('ent specialist')) {
    return ['ent', 'nasal', 'ear drops', 'throat', 'antiallergic'].some(k => cat.includes(k));
  }
  if (spec.includes('ophthalmologist') || spec.includes('eye')) {
    return ['ophthalmic', 'eye', 'drops', 'eye drops'].some(k => cat.includes(k));
  }
  if (spec.includes('neurologist')) {
    return ['neurology', 'anticonvulsant', 'antidepressant', 'migraine'].some(k => cat.includes(k));
  }
  if (spec.includes('gastroenterologist') || spec.includes('stomach')) {
    return ['gastroenterology', 'antacid', 'laxative', 'proton pump inhibitor', 'antiemetic'].some(k => cat.includes(k));
  }
  if (spec.includes('pulmonologist') || spec.includes('lung')) {
    return ['pulmonology', 'inhaler', 'bronchodilator', 'cough'].some(k => cat.includes(k));
  }
  if (spec.includes('endocrinologist') || spec.includes('diabetologist')) {
    return ['diabetology', 'insulin', 'antidiabetic', 'thyroid', 'hormone'].some(k => cat.includes(k));
  }
  
  return false;
};

export async function searchMedicines(query: string) {
  const supabase = await createClient();
  
  // If query is empty, maybe return popular ones or just an empty array
  if (!query || query.trim().length < 2) {
    return { medicines: [] };
  }

  // Fetch doctor specialty
  const { data: userData } = await supabase.auth.getUser();
  let specialty = '';
  if (userData?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('specialty')
      .eq('id', userData.user.id)
      .single();
    specialty = profile?.specialty || '';
  }

  // Use ILIKE for case-insensitive partial match on generic_name
  // To make search more robust if doctors type both name and dosage (e.g., "Amox 500mg"),
  // we split by space and search across both generic_name and common_dosage.
  const terms = query.trim().split(/\s+/);
  
  let supabaseQuery = supabase
    .from('medicines')
    .select('*')
    .limit(20);

  // Apply an ILIKE for each term so that "Amox" matches generic_name and "500" matches common_dosage
  terms.forEach(term => {
    supabaseQuery = supabaseQuery.or(`generic_name.ilike.%${term}%,common_dosage.ilike.%${term}%`);
  });

  const { data, error } = await supabaseQuery;

  if (error) {
    console.error('Error searching medicines:', error);
    return { error: 'Failed to search medicines', medicines: [] };
  }

  // Sort based on specialty first
  if (data && specialty) {
    data.sort((a: any, b: any) => {
      const aMatches = matchesSpecialty(a.category, specialty);
      const bMatches = matchesSpecialty(b.category, specialty);
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
      return 0;
    });
  }

  return { medicines: data };
}

export async function addMedicine(data: {
  generic_name: string;
  common_dosage: string;
  route: string;
  category?: string;
}) {
  const supabase = await createClient();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) return { error: 'Not authenticated' };

  // Only doing a basic check, real permissions depend on RLS.
  // Insert exactly into the exact fields mentioned.
  const { data: newMed, error } = await supabase
    .from('medicines')
    .insert({
      generic_name: data.generic_name,
      common_dosage: data.common_dosage,
      route: data.route,
      category: data.category || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding medicine:', error);
    return { error: error.message || 'Failed to add medicine' };
  }

  return { success: true, medicine: newMed };
}
