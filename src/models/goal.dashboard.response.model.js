import AssetPerformancesResponseModel from "./assets.performances.response.model";

export default class GoalDashboardResponseModel {
    AmountInvested: number;
    AssetPerformances: Array<AssetPerformancesResponseModel>;
    Balance: number;
    CashAssetPercentage: number;
    CashBalance: number;
    Gain: number;
    GoalAmount: number;
    GoalCurrencyCode: string;
    GoalName: string;
    Return: number;
}