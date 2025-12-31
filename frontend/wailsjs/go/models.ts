export namespace main {
	
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

