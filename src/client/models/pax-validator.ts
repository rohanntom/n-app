import { Validator } from "@nivinjoseph/n-validate";
import { Country, Pax } from "../../sdk/models/pax";

export class PaxValidator extends Validator<Pax>
{
    public constructor(isDisabled?: boolean)
    {
        super(isDisabled);

        this
            .prop("firstName")
            .isRequired()
            .isString()
            .hasMaxLength(100);

        this
            .prop("lastName")
            .isRequired()
            .isString()
            .hasMaxLength(100);

        this
            .prop("age")
            .isRequired()
            .isNumber()
            .ensure(t => t > 0 && t < 100 && !t.toString().contains(".")).withMessage("Please enter a valid age.")
            .hasMinValue(18).withMessage("Pax should be at least 18 years old.");

        this
            .prop("email")
            .isRequired()
            .isString()
            .isEmail().withMessage("Please enter a valid email.");

        this
            .prop("phoneNumber")
            .isOptional()
            .isString()
            .isPhoneNumber().withMessage("Please enter a valid phone number");

        this
            .prop("country")
            .isRequired()
            .isEnum(Country);

        this
            .prop("requiresAssistance")
            .isRequired()
            .isBoolean();
    }
}