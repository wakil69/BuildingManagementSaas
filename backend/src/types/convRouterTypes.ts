export type UgVersion = {
  ug_id: number;
  date_fin?: string;
  surface_rent?: number;
};

export type SurfaceUg = {
  ug_id: number;
  surface: number;
};

export type PrixPepiniere = {
  prix_an_1: number;
  prix_an_2: number;
  prix_an_3: number;
};

export type PrixCentre = {
  prix_centre_affaires: number;
};

export type Rubrique = {
  ug_id?: number;
  equipement_id?: number;
  version: number;
  conv_id: number;
  update_user: string;
  montant?: number;
};
