class ThrottleView extends Croquet.View {
    constructor(model) {
        super(model);

        this._lastTimeThrottledEventsWerePublished = {};
        this._throttledEventTimeoutHandlers = {};

        this.subscribe("throttle", "publish", this.publish);
    }

    _getThrottleKey(scope, event) {
        return `${scope}-${event}`;
    };
    _clearThrottleTimeout(scope, event) {
        clearTimeout(this._throttledEventTimeoutHandlers[this._getThrottleKey(...arguments)]);
    };

    _setThrottleTimeout(scope, event, data, delay) {
        this._clearThrottleTimeout(...arguments);
        this._throttledEventTimeoutHandlers[this._getThrottleKey(...arguments)] = setTimeout(() => {
            super.publish(...arguments);
            this._lastTimeThrottledEventsWerePublished[this._getThrottleKey(...arguments)] = Date.now();
        }, delay);
    };

    publish({scope, event, data, delayMinimum}) {
        const lastTimeEventWasPublished = this._lastTimeThrottledEventsWerePublished[this._getThrottleKey(...arguments)] || 0;
        const now = Date.now();
        const timeSinceLastPublish = now - lastTimeEventWasPublished;
        if(timeSinceLastPublish >= delayMinimum) {
            super.publish(...arguments);
            this._lastTimeThrottledEventsWerePublished[this._getThrottleKey(...arguments)] = now;
        }
        else {
            const remainingDelay = delayMinimum - timeSinceLastPublish;
            this._setThrottleTimeout(scope, event, data, remainingDelay);
        }
    }

    clear() {
        for(const timeoutHandler in this._throttledEventTimeoutHandlers)
            clearTimeout(timeoutHandler);
    }

    detach() {
        this.clear();
        super.detach();
    }
}

export default ThrottleView;