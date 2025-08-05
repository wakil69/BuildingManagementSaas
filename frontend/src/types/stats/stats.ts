export interface StatsOverall {
  hostedCompanies: {
    label: string;
    value: number;
  }[];
  hostedPPSex: {
    label: string;
    value: number;
  }[];
  hostedPorteurProjet: {
    xAxis: string[];
    yAxis: number[];
  };
  accExtraMuros: {
    objectif: number;
    value: number;
  };
  entCompanies: {
    name: string;
    value: number;
  }[];
  sorCompanies: {
    name: string;
    value: number;
  }[];
  sectorsCompanies: Record<string, { name: string; value: number }[]>;
  headerStatsEnt: {
    totalNbSujetByFormule: { name: string; value: number }[]; 
    nbEntretiens: number;
    totalTime: string;
  };
  accEntretiens: {
    entretiens: {
      name: string;
      value: number;
    }[];
    infos: {
      name: string;
      value: string;
      totalMinutes: number;
    }[];
    totalTime: string;
    nbEntretiens: number;
  };
  locDispo: {
    objectif: number;
    value: number;
  };
  occLocaux: {
    name: { etage: string; pourcentage: string }[];
    children: {
      surfaceOcc: number;
      ug_id: number;
      name: string;
      parentName: string;
      size: number;
      tenants: string | null;
    }[];
  }[];
}

export interface BilanGraphsType {
  hostedPPSexPep: {
    label: string;
    value: number;
  }[];
  hostedPPSexPrj: {
    label: string;
    value: number;
  }[];
  hostedPPSexMur: {
    label: string;
    value: number;
  }[];
  eduPep: {
    label: string;
    value: number;
  }[];
  eduPrj: {
    label: string;
    value: number;
  }[];
  eduMur: {
    label: string;
    value: number;
  }[];
  agesPep: {
    name: string;
    value: number;
  }[];
  agesPrj: {
    name: string;
    value: number;
  }[];
  agesMur: {
    name: string;
    value: number;
  }[];
  scpAvPrjPep: {
    name: string;
    value: number;
  }[];
  scpAvPrjPrj: {
    name: string;
    value: number;
  }[];
  scpAvPrjMur: {
    name: string;
    value: number;
  }[];
  comunPersonsPep: {
    label: string;
    value: number;
  }[];
  comunPersonsPrj: {
    label: string;
    value: number;
  }[];
  comunPersonsMur: {
    label: string;
    value: number;
  }[];
  statutJurPep: {
    label: string;
    value: number;
  }[];
  statutJurPrj: {
    label: string;
    value: number;
  }[];
  statutJurMur: {
    label: string;
    value: number;
  }[];
}
