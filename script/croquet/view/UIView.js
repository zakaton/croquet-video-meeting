class UIView extends Croquet.View {
    constructor(model) {
        super(model);
        this.model = model;

        this.grid = document.querySelector('#grid');

        this.videos = {};

        this.subscribe('simple-peer', 'onstream', this.onStream);
        this.subscribe('simple-peer', 'onclose', this.onClose);

        for(const viewId in this.model.users) this.onViewJoin(viewId);
        this.subscribe(this.sessionId, 'view-join', this.onViewJoin);
        this.subscribe(this.sessionId, 'view-exit', this.onViewExit);

        this.reconnectButton = document.querySelector(`button#reconnect`);
        this.publish('eventListener', 'add', {
            type : 'click',
            element : this.reconnectButton,
            listener : this.join,
            thisArg : this,
        });

        this.join();
    }

    onViewJoin(viewId) {
        this.videos[viewId] = [];
    }

    join() {
        this.publish('simple-peer', 'connect-all');
    }

    leave() {
        this.publish('simple-peer', 'disconnect-all');
    }

    onStream({viewId, stream}) {
        if(this.viewId == viewId) return;

        const video = document.createElement('video');
        video.width = 200;
        video.srcObject = stream;
        video.dataset.viewId = viewId;
        video.autoplay = true;
        //video.muted = true;
        video.playsinline = true;
        //video.play();
        video.addEventListener('click', e => video.play(), {once:true});
        
        this.videos[viewId].push(video);

        this.grid.appendChild(video);

        stream.oninactive = () => {
            video.remove();
            this.videos[viewId].splice(this.videos[viewId].indexOf(video), 1);
        }
    }
    onClose({viewId}) {
        this.remove({viewId});
    }
    onViewExit(viewId) {
        this.remove({viewId});
    }
    remove({viewId}) {
        if(this.videos[viewId])
            this.videos[viewId].forEach(video => video.remove());
    }

    detach() {
        for(const viewId in this.model.users) {
            this.remove({viewId});
        }

        this.grid.innerHTML = '';
        super.detach();
    }
}

export default UIView;