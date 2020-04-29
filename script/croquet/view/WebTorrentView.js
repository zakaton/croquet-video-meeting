class WebTorrentView extends Croquet.View {
    constructor(model) {
        super(model);

        // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#client--new-webtorrentopts
        this._client = new WebTorrent();
        // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#torrentremovepeerpeer
        this._client.on('torrent', this.onTorrent.bind(this));
        
        this._hashingClient = new WebTorrent();

        this.subscribe("torrent", "add", this.add);
        this.subscribe("torrent", "seed", this.seed);

        this.peers = [];
        this.subscribe('simple-peer', 'onconnect', this.onConnect);
        this.subscribe('simple-peer', 'onclose', this.onClose);
    }

    onTorrent(torrent) {
        // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#torrentaddpeerpeer
        this.peers.forEach(peer => torrent.addPeer(peer));
    }

    onConnect({peer}) {
        this.peers.push(peer);

        // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#torrentaddpeerpeer
        this._client.torrents.forEach(torrent => torrent.addPeer(peer));
    }
    onClose({peer}) {
        this.peers.splice(this.peers.indexOf(peer), 1);

        // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#torrentremovepeerpeer
        this._client.torrents.forEach(torrent => torrent.removePeer(peer));
    }

    getMagnetURI(files, callback) {
        // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#clientseedinput-opts-function-onseed-torrent-
        this._hashingClient.seed(files, torrent => {
            const {magnetURI} = torrent;

            // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#torrentdestroycallback
            torrent.destroy(() => {
                callback(magnetURI);
            });
        });
    }

    seed({files, options, callback}) {
        this.getMagnetURI(files, magnetURI => {
            // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#clientgettorrentid
            const _torrent = this._client.get(magnetURI);

            if(_torrent) {
                // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#torrentdestroycallback
                _torrent.destroy(() => {
                    // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#clientseedinput-opts-function-onseed-torrent-
                    this._client.seed(files, options, callback);
                });
            }
            else {
                // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#clientseedinput-opts-function-onseed-torrent-
                this._client.seed(files, options, callback);
            }
        });
    }

    add({torrentId, options, callback}) {
        // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#clientgettorrentid
        const torrent = this._client.get(torrentId);
        if(torrent) {
            callback = callback || options;
            if(torrent.done)
                callback(torrent);
            else
                torrent.on('done', () => {
                    callback(torrent);
                });
        }
        else {
            // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#clientaddtorrentid-opts-function-ontorrent-torrent-
            this._client.add(torrentId, options, callback);
        }
    }

    detach() {
        // https://github.com/webtorrent/webtorrent/blob/master/docs/api.md#clientdestroyfunction-callback-err-
        this._client.destroy();
        this._hashingClient.destroy();
        
        super.detach();
    }
}

export default WebTorrentView;