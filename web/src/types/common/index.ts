export interface locationInfoType {
    name: string;
    id: number;
    regionId: number| string| null;
    agencyId?: string;
    concurrencyToken?: number;
    justinCode?: string;
    timezone: string;
}

export interface regionInfoType {
    name: string;
    id: string;
    concurrencyToken?: number;
    justinId?: number;
}

export interface leaveInfoType {
    code: string;
    id: number;
    description?: string;
}

export interface trainingInfoType {
    code: string;
    id: number;
    description?: string;
}

export interface userInfoType {
    firstName: string;
    lastName: string;
    roles: string[];
    homeLocationId: number;
    permissions: string[];
}

export interface commonInfoType {
    sheriffRankList: sheriffRankInfoType[]    
}

export interface sheriffRankInfoType {
    id: number;
    name: string;
}

export interface localTimeInfoType {
    timeString: string;
    timeSlot: number;
    dayOfWeek: number;
    isTodayInView: boolean;
}

export interface reportInfoType {
    startDate: string;
    endDate: string;
    reportType: string;
    reportSubtype: string;
    region: string;
    location: string;
    sheriffName: string;
}