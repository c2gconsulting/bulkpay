/**
 * Application Startup
 * Core Server Configuration
 */

/**
 * configure bunyan logging module for reaction server
 * See: https://github.com/trentm/node-bunyan#levels
 */
const levels = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];
const mode = process.env.NODE_ENV || "production";
let isDebug = Meteor.settings.isDebug || process.env.REACTION_DEBUG || "INFO";

if (isDebug === true || mode === "development" && isDebug !== false) {
  if (typeof isDebug !== "boolean" && typeof isDebug !== undefined) {
    isDebug = isDebug.toUpperCase();
  }
  if (!_.contains(levels, isDebug)) {
    isDebug = "WARN";
  }
}

if (process.env.VELOCITY_CI === "1") {
  formatOut = process.stdout;
} else {
  formatOut = logger.format({
    outputMode: "short",
    levelInString: false
  });
}

Core.Log = logger.bunyan.createLogger({
  name: "core",
  stream: isDebug !== "DEBUG" ? formatOut : process.stdout,
  level: "debug"
});

// set logging level
Core.Log.level(isDebug);

/**
 * Core methods (server)
 */

_.extend(Core, {
  init: function () {

    try {
      CoreRegistry.initData();
    } catch (error) {
      Core.Log.error("initData: ", error.message);
    }


    return true;
  },

  initSettings: function () {
    //Meteor.settings.intercom = {
    //  "secret": process.env.INTERCOM_APP_SECRET,
    //  "apikey": process.env.INTERCOM_APIKEY
    //};
    //
    //Meteor.settings.public.intercom = {
    //  "id": process.env.INTERCOM_APP_ID
    //};
    //
    //
    //make env vars available to client
    //allowEnv({
    //    INTERCOM_APP_ID: 1
    //})
    //
    //return true;
  },
  initAccount: function() {
    Accounts.emailTemplates.siteName = process.env.MAIL_SITE_NAME || "BulkPay™";
    Accounts.emailTemplates.from = process.env.MAIL_FROM || "BulkPay™ Team <no-reply@bulkpay.co>";

    Accounts.emailTemplates.enrollAccount.html = function (user, url) {
      console.log('login url as', url);
      let tenantDomain = Core.getCurrentDomain(user._id);
      let baseDomain = Core.getDefaultDomain();
      let tenantUrl = url.replace(baseDomain, tenantDomain);
      SSR.compileTemplate("enrollAccountNotification", Assets.getText("emailTemplates/enrollAccountNotification.html"));
      return SSR.render("enrollAccountNotification", {
              homepage: Meteor.absoluteUrl(),
              tenant: user.group,
              user: user.profile.fullName,
              thisYear: new Date().getFullYear(),
              url: url
            });
    };

    Accounts.config({
      sendVerificationEmail: true
    });

    Accounts.urls.resetPassword = function(token) {
      return Meteor.absoluteUrl('resetPassword/' + token);
    };
  },
  buildRegExp: function(searchText) {
    // temporary, upgrade
    var parts = searchText.trim().split(/[ \-\:]+/);
    return new RegExp("(" + parts.join('|') + ")", "ig");
  },

  getCurrentTenantCursor: function (userId) {
    if (userId){
      let tenantId = Partitioner.getUserGroup(userId);
      let cursor = Tenants.find({
        _id: tenantId
      });
      if (!cursor.count()) {
        Core.Log.error(`Invalid tenant info for user ${this.userId}`);
      }
      return cursor;
    }

  },
  getCurrentTenant: function (userId) {
    let cursor = this.getCurrentTenantCursor(userId);
    let collection = cursor ? cursor.fetch() : [];
    if (collection.length > 0) return collection[0];
  },
  getTenantId: function (checkUserId) {
    let userId = checkUserId || this.userId;
    if (userId) return Partitioner.getUserGroup(userId);
  },
  getCurrentDomain: function (userId) {
    let tenant  = this.getCurrentTenant(userId);
    if (tenant)
      return tenant.domains[0];
  },
  getDefaultTenant: function () {
    let domain = this.getDefaultDomain();
    let cursor = Tenants.find({
      domains: domain
    }, {
      limit: 1
    });
    let collection = cursor ? cursor.fetch() : [];
    if (collection.length > 0) return collection[0];
  },
  getDefaultTenantId: function () {
    let tenant = this.getDefaultTenant();
    if (tenant)
      return tenant._id;
  },
  getDefaultDomain: function () {
    if (Meteor.absoluteUrl()) {
      return Meteor.absoluteUrl().split("/")[2].split(":")[0];
    }
    return "localhost";
  },
  checkUserTenant: function (tenantId, userId) {
    return userId ? tenantId === Partitioner.getUserGroup(userId) : false;
  },
  getApprovalSettings: function(userId) {
    let tenant = this.getCurrentTenant(userId);
    if (tenant && tenant.settings) {
        return tenant.settings.approvals
    }
  },
  getTenantBaseCurrency: function (userId) {
    let tenant = this.getCurrentTenant(userId);
    if (tenant) {
        return tenant.baseCurrency;
    }
  },

  getAllRounding: function(userId){
    let tenant = this.getCurrentTenant(userId);
    if(tenant && tenant.settings){
        return tenant.settings.rounding;
    }
  },
  getPromotionSettings: function(userId) {
    let tenant = this.getCurrentTenant(userId);
    if(tenant && tenant.settings) {
        return tenant.settings.promotions;
    }
  },
  /*
  * Get excluded promotions order types for
  * @param {String} userId - userId, defaults to Meteor.userId()
  * @return {Array} Array - excluded order types code
  **/
  getExcludedPromotionOrderTypes: function(userId) {
    userId = userId || this.userId;
    let promotionSettings = Core.getPromotionSettings(userId);
    if (promotionSettings){
      return promotionSettings.excludedOrderTypes;
    }
  },

  startWebHooksJobs: function () {
    return webHookJobs.startJobServer();
  },

  updateDaarEmployeesWithCustomUsername: function() {
      let daarEmployeeData = [
 {
   "email": "3ZMultimedi@gmail.com",
   "firstname": "ifeanyi",
   "lastname": "oyekwe",
   "Username": "ifeanyi.oyekwe"
 },
 {
   "email": "nekkyjane2001@yahoo.com",
   "firstname": "Jane",
   "lastname": "Offor",
   "Username": "Jane.Offor"
 },
 {
   "email": "onifadebabatunde69@gmail.com",
   "firstname": "ONIFADE",
   "lastname": "BABATUNDE",
   "Username": "ONIFADE.BABATUNDE"
 },
 {
   "email": "godwinodion58@yahoo.com",
   "firstname": "Godwin",
   "lastname": "Odion",
   "Username": "Godwin.Odion"
 },
 {
   "email": "macaulayogbaki@yahoo.com",
   "firstname": "FELIX",
   "lastname": "IGENEPO",
   "Username": "FELIX.IGENEPO"
 },
 {
   "email": "oluwatosin.dokpesi@daargroup.com",
   "firstname": "OLUWATOSIN ABIMBOLA",
   "lastname": "DOKPESI",
   "Username": "OLUWATOSIN ABIMBOLA.DOKPESI"
 },
 {
   "email": "nandikdimas@yahoo.com",
   "firstname": "NANDIK",
   "lastname": "DIMAS",
   "Username": "NANDIK.DIMAS"
 },
 {
   "email": "bashirsani@yahoo.com",
   "firstname": "bashir",
   "lastname": "sani",
   "Username": "bashir.sani"
 },
 {
   "email": "peltutuodedina@yahoo.com",
   "firstname": "Oluwapelumi",
   "lastname": "Odedina",
   "Username": "Oluwapelumi.Odedina"
 },
 {
   "email": "aitkaduna@gmail.com",
   "firstname": "JOSEPH ",
   "lastname": "ADEJO",
   "Username": "JOSEPH .ADEJO"
 },
 {
   "email": "infoaitkaduna@gmail.com",
   "firstname": "Lara",
   "lastname": "Effiong",
   "Username": "Lara.Effiong"
 },
 {
   "email": "nik2bad26@yahoo.com",
   "firstname": "BADEJO",
   "lastname": "ADENIKE",
   "Username": "BADEJO.ADENIKE"
 },
 {
   "email": "oro@yahoo.com",
   "firstname": "ORONANA",
   "lastname": "OSIHRO",
   "Username": "ORONANA.OSIHRO"
 },
 {
   "email": "john.iwarue@daardroup.com",
   "firstname": "John",
   "lastname": "Iwarue, Sr.",
   "Username": "John.Iwarue, Sr."
 },
 {
   "email": "christopalace2002@yahoo.co.uk",
   "firstname": "CHRISTOPHER",
   "lastname": "OGBOBENI",
   "Username": "CHRISTOPHER.OGBOBENI"
 },
 {
   "email": "denis@yahoo.com",
   "firstname": "denis",
   "lastname": "olugah",
   "Username": "denis.olugah"
 },
 {
   "email": "adolphuswosunta@yahoo.com",
   "firstname": "ADOLPHUS",
   "lastname": "WOSUNTA",
   "Username": "ADOLPHUS.WOSUNTA"
 },
 {
   "email": "isahibrahim36@yahoo.com",
   "firstname": "Isah",
   "lastname": "Ibrahim",
   "Username": "Isah.Ibrahim"
 },
 {
   "email": "victoraledare@yahoo.co.uk",
   "firstname": "Victor",
   "lastname": "Aledare",
   "Username": "Victor.Aledare"
 },
 {
   "email": "adeoladgreat@gmail.com",
   "firstname": "kazeem",
   "lastname": "oyedele",
   "Username": "kazeem.oyedele"
 },
 {
   "email": "olakeem17@gmail.com",
   "firstname": "AKEEM",
   "lastname": "OLADEJI",
   "Username": "AKEEM.OLADEJI"
 },
 {
   "email": "davidokoli10@yahoo.com",
   "firstname": "Ushie",
   "lastname": "David",
   "Username": "Ushie.David"
 },
 {
   "email": "wale_jesus@yahoo.co.uk",
   "firstname": "ADEWALE",
   "lastname": "OGUNKUNLE",
   "Username": "ADEWALE.OGUNKUNLE"
 },
 {
   "email": "peacefulrose777@gmail.com",
   "firstname": "MORADEKE ",
   "lastname": "OMOLE",
   "Username": "MORADEKE .OMOLE"
 },
 {
   "email": "DAVIDBALA@YAHOO.COM",
   "firstname": "BALA",
   "lastname": "DAVID",
   "Username": "BALA.DAVID"
 },
 {
   "email": "ganiyuola@yahoo.com ",
   "firstname": "OLAWOYIN",
   "lastname": "GANIYU",
   "Username": "OLAWOYIN.GANIYU"
 },
 {
   "email": "tunspowerpoint@yahoo.com",
   "firstname": "tunde",
   "lastname": "akangbe",
   "Username": "tunde.akangbe"
 },
 {
   "email": "macmfoniso@gmail.com",
   "firstname": "Monday",
   "lastname": "MacMfoniso",
   "Username": "Monday.MacMfoniso"
 },
 {
   "email": "emergine2003@yahoo.com",
   "firstname": "Sunday BENJAMIN",
   "lastname": "Ikonne",
   "Username": "Sunday BENJAMIN.Ikonne"
 },
 {
   "email": "eromoseleowobu@daargroup.com",
   "firstname": "owobu",
   "lastname": "EROMOSELE",
   "Username": "owobu.EROMOSELE"
 },
 {
   "email": "marcel.anyalechi@daargroup.com",
   "firstname": "MARCELLINUS",
   "lastname": "ANYALECHI",
   "Username": "MARCELLINUS.ANYALECHI"
 },
 {
   "email": "ayodejiowoyomi@yahoo.com",
   "firstname": "OWOYOMI",
   "lastname": "LAWRENCE",
   "Username": "OWOYOMI.LAWRENCE"
 },
 {
   "email": "rfafure@yahoo.co.uk",
   "firstname": "FAFURE",
   "lastname": "ADERONKE ANNE",
   "Username": "FAFURE.ADERONKE ANNE"
 },
 {
   "email": "terhilesimon@gmail.com",
   "firstname": "IORKEGH",
   "lastname": "TERHILE SIMON",
   "Username": "IORKEGH.TERHILE SIMON"
 },
 {
   "email": "galmaaisha@yahoo.com",
   "firstname": "galma aisha",
   "lastname": "galma",
   "Username": "galma aisha.galma"
 },
 {
   "email": "mohammedsuleman@yahoo.com",
   "firstname": "mohammed",
   "lastname": "suleiman",
   "Username": "mohammed.suleiman"
 },
 {
   "email": "stephengok@yahoo.com",
   "firstname": "ADEBAYO",
   "lastname": "STEPHEN",
   "Username": "ADEBAYO.STEPHEN"
 },
 {
   "email": "adejohfrancis@yahoo.com",
   "firstname": "ADEJOH",
   "lastname": "FRANCIS",
   "Username": "ADEJOH.FRANCIS"
 },
 {
   "email": "zak@yahoo.com",
   "firstname": "zakari",
   "lastname": "mohammed",
   "Username": "zakari.mohammed"
 },
 {
   "email": "ayubachristain2015@gmail.com",
   "firstname": "Christain",
   "lastname": "Ayuba",
   "Username": "Christain.Ayuba"
 },
 {
   "email": "sanmuhammad8@gmail.com",
   "firstname": "Muhammad",
   "lastname": "Abubakar",
   "Username": "Muhammad.Abubakar"
 },
 {
   "email": "florence.mamedu@daargroup.com",
   "firstname": "FLORENCE",
   "lastname": "MAMEDU",
   "Username": "FLORENCE.MAMEDU"
 },
 {
   "email": "solajaye@yahoo.com",
   "firstname": "SOLA",
   "lastname": "JAIYESIMI",
   "Username": "SOLA.JAIYESIMI"
 },
 {
   "email": "godpower09@gmail.com",
   "firstname": "Godpower ",
   "lastname": "MARK JULIUS",
   "Username": "Godpower .MARK JULIUS"
 },
 {
   "email": "hassanss@gmail.com",
   "firstname": "SOLOMON SAMAILA",
   "lastname": "HASSAN",
   "Username": "SOLOMON SAMAILA.HASSAN"
 },
 {
   "email": "adebayotope76@yahoo.com",
   "firstname": "Emmanuel",
   "lastname": "Adebayo",
   "Username": "Emmanuel.Adebayo"
 },
 {
   "email": "tellmaquin@gmail.com",
   "firstname": "makwin",
   "lastname": "joseph",
   "Username": "makwin.joseph"
 },
 {
   "email": "info@jozenga.com",
   "firstname": "Na'adzenga",
   "lastname": "Joshua",
   "Username": "Na'adzenga.Joshua"
 },
 {
   "email": "farouk.okpanachi@daargroup.com",
   "firstname": "JIBRIL FAROUK",
   "lastname": "OKPANACHI",
   "Username": "JIBRIL FAROUK.OKPANACHI"
 },
 {
   "email": "drock4u28@yahoo.com",
   "firstname": "peter stanley",
   "lastname": "abraham",
   "Username": "peter stanley.abraham"
 },
 {
   "email": "ijeomaevelyn5@gmail.com",
   "firstname": "IJEOMA",
   "lastname": "OSAMOR",
   "Username": "IJEOMA.OSAMOR"
 },
 {
   "email": "olateejay2002@yahoo.com",
   "firstname": "OLATEJU AJOKE",
   "lastname": "OLANIYAN",
   "Username": "OLATEJU AJOKE.OLANIYAN"
 },
 {
   "email": "tallex7@gmail.com",
   "firstname": "Joshua",
   "lastname": "Oyeleye",
   "Username": "Joshua.Oyeleye"
 },
 {
   "email": "ogunlade.johnson@yahoo.com",
   "firstname": "OGUNLADE ",
   "lastname": "JOHNSON FEMI",
   "Username": "OGUNLADE .JOHNSON FEMI"
 },
 {
   "email": "INNOCENT.EMOKHOR@DAARGROUP.COM",
   "firstname": "INNOCENT ",
   "lastname": "EMOKHOR ",
   "Username": "INNOCENT .EMOKHOR "
 },
 {
   "email": "anawevictor@yahoo.co.uk",
   "firstname": "ANAWE",
   "lastname": "VICTOR",
   "Username": "ANAWE.VICTOR"
 },
 {
   "email": "greg_ugbodaga2@yahoo.com",
   "firstname": "Gregory ",
   "lastname": "Ugbodaga ",
   "Username": "Gregory .Ugbodaga "
 },
 {
   "email": "defirst_2003@yahoo.com",
   "firstname": "Hauwa",
   "lastname": "Bello-Kassim",
   "Username": "Hauwa.Bello-Kassim"
 },
 {
   "email": "lawrence.igonor@daargroup.com",
   "firstname": "LAWRENCE",
   "lastname": "IGONOR",
   "Username": "LAWRENCE.IGONOR"
 },
 {
   "email": "kasiga4real@yahoo.com",
   "firstname": "OISAMAIYE",
   "lastname": "SHUAIBU",
   "Username": "OISAMAIYE.SHUAIBU"
 },
 {
   "email": "elrhema01@gmail.com",
   "firstname": "Addah ",
   "lastname": "Rame Addah",
   "Username": "Addah .Rame Addah"
 },
 {
   "email": "patrickabulu@yahoo.com",
   "firstname": "patrick",
   "lastname": "Abulu",
   "Username": "patrick.Abulu"
 },
 {
   "email": "yemi.olufowobi@daargroup.com",
   "firstname": "Ibiyemi",
   "lastname": "Olufowobi",
   "Username": "Ibiyemi.Olufowobi"
 },
 {
   "email": "dayjerzee@yahoo.com",
   "firstname": "SULEIMAN",
   "lastname": "WAHAB",
   "Username": "SULEIMAN.WAHAB"
 },
 {
   "email": "titlavic@yahoo.com",
   "firstname": "Victoria ",
   "lastname": "Isaac ",
   "Username": "Victoria .Isaac "
 },
 {
   "email": "dupe.oladeinde@daargroup.com",
   "firstname": "MODUPEOLA ",
   "lastname": "OLADEINDE",
   "Username": "MODUPEOLA .OLADEINDE"
 },
 {
   "email": "maduchibs@yahoo.com",
   "firstname": "Christian Chibuzo Maduka",
   "lastname": "Maduka",
   "Username": "Christian Chibuzo Maduka.Maduka"
 },
 {
   "email": "bunmi_bola@yahoo.com",
   "firstname": "Olubunmi",
   "lastname": "Ogunbiyi",
   "Username": "Olubunmi.Ogunbiyi"
 },
 {
   "email": "sollazo35@yahoo.co.uk",
   "firstname": "Ellams",
   "lastname": "Sule",
   "Username": "Ellams.Sule"
 },
 {
   "email": "orllykaybest@gmail.com",
   "firstname": "Olamide kayode",
   "lastname": "Ogundowole",
   "Username": "Olamide kayode.Ogundowole"
 },
 {
   "email": "ambrosesnow@yahoo.com",
   "firstname": "OKAFOR",
   "lastname": "JOHNSON CHINEDU",
   "Username": "OKAFOR.JOHNSON CHINEDU"
 },
 {
   "email": "oche.richard@daargroup.com",
   "firstname": "RICHARD",
   "lastname": "PETER OCHE",
   "Username": "RICHARD.PETER OCHE"
 },
 {
   "email": "info.aitjos@yahoo.com",
   "firstname": "Stevie",
   "lastname": "Ayua",
   "Username": "Stevie.Ayua"
 },
 {
   "email": "dolamide99@yahoo.com ",
   "firstname": "DAVID",
   "lastname": "ADEKUNLE ",
   "Username": "DAVID.ADEKUNLE "
 },
 {
   "email": "ABEJIDEABEJIDEOLUWAKEMI@YAHOO.COM",
   "firstname": "OLUWAKEMI",
   "lastname": "ABEJIDE",
   "Username": "OLUWAKEMI.ABEJIDE"
 },
 {
   "email": "abimbola.cbn@gmail.com",
   "firstname": "Abimbola ",
   "lastname": "Otusanya",
   "Username": "Abimbola .Otusanya"
 },
 {
   "email": "jeweltreasure805@gmail.com",
   "firstname": "Titus ",
   "lastname": "Usman ",
   "Username": "Titus .Usman "
 },
 {
   "email": "growingpainsng@gmail.com",
   "firstname": "jamal",
   "lastname": "oamen",
   "Username": "jamal.oamen"
 },
 {
   "email": "obiajuru2006@yahoo.co.uk",
   "firstname": "henrietta ",
   "lastname": "iwerunmor",
   "Username": "henrietta .iwerunmor"
 },
 {
   "email": "benechika@yahoo.com",
   "firstname": "Okolo",
   "lastname": "Benedette",
   "Username": "Okolo.Benedette"
 },
 {
   "email": "benjiroegbu@yahoo.com",
   "firstname": "IROEGBU",
   "lastname": "GODWILL B.C",
   "Username": "IROEGBU.GODWILL B.C"
 },
 {
   "email": "odiorambrose@yahoo.co.uk",
   "firstname": "odior",
   "lastname": "Ambrose",
   "Username": "odior.Ambrose"
 },
 {
   "email": "nnekie1000@gmail.com",
   "firstname": "Patience",
   "lastname": "Nneka",
   "Username": "Patience.Nneka"
 },
 {
   "email": "tanasir2010@yahoo.co.uk",
   "firstname": "ALFRED",
   "lastname": "NASIR",
   "Username": "ALFRED.NASIR"
 },
 {
   "email": "jonahudofia4life@gmail.com",
   "firstname": "JONAH ",
   "lastname": "UDOFIA EKOP",
   "Username": "JONAH .UDOFIA EKOP"
 },
 {
   "email": "apostjony2006@yahoo.com",
   "firstname": "john ",
   "lastname": "opiughie",
   "Username": "john .opiughie"
 },
 {
   "email": "sissykikku14@gmail.com",
   "firstname": "Siene",
   "lastname": "Ogbonna",
   "Username": "Siene.Ogbonna"
 },
 {
   "email": "yomikwara@yahoo.com",
   "firstname": "Pius",
   "lastname": "Iyaniwura",
   "Username": "Pius.Iyaniwura"
 },
 {
   "email": "omotoshofemi@ymail.com",
   "firstname": "OLUFEMI",
   "lastname": "OMOTOSHO",
   "Username": "OLUFEMI.OMOTOSHO"
 },
 {
   "email": "glooksmia2007@yahoo.com",
   "firstname": "Agbonma",
   "lastname": "Ogbaki",
   "Username": "Agbonma.Ogbaki"
 },
 {
   "email": "jonsula@yahoo.com",
   "firstname": "Osarumwense Johnson",
   "lastname": "Osula",
   "Username": "Osarumwense Johnson.Osula"
 },
 {
   "email": "eli4love2004@yahoo.com",
   "firstname": "Elijah",
   "lastname": "Olonge",
   "Username": "Elijah.Olonge"
 },
 {
   "email": "estor4real@yahoo.com",
   "firstname": "ADEDOYIN",
   "lastname": "ESTHER",
   "Username": "ADEDOYIN.ESTHER"
 },
 {
   "email": "ebare2010@gmail.com",
   "firstname": "Callistus",
   "lastname": "Ebare",
   "Username": "Callistus.Ebare"
 },
 {
   "email": "olywey@yahoo.co.uk",
   "firstname": "TAIWO",
   "lastname": "OLOWOYEYE",
   "Username": "TAIWO.OLOWOYEYE"
 },
 {
   "email": "abluv74@yahoo.com",
   "firstname": "ELLAMS",
   "lastname": "ABIBAT",
   "Username": "ELLAMS.ABIBAT"
 },
 {
   "email": "bulgero@yahoo.com",
   "firstname": "Bulus",
   "lastname": "Maigari",
   "Username": "Bulus.Maigari"
 },
 {
   "email": "pnwaonicha@yahoo.com",
   "firstname": "patience",
   "lastname": "Nwaonicha",
   "Username": "patience.Nwaonicha"
 },
 {
   "email": "alimaellams@yahoo.com",
   "firstname": "ALIMA",
   "lastname": "ELLAMS",
   "Username": "ALIMA.ELLAMS"
 },
 {
   "email": "tellamss@gmail.com",
   "firstname": "ABDULTELEBI",
   "lastname": "ELLAMS ",
   "Username": "ABDULTELEBI.ELLAMS "
 },
 {
   "email": "igonord@yahoo.com",
   "firstname": "igonor",
   "lastname": "dorcas mwuese",
   "Username": "igonor.dorcas mwuese"
 },
 {
   "email": "felixowolex@yahoo.com",
   "firstname": " Felix ",
   "lastname": "Adeniran",
   "Username": " Felix .Adeniran"
 },
 {
   "email": "uju_eu@yahoo.com",
   "firstname": "Ndude",
   "lastname": "Ujunwa",
   "Username": "Ndude.Ujunwa"
 },
 {
   "email": "stanleyaghalanya@yahoo.com",
   "firstname": "STANLEY",
   "lastname": "AGHALANYA",
   "Username": "STANLEY.AGHALANYA"
 },
 {
   "email": "akasomesait@gmail.com",
   "firstname": "AKASOMY O.PETER",
   "lastname": "OHENHEN",
   "Username": "AKASOMY O.PETER.OHENHEN"
 },
 {
   "email": "ST.JOSHUA@OUTLOOK.COM",
   "firstname": "JOSHUA",
   "lastname": "SORINDE",
   "Username": "JOSHUA.SORINDE"
 },
 {
   "email": "chiomaemechebe@yahoo.co.uk",
   "firstname": "chioma",
   "lastname": "Emechebe",
   "Username": "chioma.Emechebe"
 },
 {
   "email": "b.akaba@yahoo.co.uk",
   "firstname": "Akaba",
   "lastname": "Blessing",
   "Username": "Akaba.Blessing"
 },
 {
   "email": "waldan4real@gmail.com",
   "firstname": "ATANDA",
   "lastname": "OLAWALE",
   "Username": "ATANDA.OLAWALE"
 },
 {
   "email": "nifeajib@yahoo.com",
   "firstname": "Oluwanifesimi",
   "lastname": "Ajibade",
   "Username": "Oluwanifesimi.Ajibade"
 },
 {
   "email": "fefe4jako@yahoo.com",
   "firstname": "Felicia",
   "lastname": "Idudu",
   "Username": "Felicia.Idudu"
 },
 {
   "email": "namure.edoimioya@daargroup.com",
   "firstname": "JOY",
   "lastname": "EDOIMIOYA",
   "Username": "JOY.EDOIMIOYA"
 },
 {
   "email": "ellams3@yahoo.com",
   "firstname": "ABASS",
   "lastname": "ELLAMS",
   "Username": "ABASS.ELLAMS"
 },
 {
   "email": "tojujeremy@yahoo.co.uk",
   "firstname": "Toritseju",
   "lastname": "Jeremy",
   "Username": "Toritseju.Jeremy"
 },
 {
   "email": "queensoniauzosike@gmail.com",
   "firstname": "Uzosike",
   "lastname": "Queensonia Chinwenwa",
   "Username": "Uzosike.Queensonia Chinwenwa"
 },
 {
   "email": "said2sas@yahoo.com",
   "firstname": "SEIDU",
   "lastname": "SHAIBU",
   "Username": "SEIDU.SHAIBU"
 },
 {
   "email": "celinanwamara@gmail.com",
   "firstname": "Celina",
   "lastname": "Nwamara",
   "Username": "Celina.Nwamara"
 },
 {
   "email": "mayowamarrus@gmail.com",
   "firstname": "MAYOWA",
   "lastname": "MARAIYESA",
   "Username": "MAYOWA.MARAIYESA"
 },
 {
   "email": "kolahaastrop@gmail.com",
   "firstname": "ADEKOLA LAWRENCE",
   "lastname": "HAASTRUP",
   "Username": "ADEKOLA LAWRENCE.HAASTRUP"
 },
 {
   "email": "toyosiigeplatform@gmail.com",
   "firstname": "TOYOSI TOBI",
   "lastname": "IGE",
   "Username": "TOYOSI TOBI.IGE"
 },
 {
   "email": "gladyrich_gladyrich@yahoo.com",
   "firstname": "MOKIDI",
   "lastname": "GLADYS",
   "Username": "MOKIDI.GLADYS"
 },
 {
   "email": "numezurike@yahoo.co.uk",
   "firstname": "NNENNA",
   "lastname": "UMEZURIKE",
   "Username": "NNENNA.UMEZURIKE"
 },
 {
   "email": "Obasaadebayo7@gmail.com",
   "firstname": "OBASA",
   "lastname": "ADEBAYO",
   "Username": "OBASA.ADEBAYO"
 },
 {
   "email": "ajibolajohngaruba@yahoo.com",
   "firstname": "ajibola ",
   "lastname": "john",
   "Username": "ajibola .john"
 },
 {
   "email": "donsaviour01@gmail.com",
   "firstname": "Saviour",
   "lastname": "Ebong",
   "Username": "Saviour.Ebong"
 },
 {
   "email": "taiyejoseph25@gmail.com",
   "firstname": "TAIWO JOSEPH",
   "lastname": "OGUNNIYI",
   "Username": "TAIWO JOSEPH.OGUNNIYI"
 },
 {
   "email": "jamesagiri@yahoo.com",
   "firstname": "James",
   "lastname": "Jokotola",
   "Username": "James.Jokotola"
 },
 {
   "email": "oobahaya@yahoo.com",
   "firstname": "OMOLERE BEAUTY",
   "lastname": "OLATAWURA",
   "Username": "OMOLERE BEAUTY.OLATAWURA"
 },
 {
   "email": "fehintd@gmail.com",
   "firstname": "FEHINTOLA",
   "lastname": "DERE",
   "Username": "FEHINTOLA.DERE"
 },
 {
   "email": "markasmal@yahoo.com",
   "firstname": "OKPOKPO",
   "lastname": "ALASAN",
   "Username": "OKPOKPO.ALASAN"
 },
 {
   "email": "adamuenock73@gmail.com",
   "firstname": "ADAMU",
   "lastname": "ENOCK",
   "Username": "ADAMU.ENOCK"
 },
 {
   "email": "ellams.sanusi@yahoo.com",
   "firstname": "ELLAMS",
   "lastname": "SANUSI OMOH",
   "Username": "ELLAMS.SANUSI OMOH"
 },
 {
   "email": "terverr@yahoo.com",
   "firstname": "TERVERR",
   "lastname": "TYAV",
   "Username": "TERVERR.TYAV"
 },
 {
   "email": "solomonokhosagah@gmail.com",
   "firstname": "solomon",
   "lastname": "okhosagah",
   "Username": "solomon.okhosagah"
 },
 {
   "email": "iadenike54@yahoo.com",
   "firstname": "AKOMOLAFE",
   "lastname": "ADENIKE",
   "Username": "AKOMOLAFE.ADENIKE"
 },
 {
   "email": "saigbotsua@yahoo.com",
   "firstname": "Sarah",
   "lastname": "Osanyinlusi",
   "Username": "Sarah.Osanyinlusi"
 },
 {
   "email": "femigabriel01@gmail.com",
   "firstname": "Oluwafemi Alex",
   "lastname": "Gabriel",
   "Username": "Oluwafemi Alex.Gabriel"
 },
 {
   "email": "jonahkings75@gmail.com",
   "firstname": "kingsley",
   "lastname": "izuchukwu",
   "Username": "kingsley.izuchukwu"
 },
 {
   "email": "emmagbe05@gmail.com",
   "firstname": "emmanuel",
   "lastname": "akhigbe",
   "Username": "emmanuel.akhigbe"
 },
 {
   "email": "lamisaidu@gmail.com",
   "firstname": "Binta",
   "lastname": "saidu",
   "Username": "Binta.saidu"
 },
 {
   "email": "paulashonline@yahoo.co.uk",
   "firstname": "paul",
   "lastname": "Aiwansoba",
   "Username": "paul.Aiwansoba"
 },
 {
   "email": "mbasirikejoshua48@gmail.com",
   "firstname": "Mbasirike ",
   "lastname": "DOUBRA",
   "Username": "Mbasirike .DOUBRA"
 },
 {
   "email": "blessygurl@yahoo.co.uk",
   "firstname": "BLESSING",
   "lastname": "USMAN",
   "Username": "BLESSING.USMAN"
 },
 {
   "email": "yemcoleg@yahoo.com",
   "firstname": "Yemisi",
   "lastname": "Comfort",
   "Username": "Yemisi.Comfort"
 },
 {
   "email": "stellynd@yahoo.com",
   "firstname": "Stella",
   "lastname": "anyanwu",
   "Username": "Stella.anyanwu"
 },
 {
   "email": "fubara70@yahoo.com",
   "firstname": "Fubara",
   "lastname": "Dappa",
   "Username": "Fubara.Dappa"
 },
 {
   "email": "emmanologun@yahoo.ca",
   "firstname": "Ayodeji",
   "lastname": "Ologun",
   "Username": "Ayodeji.Ologun"
 },
 {
   "email": "evbotadave@yahoo.com",
   "firstname": "DAVID",
   "lastname": "EVBOTA",
   "Username": "DAVID.EVBOTA"
 },
 {
   "email": "femikayode2@yahoo.com",
   "firstname": "Femi",
   "lastname": "Ogundipe",
   "Username": "Femi.Ogundipe"
 },
 {
   "email": "agadamargaret@gmail.com",
   "firstname": "margaret",
   "lastname": "agada-mba",
   "Username": "margaret.agada-mba"
 },
 {
   "email": "aburuqayah1430@yahoo.com",
   "firstname": "ABDULKADIR ",
   "lastname": "IBRAHIM ",
   "Username": "ABDULKADIR .IBRAHIM "
 },
 {
   "email": "esychristlike@gmail.com",
   "firstname": "Esther",
   "lastname": "Egbuti",
   "Username": "Esther.Egbuti"
 },
 {
   "email": "structuresmedia@gmail.com",
   "firstname": "Sunday",
   "lastname": "Olayiwola",
   "Username": "Sunday.Olayiwola"
 },
 {
   "email": "tttyav@gmail.com",
   "firstname": "Theophilus",
   "lastname": "Tyav",
   "Username": "Theophilus.Tyav"
 },
 {
   "email": "riches247@ymail.com",
   "firstname": "Chuku",
   "lastname": "Nkesi",
   "Username": "Chuku.Nkesi"
 },
 {
   "email": "risikatoderinde001@gmail.com",
   "firstname": "RISIKAT",
   "lastname": "ODERINDE",
   "Username": "RISIKAT.ODERINDE"
 },
 {
   "email": "chrisikems@yahoo.com",
   "firstname": "Christopher",
   "lastname": "Ikems",
   "Username": "Christopher.Ikems"
 },
 {
   "email": "okoliejikeme@gmail.com",
   "firstname": "Anthony ",
   "lastname": "Ejike",
   "Username": "Anthony .Ejike"
 },
 {
   "email": "joe_nafo@yahoo.com",
   "firstname": "Joseph",
   "lastname": "Nafo",
   "Username": "Joseph.Nafo"
 },
 {
   "email": "idrisyahyaalfa@yahoo.com",
   "firstname": "Idris",
   "lastname": "Yahaya Alfa",
   "Username": "Idris.Yahaya Alfa"
 },
 {
   "email": "martinsalamu4real@yahoo.com",
   "firstname": "MARTINS",
   "lastname": "ALAMU",
   "Username": "MARTINS.ALAMU"
 },
 {
   "email": "ijadus007@gmail.com",
   "firstname": "Ijaduwa",
   "lastname": "James",
   "Username": "Ijaduwa.James"
 },
 {
   "email": "kenseries007@gmail.com",
   "firstname": "KENNETH ",
   "lastname": "NWOBI",
   "Username": "KENNETH .NWOBI"
 },
 {
   "email": "okochally@yahoo.com",
   "firstname": "charles ",
   "lastname": "Okoro",
   "Username": "charles .Okoro"
 },
 {
   "email": "dappapaks@yahoo.com",
   "firstname": "PAKARIAYI ",
   "lastname": "DAPPA",
   "Username": "PAKARIAYI .DAPPA"
 },
 {
   "email": "chukwuneme24@gmail.com",
   "firstname": "Chukwunaeme",
   "lastname": "Obiejesi",
   "Username": "Chukwunaeme.Obiejesi"
 },
 {
   "email": "info.aitmaiduguri@yahoo.com",
   "firstname": "Kaka",
   "lastname": "Ismail",
   "Username": "Kaka.Ismail"
 },
 {
   "email": "mohammedabbagulumba@gmail.com",
   "firstname": "Mohammed ",
   "lastname": "Gulumba ",
   "Username": "Mohammed .Gulumba "
 },
 {
   "email": "nwankwerendu@yahoo.com",
   "firstname": "Ndukwe ",
   "lastname": "Nwankwere ",
   "Username": "Ndukwe .Nwankwere "
 },
 {
   "email": "obianujuume@yahoo.com",
   "firstname": "OBIANUJU",
   "lastname": "ANYACHEBELU",
   "Username": "OBIANUJU.ANYACHEBELU"
 },
 {
   "email": "fruitshouseglobal@gmail.com",
   "firstname": "OLAIDE",
   "lastname": "ABIOYE",
   "Username": "OLAIDE.ABIOYE"
 },
 {
   "email": "akinropoadekunle@yahoo.com",
   "firstname": "AKINROPO",
   "lastname": "ADEKUNLE",
   "Username": "AKINROPO.ADEKUNLE"
 },
 {
   "email": "engrmokwcd@yahoo.co.uk",
   "firstname": "Olubunmi",
   "lastname": "Kadiri",
   "Username": "Olubunmi.Kadiri"
 },
 {
   "email": "daveugochukwu@yahoo.com",
   "firstname": "UGOCHUKWU",
   "lastname": "NWOKONTA",
   "Username": "UGOCHUKWU.NWOKONTA"
 },
 {
   "email": "DAARGROUP4LIFE@GMAIL.COM",
   "firstname": "OBIOMA",
   "lastname": "OBURUOGA",
   "Username": "OBIOMA.OBURUOGA"
 },
 {
   "email": "ladamark75@yahoo.com",
   "firstname": "Mark",
   "lastname": "Ugwi",
   "Username": "Mark.Ugwi"
 },
 {
   "email": "tripster009@yahoo.co.uk",
   "firstname": "NKIRUKA",
   "lastname": "UDOM",
   "Username": "NKIRUKA.UDOM"
 },
 {
   "email": "ojrufolf2000@yahoo.com",
   "firstname": "Joseph",
   "lastname": "Osademe",
   "Username": "Joseph.Osademe"
 },
 {
   "email": "VINNYGREAT95@YAHOO.COM",
   "firstname": "EKPE",
   "lastname": "VINCENT",
   "Username": "EKPE.VINCENT"
 },
 {
   "email": "taiwoluwasola@yahoo.com",
   "firstname": "OLUWASOLA",
   "lastname": "TAIWO",
   "Username": "OLUWASOLA.TAIWO"
 },
 {
   "email": "ogola.onazi@daargroup.com",
   "firstname": "OGOLA",
   "lastname": "ONAZI",
   "Username": "OGOLA.ONAZI"
 },
 {
   "email": "oneandonly_joy@haoo.com",
   "firstname": "ajara joy",
   "lastname": "Imodibie",
   "Username": "ajara joy.Imodibie"
 },
 {
   "email": "kaluoke2@yahoo.com",
   "firstname": "KALU",
   "lastname": "OKE",
   "Username": "KALU.OKE"
 },
 {
   "email": "vivnwoha@gmail.com",
   "firstname": "Vivian",
   "lastname": "Nwoha",
   "Username": "Vivian.Nwoha"
 },
 {
   "email": "vicokosagah@yahoo.co.uk",
   "firstname": "OKOSAGAH",
   "lastname": "ALIMIKHENA VICTOR",
   "Username": "OKOSAGAH.ALIMIKHENA VICTOR"
 },
 {
   "email": "yomexs@yahoo.com",
   "firstname": "RAHEEM",
   "lastname": "ADEKEYE",
   "Username": "RAHEEM.ADEKEYE"
 },
 {
   "email": "deanimafen@gmail.com",
   "firstname": "DEAN",
   "lastname": "IMAFEN",
   "Username": "DEAN.IMAFEN"
 },
 {
   "email": "amykay4real@yahoo.com",
   "firstname": "chiamaka",
   "lastname": "Obi-Okafor",
   "Username": "chiamaka.Obi-Okafor"
 },
 {
   "email": "helenohuizu@gmail.com",
   "firstname": "Helen ",
   "lastname": "Ukeje-Ohuizu",
   "Username": "Helen .Ukeje-Ohuizu"
 },
 {
   "email": "cheokocha@yahoo.com",
   "firstname": "Uche",
   "lastname": "Okocha",
   "Username": "Uche.Okocha"
 },
 {
   "email": "reginacc2002@yahoo.com",
   "firstname": "REGINA",
   "lastname": "OLA-IBIYINKA",
   "Username": "REGINA.OLA-IBIYINKA"
 },
 {
   "email": "salamiabass2011@yahoo.com",
   "firstname": "ABASS",
   "lastname": "IYANDA",
   "Username": "ABASS.IYANDA"
 },
 {
   "email": "muellams@gmail.com",
   "firstname": "MURTALA",
   "lastname": "ELLAMS ",
   "Username": "MURTALA.ELLAMS "
 },
 {
   "email": "adeniyiolusegun@gmail.com",
   "firstname": "ADENIYI",
   "lastname": "OLUSEGUN MICHAEL",
   "Username": "ADENIYI.OLUSEGUN MICHAEL"
 },
 {
   "email": "revival143@yahoo.com",
   "firstname": "Afolabi",
   "lastname": "Revival",
   "Username": "Afolabi.Revival"
 },
 {
   "email": "tonerro12@yahoo.com",
   "firstname": "Anthony",
   "lastname": "Osigwe",
   "Username": "Anthony.Osigwe"
 },
 {
   "email": "christabelokah@yahoo.com",
   "firstname": "CHRISTABEL ",
   "lastname": "EMMA-OKAH",
   "Username": "CHRISTABEL .EMMA-OKAH"
 },
 {
   "email": "hauwaumarbuba@gmail.com",
   "firstname": "Hauwa",
   "lastname": "Umar Buba",
   "Username": "Hauwa.Umar Buba"
 },
 {
   "email": "vnguseer@ymail.com",
   "firstname": "vivian",
   "lastname": "JIME",
   "Username": "vivian.JIME"
 },
 {
   "email": "ngoziogaga1@gmail.com",
   "firstname": "Attah",
   "lastname": "Ngozi Patience",
   "Username": "Attah.Ngozi Patience"
 },
 {
   "email": "kess2009@yahoo.com",
   "firstname": "ESTHER",
   "lastname": "EMEZI",
   "Username": "ESTHER.EMEZI"
 },
 {
   "email": "oghie2kone@yahoo.com",
   "firstname": "YAHAYA ",
   "lastname": "DOKPESI",
   "Username": "YAHAYA .DOKPESI"
 },
 {
   "email": "amihsmem@yahoo.com",
   "firstname": "memshima",
   "lastname": "jooji obiapi",
   "Username": "memshima.jooji obiapi"
 },
 {
   "email": "idornigiemavis@yahoo.com",
   "firstname": "MAVIS",
   "lastname": "IDORNIGIE",
   "Username": "MAVIS.IDORNIGIE"
 },
 {
   "email": "emmashie2004@yahoo.com",
   "firstname": "OSHIE",
   "lastname": "EMMANUEL",
   "Username": "OSHIE.EMMANUEL"
 },
 {
   "email": "patifymark@yahoo.com ",
   "firstname": "Patrick ",
   "lastname": "Mark ",
   "Username": "Patrick .Mark "
 },
 {
   "email": "dhuthman@yahoo.com",
   "firstname": "LANRE",
   "lastname": "HUTHMAN",
   "Username": "LANRE.HUTHMAN"
 },
 {
   "email": "Meyente@gmail.com",
   "firstname": "ELIZABETH MEYENTE ",
   "lastname": "TUWEKE",
   "Username": "ELIZABETH MEYENTE .TUWEKE"
 },
 {
   "email": "perrytobi24@gmail.com",
   "firstname": "TUKUWEI",
   "lastname": "PEREMOBOWEI JOSEPH",
   "Username": "TUKUWEI.PEREMOBOWEI JOSEPH"
 },
 {
   "email": "PRINCEGABSKIB2@YAHOO.COM",
   "firstname": "GABRIEL",
   "lastname": "EMUBENJERE",
   "Username": "GABRIEL.EMUBENJERE"
 },
 {
   "email": "nwaogoikhianos@gmail.com",
   "firstname": "AUGUSTA",
   "lastname": "IKHIANOSIMHE",
   "Username": "AUGUSTA.IKHIANOSIMHE"
 },
 {
   "email": "hizhollaboy@gmail.com",
   "firstname": "Joseph",
   "lastname": "Adesuyan",
   "Username": "Joseph.Adesuyan"
 },
 {
   "email": "billieblessing@yahoo.com",
   "firstname": "NWOGU",
   "lastname": "BARIKISU AVOYI",
   "Username": "NWOGU.BARIKISU AVOYI"
 },
 {
   "email": "ACHILOKOGODWIN@gmail.com",
   "firstname": "GODWIN ONOJA",
   "lastname": "ACHILOKO",
   "Username": "GODWIN ONOJA.ACHILOKO"
 },
 {
   "email": "taiwonta65@yahoo.com",
   "firstname": "OYENUBI",
   "lastname": "NURUDEEN ADEKUNLE",
   "Username": "OYENUBI.NURUDEEN ADEKUNLE"
 },
 {
   "email": "feefeelo2002@yahoo.com",
   "firstname": "feefeelo",
   "lastname": "peter kere",
   "Username": "feefeelo.peter kere"
 },
 {
   "email": "ADESANYATOLANI@GMAIL.COM",
   "firstname": "ZAIDAT",
   "lastname": "TOLANI",
   "Username": "ZAIDAT.TOLANI"
 },
 {
   "email": "essiendave@yahoo.com",
   "firstname": "Essien",
   "lastname": "David,philip",
   "Username": "Essien.David,philip"
 },
 {
   "email": "kajogbolababajide@gmail.com ",
   "firstname": "Sikirulah",
   "lastname": "Kajogbola",
   "Username": "Sikirulah.Kajogbola"
 },
 {
   "email": "kelloveworld@yahoo.com",
   "firstname": "KELVIN",
   "lastname": "EGBO",
   "Username": "KELVIN.EGBO"
 },
 {
   "email": "adewale07@gmail.com",
   "firstname": "ADEWALE MICHEAL",
   "lastname": "ONI",
   "Username": "ADEWALE MICHEAL.ONI"
 },
 {
   "email": "inengitet@gmail.com",
   "firstname": "TONYE",
   "lastname": "INENGITE",
   "Username": "TONYE.INENGITE"
 },
 {
   "email": "deejay_xsmart@yahoo.com",
   "firstname": "gabriel",
   "lastname": "Rosanwo",
   "Username": "gabriel.Rosanwo"
 },
 {
   "email": "hamzabunu@gmail.com",
   "firstname": "HAMZA BUNU",
   "lastname": "SANDLA",
   "Username": "HAMZA BUNU.SANDLA"
 },
 {
   "email": "sundaytisa1976@yahoo.com",
   "firstname": "Sunday",
   "lastname": "Tisa",
   "Username": "Sunday.Tisa"
 },
 {
   "email": "allisonebikemi@gmail.com",
   "firstname": "ALLISON",
   "lastname": "EBIKEMI",
   "Username": "ALLISON.EBIKEMI"
 },
 {
   "email": "mellivill@yahoo.com",
   "firstname": "DIEPREYE",
   "lastname": "BROWNSFORD",
   "Username": "DIEPREYE.BROWNSFORD"
 },
 {
   "email": "cellyngreene@gmail.com",
   "firstname": "CELINA",
   "lastname": "DUBLIN - GREENE",
   "Username": "CELINA.DUBLIN - GREENE"
 },
 {
   "email": "sunny_ay2003@yahoo.com",
   "firstname": "SUNDAY",
   "lastname": "OSUNBIYI",
   "Username": "SUNDAY.OSUNBIYI"
 },
 {
   "email": "nerostar1@yahoo.com",
   "firstname": "esther",
   "lastname": "okwoju",
   "Username": "esther.okwoju"
 },
 {
   "email": "indahmohammed2013@gmail.com",
   "firstname": "MOHAMMED",
   "lastname": "INDAH",
   "Username": "MOHAMMED.INDAH"
 },
 {
   "email": "fabralph@yahoo.com",
   "firstname": "Afolabi Raphael",
   "lastname": "Fabonmi",
   "Username": "Afolabi Raphael.Fabonmi"
 },
 {
   "email": "nkoliemenari2000@yahoo.co.uk",
   "firstname": "NKOLI",
   "lastname": "OMHOUDU",
   "Username": "NKOLI.OMHOUDU"
 },
 {
   "email": "anietiesamuel336@gmail.com",
   "firstname": "samuel",
   "lastname": "marcus",
   "Username": "samuel.marcus"
 },
 {
   "email": "johnjacob4real@yahoo.com",
   "firstname": "JOHN",
   "lastname": "JACOB",
   "Username": "JOHN.JACOB"
 },
 {
   "email": "Obyezissi@gmail.com",
   "firstname": "OBY",
   "lastname": "OKOYE",
   "Username": "OBY.OKOYE"
 },
 {
   "email": "timmathias64@gmail.com",
   "firstname": "Mathias",
   "lastname": "Timawus",
   "Username": "Mathias.Timawus"
 },
 {
   "email": "patienceowe@yahoo.com",
   "firstname": "OWE",
   "lastname": "PATIENCE",
   "Username": "OWE.PATIENCE"
 },
 {
   "email": "raphaelperekpo@gmail.com",
   "firstname": "Raphael",
   "lastname": "Perekpo",
   "Username": "Raphael.Perekpo"
 },
 {
   "email": "odionpaul@rocketmail.com",
   "firstname": "Paul",
   "lastname": "Animadu",
   "Username": "Paul.Animadu"
 },
 {
   "email": "soji.ojomu1@gmail.com",
   "firstname": "Folasoji",
   "lastname": "Ojomu",
   "Username": "Folasoji.Ojomu"
 },
 {
   "email": "neotoyin4real77@yahoo.com",
   "firstname": "Oluwatoyin",
   "lastname": "Alabi",
   "Username": "Oluwatoyin.Alabi"
 },
 {
   "email": "osarose4friends@gmail.com",
   "firstname": "Osarose",
   "lastname": "Sadoh",
   "Username": "Osarose.Sadoh"
 },
 {
   "email": "joseph.kunde@yahoo.com",
   "firstname": "Joseph",
   "lastname": "Kunde",
   "Username": "Joseph.Kunde"
 },
 {
   "email": "ojochukwurah@yahoo.com",
   "firstname": "Nnamdi J",
   "lastname": "Ojo Chukwurah",
   "Username": "Nnamdi J.Ojo Chukwurah"
 },
 {
   "email": "lizzyabiogbe@gmail.com",
   "firstname": "LIZZY",
   "lastname": "ABIOGBE",
   "Username": "LIZZY.ABIOGBE"
 },
 {
   "email": "goodweathernigltd@yahoo.com",
   "firstname": "Felix",
   "lastname": "Amua",
   "Username": "Felix.Amua"
 },
 {
   "email": "keesha4u2nv2013@gmail.com",
   "firstname": "Cecilia",
   "lastname": "Williams",
   "Username": "Cecilia.Williams"
 },
 {
   "email": "onodesirh@yahoo.com",
   "firstname": "Pauline",
   "lastname": "Agboighale",
   "Username": "Pauline.Agboighale"
 },
 {
   "email": "sahasmo@yahoo.com",
   "firstname": "HASSAN",
   "lastname": "SANI",
   "Username": "HASSAN.SANI"
 },
 {
   "email": "gandusray@gmail.com",
   "firstname": "Friday",
   "lastname": "Gandu",
   "Username": "Friday.Gandu"
 },
 {
   "email": "abimaje4real@gmail.com",
   "firstname": "Moses",
   "lastname": "Abimaje",
   "Username": "Moses.Abimaje"
 },
 {
   "email": "geoffrey_mamode@yahoo.com",
   "firstname": "MAMODE",
   "lastname": "GEOFFREY",
   "Username": "MAMODE.GEOFFREY"
 },
 {
   "email": "kudanyusuf@gmail.com",
   "firstname": "yusuf",
   "lastname": "kudan",
   "Username": "yusuf.kudan"
 },
 {
   "email": "kenodiakari@yahoo.com",
   "firstname": "GODPOWER",
   "lastname": "AKARI",
   "Username": "GODPOWER.AKARI"
 },
 {
   "email": "esteeconnect@gmail.com",
   "firstname": "Esther",
   "lastname": "Yusuf",
   "Username": "Esther.Yusuf"
 },
 {
   "email": "davidsado53@yahoo.com",
   "firstname": "David",
   "lastname": "Sado",
   "Username": "David.Sado"
 },
 {
   "email": "princekay1972@gmail.com",
   "firstname": "prince",
   "lastname": "kingdom Tamunoemi",
   "Username": "prince.kingdom Tamunoemi"
 },
 {
   "email": "franciskazah@yahoo.com",
   "firstname": "Francis",
   "lastname": "Ayuba",
   "Username": "Francis.Ayuba"
 },
 {
   "email": "esbliss@gmail.com",
   "firstname": "ESH-WAHID",
   "lastname": "ELLLAMS",
   "Username": "ESH-WAHID.ELLLAMS"
 },
 {
   "email": "christophereal1@yahoo.com",
   "firstname": "Christopher",
   "lastname": "Ebuetse",
   "Username": "Christopher.Ebuetse"
 },
 {
   "email": "iborosunday61@yahoo.com",
   "firstname": "iboro",
   "lastname": "sunday",
   "Username": "iboro.sunday"
 },
 {
   "email": "samnaya1@yahoo.com",
   "firstname": "SAMUEL",
   "lastname": "ADINDU",
   "Username": "SAMUEL.ADINDU"
 },
 {
   "email": "julietdesaint@yahoo.com",
   "firstname": "JULIET",
   "lastname": "KING",
   "Username": "JULIET.KING"
 },
 {
   "email": "jeje.annette@yahoo.com",
   "firstname": "OYIZA",
   "lastname": "JEJE",
   "Username": "OYIZA.JEJE"
 },
 {
   "email": "geoagba@gmail.com",
   "firstname": "GEORGE",
   "lastname": "AGBAYEKHAI",
   "Username": "GEORGE.AGBAYEKHAI"
 },
 {
   "email": "ashittu04@gmail.com",
   "firstname": "AZEEZ",
   "lastname": "SHITTU",
   "Username": "AZEEZ.SHITTU"
 },
 {
   "email": "aibasil@yahoo.com",
   "firstname": "Ikenna",
   "lastname": "Amechi",
   "Username": "Ikenna.Amechi"
 },
 {
   "email": "oluakerele2002@yahoo.com",
   "firstname": "Oluremi",
   "lastname": "Olu-Akerele",
   "Username": "Oluremi.Olu-Akerele"
 },
 {
   "email": "gracebabs8@gmail.com",
   "firstname": "GRACE",
   "lastname": "BABAWALE",
   "Username": "GRACE.BABAWALE"
 },
 {
   "email": "larry2care@gmail.com",
   "firstname": "Lawal ",
   "lastname": "Hakeem Ola",
   "Username": "Lawal .Hakeem Ola"
 },
 {
   "email": "traceykomm@gmail.com",
   "firstname": "tracy ",
   "lastname": "egbuson",
   "Username": "tracy .egbuson"
 },
 {
   "email": "alkayzade@yahoo.com",
   "firstname": "Alfred Kayode",
   "lastname": "Adegbile",
   "Username": "Alfred Kayode.Adegbile"
 },
 {
   "email": "tmsnigha@yahoo.com",
   "firstname": "Rotimi",
   "lastname": "Robinson",
   "Username": "Rotimi.Robinson"
 },
 {
   "email": "stanakewe@gmail.com",
   "firstname": "Stanley",
   "lastname": "Akewe",
   "Username": "Stanley.Akewe"
 },
 {
   "email": "luminous_001@rocketmail.com",
   "firstname": "GBOLAHAN",
   "lastname": "OWADASA",
   "Username": "GBOLAHAN.OWADASA"
 },
 {
   "email": "opemiposamuel123@gmail.com",
   "firstname": "Ogunde",
   "lastname": "Adetokunbo",
   "Username": "Ogunde.Adetokunbo"
 },
 {
   "email": "marcelezeok@yahoo.com",
   "firstname": "Marcel",
   "lastname": "Eze",
   "Username": "Marcel.Eze"
 },
 {
   "email": "deleola2002@yahoo.co.uk",
   "firstname": "SARAH",
   "lastname": "OLUWATOSIN",
   "Username": "SARAH.OLUWATOSIN"
 },
 {
   "email": "topedare8@gmail.com",
   "firstname": "TEMITOPE ",
   "lastname": "DARE ",
   "Username": "TEMITOPE .DARE "
 },
 {
   "email": "arowosomobose@gmail.com",
   "firstname": "Bosede",
   "lastname": "Arowosomo",
   "Username": "Bosede.Arowosomo"
 },
 {
   "email": "paulinedike@yahoo.com",
   "firstname": "PAULINE",
   "lastname": "DIKE",
   "Username": "PAULINE.DIKE"
 },
 {
   "email": "TALK2LARRYBABS@GMAIL.COM",
   "firstname": "LANRE",
   "lastname": "BABALOLA",
   "Username": "LANRE.BABALOLA"
 },
 {
   "email": "tesyabey@yahoo.com",
   "firstname": "TESLIM",
   "lastname": "ABIODUN",
   "Username": "TESLIM.ABIODUN"
 },
 {
   "email": "achitemple@yahoo.com",
   "firstname": "ACHINONU",
   "lastname": "TEMPLE",
   "Username": "ACHINONU.TEMPLE"
 },
 {
   "email": "lizzygraceina@gmail.com",
   "firstname": "TRUST",
   "lastname": "EBE",
   "Username": "TRUST.EBE"
 },
 {
   "email": "slimtosynbabu@yahoo.com",
   "firstname": "OLUWATOSIN",
   "lastname": "ODUTOLA",
   "Username": "OLUWATOSIN.ODUTOLA"
 },
 {
   "email": "arabel212@gmail.com",
   "firstname": "Isabella",
   "lastname": "Arhawarien",
   "Username": "Isabella.Arhawarien"
 },
 {
   "email": "anthoniamichael@yahoo.com",
   "firstname": "Anthonia ",
   "lastname": "Michael",
   "Username": "Anthonia .Michael"
 },
 {
   "email": "khomjulor2@yahoo.com",
   "firstname": "JOHN",
   "lastname": "OKHOMODU MARK",
   "Username": "JOHN.OKHOMODU MARK"
 },
 {
   "email": "moulton38@yahoo.com",
   "firstname": "WALTER",
   "lastname": "MOULTON",
   "Username": "WALTER.MOULTON"
 },
 {
   "email": "bettynnah@yahoo.com",
   "firstname": "BEATRICE",
   "lastname": "NNAH-DIAMOND",
   "Username": "BEATRICE.NNAH-DIAMOND"
 },
 {
   "email": "winstonakpabio2012@yahoo.com",
   "firstname": "winston",
   "lastname": "Akpabio",
   "Username": "winston.Akpabio"
 },
 {
   "email": "okazogiefestus@yahoo.com",
   "firstname": "FESTUS I",
   "lastname": "OKAZOGIE",
   "Username": "FESTUS I.OKAZOGIE"
 },
 {
   "email": "tosinadenijio@gmail.com",
   "firstname": "OLUWATOSIN",
   "lastname": "ADENIJI",
   "Username": "OLUWATOSIN.ADENIJI"
 },
 {
   "email": "sportsammy@gmail.com",
   "firstname": "EZE ",
   "lastname": "SAMPSON C.",
   "Username": "EZE .SAMPSON C."
 },
 {
   "email": "dabusgee@yahoo.com",
   "firstname": "George",
   "lastname": "Adaba Clifford talbot",
   "Username": "George.Adaba Clifford talbot"
 },
 {
   "email": "stevieagoyi@yahoo.com",
   "firstname": "Stephen",
   "lastname": "Agoyi",
   "Username": "Stephen.Agoyi"
 },
 {
   "email": "ilhuoria@gmail.com",
   "firstname": "Cyril",
   "lastname": "Aidebama",
   "Username": "Cyril.Aidebama"
 },
 {
   "email": "ibronas.kd@gmail.com",
   "firstname": "IBRAHIM",
   "lastname": "NASIR",
   "Username": "IBRAHIM.NASIR"
 },
 {
   "email": "dorisdiabo@yahoo.com",
   "firstname": "Doris",
   "lastname": "Diabo",
   "Username": "Doris.Diabo"
 },
 {
   "email": "fatibeck@yahoo.com",
   "firstname": "Fatimatu",
   "lastname": "Sule",
   "Username": "Fatimatu.Sule"
 },
 {
   "email": "felixcrespo2010@yahoo.com",
   "firstname": "Felix",
   "lastname": "Ndubuisi",
   "Username": "Felix.Ndubuisi"
 },
 {
   "email": "jayluise1@yahoo.com",
   "firstname": "JUWE",
   "lastname": "IKECHUKWU",
   "Username": "JUWE.IKECHUKWU"
 },
 {
   "email": "aletoroyamenda@gmail.com",
   "firstname": "oyamenda",
   "lastname": "Aletor",
   "Username": "oyamenda.Aletor"
 },
 {
   "email": "bapinaabarshi@gmail.com",
   "firstname": "Godfrey",
   "lastname": "Umaru",
   "Username": "Godfrey.Umaru"
 },
 {
   "email": "abokbernard@gmail.com",
   "firstname": "Bernard",
   "lastname": "Asepo",
   "Username": "Bernard.Asepo"
 },
 {
   "email": "diepreye8@gmail.com",
   "firstname": "Diepreye",
   "lastname": "Berriki",
   "Username": "Diepreye.Berriki"
 },
 {
   "email": "mac_charleston@yahoo.com",
   "firstname": "Charles",
   "lastname": "Ogbonna",
   "Username": "Charles.Ogbonna"
 },
 {
   "email": "flolalekan@gmail.com",
   "firstname": "Folarin",
   "lastname": "Olalekan",
   "Username": "Folarin.Olalekan"
 },
 {
   "email": "Chidina2002@yahoo.com",
   "firstname": "CHIDI",
   "lastname": "ODINA",
   "Username": "CHIDI.ODINA"
 },
 {
   "email": "DATTIAHMAD2015@GMAIL.COM",
   "firstname": "AHMAD ",
   "lastname": "DATTI AHMAD",
   "Username": "AHMAD .DATTI AHMAD"
 },
 {
   "email": "mariebarki10@gmail.com",
   "firstname": "mary",
   "lastname": "barki",
   "Username": "mary.barki"
 },
 {
   "email": "maryamabdulrazaq2014@gmail.com",
   "firstname": "Maryam",
   "lastname": "Abdulrazaq",
   "Username": "Maryam.Abdulrazaq"
 },
 {
   "email": "anisadetula@yahoo.com",
   "firstname": "Anifowose",
   "lastname": "Adetula",
   "Username": "Anifowose.Adetula"
 },
 {
   "email": "brosumer3@yahoo.com",
   "firstname": "AMBROSE ",
   "lastname": "SOMIDE ",
   "Username": "AMBROSE .SOMIDE "
 },
 {
   "email": "timgyangbotson@gmail.com",
   "firstname": "Timothy",
   "lastname": "Gyang",
   "Username": "Timothy.Gyang"
 },
 {
   "email": "patrickelumaro@gmail.com",
   "firstname": "Patrick",
   "lastname": "Elumaro",
   "Username": "Patrick.Elumaro"
 },
 {
   "email": "leke2324@yahoo.com",
   "firstname": "Adeleke",
   "lastname": "Badmos",
   "Username": "Adeleke.Badmos"
 },
 {
   "email": "teeballog@gmail.com",
   "firstname": "Tijani",
   "lastname": "Balogun",
   "Username": "Tijani.Balogun"
 },
 {
   "email": "adiogreenpen4u@yahoo.com",
   "firstname": "SUNMON",
   "lastname": "AZEEM",
   "Username": "SUNMON.AZEEM"
 },
 {
   "email": "laminichuyeh@gmail.com",
   "firstname": "FREDA LAMINI",
   "lastname": "CLETUS",
   "Username": "FREDA LAMINI.CLETUS"
 },
 {
   "email": "halimaahmad35@gmail.com",
   "firstname": "Halima",
   "lastname": "Ahmad",
   "Username": "Halima.Ahmad"
 },
 {
   "email": "ceciliaidakwo@yahoo.com",
   "firstname": "Cecilia",
   "lastname": "Idakwo",
   "Username": "Cecilia.Idakwo"
 },
 {
   "email": "ilepaolayemi@gmail.com",
   "firstname": "Olayemi",
   "lastname": "Ojo",
   "Username": "Olayemi.Ojo"
 },
 {
   "email": "tebigie@yahoo.com",
   "firstname": "Ebigie",
   "lastname": "Afemike",
   "Username": "Ebigie.Afemike"
 },
 {
   "email": "davidgoshit2010@yahoo.com",
   "firstname": "David",
   "lastname": "Goshit",
   "Username": "David.Goshit"
 },
 {
   "email": "marvelousdootyav@yahoo.com",
   "firstname": "TYAV",
   "lastname": "DOO MARVELOUS",
   "Username": "TYAV.DOO MARVELOUS"
 },
 {
   "email": "delalagble@gmail.com",
   "firstname": "LAGBLE",
   "lastname": "DELA",
   "Username": "LAGBLE.DELA"
 },
 {
   "email": "tunjiakinlade@yahoo.com",
   "firstname": "Olutunji",
   "lastname": "Akinlade",
   "Username": "Olutunji.Akinlade"
 },
 {
   "email": "anthonyjohnogbu@gmail.com",
   "firstname": "Ogbu ",
   "lastname": "John Anthony",
   "Username": "Ogbu .John Anthony"
 },
 {
   "email": "OKHUPATTI@YAHOO.COM",
   "firstname": "PAULINUS",
   "lastname": "OGBITI",
   "Username": "PAULINUS.OGBITI"
 },
 {
   "email": "oches26@gmail.com",
   "firstname": "Agbo",
   "lastname": "Ocheche ",
   "Username": "Agbo.Ocheche "
 },
 {
   "email": "agadaokopi@yahoo.com",
   "firstname": "Okopi",
   "lastname": "Agada",
   "Username": "Okopi.Agada"
 },
 {
   "email": "folakemi_ishola@yahoo.com",
   "firstname": "Folakemi",
   "lastname": "Tokunbo-Ishola",
   "Username": "Folakemi.Tokunbo-Ishola"
 },
 {
   "email": "otuvedosam@yahoo.com",
   "firstname": "Samuel",
   "lastname": "Otuvedo",
   "Username": "Samuel.Otuvedo"
 },
 {
   "email": "walkwakfut@gmail.com",
   "firstname": "Walkyes ",
   "lastname": "Kwakfut ",
   "Username": "Walkyes .Kwakfut "
 },
 {
   "email": "bolasonuga@yahoo.com",
   "firstname": "Abiodun",
   "lastname": "Sonuga",
   "Username": "Abiodun.Sonuga"
 },
 {
   "email": "akene56@yahoo.com",
   "firstname": "Emmanuel ",
   "lastname": "Akene Iroroakpo",
   "Username": "Emmanuel .Akene Iroroakpo"
 },
 {
   "email": "augustinejustina1@gmail.com",
   "firstname": "Justina",
   "lastname": "Arua",
   "Username": "Justina.Arua"
 },
 {
   "email": "yemisadiq178@yahoo.com",
   "firstname": "Olayemi",
   "lastname": "Obami",
   "Username": "Olayemi.Obami"
 },
 {
   "email": "idegbunopaul@gmail.com",
   "firstname": "Paul",
   "lastname": "Akhagbemhe",
   "Username": "Paul.Akhagbemhe"
 },
 {
   "email": "oflondonamara@yahoo.com",
   "firstname": "Adewale",
   "lastname": "Akanmu",
   "Username": "Adewale.Akanmu"
 },
 {
   "email": "chikaudenkwo1@gmail.com",
   "firstname": "CHIKA",
   "lastname": "UDENKWO",
   "Username": "CHIKA.UDENKWO"
 },
 {
   "email": "bashiru99abdullahi@gmail.com",
   "firstname": "Abdullahi ",
   "lastname": "bashiru moyo-bani",
   "Username": "Abdullahi .bashiru moyo-bani"
 },
 {
   "email": "chinenyenwaka@yahoo.com",
   "firstname": "SUNDAY",
   "lastname": "CHINENYE NWAKA",
   "Username": "SUNDAY.CHINENYE NWAKA"
 },
 {
   "email": "blessedb68@yahoo.com",
   "firstname": "Ihedigbo",
   "lastname": "Blessing",
   "Username": "Ihedigbo.Blessing"
 },
 {
   "email": "oshio2k3ng@yahoo.com",
   "firstname": "Oshiomouwa Daniels",
   "lastname": "Gloria",
   "Username": "Oshiomouwa Daniels.Gloria"
 },
 {
   "email": "kabulu01@gmail.com",
   "firstname": "ezedimbu",
   "lastname": "karen ogomegbunem",
   "Username": "ezedimbu.karen ogomegbunem"
 },
 {
   "email": "bintabukar@yahoo.com",
   "firstname": "bukar",
   "lastname": "binta",
   "Username": "bukar.binta"
 },
 {
   "email": "odefola@yahoo.com",
   "firstname": "Afolabi",
   "lastname": "Odetayo",
   "Username": "Afolabi.Odetayo"
 },
 {
   "email": "utbmoren@yahoo.com",
   "firstname": "umoren",
   "lastname": "utibe",
   "Username": "umoren.utibe"
 },
 {
   "email": "umukoro4best@yahoo.com",
   "firstname": "Akpobaro Ernest",
   "lastname": "Umukoro",
   "Username": "Akpobaro Ernest.Umukoro"
 },
 {
   "email": "oodaliki@yahoo.com",
   "firstname": "Oladunni",
   "lastname": "Odaliki",
   "Username": "Oladunni.Odaliki"
 },
 {
   "email": "agbanomaena@yahoo.com",
   "firstname": "Ena",
   "lastname": "Agbanoma",
   "Username": "Ena.Agbanoma"
 },
 {
   "email": "literaryminds@yahoo.com",
   "firstname": "BISI",
   "lastname": "AKPAIDA-MONU",
   "Username": "BISI.AKPAIDA-MONU"
 },
 {
   "email": "akanmukemi2011@yahoo.com",
   "firstname": "RUTH",
   "lastname": "AKANMU",
   "Username": "RUTH.AKANMU"
 },
 {
   "email": "dapoibikunleonair@yahoo.com",
   "firstname": "Sikirulah",
   "lastname": "Olalekan",
   "Username": "Sikirulah.Olalekan"
 },
 {
   "email": "amusanfemi@yahoo.com",
   "firstname": "Olufemi",
   "lastname": "Amusan",
   "Username": "Olufemi.Amusan"
 },
 {
   "email": "richykay25@gmail.com",
   "firstname": "Olorunsola",
   "lastname": "Richard",
   "Username": "Olorunsola.Richard"
 },
 {
   "email": "braizozo@yahoo.com",
   "firstname": "Emozozo",
   "lastname": "Braimoh",
   "Username": "Emozozo.Braimoh"
 },
 {
   "email": "omotayov@ymail.com",
   "firstname": "OMOTAYO",
   "lastname": "OLADEINDE",
   "Username": "OMOTAYO.OLADEINDE"
 },
 {
   "email": "4laplus@gmail.com",
   "firstname": "OSHODI",
   "lastname": "FOLASADE",
   "Username": "OSHODI.FOLASADE"
 },
 {
   "email": "celestinaugbodaga@yahoo.com",
   "firstname": "UGBODAGA EWEYA CELESTINA",
   "lastname": "EWEYA",
   "Username": "UGBODAGA EWEYA CELESTINA.EWEYA"
 },
 {
   "email": "olayanju_ayodele@yahoo.com",
   "firstname": "OLAYINKA",
   "lastname": "OLAYANJU",
   "Username": "OLAYINKA.OLAYANJU"
 },
 {
   "email": "aliyuabduo@gmail.com",
   "firstname": "Aliyu ",
   "lastname": "Abdu",
   "Username": "Aliyu .Abdu"
 },
 {
   "email": "oamajila@yahoo.com",
   "firstname": "Amajila ",
   "lastname": "Obida",
   "Username": "Amajila .Obida"
 },
 {
   "email": "cindymaxuduma@yahoo.com",
   "firstname": "cindy",
   "lastname": "uduma",
   "Username": "cindy.uduma"
 },
 {
   "email": "brownbussy@rocketmail.com",
   "firstname": "oluwabusola Mojisola",
   "lastname": "Faiga",
   "Username": "oluwabusola Mojisola.Faiga"
 },
 {
   "email": "veralphedet3bb@yahoo.com",
   "firstname": "Vera",
   "lastname": "Alphonsus",
   "Username": "Vera.Alphonsus"
 },
 {
   "email": "oyeghe1@gmail.com",
   "firstname": "Habiibah ",
   "lastname": "Oyarekhua",
   "Username": "Habiibah .Oyarekhua"
 },
 {
   "email": "oscaryon4uyi@yahoo.com",
   "firstname": "Ogiemhonyi Oscar",
   "lastname": "Ihimhekpen",
   "Username": "Ogiemhonyi Oscar.Ihimhekpen"
 },
 {
   "email": "sara.sule@yahoo.com",
   "firstname": "Serah ",
   "lastname": "Sule ",
   "Username": "Serah .Sule "
 },
 {
   "email": "reziolagunju@gmail.com",
   "firstname": "reziolagunju@gmail.com",
   "lastname": "OLAGUNJU",
   "Username": "reziolagunju@gmail.com.OLAGUNJU"
 },
 {
   "email": "faustusrowland@gmail.com",
   "firstname": "Faustus",
   "lastname": "Uhuche Onyemauche",
   "Username": "Faustus.Uhuche Onyemauche"
 },
 {
   "email": "usmankehinde11@gmail.com",
   "firstname": "YUSUF",
   "lastname": "USMAN",
   "Username": "YUSUF.USMAN"
 },
 {
   "email": "asquare061@yahoo.com",
   "firstname": "Adeoye",
   "lastname": "Agboola",
   "Username": "Adeoye.Agboola"
 },
 {
   "email": "Timothyodion0@gmail.com",
   "firstname": "Timothy",
   "lastname": "Odion",
   "Username": "Timothy.Odion"
 },
 {
   "email": "samson.oyedele19@gmail.com",
   "firstname": "Samson",
   "lastname": "Oladayo Oyedele",
   "Username": "Samson.Oladayo Oyedele"
 },
 {
   "email": "charleshansnow@gmail.com",
   "firstname": "charles",
   "lastname": "hans ibezim",
   "Username": "charles.hans ibezim"
 },
 {
   "email": "estherndidi30@yahoo.com",
   "firstname": "Esther Ndidi",
   "lastname": "Ezenwa",
   "Username": "Esther Ndidi.Ezenwa"
 },
 {
   "email": "ohioze2004@yahoo.com",
   "firstname": "Sunday",
   "lastname": "Inarumen",
   "Username": "Sunday.Inarumen"
 },
 {
   "email": "Ask4kacho@yahoo.com",
   "firstname": "Kachollom",
   "lastname": "Fom",
   "Username": "Kachollom.Fom"
 },
 {
   "email": "adejumokayode@yahoo.com",
   "firstname": "ADEJUMO",
   "lastname": "KAYODE",
   "Username": "ADEJUMO.KAYODE"
 },
 {
   "email": "johnfemjo@yahoo.com",
   "firstname": "john",
   "lastname": "ojo",
   "Username": "john.ojo"
 },
 {
   "email": "faithmakins2003@yahoo.ca",
   "firstname": "Afolabi ",
   "lastname": "Igbagboyemi",
   "Username": "Afolabi .Igbagboyemi"
 },
 {
   "email": "adamskushi@gmail.com",
   "firstname": "ADAMU ABSALOM",
   "lastname": "KUSHI",
   "Username": "ADAMU ABSALOM.KUSHI"
 },
 {
   "email": "lekmond@gmail.com",
   "firstname": "OLALEKAN",
   "lastname": "OWOLO",
   "Username": "OLALEKAN.OWOLO"
 },
 {
   "email": "ezeamakings@gmail.com",
   "firstname": "CHINMA KINGSLEY",
   "lastname": "EZEAMA",
   "Username": "CHINMA KINGSLEY.EZEAMA"
 },
 {
   "email": "jester28@gmail.com",
   "firstname": "HAS EMMANUEL",
   "lastname": "AKODIH",
   "Username": "HAS EMMANUEL.AKODIH"
 },
 {
   "email": "kadaramini@gmail.com",
   "firstname": "Olufunke",
   "lastname": "Fadugba",
   "Username": "Olufunke.Fadugba"
 },
 {
   "email": "graceladan@gmail.com",
   "firstname": "Grace",
   "lastname": "Alheri Ladan",
   "Username": "Grace.Alheri Ladan"
 },
 {
   "email": "issulaimany@gmail.com",
   "firstname": "ISAH",
   "lastname": "SULEIMAN",
   "Username": "ISAH.SULEIMAN"
 },
 {
   "email": "balaahmad64@gmail.com",
   "firstname": "Bala",
   "lastname": "Ahmad",
   "Username": "Bala.Ahmad"
 },
 {
   "email": "Kyermungukas@gmail.com",
   "firstname": "KYERMUN",
   "lastname": "GUKAS",
   "Username": "KYERMUN.GUKAS"
 },
 {
   "email": "odeyoshameg@gmail.com",
   "firstname": "OSHA",
   "lastname": "MARGARET IMOLONG",
   "Username": "OSHA.MARGARET IMOLONG"
 },
 {
   "email": "imgodsapple@gmail.com",
   "firstname": "IMEOFON",
   "lastname": "OKON",
   "Username": "IMEOFON.OKON"
 },
 {
   "email": "omotayoolujimi@yahoo.com",
   "firstname": "Christiana",
   "lastname": "Olujimi",
   "Username": "Christiana.Olujimi"
 },
 {
   "email": "orlando.ellams@daargroup.com",
   "firstname": "ELLAMS",
   "lastname": "ORLANDO",
   "Username": "ELLAMS.ORLANDO"
 },
 {
   "email": "yesucanwithng@yahoo.com",
   "firstname": "Blessing",
   "lastname": "Uwechia",
   "Username": "Blessing.Uwechia"
 },
 {
   "email": "remite4one@yahoo.com",
   "firstname": " OLUREMI ABIOLA",
   "lastname": "JOEL",
   "Username": " OLUREMI ABIOLA.JOEL"
 },
 {
   "email": "sarahdashe13@gmail.com",
   "firstname": "Plangnan",
   "lastname": "Dashe",
   "Username": "Plangnan.Dashe"
 },
 {
   "email": "odetayoamos48@yahoo.com",
   "firstname": "odetayo",
   "lastname": "oluwakayode  Amos",
   "Username": "odetayo.oluwakayode  Amos"
 },
 {
   "email": "talk2enokela247@gmail.com",
   "firstname": "simon",
   "lastname": "Enokela",
   "Username": "simon.Enokela"
 },
 {
   "email": "abusad_ait@yahoo.com",
   "firstname": "MUKTAR SALEH",
   "lastname": "TAHIR",
   "Username": "MUKTAR SALEH.TAHIR"
 },
 {
   "email": "umunzeazubike@yahoo.com",
   "firstname": "azubike",
   "lastname": "umunze",
   "Username": "azubike.umunze"
 },
 {
   "email": "susanmamedu@gmail.com",
   "firstname": "Susan",
   "lastname": "Mamedu ",
   "Username": "Susan.Mamedu "
 },
 {
   "email": "kb_garba@yahoo.com",
   "firstname": "MOHAMMED",
   "lastname": "GARBA",
   "Username": "MOHAMMED.GARBA"
 },
 {
   "email": "charleskosiprr@gmail.com",
   "firstname": "Charles",
   "lastname": "Kosipre",
   "Username": "Charles.Kosipre"
 },
 {
   "email": "collinsagbons@gmail.com",
   "firstname": "collins",
   "lastname": "otabor",
   "Username": "collins.otabor"
 },
 {
   "email": "hajoaliyu@gmail.com",
   "firstname": "HAJARA",
   "lastname": "ALIYU",
   "Username": "HAJARA.ALIYU"
 },
 {
   "email": "cal4wise@yahoo.com",
   "firstname": "CALEB",
   "lastname": "BINUMESO ISHAYA",
   "Username": "CALEB.BINUMESO ISHAYA"
 },
 {
   "email": "yusufdamina@gmail.com",
   "firstname": "YUSUF BITRUS",
   "lastname": "DAMINA",
   "Username": "YUSUF BITRUS.DAMINA"
 },
 {
   "email": "ochiedikemax@yahoo.com",
   "firstname": "MAXWELL",
   "lastname": "OGOCHUKWU",
   "Username": "MAXWELL.OGOCHUKWU"
 },
 {
   "email": "myashibabawo@yahoo.com",
   "firstname": "MUSA YAKUBU",
   "lastname": "YASHI",
   "Username": "MUSA YAKUBU.YASHI"
 },
 {
   "email": "sammgbemele@daargroup.com",
   "firstname": "mgbemele",
   "lastname": "samuel",
   "Username": "mgbemele.samuel"
 },
 {
   "email": "auwaljibrin12@gmail.com",
   "firstname": "AUWAL",
   "lastname": "JIBRIL",
   "Username": "AUWAL.JIBRIL"
 },
 {
   "email": "ibrahimallibalogun1974@yahoo.com",
   "firstname": "IBRAHIM",
   "lastname": "ALLI-BALOGUN",
   "Username": "IBRAHIM.ALLI-BALOGUN"
 },
 {
   "email": "donatus.anopuo@daargroup.com",
   "firstname": "Donatus",
   "lastname": "Anopuo",
   "Username": "Donatus.Anopuo"
 },
 {
   "email": "bewellmathew@gmail.com",
   "firstname": "Bewell",
   "lastname": "Mathew Thomas",
   "Username": "Bewell.Mathew Thomas"
 },
 {
   "email": "mosunmolaashiru4eva@gmail.com",
   "firstname": "Mosunmola",
   "lastname": "Ashiru",
   "Username": "Mosunmola.Ashiru"
 },
 {
   "email": "alincs4u@gmail.com",
   "firstname": "Mangud",
   "lastname": "Eric Matawal",
   "Username": "Mangud.Eric Matawal"
 },
 {
   "email": "royalqg@yahoo.com",
   "firstname": "QUEEN ",
   "lastname": "GODFREY",
   "Username": "QUEEN .GODFREY"
 },
 {
   "email": "talk2femiemmanuel@gmail.com",
   "firstname": "Olufemi Silas",
   "lastname": "Emmanuel",
   "Username": "Olufemi Silas.Emmanuel"
 },
 {
   "email": "lexyblazeslim@gmail.com",
   "firstname": "Peter",
   "lastname": "Ekanem",
   "Username": "Peter.Ekanem"
 },
 {
   "email": "angeladokpesi@gmail.com",
   "firstname": "Angela",
   "lastname": "Dokpesi",
   "Username": "Angela.Dokpesi"
 },
 {
   "email": "ifeomaoti2001@yahoo.com",
   "firstname": "Anne",
   "lastname": "Oti agbapuonwu",
   "Username": "Anne.Oti agbapuonwu"
 },
 {
   "email": "aberuagbabiola@yahoo.com",
   "firstname": "Abiola",
   "lastname": "Aberuagba",
   "Username": "Abiola.Aberuagba"
 },
 {
   "email": "sarafa01@yahoo.com",
   "firstname": "sharafa",
   "lastname": "Akinsanya",
   "Username": "sharafa.Akinsanya"
 },
 {
   "email": "jerryjust2luv@gmail.com",
   "firstname": "Bako",
   "lastname": "Jeremiah",
   "Username": "Bako.Jeremiah"
 },
 {
   "email": "abdullahiinuwa35@gmail.com",
   "firstname": "Inuwa ",
   "lastname": "Abdullahi ",
   "Username": "Inuwa .Abdullahi "
 },
 {
   "email": "y.mansir@yahoo.com",
   "firstname": "mansir",
   "lastname": "yusuf",
   "Username": "mansir.yusuf"
 },
 {
   "email": "bengodknows@gmail.com",
   "firstname": "Godknows",
   "lastname": "Ben",
   "Username": "Godknows.Ben"
 },
 {
   "email": "chukwumaegwufelix@gmail.com",
   "firstname": "CHUKWUMA",
   "lastname": "EGWU",
   "Username": "CHUKWUMA.EGWU"
 },
 {
   "email": "sibinbenjamin5@gmail.com",
   "firstname": "sibin",
   "lastname": "Benjamin",
   "Username": "sibin.Benjamin"
 },
 {
   "email": "silasngbede2015@yahoo.com",
   "firstname": "OGWOJA",
   "lastname": "NGBEDE",
   "Username": "OGWOJA.NGBEDE"
 },
 {
   "email": "abraham4andrew@yahoo.com",
   "firstname": "ABDULLAHI",
   "lastname": "HAMZA",
   "Username": "ABDULLAHI.HAMZA"
 },
 {
   "email": "osasait@gmail.com",
   "firstname": "OSARUMWENSE ",
   "lastname": "DAVISON OGIEVA",
   "Username": "OSARUMWENSE .DAVISON OGIEVA"
 },
 {
   "email": "ikezamgodswill@gmail.com",
   "firstname": "IKEZAM",
   "lastname": "GODSWILL",
   "Username": "IKEZAM.GODSWILL"
 },
 {
   "email": "erumeg@yahoo.com",
   "firstname": "Eru",
   "lastname": "Goodluck",
   "Username": "Eru.Goodluck"
 },
 {
   "email": "julieagbontaen101@gmail.com",
   "firstname": "JULIE",
   "lastname": "AGBONTAEN",
   "Username": "JULIE.AGBONTAEN"
 },
 {
   "email": "collins.uwaeze@daargroup.com",
   "firstname": "collins",
   "lastname": "uwaeze",
   "Username": "collins.uwaeze"
 },
 {
   "email": "bakpa86@gmail.com",
   "firstname": "Emmanuel",
   "lastname": "Bakpa",
   "Username": "Emmanuel.Bakpa"
 },
 {
   "email": "rosy12347@gmail.com",
   "firstname": "ROSEMARY",
   "lastname": "AIGBOKHAI",
   "Username": "ROSEMARY.AIGBOKHAI"
 },
 {
   "email": "favouragba@yahoo.com ",
   "firstname": "OGOCHUKWU",
   "lastname": "ANAGBAKWU",
   "Username": "OGOCHUKWU.ANAGBAKWU"
 },
 {
   "email": "emmazuka@yahoo.com",
   "firstname": "Charles",
   "lastname": "Okwuosah",
   "Username": "Charles.Okwuosah"
 },
 {
   "email": "ekeretegodwin@gmail.com",
   "firstname": "EKERETE",
   "lastname": "GODWIN",
   "Username": "EKERETE.GODWIN"
 },
 {
   "email": "arueyemichael@gmail.com",
   "firstname": "Michael",
   "lastname": "Arueye",
   "Username": "Michael.Arueye"
 },
 {
   "email": "holyness4all@yahoo.com",
   "firstname": "KUHA",
   "lastname": "LUCY",
   "Username": "KUHA.LUCY"
 },
 {
   "email": "tyv2016@gmail.com",
   "firstname": "Tyav",
   "lastname": "Bartholomew",
   "Username": "Tyav.Bartholomew"
 },
 {
   "email": "deejayhumphreyo@gmail.com",
   "firstname": "HUMPHREY",
   "lastname": "AKPITAYO",
   "Username": "HUMPHREY.AKPITAYO"
 },
 {
   "email": "edososamudiamen@gmail.com",
   "firstname": "edoseghe",
   "lastname": "eguakun",
   "Username": "edoseghe.eguakun"
 },
 {
   "email": "dnamchiz@yahoo.com",
   "firstname": "David",
   "lastname": "Daniel",
   "Username": "David.Daniel"
 },
 {
   "email": "diffupraise@yahoo.com",
   "firstname": "PATIENCE",
   "lastname": "FRANCIS",
   "Username": "PATIENCE.FRANCIS"
 },
 {
   "email": "jeobull1997@gmail.com",
   "firstname": "DUKAS",
   "lastname": "BULUS JOSEPH",
   "Username": "DUKAS.BULUS JOSEPH"
 },
 {
   "email": "yusufiliyasu41@yahoo.com",
   "firstname": "Iliyasu",
   "lastname": "Yusuf",
   "Username": "Iliyasu.Yusuf"
 },
 {
   "email": "olusegun1234adeniyi@gmail.com",
   "firstname": "ADENIYI",
   "lastname": "OLUSEGUN",
   "Username": "ADENIYI.OLUSEGUN"
 },
 {
   "email": "murtalasulaimanmuhammad@yahoo.com",
   "firstname": "Murtala",
   "lastname": "Sulaiman",
   "Username": "Murtala.Sulaiman"
 },
 {
   "email": "ig.ikechukwu@yahoo.com",
   "firstname": "Ignatius",
   "lastname": "Ajuonuma",
   "Username": "Ignatius.Ajuonuma"
 },
 {
   "email": "blesspatrickabengowe@gmail.com",
   "firstname": "BLESSING",
   "lastname": "P.ABENGOWE",
   "Username": "BLESSING.P.ABENGOWE"
 },
 {
   "email": "amosayanyi@gmail.com",
   "firstname": "AYANYI",
   "lastname": "AMOS",
   "Username": "AYANYI.AMOS"
 },
 {
   "email": "mctallest97@yahoo.com",
   "firstname": "kehinde",
   "lastname": "akande",
   "Username": "kehinde.akande"
 },
 {
   "email": "oladapoadegboyegao91@gmail.com",
   "firstname": "adegboyega",
   "lastname": "oladapo",
   "Username": "adegboyega.oladapo"
 },
 {
   "email": "auhasbauchi@gmail.com",
   "firstname": "AUWAL",
   "lastname": "HASSAN",
   "Username": "AUWAL.HASSAN"
 },
 {
   "email": "ladisambo@yahoo.com",
   "firstname": "LADI",
   "lastname": "SAMBO",
   "Username": "LADI.SAMBO"
 },
 {
   "email": "justinaejuone@yahoo.com",
   "firstname": "Oghenetejiri",
   "lastname": "Ejuone",
   "Username": "Oghenetejiri.Ejuone"
 },
 {
   "email": "info.aitbauchi@yahoo.com",
   "firstname": "YAKUBU",
   "lastname": "BALA",
   "Username": "YAKUBU.BALA"
 },
 {
   "email": "samuel.itodo@yahoo.com",
   "firstname": "Itodo ",
   "lastname": "Samuel ",
   "Username": "Itodo .Samuel "
 },
 {
   "email": "oluwatoyin.oluyimika@gmail.com",
   "firstname": "oluwatoyin",
   "lastname": "oluyimika",
   "Username": "oluwatoyin.oluyimika"
 },
 {
   "email": "olufemiosunbiyi@gmail.com",
   "firstname": "Olufemi",
   "lastname": "Osunbiyi ",
   "Username": "Olufemi.Osunbiyi "
 },
 {
   "email": "olusegunokuselu@yahoo.co.uk",
   "firstname": "OLUSEGUN",
   "lastname": "OKUSELU",
   "Username": "OLUSEGUN.OKUSELU"
 },
 {
   "email": "adigunaby@gmail.com",
   "firstname": "Abayomi",
   "lastname": "Adigun",
   "Username": "Abayomi.Adigun"
 },
 {
   "email": "obok.kevin@gmail.com",
   "firstname": "KEVIN",
   "lastname": "OBOK",
   "Username": "KEVIN.OBOK"
 },
 {
   "email": "afe.ugwi@daargroup.com",
   "firstname": "Jude",
   "lastname": "Afegbokhai-Ugwi",
   "Username": "Jude.Afegbokhai-Ugwi"
 },
 {
   "email": "samsungnow@yahoo.com",
   "firstname": "Emily",
   "lastname": "Obire",
   "Username": "Emily.Obire"
 },
 {
   "email": "joycith@yahoo.com",
   "firstname": "JOY",
   "lastname": "OKANIGBUAN",
   "Username": "JOY.OKANIGBUAN"
 },
 {
   "email": "ocheochigbo@yahoo.co.uk",
   "firstname": "JACOB ",
   "lastname": "OCHIGBO ",
   "Username": "JACOB .OCHIGBO "
 },
 {
   "email": "samsonogheneaga@gmail.com",
   "firstname": "Samson Ogheneaga",
   "lastname": "Olonge",
   "Username": "Samson Ogheneaga.Olonge"
 },
 {
   "email": "emmybest@gmail.com",
   "firstname": "JOHNSON ",
   "lastname": "EMMANUEL",
   "Username": "JOHNSON .EMMANUEL"
 },
 {
   "email": "roseodhegba@yahoo.com",
   "firstname": "Roseline ",
   "lastname": "Ajayi",
   "Username": "Roseline .Ajayi"
 },
 {
   "email": "aminu_asanu@yahoo.com",
   "firstname": "AMINU",
   "lastname": "ASANU",
   "Username": "AMINU.ASANU"
 },
 {
   "email": "aduni14@yahoo.com",
   "firstname": "FARAYOLA",
   "lastname": "GRACE OMOBOLA",
   "Username": "FARAYOLA.GRACE OMOBOLA"
 },
 {
   "email": "deen_broadcast@yahoo.com",
   "firstname": "NAFEESAH",
   "lastname": "BELLO",
   "Username": "NAFEESAH.BELLO"
 },
 {
   "email": "twaefe@yahoo.com",
   "firstname": "adetokunbo",
   "lastname": "oyetunji",
   "Username": "adetokunbo.oyetunji"
 },
 {
   "email": "maureenitem@yahoo.com",
   "firstname": "MAUREEN",
   "lastname": "OGECHI ITEM",
   "Username": "MAUREEN.OGECHI ITEM"
 },
 {
   "email": "akinsowon_olabisi@yahoo.com",
   "firstname": "Olaide",
   "lastname": "OLATUNJI",
   "Username": "Olaide.OLATUNJI"
 },
 {
   "email": "ejorb@yahoo.com",
   "firstname": "Bernard",
   "lastname": "Ejor",
   "Username": "Bernard.Ejor"
 },
 {
   "email": "akingirl_2k2@yahoo.com",
   "firstname": "Olalekan",
   "lastname": "Amolegbe",
   "Username": "Olalekan.Amolegbe"
 },
 {
   "email": "emessiri777@gmail.com",
   "firstname": "emessiri uche emamoke",
   "lastname": "8036981097",
   "Username": "emessiri uche emamoke.8036981097"
 },
 {
   "email": "n4nero@yahoo.com",
   "firstname": "Oghenero",
   "lastname": "Adaka",
   "Username": "Oghenero.Adaka"
 },
 {
   "email": "igbawuajames@yahoo.com",
   "firstname": "igbawua",
   "lastname": "james ",
   "Username": "igbawua.james "
 },
 {
   "email": "kushgeorge@yahoo.co.uk",
   "firstname": "Kushi",
   "lastname": "George",
   "Username": "Kushi.George"
 },
 {
   "email": "yasiradamu@yahoo.com",
   "firstname": "Yasir",
   "lastname": "Garba",
   "Username": "Yasir.Garba"
 },
 {
   "email": "mykel117@yahoo.com",
   "firstname": "MICHAEL",
   "lastname": "OBIAPI",
   "Username": "MICHAEL.OBIAPI"
 },
 {
   "email": "ykelue@yahoo.co.uk",
   "firstname": "Elue",
   "lastname": "Ikechukwu",
   "Username": "Elue.Ikechukwu"
 },
 {
   "email": "nikebuntu@yahoo.com",
   "firstname": "Ibinike",
   "lastname": "Musa",
   "Username": "Ibinike.Musa"
 },
 {
   "email": "MATHIAS.ODEY@YAHOO.COM",
   "firstname": "ODEY",
   "lastname": "MATHIAS",
   "Username": "ODEY.MATHIAS"
 },
 {
   "email": "okhadaargroup@gmail.com",
   "firstname": "FRANCIS",
   "lastname": "BELLO ITSENEGBEME",
   "Username": "FRANCIS.BELLO ITSENEGBEME"
 },
 {
   "email": "cchidi19@yahoo.com",
   "firstname": "CHARLES",
   "lastname": "NWACHUKWU",
   "Username": "CHARLES.NWACHUKWU"
 },
 {
   "email": "sunnyayami2005@yahoo.com",
   "firstname": "SUNDAY",
   "lastname": "AYAMI",
   "Username": "SUNDAY.AYAMI"
 },
 {
   "email": "bako.hussaini@yahoo.com",
   "firstname": "Bako ",
   "lastname": "Hussaini ",
   "Username": "Bako .Hussaini "
 },
 {
   "email": "obinnaume65@gmail.com",
   "firstname": "Lawrence",
   "lastname": "Ume",
   "Username": "Lawrence.Ume"
 },
 {
   "email": "edmanuelb@yahoo.com",
   "firstname": "Ed-Manuel",
   "lastname": "Bassey",
   "Username": "Ed-Manuel.Bassey"
 },
 {
   "email": "dapelyakubu@yahoo.com",
   "firstname": "Yakubu",
   "lastname": "Dapel",
   "Username": "Yakubu.Dapel"
 },
 {
   "email": "samsondokpesi@gmail.com",
   "firstname": "SAMSON",
   "lastname": "IMOEBE DOKPESI",
   "Username": "SAMSON.IMOEBE DOKPESI"
 },
 {
   "email": "suleabu147@gmail.com",
   "firstname": "SULE",
   "lastname": "ABU",
   "Username": "SULE.ABU"
 },
 {
   "email": "DJALEX2010@YAHOO.COM",
   "firstname": "alexander",
   "lastname": "oye",
   "Username": "alexander.oye"
 },
 {
   "email": "murphydread@gmail.com",
   "firstname": "URBANUS",
   "lastname": "ISHAYA BOTSHA",
   "Username": "URBANUS.ISHAYA BOTSHA"
 },
 {
   "email": "mixmasterkelly@gamil.com",
   "firstname": "Kelly",
   "lastname": "Eruka",
   "Username": "Kelly.Eruka"
 },
 {
   "email": "markasamal@gmail.com",
   "firstname": "TONYMARK",
   "lastname": "ASAMALI IMAKHE",
   "Username": "TONYMARK.ASAMALI IMAKHE"
 },
 {
   "email": "rosuo.iyah@gmail.com",
   "firstname": "Iyah",
   "lastname": "Avwerosuoghene",
   "Username": "Iyah.Avwerosuoghene"
 },
 {
   "email": "folakeawoseyin@gmail.com",
   "firstname": "FOLAKE",
   "lastname": "AWOSEYIN ",
   "Username": "FOLAKE.AWOSEYIN "
 },
 {
   "email": "idegborobiakheme@gmail.com",
   "firstname": "HENRY (IDEGBOR)",
   "lastname": "MICHAEL (OBIAKHEME)",
   "Username": "HENRY (IDEGBOR).MICHAEL (OBIAKHEME)"
 },
 {
   "email": "isaacitab4merit@yahoo.com",
   "firstname": "Isaac",
   "lastname": "Itabore",
   "Username": "Isaac.Itabore"
 },
 {
   "email": "ikhienarolorfelix@gmail.com",
   "firstname": "felix",
   "lastname": "ikhienarolor",
   "Username": "felix.ikhienarolor"
 },
 {
   "email": "eronduchukwuma@yahoo.com",
   "firstname": "Erondu",
   "lastname": "Chukwuma Dennis",
   "Username": "Erondu.Chukwuma Dennis"
 },
 {
   "email": "buddy4jackson007@gmail.com",
   "firstname": "Marvin",
   "lastname": "Ukwuoma ",
   "Username": "Marvin.Ukwuoma "
 },
 {
   "email": "gidadoumarkumo@gmail.com",
   "firstname": "Gidado ",
   "lastname": "Umar Mohammad ",
   "Username": "Gidado .Umar Mohammad "
 },
 {
   "email": "signetreal@yahoo.com",
   "firstname": "Iquo Roxanne",
   "lastname": "Ukpong",
   "Username": "Iquo Roxanne.Ukpong"
 },
 {
   "email": "ijmatt@ymail.com",
   "firstname": "Ijeoma ",
   "lastname": "Matthew ",
   "Username": "Ijeoma .Matthew "
 },
 {
   "email": "elvisasuenimen@yahoo.com",
   "firstname": "ELVIS",
   "lastname": "ASUENIMENORMEN",
   "Username": "ELVIS.ASUENIMENORMEN"
 },
 {
   "email": "ismailrafindadi@gmail.com",
   "firstname": "Abba ",
   "lastname": "Isma'il ",
   "Username": "Abba .Isma'il "
 },
 {
   "email": "patrickossai@yahoo.com",
   "firstname": "PATRICK",
   "lastname": "OSSAI",
   "Username": "PATRICK.OSSAI"
 },
 {
   "email": "izuagbe_josephine@yahoo.com",
   "firstname": "Josephine ",
   "lastname": "Izuagbe",
   "Username": "Josephine .Izuagbe"
 },
 {
   "email": "stevealakpodia@yahoo.com",
   "firstname": "STEPHEN",
   "lastname": "ALAKPODIA",
   "Username": "STEPHEN.ALAKPODIA"
 },
 {
   "email": "walepeters2003@gmail.com",
   "firstname": "PETERS",
   "lastname": "ADEWALE",
   "Username": "PETERS.ADEWALE"
 },
 {
   "email": "anitabrown_007@yahoo.com",
   "firstname": "utomwen",
   "lastname": "anita",
   "Username": "utomwen.anita"
 },
 {
   "email": "kayodekolade719@yahoo.com",
   "firstname": "KOLADE",
   "lastname": "KAYODE",
   "Username": "KOLADE.KAYODE"
 },
 {
   "email": "beckley_abiola@yahoo.com",
   "firstname": "ABIOLA",
   "lastname": "BECKLEY",
   "Username": "ABIOLA.BECKLEY"
 },
 {
   "email": "samueliyanda2016@gmail.com",
   "firstname": "Iyanda",
   "lastname": "Samuel",
   "Username": "Iyanda.Samuel"
 },
 {
   "email": "johnsonenejison@gmail.com",
   "firstname": "JOHNSON",
   "lastname": "ENEJISON ENESI",
   "Username": "JOHNSON.ENEJISON ENESI"
 },
 {
   "email": "femi_kuku2001@hotmail.com",
   "firstname": "KUKU",
   "lastname": "OLUWAFEMI",
   "Username": "KUKU.OLUWAFEMI"
 },
 {
   "email": "chiomaonyeabor@gmail.com",
   "firstname": "chioma",
   "lastname": "onyeabor",
   "Username": "chioma.onyeabor"
 },
 {
   "email": "bigmarketait@yahoo.com",
   "firstname": "OYINPREYE",
   "lastname": "AFOLABI",
   "Username": "OYINPREYE.AFOLABI"
 },
 {
   "email": "feliciaonahpev@gmail.com",
   "firstname": "felicia",
   "lastname": "onah",
   "Username": "felicia.onah"
 },
 {
   "email": "imeohio@gmail.com",
   "firstname": "EMMANUEL ",
   "lastname": "OHIOMOKHARE",
   "Username": "EMMANUEL .OHIOMOKHARE"
 },
 {
   "email": "mavisarmah@yahoo.co.uk",
   "firstname": "SEWHENU ARMAH",
   "lastname": "MAVIS OLABISI",
   "Username": "SEWHENU ARMAH.MAVIS OLABISI"
 },
 {
   "email": "orebiyib@yahoo.com",
   "firstname": "Babatunde",
   "lastname": "Orebiyi",
   "Username": "Babatunde.Orebiyi"
 },
 {
   "email": "Tayeeeee@yahoo.co.uk",
   "firstname": "TAIWO",
   "lastname": "AGORO",
   "Username": "TAIWO.AGORO"
 },
 {
   "email": "amareremac@yahoo.com",
   "firstname": "MAC",
   "lastname": "AMARERE",
   "Username": "MAC.AMARERE"
 },
 {
   "email": "nanchinvin@yahoo.com",
   "firstname": "NANCHIN",
   "lastname": "OKOH ",
   "Username": "NANCHIN.OKOH "
 },
 {
   "email": "dinosgreat0@gmail.com",
   "firstname": "Osaigbovo",
   "lastname": "Usifoh",
   "Username": "Osaigbovo.Usifoh"
 },
 {
   "email": "oseni_toheeb@yahoo.com",
   "firstname": "TOHEEB",
   "lastname": "OSENI",
   "Username": "TOHEEB.OSENI"
 },
 {
   "email": "evanpana@gmail.com",
   "firstname": "Amadasun ",
   "lastname": "Aimuamwosa ",
   "Username": "Amadasun .Aimuamwosa "
 },
 {
   "email": "akhere.smith@yoo.com",
   "firstname": "AKHERE ",
   "lastname": "OBOZELE ",
   "Username": "AKHERE .OBOZELE "
 },
 {
   "email": "carolfavournnaji@gmail.com",
   "firstname": "CAROL",
   "lastname": "NNAJI",
   "Username": "CAROL.NNAJI"
 },
 {
   "email": "newtechelectroelectricals@gmail.com",
   "firstname": "Abdullahi ",
   "lastname": "Usman ",
   "Username": "Abdullahi .Usman "
 },
 {
   "email": "yewande.iwuoha@daargroup.com",
   "firstname": "IWUOHA",
   "lastname": "YEWANDE",
   "Username": "IWUOHA.YEWANDE"
 },
 {
   "email": "Johnhelen2gud4real@gmail.com",
   "firstname": "JOHN HELEN PEREKIBINA",
   "lastname": "PEREKIBINA",
   "Username": "JOHN HELEN PEREKIBINA.PEREKIBINA"
 },
 {
   "email": "sanifarfaru@gmail.com",
   "firstname": "Saidu",
   "lastname": "Sani ",
   "Username": "Saidu.Sani "
 },
 {
   "email": "hannatumaniabu@yahoo.com",
   "firstname": "Mani ",
   "lastname": "Hannatu ",
   "Username": "Mani .Hannatu "
 },
 {
   "email": "odegbenle@yahoo.com",
   "firstname": "lateef",
   "lastname": "Odegbenle",
   "Username": "lateef.Odegbenle"
 },
 {
   "email": "ukalikeflorence@yahoo.com",
   "firstname": "Ukalike ",
   "lastname": "Florence ",
   "Username": "Ukalike .Florence "
 },
 {
   "email": "photomephotography001@gmail.com",
   "firstname": "OLUPONMILE",
   "lastname": "AKANJI",
   "Username": "OLUPONMILE.AKANJI"
 },
 {
   "email": "siryaks@yahoo.com",
   "firstname": "Umar ",
   "lastname": "Yakubu ",
   "Username": "Umar .Yakubu "
 },
 {
   "email": "princekrazy1@gmail.com",
   "firstname": "Oluwatosin",
   "lastname": "Oshin",
   "Username": "Oluwatosin.Oshin"
 },
 {
   "email": "abdurrahmanumar50@yahoo.com",
   "firstname": "ABDURRAHMAN",
   "lastname": "UMAR",
   "Username": "ABDURRAHMAN.UMAR"
 },
 {
   "email": "MPRINCEEEDDY@YAHOO.COM",
   "firstname": "ABDUL GAFAR",
   "lastname": "DADA",
   "Username": "ABDUL GAFAR.DADA"
 },
 {
   "email": "omalezakari@gmail.com",
   "firstname": "Omale",
   "lastname": "Zakari ",
   "Username": "Omale.Zakari "
 },
 {
   "email": "enahorosolomon@gmail.com",
   "firstname": "Solomon",
   "lastname": "Enahoro",
   "Username": "Solomon.Enahoro"
 },
 {
   "email": "toach4g3@yahoo.com",
   "firstname": "Toochukwu ",
   "lastname": "Ilodigwe",
   "Username": "Toochukwu .Ilodigwe"
 },
 {
   "email": "Tabithaganya@gmail.com",
   "firstname": "Tabitha",
   "lastname": "Ganya",
   "Username": "Tabitha.Ganya"
 },
 {
   "email": "tonyedouglas.td@gmail.com",
   "firstname": "Tonye ",
   "lastname": "Douglas Atandikiari ",
   "Username": "Tonye .Douglas Atandikiari "
 },
 {
   "email": "biggestbenfun@yahoo.com",
   "firstname": "BENEDICT",
   "lastname": "EKEUTOMHINYE",
   "Username": "BENEDICT.EKEUTOMHINYE"
 },
 {
   "email": "onlinewithnazo@yahoo.com",
   "firstname": "Okocha Blessing Ifeanyi",
   "lastname": "Okocha",
   "Username": "Okocha Blessing Ifeanyi.Okocha"
 },
 {
   "email": "lakefist247@gmail.com",
   "firstname": "Saulabiu",
   "lastname": "Adeleke Isaac",
   "Username": "Saulabiu.Adeleke Isaac"
 },
 {
   "email": "daargroup@yahoo.com",
   "firstname": "Darlington",
   "lastname": "Madu",
   "Username": "Darlington.Madu"
 },
 {
   "email": "stephanieobiih@gmail.com",
   "firstname": "STEPHANIE",
   "lastname": "OBI",
   "Username": "STEPHANIE.OBI"
 },
 {
   "email": "Nwokediikechukwu@daargroup.com",
   "firstname": "IKECHUKWU",
   "lastname": "Nwokedi",
   "Username": "IKECHUKWU.Nwokedi"
 },
 {
   "email": "makintilerewa@gmail.com",
   "firstname": "MARIAH IRETIOLU",
   "lastname": "AKINTULEREWA",
   "Username": "MARIAH IRETIOLU.AKINTULEREWA"
 },
 {
   "email": "Kizagoawike@yahoo.com",
   "firstname": "CHUKWUEMEKA ",
   "lastname": "AGOAWIKE",
   "Username": "CHUKWUEMEKA .AGOAWIKE"
 },
 {
   "email": "ifeyinwanwobi@gmail.com",
   "firstname": "IFEYINWA",
   "lastname": "NWOBI",
   "Username": "IFEYINWA.NWOBI"
 },
 {
   "email": "omorbaz@gmail.com",
   "firstname": "OMOREGBE ",
   "lastname": "BAZUAYE",
   "Username": "OMOREGBE .BAZUAYE"
 },
 {
   "email": "bellingco@gmail.com",
   "firstname": "OYAREBU",
   "lastname": "YAKUBU B.",
   "Username": "OYAREBU.YAKUBU B."
 },
 {
   "email": "hannyuko@gmail.com",
   "firstname": "HANSON",
   "lastname": "UKO",
   "Username": "HANSON.UKO"
 },
 {
   "email": "aniefioknico@gmail.com",
   "firstname": "ANIEFIOK",
   "lastname": "UDOH",
   "Username": "ANIEFIOK.UDOH"
 },
 {
   "email": "jiireemotan@yahoo.com",
   "firstname": "JIIRE",
   "lastname": "KOLA-KUFORIJI",
   "Username": "JIIRE.KOLA-KUFORIJI"
 },
 {
   "email": "AYAJANGS4U@GMAIL.COM",
   "firstname": "AJANG",
   "lastname": "SUNDAY",
   "Username": "AJANG.SUNDAY"
 },
 {
   "email": "sefemi77@yahoo.com",
   "firstname": "Olatunde",
   "lastname": "Olajide Sunday",
   "Username": "Olatunde.Olajide Sunday"
 },
 {
   "email": "aguhenrietta@yahoo.com",
   "firstname": "HENRIETTA",
   "lastname": "AGU",
   "Username": "HENRIETTA.AGU"
 },
 {
   "email": "gregabrahams@yahoo.com",
   "firstname": "GREGORY",
   "lastname": "ODUAH-ABRAHAMS",
   "Username": "GREGORY.ODUAH-ABRAHAMS"
 },
 {
   "email": "peterabu1@yahoo.com",
   "firstname": "Peter",
   "lastname": "Abu",
   "Username": "Peter.Abu"
 },
 {
   "email": "bolaoomotosho@gmail.com",
   "firstname": "Rasheed",
   "lastname": "Omotosho",
   "Username": "Rasheed.Omotosho"
 },
 {
   "email": "senami.ohiomokhare@daargroup.com",
   "firstname": "Senami",
   "lastname": "Ohiomokhare",
   "Username": "Senami.Ohiomokhare"
 },
 {
   "email": "cucares4u@yahoo.com",
   "firstname": "DAMILOLA",
   "lastname": "OGUNLEYE",
   "Username": "DAMILOLA.OGUNLEYE"
 },
 {
   "email": "fellydbeloved@yahoo.com",
   "firstname": "ODULAJA FELIX.B",
   "lastname": "FELIX.B",
   "Username": "ODULAJA FELIX.B.FELIX.B"
 },
 {
   "email": "ebhohonmoses@yahoo.com",
   "firstname": "EBHOHON",
   "lastname": "IRABOR MOSES",
   "Username": "EBHOHON.IRABOR MOSES"
 },
 {
   "email": "paulyn.ugbodaga@daargroup.com",
   "firstname": "PAULYN",
   "lastname": "UGBODAGA",
   "Username": "PAULYN.UGBODAGA"
 },
 {
   "email": "brandmagic360@gmail.com",
   "firstname": "Adegoke",
   "lastname": "Adebowale",
   "Username": "Adegoke.Adebowale"
 },
 {
   "email": "udaleabah5@yahoo.com",
   "firstname": "ABAH",
   "lastname": "JOHN",
   "Username": "ABAH.JOHN"
 },
 {
   "email": "oonyeka99@yahoo.com",
   "firstname": "OKORO",
   "lastname": "NWAMAKA ONYEKACï¿½UKWU",
   "Username": "OKORO.NWAMAKA ONYEKACï¿½UKWU"
 },
 {
   "email": "oloyeoworu@yahoo.com",
   "firstname": "Oloyede",
   "lastname": "Oworu",
   "Username": "Oloyede.Oworu"
 },
 {
   "email": "bibiyetienabeso@yahoo.com",
   "firstname": "TIENABESO JUSTICE",
   "lastname": "BIBIYE",
   "Username": "TIENABESO JUSTICE.BIBIYE"
 },
 {
   "email": "ethakhesi@gmail.com",
   "firstname": "YAKUBU",
   "lastname": "ETHAKHESI DOKPESI",
   "Username": "YAKUBU.ETHAKHESI DOKPESI"
 },
 {
   "email": "ndikafor@gmail.com",
   "firstname": "ndidi",
   "lastname": "okafor",
   "Username": "ndidi.okafor"
 },
 {
   "email": "gpero2000@yahoo.co.uk",
   "firstname": "peter",
   "lastname": "Abaje",
   "Username": "peter.Abaje"
 },
 {
   "email": "ibrahimauwal2015@gmail.com",
   "firstname": "Ibrahim",
   "lastname": "Auwal",
   "Username": "Ibrahim.Auwal"
 },
 {
   "email": "aidoyinedward@gmail.com",
   "firstname": "Edward",
   "lastname": "Aidoyin",
   "Username": "Edward.Aidoyin"
 },
 {
   "email": "umolemarcel@gmail.com",
   "firstname": "MARCELLINUS",
   "lastname": "UMOLE",
   "Username": "MARCELLINUS.UMOLE"
 },
 {
   "email": "femitolufashe@yahoo.com",
   "firstname": "FEMI",
   "lastname": "TOLUFASHE",
   "Username": "FEMI.TOLUFASHE"
 },
 {
   "email": "toniaikeejeye@yahoo.com",
   "firstname": "TONIA",
   "lastname": "IKE-EJEYE",
   "Username": "TONIA.IKE-EJEYE"
 },
 {
   "email": "westayoinvest@yahoo.com",
   "firstname": "OLUWASEUN",
   "lastname": "IDOWU",
   "Username": "OLUWASEUN.IDOWU"
 },
 {
   "email": "diyanshade@yahoo.com",
   "firstname": "FOLASHADE",
   "lastname": "OMONISAYE",
   "Username": "FOLASHADE.OMONISAYE"
 },
 {
   "email": "azibayagifto@yahoo.com",
   "firstname": "ABIGIAL",
   "lastname": "ITI",
   "Username": "ABIGIAL.ITI"
 },
 {
   "email": "JOANIDOKO@YAHOO.COM",
   "firstname": "JOAN",
   "lastname": "IDOKO",
   "Username": "JOAN.IDOKO"
 },
 {
   "email": "toluwalopeadebayo@gmail.com",
   "firstname": "Joseph",
   "lastname": "adebayo",
   "Username": "Joseph.adebayo"
 },
 {
   "email": "iblukman52@gmail.com",
   "firstname": "Ibrahim ",
   "lastname": "Lukman ",
   "Username": "Ibrahim .Lukman "
 },
 {
   "email": "fruitiontech2013@gmail.com",
   "firstname": "Faith",
   "lastname": "Obatitor",
   "Username": "Faith.Obatitor"
 },
 {
   "email": "timilehinjoel@gmail.com",
   "firstname": "TIMILEHIN",
   "lastname": "JOEL",
   "Username": "TIMILEHIN.JOEL"
 },
 {
   "email": "dokpesiobed@yahoo.com",
   "firstname": "DOKPESI",
   "lastname": "OBED",
   "Username": "DOKPESI.OBED"
 },
 {
   "email": "ndulife_2006@yahoo.ca",
   "firstname": "EGWU",
   "lastname": "NDUBUISI",
   "Username": "EGWU.NDUBUISI"
 },
 {
   "email": "emmanuelnlebedum@gmail.com",
   "firstname": "Emmanuel",
   "lastname": "Asagwaram",
   "Username": "Emmanuel.Asagwaram"
 },
 {
   "email": "murtalasani551@gmail.com",
   "firstname": "Sani ",
   "lastname": "Murtala ",
   "Username": "Sani .Murtala "
 },
 {
   "email": "adurojasamson@rocketmail.com",
   "firstname": "SAMSON",
   "lastname": "GBENGA ADUROJA",
   "Username": "SAMSON.GBENGA ADUROJA"
 },
 {
   "email": "asabeibrahim18@yahoo.com",
   "firstname": "Salamatu",
   "lastname": "Ibrahim",
   "Username": "Salamatu.Ibrahim"
 },
 {
   "email": "roluks4real@yahoo.com",
   "firstname": "aroluke",
   "lastname": "ogundele",
   "Username": "aroluke.ogundele"
 },
 {
   "email": "macp4all@yahoo.com",
   "firstname": "Osuagwu",
   "lastname": "Patrick",
   "Username": "Osuagwu.Patrick"
 },
 {
   "email": "toyinnavina@yahoo.com",
   "firstname": "oluwatoyin",
   "lastname": "nkamiang-john",
   "Username": "oluwatoyin.nkamiang-john"
 },
 {
   "email": "utangokaba@yahoo.com",
   "firstname": "utang",
   "lastname": "okaba",
   "Username": "utang.okaba"
 },
 {
   "email": "momoh.kelvin1111@yahoo.com",
   "firstname": "EHIZOJIE",
   "lastname": "MOMOH",
   "Username": "EHIZOJIE.MOMOH"
 },
 {
   "email": "angeligbanoi@yahoo.com",
   "firstname": "ANGELA",
   "lastname": "IGBANOI",
   "Username": "ANGELA.IGBANOI"
 },
 {
   "email": "banjoojedeji@yahoo.com",
   "firstname": "Banjo",
   "lastname": "Ojedeji",
   "Username": "Banjo.Ojedeji"
 },
 {
   "email": "kandeellams@yahoo.co.uk",
   "firstname": "BERIKISU",
   "lastname": "ELLAMS",
   "Username": "BERIKISU.ELLAMS"
 },
 {
   "email": "tonywaysnig@yahoo.com",
   "firstname": "Anthony",
   "lastname": "Ogie",
   "Username": "Anthony.Ogie"
 },
 {
   "email": "macpepplealaere@gmail.com",
   "firstname": "ALAERE",
   "lastname": "PINADIRI",
   "Username": "ALAERE.PINADIRI"
 },
 {
   "email": "policyontrac@daargroup.com",
   "firstname": "ROSEMARY",
   "lastname": "WILKEY",
   "Username": "ROSEMARY.WILKEY"
 },
 {
   "email": "akinjisef@yahoo.com",
   "firstname": "Funmilayo",
   "lastname": "Akinjise",
   "Username": "Funmilayo.Akinjise"
 },
 {
   "email": "babypeaceordu@yahoo.com",
   "firstname": "ORDU",
   "lastname": "PEACE",
   "Username": "ORDU.PEACE"
 },
 {
   "email": "kelechichidi06@gmail.com",
   "firstname": "KELECHI",
   "lastname": "CHIDI",
   "Username": "KELECHI.CHIDI"
 },
 {
   "email": "omotunde2004@yahoo.com",
   "firstname": "omotunde",
   "lastname": "adeyemi",
   "Username": "omotunde.adeyemi"
 },
 {
   "email": "martinsmichael@yahoo.com",
   "firstname": "martins",
   "lastname": "michael",
   "Username": "martins.michael"
 },
 {
   "email": "paulhaike@gmail.com",
   "firstname": "Paul",
   "lastname": "Ikechukwu ",
   "Username": "Paul.Ikechukwu "
 },
 {
   "email": "oladoyin_olatunji@gmail.com",
   "firstname": "OLADOYIN",
   "lastname": "OLATUNJI",
   "Username": "OLADOYIN.OLATUNJI"
 },
 {
   "email": "omolayork@yahoo.com",
   "firstname": "OGUNDEYI ",
   "lastname": "OMOLAYO",
   "Username": "OGUNDEYI .OMOLAYO"
 },
 {
   "email": "kekeogungbe@yahoo.com",
   "firstname": "Kenny",
   "lastname": "Ogungbe",
   "Username": "Kenny.Ogungbe"
 },
 {
   "email": "brendauji@gmail.com",
   "firstname": "MNGUSUUL",
   "lastname": "UJI",
   "Username": "MNGUSUUL.UJI"
 },
 {
   "email": "lanrelaughs00@yahoo.com",
   "firstname": "Olanrewaju",
   "lastname": "Adeyemi",
   "Username": "Olanrewaju.Adeyemi"
 },
 {
   "email": "abangjake@yahoo.com",
   "firstname": "Jacob",
   "lastname": "Abang",
   "Username": "Jacob.Abang"
 },
 {
   "email": "nikkyagus@yahoo.com",
   "firstname": "NKEIRU",
   "lastname": "ONONIWU NWOKEDI",
   "Username": "NKEIRU.ONONIWU NWOKEDI"
 },
 {
   "email": "dareawonugba@yahoo.com",
   "firstname": "OLUDARE",
   "lastname": "ADELAJA AWONUGBA",
   "Username": "OLUDARE.ADELAJA AWONUGBA"
 },
 {
   "email": "triciabisong@yahoo.com",
   "firstname": "Patricia ",
   "lastname": "Bisong Egbe",
   "Username": "Patricia .Bisong Egbe"
 },
 {
   "email": "tijjaniyahaya1@gmail.com",
   "firstname": "Tijjani",
   "lastname": "Yahaya ",
   "Username": "Tijjani.Yahaya "
 },
 {
   "email": "attehgloryedwin@yahoo.com",
   "firstname": "EDWIN",
   "lastname": "ATTEH",
   "Username": "EDWIN.ATTEH"
 },
 {
   "email": "LADIOGAH2013@YAHOO.COM",
   "firstname": "LADI FILERAT OGAH",
   "lastname": "OGAH",
   "Username": "LADI FILERAT OGAH.OGAH"
 },
 {
   "email": "BOSEDAINI@YAHOO.COM",
   "firstname": "ABOSEDE",
   "lastname": "MESHIOYE",
   "Username": "ABOSEDE.MESHIOYE"
 },
 {
   "email": "atriple507@gmail.com",
   "firstname": "Ahmed ",
   "lastname": "Aliyu Adoke",
   "Username": "Ahmed .Aliyu Adoke"
 },
 {
   "email": "areghoka@yahoo.co.uk",
   "firstname": "MARY",
   "lastname": "LAWRENCE - DOKPESI",
   "Username": "MARY.LAWRENCE - DOKPESI"
 },
 {
   "email": "anoyoyo2009@gmail.com",
   "firstname": "Magnus",
   "lastname": "OGIAGBOVIOGIE",
   "Username": "Magnus.OGIAGBOVIOGIE"
 },
 {
   "email": "safiafe2011@gmail.com",
   "firstname": "CLEMENT",
   "lastname": "AFEMIKHE",
   "Username": "CLEMENT.AFEMIKHE"
 },
 {
   "email": "celinezek4love@yahoo.com",
   "firstname": "MARCELINA",
   "lastname": "OZEKHOME",
   "Username": "MARCELINA.OZEKHOME"
 },
 {
   "email": "okehetty@gmail.com",
   "firstname": "HENRIETTA",
   "lastname": "OKE",
   "Username": "HENRIETTA.OKE"
 },
 {
   "email": "kikijoo@yahoo.com",
   "firstname": "Nguher",
   "lastname": "Jooji",
   "Username": "Nguher.Jooji"
 },
 {
   "email": "degoldshield@yahoo.com",
   "firstname": "ANGELA",
   "lastname": "OBASI",
   "Username": "ANGELA.OBASI"
 },
 {
   "email": "amiwonderman@gmail.com",
   "firstname": "Silas",
   "lastname": "Wonderman KATUKA",
   "Username": "Silas.Wonderman KATUKA"
 },
 {
   "email": "lekanomosebi@yahoo.com",
   "firstname": "OMOSEBI ",
   "lastname": "OLALEKAN",
   "Username": "OMOSEBI .OLALEKAN"
 },
 {
   "email": "demolaibrahim2011@yahoo.com",
   "firstname": "ADEMOLA",
   "lastname": "IBRAHIM NAJEEM",
   "Username": "ADEMOLA.IBRAHIM NAJEEM"
 },
 {
   "email": "jasegeait@yahoo.com",
   "firstname": "JASMINE",
   "lastname": "EJEKWU",
   "Username": "JASMINE.EJEKWU"
 },
 {
   "email": "akintolasamuel@live.com",
   "firstname": "OLADELE",
   "lastname": "AKINTOLA",
   "Username": "OLADELE.AKINTOLA"
 },
 {
   "email": "ericusigbe@gmail.com",
   "firstname": "ERIC",
   "lastname": "USIGBE",
   "Username": "ERIC.USIGBE"
 },
 {
   "email": "peteremperor@yahoo.com",
   "firstname": "peter",
   "lastname": "ATULUKU",
   "Username": "peter.ATULUKU"
 },
 {
   "email": "msugh@yahoo.com",
   "firstname": "Kyado",
   "lastname": "Msugh",
   "Username": "Kyado.Msugh"
 },
 {
   "email": "shagariphilip@yahoo.com",
   "firstname": "PHILIP",
   "lastname": "SHAGARI",
   "Username": "PHILIP.SHAGARI"
 },
 {
   "email": "folavick@gmail.com",
   "firstname": "Victor",
   "lastname": "Fola-Adelegan",
   "Username": "Victor.Fola-Adelegan"
 },
 {
   "email": "ositadimaugwu@gmail.com",
   "firstname": "Ositadima",
   "lastname": "Ugwu",
   "Username": "Ositadima.Ugwu"
 },
 {
   "email": "tunex2u@yahoo.com",
   "firstname": "Endurance",
   "lastname": "Edenoje",
   "Username": "Endurance.Edenoje"
 },
 {
   "email": "yellowmandavid@yahoo.com",
   "firstname": "David",
   "lastname": "Omotosho",
   "Username": "David.Omotosho"
 },
 {
   "email": "cubamoore@yahoo.com",
   "firstname": "INNOCENT",
   "lastname": "AMADI",
   "Username": "INNOCENT.AMADI"
 },
 {
   "email": "gbengie430@yahoo.co.uk",
   "firstname": "Olugbenga",
   "lastname": "Adeleye",
   "Username": "Olugbenga.Adeleye"
 },
 {
   "email": "segun_d@ymail.com",
   "firstname": "OLUSEGUN",
   "lastname": "DADA",
   "Username": "OLUSEGUN.DADA"
 },
 {
   "email": "folaadekoyowa@gmail.com",
   "firstname": "folarin",
   "lastname": "adekoyowa",
   "Username": "folarin.adekoyowa"
 },
 {
   "email": "uk4joy13@yahoo.co.uk",
   "firstname": "ANI",
   "lastname": "EUCHARIA ONYINYECHI",
   "Username": "ANI.EUCHARIA ONYINYECHI"
 },
 {
   "email": "osomutseh@yahoo.com",
   "firstname": "monday",
   "lastname": "osumah",
   "Username": "monday.osumah"
 },
 {
   "email": "olutesola@yahoo.com",
   "firstname": "Theresa",
   "lastname": "popoola",
   "Username": "Theresa.popoola"
 },
 {
   "email": "sunday.ogbiko@yahoo.co.uk",
   "firstname": "SUNDAY",
   "lastname": "OGBIKO",
   "Username": "SUNDAY.OGBIKO"
 },
 {
   "email": "ogu.gladys@yahoo.com",
   "firstname": "GLADYS",
   "lastname": "OGU",
   "Username": "GLADYS.OGU"
 },
 {
   "email": "essyrite@yahoo.com",
   "firstname": "Fidelis",
   "lastname": "Onyinyechi",
   "Username": "Fidelis.Onyinyechi"
 },
 {
   "email": "abudua.precious@gmail.com",
   "firstname": "PRECIOUS",
   "lastname": "ABUDU",
   "Username": "PRECIOUS.ABUDU"
 },
 {
   "email": "toluwon@yahoo.com",
   "firstname": "Adetolu",
   "lastname": "Adejuwon",
   "Username": "Adetolu.Adejuwon"
 },
 {
   "email": "sanijoel403@yahoo.com",
   "firstname": "JOEL",
   "lastname": "SANI",
   "Username": "JOEL.SANI"
 },
 {
   "email": "sadiyaahmadbaba@gmail.com",
   "firstname": "SADIYA",
   "lastname": "AHMED",
   "Username": "SADIYA.AHMED"
 },
 {
   "email": "ebuchi@yahoo.com",
   "firstname": "ONYEBUCHI",
   "lastname": "EKEJI",
   "Username": "ONYEBUCHI.EKEJI"
 },
 {
   "email": "saricino_zai@yahoo.co.uk",
   "firstname": "Nneka",
   "lastname": "Ogwu",
   "Username": "Nneka.Ogwu"
 },
 {
   "email": "shogaolusegun@yahoo.com",
   "firstname": "olusegun",
   "lastname": "soga",
   "Username": "olusegun.soga"
 },
 {
   "email": "solomonjoseph4u4ever@yahoo.com",
   "firstname": "Solomon",
   "lastname": "Etuk",
   "Username": "Solomon.Etuk"
 },
 {
   "email": "eopeyemi10@yahoo.com",
   "firstname": "EMMANUEL",
   "lastname": "OPEYEMI",
   "Username": "EMMANUEL.OPEYEMI"
 },
 {
   "email": "ashaoluakinsola1985@gmail.com",
   "firstname": "Ashaolu",
   "lastname": "Akinsola",
   "Username": "Ashaolu.Akinsola"
 },
 {
   "email": "Akinboro4@gmail.com",
   "firstname": "Akinboro",
   "lastname": "Babatunde",
   "Username": "Akinboro.Babatunde"
 },
 {
   "email": "bankoleezekiel@gmail.com",
   "firstname": "Ezekiel",
   "lastname": "Bankole",
   "Username": "Ezekiel.Bankole"
 },
 {
   "email": "sunnyotsemeh@yahoo.com",
   "firstname": "MOHAMMED",
   "lastname": "OTSEMEH",
   "Username": "MOHAMMED.OTSEMEH"
 },
 {
   "email": "saintphilipin@yahoo.com",
   "firstname": "PHILIP",
   "lastname": "IRABOR",
   "Username": "PHILIP.IRABOR"
 },
 {
   "email": "luvdokpesi@gmail.com",
   "firstname": "Loveth",
   "lastname": "DOKPESI",
   "Username": "Loveth.DOKPESI"
 },
 {
   "email": "mosun_yemi@yahoo.com",
   "firstname": "Mosunmola",
   "lastname": "Akintoye",
   "Username": "Mosunmola.Akintoye"
 },
 {
   "email": "daniels4seun2010@yahoo.com",
   "firstname": "Daniel",
   "lastname": "Oluwaseun",
   "Username": "Daniel.Oluwaseun"
 },
 {
   "email": "chimainnocent73@gmail.com",
   "firstname": "Innocent",
   "lastname": "Uhegbu",
   "Username": "Innocent.Uhegbu"
 },
 {
   "email": "albertewa@yahoo.com",
   "firstname": "ALBERT",
   "lastname": "EWALEFOH",
   "Username": "ALBERT.EWALEFOH"
 },
 {
   "email": "tobiet4luv@gmail.com",
   "firstname": "Taiwo",
   "lastname": "Oluwatobi",
   "Username": "Taiwo.Oluwatobi"
 },
 {
   "email": "ishaq.olapade@yahoo.com",
   "firstname": "OLAPADE",
   "lastname": "ISHAQ",
   "Username": "OLAPADE.ISHAQ"
 },
 {
   "email": "akindipe75@yahoo.com",
   "firstname": "AKINDIPE",
   "lastname": "BOLANLE",
   "Username": "AKINDIPE.BOLANLE"
 },
 {
   "email": "pewterdecont2000@yahoo.com",
   "firstname": "PHILLIPS",
   "lastname": "PETER",
   "Username": "PHILLIPS.PETER"
 },
 {
   "email": "ifontown@yahoo.com",
   "firstname": "Taiwo",
   "lastname": "Abiodun",
   "Username": "Taiwo.Abiodun"
 },
 {
   "email": "launchforth@yahoo.com",
   "firstname": "Olanrewaju",
   "lastname": "Awoyemi",
   "Username": "Olanrewaju.Awoyemi"
 },
 {
   "email": "charlesaghedo15@gmail.com",
   "firstname": "AGHEDO",
   "lastname": "CHARLES",
   "Username": "AGHEDO.CHARLES"
 },
 {
   "email": "maxwellkamo@yahoo.com",
   "firstname": "MAXWELL",
   "lastname": "FRANCIS",
   "Username": "MAXWELL.FRANCIS"
 },
 {
   "email": "adewoye_gbenga@yahoo.com",
   "firstname": "Gbenga",
   "lastname": "Adewoye",
   "Username": "Gbenga.Adewoye"
 },
 {
   "email": "abiodunmatemi@yahoo.com",
   "firstname": "MATEMI-OLUWA",
   "lastname": "ABIODUN JAMES",
   "Username": "MATEMI-OLUWA.ABIODUN JAMES"
 },
 {
   "email": "mukennyworld2000@gmail.com",
   "firstname": "KENNETH",
   "lastname": "MUSA",
   "Username": "KENNETH.MUSA"
 },
 {
   "email": "ikhacasimir@yahoo.co.uk",
   "firstname": "Casimir",
   "lastname": "Ugbodaga",
   "Username": "Casimir.Ugbodaga"
 },
 {
   "email": "obakizevic@gmail.com",
   "firstname": "Victor",
   "lastname": "Obakize",
   "Username": "Victor.Obakize"
 },
 {
   "email": "ichiemkhaef@gmail.com",
   "firstname": "PIUS",
   "lastname": "ALAMOR",
   "Username": "PIUS.ALAMOR"
 },
 {
   "email": "hariteks@yahoo.co.uk",
   "firstname": "Agnes",
   "lastname": "IKE",
   "Username": "Agnes.IKE"
 },
 {
   "email": "adexteewhy@yahoo.com",
   "firstname": "ADEBIYI",
   "lastname": "OLUTAYO",
   "Username": "ADEBIYI.OLUTAYO"
 },
 {
   "email": "femfolk@yahoo.com",
   "firstname": "FEMI",
   "lastname": "MAJEKODUNMI",
   "Username": "FEMI.MAJEKODUNMI"
 },
 {
   "email": "opeoluwafadeyi@yahoo.com",
   "firstname": "Opeoluwa",
   "lastname": "Fadeyi",
   "Username": "Opeoluwa.Fadeyi"
 },
 {
   "email": "bolajisunkanmi2014@gmail.com",
   "firstname": "Bolaji",
   "lastname": "olasunkanmi",
   "Username": "Bolaji.olasunkanmi"
 },
 {
   "email": "JASFOTO4REAL@YAHOO.COM",
   "firstname": "IPEMIDA",
   "lastname": "ONIVEHU",
   "Username": "IPEMIDA.ONIVEHU"
 },
 {
   "email": "eaghatise@yahoo.com",
   "firstname": "EFOSA",
   "lastname": "AGHATISE",
   "Username": "EFOSA.AGHATISE"
 },
 {
   "email": "riskyat@yahoo.com",
   "firstname": "RISIKAT OLABISI",
   "lastname": "TIJANI",
   "Username": "RISIKAT OLABISI.TIJANI"
 },
 {
   "email": "adebayoibukun23@yahoo.com",
   "firstname": "adebayo",
   "lastname": "ibukun",
   "Username": "adebayo.ibukun"
 },
 {
   "email": "abdulkadiribrahim375@gmail.com",
   "firstname": "Ibrahim ",
   "lastname": "Seidu ",
   "Username": "Ibrahim .Seidu "
 },
 {
   "email": "chidex07@gmail.com",
   "firstname": "CHIGOZIE",
   "lastname": "AKABOGU",
   "Username": "CHIGOZIE.AKABOGU"
 },
 {
   "email": "maryann.omeciti@yahoo.com",
   "firstname": "maryam",
   "lastname": "ukana",
   "Username": "maryam.ukana"
 },
 {
   "email": "ukohaebere5@yahoo.com",
   "firstname": "EBERE",
   "lastname": "UKOHA",
   "Username": "EBERE.UKOHA"
 },
 {
   "email": "ikhajo@gmail.com",
   "firstname": "JOSEPH",
   "lastname": "IKHAZOBOR",
   "Username": "JOSEPH.IKHAZOBOR"
 },
 {
   "email": "joskally07@yahoo.com",
   "firstname": "Josephine",
   "lastname": "Aiyegbeni",
   "Username": "Josephine.Aiyegbeni"
 },
 {
   "email": "onyeka14@yahoo.com",
   "firstname": "Lawrence",
   "lastname": "Otabor",
   "Username": "Lawrence.Otabor"
 },
 {
   "email": "ngoziali@gmail.com",
   "firstname": "Ngozi",
   "lastname": "Aliemeke",
   "Username": "Ngozi.Aliemeke"
 },
 {
   "email": "dohertytoyinwumi@gmail.com",
   "firstname": "DOHERTY",
   "lastname": "OMOWUMI",
   "Username": "DOHERTY.OMOWUMI"
 },
 {
   "email": "olaolu4great@gmail.com",
   "firstname": "Olaoluwa",
   "lastname": "Abudu",
   "Username": "Olaoluwa.Abudu"
 },
 {
   "email": "bigjunior55@gmail.com",
   "firstname": "isaac",
   "lastname": "preboye",
   "Username": "isaac.preboye"
 },
 {
   "email": "odeyemie.abiodun@gmail.com",
   "firstname": "ELIZABETH",
   "lastname": "ODEYEMI",
   "Username": "ELIZABETH.ODEYEMI"
 },
 {
   "email": "omorodionchristy@yahoo.com",
   "firstname": "Christiana",
   "lastname": "Adeyemi",
   "Username": "Christiana.Adeyemi"
 },
 {
   "email": "ashaoluakinsola@gmail.com",
   "firstname": "Daudu",
   "lastname": "Zezeliu",
   "Username": "Daudu.Zezeliu"
 },
 {
   "email": "faith.ikems@daargroup.com",
   "firstname": "FAITH",
   "lastname": "IKEMS",
   "Username": "FAITH.IKEMS"
 },
 {
   "email": "ade_adejoro@yahoo.com",
   "firstname": "JOHN",
   "lastname": "ADEJORO",
   "Username": "JOHN.ADEJORO"
 },
 {
   "email": "jegbefumejuliet@yahoo.com",
   "firstname": "JEGBEFUME JULIET",
   "lastname": "AKINLEHIN",
   "Username": "JEGBEFUME JULIET.AKINLEHIN"
 },
 {
   "email": "richardayeni@yahoo.com",
   "firstname": "Richard",
   "lastname": "Ayeni",
   "Username": "Richard.Ayeni"
 },
 {
   "email": "aydomain2000@yahoo.com",
   "firstname": "TAIWO",
   "lastname": "BALOGUN",
   "Username": "TAIWO.BALOGUN"
 },
 {
   "email": "philip.unugor@daargroup.com",
   "firstname": "Philip",
   "lastname": "Unugor",
   "Username": "Philip.Unugor"
 },
 {
   "email": "rhodrissuccess@yahoo.com",
   "firstname": "RHODA",
   "lastname": "OGUNSEYE",
   "Username": "RHODA.OGUNSEYE"
 },
 {
   "email": "olanrewa4suns@gmail.com",
   "firstname": "WASIU",
   "lastname": "OLANREWAJU",
   "Username": "WASIU.OLANREWAJU"
 },
 {
   "email": "okwuogorifelix@gmail.com",
   "firstname": "felix",
   "lastname": "okwuogori",
   "Username": "felix.okwuogori"
 },
 {
   "email": "sj_deenraj@yahoo.com",
   "firstname": "SURAJUDEEN",
   "lastname": "ODEDOYIN",
   "Username": "SURAJUDEEN.ODEDOYIN"
 },
 {
   "email": "sadiatighile@yahoo.com",
   "firstname": "SADIAT",
   "lastname": "IGHILE",
   "Username": "SADIAT.IGHILE"
 },
 {
   "email": "kayodepelemo13@gmail.com",
   "firstname": "Pelemo",
   "lastname": "Kayode",
   "Username": "Pelemo.Kayode"
 },
 {
   "email": "daveojobo@yahoo.com",
   "firstname": "DAVID",
   "lastname": "OJOBO",
   "Username": "DAVID.OJOBO"
 },
 {
   "email": "abdulkadiribrshim35@gmail.com",
   "firstname": "Ibrahim ",
   "lastname": "Rahma ",
   "Username": "Ibrahim .Rahma "
 },
 {
   "email": "cizobode@yahoo.com",
   "firstname": "Izobode ",
   "lastname": "Christopher ",
   "Username": "Izobode .Christopher "
 },
 {
   "email": "abdulkadiribrahim35@gmail.com",
   "firstname": "Usman ",
   "lastname": "Umar ",
   "Username": "Usman .Umar "
 },
 {
   "email": "ekhatoralexander@gmail.com",
   "firstname": "Alex",
   "lastname": "Ekhator",
   "Username": "Alex.Ekhator"
 },
 {
   "email": "fataibalogun2004@yahoo.com",
   "firstname": "FATAI",
   "lastname": "BALOGUN",
   "Username": "FATAI.BALOGUN"
 },
 {
   "email": "makritez@yahoo.com",
   "firstname": "RITA",
   "lastname": "EZEKWE",
   "Username": "RITA.EZEKWE"
 },
 {
   "email": "kolafasola@rocketmail.com",
   "firstname": "Akeem",
   "lastname": "Lawal",
   "Username": "Akeem.Lawal"
 },
 {
   "email": "tee.success@yahoo.com",
   "firstname": "Esther",
   "lastname": "Temitope",
   "Username": "Esther.Temitope"
 },
 {
   "email": "frankgodwin@rocketmail.com",
   "firstname": "KUFRE",
   "lastname": "FRANCIS",
   "Username": "KUFRE.FRANCIS"
 },
 {
   "email": "SALAMIABDULKADIRI@GMAIL.COM",
   "firstname": "SALAMI",
   "lastname": "ABDULKADIRI",
   "Username": "SALAMI.ABDULKADIRI"
 },
 {
   "email": "ferdinandagu@yahoo.com",
   "firstname": "Ferdinand",
   "lastname": "Agu",
   "Username": "Ferdinand.Agu"
 },
 {
   "email": "barripereomongu@yahoo.com",
   "firstname": "BARRI",
   "lastname": "PEREOMONGU",
   "Username": "BARRI.PEREOMONGU"
 },
 {
   "email": "veraladiva77@gmail.com",
   "firstname": "veronica",
   "lastname": "odey",
   "Username": "veronica.odey"
 },
 {
   "email": "ajayiadegboyega1@yahoo.com",
   "firstname": "Ajayi",
   "lastname": "Adegboyega",
   "Username": "Ajayi.Adegboyega"
 },
 {
   "email": "oladejoolatayo@yahoo.com",
   "firstname": "Olatayo ",
   "lastname": "Oladejo ",
   "Username": "Olatayo .Oladejo "
 },
 {
   "email": "efejosep29@yahoo.com",
   "firstname": "OGHUVWU",
   "lastname": "EFE JOSEPH",
   "Username": "OGHUVWU.EFE JOSEPH"
 },
 {
   "email": "solicitoribrahim@yahoo.com",
   "firstname": "Isah Bayo",
   "lastname": "Ebiloma",
   "Username": "Isah Bayo.Ebiloma"
 },
 {
   "email": "samsonolusegun2020@gmail.com",
   "firstname": "Samson Olusegun",
   "lastname": "Odetayo",
   "Username": "Samson Olusegun.Odetayo"
 },
 {
   "email": "josephine04.aj@gmail.com",
   "firstname": "ADEMU",
   "lastname": "JOSEPHINE",
   "Username": "ADEMU.JOSEPHINE"
 },
 {
   "email": "TUNDEAGBAJE90@YAHOO.COM",
   "firstname": "AGBAJE",
   "lastname": "BABATUNDE SANI",
   "Username": "AGBAJE.BABATUNDE SANI"
 },
 {
   "email": "ifeanyiekeh25@yahoo.com",
   "firstname": "VICTOR ",
   "lastname": "EKEH",
   "Username": "VICTOR .EKEH"
 },
 {
   "email": "festusoke2020@gmail.com",
   "firstname": "FESTUS",
   "lastname": "OKE",
   "Username": "FESTUS.OKE"
 },
 {
   "email": "aremulanre@gmail.com",
   "firstname": "AREMU",
   "lastname": "OLANREWAJU HAKEEM",
   "Username": "AREMU.OLANREWAJU HAKEEM"
 },
 {
   "email": "jacobdauda237@yahoo.com",
   "firstname": "JACOB ",
   "lastname": "DAUDA ",
   "Username": "JACOB .DAUDA "
 },
 {
   "email": "josephineeshioriameh@yahoo.com",
   "firstname": "josephine ",
   "lastname": "eshioriameh",
   "Username": "josephine .eshioriameh"
 },
 {
   "email": "omoalex77@gmail.com",
   "firstname": "Alex",
   "lastname": "Omoniyi",
   "Username": "Alex.Omoniyi"
 },
 {
   "email": "adekunleadebayo18@yahoo.com",
   "firstname": "Adebayo",
   "lastname": "Adekunle",
   "Username": "Adebayo.Adekunle"
 },
 {
   "email": "rabiumaruf2003@yahoo.com",
   "firstname": "Rabiu",
   "lastname": "Oladeji",
   "Username": "Rabiu.Oladeji"
 },
 {
   "email": "igajah55@gmail.com",
   "firstname": "Ibe",
   "lastname": "Igajah",
   "Username": "Ibe.Igajah"
 },
 {
   "email": "ewussu@yahoo.com",
   "firstname": "ESTHER",
   "lastname": "AKINSANYA",
   "Username": "ESTHER.AKINSANYA"
 },
 {
   "email": "layansina@gmail.com",
   "firstname": "LUKMAN",
   "lastname": "AYANSINA",
   "Username": "LUKMAN.AYANSINA"
 },
 {
   "email": "akwuihiabe@yahoo.com",
   "firstname": "AKWU",
   "lastname": "IHIABE",
   "Username": "AKWU.IHIABE"
 },
 {
   "email": "anuoluwapowgj@yahoo.com",
   "firstname": "ANUOLUWAPO",
   "lastname": "AWOJOBI",
   "Username": "ANUOLUWAPO.AWOJOBI"
 },
 {
   "email": "umarfarukshehu96@gmail.com",
   "firstname": "umar",
   "lastname": "faruk shehu",
   "Username": "umar.faruk shehu"
 },
 {
   "email": "febije@yahoo.com",
   "firstname": "FAITH",
   "lastname": "EBIJE",
   "Username": "FAITH.EBIJE"
 },
 {
   "email": "olusegunbmercy@yahoo.com",
   "firstname": "Onifade",
   "lastname": "Olusegun",
   "Username": "Onifade.Olusegun"
 },
 {
   "email": "latoks16@yahoo.com",
   "firstname": "Obukwesili Elizabeth unoma",
   "lastname": "Elizabeth",
   "Username": "Obukwesili Elizabeth unoma.Elizabeth"
 },
 {
   "email": "wumiobabori@yahoo.com",
   "firstname": "bosede omowumi",
   "lastname": "obabori",
   "Username": "bosede omowumi.obabori"
 },
 {
   "email": "iraborabraham@yahoo.com",
   "firstname": "IRABOR",
   "lastname": "ABRAHAM",
   "Username": "IRABOR.ABRAHAM"
 },
 {
   "email": "pegugbodaga@gmail.com",
   "firstname": "Ali",
   "lastname": "Ugbodaga",
   "Username": "Ali.Ugbodaga"
 },
 {
   "email": "ayodejiajayiajide@yahoo.com",
   "firstname": "Ayodeji ",
   "lastname": "Ajayi Ajide",
   "Username": "Ayodeji .Ajayi Ajide"
 },
 {
   "email": "hassandulo@gmail.com",
   "firstname": "Hussaini",
   "lastname": "Ismail",
   "Username": "Hussaini.Ismail"
 },
 {
   "email": "samtaunag@gmial.com",
   "firstname": "samson",
   "lastname": "gora",
   "Username": "samson.gora"
 },
 {
   "email": "ismailmohammednur@yahoo.com",
   "firstname": "Ismail",
   "lastname": "Mohammed Nur",
   "Username": "Ismail.Mohammed Nur"
 },
 {
   "email": "musayusuf1985@yahoo.com",
   "firstname": "Musa",
   "lastname": "Yusuf",
   "Username": "Musa.Yusuf"
 },
 {
   "email": "ebhohonobehi@gmail.com",
   "firstname": "obehi",
   "lastname": "Ebhohon",
   "Username": "obehi.Ebhohon"
 },
 {
   "email": "theresajoseph100@yahoo.com",
   "firstname": "theresa ",
   "lastname": "joseph",
   "Username": "theresa .joseph"
 },
 {
   "email": "rogogo98@gmail.com",
   "firstname": "IBRAHIM",
   "lastname": "LAWAL",
   "Username": "IBRAHIM.LAWAL"
 },
 {
   "email": "ikechukwuokechukwu76@gmail.com",
   "firstname": "OKECHUKWU",
   "lastname": "IKECHUKWU .R",
   "Username": "OKECHUKWU.IKECHUKWU .R"
 },
 {
   "email": "ERIBA@GMAIL.COM",
   "firstname": "EMMANUEL",
   "lastname": "MONDAY ERIBA",
   "Username": "EMMANUEL.MONDAY ERIBA"
 },
 {
   "email": "idayatakinniyi@yahoo.com",
   "firstname": "IDAYATU ",
   "lastname": "AKINNIYI",
   "Username": "IDAYATU .AKINNIYI"
 },
 {
   "email": "naltutumaadams@gmail.com",
   "firstname": "NGALTU",
   "lastname": "JONTHAN ADAMS",
   "Username": "NGALTU.JONTHAN ADAMS"
 },
 {
   "email": "joshuayannet@gmail.com",
   "firstname": "Joshua",
   "lastname": "Yannet",
   "Username": "Joshua.Yannet"
 },
 {
   "email": "dareebole@gmail.com",
   "firstname": "Ebole",
   "lastname": "Dare",
   "Username": "Ebole.Dare"
 },
 {
   "email": "solidguze@yahoo.com",
   "firstname": "ogunlade",
   "lastname": "olugbenga",
   "Username": "ogunlade.olugbenga"
 },
 {
   "email": "VICITSUOKOR@YAHOO.COM",
   "firstname": "VICTOR ",
   "lastname": "ITSUOKOR",
   "Username": "VICTOR .ITSUOKOR"
 },
 {
   "email": "soa_egbejobi@yahoo.com",
   "firstname": "EGBEJOBI",
   "lastname": "SAKIRU ASELA",
   "Username": "EGBEJOBI.SAKIRU ASELA"
 },
 {
   "email": "babangida299@gmail.com",
   "firstname": "Banbangida",
   "lastname": "Ibarhim",
   "Username": "Banbangida.Ibarhim"
 },
 {
   "email": "salakij@yahoo.com",
   "firstname": "JUSTINA",
   "lastname": "SALAKI",
   "Username": "JUSTINA.SALAKI"
 },
 {
   "email": "ikembagodswill@yahoo.com",
   "firstname": "Godswill",
   "lastname": "Ikemba",
   "Username": "Godswill.Ikemba"
 },
 {
   "email": "susanelisy@yahoo.com",
   "firstname": "SUSAN ONYELISI",
   "lastname": "OKOLIE",
   "Username": "SUSAN ONYELISI.OKOLIE"
 },
 {
   "email": "joshuaokopi@yahoo.com",
   "firstname": "JOSHUA OKOPI ",
   "lastname": "OCHEIKWU",
   "Username": "JOSHUA OKOPI .OCHEIKWU"
 },
 {
   "email": "pokugifty05@gmail.com",
   "firstname": "JAMES",
   "lastname": "GIFTY",
   "Username": "JAMES.GIFTY"
 },
 {
   "email": "enikeclr@yahoo.com",
   "firstname": "claire ",
   "lastname": "ENIKE",
   "Username": "claire .ENIKE"
 },
 {
   "email": "akinbola.ayobami@yahoo.com",
   "firstname": "AKINBOLA",
   "lastname": "AYOBAMI AMINAT",
   "Username": "AKINBOLA.AYOBAMI AMINAT"
 },
 {
   "email": "chatwitmyke@yahoo.com",
   "firstname": "Agana",
   "lastname": "Michael Adejoh",
   "Username": "Agana.Michael Adejoh"
 },
 {
   "email": "matthew4bright@yahoo.com",
   "firstname": "ATTAH",
   "lastname": "AMANYI",
   "Username": "ATTAH.AMANYI"
 },
 {
   "email": "urum.nancy@yahoo.com",
   "firstname": "OYEDIYA",
   "lastname": "URUM",
   "Username": "OYEDIYA.URUM"
 },
 {
   "email": "lizzyavhi@yahoo.com",
   "firstname": "ELIZABETH",
   "lastname": "AVHIOBOH",
   "Username": "ELIZABETH.AVHIOBOH"
 },
 {
   "email": "christianasati@yahoo.com",
   "firstname": "christiana",
   "lastname": "sati",
   "Username": "christiana.sati"
 },
 {
   "email": "queensouza@yahoo.com",
   "firstname": "stella",
   "lastname": "deSouza -0mezi",
   "Username": "stella.deSouza -0mezi"
 },
 {
   "email": "AJINGO1957@GMAIL.COM",
   "firstname": "EWEHENJI THOMAS",
   "lastname": "USHIE",
   "Username": "EWEHENJI THOMAS.USHIE"
 },
 {
   "email": "abigailafolabi@ymail.com",
   "firstname": "OPEYEMI",
   "lastname": "AFOLABI",
   "Username": "OPEYEMI.AFOLABI"
 },
 {
   "email": "thywil@gmail.com",
   "firstname": "Joseph Michael Udoh",
   "lastname": "Udoh",
   "Username": "Joseph Michael Udoh.Udoh"
 },
 {
   "email": "nyiakulajacob87@gmail.com",
   "firstname": "Nyiakula",
   "lastname": "Jacob Terhile",
   "Username": "Nyiakula.Jacob Terhile"
 },
 {
   "email": "CHIOMAFC@YAHOO.COM",
   "firstname": "CHIOMA",
   "lastname": "UGOCHUKWU",
   "Username": "CHIOMA.UGOCHUKWU"
 },
 {
   "email": "peacemaker8874@yahoo.com",
   "firstname": "CHARLES",
   "lastname": "MBAGWU",
   "Username": "CHARLES.MBAGWU"
 },
 {
   "email": "johnotiebu@yahoo.com",
   "firstname": "JOHN OTI",
   "lastname": "EBU",
   "Username": "JOHN OTI.EBU"
 },
 {
   "email": "vikky4sam@yahoo.com",
   "firstname": "VICTORIA",
   "lastname": "AFEAHAI",
   "Username": "VICTORIA.AFEAHAI"
 },
 {
   "email": "ofestyle@yahoo.ca",
   "firstname": "ofe",
   "lastname": "Asekhameh",
   "Username": "ofe.Asekhameh"
 },
 {
   "email": "danjuma@yahoo.com",
   "firstname": "DANJUMA",
   "lastname": "GERSHON",
   "Username": "DANJUMA.GERSHON"
 },
 {
   "email": "bayouint@yahoo.com",
   "firstname": "adebayo julius",
   "lastname": "adebiyi",
   "Username": "adebayo julius.adebiyi"
 },
 {
   "email": "andrewachor@yahoo.com",
   "firstname": "andrew",
   "lastname": "achor",
   "Username": "andrew.achor"
 },
 {
   "email": "08169620052@yahoo.com",
   "firstname": "eric",
   "lastname": "ejemah",
   "Username": "eric.ejemah"
 },
 {
   "email": "ustinfrad4real@yahoo.com",
   "firstname": "FRIDAY AUGUSTINE",
   "lastname": "EFFIONG",
   "Username": "FRIDAY AUGUSTINE.EFFIONG"
 },
 {
   "email": "sundayojisua@gmail.com",
   "firstname": "sunday",
   "lastname": "ojisua",
   "Username": "sunday.ojisua"
 },
 {
   "email": "Uwelegodfrey@yahoo.com",
   "firstname": "ERUAGA",
   "lastname": "GODFREY",
   "Username": "ERUAGA.GODFREY"
 },
 {
   "email": "richardinalegwu@yahoo.com",
   "firstname": "RICHARD",
   "lastname": "INALEGWU",
   "Username": "RICHARD.INALEGWU"
 },
 {
   "email": "ayoimafidon@yahoo.com",
   "firstname": "Imafidon",
   "lastname": "Dennis",
   "Username": "Imafidon.Dennis"
 },
 {
   "email": "lekanabodunrin@yahoo.com",
   "firstname": "ABODUNRIN",
   "lastname": "OLALEKAN",
   "Username": "ABODUNRIN.OLALEKAN"
 },
 {
   "email": "aminzee88@yahoo.com",
   "firstname": "NDAMUDAN",
   "lastname": "AMINU",
   "Username": "NDAMUDAN.AMINU"
 },
 {
   "email": "TOYINSHOFUNPE24@YAHOO.COM",
   "firstname": "SHOFUNPE",
   "lastname": "TOYIN",
   "Username": "SHOFUNPE.TOYIN"
 },
 {
   "email": "adeyinka.olubukola@yahoo.com",
   "firstname": "OLUBUKOLA",
   "lastname": "ADETOLA",
   "Username": "OLUBUKOLA.ADETOLA"
 },
 {
   "email": "stephen.nmoafu@gmail.com",
   "firstname": "NMOAFU",
   "lastname": "STEPHEN",
   "Username": "NMOAFU.STEPHEN"
 },
 {
   "email": "BORIOLAITAN@GMAIL.COM",
   "firstname": "ADEBESHIN",
   "lastname": "OLUSEGUN",
   "Username": "ADEBESHIN.OLUSEGUN"
 },
 {
   "email": "ejehthankgod1986@gmail.com",
   "firstname": "Ejeh",
   "lastname": "ThankGod",
   "Username": "Ejeh.ThankGod"
 },
 {
   "email": "obetensteve@gmail.com",
   "firstname": "OBETEN",
   "lastname": "STEPHEN",
   "Username": "OBETEN.STEPHEN"
 },
 {
   "email": "eokuabor@yahoo.co.uk",
   "firstname": "Erowo",
   "lastname": "Okuabor",
   "Username": "Erowo.Okuabor"
 },
 {
   "email": "shedrackodajili@gmail.com",
   "firstname": "Shedrack",
   "lastname": "Odajili",
   "Username": "Shedrack.Odajili"
 },
 {
   "email": "oluyemobafaiye@yahoo.com",
   "firstname": "OLUWAYEMISI",
   "lastname": "OBAFAIYE",
   "Username": "OLUWAYEMISI.OBAFAIYE"
 },
 {
   "email": "rahilabusa@yahoo.com",
   "firstname": "RAHILA",
   "lastname": "BUSA",
   "Username": "RAHILA.BUSA"
 },
 {
   "email": "wasiuolaoye@gmail.com",
   "firstname": "Wasiu",
   "lastname": "Olaoye",
   "Username": "Wasiu.Olaoye"
 },
 {
   "email": "zitwhite@yahoo.ca",
   "firstname": "ZITA",
   "lastname": "EZE",
   "Username": "ZITA.EZE"
 },
 {
   "email": "aderintodsamson26@gmail.com",
   "firstname": "Aderinto",
   "lastname": "Samson",
   "Username": "Aderinto.Samson"
 },
 {
   "email": "enugureporters@yahoo.com",
   "firstname": "Charles",
   "lastname": "Okechukwu",
   "Username": "Charles.Okechukwu"
 },
 {
   "email": "oluaitalegbe4life@gmail.com",
   "firstname": "OLU",
   "lastname": "AITALEGBE",
   "Username": "OLU.AITALEGBE"
 },
 {
   "email": "feenah499@gmail.com",
   "firstname": "Nafisatu",
   "lastname": "Aliyu",
   "Username": "Nafisatu.Aliyu"
 },
 {
   "email": "gloryobosike@yahoo.com",
   "firstname": "Glory",
   "lastname": "Obisike",
   "Username": "Glory.Obisike"
 },
 {
   "email": "MAMEDUABBAH@GMAIL.COM",
   "firstname": "MAMODU",
   "lastname": "ABBAH",
   "Username": "MAMODU.ABBAH"
 },
 {
   "email": "bokajames@yahoo.com",
   "firstname": "BOKA",
   "lastname": "JAMES",
   "Username": "BOKA.JAMES"
 },
 {
   "email": "esauwonder@yahoo.com",
   "firstname": "ISAAC",
   "lastname": "OKEMEH",
   "Username": "ISAAC.OKEMEH"
 },
 {
   "email": "babatundewilliam@gmail.com",
   "firstname": "BABATUNDE",
   "lastname": "KAYODE",
   "Username": "BABATUNDE.KAYODE"
 },
 {
   "email": "daveola20022002@yahoo.com",
   "firstname": "DAVID",
   "lastname": "OLANREWAJU",
   "Username": "DAVID.OLANREWAJU"
 },
 {
   "email": "ait_titty@yahoo.com",
   "firstname": "Ireti",
   "lastname": "Adegbolagun",
   "Username": "Ireti.Adegbolagun"
 },
 {
   "email": "paulinusagumalu@yahoo.com",
   "firstname": "PAULINUS O",
   "lastname": "AGUMANU",
   "Username": "PAULINUS O.AGUMANU"
 },
 {
   "email": "rakemup10000@yahoo.com",
   "firstname": "uzoma",
   "lastname": "ken",
   "Username": "uzoma.ken"
 },
 {
   "email": "templeomah7@yahoo.com",
   "firstname": "Temple",
   "lastname": "omah",
   "Username": "Temple.omah"
 },
 {
   "email": "oyinboke60@gmail.com",
   "firstname": "Michael",
   "lastname": "Olumuyiwa",
   "Username": "Michael.Olumuyiwa"
 },
 {
   "email": "otsuemmanuel@gmail.com",
   "firstname": "Otsu",
   "lastname": "Emmanuel ",
   "Username": "Otsu.Emmanuel "
 },
 {
   "email": "oge.helen@yahoo.com",
   "firstname": "Helen",
   "lastname": "Ogedegbe",
   "Username": "Helen.Ogedegbe"
 },
 {
   "email": "okachapat1972@gmail.com",
   "firstname": "PATRICK",
   "lastname": "Okacha",
   "Username": "PATRICK.Okacha"
 },
 {
   "email": "ayemobaprogress@yahoo.com",
   "firstname": "PROGRESS MOSES",
   "lastname": "AYEMOBA",
   "Username": "PROGRESS MOSES.AYEMOBA"
 },
 {
   "email": "anukwuchristopher@yahoo.com",
   "firstname": "Christopher",
   "lastname": "Anukwu",
   "Username": "Christopher.Anukwu"
 },
 {
   "email": "zrabomohd@gmail.com",
   "firstname": "Rabo",
   "lastname": "Mohammed",
   "Username": "Rabo.Mohammed"
 },
 {
   "email": "kellybankz@yahoo.com",
   "firstname": "Acha",
   "lastname": "Emmanuel David",
   "Username": "Acha.Emmanuel David"
 },
 {
   "email": "Tosinabiolar@gmail.com",
   "firstname": "Tosin",
   "lastname": "Abiola",
   "Username": "Tosin.Abiola"
 },
 {
   "email": "tahiribrahim002@gmail.com",
   "firstname": "MUHAMMAD TAHIR",
   "lastname": "IBRAHIM",
   "Username": "MUHAMMAD TAHIR.IBRAHIM"
 },
 {
   "email": "adamiyoni@yahoo.com",
   "firstname": "HALIMAT",
   "lastname": "SANNI",
   "Username": "HALIMAT.SANNI"
 },
 {
   "email": "zeesan4luv@yahoo.com",
   "firstname": "Zainab",
   "lastname": "Sani Unekwu",
   "Username": "Zainab.Sani Unekwu"
 },
 {
   "email": "dotunodusina@gmail.com",
   "firstname": "Adedotun",
   "lastname": "Odusina",
   "Username": "Adedotun.Odusina"
 },
 {
   "email": "spinwiz83@gmail.com",
   "firstname": "abdulrazak",
   "lastname": "usman",
   "Username": "abdulrazak.usman"
 },
 {
   "email": "shittutemitope41@yahoo.com",
   "firstname": "Temitope",
   "lastname": "Shittu",
   "Username": "Temitope.Shittu"
 },
 {
   "email": "yomiguy@yahoo.com",
   "firstname": "Dada",
   "lastname": "Abayomi",
   "Username": "Dada.Abayomi"
 },
 {
   "email": "femiakinpelu2015@gmail.com",
   "firstname": "Femi",
   "lastname": "Akinpelu",
   "Username": "Femi.Akinpelu"
 },
 {
   "email": "albertgonet1@gmail.com",
   "firstname": "Albert",
   "lastname": "Gonet",
   "Username": "Albert.Gonet"
 },
 {
   "email": "abdulgee73@gmail.com",
   "firstname": "Abdullahi",
   "lastname": "Ibrahim",
   "Username": "Abdullahi.Ibrahim"
 },
 {
   "email": "francisola978@gmail.com",
   "firstname": "FRANCIS KAYODE",
   "lastname": "GABRIEL",
   "Username": "FRANCIS KAYODE.GABRIEL"
 },
 {
   "email": "alexxzee@yahoo.com",
   "firstname": "Ajakaiye ",
   "lastname": "Alexander ",
   "Username": "Ajakaiye .Alexander "
 },
 {
   "email": "kaymysom@gmail.com",
   "firstname": "kayode",
   "lastname": "oyewale",
   "Username": "kayode.oyewale"
 },
 {
   "email": "stephenakpekioko@gmail.com",
   "firstname": "STEPHEN",
   "lastname": "AKPEKIOKO",
   "Username": "STEPHEN.AKPEKIOKO"
 },
 {
   "email": "dbosilack@yahoo.com",
   "firstname": "ALIDUNAH",
   "lastname": "BOSILACK",
   "Username": "ALIDUNAH.BOSILACK"
 },
 {
   "email": "ndubuisimbeyi24@yahoo.com",
   "firstname": "mbeyi",
   "lastname": "ndubuisi",
   "Username": "mbeyi.ndubuisi"
 },
 {
   "email": "mijijonah@yahoo.com",
   "firstname": "Jonah",
   "lastname": "Miji",
   "Username": "Jonah.Miji"
 },
 {
   "email": "flo4real45@gmail.com",
   "firstname": "ENELUWE",
   "lastname": "NKEM DONALD",
   "Username": "ENELUWE.NKEM DONALD"
 },
 {
   "email": "sirmolly14@gmail.com",
   "firstname": "PHILIP ",
   "lastname": " OGAGBOLO",
   "Username": "PHILIP . OGAGBOLO"
 },
 {
   "email": "gabrieldokwoji@yahoo.com",
   "firstname": "GABRIEL",
   "lastname": "DAKWOJI",
   "Username": "GABRIEL.DAKWOJI"
 },
 {
   "email": "johnpeter@yahoo.com",
   "firstname": "JOHN",
   "lastname": "PETER",
   "Username": "JOHN.PETER"
 },
 {
   "email": "muhammedthanni@yahoo.com",
   "firstname": "Muhammed",
   "lastname": "Alaya",
   "Username": "Muhammed.Alaya"
 },
 {
   "email": "YAHAYAMUSA@YAHOO.COM",
   "firstname": "YAHAYA",
   "lastname": "ISAH",
   "Username": "YAHAYA.ISAH"
 },
 {
   "email": "onajaann@gmail.com",
   "firstname": "onoja ",
   "lastname": "ann",
   "Username": "onoja .ann"
 },
 {
   "email": "meetabrahametacherure@yahoo.com",
   "firstname": "Abraham",
   "lastname": "Etacherure",
   "Username": "Abraham.Etacherure"
 },
 {
   "email": "ogugofor4sure@yahoo.com",
   "firstname": "ogugofor",
   "lastname": "ujunwa",
   "Username": "ogugofor.ujunwa"
 },
 {
   "email": "yakububala80@yahoo.com",
   "firstname": "SHEHU ZAILANI",
   "lastname": "ABDULLAHI",
   "Username": "SHEHU ZAILANI.ABDULLAHI"
 },
 {
   "email": "abdullahiisah@yahoo.com",
   "firstname": " ISAH",
   "lastname": "ABDULLAHI TIRWUN",
   "Username": " ISAH.ABDULLAHI TIRWUN"
 },
 {
   "email": "idrisbala@yahoo.com",
   "firstname": "IDRIS",
   "lastname": "BALA",
   "Username": "IDRIS.BALA"
 },
 {
   "email": "nonex_35@yahoo.com",
   "firstname": "Nonyerem ",
   "lastname": "Oguike ",
   "Username": "Nonyerem .Oguike "
 },
 {
   "email": "segunsobo@yahoo.com",
   "firstname": "SEGUN",
   "lastname": "SOBO",
   "Username": "SEGUN.SOBO"
 },
 {
   "email": "ademi64@yahoo.com",
   "firstname": "Florence",
   "lastname": "FakoredeFakorede",
   "Username": "Florence.FakoredeFakorede"
 },
 {
   "email": "hassanapeh@gmail.com",
   "firstname": "APEH",
   "lastname": "HASSAN",
   "Username": "APEH.HASSAN"
 },
 {
   "email": "hardeola_beauty@yahoo.com",
   "firstname": "Adeola",
   "lastname": "Adeolu",
   "Username": "Adeola.Adeolu"
 },
 {
   "email": "johnobeakemhe@gmail.com",
   "firstname": "JOHN",
   "lastname": "OBEAKEMHE OSHOMOGHO",
   "Username": "JOHN.OBEAKEMHE OSHOMOGHO"
 },
 {
   "email": "helenazimi50@gmail.com",
   "firstname": "HELEN",
   "lastname": "ITSEMHE AZIMIH",
   "Username": "HELEN.ITSEMHE AZIMIH"
 },
 {
   "email": "gclef24@yahoo.com",
   "firstname": "Gbenga",
   "lastname": "Janehin",
   "Username": "Gbenga.Janehin"
 },
 {
   "email": "infomatrix78@gmail.com",
   "firstname": "Martyns",
   "lastname": "Oghene Sampson",
   "Username": "Martyns.Oghene Sampson"
 },
 {
   "email": "olanike_taiwo@yahoo.com",
   "firstname": "FADARE",
   "lastname": "TAIWO",
   "Username": "FADARE.TAIWO"
 },
 {
   "email": "Okhadaargroup2@gmail.com",
   "firstname": "JOSEPH",
   "lastname": "MUSA",
   "Username": "JOSEPH.MUSA"
 },
 {
   "email": "ogunshinafemi12@gmail.com",
   "firstname": "OLUFEMI",
   "lastname": "OGUNSHINA",
   "Username": "OLUFEMI.OGUNSHINA"
 },
 {
   "email": "akanenoumoh@gmail.com",
   "firstname": "Akaneno",
   "lastname": "Umoh",
   "Username": "Akaneno.Umoh"
 },
 {
   "email": "tajudeeninvention@yahoo.com",
   "firstname": "tajudeen",
   "lastname": "godday",
   "Username": "tajudeen.godday"
 },
 {
   "email": "j_owoicho@yahoo.com",
   "firstname": "owoicho",
   "lastname": "Joseph",
   "Username": "owoicho.Joseph"
 },
 {
   "email": "jattoefosa@yahoo.com",
   "firstname": "JATTO",
   "lastname": "FESTUS",
   "Username": "JATTO.FESTUS"
 },
 {
   "email": "princessprisca38@yahoo.com",
   "firstname": "IORJAA ",
   "lastname": "PRISCILLA",
   "Username": "IORJAA .PRISCILLA"
 },
 {
   "email": "SAMMIEAMOS@YAHOO.COM",
   "firstname": "MANYA",
   "lastname": "OSIEBE",
   "Username": "MANYA.OSIEBE"
 },
 {
   "email": "henchoait@gmail.com",
   "firstname": "Hencho",
   "lastname": "Nwaegu",
   "Username": "Hencho.Nwaegu"
 },
 {
   "email": "aliamos@gmail.com",
   "firstname": "Ali",
   "lastname": "Amos",
   "Username": "Ali.Amos"
 },
 {
   "email": "inieffiong007@yahoo.com",
   "firstname": "INI",
   "lastname": "EFFIONG",
   "Username": "INI.EFFIONG"
 },
 {
   "email": "ekikoalban@gmail.com",
   "firstname": "EKIKO",
   "lastname": "ALBAN",
   "Username": "EKIKO.ALBAN"
 },
 {
   "email": "phillukas95@yahoo.com",
   "firstname": "philip",
   "lastname": "philip",
   "Username": "philip.philip"
 },
 {
   "email": "krazyme4ever87@gmail.com",
   "firstname": "Jenkins ",
   "lastname": "Osoru ",
   "Username": "Jenkins .Osoru "
 },
 {
   "email": "roses2786@yahoo.com",
   "firstname": "Ekobay",
   "lastname": "Josephine",
   "Username": "Ekobay.Josephine"
 },
 {
   "email": "olaife1989@yahoo.com",
   "firstname": "ABIODUN",
   "lastname": "BELLO",
   "Username": "ABIODUN.BELLO"
 },
 {
   "email": "peteraleruba@gmail.com ",
   "firstname": "PETER",
   "lastname": "ALERUBA",
   "Username": "PETER.ALERUBA"
 },
 {
   "email": "dorcasawuru@gmail.com",
   "firstname": "Dorcas",
   "lastname": "Martins",
   "Username": "Dorcas.Martins"
 },
 {
   "email": "rahkeh001@yahoo.com",
   "firstname": "Ayinla",
   "lastname": "Kehinde Abd'Raheem",
   "Username": "Ayinla.Kehinde Abd'Raheem"
 },
 {
   "email": "danyunux@gmail.com",
   "firstname": "UMAR YUNUS",
   "lastname": "YUNUS",
   "Username": "UMAR YUNUS.YUNUS"
 },
 {
   "email": "johngundu@yahoo.com",
   "firstname": "JOHN HAA",
   "lastname": "GUNDU",
   "Username": "JOHN HAA.GUNDU"
 },
 {
   "email": "treasuredone2reconewit@yahoo.com",
   "firstname": "NGAKWE",
   "lastname": "JULIET",
   "Username": "NGAKWE.JULIET"
 },
 {
   "email": "loab1014u2meet@yahoo.com",
   "firstname": "olaosebikan",
   "lastname": "olaniyi",
   "Username": "olaosebikan.olaniyi"
 },
 {
   "email": "messageliman@gmail.com",
   "firstname": "Liman Mark",
   "lastname": "Usman",
   "Username": "Liman Mark.Usman"
 },
 {
   "email": "djhotega2002@yahoo.co.uk",
   "firstname": "oluwakayode",
   "lastname": "Akanle",
   "Username": "oluwakayode.Akanle"
 },
 {
   "email": "aoelewa@yahoo.com",
   "firstname": "ADENIYI",
   "lastname": "ELEWA",
   "Username": "ADENIYI.ELEWA"
 },
 {
   "email": "anthonyokhipo@gmail.com",
   "firstname": "ANTHONY",
   "lastname": "OKHIPO",
   "Username": "ANTHONY.OKHIPO"
 },
 {
   "email": "isaacinnocent10@yahoo.com",
   "firstname": "INNOCENT",
   "lastname": "ISAAC",
   "Username": "INNOCENT.ISAAC"
 },
 {
   "email": "frankobiosaobuezie859@gmail.com",
   "firstname": "FRANCIS",
   "lastname": "OBIOSA",
   "Username": "FRANCIS.OBIOSA"
 },
 {
   "email": "joneshelen41@gmail.com",
   "firstname": "JOSEPH",
   "lastname": "JONES ODOH",
   "Username": "JOSEPH.JONES ODOH"
 },
 {
   "email": "ihotu21@yahoo.com",
   "firstname": "IHOTU",
   "lastname": "ODOH",
   "Username": "IHOTU.ODOH"
 },
 {
   "email": "kabi@yahoo.com",
   "firstname": "KABIRU",
   "lastname": "USMAN",
   "Username": "KABIRU.USMAN"
 },
 {
   "email": "obimefunaokolo@hotmail.com",
   "firstname": "George",
   "lastname": "Okolo",
   "Username": "George.Okolo"
 },
 {
   "email": "jaonime@yahoo.com",
   "firstname": "JOHNSON ALU'HUMILE",
   "lastname": "ONIME",
   "Username": "JOHNSON ALU'HUMILE.ONIME"
 },
 {
   "email": "good_mus01@yahoo.com",
   "firstname": "ABDULKADRI",
   "lastname": "BHADMUS",
   "Username": "ABDULKADRI.BHADMUS"
 },
 {
   "email": "bensoneze@yahoo.com",
   "firstname": "BENSON",
   "lastname": "EZE",
   "Username": "BENSON.EZE"
 },
 {
   "email": "wilsonusman94@yahoo.com",
   "firstname": "wilson",
   "lastname": "usman",
   "Username": "wilson.usman"
 },
 {
   "email": "samsexyreal@yahoo.com",
   "firstname": "Samuel",
   "lastname": "Ulione",
   "Username": "Samuel.Ulione"
 },
 {
   "email": "nwakorvc@gmail.com",
   "firstname": "nwakor",
   "lastname": "victor",
   "Username": "nwakor.victor"
 },
 {
   "email": "adeosunsunday1@gmail.com",
   "firstname": "SUNDAY",
   "lastname": "ADEOSUN",
   "Username": "SUNDAY.ADEOSUN"
 },
 {
   "email": "kelechialice@yahoo.com",
   "firstname": "kelechi",
   "lastname": "ekwugha",
   "Username": "kelechi.ekwugha"
 },
 {
   "email": "njom.ethel@yahoo.com",
   "firstname": "Ethel",
   "lastname": "Njom",
   "Username": "Ethel.Njom"
 },
 {
   "email": "BISCODANJUMAAVERIK@GMAIL.COM",
   "firstname": "BISCO",
   "lastname": "D. AVERIK",
   "Username": "BISCO.D. AVERIK"
 },
 {
   "email": "vickyslyrics@yahoo.com",
   "firstname": "Victoria",
   "lastname": "Okosun",
   "Username": "Victoria.Okosun"
 },
 {
   "email": "tijani@yahoo.com",
   "firstname": "tijani",
   "lastname": "alubgele",
   "Username": "tijani.alubgele"
 },
 {
   "email": "odioanthony@yahoo.com",
   "firstname": "odio",
   "lastname": "anthony",
   "Username": "odio.anthony"
 },
 {
   "email": "ayooul@yahoo.com",
   "firstname": "oluseda",
   "lastname": "ayodeji",
   "Username": "oluseda.ayodeji"
 },
 {
   "email": "tonybawa@yahoo.com",
   "firstname": "anthony",
   "lastname": "Bawa",
   "Username": "anthony.Bawa"
 },
 {
   "email": "www.agboolap911@gmail.com",
   "firstname": "AGBOOLA",
   "lastname": "PETER",
   "Username": "AGBOOLA.PETER"
 },
 {
   "email": "emmanuelosho@yahoo.com",
   "firstname": "emmanuel",
   "lastname": "oshomah",
   "Username": "emmanuel.oshomah"
 },
 {
   "email": "BENIPRETTYFACE@YAHOO.COM",
   "firstname": "BENEDICTA",
   "lastname": "NSOFOR",
   "Username": "BENEDICTA.NSOFOR"
 },
 {
   "email": "kemiochagla@gmail.com",
   "firstname": "Dada",
   "lastname": "Oluwakemi ",
   "Username": "Dada.Oluwakemi "
 },
 {
   "email": "deblossom12002@yahoo.com",
   "firstname": "DOROTHY",
   "lastname": "NONYELUM",
   "Username": "DOROTHY.NONYELUM"
 },
 {
   "email": "barristerkonye@yahoo.com",
   "firstname": "Chinyere",
   "lastname": "Charles-Edohoeket ",
   "Username": "Chinyere.Charles-Edohoeket "
 },
 {
   "email": "abelromeo@yahoo.com",
   "firstname": "ABEL",
   "lastname": "ROMEO N.",
   "Username": "ABEL.ROMEO N."
 },
 {
   "email": "sahassy911@gmail.com",
   "firstname": "HASSAN",
   "lastname": "ABEDOH SALIHU",
   "Username": "HASSAN.ABEDOH SALIHU"
 },
 {
   "email": "amadianndyson@gmail.com",
   "firstname": "ANNDYSON",
   "lastname": "E. AMADI",
   "Username": "ANNDYSON.E. AMADI"
 },
 {
   "email": "christian22@yahoo.com",
   "firstname": "CHRISTIAN",
   "lastname": "NEESOGHO",
   "Username": "CHRISTIAN.NEESOGHO"
 },
 {
   "email": "nwabueze.ogbonna@yahoo.com",
   "firstname": "NWABUEZE",
   "lastname": "OGBONNA",
   "Username": "NWABUEZE.OGBONNA"
 },
 {
   "email": "yinka.yousuph@daargroup.com",
   "firstname": "ADEYINKA ABDULLAH",
   "lastname": "YOUSUPH",
   "Username": "ADEYINKA ABDULLAH.YOUSUPH"
 },
 {
   "email": "ruthbabawale@gmail.com",
   "firstname": "RUTH",
   "lastname": "BABAWALE",
   "Username": "RUTH.BABAWALE"
 },
 {
   "email": "gbengaaruleba@yahoo.co.uk",
   "firstname": "Aruleba",
   "lastname": "Olugbenga",
   "Username": "Aruleba.Olugbenga"
 },
 {
   "email": "odiaomon@yahoo.com",
   "firstname": "christopher",
   "lastname": "odia",
   "Username": "christopher.odia"
 },
 {
   "email": "princeadegoketemmie@gmail.com",
   "firstname": "Adegoke",
   "lastname": "Opeyemi",
   "Username": "Adegoke.Opeyemi"
 },
 {
   "email": "amamicanaa@yahoo.com",
   "firstname": "AMAECHI",
   "lastname": "ANAKWUE",
   "Username": "AMAECHI.ANAKWUE"
 },
 {
   "email": "abahsadiyat@yahoo.com",
   "firstname": "sadiyat",
   "lastname": "abah",
   "Username": "sadiyat.abah"
 },
 {
   "email": "freeman24life@yahoo.com",
   "firstname": "Emmanuel",
   "lastname": "idegun",
   "Username": "Emmanuel.idegun"
 },
 {
   "email": "patience4_jesus@yahoo.com",
   "firstname": "PATIENCE",
   "lastname": "LAWAL",
   "Username": "PATIENCE.LAWAL"
 },
 {
   "email": "oliver.ngyohov@daargroup.com",
   "firstname": "Oliver",
   "lastname": "Ngyohov",
   "Username": "Oliver.Ngyohov"
 },
 {
   "email": "njokunwabueze@gmail.com",
   "firstname": "Nwabueze",
   "lastname": "Njoku",
   "Username": "Nwabueze.Njoku"
 },
 {
   "email": "elamah2000@yahoo.com",
   "firstname": "RAYMOND ",
   "lastname": "ELAMAH",
   "Username": "RAYMOND .ELAMAH"
 },
 {
   "email": "nunoo.stephen@yahoo.com",
   "firstname": "Stephen",
   "lastname": "Nunoo",
   "Username": "Stephen.Nunoo"
 },
 {
   "email": "agbonsuremi@yahoo.com",
   "firstname": "Augustine",
   "lastname": "Agbonsuremi",
   "Username": "Augustine.Agbonsuremi"
 },
 {
   "email": "juliet.oshevire@yahoo.co.uk",
   "firstname": "ADIRI JULIET",
   "lastname": "OSHEVIRE",
   "Username": "ADIRI JULIET.OSHEVIRE"
 },
 {
   "email": "udokaluo@yahoo.com",
   "firstname": "kalu",
   "lastname": "udo",
   "Username": "kalu.udo"
 },
 {
   "email": "kabirusadiq@yahoo.com",
   "firstname": "KABIRU",
   "lastname": "SADIQ",
   "Username": "KABIRU.SADIQ"
 },
 {
   "email": "angaloze@gmail.com",
   "firstname": "Annah",
   "lastname": "Ngaloze",
   "Username": "Annah.Ngaloze"
 },
 {
   "email": "princegodfrey@yahoo.com",
   "firstname": "USIFOH",
   "lastname": "PRINCE GODFREY",
   "Username": "USIFOH.PRINCE GODFREY"
 },
 {
   "email": "dowellogbobeni@gmail.com",
   "firstname": "DOWELL ",
   "lastname": "OGBOBENI",
   "Username": "DOWELL .OGBOBENI"
 },
 {
   "email": "ewejeoluwaseyi20@gmail.com",
   "firstname": "Eweje",
   "lastname": "Oluwaseyi",
   "Username": "Eweje.Oluwaseyi"
 },
 {
   "email": "ebiakut@yahoo.com",
   "firstname": "RACHEL",
   "lastname": "EBIAKU-OSOYAN",
   "Username": "RACHEL.EBIAKU-OSOYAN"
 },
 {
   "email": "aminunamadi@yahoo.com",
   "firstname": "AMINU",
   "lastname": "MUHAMMED NAMADI",
   "Username": "AMINU.MUHAMMED NAMADI"
 },
 {
   "email": "suleyoonus@yahoo.com",
   "firstname": "Suleiman ",
   "lastname": "Yoonus Jatto",
   "Username": "Suleiman .Yoonus Jatto"
 },
 {
   "email": "adamugarba0079@gmail.com",
   "firstname": "GARBA",
   "lastname": "ADAMU",
   "Username": "GARBA.ADAMU"
 },
 {
   "email": "LOUIENSEFIK@GMAIL.COM",
   "firstname": "OROK EDEM NSEFIK",
   "lastname": "Fidelity Bank Plc",
   "Username": "OROK EDEM NSEFIK.Fidelity Bank Plc"
 },
 {
   "email": "balogunrasheed@yahoo.com",
   "firstname": "BALOGUN",
   "lastname": "RASHEED",
   "Username": "BALOGUN.RASHEED"
 },
 {
   "email": "talatuomokhagbor@yahoo.com",
   "firstname": "TALATU",
   "lastname": "OMOKHAGBOR",
   "Username": "TALATU.OMOKHAGBOR"
 },
 {
   "email": "zuweiraizuagbe@gmail.com",
   "firstname": "Zuweira",
   "lastname": "Charish",
   "Username": "Zuweira.Charish"
 },
 {
   "email": "iyare4president@gmail.com",
   "firstname": "Osaretin",
   "lastname": "Iyare",
   "Username": "Osaretin.Iyare"
 },
 {
   "email": "emilyyellowduke@yahoo.com",
   "firstname": "EMILY",
   "lastname": "YELLOW DUKE",
   "Username": "EMILY.YELLOW DUKE"
 },
 {
   "email": "prettyfirstlady@yahoo.com",
   "firstname": "PRETTY NGOZI ",
   "lastname": "ONWUKWE ONYEJIAKU",
   "Username": "PRETTY NGOZI .ONWUKWE ONYEJIAKU"
 },
 {
   "email": "nwosujossie@yahoo.com",
   "firstname": "JOSEPH",
   "lastname": "NWOSU",
   "Username": "JOSEPH.NWOSU"
 },
 {
   "email": "muri2006@gmail.com",
   "firstname": "murhi",
   "lastname": "inusa",
   "Username": "murhi.inusa"
 },
 {
   "email": "gracefagbayi@yahoo.com",
   "firstname": "GRACE",
   "lastname": "FAGBAYI",
   "Username": "GRACE.FAGBAYI"
 },
 {
   "email": "odionbello@gmail.com",
   "firstname": "bello",
   "lastname": "samuel",
   "Username": "bello.samuel"
 },
 {
   "email": "MANPLAZA2000@YAHOO.COM",
   "firstname": "OGUNLEYE ",
   "lastname": "BABAJIDE",
   "Username": "OGUNLEYE .BABAJIDE"
 },
 {
   "email": "bellams7980@gmail.com",
   "firstname": "ELLAMS",
   "lastname": "BELLA ISAH",
   "Username": "ELLAMS.BELLA ISAH"
 },
 {
   "email": "LAILAWAL31@GMAIL.COM",
   "firstname": "LAWAL",
   "lastname": "OLAYIWOLA",
   "Username": "LAWAL.OLAYIWOLA"
 },
 {
   "email": "bright.ojeme@yahoo.com",
   "firstname": "Bright",
   "lastname": "Oj",
   "Username": "Bright.Oj"
 },
 {
   "email": "slyss007@hotmail.com",
   "firstname": "Sylvester sule",
   "lastname": "Adamu",
   "Username": "Sylvester sule.Adamu"
 },
 {
   "email": "lollyfunky@gmail.com ",
   "firstname": "OLufunke",
   "lastname": "Ogunlolu",
   "Username": "OLufunke.Ogunlolu"
 },
 {
   "email": "mustrax@yahoo.com",
   "firstname": "Mohammed",
   "lastname": "Mustapha",
   "Username": "Mohammed.Mustapha"
 },
 {
   "email": "usenisamaila@yahoo.com",
   "firstname": "USENI",
   "lastname": "SAMAILA",
   "Username": "USENI.SAMAILA"
 },
 {
   "email": "martinskusa4real@gmail.com",
   "firstname": "ITYONYIMAN",
   "lastname": "MARTINS",
   "Username": "ITYONYIMAN.MARTINS"
 },
 {
   "email": "emmanuelikwa93@mail.com",
   "firstname": "ogbada",
   "lastname": "ikwa",
   "Username": "ogbada.ikwa"
 },
 {
   "email": "kumbapeter@yahoo.com",
   "firstname": "peter",
   "lastname": "kumba",
   "Username": "peter.kumba"
 },
 {
   "email": "johnproctoramgbari1460@gmail.com",
   "firstname": "Amgbari",
   "lastname": "Gbaranbiri",
   "Username": "Amgbari.Gbaranbiri"
 },
 {
   "email": "ebustica@yahoo.com",
   "firstname": "OMO-OSAGIE",
   "lastname": "EBUWA MARTINS",
   "Username": "OMO-OSAGIE.EBUWA MARTINS"
 },
 {
   "email": "collinsaka38@yahoo.com",
   "firstname": "JIMOH",
   "lastname": "COLLINS",
   "Username": "JIMOH.COLLINS"
 },
 {
   "email": "sholaaiye@yahoo.com",
   "firstname": "ADE-SHOLA",
   "lastname": "AIYEBOLA",
   "Username": "ADE-SHOLA.AIYEBOLA"
 },
 {
   "email": "anokwuruchinenye@gmail.com",
   "firstname": "Chinenye",
   "lastname": "Anokwuru",
   "Username": "Chinenye.Anokwuru"
 },
 {
   "email": "alikuemma@yahoo.com",
   "firstname": "EMMANUEL",
   "lastname": "ALIKU",
   "Username": "EMMANUEL.ALIKU"
 },
 {
   "email": "doubleprince19@gmail.com",
   "firstname": "ADEDIGBA",
   "lastname": "ADEWALE",
   "Username": "ADEDIGBA.ADEWALE"
 },
 {
   "email": "alhassanbello615@yahoo.com",
   "firstname": "ALHASSAN ",
   "lastname": "BELLO EJELEMAI",
   "Username": "ALHASSAN .BELLO EJELEMAI"
 },
 {
   "email": "saliumuhammed8@gmail.com ",
   "firstname": "SALIU",
   "lastname": "MUHAMMED",
   "Username": "SALIU.MUHAMMED"
 },
 {
   "email": "iorhemba73@yahoo.com",
   "firstname": "Charles",
   "lastname": "Ode",
   "Username": "Charles.Ode"
 },
 {
   "email": "samgibs005@yahoo.com",
   "firstname": "SAMUEL",
   "lastname": "EMMANUEL ",
   "Username": "SAMUEL.EMMANUEL "
 },
 {
   "email": "abuyeisaac@yahoo.com",
   "firstname": "isaac",
   "lastname": "abuye",
   "Username": "isaac.abuye"
 },
 {
   "email": "tosky2004@yahoo.co.uk",
   "firstname": "OLUWATOSIN",
   "lastname": "OBIAKHEME",
   "Username": "OLUWATOSIN.OBIAKHEME"
 },
 {
   "email": "udeshiagorye@yahoo.com",
   "firstname": "gabriel",
   "lastname": "agorye",
   "Username": "gabriel.agorye"
 },
 {
   "email": "nurayaradua@yahoo.com",
   "firstname": "Ibrahim ",
   "lastname": "Nura Yar'adua",
   "Username": "Ibrahim .Nura Yar'adua"
 },
 {
   "email": "seyiolani@gmail.com",
   "firstname": "OLASODE",
   "lastname": "OLUWASEYI",
   "Username": "OLASODE.OLUWASEYI"
 },
 {
   "email": "jubrilgarkuwa@yahoo.com",
   "firstname": "GARKUWA",
   "lastname": "JIBRIL ABUBAKAR",
   "Username": "GARKUWA.JIBRIL ABUBAKAR"
 },
 {
   "email": "tarijoshua@yahoo.com",
   "firstname": "tari",
   "lastname": "joshua",
   "Username": "tari.joshua"
 },
 {
   "email": "cohenzuwa@yahoo.com",
   "firstname": "CLEMENT",
   "lastname": "OHENZUWA",
   "Username": "CLEMENT.OHENZUWA"
 },
 {
   "email": "tekena4real@gmail.com",
   "firstname": "Alexander ",
   "lastname": "Amieyeofori",
   "Username": "Alexander .Amieyeofori"
 },
 {
   "email": "alfreddavies891@yahoo.com",
   "firstname": "ANNI",
   "lastname": "DAVIES",
   "Username": "ANNI.DAVIES"
 },
 {
   "email": "banabasidaro@yahoo.com",
   "firstname": "banabas",
   "lastname": "idaro",
   "Username": "banabas.idaro"
 },
 {
   "email": "mabel_idinye@yahoo.com",
   "firstname": "MABEL",
   "lastname": "IDINYE",
   "Username": "MABEL.IDINYE"
 },
 {
   "email": "idongikono@yahoo.com",
   "firstname": "Idongesit ",
   "lastname": "Ikono",
   "Username": "Idongesit .Ikono"
 },
 {
   "email": "victorkodesoh@yahoo.com",
   "firstname": "victor",
   "lastname": "kodesoh",
   "Username": "victor.kodesoh"
 },
 {
   "email": "chikoshall@gmail.com",
   "firstname": "Chikodinaka",
   "lastname": "Eze",
   "Username": "Chikodinaka.Eze"
 },
 {
   "email": "udykoolworld@yahoo.com",
   "firstname": "Uduak",
   "lastname": "Ekpo",
   "Username": "Uduak.Ekpo"
 },
 {
   "email": "tanimulere@naij.com",
   "firstname": "tanimu ",
   "lastname": "murtala",
   "Username": "tanimu .murtala"
 },
 {
   "email": "adewaleaja@yahoo.com",
   "firstname": "AJAYI",
   "lastname": "ADEWALE",
   "Username": "AJAYI.ADEWALE"
 },
 {
   "email": "asmaisiyasa@gmail.com",
   "firstname": "SADIQ",
   "lastname": "ABUBAKAR",
   "Username": "SADIQ.ABUBAKAR"
 },
 {
   "email": "adebeebee@yahoo.com",
   "firstname": "BODUNRIN",
   "lastname": "ADEBYO",
   "Username": "BODUNRIN.ADEBYO"
 },
 {
   "email": "helonaibrahim2016@gmail.com",
   "firstname": "Helona",
   "lastname": "Ibrahim",
   "Username": "Helona.Ibrahim"
 },
 {
   "email": "essting007@yahoo.com",
   "firstname": "Esther",
   "lastname": "Elisha Sobok",
   "Username": "Esther.Elisha Sobok"
 },
 {
   "email": "hadizaaudu123@gmail.com",
   "firstname": "Hadiza",
   "lastname": "Audu",
   "Username": "Hadiza.Audu"
 },
 {
   "email": "adukwujohn@yahoo.com",
   "firstname": "john",
   "lastname": "adukuwu",
   "Username": "john.adukuwu"
 },
 {
   "email": "benobek@yahoo.com",
   "firstname": "BENNETH",
   "lastname": "EKEADA",
   "Username": "BENNETH.EKEADA"
 },
 {
   "email": "thoyeen4real@gmail.com",
   "firstname": "oluwatoyin",
   "lastname": "oluyimika",
   "Username": "oluwatoyin.oluyimika"
 }
]
  let numOfEmployees = daarEmployeeData.length
  console.log(`numOfEmployees: `, numOfEmployees)

  let numOfEmployeesFound = 0
  daarEmployeeData.forEach(anEmployeeDatum => {
      let foundUser = Meteor.users.findOne({
        'emails.address': anEmployeeDatum.email,
        businessIds: "tgC7zYJf9ceSBmoT9"
      })
      if(foundUser) {
        Meteor.users.update(foundUser._id, {$set: {customUsername: anEmployeeDatum.Username}})
        Accounts.setPassword(foundUser._id, "123456")
        numOfEmployeesFound += 1
      } else {
        console.log(`Did not find user: `, JSON.stringify(anEmployeeDatum))
      }
  })
  console.log(`numOfEmployeesFound: `, numOfEmployeesFound)
  }

  /*,
  configureMailUrl: function (user, password, host, port) {
    let tenantMail = Packages.findOne({
      tenantId: this.getTenantId(),
      name: "core"
    }).settings.mail;
    let processUrl = process.env.MAIL_URL;
    let settingsUrl = Meteor.settings.MAIL_URL;
    if (user && password && host && port) {
      let mailString = `smtp://${user}:${password}@${host}:${port}/`;
      mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    } else if (tenantMail.user && tenantMail.password && tenantMail.host &&
      tenantMail.port) {
      Core.Log.info("setting default mail url to: " + tenantMail
        .host);
      let mailString =
        'smtp://${tenantMail.user}:${tenantMail.password}@${tenantMail.host}:${tenantMail.port}/';
      let mailUrl = processUrl = settingsUrl = mailString;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    } else if (settingsUrl && !processUrl) {
      let mailUrl = processUrl = settingsUrl;
      process.env.MAIL_URL = mailUrl;
      return mailUrl;
    }
    if (!process.env.MAIL_URL) {
      Core.Log.warn(
        "Mail server not configured. Unable to send email.");
      return false;
    }
  }*/
});

// Method Check Helper
Match.OptionalOrNull = function (pattern) {
  return Match.OneOf(void 0, null, pattern);
};

/*
 * Execute start up data load
 */

Meteor.startup(function () {
  Core.initSettings();
  Core.initAccount();
  Core.init();
  Core.startWebHooksJobs(),
  Core.updateDaarEmployeesWithCustomUsername()
});
