import { FileGlobal } from "../types";

export interface TierSearch {
  id: number;
  libelle: string;
  qualite: string;
  email?: string;
  phone_number?: string;
}

export interface TiersSearch {
  global: TierSearch[];
  cursor: {
    next?: number;
    prev?: number;
  };
  totalCount?: number;
}

export interface SituationSocioPro {
  ["Liste PCS-ESE"]: string;
  ["Liste des professions et catégories socioprofessionnelles des emplois salariés des employeurs privés et publics"]: string;
}

export interface CodeAPE {
  ["Code APE"]: string;
  [" Intitulés de la NAF"]: string;
}

export interface PPInfos {
  batiment_id: number;
  civilite?: "Mr" | "Mme" | "" | null;
  surname: string;
  first_name: string;
  birth_date?: string | null;
  birth_name?: string | null;
  email: string;
  phone_number?: string | null;
  num_voie?: string | null;
  int_voie?: string | null;
  typ_voie?: string | null;
  complement_voie?: string | null;
  code_postal?: string | null;
  commune?: string | null;
  cedex?: string | null;
  pays?: string | null;
  qpv?: "Oui" | "Non" | "" | null;
  zfu?: "Oui" | "Non" | "" | null;
  study_level_id?: number | null;
  situation_before_prj_id?: number | null;
  situation_socio_pro_id?: string | null;
  image_authorisation?: "Oui" | "Non" | "" | null;
}

export interface CreatePPPM {
  pm: Omit<CreatePM, "relations"> & {
    rel_typ_id?: number | null;
    relation_date_debut?: string | null;
    relation_date_fin?: string | null;
  };
  pp: CreatePP;
}

export interface CreatePM {
  batiment_id: number;
  raison_sociale: string;
  sigle?: string | null;
  legal_form_id?: number | null;
  secteur_activite_id?: number | null;
  activite?: string | null;
  date_creation_company?: string | null;
  email?: string | null;
  phone_number?: string | null;
  num_voie?: string | null;
  int_voie?: string | null;
  typ_voie?: string | null;
  complement_voie?: string | null;
  code_postal?: string | null;
  commune?: string | null;
  cedex?: string | null;
  pays?: string | null;
  qpv?: "Oui" | "Non" | "" | null;
  zfu?: "Oui" | "Non" | "" | null;
  siret?: string | null;
  capital_amount?: number | null;
  date_end_exercise?: string | null;
  formule_id: number;
  date_debut_formule: string;
  date_fin_formule?: string | null;
  relations: {
    tiepp_id: number;
    rel_typ_id?: number | null;
    relation_date_debut?: string | null;
    relation_date_fin?: string | null;
    libelle: string;
  }[];
}

export interface CreatePP {
  batiment_id: number;
  civilite?: "Mr" | "Mme" | "" | null;
  surname: string;
  first_name: string;
  birth_date?: string | null;
  birth_name?: string | null;
  email: string;
  phone_number?: string | null;
  num_voie?: string | null;
  int_voie?: string | null;
  typ_voie?: string | null;
  complement_voie?: string | null;
  code_postal?: string | null;
  commune?: string | null;
  cedex?: string | null;
  pays?: string | null;
  qpv?: "Oui" | "Non" | "" | null;
  zfu?: "Oui" | "Non" | "" | null;
  study_level_id?: number | null;
  situation_before_prj_id?: number | null;
  situation_socio_pro_id?: string | null;
  image_authorisation?: "Oui" | "Non" | "" | null;
  activite_prj: string;
  raison_social_prj?: string | null;
  date_debut_prj?: string | null;
  nb_dirigeants_prj?: number | null;
  effectif_prj?: number | null;
  legal_form_id?: number | null;
  first_meeting_date?: string | null;
  first_meeting_hour_begin?: string | null;
  first_meeting_hour_end?: string | null;
  prescriber_id?: number | null;
  first_meeting_feedback?: string | null;
  formule_wishes: {
    "Extra-Muros": boolean;
    Coworking: boolean;
    "Bureau Partagé": boolean;
    Bureau: boolean;
  };
  surface_wishes: Record<string, boolean>;
  date_entree_wished?: string | null;
  formule_id: number;
  date_debut_formule: string;
  date_fin_formule?: string | null;
}

export interface PMInfos {
  batiment_id: number;
  raison_sociale: string;
  sigle?: string | null;
  legal_form_id?: number | null;
  secteur_activite_id?: number | null;
  activite?: string | null;
  date_creation_company?: string | null;
  email?: string | null;
  phone_number?: string | null;
  num_voie?: string | null;
  int_voie?: string | null;
  typ_voie?: string | null;
  complement_voie?: string | null;
  code_postal?: string | null;
  commune?: string | null;
  cedex?: string | null;
  pays?: string | null;
  qpv?: "Oui" | "Non" | "" | null;
  zfu?: "Oui" | "Non" | "" | null;
  siret?: string | null;
  code_ape?: string | null;
  capital_amount?: number | null;
  date_end_exercise?: string | null;
}

export interface FormulePP {
  form_pp_id: number;
  formule_id: number;
  date_debut_formule: string;
  date_fin_formule?: string | null;
}

export interface Company {
  rel_id: number;
  tiepm_id: number;
  raison_sociale?: string | null;
  rel_typ_id?: number | null;
  relation_date_debut?: string | null;
  relation_date_fin?: string | null;
  relation_status?: "Active" | "Expiré" | null;
}

export interface AddRelationTypePP {
  tiepm_id: number;
  rel_typ_id?: number | null;
  relation_date_debut?: string | null;
  relation_date_fin?: string | null;
}

export interface AddRelationTypePM {
  tiepp_id: number;
  rel_typ_id?: number | null;
  relation_date_debut?: string | null;
  relation_date_fin?: string | null;
}

export interface EditRelation {
  rel_typ_id?: number | null;
  relation_date_debut?: string | null;
  relation_date_fin?: string | null;
}

export interface AccompagnementSouhait {
  souhait_id: number;
  formule_wishes: Record<
    "Bureau" | "Bureau Partagé" | "Extra-Muros" | "Coworking",
    boolean
  >;
  surface_wishes: Record<string, boolean>;
  date_entree_wished?: string | null;
}

export interface Projet {
  prj_id: number;
  raison_social_prj?: string | null;
  activite_prj: string;
  date_debut_prj?: string | null;
  nb_dirigeants_prj?: number | null;
  effectif_prj?: number | null;
  legal_form_id?: number | null;
}

export interface AddProjetType {
  raison_social_prj?: string | null;
  activite_prj: string;
  date_debut_prj?: string | null;
  nb_dirigeants_prj?: number | null;
  effectif_prj?: number | null;
  legal_form_id?: number | null;
}

export interface FirstMeeting {
  first_meeting_date?: string | null;
  first_meeting_hour_begin?: string | null;
  first_meeting_hour_end?: string | null;
  prescriber_id?: number | null;
  first_meeting_feedback?: string | null;
}

export interface PPResponse {
  infosPP: PPInfos;
  projets: Projet[];
  accompagnementSouhait: AccompagnementSouhait;
  formulesPP: FormulePP[];
  firstMeeting: FirstMeeting;
  companies: Company[];
}

export interface FormulePM {
  form_pm_id: number;
  formule_id: number;
  date_debut_formule: string;
  date_fin_formule?: string | null;
}

export interface AddFormuleType {
  formule_id: number;
  date_debut_formule: string;
  date_fin_formule?: string | null;
}

export interface EditFormuleType {
  formule_id: number;
  date_debut_formule: string;
  date_fin_formule?: string | null;
}

export interface Dirigeant {
  rel_id: number;
  tiepp_id: number;
  libelle?: string | null;
  rel_typ_id?: number | null;
  relation_date_debut?: string | null;
  relation_date_fin?: string | null;
  relation_status?: "Active" | "Expiré" | null;
}

export type AddDirigeantType = Omit<Dirigeant, "rel_id">;

export interface SortiePepiniere {
  date_sortie: string;
  motif_id: number;
  new_implantation?: string | null;
}

export interface PostPepiniere {
  actualisation_date: string;
  statut_id: string;
}

export interface Effectif {
  year: number;
  nb_cdi?: number | null;
  nb_cdd?: number | null;
  nb_int?: number | null;
  nb_caid?: number | null;
  nb_alt?: number | null;
  nb_stg?: number | null;
}

export interface ChiffreAffaire {
  year: number;
  ca: number;
}

export interface PMResponse {
  infosPM: PMInfos;
  dirigeants: Dirigeant[];
  effectifs: Effectif[];
  formulesPM: FormulePM[];
  cas: ChiffreAffaire[];
  sortiePep: SortiePepiniere;
  postPep: PostPepiniere;
}

export interface Suivi {
  suivi_id: number;
  date_acc_suivi: string;
  typ_accompagnement_id: number;
  hour_begin: string;
  hour_end: string;
  sujet_accompagnement_id: number;
  feedback?: string | null;
  files: FileGlobal[];
}

export interface AddSuiviType {
  date_acc_suivi: string;
  typ_accompagnement_id: number;
  hour_begin: string;
  hour_end: string;
  sujet_accompagnement_id: number;
  feedback?: string | null;
}

export interface UpdateSuiviType {
  date_acc_suivi: string;
  typ_accompagnement_id: number;
  hour_begin: string;
  hour_end: string;
  sujet_accompagnement_id: number;
  feedback?: string | null;
}
