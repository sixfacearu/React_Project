import addressFieldType from './addressFields.type.enum';
import userNameFields from './user.name.fields.type.enum';
import dateOfBirthFieldType from './date.of.birth.type.enum';
const RegisterUserFieldConstant = {
    
    AddressDynamicFields: [
        addressFieldType.LocationAdditionalFieldsAddress1,
        addressFieldType.Suburb,
        addressFieldType.City,
        addressFieldType.StateProvinceCode,
        addressFieldType.PostalCode,
        //addressFieldType.CountryCode, //Commented coz, country code is selected in prev screen so no need to show input field for this. Just make sure to send country code in Add address API
        addressFieldType.BuildingNumber,
        addressFieldType.StreetName,
        addressFieldType.StreetType,
        addressFieldType.UnitNumber
    ],
    UserNameDynamicFields: [
        userNameFields.FirstGivenName,
        userNameFields.FirstSurName,
        userNameFields.MiddleName,
        userNameFields.PersonInfoAdditionalFieldsFullName,
        userNameFields.SecondSurname
    ],
    DateOfBirthFields: [
        dateOfBirthFieldType.DayOfBirth,
        dateOfBirthFieldType.MonthOfBirth,
        dateOfBirthFieldType.YearOfBirth
    ],
    addressFieldStaticArray: [
        {
            "Name": "LocationAdditionalFieldsAddress1",
            "DisplayName": "Address Line 1",
            "Category": "Location",
            "Required": true,
            "Hint": "",
            "MinLen": "1",
            "MaxLen": "255"
        },
        {
            "Name": "City",
            "DisplayName": "City",
            "Category": "Location",
            "Required": true,
            "Hint": "",
            "MinLen": "1",
            "MaxLen": "100"
        },
        {
            "Name": "StateProvinceCode",
            "DisplayName": "State / Province Code",
            "Category": "Location",
            "Required": true,
            "Hint": "",
            "MinLen": "1",
            "MaxLen": "50"
        },
        {
            "Name": "PostalCode",
            "DisplayName": "Postal Code",
            "Category": "Location",
            "Required": true,
            "Hint": "",
            "MinLen": "1",
            "MaxLen": "15"
        }
    ]
}

export default RegisterUserFieldConstant;