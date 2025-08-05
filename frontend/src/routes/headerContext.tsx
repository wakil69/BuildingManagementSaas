import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useState,
} from "react";

interface HeaderContextType {
  searchData: any; // Replace `any` with the actual type if known
  setSearchData: Dispatch<SetStateAction<any>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  filterFieldTiers: any;
  setFilterFieldsTiers: Dispatch<SetStateAction<any>>;
  searchDataPatrimoine: any;
  setSearchDataPatrimoine: Dispatch<SetStateAction<any>>;
  isLoadingPatrimoine: boolean;
  setIsLoadingPatrimoine: Dispatch<SetStateAction<boolean>>;
  filterFieldPatrimoine: any;
  setFilterFieldsPatrimoine: Dispatch<SetStateAction<any>>;
  searchDataConv: any;
  setSearchDataConv: Dispatch<SetStateAction<any>>;
  isLoadingConv: boolean;
  setIsLoadingConv: Dispatch<SetStateAction<boolean>>;
  filterFieldConv: any;
  setFilterFieldsConv: Dispatch<SetStateAction<any>>;
  filterFieldSuivi: any;
  setFilterFieldsSuivi: Dispatch<SetStateAction<any>>;
  numberElementsMaxConv: number;
  setNumberElementsMaxConv: Dispatch<SetStateAction<number>>;
  prevNumConv: number;
  setPrevNumConv: Dispatch<SetStateAction<number>>;
  nextNumConv: number;
  setNextNumConv: Dispatch<SetStateAction<number>>;
  numberElementsMaxTiers: number;
  setNumberElementsMaxTiers: Dispatch<SetStateAction<number>>;
  prevNumTiers: number;
  setPrevNumTiers: Dispatch<SetStateAction<number>>;
  nextNumTiers: number;
  setNextNumTiers: Dispatch<SetStateAction<number>>;
  numberElementsMaxLocaux: number;
  setNumberElementsMaxLocaux: Dispatch<SetStateAction<number>>;
  prevNumLocaux: number;
  setPrevNumLocaux: Dispatch<SetStateAction<number>>;
  nextNumLocaux: number;
  setNextNumLocaux: Dispatch<SetStateAction<number>>;
}

const defaultContextValue: HeaderContextType = {
  searchData: null,
  setSearchData: () => {},
  isLoading: false,
  setIsLoading: () => {},
  filterFieldTiers: null,
  setFilterFieldsTiers: () => {},
  searchDataPatrimoine: null,
  setSearchDataPatrimoine: () => {},
  isLoadingPatrimoine: false,
  setIsLoadingPatrimoine: () => {},
  filterFieldPatrimoine: null,
  setFilterFieldsPatrimoine: () => {},
  searchDataConv: null,
  setSearchDataConv: () => {},
  isLoadingConv: false,
  setIsLoadingConv: () => {},
  filterFieldConv: null,
  setFilterFieldsConv: () => {},
  filterFieldSuivi: null,
  setFilterFieldsSuivi: () => {},
  numberElementsMaxConv: 0,
  setNumberElementsMaxConv: () => {},
  prevNumConv: 0,
  setPrevNumConv: () => {},
  nextNumConv: 0,
  setNextNumConv: () => {},
  numberElementsMaxTiers: 0,
  setNumberElementsMaxTiers: () => {},
  prevNumTiers: 0,
  setPrevNumTiers: () => {},
  nextNumTiers: 0,
  setNextNumTiers: () => {},
  numberElementsMaxLocaux: 0,
  setNumberElementsMaxLocaux: () => {},
  prevNumLocaux: 0,
  setPrevNumLocaux: () => {},
  nextNumLocaux: 0,
  setNextNumLocaux: () => {},
};

export const HeaderContext =
  createContext<HeaderContextType>(defaultContextValue);

export function HeaderProvider({ children }: { children: ReactNode }) {
  // Tiers
  const [searchData, setSearchData] = useState(["empty"]);
  const [isLoading, setIsLoading] = useState(false);
  const [filterFieldTiers, setFilterFieldsTiers] = useState({
    dateDebut: "",
    dateFin: "",
    porteurProjet: true,
    PM: true,
  });

  // Patrimoine
  const [searchDataPatrimoine, setSearchDataPatrimoine] = useState(["empty"]);
  const [isLoadingPatrimoine, setIsLoadingPatrimoine] = useState(false);
  const [filterFieldPatrimoine, setFilterFieldsPatrimoine] = useState({
    dateDispo: "",
    loué: true,
    disponible: true,
  });
  // const [filterFieldPatrimoine, setFilterFieldsPatrimoine] = useState({dateDebut:"", dateFin: "", loué:true, disponible:true})
  // useState({dateDeb:"", dateFin:"", loué:true, disponible:true})

  // Patrimoine
  const [searchDataConv, setSearchDataConv] = useState(["empty"]);
  const [isLoadingConv, setIsLoadingConv] = useState(false);
  const [filterFieldConv, setFilterFieldsConv] = useState({
    dateDebut: "",
    dateFin: "",
    active: true,
    resilié: true,
  });

  //Suivi
  const [filterFieldSuivi, setFilterFieldsSuivi] = useState({
    dateDebut: "",
    dateFin: "",
    sujet: "",
  });

  //Recherches States
  const [numberElementsMaxConv, setNumberElementsMaxConv] = useState(10);
  const [prevNumConv, setPrevNumConv] = useState(0);
  const [nextNumConv, setNextNumConv] = useState(10);

  const [numberElementsMaxTiers, setNumberElementsMaxTiers] = useState(10);
  const [prevNumTiers, setPrevNumTiers] = useState(0);
  const [nextNumTiers, setNextNumTiers] = useState(10);

  const [numberElementsMaxLocaux, setNumberElementsMaxLocaux] = useState(10);
  const [prevNumLocaux, setPrevNumLocaux] = useState(0);
  const [nextNumLocaux, setNextNumLocaux] = useState(10);

  return (
    <HeaderContext.Provider
      value={{
        searchData,
        setSearchData,
        isLoading,
        setIsLoading,
        filterFieldTiers,
        setFilterFieldsTiers,
        searchDataPatrimoine,
        setSearchDataPatrimoine,
        isLoadingPatrimoine,
        setIsLoadingPatrimoine,
        filterFieldPatrimoine,
        setFilterFieldsPatrimoine,
        searchDataConv,
        setSearchDataConv,
        isLoadingConv,
        setIsLoadingConv,
        filterFieldConv,
        setFilterFieldsConv,
        filterFieldSuivi,
        setFilterFieldsSuivi,
        numberElementsMaxConv,
        setNumberElementsMaxConv,
        prevNumConv,
        setPrevNumConv,
        nextNumConv,
        setNextNumConv,
        numberElementsMaxTiers,
        setNumberElementsMaxTiers,
        prevNumTiers,
        setPrevNumTiers,
        nextNumTiers,
        setNextNumTiers,
        numberElementsMaxLocaux,
        setNumberElementsMaxLocaux,
        prevNumLocaux,
        setPrevNumLocaux,
        nextNumLocaux,
        setNextNumLocaux,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
