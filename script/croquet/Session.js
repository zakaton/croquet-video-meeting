import Model from "./model/Model.js";
import View from "./view/View.js";

const {searchParams} = new URL(document.location);
const room = searchParams.get('room');
if(room) {
    const sessionName = `croquet-video-chat-${room}`;
    Croquet.App.root = false;
    Croquet.startSession(sessionName, Model, View)
        .then(session => {
            const {view} = session;
            window.view = view;
        });
}
else {
    const room = window.prompt('type in a room');
    window.location.href = `${window.location.href}?room=${room}`;
}