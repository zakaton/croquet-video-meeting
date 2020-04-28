import UserModel from "./UserModel.js";

class Model extends Croquet.Model {
    init() {
        super.init();

        this.users = {};

        // https://croquet.studio/sdk/docs/global.html#event:view-join
        this.subscribe(this.sessionId, 'view-join', this.onViewJoin);

        // https://croquet.studio/sdk/docs/global.html#event:view-exit
        this.subscribe(this.sessionId, 'view-exit', this.onViewExit);
    }

    onViewJoin(viewId) {
        this.users[viewId] = UserModel.create({viewId});
    }
    onViewExit(viewId) {
        if(this.users[viewId]) {
            this.users[viewId].destroy();
            delete this.users[viewId];
        }
    }
}
Model.register();

export default Model;