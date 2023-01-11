import {} from '../common';
import {} from '../DutyRoster/jsonTypes/index';
import { actingRankJsontype } from '../MyTeam/jsonTypes';

export interface shiftInfoType {
    id: number;
    startDate: string;
    endDate: string;    
    timezone: string;
    locationId: string;     
    sheriffId: string;
    comment?: string;
    overtimeHours: number;
}

export interface editedShiftInfoType {
    id: number;
    startDate: string;
    endDate: string;    
    timezone: string;
    locationId: number;     
    sheriffId: string;
    comment?: string;
}

export interface distributeTeamMemberInfoType {        
    sheriffId: string;
    name: string;
    email: string;
}

export interface weekShiftInfoType {

    myteam:sheriffAvailabilityInfoType;
    Sun: shiftInfoType | {};
    Mon: shiftInfoType | {};
    Tue: shiftInfoType | {};
    Wed: shiftInfoType | {};
    Thu: shiftInfoType | {};
    Fri: shiftInfoType | {};
    Sat: shiftInfoType | {};    
}

export interface shiftRangeInfoType {
    startDate: string;
    endDate: string;
}

export interface shiftSubTypeInfoType {
    code: string;
    id: number;
}

export interface sheriffAvailabilityInfoType {
    sheriffId: string;
    conflicts: conflictsInfoType[];
    firstName: string;
    lastName: string;
    badgeNumber: string;
    rank: string;
    rankOrder?: number;
    homeLocation: {id:number, name:string};
}

export interface conflictsInfoType {
    id?: string;
    location: string;
    dayOffset:number; 
    date:string; 
    startTime:string;
    endTime:string;
    startInMinutes:number;
    timeDuration: number; 
    type: string; 
    subType?: string;
    fullday: boolean;
    sheriffEventType?: string; 
    comment?: string;  
}

export interface scheduleBlockInfoType {
    id?: string;
    key: string;
    startTime:number;
    timeStamp: string;
    timeDuration: number; 
    title: string;
    color: string;
    originalColor: string; 
    headerColor: string;  
    selected: boolean;   
    type: string;
    subType?: string;
    comment?: string;
}

export interface dayOptionsInfoType {
    name:string;
    diff: number;
    fullday: boolean; 
    conflicts: {
        Training: conflictsInfoType[];
        Leave: conflictsInfoType[];
        Loaned: conflictsInfoType[];
        AllShifts:conflictsInfoType[]; 
        Shift: conflictsInfoType[];
        overTimeShift: conflictsInfoType[];
        Unavailable: conflictsInfoType[];
    }
}

export interface importConflictMessageType {
    ConflictFieldName: string
}

export interface weekScheduleInfoType {

    myteam:distributeScheduleInfoType;
    Sun: shiftInfoType | {};
    Mon: shiftInfoType | {};
    Tue: shiftInfoType | {};
    Wed: shiftInfoType | {};
    Thu: shiftInfoType | {};
    Fri: shiftInfoType | {};
    Sat: shiftInfoType | {};    
}

export interface distributeScheduleInfoType {
    sheriffId: string;
    conflicts: scheduleInfoType[];
    name: string;
    homeLocation: string;
    rank: string;
    badgeNumber: string;
    actingRank: actingRankJsontype[];    
}

export interface scheduleInfoType {
    id?: string;
    location: string;
    dayOffset:number; 
    date:string; 
    startTime:string;
    endTime:string;
    type: string;
    subType?: string;    
    duties?: distributeScheduleDutyInfoType[];
    workSection: string; 
    workSectionColor: string;
}

export interface distributeScheduleDutyInfoType {    
    startTime?: string;
    endTime?: string;
    dutyType: string;
    dutySubType: string;
    color: string;
    dutyNotes?: string; 
    assignmentNotes?: string;   
}

export interface actingRankInfoType {    
    startTime:string;
    endTime:string;
    rank: string;
}

export interface sheriffPagesInfoType {    
    start:number;
    end:number;
}

export interface sentEmailContentInfoType {
    attachments: string;
    body: string;
    from: string;
    subject: string;
    to: string;
}