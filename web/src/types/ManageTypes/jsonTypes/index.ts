import {} from '../../common';

export interface placeHolderType {
    "Id": string,
    "fullNm": string,
    "phoneNumberTxt": string,
    "additionalProp1": {},
    "additionalProp2": {},
    "additionalProp3": {}
}


export interface Courtroom {
    id?: string;
    locationId?: string;
    code: string;
    name?: string;
    description?: string;
    effectiveDate?: string;
    expiryDate?: string;
    sortOrder?: number;
    isExpired?: boolean; 
}
export interface AddInformation {
    id?: string;
    locationId?: string;
    code: string;
    name?: string;
    title?: string;
    description?: string;
    effectiveDate?: string;
    expiryDate?: string;
    sortOrder?: number;
    isExpired?: boolean; 
    createdBy: string;
    updatedBy: string;
    createdDtm: string;
    updatedDtm: string;
}
