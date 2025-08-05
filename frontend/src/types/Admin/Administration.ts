export interface SurfacePrixUG {
  prix_id: number;
  batiment_id: number;
  surface?: number;
  prix_type: string;
  prix_an_1?: number;
  prix_an_2?: number;
  prix_an_3?: number;
  prix_centre_affaires?: number;
  prix_coworking?: number;
  prix_date_debut: string;
  prix_date_fin?: string;
}

export type SurfacePrixUGWithoutDates = Omit<
  SurfacePrixUG,
  "prix_date_debut" | "prix_date_fin"
>;

export interface newSurfacePrixUG {
  surface?: number;
  prix_an_1?: number;
  prix_an_2?: number;
  prix_an_3?: number;
  prix_centre_affaires?: number;
  prix_coworking?: number;
}

export interface AccountType {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: "admin" | "user";
}

export interface SurfacePrixUpdateBody {
  prix: SurfacePrixUGWithoutDates[];
  prix_date_debut: SurfacePrixUG[];
  prix_date_fin?: SurfacePrixUG[];
  prix_type: string;
}

export interface PrixResponse {
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

export interface Batiment {
  name: string;
  batiment_id: number;
}

export interface StudyLevel {
  name: string;
  study_level_id: number;
}

export interface SecteurActivite {
  name: string;
  secteur_activite_id: number;
}

export interface SituationAvPrj {
  name: string;
  situation_before_prj_id: number;
}

export interface LegalForm {
  name: string;
  legal_form_id: number;
}

export interface Prescriber {
  name: string;
  prescriber_id: number;
}

export interface TypeAccompagnement {
  name: string;
  typ_accompagnement_id: number;
}

export interface SujetAccompagnement {
  name: string;
  typ_accompagnement_id: number;
}

export interface SujetAccompagnement {
  name: string;
  sujet_accompagnement_id: number;
}

export interface MotifSortiePepiniere {
  name: string;
  motif_id: number;
}

export interface StatutPostPepineire {
  name: string;
  statut_id: number;
}

export interface RelationPMPP {
  name: string;
  rel_typ_id: number;
}

export interface Formule {
  name: string;
  formule_id: number;
}

export interface HistoriqueSurfacePrix {
  prix_type: string;
  prix_date_debut: string;
  prix_date_fin: string | null;
  prix: {
    prix_id: number;
    surface: number;
    batiment_id: number;
    prix_an_1?: number | null;
    prix_an_2?: number | null;
    prix_an_3?: number | null;
    prix_centre_affaires?: number | null;
    prix_coworking?: number | null;
  }[];
}

export interface HistoriqueSurfacePrixResponse {
  historique?: HistoriqueSurfacePrix[];
  cursor?: number;
}

export interface ActionCollective {
  sujet_accompagnement_id: number;
  typ_accompagnement_id: number;
  date_acc_suivi: string;
  hour_begin: string;
  hour_end: string;
  feedback?: string | null;
  attendants: {
    suivi_id?: number;
    tiepp_id: number;
    libelle: string;
    statut?: "added" | "removed";
  }[];
}
