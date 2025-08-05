import { SurfacePrixUG } from "./TablesTypes";

export interface ErrorResponse {
  message: string;
}

export type SurfacePrixUGWithoutDates = Omit<SurfacePrixUG, 'prix_date_debut' | 'prix_date_fin'>;

export type SurfacePrixUGWithoutDatesAndId = Omit<SurfacePrixUG, 'prix_date_debut' | 'prix_date_fin' | "prix_id">;

export interface SurfacePrixResponse {
  pepiniere: {
    prix: SurfacePrixUGWithoutDates[];
    prix_date_debut: string;
    prix_date_fin?: string;
  };
  centre_affaires: {
    prix: SurfacePrixUGWithoutDates[];
    prix_date_debut: string;
    prix_date_fin?: string;
  };
  coworking: {
    prix: SurfacePrixUGWithoutDates[];
    prix_date_debut: string;
    prix_date_fin?: string;
  };
}

export interface SurfacePrixUpdateBody {
  prix: SurfacePrixUG[];
  prix_date_debut: SurfacePrixUG[];
  prix_date_fin?: SurfacePrixUG[];
  prix_type: "pepiniere" | "centre_affaires" | "coworking";
}

export interface HistoriqueSurfacePrixResponseItem {
  prix_type: string;
  prix_date_debut: string;
  prix_date_fin?: string;
  prix: SurfacePrixUG[];
}

export interface Batiment {
  name: string;
  batiment_id: number;
}

export interface Surface {
  surface: number;
}

export type BatimentsResponse = Batiment[];
export type SurfacesResponse = Surface[];