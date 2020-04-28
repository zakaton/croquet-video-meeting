class SimplePeerView extends Croquet.View {
    constructor(model) {
        super(model);
        this.model = model;

        this.streams = {
            // camera
            // screen
        };

        this.peers = {};
        this.subscribe(this.viewId, 'simple-peer-ondata', this.onData);

        this.subscribe('simple-peer', 'connect', this.connect);
        this.subscribe('simple-peer', 'disconnect', this.disconnect);

        this.subscribe('simple-peer', 'connect-all', this.connectAll);
        this.subscribe('simple-peer', 'disconnect-all', this.disconnectAll);

        this.subscribe('simple-peer', 'addStream', this.addStream);
        this.subscribe('simple-peer', 'removeStream', this.removeStream);
        
        this.subscribe('simple-peer', 'addTrack', this.addTrack);        
        this.subscribe('simple-peer', 'removeTrack', this.removeTrack);        
        this.subscribe('simple-peer', 'replaceTrack', this.replaceTrack);        

        this.subscribe('media-devices', 'onstream', this.onCameraStream);
        this.subscribe('media-devices', 'onstop', this.onCameraStreamStop);

        this.subscribe('screen-share', 'onstream', this.onScreenShareStream);
        this.subscribe('screen-share', 'onstop', this.onScreenShareStreamStop);
    }

    createPeer(viewId, options = {}) {
        Object.assign(options, {
            trickle : false,
        });
        

        options.streams = [];
        for(const key in this.streams)
            options.streams.push(this.streams[key]);

        // https://github.com/feross/simple-peer#peer--new-peeropts
        const peer = this.peers[viewId] = new SimplePeer(options);
        
        // https://github.com/feross/simple-peer#peeronsignal-data--
        peer.on('signal', data => {
            this.publish(viewId, 'simple-peer-data', {
                viewId : this.viewId,
                data,
            });
        });

        // https://github.com/feross/simple-peer#peeronconnect---
        peer.on('connect', () => {
            console.log('connect');
            this.publish('simple-peer', 'onconnect', {viewId});
        });

        // https://github.com/feross/simple-peer#peeronstream-stream--
        peer.on('stream', stream => {
            console.log('stream', stream);
            this.publish('simple-peer', 'onstream', {viewId, stream});
        });

        // https://github.com/feross/simple-peer#peerontrack-track-stream--
        peer.on('track', (track, stream) => {
            this.publish('simple-peer', 'ontrack', {viewId, track, stream});
        });

        // https://github.com/feross/simple-peer#peeronclose---
        peer.on('close', () => {
            console.log('close');
            this.publish('simple-peer', 'onclose', {viewId});
            delete this.peers[viewId];
        });

        // https://github.com/feross/simple-peer#peeronerror-err--
        peer.on('error', error => {
            //console.error(error);
            this.publish('simple-peer', 'onerror', {viewId, error});
        });

        return peer;
    }

    connect({viewId}) {
        if(this.viewId == viewId) return;
        if(this.peers[viewId] && this.peers[viewId].connected) return

        this.createPeer(viewId, {
            initiator : true,
        });
    }
    disconnect({viewId}) {
        const peer = this.peers[viewId];

        if(peer)
            peer.destroy();
    }

    connectAll() {
        for(const viewId in this.model.users)
            this.connect({viewId});
    }
    disconnectAll() {
        for(const viewId in this.model.users)
            this.disconnect({viewId});
    }

    onData({viewId, data}) {
        const peer = this.peers[viewId] || this.createPeer(viewId);

        peer.signal(data);
    }

    addStream({viewId, stream}) {
        const peer = this.peers[viewId];

        if(peer) {
            // https://github.com/feross/simple-peer#peeraddstreamstream
            peer.addStream(stream);
        }
    }
    removeStream({viewId, stream}) {
        const peer = this.peers[viewId];

        if(peer) {
            // https://github.com/feross/simple-peer#peerremovestreamstream
            peer.removeStream(stream);
        }
    }

    addTrack({viewId, stream, track}) {
        const peer = this.peers[viewId];

        if(peer) {
            // https://github.com/feross/simple-peer#peeraddtracktrack-stream
            peer.addTrack(track, stream);
        }
    }
    removeTrack({viewId, track, stream}) {
        const peer = this.peers[viewId];

        if(peer) {
            // https://github.com/feross/simple-peer#peerremovetracktrack-stream
            peer.removeTrack(track, stream);
        }
    }
    replaceTrack({viewId, oldTrack, newTrack, stream}) {
        const peer = this.peers[viewId];

        if(peer) {
            // https://github.com/feross/simple-peer#peerreplacetrackoldtrack-newtrack-stream
            peer.replaceTrack(oldTrack, newTrack, stream);
        }
    }

    onCameraStream(stream) {
        for(const viewId in this.peers) {
            const peer = this.peers[viewId];
            if(peer.connected)
                peer.addStream(stream);
        }
        this.streams.camera = stream;
    }
    onCameraStreamStop(stream) {
        if(this.streams.camera == stream) {
            for(const viewId in this.peers) {
                this.peers[viewId].removeStream(this.streams.camera);
            }
            delete this.streams.camera;
        }
    }

    onScreenShareStream(stream) {
        for(const viewId in this.peers) {
            const peer = this.peers[viewId];
            if(peer.connected)
                peer.addStream(stream);
        }
        this.streams.screen = stream;
    }
    onScreenShareStreamStop(stream) {
        if(this.streams.screen == stream) {
            for(const viewId in this.peers) {
                this.peers[viewId].removeStream(this.streams.screen);
            }
            delete this.streams.screen;
        }
    }

    detach() {
        this.disconnectAll();
        super.detach();
    }
}

export default SimplePeerView;