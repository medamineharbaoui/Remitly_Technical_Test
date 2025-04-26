export interface SwiftCode {
  swiftCode: string;
  bankName: string;
  address: string;
  townName?: string;
  isHeadquarter : boolean;
  headquarter?: boolean;  
  countryISO2: string;
  countryName: string;
}

export interface SwiftHeadquarter extends SwiftCode {
  branches?: SwiftCode[];
}