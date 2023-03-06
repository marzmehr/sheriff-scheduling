export interface assignmentTypeInfoType {
    code: string;
    concurrencyToken?: number;
    id: number;
    locationId: number;
    type: string;
    sortOrder: number;
}

export interface leaveTrainingTypeInfoType {
    code: string;
    concurrencyToken?: number;
    id: number;
    frequency?: string;
    mandatory?: boolean;
    deliveryMethod?: string;
    // locationId: number;
    type: string;
    sortOrder: number;
}