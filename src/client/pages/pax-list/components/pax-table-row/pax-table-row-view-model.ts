import { ComponentViewModel, template, element, bind, events } from "@nivinjoseph/n-app";
import { Pax } from "../../../../../sdk/models/pax";
import { SelectablePax } from "../../pax-list-view-model";
import "./pax-table-row-view.scss";


@template(require("./pax-table-row-view.html"))
@element("pax-table-row")
@events("managePax", "deletePax")
@bind({
    selectablePax: "object"
})
export class PaxTableRowViewModel extends ComponentViewModel
{
    private get _selectablePax(): SelectablePax { return this.getBound<SelectablePax>("selectablePax"); }


    public get pax(): Pax { return this._selectablePax.pax; }

    public get isSelected(): boolean { return this._selectablePax.isSelected; }
    public set isSelected(value: boolean) { this._selectablePax.isSelected = value; }


    public managePax(): void
    {
        this.emit("managePax", this.pax);
    }

    public deletePax(): void
    {
        this.emit("deletePax", this.pax);
    }
}