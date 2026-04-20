export interface Report {
  id: number;
  ngo_id: string;
  month: string;
  people_helped: number;
  events_conducted: number;
  funds_utilized: number;
  created_at: string;
}

export interface JobStatus {
  id: string;
  status: 'pending' | 'processing' | 'done';
  total: number;
  processed: number;
  failed: number;
  errors: { row: number; reason: string }[];
}

export interface DashboardData {
  total_ngos: string;
  total_people_helped: string;
  total_events: string;
  total_funds: string;
  available_regions: string[];
}
