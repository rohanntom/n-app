export interface Pax
{
    id?: string;
    firstName: string;
    lastName: string;
    age: number;
    email: string;
    phoneNumber: string | null;
    country: Country;
    requiresAssistance: boolean;
}

export enum Country
{
    canada = "Canada",
    usa = "United States",
    mexico = "Mexico"
}