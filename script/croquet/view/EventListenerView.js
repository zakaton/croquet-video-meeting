class EventListenerView extends Croquet.View {
    constructor(model) {
        super(model);

        this.eventListeners = [];

        this.subscribe('eventListener', 'add', this.addEventListener);
        this.subscribe('eventListener', 'remove', this.removeEventListeners);
    }

    addEventListener({element, type, listener, options, thisArg}) {
        listener = listener.bind(thisArg);
        this.eventListeners.push({element, type, listener});

        element.addEventListener(type, listener, options);
    }

    removeEventListeners() {
        this.eventListeners.forEach(function({element, type, listener}) {
            element.removeEventListener(type, listener);
        });
    }

    detach() {
        this.removeEventListeners();
        super.detach();
    }
}

export default EventListenerView;