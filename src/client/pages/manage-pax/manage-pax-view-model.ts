import { PageViewModel, template, route, DialogService, NavigationService } from "@nivinjoseph/n-app";
import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { Validator } from "@nivinjoseph/n-validate";
import { Pax } from "../../../sdk/models/pax";
import { PaxManagementService } from "../../../sdk/services/pax-management-service/pax-management-service";
import { ErrorMessage } from "../../models/error-message";
import { PaxValidator } from "../../models/pax-validator";
import { Routes } from "../routes";
import "./manage-pax-view.scss";


@template(require("./manage-pax-view.html"))
@route(Routes.managePax)
@inject("PaxManagementService", "DialogService", "NavigationService")
export class ManagePaxViewModel extends PageViewModel
{
    private readonly _paxManagementService: PaxManagementService;
    private readonly _dialogService: DialogService;
    private readonly _navigationService: NavigationService;
    private readonly _validator: Validator<this>;


    private _pax: Pax | null = null;


    public get pax(): Pax | null { return this._pax; }
    public get isNewPax(): boolean { return this._pax?.id == null; }

    public get hasErrors(): boolean { return !this._validate(); }
    public get errors(): Record<string, any> { return this._validator.errors; }


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

        this._validator = this._createValidator();
    }


    public async submit(): Promise<void>
    {
        this._validator.enable();
        if (!this._validate())
            return;

        this._dialogService.showLoadingScreen();
        try 
        {
            if (this.isNewPax)
                await this._paxManagementService.addPax(this._pax!);
            else
                await this._paxManagementService.update(this._pax!);
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

        this._dialogService.showSuccessMessage(`Pax successfully ${this.isNewPax ? "Added" : "Updated"}.`, "Success");
        this._navigationService.navigate(Routes.paxList);
    }


    protected override async onEnter(id?: string): Promise<void>
    {
        super.onEnter();

        given(id as string, "id").ensureIsString();

        if (id == null || id.isEmptyOrWhiteSpace())
        {
            this._pax = {
                firstName: "",
                lastName: "",
                age: null as any,
                country: "" as any,
                email: "",
                phoneNumber: null,
                requiresAssistance: false
            };

            return;
        }

        this._dialogService.showLoadingScreen();
        try
        {
            this._pax = await this._paxManagementService.fetchPax(id);
        }
        catch (e)
        {
            console.error(e);
            this._dialogService.showErrorMessage(ErrorMessage.generic);
            this._navigationService.navigate(Routes.paxList);
            return;
        }
        finally
        {
            this._dialogService.hideLoadingScreen();
        }
    }


    private _validate(): boolean
    {
        this._validator.validate(this);
        return this._validator.isValid;
    }


    private _createValidator(): Validator<this>
    {
        const validator = new Validator<this>(true);

        validator
            .prop("pax")
            .useValidator(new PaxValidator());

        return validator;
    }
}