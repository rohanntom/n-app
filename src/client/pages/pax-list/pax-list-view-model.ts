import { PageViewModel, template, route, DialogService, NavigationService, components } from "@nivinjoseph/n-app";
import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { Country, Pax } from "../../../sdk/models/pax";
import { PaxManagementService } from "../../../sdk/services/pax-management-service/pax-management-service";
import { ErrorMessage } from "../../models/error-message";
import { Routes } from "../routes";
import { PaxTableRowViewModel } from "./components/pax-table-row/pax-table-row-view-model";
import "./pax-list-view.scss";


@template(require("./pax-list-view.html"))
@route(Routes.paxList)
@inject("PaxManagementService", "DialogService", "NavigationService")
@components(PaxTableRowViewModel)
export class PaxListViewModel extends PageViewModel
{
    private readonly _paxManagementService: PaxManagementService;
    private readonly _dialogService: DialogService;
    private readonly _navigationService: NavigationService;


    private _paxes: ReadonlyArray<SelectablePax> = new Array<SelectablePax>();
    private _nameFilter = "";
    private _countryFilter: Country | null = null;


    public get filteredPaxes(): ReadonlyArray<SelectablePax>
    {
        let paxes = this._paxes;

        if (this._countryFilter != null)
            paxes = paxes.where(t => t.pax.country === this._countryFilter);

        if (this._nameFilter.isNotEmptyOrWhiteSpace())
            paxes = paxes
                .where(t => `${t.pax.firstName}${t.pax.lastName}`.toLowerCase()
                    .contains(this._nameFilter.toLowerCase()));

        return paxes;
    }

    public get selectedCount(): number { return this._paxes.where(t => t.isSelected).length; }

    public get nameFilter(): string { return this._nameFilter; }
    public set nameFilter(value: string) { this._nameFilter = value; }

    public get countryFilter(): Country | null { return this._countryFilter; }
    public set countryFilter(value: Country | null) { this._countryFilter = value; }


    public constructor(paxManagementService: PaxManagementService, dialogService: DialogService,
        navigationService: NavigationService)
    {
        super();

        given(paxManagementService, "paxManagementService").ensureHasValue().ensureIsObject();
        this._paxManagementService = paxManagementService;

        given(dialogService, "dialogService").ensureHasValue().ensureIsObject();
        this._dialogService = dialogService;

        given(navigationService, "navigationService").ensureHasValue().ensureIsObject();
        this._navigationService = navigationService;
    }


    public addPax(): void
    {
        this._navigationService.navigate(Routes.managePax);
    }

    public managePax(pax: Pax): void
    {
        given(pax, "pax").ensureHasValue().ensureIsObject()
            .ensure(t => this._paxes.some(p => p.pax.id === t.id));

        this._navigationService.navigate(Routes.managePax, { id: pax.id });
    }

    public async deletePax(pax: Pax): Promise<void>
    {
        given(pax, "pax").ensureHasValue().ensureIsObject()
            .ensure(t => this._paxes.some(p => p.pax.id === t.id));

        if (!confirm(`Are you sure you want to delete the pax: ${pax.firstName} ${pax.lastName}`))
            return;

        this._dialogService.showLoadingScreen();
        try 
        {
            await this._paxManagementService.delete(pax.id!);
        }
        catch (e)
        {
            console.error(e);
            this._dialogService.showErrorMessage(ErrorMessage.generic);
            return;
        }
        finally 
        {
            this._dialogService.hideLoadingScreen();
        }

        this._dialogService.showSuccessMessage(`Pax ${pax.firstName} ${pax.lastName} successfully deleted.`);
        await this._loadPaxes();
    }

    public async deleteSelectedPaxes(): Promise<void> 
    {
        given(this, "this").ensure(t => t.selectedCount > 0);

        const selectedPaxes = this._paxes.where(t => t.isSelected);

        if (!confirm(`Are you sure you want to delete ${selectedPaxes.length} selected paxes?`))
            return;

        this._dialogService.showLoadingScreen();
        try 
        {
            for (const id of selectedPaxes.map(t => t.pax.id!))
                await this._paxManagementService.delete(id);
        }
        catch (e)
        {
            console.error(e);
            this._dialogService.showErrorMessage(ErrorMessage.generic);
            return;
        }
        finally 
        {
            this._dialogService.hideLoadingScreen();
        }

        this._dialogService.showSuccessMessage(`${selectedPaxes.length} paxes successfully deleted.`);
        await this._loadPaxes();
    }


    protected override async onEnter(): Promise<void>
    {
        super.onEnter();

        await this._loadPaxes().catch();
    }


    private async _loadPaxes(): Promise<void>
    {
        this._paxes = new Array<SelectablePax>();

        this._dialogService.showLoadingScreen();
        try
        {
            const paxes = await this._paxManagementService.fetchAll();
            this._paxes = paxes.map(t => ({
                pax: t,
                isSelected: false
            }));
        }
        catch (e)
        {
            console.error(e);
            this._dialogService.showErrorMessage(ErrorMessage.generic);
            return;
        }
        finally
        {
            this._dialogService.hideLoadingScreen();
        }
    }
}


export interface SelectablePax
{
    pax: Pax;
    isSelected: boolean;
}
