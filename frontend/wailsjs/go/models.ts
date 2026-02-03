export namespace media {
	
	export class MusicFile {
	    name: string;
	    path: string;
	    ext: string;
	    composer: string;
	    album: string;
	
	    static createFrom(source: any = {}) {
	        return new MusicFile(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.path = source["path"];
	        this.ext = source["ext"];
	        this.composer = source["composer"];
	        this.album = source["album"];
	    }
	}

}

export namespace state {
	
	export class LastPlayedRecord {
	    path: string;
	    playedAt: number;
	
	    static createFrom(source: any = {}) {
	        return new LastPlayedRecord(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.playedAt = source["playedAt"];
	    }
	}
	export class Playlist {
	    name: string;
	    tracks: string[];
	
	    static createFrom(source: any = {}) {
	        return new Playlist(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.tracks = source["tracks"];
	    }
	}

}

