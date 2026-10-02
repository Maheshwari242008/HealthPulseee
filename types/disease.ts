export type DiseaseName =
  | 'dengue'
  | 'malaria'
  | 'chikungunya'
  | 'typhoid'
  | 'cholera'
  | 'diarrhoea';

export interface Disease {
  id: number;
  name: DiseaseName | string;
  severity: number; // 0 < severity <= 1.5
  symptoms: string | null;
  precautions: string | null; // steps separated by new lines
  when_to_seek_care: string | null;
}
