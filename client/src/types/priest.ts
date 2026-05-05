import { CeremonyType } from './enums';

export interface IService {
  name: CeremonyType | string;
  description: string;
  basePriceINR: number;
  durationHours: number;
  includesMaterials?: boolean;
}

export interface ISlot {
  startTime: string;
  endTime: string;
}

export interface IWeeklySchedule {
  dayOfWeek: number;
  slots: ISlot[];
}

export interface IAvailabilityOverride {
  date: string;
  isAvailable: boolean;
  slots?: ISlot[];
}

export interface ICertificate {
  name: string;
  fileUrl: string;
}

export interface IPriestRating {
  average: number;
  count: number;
}

export interface IBankDetails {
  accountNumber: string;
  accountHolder: string;
  ifscCode: string;
  bankName: string;
}

export interface IPriestUser {
  id: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
  avatar?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

export interface IPriestProfile {
  id: string;
  user: IPriestUser;
  bio: string;
  specialisations: string[];
  languages: string[];
  experienceYears: number;
  education?: string;
  services: IService[];
  certificates: ICertificate[];
  rating: IPriestRating;
  isAvailable: boolean;
  weeklySchedule?: IWeeklySchedule[];
  availabilityOverrides?: IAvailabilityOverride[];
  travelRadius?: number;
  serviceAreas?: string[];
  pendingPayout?: number;
  totalEarnings?: number;
  bankDetails?: IBankDetails;
}
