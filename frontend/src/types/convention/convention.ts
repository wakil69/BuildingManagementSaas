import { validationSchemaCoworkingCreation } from "../../components/CreationConvVisu/CreationCoworking/validationSchemaCoworkingConv";
import { validationSchemaPepCreation } from "../../components/CreationConvVisu/CreationPepiniere/validationSchemaPepConv";
import * as Yup from "yup";

export interface ConventionSearch {
  conv_id: number;
  version: number;
  raison_sociale: string;
  typ_conv: string;
  date_debut: string;
  date_fin?: string;
  statut: string;
}

export interface ConventionsSearch {
  global: ConventionSearch[];
  cursor: {
    next?: number;
    prev?: number;
  };
  totalCount?: number;
}

export interface ConventionInfos {
  batiment_id: number;
  date_signature: string;
  date_debut: string;
  date_fin?: string | null;
  typ_conv: "PEPINIERE" | "COWORKING";
  raison_sociale: string;
  legal_form_id?: number | null;
  tiepm_id: number;
  statut: string;
  conv_age: number;
}

export interface ConventionVersion {
  version: number;
  statut: string;
  update_date: string;
}

export interface Signataire {
  tiepp_id: number;
  libelle: string;
  fonction?: string | null;
  relation_date_debut?: string | null;
  relation_date_fin?: string | null;
}

export interface ConventionUG {
  ug_id: number;
  surface_rent: number;
  date_debut: string;
  date_fin?: string | null;
  name: string;
}

export interface LocalAvailable {
  ug_id: number;
  name: string;
  surface: number;
  surface_occupied: number;
  surface_available: number;
}

export interface EquipementAvailable {
  equipement_id: number;
  name: string;
  nature_equipement_id: number;
  equipement_prix: number;
}

export type CreatePepConvention = Yup.InferType<
  typeof validationSchemaPepCreation
>;

export type CreateCoworkingConvention = Yup.InferType<
  typeof validationSchemaCoworkingCreation
>;

export interface ConventionEquipement {
  ug_name: string;
  equipement_id: number;
  equipement_name: string;
  equipement_prix: number;
  is_deleted: boolean;
}

export interface ConventionRubrique {
  ug_id: number;
  ug_name: string;
  equipement_id?: number | null;
  equipement_name?: string | null;
  rubrique_id: number;
  periodicity: string;
  condition_payment: string;
  montant: number;
  rubrique: string;
}

export interface ConventionResponse {
  conventionInfos: ConventionInfos;
  signataires: Signataire[];
  ugs: ConventionUG[];
  equipements: ConventionEquipement[];
  rubriques: ConventionRubrique[];
  conventionVersions: ConventionVersion[];
}

export interface NotificationSearch {
  conv_id: number;
  max_version: number;
  raison_sociale: string;
  statut: string;
}

export interface NotificationsSearch {
  notifications: NotificationSearch[];
  cursor: {
    next?: number;
    prev?: number;
  };
  totalCount?: number;
}
