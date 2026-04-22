export interface Medicine {
  name: string;
  dosage: string;
  frequency: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
  duration: string;
  instructions: string;
}

export interface PrescriptionTemplate {
  id: string;
  organization_id: string;
  created_by: string;
  name: string;
  diagnosis?: string;
  specialty?: string;
  medicines: Medicine[];
  advice: string[];
  follow_up_days: number;
  is_shared: boolean;
  is_favorite: boolean;
  usage_count: number;
  created_at: string;
}

export interface PrescriptionData {
  patient_id: string;
  patient_name: string;
  patient_age?: number;
  patient_gender?: string;
  diagnosis: string;
  medicines: Medicine[];
  advice: string[];
  follow_up_date?: string;
  template_used_id?: string;
}
