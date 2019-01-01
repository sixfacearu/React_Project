
import B21RequestModel from "./b21.request.model";

export default class BuyAssetsInfoRequestModel extends B21RequestModel {
    BuyAssetsInfoType: string;
    GoalAllocationCashAmount: number;
    GoalCurrencyCode : string
}