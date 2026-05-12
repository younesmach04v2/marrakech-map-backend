export interface PropertyDto {
  id: string;
  type: string;
  title: string;
  lat: number;
  lng: number;
  price: number | null;
  initialPrice: number | null;
  owned: boolean;
  sold: boolean;
  surface: number | null;
  rooms: number | null;
  desc: string;
  zones: string[];
}
