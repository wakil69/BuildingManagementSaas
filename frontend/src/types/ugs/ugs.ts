export interface UgSearch {
  ug_id: string;
  name: string;
  nature: string;
  address: string;
  surface: number;
  num_etage: number;
  surface_occupe: number;
}

export interface UgsSearch {
  ugs: UgSearch[];
  cursor: {
    next?: number;
    prev?: number;
  };
  totalCount?: number;
}

export interface CreationUg {
  name: string;
  nature_ug_id: number;
  batiment_id: number;
  num_voie: string;
  typ_voie: string;
  int_voie: string;
  complement_voie?: string | null;
  code_postal: string;
  commune: string;
  cedex?: string | null;
  pays: string;
  surface?: number | null;
  etage_id: number;
  date_construction?: string | null;
  date_entree?: string | null;
}

export interface UgInfos {
  name: string;
  nature_ug_id: number;
  batiment_id: number;
  num_voie: string;
  typ_voie: string;
  int_voie: string;
  complement_voie?: string | null;
  code_postal: string;
  commune: string;
  cedex?: string | null;
  pays: string;
  surface?: number | null;
  etage_id: number;
  date_construction?: string | null;
  date_entree?: string | null;
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
  tiepm_id: number;
  raison_sociale?: string;
  conv_id: number;
  version: number;
};


export type Locataire = {
  raison_sociale: string;
  date_debut: string;
  date_fin: string;
  conv_id: number;
  version: number;
  surface_rent: number;
};

export type NewEquipement = {
  nature_equipement_id: number;
  name: string;
  equipement_prix: number;
};

export interface UgInfosResponse {
  ugInfos: UgInfos;
  prix: Prix;
  equipements: Equipement[];
  locataires: Locataire[]
}

export interface UgFiles {
  url: string;
  filename: string;
}
[];

export interface NatureUG {
  name: string;
  nature_ug_id: number;
}

export interface NatureEquipement {
  name: string;
  nature_equipement_id: number;
}

export interface Etage {
  num_etage: number;
  etage_id: number;
}
