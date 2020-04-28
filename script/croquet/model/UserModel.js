import SimplePeerModel from "./SimplePeerModel.js";

class UserModel extends Croquet.Model {
    init({viewId}) {
        super.init();
        this.viewId = viewId;   
        
        this.simplePeer = SimplePeerModel.create({viewId});
    }
    
    destroy() {
        this.simplePeer.destroy();
        super.destroy();
    }
}
UserModel.register();

export default UserModel;