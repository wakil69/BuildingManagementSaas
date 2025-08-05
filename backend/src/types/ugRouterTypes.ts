import { Request } from "express";

export interface UgsSearch {
  ugId: string;
  name: string;
  nature: string;
  address: string;
  surface: number;
  num_etage: number;
  surface_occupe: number;
}

export interface UgInfos {
  ug_id: string;
  name: string;
  nature: string;
  batiment_name: string;
  num_voie: string;
  typ_voie: string;
  int_voie: string;
  complement_voie: string;
  code_postal: string;
  commune: string;
  cedex?: string;
  pays: string;
  surface: number;
  etage_id?: string;
  date_construction: string;
  date_entree: string;
}

export type Prix = {
  prix_an_1?: number;
  prix_an_2?: number;
  prix_an_3?: number;
  prix_centre_affaires?: number;
};

export type Equipement = {
  type: string;
  name: string;
  equipement_prix: number;
  equipement_id: number;
};

export type UgInfosResponse = {
  ugInfos: UgInfos;
  prix: Prix;
  equipements: Equipement[];
};

export interface MulterRequest extends Request {
  files?: Express.Multer.File[];
}
