import { Navigation } from 'react-native-navigation';
import NavigationUtil from './src/utils/navigation.util';
import { Provider } from 'react-redux';
import screenId from './src/constants/screen.id.enum';
import SellCoins from './src/screens/sellcoins';
import LoginScreen  from './src/screens/login.screen';
import SignUpScreen from './src/screens/signup.screen';
import AddMobileNumberScreen from './src/screens/addmobilenumber.screen';
import VerifyMobileNumberScreen from './src/screens/verifymobilenumber.screen';
import SetPasswordScreen from './src/screens/setpassword.screen';
import TermsAndConditionsScreen from './src/screens/termsAndConditions.screen';
import WelcomeOneScreen from './src/screens/welcomeone.screen';
import WelcomeSecondScreen from './src/screens/welcomesecond.screen';
import WelcomeScreen from './src/screens/welcome.screen';
import CountryNotSupportedScreen from './src/screens/countryNotSupported.screen';
import CreateGoalScreen from './src/screens/creategoal.screen';
import LearnScreen from './src/screens/learn.screen';
import MenuScreen from './src/screens/menu.screen';
import SetGoalAmountScreen from './src/screens/setgoalamount.screen';
import ChooseGoalCurrencyScreen from './src/screens/choosegoalcurrency.screen';
import ChooseGoalCryptoCurrencyScreen from './src/screens/choosegoalcryptocoin.screen';
import SetGoalDateScreen from './src/screens/setgoaldate.screens';
import GoalSummaryScreen from './src/screens/goal.summary.screen';
import ConfirmYourCountryScreen from './src/screens/confirmyourcountry.screen';
import ChooseGoalCryptoCurrencyCustomizeScreen from './src/screens/choosegoalcryptocoin.customize.screen';
import GoalInvestConfirmScreen from './src/screens/goal.invest.confirm.screen';
import KYCAddressScreen from './src/screens/kycaddress.screen';
import KYCConfirmNameScreen from './src/screens/kyc.confirmname.screen';
import KYCDateOfBirthScreen from './src/screens/kyc.dateofbirth.screen';
import KYCAdditionalInformationScreen from './src/screens/kyc.additional.information.screen';
import KYCUniqueIdentificationScreen from './src/screens/kyc.unique.identification.screen';
import KYCConfirmEmailScreen from './src/screens/kyc.confirm.email.screen';
import KYCSourceOfFundsScreen from './src/screens/kyc.sourceoffunds.screen';
import KYCDocumentUploadScreen from './src/screens/kyc.documentupload.screen';
import GoalDashboardScreen from './src/screens/goal.dashboard.screen';
import ChooseDeposite from './src/screens/choosedeposite';
import KYCCongratulationsScreen from './src/screens/kyc.congratulations.screen';
import configureStore from './src/config/redux.store/configure.store';
import ChooseInvestmentMethodScreen from './src/screens/choose.investment.method.screen';
import DebitCardSelectPaymentInstrumentScreen from './src/screens/debitcard.select.payment.instrument.screeen';
import InvestmentAmountScreen from './src/screens/invesment.amount.screen';
import InvestmentSummaryScreen from './src/screens/invesment.summary.screen';
import DebitCardAdditionalInformationScreen from './src/screens/debitcard.additional.information.screen';
import InvestmentCashBalanceAmountScreen from './src/screens/invesment.cashbalance.amount.screen';
import InvestmentTransactionSummaryScreen from './src/screens/investment.transaction.summary.screen';
import InvestmentCashBalanceSummaryScreen from './src/screens/investment.cashbalance.summary.screen';
import InvestmentCashBalanceTansactionSummaryScreen from './src/screens/investment.cashbalance.transaction.summary.screen';
const store = configureStore()
Navigation.registerComponentWithRedux(screenId.ChooseDeposite,() => ChooseDeposite, Provider,store);

//Navigation.registerComponentWithRedux(screenId.SellCoins,() => SellCoins, Provider,store);

  //Navigation.registerComponentWithRedux(screenId.LoginScreen,() => LoginScreen, Provider,store);
Navigation.registerComponent(screenId.SignUpScreen,() => SignUpScreen);
Navigation.registerComponentWithRedux(screenId.SetPasswordScreen,() => SetPasswordScreen, Provider,store);
Navigation.registerComponent(screenId.AddMobileNumberScreen,() => AddMobileNumberScreen);
Navigation.registerComponent(screenId.VerifyMobileNumberScreen,() => VerifyMobileNumberScreen);
Navigation.registerComponent(screenId.TermsAndConditionsScreen,() => TermsAndConditionsScreen);
Navigation.registerComponent(screenId.WelcomeOneScreen,() => WelcomeOneScreen);
Navigation.registerComponent(screenId.WelcomeSecondScreen,() => WelcomeSecondScreen);
Navigation.registerComponent(screenId.WelcomeScreen,() => WelcomeScreen);
Navigation.registerComponent(screenId.CountryNotSupportedScreen,() => CountryNotSupportedScreen);
Navigation.registerComponent(screenId.CreateGoalScreen,() => CreateGoalScreen);
Navigation.registerComponent(screenId.LearnScreen,() => LearnScreen);
Navigation.registerComponentWithRedux(screenId.MenuScreen,() => MenuScreen, Provider,store);
Navigation.registerComponent(screenId.SetGoalAmountScreen,() => SetGoalAmountScreen);

Navigation.registerComponent(screenId.ChooseGoalCurrencyScreen,() => ChooseGoalCurrencyScreen);
Navigation.registerComponent(screenId.ChooseGoalCryptoCurrencyScreen,() => ChooseGoalCryptoCurrencyScreen);

Navigation.registerComponent(screenId.SetGoalDateScreen,() => SetGoalDateScreen);
Navigation.registerComponent(screenId.GoalSummaryScreen,() => GoalSummaryScreen);

Navigation.registerComponent(screenId.ConfirmYourCountryScreen,() => ConfirmYourCountryScreen);
Navigation.registerComponent(screenId.ChooseGoalCryptoCurrencyCustomizeScreen,() => ChooseGoalCryptoCurrencyCustomizeScreen);
Navigation.registerComponent(screenId.GoalInvestConfirmScreen,() => GoalInvestConfirmScreen);

Navigation.registerComponent(screenId.KYCAddressScreen,() => KYCAddressScreen);

Navigation.registerComponent(screenId.KYCConfirmNameScreen,() => KYCConfirmNameScreen);
Navigation.registerComponent(screenId.KYCDateOfBirthScreen,() => KYCDateOfBirthScreen);

Navigation.registerComponent(screenId.KYCAdditionalInformationScreen,() => KYCAdditionalInformationScreen);
Navigation.registerComponent(screenId.KYCUniqueIdentificationScreen,() => KYCUniqueIdentificationScreen);
Navigation.registerComponent(screenId.KYCConfirmEmailScreen,() => KYCConfirmEmailScreen);
Navigation.registerComponent(screenId.KYCSourceOfFundsScreen,() => KYCSourceOfFundsScreen);
Navigation.registerComponent(screenId.KYCDocumentUploadScreen,() => KYCDocumentUploadScreen);

Navigation.registerComponentWithRedux(screenId.GoalDashboardScreen,() => GoalDashboardScreen, Provider,store);
Navigation.registerComponent(screenId.KYCCongratulationsScreen,() => KYCCongratulationsScreen);

Navigation.registerComponent(screenId.ChooseInvestmentMethodScreen,() => ChooseInvestmentMethodScreen);
Navigation.registerComponent(screenId.DebitCardSelectPaymentInstrumentScreen,() => DebitCardSelectPaymentInstrumentScreen);

Navigation.registerComponentWithRedux(screenId.InvestmentAmountScreen,() => InvestmentAmountScreen,Provider,store);
Navigation.registerComponentWithRedux(screenId.InvestmentSummaryScreen,() => InvestmentSummaryScreen,Provider,store);

Navigation.registerComponentWithRedux(screenId.InvestmentCashBalanceAmountScreen,() => InvestmentCashBalanceAmountScreen,Provider,store);
Navigation.registerComponentWithRedux(screenId.InvestmentCashBalanceSummaryScreen,() => InvestmentCashBalanceSummaryScreen,Provider,store);

Navigation.registerComponentWithRedux(screenId.DebitCardAdditionalInformationScreen,() => DebitCardAdditionalInformationScreen,Provider,store);
Navigation.registerComponent(screenId.InvestmentTransactionSummaryScreen,() => InvestmentTransactionSummaryScreen);
Navigation.registerComponent(screenId.InvestmentCashBalanceTansactionSummaryScreen,() => InvestmentCashBalanceTansactionSummaryScreen);


Navigation.events().registerAppLaunchedListener(() => { //Change default launcher screen to login 
  NavigationUtil.authenticationEntry();
  NavigationUtil.setDefaultOptions();
});