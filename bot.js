var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
const osu = require('node-osu');
const discordjs = require('discord.js');
const {google} = require('googleapis');
const weather = require('weather-js');
var SauceNAO = require('saucenao');
let jsonFile = require('jsonfile');
var readline = require("readline");
var osupp = require("ojsama");
const fetch = require('node-fetch');
const { Curl } = require('node-libcurl');
const https = require('https');
const fs = require('fs');
var parserosu = require('osu-parser');
const request = require('request');
const malScraper = require('mal-scraper')


var map;
let mySauce = new SauceNAO('ab26229a2789bbeb0b37a328f8e7dedd3cbfd703');
const osuApi = new osu.Api('6c7be649ddec2acd10e6914960eef9d7f6339aaa', {
	// baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
	notFoundAsError: true, // Throw an error on not found instead of returning nothing. (default: true)
	completeScores: true, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
	parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
	
});
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
	bot.setPresence( {game: {name:"c!help"}} );
});
var users={}
users["[Blank]"]="_-Blank-_";
users["hjrisdabest"]="hjr_is_da_best";

getAccuracy = function (count300,count100,count50,countmiss) {
		var sum = 0;

		sum += count50 * 50;
		sum += count100 * 100;
		sum += count300 * 300;

		var denom = (count50 + count100 + count300 + countmiss) * 300;

		return sum / denom;
}
	
bot.on('message', function (user, userID, channelID, message, evt) {
	if(message.includes("retard") || message.includes("retarded")){
		bot.sendMessage({
        to: channelID,
        message: 'no u'
        });
	}
	if(message.includes("bot") || message.includes("Bot")  && userID!='566216057421955074'){
		bot.sendMessage({
        to: channelID,
        message: 'who mentioned me >.>'+userID
        });
	}
	if(user[0]=="@"){user=user.replace("@","")}
	
    if (message.substring(0, 2) == 'c!') 
	{
        var args = message.substring(2).split(' ');
        var cmd = args[0];
		if(cmd=='searchAnime' || cmd=='sa')
			animuname=args[2]
			for(i=2;i<args.length;i++){animuname+=args[i]+" "}
        if (cmd=='add')
			num1=parseInt(args[1]);
			num2=parseInt(args[2]);
		if (cmd=='weather')
			loc=args[1];
		if(cmd=='osu'||cmd=='otop'||cmd=='rc')
			osuname=args[1];
		if(cmd=='sr')
			srnum=args[1];
		if(cmd=="match")
			matchid=args[1];
		if(cmd=="notify"){
			when=args[1]
			timenum=0
			timeformat="notset"
			timedmsg=""
			if(args[1]==null){when="placeholder"}
			if(args[2]==null){
				bot.sendMessage({
				to: channelID,
				message: "please include time"
			});}
			else{
				timenum=args[2]
				if (args[3]==null){
					bot.sendMessage({
					to: channelID,
					message: timenum+" what? min/sec/hour -_-"
					});	
				}
				else{
					timeformat=args[3]
					if(args[4]==null){timedmsg=" "}
					else{ for(i=4;i<args.length;i++){timedmsg+=args[i]+" "}}
					}
				}
		}
		
        //args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong! '+user
                });
            break;
			case 'age':
				num=Math.floor(Math.random() * (18 - 12) + 12);
				bot.sendMessage({
                    to: channelID,
                    message: num
				 });
            break;
			case 'add':
				bot.sendMessage({
                    to: channelID,
                    message: num1+num2
				});
            break;	
            case 'osu':
				osuApi.getUser({ u:users[user] }).then(user => {
					un=user.name;
					pp=user.pp.raw;
					bot.sendMessage({
					to: channelID,
					message: ("Username: "+un+"\n PP :"+pp)
				});
				});
			break;
			case 'otop':
				osuApi.getUserBest({ u: users[user], m:0}).then(scores => {
					console.log(scores[0].score);
					console.log(scores[0]);
					console.log(scores[0].accuracy);
					osuApi.getBeatmaps({ b: scores[0].beatmapId }).then(beatmaps => {
					console.log(beatmaps[0].beatmapSetId);
					var acc=(scores[0].accuracy*100).toFixed(2)
					thumurl="https://b.ppy.sh/thumb/"+beatmaps[0].beatmapSetId+"l.jpg"
					var bestscores= {
							color:0x0000FF,
							footer: { 
							  text: scores[0].raw_date
							},
							thumbnail:
							{
							  url:thumurl
							},
							description: "**Beatmap:** "+beatmaps[0].title+"["+beatmaps[0].version+"]"+"\n(Mapper: "+beatmaps[0].creator+")",
							author:{name:"Top Play for "+osuname},
							fields: [{
							   name:'\u200b',
							   value:`**Score: **${scores[0].score} ○ **PP: **${scores[0].pp} ○ **Accuracy: **${acc}`,
                               inline: false
							},
							{
							   name:"**Combo**",
							   value:`**${scores[0].maxCombo}**(${beatmaps[0].maxCombo})`,
							   inline: false
							},
							{
							   name:"50s",
                               value: `${scores[0].counts['50']}` ,
							   inline: true
							},
							{
							    name:"100s",
                               value: `${scores[0].counts['100']}` ,
							   inline: true
							},
							{
							    name:"300s",
                               value: `${scores[0].counts['300']}` ,
							   inline: true
							},
							{
							    name:"Miss",
                               value: `${scores[0].counts.miss}` ,
							   inline: true
							}
							]
					}
					bot.sendMessage({
					to: channelID,
					embed: bestscores
					});
					});
					
				});
			break;
			case 'traffic':
				var map= {
					color: 6826080,
					footer: { 
					  text: 'Map '
					},
					thumbnail:
					{
					  url: ''
					},
					image:{
						url: "https://www.mapquestapi.com/staticmap/v5/map?key=eDAk8SaReKJPuasMBeeKSUOQeaN3MsIG&center=Bandra-East,Mumbai,IN&size=600,400@2x"

					},
					title: '',
					url: ''
				  }
				bot.sendMessage({
				to: channelID,
				embed: map 
				
				});
			break;
			
			case 'weather':
				weather.find({search: loc, degreeType: 'F'}, function(err, result) {
					if(err) console.log(err);
					
					if (result === undefined || result.length === 0){
						bot.sendMessage({
						to: channelID,
						message: "Enter a location senpai '(〃￣ω￣〃ゞ)'" 
						});
						return;
					}
						var current = result[0].current;
						var location= result[0].location;
						var map= {
							color: 6826080,
							footer: { 
							  text: 'uwu'
							},
							thumbnail:
							{
							  url: current.imageUrl
							},
							description:`**${current.skytext}**`,
							author:{name:`Weather for ${current.observationpoint}`},
							fields: [{
							   name:"Timezone",
							   value: `UTC${location.timezone}`,
							   inline: true
							},
							{
							   name:"Degree Type",
							   value: location.degreetype ,
							   inline: true
							},
							{
							   name:"Temperature",
							   value: `${current.temperature} Degrees`,
							   inline: true
							},
							{
							   name:"Feels Like",
							   value: `${current.feelslike} Degrees` ,
							   inline: true
							},
							{
							   name:"Winds",
							   value: current.winddisplay ,
							   inline: true
							},
							{
							   name:"Humidity",
							   value: `${current.humidity}%` ,
							   inline: true
							}
							]
						}
						bot.sendMessage({
						to: channelID,
						embed: map
						});
					
				});
			break;
			case "typenothing":
				bot.simulateTyping(channelID);
			break;
			case "saucepls":
				bot.getMessages( { channelID,message }, (err, res) => {
					console.log(res[0].attachments[0].url);
					var resurl=res[0].attachments[0].url
					/*
					if(args[1]=='-y'){
						yapic.getImage({
							url: "https://static1.tgstat.com/public/images/channels/_0/82/822ecac8ab696703149dc7bb7ce2474d.jpg"
						}, (err, res) => {
						 
							console.log(res)
							console.log(err)
						});}*/						
					//if(args[1]=='-s'){
					mySauce(res[0].attachments[0].url).then((response) => {
					  var resp = response.json;
					  jsonFile.writeFile('resdata.json', response.json);
					  console.log('Request successful');
					  console.dir(response.json.results[0].data);
					  console.dir(response.json.results[0].header);
					  
					  var resinfo = JSON.stringify(resp.results[0].data);
					  var count = Object.keys(resinfo).length;
					  var resinfoFormatted =resinfo.replace(/,/g, " \n ");
					  var resinfoFormatted =resinfoFormatted.replace(/{/g, "  ");
					  var resinfoFormatted =resinfoFormatted.replace(/}/g, " ");
					  var resinfoFormatted =resinfoFormatted.replace(/"/g, " ");
					    bot.sendMessage({
						to: channelID,
						message: resinfoFormatted
					  });
					}, (error) => {
					  console.error('Request encountered an error')
					  console.dir(error.request)
					})
				});
			break;
			case "sr":
					jsonFile.readFile('resdata.json', function (err, obj) {
						
						if (err) console.error(err)
						var numpls=parseInt(args[1]);
						//console.dir(Object.entries(obj.results[0].data));
						var abcd= JSON.stringify(obj.results);
						var abcd =abcd.split("{");
						var isthisfinal = [];
						var resinfo=""
						for(i=3;i<abcd.length;i++)
						{
							if(i%3==0)
							{
								isthisfinal.push(abcd[i])
							}
						}
						//console.dir(isthisfinal) 
						//console.dir(abcd) 
						if(srnum=='-a'){
							resinfo=isthisfinal.toString();
							console.log(typeof resinfo);
						}else{
							srnum=srnum-1
							resinfo = JSON.stringify(isthisfinal[srnum]);}
						var resinfoFormatted =resinfo.replace(/,/g, " \n ");
						var resinfoFormatted =resinfoFormatted.replace(/{/g, "  ");
						var resinfoFormatted =resinfoFormatted.replace(/\\/g, "");
						var resinfoFormatted =resinfoFormatted.replace(/}/g, " ");
						var resinfoFormatted =resinfoFormatted.replace(/"/g, " ");
						bot.sendMessage({
						to: channelID,
						message: "-"+resinfoFormatted
					});
					
					  //console.dir(obj)
					  
					})
				break;
				case "rc":
					console.log(users[user]);
					osuApi.getUserRecent({ u: users[user], m:0}).then(scores => {
						//var parser = new osupp.parser();
						/*fetch('https://osu.ppy.sh/osu/67079')
						  .then( res => res.json() )
						  .then( data =>console.log(data));
						*/
						//console.log(osupp.ppv2({map: parser.map}).toString());
						
						console.log(scores[0].score);
						console.log(scores[0].beatmap.mode);
						console.log(scores[0].accuracy);
						console.log(scores[0].mods[0]);
						
						console.log(scores[0].beatmap.beatmapSetId);
						thumurl="https://b.ppy.sh/thumb/"+scores[0].beatmap.beatmapSetId+"l.jpg"
						var acc=(scores[0].accuracy*100).toFixed(2)
						var starr=scores[0].beatmap.difficulty.rating
						//starr=starr.toFixed(2)
						var modsapplied="**";
						for(i=0;i<scores[0].mods.length;i++){
							console.log(scores[0].mods[i]);
							if(scores[0].mods[i]=='NoFail'){ modsapplied+="NF";}
							if(scores[0].mods[i]=='Easy'){ modsapplied+="EZ";}
							if(scores[0].mods[i]=='TouchDevice	'){ modsapplied+="TD";}
							if(scores[0].mods[i]=='Hidden'){ modsapplied+="HD";}
							if(scores[0].mods[i]=='HardRock'){ modsapplied+="HR";}
							if(scores[0].mods[i]=='SuddenDeath'){ modsapplied+="SD";}
							if(scores[0].mods[i]=='DoubleTime'){ modsapplied+="DT";}
							if(scores[0].mods[i]=='Relax'){ modsapplied+="RX";}
							if(scores[0].mods[i]=='HalfTime'){ modsapplied+="HT";}
							if(scores[0].mods[i]=='Nightcore '){ modsapplied+="NC";}
							if(scores[0].mods[i]=='Flashlight'){ modsapplied+="FL";}
							if(scores[0].mods[i]=='Autoplay'){ modsapplied+="Auto";}
							if(scores[0].mods[i]=='SpunOut'){ modsapplied+="SO";}
							if(scores[0].mods[i]=='Relax2'){ modsapplied+="AP";}
							if(scores[0].mods[i]=='Perfect'){ modsapplied+="PF";}
						}
						if(modsapplied=="**"){modsapplied+="Nomod";}
						modsapplied+="**"
							
						spp=scores[0].pp
						var rcscores= {
							color:0x0000FF,
							footer: { 
							  text: scores[0].raw_date
							},
							thumbnail:
							{
							  url:thumurl
							},
							description: "**Beatmap:** "+scores[0].beatmap.title+"[ "+scores[0].beatmap.version+" ]"+"\n(**Mapper**: "+scores[0].beatmap.creator+") "+"**[Star Rating: **"+starr+"**] ** "+" \+"+modsapplied,
							author:{name:"Recent Play for "+users[user]},
							fields: [{
							   name:'\u200b',
							   value:`**Score: **${scores[0].score} ○ **PP: **${spp} ○ **Accuracy: **${acc}`,
                               inline: false
							},
							{
							   name:"\u200b",
							   value:`**Combo: ${scores[0].maxCombo}**(${scores[0].beatmap.maxCombo})`,
							   inline: false
							},
							{
							   name:"\u200b",
                               value: `[300s:**${scores[0].counts['300']}**/100s:**${scores[0].counts['100']}**/50s:**${scores[0].counts['50']}**/Miss:**${scores[0].counts.miss}**]` ,
							   inline: true
							}
							]
						}
						bot.sendMessage({
						to: channelID,
						embed: rcscores
						});
					},
					(error) => {
						console.error('Request encountered an error')
						console.dir(error.request)
						bot.sendMessage({
						to: channelID,
						message: "No scores found in Osu!."
						});
					});
						
				break;
				case "trc":
					console.log(users[user]);
					osuApi.getUserRecent({ u: users[user], m:1}).then(scores => {
						//var parser = new osupp.parser();
						/*fetch('https://osu.ppy.sh/osu/67079')
						  .then( res => res.json() )
						  .then( data =>console.log(data));
						*/
						//console.log(osupp.ppv2({map: parser.map}).toString());
						
						console.log(scores[0].score);
						console.log(scores[0].beatmap.mode);
						console.log(scores[0].accuracy);
						console.log(scores[0].mods[0]);
						
						console.log(scores[0].beatmap.beatmapSetId);
						thumurl="https://b.ppy.sh/thumb/"+scores[0].beatmap.beatmapSetId+"l.jpg"
						var acc=(scores[0].accuracy*100).toFixed(2)
						var starr=scores[0].beatmap.difficulty.rating
						//starr=starr.toFixed(2)
						var modsapplied="**";
						for(i=0;i<scores[0].mods.length;i++){
							console.log(scores[0].mods[i]);
							if(scores[0].mods[i]=='NoFail'){ modsapplied+="NF";}
							if(scores[0].mods[i]=='Easy'){ modsapplied+="EZ";}
							if(scores[0].mods[i]=='TouchDevice	'){ modsapplied+="TD";}
							if(scores[0].mods[i]=='Hidden'){ modsapplied+="HD";}
							if(scores[0].mods[i]=='HardRock'){ modsapplied+="HR";}
							if(scores[0].mods[i]=='SuddenDeath'){ modsapplied+="SD";}
							if(scores[0].mods[i]=='DoubleTime'){ modsapplied+="DT";}
							if(scores[0].mods[i]=='Relax'){ modsapplied+="RX";}
							if(scores[0].mods[i]=='HalfTime'){ modsapplied+="HT";}
							if(scores[0].mods[i]=='Nightcore '){ modsapplied+="NC";}
							if(scores[0].mods[i]=='Flashlight'){ modsapplied+="FL";}
							if(scores[0].mods[i]=='Autoplay'){ modsapplied+="Auto";}
							if(scores[0].mods[i]=='SpunOut'){ modsapplied+="SO";}
							if(scores[0].mods[i]=='Relax2'){ modsapplied+="AP";}
							if(scores[0].mods[i]=='Perfect'){ modsapplied+="PF";}
						}
						modsapplied+="**"
							
						spp=scores[0].pp
						var rcscores= {
							color:0x0000FF,
							footer: { 
							  text: scores[0].raw_date
							},
							thumbnail:
							{
							  url:thumurl
							},
							description: "**Beatmap:** "+scores[0].beatmap.title+"[ "+scores[0].beatmap.version+" ]"+"\n(**Mapper**: "+scores[0].beatmap.creator+") "+"**[Star Rating: **"+starr+"**] ** "+" \+"+modsapplied,
							author:{name:"Recent Play for "+users[user]},
							fields: [{
							   name:'\u200b',
							   value:`**Score: **${scores[0].score} ○ **PP: **${spp} ○ **Accuracy: **${acc}`,
                               inline: false
							},
							{
							   name:"\u200b",
							   value:`**Combo: ${scores[0].maxCombo}**(${scores[0].beatmap.maxCombo})`,
							   inline: false
							},
							{
							   name:"\u200b",
                               value: `[300s:**${scores[0].counts['300']}**/100s:**${scores[0].counts['100']}**/50s:**${scores[0].counts['50']}**/Miss:**${scores[0].counts.miss}**]` ,
							   inline: true
							}
							]
						}
						bot.sendMessage({
						to: channelID,
						embed: rcscores
						});
					},
					(error) => {
						console.error('Request encountered an error')
						console.dir(error.request)
						bot.sendMessage({
						to: channelID,
						message: "No scores found Taiko!."
						});
					});
						
				break;
				case "crc":
					console.log(users[user]);
					osuApi.getUserRecent({ u: users[user], m:2}).then(scores => {
						//var parser = new osupp.parser();
						/*fetch('https://osu.ppy.sh/osu/67079')
						  .then( res => res.json() )
						  .then( data =>console.log(data));
						*/
						//console.log(osupp.ppv2({map: parser.map}).toString());
						
						console.log(scores[0].score);
						console.log(scores[0].beatmap.mode);
						console.log(scores[0].accuracy);
						console.log(scores[0].mods[0]);
						
						console.log(scores[0].beatmap.beatmapSetId);
						thumurl="https://b.ppy.sh/thumb/"+scores[0].beatmap.beatmapSetId+"l.jpg"
						var acc=(scores[0].accuracy*100).toFixed(2)
						var starr=scores[0].beatmap.difficulty.rating
						//starr=starr.toFixed(2)
						var modsapplied="**";
						for(i=0;i<scores[0].mods.length;i++){
							console.log(scores[0].mods[i]);
							if(scores[0].mods[i]=='NoFail'){ modsapplied+="NF";}
							if(scores[0].mods[i]=='Easy'){ modsapplied+="EZ";}
							if(scores[0].mods[i]=='TouchDevice	'){ modsapplied+="TD";}
							if(scores[0].mods[i]=='Hidden'){ modsapplied+="HD";}
							if(scores[0].mods[i]=='HardRock'){ modsapplied+="HR";}
							if(scores[0].mods[i]=='SuddenDeath'){ modsapplied+="SD";}
							if(scores[0].mods[i]=='DoubleTime'){ modsapplied+="DT";}
							if(scores[0].mods[i]=='Relax'){ modsapplied+="RX";}
							if(scores[0].mods[i]=='HalfTime'){ modsapplied+="HT";}
							if(scores[0].mods[i]=='Nightcore '){ modsapplied+="NC";}
							if(scores[0].mods[i]=='Flashlight'){ modsapplied+="FL";}
							if(scores[0].mods[i]=='Autoplay'){ modsapplied+="Auto";}
							if(scores[0].mods[i]=='SpunOut'){ modsapplied+="SO";}
							if(scores[0].mods[i]=='Relax2'){ modsapplied+="AP";}
							if(scores[0].mods[i]=='Perfect'){ modsapplied+="PF";}
						}
						modsapplied+="**"
							
						spp=scores[0].pp
						var rcscores= {
							color:0x0000FF,
							footer: { 
							  text: scores[0].raw_date
							},
							thumbnail:
							{
							  url:thumurl
							},
							description: "**Beatmap:** "+scores[0].beatmap.title+"[ "+scores[0].beatmap.version+" ]"+"\n(**Mapper**: "+scores[0].beatmap.creator+") "+"**[Star Rating: **"+starr+"**] ** "+" \+"+modsapplied,
							author:{name:"Recent Play for "+users[user]},
							fields: [{
							   name:'\u200b',
							   value:`**Score: **${scores[0].score} ○ **PP: **${spp} ○ **Accuracy: **${acc}`,
                               inline: false
							},
							{
							   name:"\u200b",
							   value:`**Combo: ${scores[0].maxCombo}**(${scores[0].beatmap.maxCombo})`,
							   inline: false
							},
							{
							   name:"\u200b",
                               value: `[300s:**${scores[0].counts['300']}**/100s:**${scores[0].counts['100']}**/50s:**${scores[0].counts['50']}**/Miss:**${scores[0].counts.miss}**]` ,
							   inline: true
							}
							]
						}
						bot.sendMessage({
						to: channelID,
						embed: rcscores
						});
					},
					(error) => {
						console.error('Request encountered an error')
						console.dir(error.request)
						bot.sendMessage({
						to: channelID,
						message: "No scores found CTB!."
						});
					});
						
				break;
				case "mrc":
					console.log(users[user]);
					osuApi.getUserRecent({ u: users[user], m:3}).then(scores => {
						//var parser = new osupp.parser();
						/*fetch('https://osu.ppy.sh/osu/67079')
						  .then( res => res.json() )
						  .then( data =>console.log(data));
						*/
						//console.log(osupp.ppv2({map: parser.map}).toString());
						
						console.log(scores[0].score);
						console.log(scores[0].beatmap.mode);
						console.log(scores[0].accuracy);
						console.log(scores[0].mods[0]);
						
						console.log(scores[0].beatmap.beatmapSetId);
						thumurl="https://b.ppy.sh/thumb/"+scores[0].beatmap.beatmapSetId+"l.jpg"
						var acc=(scores[0].accuracy*100).toFixed(2)
						var starr=scores[0].beatmap.difficulty.rating
						//starr=starr.toFixed(2)
						var modsapplied="**";
						for(i=0;i<scores[0].mods.length;i++){
							console.log(scores[0].mods[i]);
							if(scores[0].mods[i]=='NoFail'){ modsapplied+="NF";}
							if(scores[0].mods[i]=='Easy'){ modsapplied+="EZ";}
							if(scores[0].mods[i]=='TouchDevice	'){ modsapplied+="TD";}
							if(scores[0].mods[i]=='Hidden'){ modsapplied+="HD";}
							if(scores[0].mods[i]=='HardRock'){ modsapplied+="HR";}
							if(scores[0].mods[i]=='SuddenDeath'){ modsapplied+="SD";}
							if(scores[0].mods[i]=='DoubleTime'){ modsapplied+="DT";}
							if(scores[0].mods[i]=='Relax'){ modsapplied+="RX";}
							if(scores[0].mods[i]=='HalfTime'){ modsapplied+="HT";}
							if(scores[0].mods[i]=='Nightcore '){ modsapplied+="NC";}
							if(scores[0].mods[i]=='Flashlight'){ modsapplied+="FL";}
							if(scores[0].mods[i]=='Autoplay'){ modsapplied+="Auto";}
							if(scores[0].mods[i]=='SpunOut'){ modsapplied+="SO";}
							if(scores[0].mods[i]=='Relax2'){ modsapplied+="AP";}
							if(scores[0].mods[i]=='Perfect'){ modsapplied+="PF";}
						}
						modsapplied+="**"
							
						spp=scores[0].pp
						var rcscores= {
							color:0x0000FF,
							footer: { 
							  text: scores[0].raw_date
							},
							thumbnail:
							{
							  url:thumurl
							},
							description: "**Beatmap:** "+scores[0].beatmap.title+"[ "+scores[0].beatmap.version+" ]"+"\n(**Mapper**: "+scores[0].beatmap.creator+") "+"**[Star Rating: **"+starr+"**] ** "+" \+"+modsapplied,
							author:{name:"Recent Play for "+users[user]},
							fields: [{
							   name:'\u200b',
							   value:`**Score: **${scores[0].score} ○ **PP: **${spp} ○ **Accuracy: **${acc}`,
                               inline: false
							},
							{
							   name:"\u200b",
							   value:`**Combo: ${scores[0].maxCombo}**(${scores[0].beatmap.maxCombo})`,
							   inline: false
							},
							{
							   name:"\u200b",
                               value: `[300s:**${scores[0].counts['300']}**/100s:**${scores[0].counts['100']}**/50s:**${scores[0].counts['50']}**/Miss:**${scores[0].counts.miss}**]` ,
							   inline: true
							}
							]
						}
						bot.sendMessage({
						to: channelID,
						embed: rcscores
						});
					},
					(error) => {
						console.error('Request encountered an error')
						console.dir(error.request)
						bot.sendMessage({
						to: channelID,
						message: "No scores found in Mania!."
						});
					});
						
				break;
				case "pp":
				//var parser = new osupp.parser()
				//const file = fs.createWriteStream('./test.osu');
				/*var download = function(url, dest, cb) {
					var file = fs.createWriteStream(dest);
					var request = https.get(url, function(response) {
					  response.pipe(file);
					  file.on('finish', function() {
						file.close(cb);
					  });
					});
				  }
				download('https://osu.ppy.sh/osu/67079','file')  */
				parserosu.parseFile('file', function (err, beatmap) {
					console.log(beatmap);
					console.log(osupp.ppv2({map: beatmap}).toString());
				})
			
				case "match":
					msg="`` Name  Total_Score Average_Score Fails``\n"
					osuApi.getMatch({ mp: '64292379' }).then(match => {
						//console.log(match.games[3].scores);
							bot.sendMessage({
							to: channelID,
							message: ("`` Name  Total_Score Average_Score Fails``")
							});
							var t=1
							gamedata= []
							var scoredata=[]
							var inddata=[]
							match.games.forEach((item) => {
								Object.entries(item).forEach(([key, val]) => {
									if(key=="scores"){
										scoredata=[]
										inddata=[]
										val.forEach((item) => {
											Object.entries(item).forEach(([key, val]) => {
												if(key=="userId" && t>4){
													inddata.push(val)	
												}
												if(key=="score" && t>4){
													inddata.push(val)	
												}
												if(key=="counts" && t>4){
													/*
													count50=val['50']
													count100=val['100']
													count300=val['300']
													countmiss=val.miss
													var su = 0;
													su += count50 * 50;
													su += count100 * 100;
													su += count300 * 300;
													console.log("sum: "+su)
													var denom =0
													denom=(val['100'] + val['300'] + val['50'] + countmiss)*300
													acc=su/denom
													console.log("denom: "+denom)*/
													inddata.push(getAccuracy(val['300'],val['100'],val['50'],val.miss) * 100)	
												}
											});
											
										});
										scoredata.push(inddata)
										
									}
								});
								t+=1
								gamedata.push(scoredata)
							});
							console.log(gamedata)
							bot.sendMessage({
							to: channelID,
							message: playerdata
							});
						});	
				break;
				case "notify":
						usertonotify=user
						
						if (timeformat=="seconds" || timeformat=="sec" || timeformat=="s" || timeformat=="second" || timeformat=="Second" || timeformat=="Seconds") {notifytime=1000}
						if (timeformat=="minutes" || timeformat=="min" || timeformat=="m" || timeformat=="minute") {notifytime=60000}
						if (timeformat=="hours" || timeformat=="Hour" || timeformat=="h" || timeformat=="hour" || timeformat=="H" || timeformat=="hrs") {notifytime=3600000}
						if(timenum!=0 && timeformat!="notset"){
							bot.sendMessage({
							to: channelID,
							message: "Ok, you will be notified in "+timenum+" "+timeformat
							});
							var timer = setTimeout (function () {
								if (timedmsg[0]=="$"){
									bot.sendMessage({
								to: channelID,
								message:timedmsg});
								}
								else{
								bot.sendMessage({
								to: channelID,
								message: "<@"+userID+"> "+timedmsg
								});}
						},timenum*notifytime); }
				break;
				case "loginmal":
					bot.sendMessage({
						to: channelID,
						message: "This feature is not yet ready."
						});
					
				break;
				case "sa":
				case "searchAnime":
					malScraper.getInfoFromName(animuname)
					  .then((data) => {
						jsonFile.writeFile('animedata.json', data);
					    console.log(data)
						var animu= {
								color:0x0000FF,
								footer: { 
								  text: `Aired: ${data.aired}`
								},
								thumbnail:
								{
								  url:data.picture
								},
								description: `English Title: **${data.englishTitle}** \n**${data.japaneseTitle}** \n Episodes: **${data.episodes} - ${data.type} **\n Genres: **${data.genres.toString()}** \n\n Score: **${data.score}/10** \n Ranked:**${data.ranked}** \n Popularity:**${data.popularity}**`,
								author:{name:data.studios[0]},
								fields: [
								{
								   name:"\u200b",
								   value: `Source:**${data.source}**` ,
								   inline: false
								},
								{
								   name:"\u200b",
								   value: `${data.url}` ,
								   inline: false
								}
								]
							}
						bot.sendMessage({
							to: channelID,
							embed: animu
							}); 
						})
						.catch((err) => {console.log(err)
							bot.sendMessage({
							to: channelID,
							message: "Eh use Official name , i am not that accurate >.<"
							});
						})
					
					break;
				case "detail":
					jsonFile.readFile('animedata.json', function (err, animedata) {
						var animudata= {
									color:0x0000FF,
									footer: { 
									  text: `Aired: ${animedata.aired}`
									},
									thumbnail:
									{
									  url:animedata.picture
									},
									description: `English Title: **${animedata.englishTitle}** \n**${animedata.japaneseTitle}** \n\n Synopsis:**${animedata.synopsis}**`,
									author:{name:animedata.studios[0]},
									fields: [
									{
									   name:"\u200b",
									   value: `${animedata.url}` ,
									   inline: false
									}
									]
								}
						bot.sendMessage({
							to: channelID,
							embed: animudata
							});
					});
					break;
					
				case "help" || "info":
					bot.sendMessage({
						to: channelID,
						message: "This feature is not yet ready."
						});
					break;
						
        }
    }
});
