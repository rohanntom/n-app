import { Pax } from "../../models/pax";

export interface PaxManagementService
{
    fetchAll(): Promise<Array<Pax>>;
    
    fetchPax(id: string): Promise<Pax>;
 
    addPax(pax: Pax): Promise<void>;

    update(pax: Pax): Promise<void>;
    
    delete(id: string): Promise<void>;
}