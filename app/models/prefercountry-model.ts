export type PrefercountryModel = {
    amount: number;
    count: number;
    country: string; 
    countryName: string;
    reason: string;
    status: string;
    onPress: ((preferCountry: any) => void),
    columnIndex:number, 
    totalColumns:number
  };
  