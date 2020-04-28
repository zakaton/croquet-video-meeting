import MediaDevicesView from './MediaDevicesView.js';
import ScreenShareView from './ScreenShareView.js';
import ThrottleView from "./ThrottleView.js";
import EventListenerView from "./EventListenerView.js";
import SimplePeerView from "./SimplePeerView.js";
import SpatialAudioView from "./SpatialAudioView.js";
import WebTorrentView from "./WebTorrentView.js";
import UIView from './UIView.js';

class View extends Croquet.View {
    constructor(model) {
        super(model);
        this.model = model;

        this.eventListener = new EventListenerView(model);
        this.mediaDevices = new MediaDevicesView(model);
        this.screenShare = new ScreenShareView(model);
        this.throttle = new ThrottleView(model);
        this.spatialAudio = new SpatialAudioView(model);
        this.simplePeer = new SimplePeerView(model);
        this.webTorrent = new WebTorrentView(model);
        this.ui = new UIView(model);
    }

    update() {

    }

    detach() {
        this.mediaDevices.detach();
        this.screenShare.detach();
        this.throttle.detach();
        this.eventListener.detach();
        this.spatialAudio.detach();
        this.simplePeer.detach();
        this.webTorrent.detach();
        this.ui.detach();
        
        super.detach();
    }
}

export default View;