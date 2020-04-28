class ScreenShareView extends Croquet.View {
    constructor(model) {
        super(model);

        if(!navigator.mediaDevices.getDisplayMedia) return;

        this.screenShareButton = document.querySelector(`button#screenShare`);
        this.screenShareButton.innerText = 'Share Screen';
        this.screenShareButton.disabled = false;
        
        this.publish('eventListener', 'add', {
            element : this.screenShareButton,
            type : 'click',
            listener : this.onScreenShareButtonClick,
            thisArg : this,
        });

        this.subscribe('screen-share', 'start', this.getDisplayMedia);
        this.subscribe('scren-share', 'stop', this.stop);

        this.subscribe('screen-share', 'onstream', this.onStream);
        this.subscribe('screen-share', 'onstop', this.onStop);
    }

    onStream(stream) {
        screenVideo.srcObject = stream;

        this.stream = stream;
        this.screenShareButton.innerText = 'Stop Sharing';
    }
    onStop() {
        delete screenVideo.srcObject;

        delete this.stream;
        this.screenShareButton.innerText = 'Share Screen';
    }

    onScreenShareButtonClick(event) {
        if(this.stream) {
            this.stop();
        }
        else {
            this.getDisplayMedia();
        }
    }

    getDisplayMedia(options) {
        options = options || {
            video : true,
            audio : true,
        };

        navigator.mediaDevices.getDisplayMedia(options)
            .then(stream => {
                this.stop();
                this.publish('screen-share', 'onstream', stream);
            }).catch(error => {
                console.error(error);
            });
    }

    stop() {
        if(this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.publish('screen-share', 'onstop', this.stream);
        }
    }

    detach() {
        this.stop();
        super.detach();
    }
}

export default ScreenShareView;