const convert = require("crypto-convert");
var QRCode = require('qrcode')
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("banco.json");
const db = low(adapter);
var fs = require('fs');
const Discord = require("discord.js");
const client = new Discord.Client();
const talkedRecently = new Set();

client.on("ready", () => {
  console.log(
    `+ NTHG value manager: ON! \n+ active wallets: ${client.users.size} `
  );
});

const activities_list = ["📺 Nothing Podcast", "📺 Nothing Podcast"];

client.on("ready", () => {
  setInterval(() => {
    const index = Math.floor(Math.random() * (activities_list.length - 1) + 1);
    client.user.setActivity(activities_list[index], { type: "LISTENING" });
  }, 10000);
});

client.on("message", async message => {
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  if (cmd === "!desligar") {
    if (message.author.id !== "560263335405158401")
      return message.reply("Não Encosta Em Min");
    resetBot(message.channel);
    async function resetBot(channel) {
      channel
        .send(`Desligando...`)
        .then(msg => client.destroy(true))
        .then(() =>
          client.login(
            "NjYzODEzNzIyMTU4MTM3MzY3.XhN-xQ.590VUnVFLzOToX91yv90YJLpCWw"
          )
        );
    }

    client.on("ready", () => {
      message.channel.send(`Achou Que Nao Ia Voltar!`);
    });
  }

  if (message.content === "a!listaemojis") {
    const emojiList = message.guild.emojis.map(e => e.toString()).join(" ");
    message.channel.send(emojiList);
  }
  if (cmd === ".say" || cmd === ".falar") {
    if (message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
      message.delete();
      let embed = new Discord.RichEmbed()
        .setDescription(args.join(" "))
        .setColor([135, 66, 245]);
      message.channel.send(embed);
    } else {
      message.channel.send("``📍 Você não tem permissão``");
    }
  }

  if (cmd === "!idteste") {
    let user = message.mentions.users.first() || message.author;
    console.log(user.id);
  }
  if (cmd === ".give_gen") {
    let member =
      message.mentions.members.first() || message.guild.members.get(args[0]);
    let reason = Number(args.slice(1).join(" "));
    let giftkl = db
      .get("server")
      .find({ id: member.id })
      .value().gift;
    let realval = reason + giftkl;

    if (message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
      message.channel.send(
        "``📦 Você envio " +
        reason +
        " Generators" +
        ` | Destinatario: ${member.user.username}` +
        "``"
      );
      db.get("server")
        .find({ id: member.id })
        .assign({ gift: realval })
        .write();
    } else {
      message.channel.send("``Você Não possui permissão para essa ação!``");
    }
  }
  if (cmd === ".give_btc") {
    let member =
      message.mentions.members.first() || message.guild.members.get(args[0]);
    let reason = Number(args.slice(1).join(" "));
    let giftkl = db
      .get("server")
      .find({ id: member.id })
      .value().btc;
    let realval = reason + giftkl;

    if (message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
      message.channel.send(
        "``📦 Você envio " +
        reason +
        " BTC" +
        ` | Destinatario: ${member.user.username}` +
        "``"
      );
      db.get("server")
        .find({ id: member.id })
        .assign({ btc: realval })
        .write();
    } else {
      message.channel.send("``Você Não possui permissão para essa ação!``");
    }
  }

  if (cmd === ".gen" || cmd === ".gerar") {
    function between(min, max) {
      return Math.floor(
        Math.random() * (max - min) + min
      )
    }
    resultado = between(1, 4)
    realreal = resultado / 1000000
    if (talkedRecently.has(message.author.id)) {
      message.channel.send("``⛔️ Espere 48 Hrs para gerar BTC novamente!``");
    } else {
      let bitcoin = db
        .get("server")
        .find({ id: message.author.id })
        .value().btc;
      console.log(`+ ${message.author.id} generated virtually ${realreal.toPrecision()} BTC`)
      let realval = Number(bitcoin + realreal);
      message.channel.send("``✅ Você gerou " + realreal.toPrecision() + " BTC!``");
      db.get("server")
        .find({ id: message.author.id })
        .assign({ btc: realval })
        .write();
      talkedRecently.add(message.author.id);
      setTimeout(() => {
        talkedRecently.delete(message.author.id);
      }, 172800000);
    }
  }

  if (cmd === ".pay" || cmd === ".pagar" || cmd === ".transferir") {

    let user = message.author;
    let member =
      message.mentions.members.first() || message.guild.members.get(args[0]);
    let reason = Number(args.slice(1).join(" "));
    let bitcoin = db
      .get("server")
      .find({ id: user.id })
      .value().btc;
    let ubtc = db
      .get("server")
      .find({ id: member.id })
      .value().btc;
    let realval = reason + ubtc;
    let realbtc = bitcoin - reason;
    if (bitcoin > reason) {
      message.channel.send(
        "``💰 Você enviou " +
        reason.toPrecision() +
        " BTC " +
        `| Destinatario: ${member.user.username}` +
        "``"
      );
      db.get("server")
        .find({ id: member.id })
        .assign({ btc: realval })
        .write();
      db.get("server")
        .find({ id: user.id })
        .assign({ btc: realbtc })
        .write();
      console.log(`+ transfer completed, value: ${reason.toPrecision()}`)
    } else {
      console.log(reason);
      console.log(`- transfer error`)
      message.channel.send("``Você Não possui saldo para essa ação!``");
    }
  }

  if (cmd === ".setavatar" || cmd === ".set_avatar" || cmd === ".setarfoto") {
    let bitcoin = db.get("server").find({ id: message.author.id }).value().btc;
    let patentkl = db.get("server").find({ id: message.author.id }).value().avatar;
    let patennova = args.join(" ");
    if (bitcoin > 0.0000001) {
      let realbt = Number(bitcoin - 0.0000001);
      db.get("server").find({ id: message.author.id }).assign({ btc: realbt }).write();
      db.get("server").find({ id: message.author.id }).assign({ avatar: patennova }).write();
      let i2 = new Discord.RichEmbed()
        .setAuthor(`${message.author.username} Seu avatar foi alterado com sucesso`)
        .setImage(patennova)
      message.channel.send(i2);
    } else {
      message.channel.send(
        "``" + `Você não possui BTC o suficiente! Necessario: 0.0000001 BTC` + "``"
      );
    }
  }


  if (cmd === ".delwallet" || cmd === ".del_wallet" || cmd === ".apagarcarteira" || cmd === ".apagar_carteira") {
    let dados = db
    .get("server")
    .find({ id: message.author.id })
    .value();
    console.log(`+ ${message.author.id} deleted your virtual wallet with ${dados.btc} BTC`)
    fs.unlinkSync(`wallets/${dados.code}.html`)
    db.get("server")
      .remove({ id: message.author.id })
      .write();
  
    message.channel.send("``" +"🛑 Sua Carteira Foi Excluida" + "``");
   
  }
  if (cmd === ".sync" || cmd === ".sync_wallet" || cmd === ".sincronizar" || cmd === ".sincronizar_carteira") {
    let dados = db
      .get("server")
      .find({ id: message.author.id })
      .value();
      QRCode.toDataURL(dados.code, function (err, url) {

        let btc_value = dados.btc.toPrecision()
      fs.writeFile(`wallets/${dados.code}.html`, `
      <title>📺 NTHG Wallet's</title>
      <link rel="stylesheet" type="text/css" href="style.css" media="screen" />
      <body>
          <center>
              <div class="card">
                  <div>
                      <img align="left" src="${dados.avatar}" style="width:24%" margin="10px">
                      <h2>${message.author.username}</h2>
                      <p class="title">BTC_AMOUNT: ${btc_value}</p>
                      <p class="title">ID_TAG: ${dados.code}</p>
                      <img align="center" src="${url}"style="width:15%">
                  </div>
              </div>
          </center>
          </div>
      </body>
      `, function (erro) {

        if (erro) {
          throw erro;
        }
  
        console.log(`+ ${message.author.id} synchronized your virtual wallet`);
      });
    message.channel.send("``" + `✅ Sua carteira foi sincrozinada com sucesso!` + "``");
  })
  }
  if (cmd === ".createwallet" || cmd === ".create_wallet" || cmd === ".criarcarteira" || cmd === ".criar_carteira") {
    console.log(`+ ${message.author.id}, created a new wallet`)
    function makeid(length) {
      var result = '';
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
          charactersLength));
      }
      return result;
    }
    db.get("server")
      .push({
        id: message.author.id,
        avatar: message.author.avatarURL,
        ntg: 1,
        btc: 0,
        code: makeid(20)
      })
      .write();
      let dados = db
      .get("server")
      .find({ id: message.author.id })
      .value();
      QRCode.toDataURL(dados.code, function (err, url) {

        let btc_value = dados.btc.toPrecision()
      fs.writeFile(`wallets/${dados.code}.html`, `
      <title>📺 NTHG Wallet's</title>
      <link rel="stylesheet" type="text/css" href="style.css" media="screen" />
      <body>
          <center>
              <div class="card">
                  <div>
                      <img align="left" src="${dados.avatar}" style="width:24%" margin="10px">
                      <h2>${message.author.username}</h2>
                      <p class="title">BTC_AMOUNT: ${btc_value}</p>
                      <p class="title">ID_TAG: ${dados.code}</p>
                      <img align="center" src="${url}"style="width:15%">
                  </div>
              </div>
          </center>
          </div>
      </body>
      `, function (erro) {

        if (erro) {
          throw erro;
        }
  
        console.log(`+ ${message.author.id} synchronized your virtual wallet`);
      });
    message.channel.send("``" + "✅ Carteira NTHG criada com sucesso!"+ "``");
  })
  }



  if (cmd == ".clear" || cmd === ".limpar") {
    if (message.channel.permissionsFor(message.author).has("MANAGE_MESSAGES")) {
      message.channel.bulkDelete(`${args[0]}`);
      let i2 = new Discord.RichEmbed()
        .setFooter(
          `${message.author.username} Usou Sistema de limpeza`,
          `${message.author.avatarURL}`
        )

        .setDescription("``" + `Mensagens Excluidas: ${args[0]}` + "``")
        .setColor([135, 66, 245]);
      message.channel.send(i2);
    } else {
      let i2 = new Discord.RichEmbed()
        .setFooter(
          `| ERROR`,
          "https://cdn.discordapp.com/attachments/666270453744140288/666355080358002714/scout-icon-30.png"
        )
        .setDescription(
          `${message.author.username}, VOCÊ NÂO POSSUI PERMISSÃO DE EXCLUIR MENSAGENS`
        )
        .setColor([135, 66, 245]);
      message.channel.send(i2);
    }
  }
  if (cmd === ".converter_btc" || cmd === ".converterbtc" || cmd === ".ver_real" || cmd === ".verreal" || cmd === ".seebrl" || cmd === ".see_brl" || cmd === ".converter") {
    let user = message.mentions.users.first() || message.author;
    let dados = db
      .get("server")
      .find({ id: user.id })
      .value();
    let btc_value = dados.btc.toPrecision()
    console.log(`+ ${user.id} verified a currency conversion, ${convert.BTC.BRL(btc_value)} BRL`)
    message.channel.send("```" + `👥 wallet of ${user.username}\n💸 value of your wallet in BTC ${btc_value} BTC \n💰 value of your wallet in BRL: ${convert.BTC.BRL(btc_value)} BRL` + "```");


  }
  if (cmd === ".see_btc" || cmd === ".seebtc" || cmd === ".verbtc" || cmd === ".ver_btc") {
    let user = message.mentions.users.first() || message.author;
    let dados = db
      .get("server")
      .find({ id: user.id })
      .value();
    let btc_value = dados.btc.toPrecision()
    /*
let i2 = new Discord.RichEmbed()
.setThumbnail(`${avatarkl}`)
.setDescription("```" + ` 👥 ${user.username} \n\n 💰 NTHG: ${dados.btc}      \n 📀 Capacidade: ${dados.ntg}\n 🎫 TAG: ${dados.code}` + "```");
*/
    message.channel.send("```" + `👥 wallet of ${user.username} \n💰 value in the wallet: ${btc_value} BTC` + "```");


  }
  if (cmd === ".see_bank" || cmd === ".seebank" || cmd === ".verbanco" || cmd === ".ver_banco") {
    function makeid(length) {
      var result = '';
      var characters = '🠕🠗⬍';
      var charactersLength = characters.length;
      for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
          charactersLength));
      }
      return result;
    }
    let dados = db
      .get("server")
      .find({ id: "853408207735881738" })
      .value();
    let btc_value = dados.btc.toPrecision()

    let i2 = new Discord.RichEmbed()
      .setFooter(`🎫 BANK_ID: ${dados.id}`)
      .setThumbnail("https://media.discordapp.net/attachments/853594724177805333/853602279198687272/PicsArt_06-13-08.50.20.jpg?width=676&height=676")
      .setDescription(` Private Safes: ${btc_value}      \n Cores: ${dados.ntg} \n  Forecast: ${makeid(3)}`);

    message.channel.send(i2);
  }


  if (cmd === ".wallet" || cmd === ".carteira" || cmd === ".seewallet" || cmd === ".see_wallet" || cmd === ".vercarteira" || cmd === ".ver_carteira") {

    let user = message.mentions.users.first() || message.author;

    let dados = db
      .get("server")
      .find({ id: user.id })
      .value();
    console.log(`+ ${user.id} viewed wallet`)
    let avatarkl = db
      .get("server")
      .find({ id: user.id })
      .value().avatar;
    let btc_value = dados.btc.toPrecision()

    

      let i2 = new Discord.RichEmbed()
        .setThumbnail(`${avatarkl}`)
        .setTitle(`${user.username}`)
        .setFooter(`🎫ID_TAG: ${dados.code}`)
        .setDescription(`\n\n  BTC: ${btc_value}      \n  Cores: ${dados.ntg}`);
      message.channel.send(i2);
     

  }
  if (cmd === ".help" || cmd === ".ajuda") {
    let i2 = new Discord.RichEmbed()
      .setFooter(`🎫 Version 1.54`)
      .setDescription(`.createwallet #Create a virtual wallet \n .wallet #View your wallet\n .delwallet #Delete your wallet\n .pay [@user] [value] #Transfer bitcoins to another wallet\n .see_bank #View the central bank \n .see_btc #View only your bitcoin \n .converter #Convert your bitcoins to BRL(Real)`);


    message.channel.send(i2);
  }

});
client.login("");
