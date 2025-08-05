export interface PPResponse {
  infosPP: {
    batiment_id: number;
    civilite: string;
    surname: string;
    first_name: string;
    birth_date?: string | null;
    birth_name?: string | null;
    email: string;
    phone_number?: string | null;
    num_voie?: string | null;
    typ_voie?: string | null;
    complement_voie?: string | null;
    code_postal?: string | null;
    commune?: string | null;
    cedex?: string | null;
    pays?: string | null;
    qpv?: boolean | null;
    zfu?: boolean | null;
    study_level_id: number;
    situation_before_prj_id: number;
    situation_socio_pro_id: string;
    image_authorisation?: string | null;
  };
  projets: {
    prj_id: number;
    raison_social_prj?: string | null;
    activite_prj: string;
    date_debut_prj: string;
    nb_dirigeants_prj: number;
    effectif_prj: number;
    legal_form_id: number;
  }[];
  accompagnementSouhait: {
    souhait_id: number;
    formule_wishes: string;
    surface_wishes: string;
    date_entree_wished?: string | null;
  };
  formulesPP: {
    form_pp_id: number;
    formule_id: string;
    date_debut_formule: string;
    date_fin_formule?: string | null;
  }[];
  firstMeeting: {
    first_meeting_date?: string | null;
    first_meeting_hour_begin?: string | null;
    first_meeting_hour_end?: string | null;
    prescriber_id: number;
    first_meeting_feedback?: string | null;
  };
}

export interface PMResponse {
  infosPM: {
    batiment_id: number;
    raison_sociale: string;
    sigle?: string | null;
    legal_form_id?: number | null;
    activite?: string | null;
    date_creation_company?: string | null;
    email?: string | null;
    phone_number?: string | null;
    num_voie?: string | null;
    typ_voie?: string | null;
    complement_voie?: string | null;
    code_postal?: string | null;
    commune?: string | null;
    cedex?: string | null;
    pays?: string | null;
    qpv?: boolean | null;
    zfu?: boolean | null;
    siret?: string | null;
    code_ape?: string | null;
    date_end_exercise?: number | null;
  };
  dirigeants: {
    rel_id: number;
    libelle?: string | null;
    rel_typ_id?: string | null;
    relation_date_debut?: string | null;
    relation_date_fin?: number | null;
  }[];
  effectifs: {
    year: number;
    nb_cdi?: number | null;
    nb_cdd?: number | null;
    nb_int?: number | null;
    nb_caid?: number | null;
    nb_alt?: number | null;
    nb_stg?: number | null;
  };
  formulesPM: {
    form_pm_id: number;
    formule_id: string;
    date_debut_formule: string;
    date_fin_formule?: string | null;
  }[];
  cas: {
    year?: string | null;
    ca?: string | null;
  };
  sortiePep: {
    date_sortie?: string | null;
    motif_id?: string | null;
    new_implantation?: string | null;
  };
  postPep: {
    actualisation_date?: string | null;
    statut_id?: string | null;
  };
}
