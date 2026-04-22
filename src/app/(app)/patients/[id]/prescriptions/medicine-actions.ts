'use server';

import { createClient } from '@/lib/supabase/server';

export async function searchMedicines(query: string) {
  const supabase = await createClient();
  
  // If query is empty, maybe return popular ones or just an empty array
  if (!query || query.trim().length < 2) {
    return { medicines: [] };
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
