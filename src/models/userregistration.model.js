
export default class UserRegistrationResponseModel {
    EmailVerified: boolean;
    MobilePhoneVerified: boolean;
    TermsAndConditionsAccepted: boolean;
    KYCPassed: boolean;
    KYCType: string;
    KYCTypeDisplayName: string;
    KYCStatus: string;
    KYCEVerificationFailed: boolean;
    KYCPassportUploaded: boolean;
    KYCPassportVerificationStatus: string;
    KYCUtilityBillUploaded: boolean;
    KYCUtilityBillVerificationStatus: string;
    PhoneCountryCodeSignupSupported: string;
    PhoneCountryCodeEVerifySupported: string;
    SourceOfFunds: string;
    ChangeAddressRequestVerificationStatus: string;
}