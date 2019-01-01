import B21RequestModel from "./b21.request.model";
import BuyAssetsInfoRequestModel from "./buy.assets.info.model";
import DepositInfoRequestModel from "./deposit.info.request.model";

export default class DepositRequestModel extends B21RequestModel {
    DepositInfo: DepositInfoRequestModel;
    BuyAssetsInfo: BuyAssetsInfoRequestModel;
}