import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { Uuid } from "@nivinjoseph/n-util";
import { Country, Pax } from "../../models/pax";
import { PaxManagementService } from "./pax-management-service";


export class LocalPaxManagementService implements PaxManagementService
{
    private readonly _allPassengers: Array<Pax> = new Array<Pax>();


    public constructor()
    {
        this._allPassengers.push(
            {
                id: Uuid.create(),
                firstName: "Shrey",
                lastName: "Mahendru",
                age: 27,
                country: Country.canada,
                email: "shreymahendru@gmail.com",
                phoneNumber: "6479899572",
                requiresAssistance: false
            },
            {
                id: Uuid.create(),
                firstName: "Nivin",
                lastName: "Joseph",
                age: 37,
                country: Country.usa,
                email: "nivin@gmail.com",
                phoneNumber: "1111111111",
                requiresAssistance: true
            },
            {
                id: Uuid.create(),
                firstName: "Aron",
                lastName: "Tucker",
                age: 30,
                country: Country.mexico,
                email: "aron@gmail.com",
                phoneNumber: "1231231234",
                requiresAssistance: false
            },
        );
    }

    public async fetchPax(id: string): Promise<Pax>
    {
        given(id, "id").ensureHasValue().ensureIsString();

        const existingPaxIndex = this._allPassengers.findIndex(t => t.id === id);
        if (existingPaxIndex === -1)
            throw new ApplicationException(`Pax with id ${id} not found`);

        const pax = this._allPassengers[existingPaxIndex];

        return { ...pax };
    }

    public async fetchAll(): Promise<Array<Pax>>
    {
        return this._allPassengers.map(t => ({ ...t }));
    }

    public async addPax(pax: Pax): Promise<void>
    {
        given(pax, "pax").ensureHasValue().ensureIsObject().ensure(t => t.id == null);

        const id = Uuid.create();

        pax.id = id;
        this._allPassengers.push({ ...pax });
    }

    public async update(pax: Pax): Promise<void>
    {
        given(pax, "pax").ensureHasValue().ensureIsObject()
            .ensure(t => t.id != null && this._allPassengers.some(p => p.id === t.id));

        const existingPaxIndex = this._allPassengers.findIndex(t => t.id === pax.id);
        this._allPassengers.splice(existingPaxIndex, 1, { ...pax });
    }

    public async delete(id: string): Promise<void>
    {
        given(id, "id").ensureHasValue().ensureIsString()
            .ensure(t => this._allPassengers.some(pax => pax.id === t));

        const existingPaxIndex = this._allPassengers.findIndex(t => t.id === id);
        this._allPassengers.splice(existingPaxIndex, 1);
    }
}