class SimplePeerModel extends Croquet.Model {
    init({viewId}) {
        super.init();

        this.viewId = viewId;
        this.subscribe(this.viewId, 'simple-peer-data', this.onData);
    }

    onData() {
        this.publish(this.viewId, 'simple-peer-ondata', ...arguments);
    }
    
    destroy() {
        super.destroy();
    }
}
SimplePeerModel.register();

export default SimplePeerModel;