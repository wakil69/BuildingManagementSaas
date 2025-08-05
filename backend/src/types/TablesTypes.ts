export interface Company {
  company_id: number;
  raison_sociale: string;
  creation_date: Date;
}

export interface User {
  user_id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: "admin" | "user" | "viewer";
  creation_date: Date;
  update_date: Date;
}

export interface UGBAT {
  batiment_id: number;
  company_id: number;
  name: string;
  is_deleted: boolean;
  creation_date: Date;
  creation_user: number;
  update_date: Date;
  update_user: number;
}

export interface UGEtage {
  etage_id: number;
  batiment_id: number;
  company_id: number;
  num_etage: number;
  creation_date: Date;
  creation_user: number;
  update_date: Date;
  update_user: number;
}

export interface UGDesc {
  ug_id: number;
  company_id: number;
  batiment_id: number;
  etage_id: number;
  name: string;
  nature?: "bureau" | "coworking" | "toilettes" | "salle" | "espace" | "local";
  date_construction?: Date;
  date_entree?: Date;
  num_voie?: string;
  typ_voie?: string;
  int_voie: string;
  complement_voie?: string;
  code_postal: string;
  commune: string;
  cedex?: string;
  pays: string;
  surface?: number;
  creation_date: Date;
  creation_user: number;
  update_date: Date;
  update_user: number;
}

export interface UGEQUIP {
  equipement_id: number;
  ug_id: number;
  nature: "clé" | "badge";
  name: string;
  equipement_prix: number;
  creation_date: Date;
  creation_user: number;
  update_date: Date;
  update_user: number;
}

export interface SurfacePrixUG {
  prix_id: number;
  batiment_id: number;
  surface?: number;
  prix_type: "pepiniere" | "centre_affaires" | "coworking";
  prix_an_1?: number;
  prix_an_2?: number;
  prix_an_3?: number;
  prix_centre_affaires?: number;
  prix_coworking?: number;
  prix_date_debut: string;
  prix_date_fin?: string;
  creation_date: Date;
  creation_user: number;
  update_date: Date;
  update_user: number;
}

export interface TIEPM {
  tiepm_id: number;
  company_id: number;
  batiment_id: number;
  raison_sociale: string;
  sigle?: string;
  date_entree?: string;
  date_sortie?: string;
  activite?: string;
  legal_form_id?: number;
  siret?: string;
  code_ape?: string;
  date_end_exercise?: string;
  tva?: string;
  capital_amount?: number;
  phone_fixed_number?: string;
  phone_number?: string;
  email?: string;
  num_voie?: string;
  typ_voie?: string;
  int_voie?: string;
  complement_voie?: string;
  code_postal?: string;
  commune?: string;
  cedex?: string;
  pays?: string;
  qpv?: boolean;
  zfu?: boolean;
}

export interface TIEPP {
  tiepp_id: number;
  company_id: number;
  batiment_id: number;
  civilite?: "Mr" | "Mme";
  surname: string;
  first_name: string;
  sex?: "M" | "F";
  birth_name?: string;
  birth_date?: string;
  nationality?: string;
  phone_fixed_number?: string;
  phone_number?: string;
  email: string;
  death_date?: string;
  image_authorisation?: "Oui" | "Non";
  num_voie?: string;
  typ_voie?: string;
  int_voie?: string;
  complement_voie?: string;
  code_postal?: string;
  commune?: string;
  cedex?: string;
  pays?: string;
  qpv?: boolean;
  zfu?: boolean;
  first_meeting_date?: string;
  first_meeting_hour_begin?: string;
  first_meeting_hour_end?: string;
  prescriber_id?: number;
  first_meeting_feedback?: string;
  situation_socio_pro_id?: string;
  study_level_id?: number;
  situation_before_prj_id?: number;
  creation_date?: string;
  creation_user: number;
  update_date?: string;
  update_user: number;
}

export interface TIEPPPRJ {
  prj_id: number;
  tiepp_id: number;
  raison_social_prj?: string;
  activite_prj: string;
  date_debut_prj?: string;
  nb_dirigeants_prj?: number;
  effectif_prj?: number;
  legal_form_id?: string;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}

export interface TIEPPACCSUIVI {
  suivi_id: number;
  tiepp_id: number;
  date_acc_suivi: string;
  typ_accompagnement_id: number;
  hour_begin: string;
  hour_end: string;
  sujet_accompagnement_id: number;
  feedback?: string;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}

export interface TIEPPACCSOUHAIT {
  souhait_id: number;
  tiepp_id: number;
  formule_wishes: string;
  surface_wishes: string;
  date_entree_wished?: string;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}

export interface TIEPMCA {
  ca_id: number;
  tiepm_id: number;
  year: number;
  ca: number;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}

export interface TIEPMEFF {
  eff_id: number;
  tiepm_id: number;
  year: number;
  nb_cdi?: number | null;
  nb_cdd?: number | null;
  nb_int?: number | null;
  nb_caid?: number | null;
  nb_alt?: number | null;
  nb_stg?: number | null;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}

export interface TIEPMPOSTPEP {
  post_pep_id: number;
  tiepm_id: number;
  actualisation_date: string;
  statut_id: number;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}

export interface TIEPMSORTIE {
  sortie_id: number;
  tiepm_id: number;
  date_sortie: string;
  motif_id: number;
  new_implantation?: string | null;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}

export interface TIEREL {
  rel_id: number;
  tiepp_id: number;
  tiepm_id: number;
  rel_typ_id?: number | null;
  relation_date_debut?: string | null;
  relation_date_fin?: string | null;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}

export interface TIEFORMPM {
  form_pm_id: number;
  tiepm_id: number;
  formule_id: number;
  date_debut_formule: string;
  date_fin_formule?: string | null;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}

export interface TIEFORMPP {
  form_pp_id: number;
  tiepp_id: number;
  formule_id: number;
  date_debut_formule: string;
  date_fin_formule?: string | null;
  creation_date: string;
  creation_user: number;
  update_date: string;
  update_user: number;
}
