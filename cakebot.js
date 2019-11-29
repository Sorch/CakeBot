let
	Eris = require("eris"),
	flatfile = require("flat-file-db"),
	config = require("./config").config;
	

function matchMention(args) {
	if(args.match(/<@(!|)(\d+)>/g)) {
		const argsmatcher = args.replace(/<@(!|)(\d+)>/gi, (match, $1) => {
			let r = new RegExp(/<@(!|)(\d+)>/g, "g").exec(match)[2];
			return r
		})
		return argsmatcher ? argsmatcher : args;
	}
}

class CakeBot {
	constructor() {
		
		if(!config.token) {
			throw new Error("A token is required");
		}
		
		this.eris = new Eris(config.token);
		this.eris.connect();
		this.initDB();
		this.handleEris(this.eris);
	}
	
	initDB() {
		this.db = flatfile('cakes.db');
		
		this.db.on("open", () => {
			console.log("db ready!");
		});
		
	}
	
	handleEris(erdata) {
		erdata.on("ready", () => {
			console.log("Ooo yeah lets do this");
		});
		
		erdata.on("messageCreate", msg => {
			if (msg.content.indexOf(config.prefix) !== 0) {
				return;
			}
			
			// Simple Command Handler for messages split into params body args..
			let
				body = msg.content.slice(config.prefix.length).split(" "),
				cmd = body[0],
				args = body.slice(1).join(" ");
				
			if(cmd == "cstats") {
				let string = "";
				if(this.db.keys().length > 0) {
					for(let key of this.db.keys()) {
						let uc = this.db.get("fun:cakes:" + key.match(/\d+/g)[0] + ":count");
						string+= erdata.users.get(key.match(/\d+/g)[0]).username + "(**" +  uc + "**) "; 
					}
					erdata.createMessage(msg.channel.id, string);
				} else {
					erdata.createMessage(msg.channel.id, "No-one has any cakes q-q");
				}
				
			};
				
			if(cmd == "cake" && !msg.author.bot) {
				let au;
				if(args != "") {
					if(matchMention(args)) {
						let mention = matchMention(args) ? matchMention(args) : msg.author.id;
						au = erdata.users.get(mention);
					};
					
				} else {
					au = msg.author;
				}
				
				if(!this.db.has("fun:cakes:" + au.id + ":count")) {
					this.db.put("fun:cakes:" + au.id + ":count", 1);
					if(au.id != msg.author.id) {
						erdata.createMessage(msg.channel.id, au.username + " now has 1 cake :cake: ^^");
					} else {
						erdata.createMessage(msg.channel.id, "You have 1 cake :cake: ^^");
					}
				} else {
					let uc = this.db.get("fun:cakes:" + au.id + ":count");
					uc += 1;
					if(au.id != msg.author.id) {
						erdata.createMessage(msg.channel.id, au.username + " now has " + uc + " cakes! :cake: ^^");
					} else {
						erdata.createMessage(msg.channel.id, "You now have " + uc + " cakes! :cake: ^^");
					}
					
					this.db.put("fun:cakes:" + au.id + ":count", uc);
				}
					
			}
			
			if(cmd == "cget" && !msg.author.bot) {
				let au;
				if(args != "") {
					//
					if(matchMention(args)) {
						let mention = matchMention(args) ? matchMention(args) : msg.author.id;
						au = erdata.users.get(mention);
					};
				} else {
					au = msg.author;
				}
				
				if(!this.db.has("fun:cakes:" + au.id + ":count")) {
					if(au.id != msg.author.id) {
						erdata.createMessage(msg.channel.id, au.username + " does not have any cakes get some with ```::cake @mention```");
					} else {
						erdata.createMessage(msg.channel.id, "You do not have any cakes get some with ```::cake```");
					}
					
				} else {
					let uc = this.db.get("fun:cakes:" + au.id + ":count");
					if(au.id != msg.author.id) {
						erdata.createMessage(msg.channel.id, au.username + " has " + uc + " cakes! :cake: ^^");
					} else {
						erdata.createMessage(msg.channel.id, "You have " + uc + " cakes! :cake: ^^");
					}
				}
			}
			
			
		});
	}
}

new CakeBot();