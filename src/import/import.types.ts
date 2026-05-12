export interface ImportedProperty {
  id: string;
  type: string;
  title: string;
  lat: number;
  lng: number;
  price: number | null;
  initialPrice?: number | null;
  owned?: boolean;
  sold?: boolean;
  surface: number | null;
  rooms: number | null;
  desc?: string;
  zones?: string[];
}

export interface LocalStorageImportPayload {
  source?: string;
  timelineYear?: number | null;
  properties?: ImportedProperty[];
  propertiesByYear?: Record<string, ImportedProperty[]>;
  userZones?: unknown[];
  customPlaces?: unknown[];
  customDots?: unknown[];
}
