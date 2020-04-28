class MediaDevicesView extends Croquet.View {
    constructor(model) {
        super(model);

        this.audioInputs = [];
        this.audioInputsSelect = document.querySelector(`select#audioInputs`);
        this.audioInputsSelect.appendChild(new Option('--select audio input--', '', true, true));
        this.publish('eventListener', 'add', {
            element : this.audioInputsSelect,
            type : 'change',
            listener : this.onAudioInputsSelectChange,
            thisArg : this,
        });

        this.videoInputs = [];
        this.videoInputsSelect = document.querySelector(`select#videoInputs`);
        this.videoInputsSelect.appendChild(new Option('--select video input--', '', true, true));
        this.publish('eventListener', 'add', {
            element : this.videoInputsSelect,
            type : 'change',
            listener : this.onVideoInputSelectChange,
            thisArg : this,
        });

        this.toggleVideoButton = document.querySelector(`button#toggleVideo`);
        this.publish('eventListener', 'add', {
            element : this.toggleVideoButton,
            type : 'click',
            listener : this.onToggleVideoButtonClick,
            thisArg : this,
        });

        this.toggleAudioButton = document.querySelector(`button#toggleAudio`);
        this.publish('eventListener', 'add', {
            element : this.toggleAudioButton,
            type : 'click',
            listener : this.onToggleAudioButtonClick,
            thisArg : this,
        });

        // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
        this.mediaStreamConstraints = {
            video : true,
            audio : true,
        };

        this.subscribe('media-devices', 'onstream', this.onStream);
        this.subscribe('media-devices', 'onenable', this.onEnable);
        
        this.getUserMediaAccess()
            .then(() => {
                navigator.mediaDevices.enumerateDevices()
                    .then(deviceInformationArray => {
                        deviceInformationArray.forEach(deviceInformation => {
                            
                            const option = document.createElement('option');
                            option.value = deviceInformation.deviceId;
        
                            switch(deviceInformation.kind) {
                                case 'audioinput':
                                    this.audioInputs.push(deviceInformation);
        
                                    option.text = deviceInformation.label || `Microphone #${this.audioInputsSelect.length+1}`;
                                    this.audioInputsSelect.appendChild(option);
        
                                    break;
        
                                case 'videoinput':
                                    this.videoInputs.push(deviceInformation);
        
                                    option.text = deviceInformation.label || `Camera #${this.videoInputsSelect.length+1}`;
                                    this.videoInputsSelect.appendChild(option);
                                    break;
        
                                default:
                                    break;
                            }
                        });
                    });
            });
    }

    getUserMediaAccess() {
        return navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
            .then(stream => {
                stream.getTracks().forEach(track => track.stop());
            });
    }

    onAudioInputsSelectChange() {
        const {value} = this.audioInputsSelect;
        if(value == '') {
            this.mediaStreamConstraints.audio = false;
            this.enable({audio : false});
        }
        else {
            this.mediaStreamConstraints.audio = {deviceId : value};
            this.getUserMedia();
        }
    }
    onVideoInputSelectChange() {
        const {value} = this.videoInputsSelect;
        if(value == '') {
            this.mediaStreamConstraints.video = false;
            this.enable({video : false});
        }
        else {
            this.mediaStreamConstraints.video = {deviceId : {exact : value}};
            this.getUserMedia();
        }
    }


    get isAudioEnabled() {
        if(this.stream)
            return this.stream.getAudioTracks()[0].enabled;
    }
    onToggleAudioButtonClick(event) {
        if(this.stream)
            this.enable({audio : !this.isAudioEnabled});
    }

    get isVideoEnabled() {
        if(this.stream)
            return this.stream.getVideoTracks()[0].enabled;
    }
    onToggleVideoButtonClick(event) {
        if(this.stream)
            this.enable({video : !this.isVideoEnabled});
    }

    enable(options) {
        if(this.stream) {
            if('audio' in options) {
                const audioTrack = this.stream.getAudioTracks()[0];
                if(audioTrack)
                    audioTrack.enabled = options.audio;
            }            

            if('video' in options) {
                const videoTrack = this.stream.getVideoTracks()[0];
                if(videoTrack)
                    videoTrack.enabled = options.video;
            }

            this.publish('media-devices', 'onenable', options);
        }
    }
    onEnable(options) {
        if('audio' in options)
            this.toggleAudioButton.innerText = options.audio?
                'mute':
                'unmute';
        
        if('video' in options)
            this.toggleVideoButton.innerText = options.video?
                'hide':
                'show';
    }

    stop() {
        if(this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.publish('media-devices', 'onstop', this.stream);
            delete this.stream;
        }
    }

    getUserMedia() {
        navigator.mediaDevices.getUserMedia(this.mediaStreamConstraints)
            .then(stream => {
                if(this.stream)
                    this.stop();

                stream.onaddtrack = event => this.publish('media-devices', 'onaddtrack', event);
                stream.onremovetrack = event => this.publish('media-devices', 'onremovetrack', event);

                this.stream = stream;
                this.publish('media-devices', 'onstream', this.stream);
            });
    }

    onStream(stream) {
        video.srcObject = stream;
    }

    detach() {
        this.stop();

        this.audioInputsSelect.innerHTML = '';
        this.videoInputsSelect.innerHTML = '';

        super.detach();
    }
}

export default MediaDevicesView;