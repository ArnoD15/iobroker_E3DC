'use strict';
//------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++++
const instanz = '0_userdata.0';                                                                        	        // Instanz Script
const PfadEbene1 = 'TibberSkript';                                                                     	        // Pfad innerhalb der Instanz
const PfadEbene2 = ['Anzeige_VIS','OutputSignal','History','USER_ANPASSUNGEN']                		            // Pfad innerhalb PfadEbene1
const instanzE3DC_RSCP = 'e3dc-rscp.0'
const DebugAusgabeDetail = true;

//++++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++
//------------------------------------------------------------------------------------------------------


//******************************************************************************************************
//**************************************** Deklaration Variablen ***************************************
//******************************************************************************************************
const scriptVersion = 'Version 1.1.14'
log(`-==== Tibber Skript ${scriptVersion} ====-`);
// @ts-ignore
const { DateTime } = require("luxon");
// IDs Script Charge_Control
const sID_Autonomiezeit =`${instanz}.Charge_Control.Allgemein.Autonomiezeit`;
const sID_arrayHausverbrauch =`${instanz}.Charge_Control.Allgemein.arrayHausverbrauchDurchschnitt`;
const sID_maxEntladetiefeBatterie =`${instanz}.Charge_Control.USER_ANPASSUNGEN.10_maxEntladetiefeBatterie`
const sID_PrognoseAuto_kWh =`${instanz}.Charge_Control.History.PrognoseAuto_kWh`

// IDs des Adapters e3dc-rscp
const sID_Batterie_SOC =`${instanzE3DC_RSCP}.EMS.BAT_SOC`;                                                              // aktueller Batterie_SOC
const sID_Bat_Charge_Limit =`${instanzE3DC_RSCP}.EMS.SYS_SPECS.maxBatChargePower`;                                      // Batterie Ladelimit
const sID_SPECIFIED_Battery_Capacity_0 =`${instanzE3DC_RSCP}.BAT.BAT_0.SPECIFIED_CAPACITY`;                             // Installierte Batterie Kapazität Batteriekreis 0
const sID_SPECIFIED_Battery_Capacity_1 =`${instanzE3DC_RSCP}.BAT.BAT_1.SPECIFIED_CAPACITY`;                             // Installierte Batterie Kapazität Batteriekreis 1
const sID_BAT0_Alterungszustand =`${instanzE3DC_RSCP}.BAT.BAT_0.ASOC`;                                                  // Batterie ASOC e3dc-rscp
const sID_Power_Bat_W = `${instanzE3DC_RSCP}.EMS.POWER_BAT`;                                                            // aktuelle Batterie_Leistung'
const sID_Power_Grid = `${instanzE3DC_RSCP}.EMS.POWER_GRID`                                                             // Leistung aus Netz
const sID_Notrom_Status =`${instanzE3DC_RSCP}.EMS.EMERGENCY_POWER_STATUS`;                                              // 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
    
// IDs des Script Tibber
const sID_aktuellerEigenverbrauch = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`;        // Anzeige in VIS durchschnittlicher Eigenverbrauch
const sID_besteLadezeit = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.besteLadezeit`;                            // Anzeige in VIS bester Zeitraum um Batterie zu laden und Status
const sID_ladezeitBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`;                      // Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen
const sID_timerAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`;                                  // Anzeige in VIS Status Timer um Batterie zu laden
const sID_StrompreisBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`                   // Anzeige in VIS aktueller Strompreis Batterie
const sID_Spitzenstrompreis = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Spitzenstrompreis`                     // Anzeige in VIS aktueller Strompreis Batterie

const sID_BatterieLaden =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`;                             // Schnittstelle zu Charge-Control für die Ladefreigabe
const sID_eAutoLaden = `${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`;                                  // Schnittstelle zu E3DC_Wallbox Script Auto laden
const sID_BatterieEntladesperre =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`;             // Schnittstelle zu Charge-Control für die Entladesperre

const sID_DiagramJosonChart =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`;                            // JSON für Diagramm Tibber Preise in VIS
const sID_BatterieLadedaten = `${instanz}.${PfadEbene1}.${PfadEbene2[2]}.BatterieLadedaten`                     // JSON zum berechnen vom Batterie Strompreis

const sID_maxSoC =`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`; 
const sID_maxLadeleistungUser_W =`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxLadeleistung`; 
const sID_hoherSchwellwertStrompreis = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.hoherSchwellwertStrompreis`;
const sID_niedrigerSchwellwertStrompreis = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.niedrigerSchwellwertStrompreis`;

const sID_Schneebedeckt = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.pvSchneebedeckt`;
const sID_Systemwirkungsgrad = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Systemwirkungsgrad`
const sID_BatteriepreisAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.BatteriepreisAktiv`                   // Auswahl in VIS ob aktueller Strompreis Batterie brücksichtigt werden soll
const sID_Stromgestehungskosten = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.stromgestehungskosten`
const sID_TibberLinkID = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.tibberLinkId`

// IDs des Adapters TibberLink, Zuweisung in Funktion ScriptStart() wegen persönlicher ID
let tibberLinkId = getState(sID_TibberLinkID).val                                                               // TibberLink ID auslesen
const sID_PricesTodayJSON = `tibberlink.0.Homes.${tibberLinkId}.PricesToday.json`                               // Strompreise für aktuellen Tag
const sID_PricesTomorrowJSON = `tibberlink.0.Homes.${tibberLinkId}.PricesTomorrow.json`                         // Strompreise für nächsten Tag
const arrayID_TibberPrices =[sID_PricesTodayJSON,sID_PricesTomorrowJSON];    

let maxBatterieSoC, aktuelleBatterieSoC_Pro, maxLadeleistungUser_W, stromgestehungskosten;
let batterieKapazitaet_kWh, billigsterEinzelpreisBlock = 0, billigsterBlockPreis = 0, minStrompreis_48h = null, LogProgrammablauf = "";
let batterieSOC_alt = null, aktuellerPreisTibber = null, strompreisBatterie,bruttoPreisBatterie,systemwirkungsgrad = 0 ;
let hoherSchwellwert = 0, niedrigerSchwellwert = 0;

let bLock = false, schneeBedeckt = false, notstromAktiv = false, batteriepreisAktiv = false;                                                                 

let timerIds = [], timerTarget = [], timerObjektID = [],timerState =[], batterieLadedaten = [],datenHeute =[], datenMorgen = [], datenTibberLink48h = [];

//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************
// Alle nötigen Objekt ID's anlegen 
async function createState(){
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`, {'def':'', 'name':'Anzeige in VIS durchschnittlicher Eigenverbrauch' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.besteLadezeit`, {'def':'', 'name':'Anzeige in VIS bester Zeitraum um Batterie zu laden und Status' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`, {'def': 0, 'name':'Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen' ,'type':'number', 'unit':'h'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`, {'def':false, 'name':'Anzeige in VIS Status Timer um Batterie zu laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`, {'def': 0, 'name':'Anzeige in VIS aktueller Strompreis Batterie' ,'type':'number', 'unit':'€'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Spitzenstrompreis`, {'def': 0, 'name':'Anzeige in VIS Schwellwert Spitzenstrompreis' ,'type':'number', 'unit':'€'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`, {'def':false, 'name':'Schnittstelle zu Charge-Control laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`, {'def':false, 'name':'Schnittstelle zu E3DC_Wallbox Script Auto laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`, {'def':false, 'name':'Schnittstelle zu Charge-Control Entladesperre' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.BatterieLadedaten`, {'def':[], 'name':'Batterie Start SOC mit Strompreis' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxLadeleistung`, {'def':0, 'name':'max Ladeleistung mit der die Batterie geladen wird' ,'type':'number', 'unit':'W'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.hoherSchwellwertStrompreis`, {'def':0.24, 'name':'Strompreisgrenze für Hochpreisphase' ,'type':'number', 'unit':'€'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.niedrigerSchwellwertStrompreis`, {'def':0.2, 'name':'Strompreisgrenze für Niedrigpreisphase' ,'type':'number', 'unit':'€'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.pvSchneebedeckt`, {'def':false, 'name':'Kann in VIS manuell auf true gesetzt werden,wenn Schnee auf den PV Modulen liegt' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`, {'def':80, 'name':'max SOC in % der Batterie bis zu dem aus dem Netz geladen werden soll' ,'type':'number', 'unit':'%'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Systemwirkungsgrad`, {'def':88, 'name':'max Wirkungsgrad inkl. Batterie' ,'type':'number', 'unit':'%'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.BatteriepreisAktiv`, {'def':false, 'name':'Anwahl in VIS ob Batteriepreis berücksichtigt wird' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.tibberLinkId`, {'def':'', 'name':'Persönliche ID TibberLink Adapter' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.stromgestehungskosten`, {'def':0.1057, 'name':'alle Kosten, die innerhalb der vorgesehenen Laufzeit (20 Jahre) entstehen alle Kosten, die innerhalb der vorgesehenen Laufzeit (20 Jahre) entstehen addiert, dividiert durch den Ertrag an Solarstrom' ,'type':'number'});
}

// Wird nur beim Start vom Script aufgerufen
async function ScriptStart()
{
    LogProgrammablauf += '0,';
    // Erstelle die Objekt IDs
    await createState();    
    log('-==== alle Objekt ID\'s angelegt ====-');
    await pruefeAdapterEinstellungen()
    // User Anpassungen parallel abrufen
    const results = await Promise.all([
        getStateAsync(sID_BatteriepreisAktiv),
        getStateAsync(sID_BatterieLadedaten),
        getStateAsync(sID_Systemwirkungsgrad),
        getStateAsync(sID_Schneebedeckt),
        getStateAsync(sID_Batterie_SOC),
        getStateAsync(sID_maxSoC),
        getStateAsync(sID_maxLadeleistungUser_W),
        getStateAsync(sID_hoherSchwellwertStrompreis),
        getStateAsync(sID_niedrigerSchwellwertStrompreis),
        getStateAsync(sID_Stromgestehungskosten),
        getStateAsync(sID_SPECIFIED_Battery_Capacity_0),
        getStateAsync(sID_maxEntladetiefeBatterie),
        getStateAsync(sID_BAT0_Alterungszustand)
    ]).then(states => states.map(state => state.val));
    [
        batteriepreisAktiv, batterieLadedaten, systemwirkungsgrad, schneeBedeckt, 
        aktuelleBatterieSoC_Pro, maxBatterieSoC, maxLadeleistungUser_W, 
        hoherSchwellwert, niedrigerSchwellwert, stromgestehungskosten
    ] = results; 
    const batteryCapacity0 = results[10];
    const entladetiefe_Pro = results[11];
    const aSOC_Bat_Pro = results[12];
    
    if (existsState(sID_SPECIFIED_Battery_Capacity_1)){
        const batteryCapacity1 = (await getStateAsync(sID_SPECIFIED_Battery_Capacity_1)).val
        batterieKapazitaet_kWh = (batteryCapacity0 + batteryCapacity1) / 1000;
    }else{
        batterieKapazitaet_kWh = batteryCapacity0 / 1000;
    }
    
    let[datenHeute1, datenMorgen2] = await Promise.all([
        getStateAsync(sID_PricesTodayJSON),
        getStateAsync(sID_PricesTomorrowJSON)
    ]).then(states => states.map(state => JSON.parse(state.val)));
    
    datenHeute = datenHeute1
    datenMorgen = datenMorgen2
    datenTibberLink48h = [...datenHeute, ...datenMorgen];
    batterieLadedaten = JSON.parse(batterieLadedaten)
    batterieKapazitaet_kWh = batterieKapazitaet_kWh * (entladetiefe_Pro/100);
    batterieKapazitaet_kWh = round(((batterieKapazitaet_kWh/100)*aSOC_Bat_Pro),0);
    aktuellerPreisTibber = await getCurrentPrice()
    // Erstelle das Tibber Diagramm
    await createDiagramm();
    // Strompreis Batterie berechnen
    await berechneBattPrice();        
    // Tibber-Steuerung starten
    await tibberSteuerungHauskraftwerk()
    
} 

// Einstellungen e3dc-rscp Adapter prüfen
async function pruefeAdapterEinstellungen() {
    const e3dc_rscp_Adapter = getObject(`system.adapter.${instanzE3DC_RSCP}`);
    //log(`e3dc_rscp_Adapter = ${JSON.stringify(e3dc_rscp_Adapter)}`,'warn')
    const tag_BAT_SOC = e3dc_rscp_Adapter.native.polling_intervals.find(item => item.tag === "TAG_EMS_REQ_BAT_SOC")
    const tag_POWER_BAT = e3dc_rscp_Adapter.native.polling_intervals.find(item => item.tag === "TAG_EMS_REQ_POWER_BAT")
    const tag_POWER_GRID = e3dc_rscp_Adapter.native.polling_intervals.find(item => item.tag === "TAG_EMS_REQ_POWER_GRID")
    if(tag_BAT_SOC.interval != `S` || tag_POWER_BAT.interval != `S` || tag_POWER_GRID.interval != `S`){
        log(`Bitte die Einstellungen e3dc-rscp Adapter Abfrageintervalle bei den RSCP-TAG's "TAG_EMS_REQ_BAT_SOC" "TAG_EMS_REQ_POWER_BAT" "TAG_EMS_REQ_POWER_GRID" auf S = kurz einstellen`,'warn')
    }
    const pollingIntervalShort = e3dc_rscp_Adapter.native.polling_interval_short;    
    if(pollingIntervalShort > 5){
        log(`Bitte in den Einstellungen e3dc-rscp Adapter das Abfrageintervall S = kurz [sec] auf min. 5 sek.einstellen`,'warn')
    }
}

async function tibberSteuerungHauskraftwerk() {
    try {    
        LogProgrammablauf += '1,';
        const datejetzt = new Date();
        const [stunden, minuten] = (await getStateAsync(sID_Autonomiezeit)).val.split(' / ')[1].split(' ')[0].split(':').map(Number);
        const reichweite_h = round(stunden + (minuten /60),2)
        const endZeitBatterie = new Date(datejetzt.getTime() + reichweite_h * 3600000 + minuten * 60000);
        const pvLeistungAusreichend = await pruefePVLeistung(reichweite_h);
        const preisPhasen = await findePreisPhasen(datenTibberLink48h, hoherSchwellwert, niedrigerSchwellwert);
        let spitzenSchwellwert = 0
        aktuellerPreisTibber = await getCurrentPrice();
        //log(`preisPhasen.highPhases= ${JSON.stringify(preisPhasen.highPhases)}`,'warn')
        spitzenSchwellwert = round(hoherSchwellwert * (1 / (systemwirkungsgrad / 100)), 4);
        await setStateAsync(sID_Spitzenstrompreis, spitzenSchwellwert);
        const naechsteNiedrigphase = findeAktuelleOderNaechstePhase(preisPhasen.lowPhases);
        const naechsteHochphase = findeAktuelleOderNaechstePhase(preisPhasen.highPhases);
        //log(`naechsteHochphase= ${JSON.stringify(naechsteHochphase)}`,'warn')
        const battBisMaxSOC_h = await berechneLadezeitBatterie(null,aktuelleBatterieSoC_Pro)
        //let test = berechneLadeUndSperrzeiten(datenTibberLink48h, niedrigerSchwellwert, hoherSchwellwert, systemwirkungsgrad)
        //log(test,'warn')
        
        // Prüfen ob Freigabe zum laden vom E-Auto gesetzt werden kann
        await handleEAutoLaden(naechsteNiedrigphase,datejetzt);
        
        // Prüfe ob Entladesperre der Batterie gesetzt werden muss
        await pruefeBatterieEntladesperre(pvLeistungAusreichend,endZeitBatterie);
        
        // ist Prognose PV-Leistung ausreichend um Batterie zu laden oder maxBatterieSoC erreicht
        if (!pvLeistungAusreichend && aktuelleBatterieSoC_Pro < maxBatterieSoC) {
            LogProgrammablauf += '12,';
            // Prüfen ob gerade eine Spitzenpreisphase ist
            if(aktuellerPreisTibber > spitzenSchwellwert){
                LogProgrammablauf += '29,';    
                await DebugLog(preisPhasen,naechsteNiedrigphase,naechsteHochphase,spitzenSchwellwert,pvLeistungAusreichend);
                LogProgrammablauf = '';
                await setStateAsync(sID_besteLadezeit, `Spitzenpreisphase`);
                await setStateAsync(sID_BatterieLaden, false);
                return;
            }
            // Ist aktuell eine Hochpreisphase
            //log(`naechsteHochphase= ${JSON.stringify(naechsteHochphase)} endZeitBatterie = ${endZeitBatterie} datejetzt = ${JSON.stringify(datejetzt)}`,'warn')
            if(naechsteHochphase.Startzeit?.getTime() <= datejetzt.getTime() && naechsteHochphase.Endzeit?.getTime() > datejetzt.getTime()){
                LogProgrammablauf += '13,';
                // Reicht die Batterieladung um diese zu überbrücken
                if(naechsteHochphase.Endzeit?.getTime() > endZeitBatterie.getTime()){
                    LogProgrammablauf += '14,';
                    
                    const spitzenPhasen = await findePreisPhasen(datenTibberLink48h, spitzenSchwellwert, spitzenSchwellwert);
                    const naechsteSpitzenphase = findeAktuelleOderNaechstePhase(spitzenPhasen.highPhases);
                        
                    // Prüfen ob eine Spitzenpreisphase (> hoher Schwellwert + Ladeverluste) kommt wo es sich rechnet trotz Hochpreisphase zu laden
                    //log(`naechsteSpitzenphase = ${JSON.stringify(naechsteSpitzenphase)} `,'warn')
                    if (naechsteSpitzenphase.Startzeit) {
                        LogProgrammablauf += '15,';
                        // Prüfen wie lange diese dauert und wie lange die Batterie geladen werden muss um diese zu überbrücken
                        const dauerSpitzenphase_h = (naechsteSpitzenphase.Endzeit.getTime() - naechsteSpitzenphase.Startzeit.getTime()) / 3600000;
                        const ladedauerBatt = await berechneLadezeitBatterie(dauerSpitzenphase_h);
                        const differenzStunden = Math.max(0, Math.floor((naechsteSpitzenphase.Startzeit.getTime() - datejetzt.getTime()) / 3600000));
                        const dateStartLadezeit = new Date(await bestLoadTime(differenzStunden, ladedauerBatt));
                        const dateEndeLadezeit = new Date(dateStartLadezeit.getTime() + ladedauerBatt * 3600000);
                        // Wenn die berechnete Ladezeit zu lange ist dann ende Ladezeit auf Startzeit Spitzenphase setzen
                        if (dateEndeLadezeit.getTime() < naechsteSpitzenphase.Startzeit.getTime()) {
                            await setStateAtSpecificTime(dateEndeLadezeit, sID_BatterieEntladesperre, true);
                            await setStateAtSpecificTime(naechsteSpitzenphase.Startzeit, sID_BatterieEntladesperre, false);
                        }else{
                            LogProgrammablauf += '16,';
                            // Timer Ladefreigabe setzen für berechnete dauer
                            const formatTime = date => `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                            await setStateAsync(sID_besteLadezeit, `${formatTime(dateStartLadezeit)} Uhr bis ${formatTime(dateEndeLadezeit)} Uhr`);
                            await setStateAtSpecificTime(dateStartLadezeit, sID_BatterieLaden, true);
                            await setStateAtSpecificTime(dateEndeLadezeit, sID_BatterieLaden, false);
                        }
                        
                    }else{   
                        // aktuell in einer Hochpreisphase,keine Spitzenphase gefunden, Batterieladung reicht nicht aus zum überbrücken
                        await setStateAsync(sID_besteLadezeit, `Hochpreisphase`);
												  
                        // Entladesperre Batterie ausschalten
                        // await setStateAsync(sID_BatterieEntladesperre, false);
                    }
                }else{
                    // aktuell in einer Hochpreisphase, Batterieladung reicht um diese zu überbrücken
                    await setStateAsync(sID_besteLadezeit, `Hochpreisphase`);
											  
                    // Entladesperre Batterie ausschalten
                    // await setStateAsync(sID_BatterieEntladesperre, false);
                }
            }
            // Niedrigpreisphase innerhalb Reichweite Batterie
            if (naechsteNiedrigphase.Startzeit?.getTime() < endZeitBatterie.getTime()) {
                LogProgrammablauf += '19,';
                const formatTime = date => `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                await setStateAsync(sID_besteLadezeit, `${formatTime(naechsteNiedrigphase.Startzeit)} Uhr bis ${formatTime(naechsteNiedrigphase.Endzeit)} Uhr`);
                await setStateAtSpecificTime(naechsteNiedrigphase.Startzeit, sID_BatterieLaden, true);
                await setStateAtSpecificTime(naechsteNiedrigphase.Endzeit, sID_BatterieLaden, false);
            }else{
                // Preis zwischen hoch und niedrig Phase und keine PV-Leistung
                if (aktuellerPreisTibber < hoherSchwellwert && aktuellerPreisTibber > niedrigerSchwellwert) {
                    //log(`naechsteNiedrigphase = ${JSON.stringify(naechsteNiedrigphase)}`,'warn')
                    LogProgrammablauf += '20,';
                    // Welche Phase kommt als nächstes
                    if(naechsteNiedrigphase.Startzeit?.getTime() < naechsteHochphase.Startzeit?.getTime()){
                        LogProgrammablauf += '21,';
                        // Es kommt eine Niedrigpreisphase, nicht laden. 
                        await setStateAsync(sID_BatterieEntladesperre, true)    
                    }else{
                        LogProgrammablauf += '22,';
                        // Es kommt eine Hochpreisphase
                        // BatterieSOC prüfen ob Hochpreisphase Länger als Batteriereichweite ist
                        if(naechsteHochphase.Endzeit?.getTime() > endZeitBatterie.getTime()){
                            LogProgrammablauf += '23,';
                            const differenzStunden = (endZeitBatterie.getTime() - datejetzt.getTime()) / (1000 * 60 * 60);
                            const entladeZeit_h = (naechsteHochphase.Endzeit.getTime() - naechsteHochphase.Startzeit.getTime())/ (1000 * 60 * 60);
                            const progBattSoC = await prognoseBatterieSOC(entladeZeit_h)
                            // Ladezeit um die Hochpreisphase zu überbrücken
                            const ladeZeit_h = await berechneLadezeitBatterie(null,progBattSoC)
                            // Finde günstigste Startzeit zum Laden innerhalb Reichweite
                            const dateStartLadezeit = new Date(await bestLoadTime(differenzStunden,ladeZeit_h))
                            const dateEndeLadezeit = new Date(dateStartLadezeit.getTime() + ladeZeit_h * 3600000);
                            // Timer setzen
                            await setStateAtSpecificTime(dateStartLadezeit, sID_BatterieLaden, true);
                            await setStateAtSpecificTime(dateEndeLadezeit, sID_BatterieLaden, false);
                            // Entladesperre einschalten
                            await setStateAsync(sID_BatterieEntladesperre, true) 
                            await setStateAtSpecificTime(naechsteHochphase.Startzeit, sID_BatterieEntladesperre, false);
                        }
                    }
                }  
            }
        } else {
            let message = '';
            LogProgrammablauf += '24,';
            if (pvLeistungAusreichend) {
                message = 'Laden mit PV-Leistung';
                loescheAlleLadenTimer()
                await setStateAsync(sID_BatterieLaden, false);
                if (aktuelleBatterieSoC_Pro >= maxBatterieSoC) {
                    message += ' und max SOC erreicht';
                    maxBatterieSoC = (await getStateAsync(sID_maxSoC)).val - 2;
                }
            } else if (aktuelleBatterieSoC_Pro >= maxBatterieSoC) {
                message = 'max SOC erreicht';
                maxBatterieSoC = (await getStateAsync(sID_maxSoC)).val - 2;
                loescheAlleLadenTimer()
                await setStateAsync(sID_BatterieLaden, false);
           }
            
            await setStateAsync(sID_besteLadezeit, message);
            
        }
        await DebugLog(preisPhasen,naechsteNiedrigphase,naechsteHochphase,spitzenSchwellwert,pvLeistungAusreichend);
        LogProgrammablauf = '';
    } catch (error) {
        log(`Fehler in Funktion tibberSteuerungHauskraftwerk: ${error.message}`, 'error');
    }
}

// Funktionen Freigabe E-Auto laden
async function handleEAutoLaden(naechsteNiedrigphase,dateJetzt) {
    // Niedrigphase in den nächsten 5 Stunden prüfen
    const endZeit = new Date(dateJetzt.getTime() + 5 * 3600000)
    //log(`naechsteNiedrigphase = ${JSON.stringify(naechsteNiedrigphase)} dateJetzt = ${dateJetzt} endZeit = ${endZeit}`,'warn')
    
    if (naechsteNiedrigphase.Startzeit?.getTime() < endZeit.getTime()) {
        LogProgrammablauf += '7,';
        // Innerhalb 5 h kommt eine Niedrigphase mit dem Laden E-Auto warten.
        if(naechsteNiedrigphase.Startzeit.getTime() > dateJetzt.getTime()){await setStateAsync(sID_eAutoLaden, false);}
        await setStateAtSpecificTime(naechsteNiedrigphase.Startzeit, sID_eAutoLaden, true);
    }else{
        //log(`aktuellerPreisTibber = ${aktuellerPreisTibber} hoherSchwellwert = ${hoherSchwellwert}`,'warn')
        if (aktuellerPreisTibber !== null && aktuellerPreisTibber < hoherSchwellwert) {
            LogProgrammablauf += '8,';
            await setStateAsync(sID_eAutoLaden, true);
        } else {
            LogProgrammablauf += '9,';
            await setStateAsync(sID_eAutoLaden, false);
        }  
    }
}

// Funktionen Entladesperre prüfen
async function pruefeBatterieEntladesperre(pvLeistungAusreichend,endZeitBatterie) {
    let sperreBatt = false
    let preisBatterie;
    // Prüfen ob der Bruttopreis oder der Nettopreis verwendet werden soll (Auswahl in VIS)
    if(batteriepreisAktiv){preisBatterie = bruttoPreisBatterie }else{preisBatterie = strompreisBatterie}

    // Wenn Prognose PV-Leistung ausreicht um Batterie zu laden und die Batteriereichweite bis zum Sonnenaufgang reicht, dann auch bei niedrigem Tibber Preis entladen. 
    if (pvLeistungAusreichend) {
        // Holen der Sonnenaufgangs- und Sonnenuntergangszeiten
        const sunriseEnd_ms = getAstroDate("sunriseEnd").getTime();  // Ende des Sonnenaufgangs
        const sunset_ms = getAstroDate("sunset").getTime();          // Sonnenuntergang    
        const endZeit_ms = new Date(endZeitBatterie).getTime();
        // Prüfe, ob die Batteriezeit innerhalb der Sonnenzeiten liegt
        if (endZeit_ms >= sunriseEnd_ms && endZeit_ms <= sunset_ms) {
            sperreBatt = false; // Entladung ist möglich, weil die Batteriezeit in der Sonnenzeit liegt
        } 
    }else if(aktuellerPreisTibber < hoherSchwellwert && !pvLeistungAusreichend){
        sperreBatt = true;
    }else if(preisBatterie > aktuellerPreisTibber){
        //sperreBatt = true; // Test ohne Batteriepreis
    }
    if(sperreBatt){
        LogProgrammablauf += '10,';
        await setStateAsync(sID_BatterieEntladesperre, true)    
    }else{
        LogProgrammablauf += '11,';
        await setStateAsync(sID_BatterieEntladesperre, false)
    }    
}


// Funktion sucht entweder die aktuelle Phase oder die nächste Phase mit Start- und Endzeit.
function findeAktuelleOderNaechstePhase(arrayPhases) {
    // Aktuelle Zeit in lokaler Zeitzone oder UTC (je nach Bedarf)
    const jetzt = new Date();
    // Suche nach der aktuell aktiven Phase (Startzeit in der Vergangenheit, Endzeit in der Zukunft)
    const aktuellePhase = arrayPhases
        .find(phase => new Date(phase.start) <= jetzt && new Date(phase.end) > jetzt);
    
    if (aktuellePhase) {
        // Rückgabe der Phase mit Standard-Format für Weiterverarbeitung
        return {
            Startzeit: new Date(aktuellePhase.start),
            Endzeit: new Date(aktuellePhase.end),
            StartzeitLokal: new Date(aktuellePhase.start).toLocaleString(),  // toLocaleString() zur Anzeige
            EndzeitLokal: new Date(aktuellePhase.end).toLocaleString()       // toLocaleString() zur Anzeige
        };
    }

    // Falls keine aktive Phase gefunden wurde, suche die nächste Phase mit Start- und Endzeit in der Zukunft
    const naechstePhase = arrayPhases
        .filter(phase => new Date(phase.start) > jetzt)  // @ts-ignore Nur zukünftige Phasen
        .sort((a, b) => new Date(a.start) - new Date(b.start))[0];  // Sortiere nach Startzeit

    if (naechstePhase) {
        return {
            Startzeit: new Date(naechstePhase.start),
            Endzeit: new Date(naechstePhase.end),
            StartzeitLokal: new Date(naechstePhase.start).toLocaleString(),
            EndzeitLokal: new Date(naechstePhase.end).toLocaleString() 
        };
    }

    // Falls keine passende Phase gefunden wird, gib null zurück
    LogProgrammablauf += '6,';
    return {
        Startzeit: null,
        Endzeit: null,
        StartzeitLokal: null,
        EndzeitLokal: null
    };
}


async function pruefePVLeistung(reichweiteStunden) {
    LogProgrammablauf += '2,';
    reichweiteStunden = +reichweiteStunden || null;
    
    // Wenn die PV-Module schneebedeckt sind, abbrechen
    if (schneeBedeckt) return false;
    
    const heute = new Date();
    const morgen = new Date(new Date().setDate(heute.getDate() + 1));
    const aktuelleZeit_ms = Date.now();

    // Sonnenaufgang und Sonnenuntergang heute und morgen
    const sunriseHeute_ms = getAstroDate("sunrise", heute).getTime();
    const sunsetHeute_ms = getAstroDate("sunset", heute).getTime() - 2 * 3600000;  // 2 Stunden Puffer
    const sunriseMorgen_ms = getAstroDate("sunrise", morgen).getTime();

    // PV-Prognosen für heute und morgen in kWh
    let arrayPrognoseAuto_kWh = await getStateAsync(sID_PrognoseAuto_kWh).then(state => state.val);
    let heuteErwartetePVLeistung_kWh = arrayPrognoseAuto_kWh[heute.getDate()];
    let morgenErwartetePVLeistung_kWh = arrayPrognoseAuto_kWh[morgen.getDate()];

    // Benötigte Kapazität, um Batterie auf maximalen SOC zu laden
    const benoetigteKapazitaet_kWh = (100 - await prognoseBatterieSOC(reichweiteStunden)) / 100 * batterieKapazitaet_kWh;

    // 1. Berechne die verbleibende Zeit bis zum nächsten Sonnenaufgang
    let stundenBisSunrise;
    if (aktuelleZeit_ms < sunriseHeute_ms) {
        // Aktuelle Zeit ist vor dem Sonnenaufgang heute
        stundenBisSunrise = (sunriseHeute_ms - aktuelleZeit_ms) / (1000 * 60 * 60);  // Umrechnung von ms in Stunden
    } else if (aktuelleZeit_ms >= sunsetHeute_ms) {
        // Aktuelle Zeit ist nach dem Sonnenuntergang heute -> Nächster Sonnenaufgang ist morgen
        stundenBisSunrise = (sunriseMorgen_ms - aktuelleZeit_ms) / (1000 * 60 * 60);  // Zeit bis Sonnenaufgang morgen
    } else {
        // Aktuelle Zeit ist zwischen Sonnenaufgang und Sonnenuntergang heute
        const verbleibendeSonnenstunden = (sunsetHeute_ms - aktuelleZeit_ms) / (1000 * 60 * 60);
        const gesamteSonnenstunden = (sunsetHeute_ms - sunriseHeute_ms) / (1000 * 60 * 60);

        // Berechne die angepasste PV-Leistung für die verbleibenden Sonnenstunden
        const PVLeistungBisSonnenuntergang = (verbleibendeSonnenstunden / gesamteSonnenstunden) * heuteErwartetePVLeistung_kWh;

        // Prüfen, ob die verbleibende PV-Leistung ausreicht, um die Batterie zu laden
        if (PVLeistungBisSonnenuntergang >= benoetigteKapazitaet_kWh) {
            return reichweiteStunden >= verbleibendeSonnenstunden;  // Die Reichweite muss ausreichen bis zum Sonnenuntergang
        } else {
            return false;
        }
    }
    
    // 2. Prüfen, ob die aktuelle Reichweite bis zum Sonnenaufgang heute oder morgen ausreicht
    if (reichweiteStunden < stundenBisSunrise) {
        // Reichweite reicht nicht bis zum Sonnenaufgang -> Batterie hält nicht
        return false;
    }

    // 3. Prüfen, ob die PV-Prognose ausreicht, um die Batterie auf max. SOC zu laden
    if (aktuelleZeit_ms >= sunsetHeute_ms) {
        // Nach Sonnenuntergang -> Prüfe die PV-Leistung für morgen
        const prognoseBattSOCMorgen = await prognoseBatterieSOC(stundenBisSunrise);
        const benoetigteKapazitaetMorgen_kWh = (100 - prognoseBattSOCMorgen) / 100 * batterieKapazitaet_kWh;
        if (morgenErwartetePVLeistung_kWh >= benoetigteKapazitaetMorgen_kWh) {
            return true;  // Morgen reicht die PV-Prognose aus, um die Batterie zu laden
        }
    } else {
        // Vor Sonnenuntergang -> Prüfe die PV-Leistung für heute
        if (heuteErwartetePVLeistung_kWh >= benoetigteKapazitaet_kWh) {
            return true;  // Die heutige PV-Prognose reicht aus
        }
    }

    LogProgrammablauf += '3,';
    return false;  // Die Batterie kann nicht aufgeladen werden oder die Reichweite reicht nicht aus
}


// Funktion berechnet den Batterie SOC nach einer variablen Zeit in h bei einem berechnetem Durchschnittsverbrauch.
async function prognoseBatterieSOC(entladezeitStunden) {
    try {
        entladezeitStunden = +entladezeitStunden || null;
		let hausverbrauch_day_kWh
        let hausverbrauch_night_kWh
        // Leistungsdaten vom aktuellen Tag abrufen
        const hausverbrauch = JSON.parse((await getStateAsync(sID_arrayHausverbrauch)).val);
        
        // Aktuellen Wochentag und Zeitintervall (Tag/Nacht) bestimmen
        const now = new Date();
        const currentDay = now.toLocaleDateString('de-DE', { weekday: 'long' });
        
        hausverbrauch_day_kWh = hausverbrauch[currentDay]['day'] / 1000;
        hausverbrauch_night_kWh = hausverbrauch[currentDay]['night'] / 1000;
        
        const entladeneEnergie_kWh = round(((hausverbrauch_day_kWh + hausverbrauch_night_kWh)/2)*entladezeitStunden,2);
        await setStateAsync(sID_aktuellerEigenverbrauch,`${round(hausverbrauch_day_kWh*1000,0)} W / ${round(hausverbrauch_night_kWh*1000,0)} W`);
        // Neuen Batterie-SOC berechnen
        const neueSoC = aktuelleBatterieSoC_Pro - (entladeneEnergie_kWh / batterieKapazitaet_kWh) * 100;
        //log(`Batterie-SOC nach Reichweite: ${neueSoC.toFixed(2)}% aktuelleSoC =${aktuelleBatterieSoC_Pro}  entladeneEnergie_kWh = ${entladeneEnergie_kWh} batterieKapazitaet_kWh = ${batterieKapazitaet_kWh}  `,'warn');
        return neueSoC;
    } catch (error) {
        log(`Fehler in Funktion prognoseBatterieSOC: ${error.message}`, 'error');
    }
}

// Aufruf mit startSOC: Berechnet die Ladezeit basierend auf der aktuellen Batterieladung und dem maximalen Ladezustand.
// Aufruf mit dauer_h: Berechnet die Ladezeit auf Basis des Hausverbrauchs und der Ladeleistung.
async function berechneLadezeitBatterie(dauer_h = null, startSOC = null) {
    try {
        // Prüfen, ob beide Parameter gesetzt sind
        if (dauer_h !== null && startSOC !== null) {
            throw new Error("Es darf entweder 'dauer_h' oder 'startSOC' gesetzt sein, nicht beide gleichzeitig.");
        }
        // Leistungsdaten vom aktuellen Tag abrufen
        const hausverbrauch = JSON.parse((await getStateAsync(sID_arrayHausverbrauch)).val);
        const [maxLadeleistungE3DC_W] = await Promise.all([
            getStateAsync(sID_Bat_Charge_Limit)
        ]).then(states => states.map(state => state.val));

        // Aktuelle Ladeleistung ermitteln (minimale Ladeleistung zwischen User und E3DC)
        const maxLadeleistung = Math.min(maxLadeleistungUser_W, maxLadeleistungE3DC_W);
        const maxLadeleistung_kW = maxLadeleistung / 1000;
        
        // Aktuellen Wochentag und Zeitintervall (Tag/Nacht) bestimmen
        const now = new Date();
        const currentDay = now.toLocaleDateString('de-DE', { weekday: 'long' });

        // Hausverbrauch berechnen
        const hausverbrauch_day_kWh = hausverbrauch[currentDay]['day'] / 1000;
        const hausverbrauch_night_kWh = hausverbrauch[currentDay]['night'] / 1000;

        // Durchschnittlicher Verbrauch in kWh pro Stunde
        const durchschnittlicherVerbrauch_kWh = (hausverbrauch_day_kWh + hausverbrauch_night_kWh) / 2;

        let ladezeitInStunden = 0;

        // Berechnung auf Basis der Dauer in Stunden (dauer_h)
        if (dauer_h !== null ) {
            // Benötigte Energie in kWh für die gegebene Dauer
            const benoetigteEnergie_kWh = round(durchschnittlicherVerbrauch_kWh * dauer_h, 2);
            // Ladezeit basierend auf der Energie und Ladeleistung berechnen
            ladezeitInStunden = benoetigteEnergie_kWh / maxLadeleistung_kW;
        }

        // Berechnung auf Basis des Start-Ladezustands (startSOC)
        if (startSOC !== null) {
            const zuLadendeProzent = maxBatterieSoC - startSOC;
  
            if (zuLadendeProzent > 0) {
                // Berechnung der zu ladenden Kapazität in kWh
                const zuLadendeKapazitaet_kWh = (batterieKapazitaet_kWh * zuLadendeProzent) / 100;
                // Berechnung der Ladezeit in Stunden
                ladezeitInStunden = zuLadendeKapazitaet_kWh / maxLadeleistung_kW;
            }
        }

        // Ladezeit aufrunden und in den Status setzen (nur wenn SoC genutzt wird)
        if (startSOC !== null) {
            await setStateAsync(sID_ladezeitBatterie, Math.ceil(ladezeitInStunden));
        }
        return Math.ceil(ladezeitInStunden);

    } catch (error) {
        log(`Fehler in Funktion berechneLadezeit: ${error.message}`, 'error');
    }
}


// Setzt Timer Batterie Laden für Startzeit und Endzeit 
async function setStateAtSpecificTime(targetTime, stateID, state) {
    const currentTime = new Date(); // Aktuelle Zeit abrufen
    if (!Array.isArray(timerObjektID) || !Array.isArray(timerState)) {
        throw new Error("timerObjektID oder timerState ist kein gültiges Array");
    }
    // Prüfen ob timer bereits gesetzt wurde
    const z = timerTarget.findIndex(time => time.getTime() === targetTime.getTime());
    if(z > 0){
        if(timerObjektID[z] == stateID && timerState[z] == state){
            return;
        }
    }
    // Prüfen ob Objekt ID mit gleichem State bereits gesetz wurde, dann vorher löschen
    if (!Array.isArray(timerObjektID) || !Array.isArray(timerState)) {
        throw new Error("timerObjektID oder timerState ist kein gültiges Array");
    }
    const objektID = {
        [sID_BatterieEntladesperre]: 'Entladesperre',
        [sID_BatterieLaden]: 'Laden',
        [sID_eAutoLaden]: 'Auto'
    }[stateID] || '';   
    const matchingIndices = timerObjektID
        .map((id, index) => (id === objektID && timerState[index] === state ? index : -1))
        .filter(index => index !== -1);
    if (matchingIndices.length > 0) {
        for (const index of matchingIndices) {
            clearTimeout(timerIds[index]);
            timerObjektID.splice(index, 1);
            timerIds.splice(index, 1);
            timerTarget.splice(index, 1);
            timerState.splice(index, 1);

            // Bedingung prüfen und setStateAsync aufrufen
            if (objektID === 'Laden' && state === true) {
                await setStateAsync(sID_timerAktiv, false);
            }
        }
    }
    if (!(targetTime instanceof Date) || isNaN(targetTime.getTime())) {
        log(`Fehler in function setStateAtSpecificTime,targetTime ist kein date Objekt / targetTime = ${targetTime} `, 'warn')
        return;
    }
    // @ts-ignore Zeitdifferenz berechnen 
    let timeDiff = targetTime.getTime() - currentTime.getTime();
    // Wenn Startzeit in der vergangeheit, State sofort setzen
    if(timeDiff < 0){timeDiff = 1}
    // Timeout setzen, um den State nach der Zeitdifferenz zu ändern
    let id = setTimeout(() => {
        setStateAsync(stateID, state);
        (stateID === sID_BatterieLaden && state === false) && setStateAsync(sID_timerAktiv, false);
        log(`State ${stateID} wurde um ${targetTime.toLocaleTimeString()} auf ${state} gesetzt.`, 'warn');
    
    }, timeDiff);
    
    timerObjektID.push(objektID);
    timerIds.push(id);
    timerTarget.push(targetTime)
    timerState.push(state)
    LogProgrammablauf += '27,';
    if(objektID == 'Laden' && state == true){await setStateAsync(sID_timerAktiv, true);}
}

// Funktion sucht den günstigsten Preis über eine zusammenhängende dauer in Stunden "ladezeit_h"
// innerhalb einer Reichweite "reichweite_h" in Stunden
async function bestLoadTime(reichweite_h,ladezeit_h) {
    reichweite_h = +reichweite_h || null;
    ladezeit_h = +ladezeit_h || null;
	if(reichweite_h === null || ladezeit_h === null){
		log(`function bestLoadTime konnte keinen Eintrag innerhalb der Reichweite finden`,'error')
	}
    const now = new Date(); // Aktuelle Zeit
    // Prüft, ob die Variablen datenHeute und datenMorgen Arrays sind.
    if (!Array.isArray(datenHeute) || !Array.isArray(datenMorgen) ) {
        throw new Error("Invalid Array in function findeGuenstigsteLadezeitInnerhalbReichweite");
    }
    // Wenn die Ladezeit 0 ist soll die beste Zeit für 1 h laden gesucht werden
    if (ladezeit_h < 0) {ladezeit_h = 1;}
    
    // Wenn die Reichweite 0 ist,aktuelle Zeit zurückgeben
    if (reichweite_h <= 0 ) {
        await setStateAsync(sID_besteLadezeit, `Jetzt`);
        return now; // Rückgabe der aktuellen Zeit
    }
    // Variable zur Speicherung des günstigsten Preises und der entsprechenden Zeit
    billigsterBlockPreis = Infinity;
    billigsterEinzelpreisBlock = Infinity;
    let billigsteZeit = null;

    // Iteriere durch die Daten und finde den günstigsten zusammenhängenden Stundenblock innerhalb der Reichweite
    for (let i = 0; i < datenTibberLink48h.length - ladezeit_h + 1; i++) {
        const startEntry = datenTibberLink48h[i];
        const startTime = new Date(startEntry.startsAt);

        // @ts-ignore Berechne den Unterschied in Stunden zur aktuellen Zeit
        const timeDifference = Math.floor((startTime - now) / (1000 * 60 * 60));

        // Prüfe, ob der Startzeitpunkt innerhalb der Reichweite liegt
        if (timeDifference >= 0 && timeDifference < reichweite_h) {
            // Berechne die Gesamtkosten für den aktuellen Stundenblock
            let blockPreis = 0;
            for (let j = 0; j < ladezeit_h; j++) {
                const entry = datenTibberLink48h[i + j];
                if (entry.total < billigsterEinzelpreisBlock) {
                    billigsterEinzelpreisBlock = entry.total;
                }
                blockPreis += entry.total;
            }

            // Prüfe, ob dieser Block der günstigste ist
            if (blockPreis < billigsterBlockPreis) {
                billigsterBlockPreis = blockPreis;
                billigsteZeit = startTime;
            }
        }
    }
    
    // bei jedem Durchlauf die globalen Preis Variablen aktualisieren
    minStrompreis_48h = datenTibberLink48h.reduce((min, current) => current.total < min ? current.total : min, datenTibberLink48h[0].total);
    billigsterBlockPreis = billigsterBlockPreis / ladezeit_h
    
    if (aktuellerPreisTibber < billigsterBlockPreis && aktuellerPreisTibber < hoherSchwellwert) {
        LogProgrammablauf += '17,';
        // Speichere die aktuelle Zeit als Startzeit
        await setStateAsync(sID_besteLadezeit, `Jetzt`);
        return now; // Rückgabe der aktuellen Zeit
    }

    // Formatiere die günstigste Zeit in Stunden für VIS Anzeige
    if (billigsteZeit) {
        LogProgrammablauf += '18,';
        const tag = billigsteZeit.toLocaleDateString('de-DE', {day:'2-digit',month: '2-digit'});
        const stunden = billigsteZeit.getHours();
        const stundenBis = (stunden + ladezeit_h)%24;
        await setStateAsync(sID_besteLadezeit,`${tag} / ${stunden}:00 - ${stundenBis}:00 Uhr `)
        return billigsteZeit;
    } else {
        log(`function bestLoadTime konnte keinen Eintrag innerhalb der Reichweite finden`,'error')
    }
}


async function createDiagramm(){
    // JSON-Daten parsen
    const [reichweite_h, minuten] = (await getStateAsync(sID_Autonomiezeit)).val.split(' / ')[1].split(' ')[0].split(':').map(Number);
    // Listen für axisLabels und data initialisieren
    const axisLabels = [];
    const dataPoints = [];
    const barDataPoints = [];
    const barDataPoints2 = [];
    // Hole aktuelle Zeit
    const currentDateTime = new Date();
    const battDateTime = new Date(currentDateTime.getTime() + reichweite_h * 3600000 + minuten * 60000);
    const battcurrentDate = formatDate(battDateTime);
    const battcurrentHour = battDateTime.getHours();
    const currentDate = formatDate(currentDateTime);
    const currentHour = currentDateTime.getHours();

    const diagramJsonChart = {
        "axisLabels": [],
        "graphs": [
            {
            "data": [],
            "type": "line",
            "color": "gray",
            "line_pointSizeHover": 5,
            "line_pointSize": 2,
            "line_Tension": 0.2,
            "yAxis_show": false,
            "yAxis_gridLines_show": false,
            "yAxis_gridLines_ticks_length": 5,
            "yAxis_position": "left",
            "yAxis_appendix": "€",
            "yAxis_min": 0.0,
            "yAxis_max": 0.7,
            "yAxis_zeroLineWidth": 5,
            "yAxis_zeroLineColor": "white",
            "displayOrder": 0,
            "tooltip_AppendText": " €",
            "datalabel_color": "white",
            "datalabel_fontFamily": "RobotoCondensed-Light",
            "datalabel_rotation":70,
            "datalabel_fontSize": 12,
            "datalabel_maxDigits": 4,
           "datalabel_show": "true",
            "line_PointColor": ["#FFFFFF"],
            "line_PointColorBorder": ["#FFFFFF"],
            "line_PointColorHover": ["##FFFFFF"],
            "line_PointColorBorderHover": ["#FFFFFF"],
            "use_gradient_color": true,
            "gradient_color": [
                {"value": 0.1, "color": "#0FFA1366"},
                {"value": 0.25, "color": "#fff90580"},
                {"value": 0.2, "color": "#fff90580"},
                {"value": 0.3, "color": "#FF004066"}
            ],
            "use_line_gradient_fill_color": true,
            "line_gradient_fill_color": [
                {"value": 0.1, "color": "#0FFA1366"},
                {"value": 0.25, "color": "#fff90580"},
                {"value": 0.2, "color": "#fff90580"},
                {"value": 0.3, "color": "#FF004066"}
            ]
            }, {
			"data": [],
			"type": "bar",
			"color": "#140CF2",
			"yAxis_min": 0,
			"yAxis_max": 1,
			"datalabel_show": false
		    }, {
			"data": [],
			"type": "bar",
			"color": "#f01a1a",
			"yAxis_min": 0,
			"yAxis_max": 1,
			"datalabel_show": false,
		    "tooltip_title": "Reichweite Batterie"
            }
        ]
    };
    //const battcurrentDate = formatDate(battDateTime);
   // Daten extrahieren und formatieren
    const extractData = (data) => {
        data.forEach(entry => {
            const date = new Date(entry.startsAt);
            const timeLabel = `${formatDate(date)} - ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} Uhr`;
            axisLabels.push(timeLabel);
            dataPoints.push(entry.total);
            const entryDate = formatDate(date);
            const entryHour = date.getHours();
            barDataPoints.push(entryDate === currentDate && entryHour === currentHour ? 0.7 : 0);
            barDataPoints2.push(entryDate === battcurrentDate && entryHour === battcurrentHour ? 0.2 : 0);
        });
    };
    
    //log(`battcurrentDate = ${battcurrentDate}`,'warn')
    // Daten heute und morgen extrahieren
    extractData(datenHeute);
    extractData(datenMorgen);
   
    // JSON-Chart erstellen
    diagramJsonChart.axisLabels = axisLabels;
    diagramJsonChart.graphs[0].data = dataPoints;
    diagramJsonChart.graphs[1].data = barDataPoints;
    diagramJsonChart.graphs[2].data = barDataPoints2;
    
    // JSON-Chart speichern
    const outputJsonStr = JSON.stringify(diagramJsonChart, null, 4);
    await setStateAsync(sID_DiagramJosonChart,outputJsonStr)
}

// Funktion berechnet den Batteriepreis
async function berechneBattPrice() {
    batterieLadedaten = JSON.parse((await getStateAsync(sID_BatterieLadedaten)).val)
    // Wenn es gespeicherte Ladedaten gibt, berechne den Batterie Strompreis
    if (batterieLadedaten.length > 0 ) {
        LogProgrammablauf += '25,';
        //Durchschnittspreis berechnen
        const gesamt = batterieLadedaten.reduce((summe, eintrag) => summe + eintrag.price, 0);
        strompreisBatterie = round(gesamt / batterieLadedaten.length,4);
        bruttoPreisBatterie = strompreisBatterie != stromgestehungskosten ? round(strompreisBatterie * (1 / (systemwirkungsgrad / 100)),4) : stromgestehungskosten;
        await setStateAsync(sID_StrompreisBatterie, bruttoPreisBatterie);
    } else {
        // Wenn keine Daten gespeichert sind, dann null
        await setStateAsync(sID_StrompreisBatterie, null);
        strompreisBatterie = null
        bruttoPreisBatterie = null
    }
 }


// aktuellen Tibber Preis aus JSON auslesen
async function getCurrentPrice() {
    LogProgrammablauf += '5,';
    // Hole die aktuelle Uhrzeit und runde auf volle Stunden
    const currentTime = new Date();
    currentTime.setMinutes(0, 0, 0);  // Auf volle Stunde runden
    
    aktuellerPreisTibber = null;
    minStrompreis_48h = null;  // Setze den niedrigsten Preis zu Beginn auf null

    // Durch das Array datenHeute loopen
    for (let entry of datenHeute) {
        // Konvertiere startsAt in ein Date-Objekt
        let startsAt = new Date(entry.startsAt);
        
        // Setze den niedrigsten Preis, wenn noch keiner definiert ist oder der aktuelle Preis niedriger ist
        if (minStrompreis_48h === null || entry.total < minStrompreis_48h) {
            minStrompreis_48h = entry.total;
        }

        // Prüfe, ob die Startzeit mit der aktuellen Stunde übereinstimmt
        if (startsAt.getTime() === currentTime.getTime()) {
            aktuellerPreisTibber = entry.total;  // Aktuellen Preis speichern
        }
    }

    // Gib den aktuellen Preis zurück
    return aktuellerPreisTibber;
}


// Runden. Parameter float digit, int digits Anzahl der Stellen
function round(digit, digits) {
    digit = (Math.round(digit * Math.pow(10, digits)) / Math.pow(10, digits));
    return digit;
}

// Funktion zum Formatieren der Datumswerte
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monate sind 0-basiert
    return `${day}.${month}`;
}

// Hilfsfunktion zum Löschen aller Timer
async function clearAllTimeouts() {
    await Promise.all([
        setStateAsync(sID_timerAktiv,false),
        setStateAsync(sID_BatterieLaden,false)
    ]);
    billigsterEinzelpreisBlock = 0 
    log(`Timer gelöscht`,'warn')
    timerIds.forEach(id => clearTimeout(id));
    timerIds = [];
    timerTarget = [];
    timerObjektID = [];
    timerState = [];

}

async function DebugLog(preisPhasen,naechsteNiedrigphase,naechsteHochphase,spitzenSchwellwert,pvLeistungAusreichend)
{
    const [prognoseLadezeitBatterie,besteLadezeit,arrayPrognoseAuto_kWh,Batterie_SOC,reichweiteBatterie,BatterieLaden,Power_Bat_W,Power_Grid,eAutoLaden,bEntladenSperren] = await Promise.all([
        getStateAsync(sID_ladezeitBatterie),
        getStateAsync(sID_besteLadezeit),
        getStateAsync(sID_PrognoseAuto_kWh),
        getStateAsync(sID_Batterie_SOC),
        getStateAsync(sID_Autonomiezeit),
        getStateAsync(sID_BatterieLaden),
        getStateAsync(sID_Power_Bat_W),
        getStateAsync(sID_Power_Grid),
        getStateAsync(sID_eAutoLaden),
        getStateAsync(sID_BatterieEntladesperre)
    ]).then(states => states.map(state => state.val));
    const tagHeute = new Date().getDate();
    const tagMorgen = new Date(new Date().setDate(new Date().getDate() + 1)).getDate();
    let heuteErwartetePVLeistung_kWh = arrayPrognoseAuto_kWh[tagHeute];
    let morgenErwartetePVLeistung_kWh = arrayPrognoseAuto_kWh[tagMorgen];
    
    log(`*******************  Debug LOG Tibber Skript ${scriptVersion} *******************`)
    if (DebugAusgabeDetail){log(`timerIds = ${timerIds}`)}
    if (DebugAusgabeDetail){log(`timerTarget = ${JSON.stringify(timerTarget)}`)}
    if (DebugAusgabeDetail){log(`timerState = ${JSON.stringify(timerState)}`)}
    if (DebugAusgabeDetail){log(`timerObjektID = ${JSON.stringify(timerObjektID)}`)}
    if (DebugAusgabeDetail){log(`besteLadezeit = ${besteLadezeit}`)}
    if (DebugAusgabeDetail){log(`billigsterEinzelpreisBlock = ${billigsterEinzelpreisBlock}`)}
    if (DebugAusgabeDetail){log(`billigsterBlockPreis = ${billigsterBlockPreis}`)}
    if (DebugAusgabeDetail){log(`minStrompreis_48h = ${minStrompreis_48h}`)}
    if (DebugAusgabeDetail){log(`Schwellwert Preisspitze = ${spitzenSchwellwert}`)}
    if (DebugAusgabeDetail){log(`Schwellwert hoher Strompreis = ${hoherSchwellwert}`)}
    if (DebugAusgabeDetail){log(`Schwellwert niedriger Strompreis = ${niedrigerSchwellwert}`)}
    if (DebugAusgabeDetail){log(`schneeBedeckt = ${schneeBedeckt}`)}
    if (DebugAusgabeDetail){log(`Prognose PV-Leistung heute = ${heuteErwartetePVLeistung_kWh} kWh`)}
    if (DebugAusgabeDetail){log(`Prognose PV-Leistung morgen = ${morgenErwartetePVLeistung_kWh} kWh`)}
    if (DebugAusgabeDetail){log(`batterieKapazitaet_kWh = ${batterieKapazitaet_kWh}`)}
    if (DebugAusgabeDetail){log(`Batterie_SOC = ${Batterie_SOC}`)}
    if (DebugAusgabeDetail){log(`prognoseLadezeitBatterie = ${prognoseLadezeitBatterie}`)}
    if (DebugAusgabeDetail){log(`pvLeistungAusreichend = ${pvLeistungAusreichend}`)}
    if (DebugAusgabeDetail){log(`reichweiteBatterie = ${reichweiteBatterie}`)}
    if (DebugAusgabeDetail){log(`batteriepreisAktiv = ${batteriepreisAktiv}`)}
    if (DebugAusgabeDetail){log(`strompreisBatterie = ${strompreisBatterie}`)}
    if (DebugAusgabeDetail){log(`bruttoPreisBatterie = ${bruttoPreisBatterie}`)}
    if (DebugAusgabeDetail){log(`Aktueller Preis Tibber = ${aktuellerPreisTibber}`)}
    if (DebugAusgabeDetail){log(`BatterieEntladenSperren = ${bEntladenSperren}`)}
    if (DebugAusgabeDetail){log(`BatterieLaden = ${BatterieLaden}`)}
    if (DebugAusgabeDetail){log(`Power_Bat_W = ${Power_Bat_W}`)}
    if (DebugAusgabeDetail){log(`Power_Grid = ${Power_Grid}`)}
    if (DebugAusgabeDetail){log(`eAutoLaden = ${eAutoLaden}`)}
    if (DebugAusgabeDetail){log(`naechsteNiedrigphase = ${JSON.stringify(naechsteNiedrigphase)}`)}
    if (DebugAusgabeDetail){log(`naechsteHochphase = ${JSON.stringify(naechsteHochphase)}`)}
    if (DebugAusgabeDetail){log(`preisPhasen = ${JSON.stringify(preisPhasen)}`)}
    log(`ProgrammAblauf = ${LogProgrammablauf} `,'warn')
    
}


// Funktion sucht im array data Preise über und unter dem Schwellwert und gibt die Startzeit und Endzeit der einzelnen Phasen als array zurück
async function findePreisPhasen(data, highThreshold, lowThreshold) {
    let highPhases = [];
    let lowPhases = [];
    let currentPhase = null;
    highThreshold = +highThreshold || null;
	lowThreshold = +lowThreshold || null;
	if(highThreshold === null || lowThreshold === null){
		log(`function findePreisPhasen highThreshold oder lowThreshold sind keine gültige Zahl`,'error')
	}
	
    
    if (highThreshold < lowThreshold) {
        log(`Schwellwert hoher Strompreis ist niedriger als Schwellwert niedriger Strompreis, Schwellwert hoher Strompreis wurde angepasst`, 'warn');
        highThreshold = lowThreshold + 0.1;
    }

    // Funktion zum Hinzufügen einer Phase in die entsprechende Liste
    function addPhase(phaseList, phase) {
        if (phase) {
            // Die Endzeit ist eine Stunde nach dem letzten Startzeitpunkt der Phase
            let endTime = new Date(phase.end);
            endTime.setHours(endTime.getHours() + 1);  // Endzeit um eine Stunde erhöhen

            // Speichere die Start- und Endzeit als Date-Objekte für spätere Vergleiche, aber verwende toLocaleString() nur für die Ausgabe
            phaseList.push({
                start: phase.start,  // Behalte das Date-Objekt für die interne Logik
                end: endTime,  // Behalte das Date-Objekt
                averagePrice: phase.total / phase.hours,
                // Formatiere die Zeiten nur zur Ausgabe in der lokalen Zeitzone
                startLocale: phase.start.toLocaleString(),
                endLocale: endTime.toLocaleString()
            });
        }
    }

    // Durchlaufe die Daten und verarbeite die Preise
    for (let i = 0; i < data.length; i++) {
        let hourData = data[i];
        let price = hourData.total;
        let startTime = new Date(hourData.startsAt);  // Verwende weiterhin Date-Objekte
        
        // Wenn der Preis über dem High Threshold liegt (Hochpreisphase)
        if (price >= highThreshold) {
            if (currentPhase && currentPhase.type === 'high') {
                // Fortführung einer Hochpreisphase
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.hours++;
            } else {
                // Beende die aktuelle Phase und starte eine neue Hochpreisphase
                addPhase(currentPhase && currentPhase.type === 'low' ? lowPhases : highPhases, currentPhase);
                currentPhase = {
                    type: 'high',
                    start: startTime,
                    end: startTime,  // Setze die Endzeit auf den Startzeitpunkt
                    total: price,
                    hours: 1
                };
            }
        } 
        
        // Wenn der Preis unter dem Low Threshold liegt (Niedrigpreisphase)
        else if (price <= lowThreshold) {
            //if(currentPhase.type === 'start'){currentPhase.type = 'low'}
            if (currentPhase && currentPhase.type === 'low') {
                // Fortführung einer Niedrigpreisphase
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.hours++;
            } else {
                // Beende die aktuelle Phase und starte eine neue Niedrigpreisphase
                addPhase(currentPhase && currentPhase.type === 'high' ? lowPhases : highPhases, currentPhase);
                currentPhase = {
                    type: 'low',
                    start: startTime,
                    end: startTime,  // Setze die Endzeit auf den Startzeitpunkt
                    total: price,
                    hours: 1
                };
            }
        } 
        // Wenn der Preis zwischen lowThreshold und highThreshold liegt (Normaler Preis)
        else if (price > lowThreshold && price < highThreshold) {
            // Beende die aktuelle Phase, falls sie existiert
            addPhase(currentPhase && currentPhase.type === 'high' ? highPhases : lowPhases, currentPhase);
            currentPhase = null;  // Setze die aktuelle Phase auf null
        }
    }

    // Letzte Phase hinzufügen, falls vorhanden
    addPhase(currentPhase && currentPhase.type === 'high' ? highPhases : lowPhases, currentPhase);

    LogProgrammablauf += '4,';
    return { highPhases, lowPhases };
}


function loescheAlleLadenTimer() {
    // Finde alle Indizes, bei denen 'Laden' in timerObjektID steht und timerState true ist
    const ladenIndices = timerObjektID
        //.map((id, index) => (id === 'Laden' && timerState[index] === true ? index : -1))
        .map((id, index) => (id === 'Laden' ? index : -1))
        .filter(index => index !== -1);  

    // Iteriere über alle gefundenen "Laden"-Timer und lösche sie
    for (const index of ladenIndices) {
        clearTimeout(timerIds[index]);

        timerObjektID.splice(index, 1);
        timerIds.splice(index, 1);
        timerTarget.splice(index, 1);
        timerState.splice(index, 1);
    }

    setState(sID_timerAktiv, false);
    LogProgrammablauf += '28,';
}

function berechneLadeUndSperrzeiten(datenTibberLink48h, niedrigerSchwellwert, hoherSchwellwert, systemwirkungsgrad) {
    let tibberLadezeiten = [];
    let tibberSperrzeiten = [];
    let ladeblock = null;
    let sperrblock = null;
	niedrigerSchwellwert = +niedrigerSchwellwert || null;
	hoherSchwellwert = +hoherSchwellwert ||null;
	systemwirkungsgrad = +systemwirkungsgrad || null;

    // Hilfsfunktion um den nächsten Preis zu bekommen
    function holeNaechstenPreis(daten, index) {
        if (index + 1 < daten.length) {
            return daten[index + 1].total;
        }
        return null;
    }

    for (let index = 0; index < datenTibberLink48h.length; index++) {
        let preisDatensatz = datenTibberLink48h[index];
        let tibberPreis = preisDatensatz.total;
        let naechsterTibberPreis = holeNaechstenPreis(datenTibberLink48h, index);
        let ladeVerluste = parseFloat((tibberPreis * (1 / (systemwirkungsgrad / 100))).toFixed(4));

        // Die Zeit mit Luxon in ein DateTime-Objekt umwandeln
        let startZeit = DateTime.fromISO(preisDatensatz.startsAt);
        let endZeit = startZeit.plus({ hours: 1 }); // Endzeit ist immer 1 Stunde nach der Startzeit

        // Bedingung 1: Preis unter dem niedrigen Schwellwert -> Ladezeit
        if (tibberPreis < niedrigerSchwellwert) {
            if (!ladeblock) {
                // Starte einen neuen Ladeblock
                ladeblock = { "startZeit": startZeit.toISO() };
            }
            // Aktualisiere die Endzeit des laufenden Blocks
            ladeblock["endZeit"] = endZeit.toISO();

            // Falls gerade ein Sperrblock läuft, beende ihn
            if (sperrblock) {
                tibberSperrzeiten.push(sperrblock);
                sperrblock = null;
            }

        // Bedingung 2: Preis zwischen niedrigerSchwellwert und hoherSchwellwert -> Ladezeit
        } else if (tibberPreis >= niedrigerSchwellwert && tibberPreis <= hoherSchwellwert && (!naechsterTibberPreis || naechsterTibberPreis > hoherSchwellwert)) {
            if (!ladeblock) {
                ladeblock = { "startZeit": startZeit.toISO() };
            }
            ladeblock["endZeit"] = endZeit.toISO();

            if (sperrblock) {
                tibberSperrzeiten.push(sperrblock);
                sperrblock = null;
            }

        // Bedingung 3: Preis über hohem Schwellwert und nächste Preise sind höher -> Ladeverluste berücksichtigen
        } else if (tibberPreis > hoherSchwellwert && naechsterTibberPreis && naechsterTibberPreis > (hoherSchwellwert + ladeVerluste)) {
            if (!ladeblock) {
                ladeblock = { "startZeit": startZeit.toISO() };
            }
            ladeblock["endZeit"] = endZeit.toISO();

            if (sperrblock) {
                tibberSperrzeiten.push(sperrblock);
                sperrblock = null;
            }

        // Falls keine der Ladebedingungen erfüllt ist -> Sperrzeit
        } else {
            if (!sperrblock) {
                // Starte einen neuen Sperrblock
                sperrblock = { "startZeit": startZeit.toISO() };
            }
            sperrblock["endZeit"] = endZeit.toISO(); // Sperrzeit-Ende ist immer 1 Stunde nach Startzeit

            // Falls ein Ladeblock aktiv ist, beende ihn
            if (ladeblock) {
                tibberLadezeiten.push(ladeblock);
                ladeblock = null;
            }
        }
    }

    // Schließe die letzten aktiven Blöcke ab
    if (ladeblock) {
        tibberLadezeiten.push(ladeblock);
    }
    if (sperrblock) {
        tibberSperrzeiten.push(sperrblock);
    }

    // Gib die ermittelten Lade- und Sperrzeiten zurück
    return { tibberLadezeiten, tibberSperrzeiten };
}

//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************

// Wird aufgerufen wenn sich an den States Tibber.User_Anpassungen was ändert
const regexPatternTibber = new RegExp(`${PfadEbene1}.${PfadEbene2[3]}`);
on({id: regexPatternTibber, change: "ne"}, async function (obj){	
    if (bLock) return;
    bLock = true;
    setTimeout(() => bLock = false, 100);
    log(`-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-`,'warn')
    if (obj.id == sID_maxSoC ){maxBatterieSoC = obj.state.val}
    if (obj.id == sID_maxLadeleistungUser_W){maxLadeleistungUser_W = obj.state.val}
    if (obj.id == sID_hoherSchwellwertStrompreis){hoherSchwellwert = obj.state.val}
    if (obj.id == sID_niedrigerSchwellwertStrompreis){niedrigerSchwellwert = obj.state.val}
    if (obj.id == sID_Schneebedeckt){schneeBedeckt = obj.state.val}
    if (obj.id == sID_Systemwirkungsgrad){systemwirkungsgrad = obj.state.val}
    if (obj.id == sID_BatteriepreisAktiv){batteriepreisAktiv = obj.state.val}
    if (obj.id == sID_Stromgestehungskosten){stromgestehungskosten = obj.state.val}
    await tibberSteuerungHauskraftwerk(); 
    await createDiagramm();
});

// Triggern wenn neue JSON Preise von TibberLink geladen werden
on({id: arrayID_TibberPrices, change: "ne"}, async function (obj){
    [datenHeute, datenMorgen] = await Promise.all([
        getStateAsync(sID_PricesTodayJSON),
        getStateAsync(sID_PricesTomorrowJSON)
    ]).then(states => states.map(state => JSON.parse(state.val)));
    datenTibberLink48h = [...datenHeute, ...datenMorgen];
});

// Triggern wenn Notstromstatus e3dc-rscp sich ändert
on({id: sID_Notrom_Status, change: "ne"}, async function (obj){
    if(obj.state.val == 4 || obj.state.val == 1){notstromAktiv = true}
});

// Triggern wenn Netzleistung e3dc-rscp sich ändert
on({id: sID_Power_Grid, change: "ne"}, async function (obj){
    // Absicherung das Netzleistung nicht 22000W (32A * 3 ) übersteigt
    if(obj.state.val > 20000) {
        let differenz = obj.state.val - 22000;
        maxLadeleistungUser_W -= differenz;
        if (maxLadeleistungUser_W < 0) {maxLadeleistungUser_W = 0;}
        setStateAsync(sID_maxLadeleistungUser_W,maxLadeleistungUser_W)  
    }
});


on({id: sID_Batterie_SOC, change: "ne"}, async function (obj){	
    log(`Batterie SOC = ${obj.state.val}`,'warn')
    let [leistungBatterie,BatterieLaden,Power_Grid] = await Promise.all([
        getStateAsync(sID_Power_Bat_W),
        getStateAsync(sID_BatterieLaden),
        getStateAsync(sID_Power_Grid)
    ]).then(states => states.map(state => state.val));
    leistungBatterie = Math.abs(leistungBatterie);
    aktuelleBatterieSoC_Pro = obj.state.val
    
    // Alle Werte im Array löschen mit höherem SOC als aktueller SOC
    batterieLadedaten = batterieLadedaten.filter(data => data.soc <= aktuelleBatterieSoC_Pro);
    await setStateAsync(sID_BatterieLadedaten,JSON.stringify(batterieLadedaten));
    if(aktuelleBatterieSoC_Pro >= maxBatterieSoC){
        LogProgrammablauf += '26,';
        await setStateAsync(sID_BatterieLaden, false); 
        loescheAlleLadenTimer();
    }
    
    // Neue Werte schreiben wenn der SOC ansteigt
    if(Power_Grid >= leistungBatterie && BatterieLaden && leistungBatterie > 0){
       if(aktuelleBatterieSoC_Pro > batterieSOC_alt){
            batterieSOC_alt = aktuelleBatterieSoC_Pro
            batterieLadedaten.push({ soc: aktuelleBatterieSoC_Pro, price: aktuellerPreisTibber });
            await setStateAsync(sID_BatterieLadedaten,JSON.stringify(batterieLadedaten));
       }
    }else{
        if(aktuelleBatterieSoC_Pro > batterieSOC_alt){
            batterieSOC_alt = aktuelleBatterieSoC_Pro
            //preis_alt = stromgestehungskosten
            batterieLadedaten.push({ soc: aktuelleBatterieSoC_Pro, price: stromgestehungskosten });
            await setStateAsync(sID_BatterieLadedaten,JSON.stringify(batterieLadedaten));
       }

    }
});

// Tibber Steuerung alle 1 min. aufrufen.
let scheduleTibber = schedule("*/1 * * * *", async function() {
    if(!notstromAktiv){
        await berechneBattPrice();
        await tibberSteuerungHauskraftwerk(); 
        await createDiagramm();
    }else{
        log(`Es wurde auf Notstrom umgeschaltet Script Tibber wurde angehalten und muss neu gestartet werden`,'error')
        await setStateAsync(sID_BatterieLaden, false);
        await setStateAsync(sID_BatterieEntladesperre, false);                   
        await setStateAsync(sID_eAutoLaden, false);   
        clearSchedule(scheduleTibber);
    }
});


//Bei Scriptende alle Timer löschen
onStop(function () { 
    clearAllTimeouts()
    setState(sID_besteLadezeit, ``)
    log(`-==== Alle Timer beendet ====-`)
}, 100);

ScriptStart();