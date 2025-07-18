'use strict';
//------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++++
const instanz = '0_userdata.0';                                                                        	        // Instanz Script
const PfadEbene1 = 'TibberSkript';                                                                     	        // Pfad innerhalb der Instanz
const PfadEbene2 = ['Anzeige_VIS','OutputSignal','History','USER_ANPASSUNGEN']                		            // Pfad innerhalb PfadEbene1
const instanzE3DC_RSCP = 'e3dc-rscp.0'
const DebugAusgabeDetail = false;
const hystereseReichweite_h = 0.5;                                                                              // Hysterese-Schwelle von ±30 Minuten
const hystereseBatterie_pro = 2;                                                                                // Hysterese-Schwelle von ±2 %
const hystereseKapazitaet = 2;                                                                                  // Hysterese-Schwelle von ±2 kWh
//++++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++
//------------------------------------------------------------------------------------------------------


//******************************************************************************************************
//**************************************** Deklaration Variablen ***************************************
//******************************************************************************************************
const scriptVersion = 'Version 1.3.18'
log(`-==== Tibber Skript ${scriptVersion} ====-`);
// IDs Script Charge_Control
const sID_Autonomiezeit =`${instanz}.Charge_Control.Allgemein.AutonomiezeitDurchschnitt`;
const sID_arrayHausverbrauch =`${instanz}.Charge_Control.Allgemein.arrayHausverbrauchDurchschnitt`;
const sID_maxEntladetiefeBatterie =`${instanz}.Charge_Control.USER_ANPASSUNGEN.10_maxEntladetiefeBatterie`
const sID_PrognoseAuto_kWh =`${instanz}.Charge_Control.History.PrognoseAuto_kWh`

// IDs des Adapters e3dc-rscp
const sID_Batterie_SOC =`${instanzE3DC_RSCP}.EMS.BAT_SOC`;                                                      // aktueller Batterie_SOC
const sID_Bat_Charge_Limit =`${instanzE3DC_RSCP}.EMS.SYS_SPECS.maxBatChargePower`;                              // Batterie Ladelimit
const sID_SPECIFIED_Battery_Capacity_0 =`${instanzE3DC_RSCP}.BAT.BAT_0.SPECIFIED_CAPACITY`;                     // Installierte Batterie Kapazität Batteriekreis 0
const sID_SPECIFIED_Battery_Capacity_1 =`${instanzE3DC_RSCP}.BAT.BAT_1.SPECIFIED_CAPACITY`;                     // Installierte Batterie Kapazität Batteriekreis 1
const sID_BAT0_Alterungszustand =`${instanzE3DC_RSCP}.BAT.BAT_0.ASOC`;                                          // Batterie ASOC e3dc-rscp
const sID_Power_Bat_W = `${instanzE3DC_RSCP}.EMS.POWER_BAT`;                                                    // aktuelle Batterie_Leistung'
const sID_Power_Grid = `${instanzE3DC_RSCP}.EMS.POWER_GRID`                                                     // Leistung aus Netz
const sID_Notrom_Status =`${instanzE3DC_RSCP}.EMS.EMERGENCY_POWER_STATUS`;                                      // 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
    
// IDs des Script Tibber
const sID_aktuellerEigenverbrauch = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`;        // Anzeige in VIS durchschnittlicher Eigenverbrauch
const sID_status = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.status`;                                          // Anzeige in VIS Status
const sID_ladezeitBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`;                      // Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen
const sID_timerAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`;                                  // Anzeige in VIS Status Timer um Batterie zu laden
const sID_StrompreisBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`                   // Anzeige in VIS aktueller Strompreis Batterie
const sID_Spitzenstrompreis = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Spitzenstrompreis`                     // Anzeige in VIS aktueller Strompreis Batterie

const sID_BatterieLaden =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`;                             // Schnittstelle zu Charge-Control für die Ladefreigabe
const sID_eAutoLaden = `${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`;                                  // Schnittstelle zu Wallbox Script Auto laden
const sID_BatterieEntladesperre =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`;             // Schnittstelle zu Charge-Control für die Entladesperre

const sID_DiagramJosonChart =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`;                            // JSON für Diagramm Tibber Preise in VIS
const sID_BatterieLadedaten = `${instanz}.${PfadEbene1}.${PfadEbene2[2]}.BatterieLadedaten`                     // JSON zum berechnen vom Batterie Strompreis

const sID_maxSoC =`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`; 
const sID_maxLadeleistungUser_W =`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxLadeleistung`; 
const sID_hoherSchwellwertStrompreis = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.hoherSchwellwertStrompreis`;
const sID_niedrigerSchwellwertStrompreis = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.niedrigerSchwellwertStrompreis`;

const sID_Schneebedeckt = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.pvSchneebedeckt`;
const sID_autPreisanpassung = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.automPreisanpassung`;
const sID_Systemwirkungsgrad = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Systemwirkungsgrad`
const sID_BatteriepreisAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.BatteriepreisAktiv`                   // Auswahl in VIS ob aktueller Strompreis Batterie brücksichtigt werden soll
const sID_Stromgestehungskosten = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.stromgestehungskosten`
const sID_TibberLinkID = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.tibberLinkId`
const sID_ScriptAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.ScriptAktiv`

// IDs des Adapters TibberLink, Zuweisung in Funktion ScriptStart() wegen persönlicher ID
let tibberLinkId = getState(sID_TibberLinkID).val                                                               // TibberLink ID auslesen
const sID_PricesTodayJSON = `tibberlink.0.Homes.${tibberLinkId}.PricesToday.json`                               // Strompreise für aktuellen Tag
const sID_PricesTomorrowJSON = `tibberlink.0.Homes.${tibberLinkId}.PricesTomorrow.json`                         // Strompreise für nächsten Tag
const arrayID_TibberPrices =[sID_PricesTodayJSON,sID_PricesTomorrowJSON];    

let maxBatterieSoC = 0, aktuelleBatterieSoC_Pro,aktuelleBatterieSoC_alt = 0, ladeZeit_h, maxLadeleistungUser_W, stromgestehungskosten;
let benoetigteKapazitaetAktuell_kWh_alt = 0, benoetigteKapazitaetPrognose_kWh_alt = 0;
let batterieKapazitaet_kWh = 0, minStrompreis_48h = 0, nReichweite_alt = 0, LogProgrammablauf = "";
let batterieSOC_alt = null, aktuellerPreisTibber = null, effektivPreisTibber = null ;
let hoherSchwellwert = 0, niedrigerSchwellwert = 0, peakSchwellwert = 0, systemwirkungsgrad = 0;
let dateBesteReichweiteLadezeit_alt = new Date();
let strompreisBatterie, bruttoPreisBatterie;

let bNachladenPeak = false, bLock = false, bSchneeBedeckt = false, bAutPreisanpassung = false, bNotstromAktiv = false, bBatteriepreisAktiv = false, bStart = true;                                                                 
let bBattLaden = false, bAutoLaden = false, bBattSperre = false, bBattSperrePrio = false, bReichweiteSunrise = false, bScriptAktiv = true, statusText = ``;
let timerIds = [], timerTarget = [], timerObjektID = [],timerState =[], batterieLadedaten = [],datenHeute =[], datenMorgen = [], datenTibberLink48h = [];

//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************
// Alle nötigen Objekt ID's anlegen 
async function createState(){
    const createStatePromises = [
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`, { 'def': '', 'name': 'Anzeige in VIS durchschnittlicher Eigenverbrauch', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.status`, { 'def': '', 'name': 'Anzeige in VIS Status', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`, { 'def': 0, 'name': 'Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen', 'type': 'number', 'unit': 'h' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`, { 'def': false, 'name': 'Anzeige in VIS Status Timer um Batterie zu laden', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.diagrammAktiv`, { 'def': false, 'name': 'Anzeige in VIS Diagramm Ladezeiten', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`, { 'def': 0, 'name': 'Anzeige in VIS aktueller Strompreis Batterie', 'type': 'number', 'unit': '€' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Spitzenstrompreis`, { 'def': 0, 'name': 'Anzeige in VIS Schwellwert Spitzenstrompreis', 'type': 'number', 'unit': '€' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`, { 'def': false, 'name': 'Schnittstelle zu Charge-Control laden', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`, { 'def': false, 'name': 'Schnittstelle zu Wallbox Script Auto laden', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`, { 'def': false, 'name': 'Schnittstelle zu Charge-Control Entladesperre', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`, { 'def': '[]', 'name': 'JSON für materialdesign json chart', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.BatterieLadedaten`, { 'def': [], 'name': 'Batterie Start SOC mit Strompreis', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxLadeleistung`, { 'def': 0, 'name': 'max Ladeleistung mit der die Batterie geladen wird', 'type': 'number', 'unit': 'W' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.hoherSchwellwertStrompreis`, { 'def': 0.24, 'name': 'Strompreisgrenze für Hochpreisphase', 'type': 'number', 'unit': '€' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.niedrigerSchwellwertStrompreis`, { 'def': 0.2, 'name': 'Strompreisgrenze für Niedrigpreisphase', 'type': 'number', 'unit': '€' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.pvSchneebedeckt`, { 'def': false, 'name': 'Kann in VIS manuell auf true gesetzt werden,wenn Schnee auf den PV Modulen liegt', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.automPreisanpassung`, { 'def': false, 'name': 'Kann in VIS manuell auf true gesetzt werden,wenn die Preisgrenzen automatisch angepasst werden sollen', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`, { 'def': 80, 'name': 'max SOC in % der Batterie bis zu dem aus dem Netz geladen werden soll', 'type': 'number', 'unit': '%' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Systemwirkungsgrad`, { 'def': 88, 'name': 'max Wirkungsgrad inkl. Batterie', 'type': 'number', 'unit': '%' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.BatteriepreisAktiv`, { 'def': false, 'name': 'Anwahl in VIS ob Batteriepreis berücksichtigt wird', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.tibberLinkId`, { 'def': '', 'name': 'Persönliche ID TibberLink Adapter', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.stromgestehungskosten`, { 'def': 0.1057, 'name': 'alle Kosten, die innerhalb der vorgesehenen Laufzeit (20 Jahre) entstehen addiert, dividiert durch den Ertrag an Solarstrom', 'type': 'number' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.ScriptAktiv`, { 'def': true, 'name': 'Steuerung Tibber Script stoppen', 'type': 'boolean' }),
    ];
    await Promise.all(createStatePromises);
}

// Wird nur beim Start vom Script aufgerufen
async function ScriptStart()
{
    LogProgrammablauf += '0,';
    // Erstelle die Objekt IDs
    await createState();    
    log('-==== alle Objekt ID\'s angelegt ====-');
    await CheckState();
    // User Anpassungen parallel abrufen
    const results = await Promise.all([
        getStateAsync(sID_BatterieLadedaten),
        getStateAsync(sID_Batterie_SOC),
        getStateAsync(sID_SPECIFIED_Battery_Capacity_0),
        getStateAsync(sID_maxEntladetiefeBatterie),
        getStateAsync(sID_BAT0_Alterungszustand)
    ]).then(states => states.map(state => state.val));
    [
        batterieLadedaten, aktuelleBatterieSoC_Pro 
    ] = results; 
    const batteryCapacity0 = results[2];
    const entladetiefe_Pro = results[3];
    const aSOC_Bat_Pro = results[4];
    aktuelleBatterieSoC_alt = aktuelleBatterieSoC_Pro
    batterieSOC_alt = aktuelleBatterieSoC_Pro
    if (existsState(sID_SPECIFIED_Battery_Capacity_1)){
        const batteryCapacity1 = (await getStateAsync(sID_SPECIFIED_Battery_Capacity_1)).val
        batterieKapazitaet_kWh = (batteryCapacity0 + batteryCapacity1) / 1000;
    }else{
        batterieKapazitaet_kWh = batteryCapacity0 / 1000;
    }
    
    [datenHeute, datenMorgen] = await Promise.all([
            getParsedStateWithRetry(sID_PricesTodayJSON),
            getParsedStateWithRetry(sID_PricesTomorrowJSON)
    ]);    
    
    datenTibberLink48h = [...datenHeute, ...datenMorgen];
    
    batterieLadedaten = JSON.parse(batterieLadedaten)
    batterieKapazitaet_kWh = batterieKapazitaet_kWh * (entladetiefe_Pro/100);
    batterieKapazitaet_kWh = round(((batterieKapazitaet_kWh/100)*aSOC_Bat_Pro),0);
    aktuellerPreisTibber = await getCurrentPrice()
    effektivPreisTibber = parseFloat((aktuellerPreisTibber * (1 / (systemwirkungsgrad / 100))).toFixed(4));
    // Erstelle das Tibber Diagramm
    await createDiagramm();
    // Strompreis Batterie berechnen
    await berechneBattPrice();        
    // Schwellwert setzen
    if(bAutPreisanpassung){await autoPreisanpassung(minStrompreis_48h)}
    // Tibber-Steuerung starten
    await tibberSteuerungHauskraftwerk()
    bStart = false;
} 

// Alle User Eingaben prüfen ob Werte eingetragen wurden und Werte zuweisen
async function CheckState() {
    const idUSER_ANPASSUNGEN = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}`;
    const objekte = [
        { id: 'maxLadeleistung', varName: 'maxLadeleistungUser_W', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: 'hoherSchwellwertStrompreis', varName: 'hoherSchwellwert', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: 'niedrigerSchwellwertStrompreis', varName: 'niedrigerSchwellwert', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: 'pvSchneebedeckt', varName: 'bSchneeBedeckt', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' , min: false, max: true, errorMsg: 'pvSchneebedeckt kann nur true oder false sein' },
        { id: 'automPreisanpassung', varName: 'bAutPreisanpassung', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' , min: false, max: true, errorMsg: 'pvSchneebedeckt kann nur true oder false sein' },
        { id: 'maxSOC_Batterie', varName: 'maxBatterieSoC', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen', min: 0, max: 100, errorMsg: 'max Batterie SoC muss zwischen 0% und 100% sein' },
        { id: 'Systemwirkungsgrad', varName: 'systemwirkungsgrad', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen', min: 0, max: 100, errorMsg: 'Systemwirkungsgrad muss zwischen 0% und 100% sein' },
        { id: 'BatteriepreisAktiv', varName: 'bBatteriepreisAktiv', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen', min: false, max: true, errorMsg: 'BatteriepreisAktiv kann nur true oder false sein' },
        { id: 'stromgestehungskosten', varName: 'stromgestehungskosten', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen'},
        { id: 'ScriptAktiv', varName: 'bScriptAktiv', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' , min: false, max: true, errorMsg: 'ScriptAktiv kann nur true oder false sein'}
    ];

    for (const obj of objekte) {
        const value = (await getStateAsync(`${idUSER_ANPASSUNGEN}.${obj.id}`)).val;
        if (value === undefined || value === null) {
            log(`Die Objekt ID = ${idUSER_ANPASSUNGEN}.${obj.id} ${obj.beschreibung} `, 'error');
        } else {
            eval(`${obj.varName} = value`);
            if (obj.min !== undefined && (value < obj.min || value > obj.max)) {
                console.error(obj.errorMsg);
            }
        }
    }

    // Pfadangaben zu den Modulen Modbus und e3dc-rscp überprüfen
    const PruefeID = [
        sID_Batterie_SOC, sID_Bat_Charge_Limit,sID_Notrom_Status, sID_SPECIFIED_Battery_Capacity_0,
        sID_SPECIFIED_Battery_Capacity_1, sID_BAT0_Alterungszustand, sID_Power_Bat_W, sID_Power_Grid, sID_Notrom_Status
    ];

    for (const id of PruefeID) {
        if (!existsObject(id)) {
            log(`${id} existiert nicht, bitte prüfen`,'error');
        }
    }
}

// Ablaufsteuerung zum regeln der Batterieladung bei günstigen Tibber Preise
async function tibberSteuerungHauskraftwerk() {
    try {    
        if (!bScriptAktiv){return;}
        LogProgrammablauf += '1,';
        [bBattLaden,bAutoLaden,statusText,bBattSperre,peakSchwellwert] = await Promise.all([
            getStateAsync(sID_BatterieLaden),
            getStateAsync(sID_eAutoLaden),
            getStateAsync(sID_status),
            getStateAsync(sID_BatterieEntladesperre),
            getStateAsync(sID_Spitzenstrompreis)
        ]).then(states => states.map(state => state.val));
        
        const value = (await getStateAsync(sID_Autonomiezeit)).val;
        // überprüft, ob value einen / enthält, und wählt dann die entsprechende split-Methode.
        const [stunden, minuten] = value.includes('/')
            ? value.split(' / ')[1].split(' ')[0].split(':').map(Number)
            : value.split(' ')[0].split(':').map(Number);
        
        let reichweite_h = round(stunden + (minuten /60),2)
        const datejetzt = new Date();
        // Hysterese-Schwelle von ±30 Minuten dass kleine zeitliche Unterschiede nicht zu einem häufigen Wechsel führen
        if(Math.abs(reichweite_h-nReichweite_alt) >= hystereseReichweite_h){
            nReichweite_alt = reichweite_h    
        }else{
            reichweite_h = nReichweite_alt
        }
        const endZeitBatterie = new Date(datejetzt.getTime() + reichweite_h * 3600000);
        const pvLeistungAusreichend = await pruefePVLeistung(reichweite_h);
        const ergebnis = await findeergebnisphasen(datenTibberLink48h, hoherSchwellwert, niedrigerSchwellwert);
        const naechsteNiedrigphase = findeNaechstePhase(ergebnis.lowPhases);
        //log(`ergebnis.lowPhases = ${JSON.stringify(ergebnis.normalPhases)}`,'warn')
        //log(`naechsteNiedrigphase = ${JSON.stringify(naechsteNiedrigphase)}`,'warn')
        
        // Batterieschwankungen +-2% ignorieren
        const diffBatSOC = Math.abs(aktuelleBatterieSoC_Pro - aktuelleBatterieSoC_alt)
        if(diffBatSOC >= hystereseBatterie_pro || ladeZeit_h == undefined){
            ladeZeit_h = await berechneLadezeitBatterie(null,aktuelleBatterieSoC_Pro)
        }
        const aktivePhase = ergebnis.aktivePhase;
        if (!aktivePhase) {log('aktivePhase ist null oder undefined', 'warn');return;}
        let preisBatterie = 0;
        let spitzenSchwellwert = round(hoherSchwellwert * (1 / (systemwirkungsgrad / 100)), 4);
        
        // Tibber Preis aktualisieren
        aktuellerPreisTibber = await getCurrentPrice();
        if(bBatteriepreisAktiv){preisBatterie = bruttoPreisBatterie }else{preisBatterie = strompreisBatterie}
        
        // Funktion prüfe Freigabe laden vom E-Auto aufrufen
        await EAutoLaden(naechsteNiedrigphase);
        
        // Kann die Batterie mit PV-Leistung geladen werden wenn ja dann Funktion beenden
        if (pvLeistungAusreichend.state) {
            LogProgrammablauf += '2,';
            await loescheAlleTimer('Laden')
            await loescheAlleTimer('Entladesperre');
            bBattSperrePrio = false;
            bBattLaden ? await setStateAsync(sID_BatterieLaden,false): null;    
            bBattSperre ? await setStateAsync(sID_BatterieEntladesperre,false): null;    
            let message = `PV Prognose hoch,es wird bei Sonnenaufgang mit PV Leistung geladen (aktive Phase: ${aktivePhase.type})`;
            statusText != message ? await setStateAsync(sID_status,message): null;
            await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
            LogProgrammablauf = '';
            return;
        }

        // Entladen der Batterie sperren wenn Batteriepreis höher als Tibberpreis und sperre nicht über Timer gesetzt wurde
        if (!bBattSperrePrio) {
            if (preisBatterie > aktuellerPreisTibber) {
                if(!bBattSperre){await setStateAsync(sID_BatterieEntladesperre, true);}
            } else if (bBattSperre) {
                await setStateAsync(sID_BatterieEntladesperre, false);
            }
        }

        // Wenn max SOC erreicht wurde Funktion beenden -3% um pendeln zu verhindern
        if (aktuelleBatterieSoC_Pro >= maxBatterieSoC - 3) {
            LogProgrammablauf += '3,';
            let message = `max SOC erreicht. Laden beendet (aktive Phase: ${aktivePhase.type})`;
            statusText != message ? await setStateAsync(sID_status,message): null;
            await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
            LogProgrammablauf = '';
            return;
        }
       
        const naechsteNormalphase = findeNaechstePhase(ergebnis.normalPhases);
        const naechstePhase0 = ergebnis?.naechstePhasen[0] // @ts-ignore
        const dauerAktivePhase_h = aktivePhase ? round((new Date(aktivePhase.end) - new Date()) / (1000 * 60 * 60),2):null
        const aktivePhaseType = aktivePhase.type;    
        peakSchwellwert != spitzenSchwellwert ? await setStateAsync(sID_Spitzenstrompreis, spitzenSchwellwert):null;
        
        // Prüfe ob die aktive Phase === 'peak' ist, dann wird nicht geladen
        if (aktivePhaseType === 'peak'){
            LogProgrammablauf += '10,';
            // Laden stoppen
            // Preisunterschied innerhalb der Peakphase prüfen und wenn Differenz > 0,3€, Reichweite Batterie prüfen
            const ergebnisPreisvergleich = await preisUnterschiedPruefen(aktivePhase.end,0.3)
            if(ergebnisPreisvergleich.state){
                LogProgrammablauf += '10/1,';
                // Preissteigerung > 0.3 € in der aktuellen Peak Phase.Prüfen ob Batteriereichweite ausreicht
                const dauerEndePreissteigerung_h =  round(((ergebnisPreisvergleich.peakZeit.getTime() - new Date().getTime()) / (1000 * 60 * 60))+ ergebnisPreisvergleich.dauerInStunden,0)
                if(Math.floor(reichweite_h) < dauerEndePreissteigerung_h){
                    LogProgrammablauf += '10/2,';
                    // Batterie reicht nicht aus.
                    // Kann die Preissteigerung überbrückt werden wenn das entladen der Batterie bis zur Preissteigerung gesperrt wird
                    const dauerBisPreissteigerung_h = dauerEndePreissteigerung_h - ergebnisPreisvergleich.dauerInStunden
                    if(Math.floor(dauerBisPreissteigerung_h + reichweite_h) < dauerEndePreissteigerung_h && !bNachladenPeak){
                        LogProgrammablauf += '10/3,';
                        // Batteriesperre reicht nicht aus nachladen
                        bNachladenPeak = true // weiteres Nachladen in der Peakphase verhindern.
                        const vonTime = new Date()
                        const bisTime = new Date(ergebnisPreisvergleich.peakZeit)
                        // günstigste Startzeit zum Laden suchen
                        const dateBesteStartLade = bestLoadTime(vonTime,bisTime,ladeZeit_h)
                        await setStateAtSpecificTime(dateBesteStartLade.zeit, sID_BatterieLaden, true);
                        await setStateAtSpecificTime(bisTime, sID_BatterieLaden, false);
                        // Nach der Preissteigerung Merker zurücksetzen.
                        const dauerEndePreissteigerung_ms = dauerEndePreissteigerung_h * 1000 * 60 * 60;
                        setTimeout(() => {bNachladenPeak = false;}, dauerEndePreissteigerung_ms);
                        const startTime = dateBesteStartLade.zeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        const endeTime = bisTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        let message = `Nachladen während Peakphase von ${startTime} bis ${endeTime} (aktive Phase: ${aktivePhase.type})`
                        statusText != message ? await setStateAsync(sID_status,message): null;
                        await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                        LogProgrammablauf = '';
                        return;
                    }else if(!bNachladenPeak){
                        LogProgrammablauf += '10/4,';
                        // Batteriesperre reicht aus, sofort entladen sperren.
                        bNachladenPeak = true; // weiteres Nachladen in der Peakphase verhindern.
                        const vonTime = new Date()
                        const bisTime = new Date(ergebnisPreisvergleich.peakZeit)
                        await loescheAlleTimer('Entladesperre')
                        await setStateAtSpecificTime(vonTime, sID_BatterieEntladesperre, true);
                        await setStateAtSpecificTime(bisTime, sID_BatterieEntladesperre, false);
                        // Nach der Preissteigerung Merker zurücksetzen.
                        const dauerEndePreissteigerung_ms = dauerEndePreissteigerung_h * 1000 * 60 * 60;
                        setTimeout(() => {bNachladenPeak = false;}, dauerEndePreissteigerung_ms);
                        const startTime = vonTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        const endeTime = bisTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        let message = `Batteriesperre während Peakphase von ${startTime} bis ${endeTime} (aktive Phase: ${aktivePhase.type})`
                        statusText != message ? await setStateAsync(sID_status,message): null;
                        await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                        LogProgrammablauf = '';
                        return;
                    }
                }
            }
            if(!bNachladenPeak){
                await loescheAlleTimer('Laden');
                bBattLaden ? await setStateAsync(sID_BatterieLaden,false): null;
                let message = `Aktuell Strompreis zu hoch, es wird nicht geladen (aktive Phase: ${aktivePhase.type})`
                statusText != message ? await setStateAsync(sID_status,message): null;
            }
            await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
            LogProgrammablauf = '';
            return;
        }
        
        if (aktivePhaseType === 'high'){
            LogProgrammablauf += '11,';
            
            // ist innerhalb der Reichweite Batterie eine low Preisphase
            if (naechsteNiedrigphase.state){
                if(naechsteNiedrigphase.startzeit < endZeitBatterie){
                    // nicht laden
                    LogProgrammablauf += '11/1,';
                    // dauer bis zur nächsten lowphase
                    const vonTime = new Date(naechsteNiedrigphase.startzeit)
                    const bisTime = new Date(naechsteNiedrigphase.endzeit)
                    // günstigste Startzeit zum Laden suchen
                    const dateBesteStartLade = bestLoadTime(vonTime,bisTime,ladeZeit_h)
                    // Prüfen ob Startzeit low Preisphase bereits erreicht ist und wenn nein die Ladefreigabe entfernen
                    if(naechsteNiedrigphase.startzeit.getTime() > new Date().getTime()){
                        if(bBattLaden){
                            await loescheAlleTimer('Laden');
                            await setStateAsync(sID_BatterieLaden,false)
                        }
                    }
                    const hours = dateBesteStartLade.zeit.getHours().toString().padStart(2, '0');
                    const minutes = dateBesteStartLade.zeit.getMinutes().toString().padStart(2, '0');
                    let message = `warte auf Niedrigpreisphase. Start laden ${hours}:${minutes} Uhr (aktive Phase: ${aktivePhase.type})`
                    statusText != message ? await setStateAsync(sID_status,message): null;
                    await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                    LogProgrammablauf = '';
                    return;
                }
            }
            // ist innerhalb der Reichweite Batterie eine normal Preisphase
            if (naechsteNormalphase.state){
                if(naechsteNormalphase.startzeit < endZeitBatterie){
                    // nicht laden
                    LogProgrammablauf += '11/2,';
                    const vonTime = new Date(naechsteNormalphase.startzeit)
                    const bisTime = new Date(naechsteNormalphase.endzeit)
                    // günstigste Startzeit zum Laden suchen
                    const dateBesteStartLade = bestLoadTime(vonTime,bisTime,ladeZeit_h)
                    // Prüfen ob der Zeitraum größer ist als die benötigte Zeit 
                    const difference_ms = bisTime.getTime() - vonTime.getTime();
                    let diffZeit_h = Math.min(difference_ms / (1000 * 60 * 60), ladeZeit_h);
                    const dateBesteEndeLadezeit = new Date(dateBesteStartLade.zeit.getTime() + diffZeit_h * 60 * 60 * 1000);
                    const startTime = dateBesteStartLade.zeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                    const endeTime = dateBesteEndeLadezeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                    let message = `Nächste Lademöglichkeit von ${startTime} bis ${endeTime} (aktive Phase: ${aktivePhase.type})`
                    statusText != message ? await setStateAsync(sID_status,message): null;
                    await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                    LogProgrammablauf = '';
                    return;
                }
            }
            // ist die nächste Phase eine Normal Phase. Eventuell muss das noch geprüft werden.
            // ist die nächste Phase eine peak Phase
            if(naechstePhase0.type == 'peak'){
                LogProgrammablauf += '11/3,';
                // reicht die Batterie um diese zu überbrücken
                if(naechstePhase0.end.getTime() > endZeitBatterie.getTime()){
                    // Batterie reicht nicht aus 
                    const dauerPeakPhase_h = round((naechstePhase0.end.getTime() - naechstePhase0.start.getTime()) / (1000 * 60 * 60),2)
                    // Kann die Peak Phase überbrückt werden wenn das entladen der Batterie gesperrt wird
                    //log(`reichweite_h= ${reichweite_h}  - dauerPeakPhase_h= ${dauerPeakPhase_h}  < 0`,'warn')
                    if(reichweite_h - dauerPeakPhase_h >= 0){
                        //Reichweite Batt reicht zum Abfragezeitraum noch aus.
                        LogProgrammablauf += '11/4,';
                        // Berechnen wann das Entladen der Batterie gesperrt werden muss um über die Peakphase zu kommen
                        let zeitBisSperre_h = reichweite_h - (dauerPeakPhase_h +1)
                        const vonTime = new Date(new Date().setMinutes(0, 0, 0));
                        vonTime.setHours(vonTime.getHours() + zeitBisSperre_h);
                        
                        const bisTime = new Date(naechstePhase0.start)
                        await loescheAlleTimer('Entladesperre')
                        await setStateAtSpecificTime(vonTime, sID_BatterieEntladesperre, true);
                        await setStateAtSpecificTime(bisTime, sID_BatterieEntladesperre, false);
                        const startTime = vonTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        const endeTime = bisTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        let message = `Batterie sperre von ${startTime} bis ${endeTime} um Peakphase zu überbrücken (aktive Phase: ${aktivePhase.type})`
                        statusText != message ? await setStateAsync(sID_status,message): null;
                        await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                        LogProgrammablauf = '';
                        return;
                    }else if (!bBattSperrePrio && reichweite_h - dauerPeakPhase_h < 0) {
                        LogProgrammablauf += '11/5,';
                        // high Phase und als nächstes kommt eine peak Phase die nur mit Batt Sperre nicht überbrückt werden kann.
                        const aktuelleZeit_ms = Date.now();
                        const sunriseHeute_ms = getAstroDate("sunrise", datejetzt).getTime();                                   // Sonnenaufgang
                        const sunsetHeute_ms = getAstroDate("sunset", datejetzt).getTime() - 2 * 3600000;  // 2 Stunden Puffer  // Sonnenuntergang -2 h
                        // Nur aus Netz laden Laden wenn Preis höher 0,1€ als aktueller Preis ist und nur soviel um diese phase zu überbrücken
                        // und nur Nachts wenn keine PV-Leistung möglich ist oder Module Schneebedeckt sind.(Absicherung wenn PV-Prognose falsch ist)
                        if (aktuelleZeit_ms < sunriseHeute_ms || aktuelleZeit_ms >= sunsetHeute_ms || bSchneeBedeckt) {
                            const ergebnisPreisvergleich = await preisUnterschiedPruefen(naechstePhase0.end,0.1)
                            if(ergebnisPreisvergleich.state == true){
                                const ladezeitBatt_h = await berechneLadezeitBatterie(dauerPeakPhase_h,null)
                                const bisTime = new Date(ergebnisPreisvergleich.peakZeit)
                                const vonTime = new Date(aktivePhase.start)
                                const start = bestLoadTime(vonTime,bisTime,ladezeitBatt_h)
                                const endeZeit = new Date(start.zeit.getTime() + ladezeitBatt_h * 60 * 60 * 1000);
                                await setStateAtSpecificTime(new Date(start.zeit), sID_BatterieLaden, true);
                                await setStateAtSpecificTime(new Date(endeZeit), sID_BatterieLaden, false);
                                // Batterie sperren ab Leidezeitpunkt bis zum Start der Peak Phase
                                await setStateAtSpecificTime(new Date(start.zeit), sID_BatterieEntladesperre, true);
                                await setStateAtSpecificTime(new Date(naechstePhase0.start), sID_BatterieEntladesperre, false);
                                const startTime = start.zeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                                const endeTime = endeZeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                                let message = `Batterie laden von ${startTime} bis ${endeTime} um Peakphase zu überbrücken (aktive Phase: ${aktivePhase.type})`
                                statusText != message ? await setStateAsync(sID_status,message): null;
                                await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                                LogProgrammablauf = '';
                                return;
                            }
                        }  
                    }
                }else{
                    // Batterieladung reicht um die phase zu überbrücken
                    LogProgrammablauf += '11/6,';
                    await loescheAlleTimer('Laden');
                    let message = `Batterie SOC reicht um nächste Peak Phase zu überbrücken (aktive Phase: ${aktivePhase.type})`
                    statusText != message ? await setStateAsync(sID_status,message): null;
                    bBattLaden ? await setStateAsync(sID_BatterieLaden,false): null;
                    if(preisBatterie < aktuellerPreisTibber){
                        await loescheAlleTimer('Entladesperre')
                        bBattSperrePrio = false;
                        bBattSperre ? await setStateAsync(sID_BatterieEntladesperre,false):null;
                    }
                    await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                    LogProgrammablauf = '';
                    return;
                }
            }
        }
        
        if (aktivePhaseType === 'normal'){
            LogProgrammablauf += '12,';
            const vonTime = new Date(aktivePhase.start)
            const bisTime = new Date(aktivePhase.end)
            
            // ist innerhalb der Reichweite Batterie eine low Preisphase
            if (naechsteNiedrigphase.state){
                if(naechsteNiedrigphase.startzeit < endZeitBatterie){
                    // nicht laden
                    LogProgrammablauf += '12/1,';
                    // dauer bis zur nächsten lowphase
                    const vonTime = new Date(naechsteNiedrigphase.startzeit)
                    const bisTime = new Date(naechsteNiedrigphase.endzeit)
                    // günstigste Startzeit zum Laden suchen
                    const dateBesteStartLade = bestLoadTime(vonTime,bisTime,ladeZeit_h)
                    // Prüfen ob der Zeitraum größer ist als die benötigte Zeit 
                    const difference_ms = bisTime.getTime() - vonTime.getTime();
                    let diffZeit_h = Math.min(difference_ms / (1000 * 60 * 60), ladeZeit_h);
                    const dateBesteEndeLadezeit = new Date(dateBesteStartLade.zeit.getTime() + diffZeit_h * 60 * 60 * 1000);
                    // Prüfen ob Startzeit low Preisphase bereits erreicht ist und wenn nein die Ladefreigabe entfernen
                    if(naechsteNiedrigphase.startzeit.getTime() > new Date().getTime()){
                        if(bBattLaden){
                            LogProgrammablauf += '12/2,';
                            await loescheAlleTimer('Laden');
                            await setStateAsync(sID_BatterieLaden,false)
                        }
                    }
                    const startTime = dateBesteStartLade.zeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                    const endeTime = dateBesteEndeLadezeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                    let message = `warte auf Niedrigpreisphase von ${startTime} bis ${endeTime}  (aktive Phase: ${aktivePhase.type})`
                    statusText != message ? await setStateAsync(sID_status,message): null;
                    await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                    LogProgrammablauf = '';
                    return;
                }
            }
            
            
            // günstigste Startzeit suchen um auf max SOC zu laden
            const dateBestePhaseStartLade = bestLoadTime(vonTime,bisTime,ladeZeit_h)
            const dateBesteReichweiteLade = bestLoadTime(new Date(),endZeitBatterie,ladeZeit_h)
            const dateBesteEndeLadezeit = new Date(dateBestePhaseStartLade.zeit.getTime() + ladeZeit_h * 60 * 60 * 1000);
            // Differenz berechnen und nur wenn > 1 das Laden stoppen. Verhindert ein ständiges ein und ausschalten 
            const diffBesteLadezeit_h = Math.abs((dateBestePhaseStartLade.zeit.getTime()-dateBesteReichweiteLade.zeit.getTime())/ (1000 * 60 * 60))
            
            // Prüfen ob es einen günstigerern Ladezeitraum innerhalb der Batteriereichweite gibt
            if(dateBestePhaseStartLade.preis > dateBesteReichweiteLade.preis && diffBesteLadezeit_h > 1 && dateBesteReichweiteLade.zeit > new Date()){
                LogProgrammablauf += '12/4,';
                // Beste Ladezeit noch nicht erreicht Laden sperren
                if(bBattLaden){
                    await loescheAlleTimer('Laden');
                    await setStateAsync(sID_BatterieLaden,false);
                }
                const dateReichweiteEndeLadezeit = new Date(dateBesteReichweiteLade.zeit.getTime() + ladeZeit_h * 60 * 60 * 1000);
                await setStateAtSpecificTime(dateBesteReichweiteLade.zeit, sID_BatterieLaden, true);
                await setStateAtSpecificTime(dateReichweiteEndeLadezeit, sID_BatterieLaden, false);
                const startTime = dateBesteReichweiteLade.zeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                const endeTime = dateReichweiteEndeLadezeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                let message = `Laden von ${startTime} bis ${endeTime} (aktive Phase: ${aktivePhase.type})`    
                statusText != message ? await setStateAsync(sID_status,message): null;
                await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                LogProgrammablauf = '';
                return;
            
            // Prüfen ob der günstigste Ladezeitraum noch nicht abgelaufen ist und Batterie laden bereits aktiv ist
            }else if(dateBesteEndeLadezeit > new Date() && !bBattLaden){
                // günstigster Ladezeitraum noch nicht abgelaufen und Laden nicht aktiv  
                LogProgrammablauf += '12/5,';
                // setze Timer
                if(dateBestePhaseStartLade.zeit.getTime() < new Date().getTime() && dateBesteEndeLadezeit.getTime() > new Date().getTime() ){
                    // Start Zeit bereits abgelaufen und Ende Zeit noch nicht erreicht sofort laden.
                    LogProgrammablauf += '12/6,';
                    await setStateAsync(sID_BatterieLaden,true)
                    await setStateAtSpecificTime(dateBesteEndeLadezeit, sID_BatterieLaden, false);
                }else{
                    // Noch mal nachladen
                    await setStateAtSpecificTime(dateBestePhaseStartLade.zeit, sID_BatterieLaden, true);
                    await setStateAtSpecificTime(dateBesteEndeLadezeit, sID_BatterieLaden, false);
                }
                const startTime = dateBestePhaseStartLade.zeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                const endeTime = dateBesteEndeLadezeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                let message = `Laden von ${startTime} bis ${endeTime} (aktive Phase: ${aktivePhase.type})`    
                statusText != message ? await setStateAsync(sID_status,message): null;
                await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                LogProgrammablauf = '';
                return;
            }
            
            // Prüfen ob der günstigste Ladezeitraum bereits abgelaufen ist aber max SOC noch nicht erreicht wurde
            // Nur zulassen wenn der SOC um 10% unter max SOC ist, um ein/aus schalten zu verhindern.
            if(dateBesteEndeLadezeit < new Date() && (aktuelleBatterieSoC_Pro < (maxBatterieSoC - 10) || dateBesteReichweiteLade.zeit > new Date())){
                LogProgrammablauf += '12/7,';
                // Beste Ladezeit bereits abgelaufen, es muss aber noch nachgeladen werden
                if(dateBesteReichweiteLade.zeit > new Date()){
                    // günstigere Ladezeit innerhalb Batteriereichweite gefunden
                    LogProgrammablauf += '12/8,';
                    const dateBesteEndeLadezeit = new Date(dateBesteReichweiteLade.zeit.getTime() + ladeZeit_h * 60 * 60 * 1000);
                    await setStateAtSpecificTime(dateBesteReichweiteLade.zeit, sID_BatterieLaden, true);
                    await setStateAtSpecificTime(dateBesteEndeLadezeit, sID_BatterieLaden, false);
                    const startTime = dateBesteReichweiteLade.zeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                    const endeTime = dateBesteEndeLadezeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                    let message = `Beste Ladezeit abgelaufen. Nachladen von ${startTime} bis ${endeTime} (aktive Phase: ${aktivePhase.type})` 
                    statusText != message ? await setStateAsync(sID_status,message): null;
                    await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                    LogProgrammablauf = '';
                    return;
                }
                await loescheAlleTimer('Laden');
                // bis zum ende der Normal Phase Laden freigeben
                await setStateAsync(sID_BatterieLaden,true)
                await setStateAtSpecificTime(bisTime, sID_BatterieLaden, false);
                const endeTimePhase = bisTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                let message = `Beste Ladezeit abgelaufen. Nachladen bis max. ${endeTimePhase} (aktive Phase: ${aktivePhase.type})`
                statusText != message ? await setStateAsync(sID_status,message): null;
                await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                LogProgrammablauf = '';
                return;
            }
            
            LogProgrammablauf += '12/9,';
            await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
            LogProgrammablauf = '';
            return;
        }

        if (aktivePhaseType === 'low'){
            LogProgrammablauf += '13,';
            // Laden bis max SOC
            // günstigste Ladezeit suchen
            const bisTime = new Date(aktivePhase.end)
            const vonTime = new Date(aktivePhase.start)
            log(`Programmablauf 13 vonTime = ${vonTime} bisTime = ${bisTime} ladeZeit_h = ${ladeZeit_h}`)
            const dateBesteStartLade = bestLoadTime(vonTime,bisTime,ladeZeit_h)
            const dateEndeLadezeit = new Date(dateBesteStartLade.zeit);
            dateEndeLadezeit.setHours(dateEndeLadezeit.getHours() + ladeZeit_h);
            await setStateAtSpecificTime(new Date(dateBesteStartLade.zeit), sID_BatterieLaden, true);
            await setStateAtSpecificTime(new Date(dateEndeLadezeit), sID_BatterieLaden, false);
            await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
            LogProgrammablauf = '';
            return;
        }
        LogProgrammablauf += '14,';
        let message = `Nicht laden (aktive Phase: ${aktivePhase.type})`
        statusText != message ? await setStateAsync(sID_status,message): null;
        await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
        LogProgrammablauf = '';
        return;
    } catch (error) {
        log(`Fehler in Funktion tibberSteuerungHauskraftwerk: ${error.message}`, 'error');
    }
}

// Funktionen Freigabe E-Auto laden
async function EAutoLaden(naechsteNiedrigphase) {
    try {
        const datejetzt = new Date();
        const endZeit = new Date(datejetzt.getTime() + 5 * 3600000) //aktuelle Zeit plus 5h
    
        if (naechsteNiedrigphase.startzeit?.getTime() < endZeit.getTime()) {
            LogProgrammablauf += '20,';
            // Innerhalb 5 h kommt eine Niedrigphase mit dem Laden E-Auto warten.
            if(naechsteNiedrigphase.startzeit.getTime() > datejetzt.getTime()){await setStateAsync(sID_eAutoLaden, false);}
            await setStateAtSpecificTime(new Date(naechsteNiedrigphase.startzeit), sID_eAutoLaden, true);
        }else{
            //log(`aktuellerPreisTibber = ${aktuellerPreisTibber} hoherSchwellwert = ${hoherSchwellwert}`,'warn')
            if (aktuellerPreisTibber !== null && aktuellerPreisTibber < hoherSchwellwert) {
                LogProgrammablauf += '21,';
                await setStateAsync(sID_eAutoLaden, true);
            } else {
                LogProgrammablauf += '22,';
                await loescheAlleTimer('Auto')
                await setStateAsync(sID_eAutoLaden, false);
            }  
        }
    } catch (error) {
        log(`Fehler in Funktion EAutoLaden(): ${error.message}`, 'error');
    }
}

// Funktion sucht entweder die aktuelle Phase oder die nächste Phase mit Start- und Endzeit.
function findeNaechstePhase(arrayPhases) {
    try {
        const jetzt = new Date();
        // suche die nächste Phase mit Start- und Endzeit in der Zukunft
        const naechstePhase = arrayPhases
            .filter(phase => new Date(phase.start) > jetzt)  // @ts-ignore Nur zukünftige Phasen
            .sort((a, b) => new Date(a.start) - new Date(b.start))[0];  // Sortiere nach Startzeit

        if (naechstePhase) {
            return {
                state: true,
                startzeit: new Date(naechstePhase.start),
                endzeit: new Date(naechstePhase.end),
                startzeitLokal: new Date(naechstePhase.start).toLocaleString(),
                endzeitLokal: new Date(naechstePhase.end).toLocaleString() 
            };
        }

        // Falls keine passende Phase gefunden wird, gib null zurück
        LogProgrammablauf += '19,';
        return {
            state: false,
            startzeit: null,
            endzeit: null,
            startzeitLokal: null,
            endzeitLokal: null
        };
    } catch (error) {
        log(`Fehler in Funktion findeNaechstePhase(): ${error.message}`, 'error');
    }
}

// Die Funktion pruefePVLeistung prüft, ob die Batterie durch die erwartete PV-Leistung aufgeladen werden kann
// und ob die reichweiteStunden ausreicht, um bis zum nächsten Sonnenaufgang zu kommen.
async function pruefePVLeistung(reichweiteStunden) {
    try {   
        LogProgrammablauf += '18,';
        // Konvertiere und validiere die Reichweite in Stunden
        let nreichweiteStunden = parseFloat(reichweiteStunden);
        // Prüfung: Ist reichweiteStunden eine gültige Zahl?
        if (isNaN(nreichweiteStunden)) {
            log(`function pruefePVLeistung(): reichweiteStunden ist keine gültige Zahl`, 'error');
            return {state: false};
        }
        // auf die nächstkleinere Ganzzahl abrunden
        nreichweiteStunden = Math.floor(nreichweiteStunden)
        
        // Wenn die PV-Module schneebedeckt sind, abbrechen
        if (bSchneeBedeckt) {
            LogProgrammablauf += '18/1,';
            return {state: false};
        }

        const heute = new Date();
        const morgen = new Date(new Date().setDate(heute.getDate() + 1));
        const aktuelleZeit_ms = Date.now();

        // Sonnenaufgang und Sonnenuntergang heute und morgen
        const sonnenaufgangHeute_ms = getAstroDate("sunrise", heute).getTime();                     // Sonnenaufgang
        const sonnenuntergangHeute_ms = getAstroDate("sunset", heute).getTime() - 2 * 3600000;      // Sonnenuntergang - 2 Stunden Puffer
        const sonnenaufgangMorgen_ms = getAstroDate("sunrise", morgen).getTime();                   // Sonnenaufgang nächster Tag
        // PV-Prognosen für heute und morgen in kWh
        let arrayPrognoseAuto_kWh = JSON.parse((await getStateAsync(sID_PrognoseAuto_kWh)).val);
        let heuteErwartetePVLeistung_kWh = round(parseFloat(arrayPrognoseAuto_kWh[heute.getDate()]),0);
        let morgenErwartetePVLeistung_kWh = round(parseFloat(arrayPrognoseAuto_kWh[morgen.getDate()]),0);
        // Benötigte Kapazität, um die Batterie auf maximalen SOC zu laden
        const progBattSoC = await prognoseBatterieSOC(nreichweiteStunden);
        let benoetigteKapazitaetPrognose_kWh = round((100 - progBattSoC.soc) / 100 * batterieKapazitaet_kWh,0);
        let benoetigteKapazitaetAktuell_kWh = round((100 - aktuelleBatterieSoC_Pro) / 100 * batterieKapazitaet_kWh,0);
        // Hysterese-Schwelle von ±2 kWh dass kleine Unterschiede nicht zu einem häufigen Wechsel führen
        if(Math.abs(benoetigteKapazitaetPrognose_kWh-benoetigteKapazitaetPrognose_kWh_alt) >= hystereseKapazitaet){
            benoetigteKapazitaetPrognose_kWh_alt = benoetigteKapazitaetPrognose_kWh    
        }else{
            benoetigteKapazitaetPrognose_kWh = benoetigteKapazitaetPrognose_kWh_alt
        }
        if(Math.abs(benoetigteKapazitaetAktuell_kWh-benoetigteKapazitaetAktuell_kWh_alt) >= hystereseKapazitaet){
            benoetigteKapazitaetAktuell_kWh_alt = benoetigteKapazitaetAktuell_kWh    
        }else{
            benoetigteKapazitaetAktuell_kWh = benoetigteKapazitaetAktuell_kWh_alt
        }
        // Berechnung der Zeit bis zum nächsten Sonnenaufgang plus 3h
        let stundenBisSunrise = 0;
        if (aktuelleZeit_ms < sonnenaufgangHeute_ms) {
            // Vor Sonnenaufgang heute
            stundenBisSunrise = round((sonnenaufgangHeute_ms - aktuelleZeit_ms) / (1000 * 60 * 60)+3,0);
        } else if (aktuelleZeit_ms >= sonnenuntergangHeute_ms) {
            // Nach Sonnenuntergang -> Nächster Sonnenaufgang ist morgen
            stundenBisSunrise = round((sonnenaufgangMorgen_ms - aktuelleZeit_ms) / (1000 * 60 * 60)+3,0);
        } else {
            // Zwischen Sonnenaufgang und Sonnenuntergang heute
            const verbleibendeSonnenstunden = (sonnenuntergangHeute_ms - aktuelleZeit_ms) / (1000 * 60 * 60);
            const gesamteSonnenstunden = (sonnenuntergangHeute_ms - sonnenaufgangHeute_ms) / (1000 * 60 * 60);

            // Berechne die PV-Leistung bis zum Sonnenuntergang
            const PVLeistungBisSonnenuntergang = (heuteErwartetePVLeistung_kWh / gesamteSonnenstunden)* verbleibendeSonnenstunden; 
            // Prüfen, ob die PV-Leistung bis Sonnenuntergang ausreicht
            if (PVLeistungBisSonnenuntergang >= benoetigteKapazitaetAktuell_kWh) {
                //const state = nreichweiteStunden >= verbleibendeSonnenstunden;
                LogProgrammablauf += '18/2,';
                return {state: true};
            } else {
                LogProgrammablauf += '18/3,';
                return {state: false};
            }
        }
        
        // Prüfung, ob die Reichweite bis zum Sonnenaufgang ausreicht
        if (nreichweiteStunden < stundenBisSunrise && !bReichweiteSunrise) {
            LogProgrammablauf += '18/4,';
            return {state: false};
        }
        // Wenn die Reichweite bis Sonnenaufgang ausreicht, soll diese Entscheidung bis Sonnenaufgang nicht mehr korrigiert werden.
        bReichweiteSunrise = true
        // Prüfung der PV-Prognose für morgen
        if (aktuelleZeit_ms >= sonnenuntergangHeute_ms) {
            const prognoseBattSOCMorgen = await prognoseBatterieSOC(stundenBisSunrise);
            const benoetigteKapazitaetMorgen_kWh = (100 - prognoseBattSOCMorgen.soc) / 100 * batterieKapazitaet_kWh;
            if (morgenErwartetePVLeistung_kWh >= benoetigteKapazitaetMorgen_kWh) {
                LogProgrammablauf += '18/5,';
                return {state: true};
            }
        } else {
            // Prüfung der PV-Leistung für heute
            if (heuteErwartetePVLeistung_kWh >= benoetigteKapazitaetPrognose_kWh) {
                LogProgrammablauf += '18/6,';
                return {state: true};
            }
        }

        LogProgrammablauf += '18/7,';
        return {state: false};
    } catch (error) {
        log(`Fehler in Funktion pruefePVLeistung(): ${error.message}`, 'error');
    }
}

// Funktion berechnet den Batterie SOC nach einer variablen Zeit in h bei einem berechnetem Durchschnittsverbrauch.
async function prognoseBatterieSOC(entladezeitStunden) {
    try {
        entladezeitStunden = round(+entladezeitStunden,0) || 0;
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
        let neueSoC = Math.floor(aktuelleBatterieSoC_Pro - (entladeneEnergie_kWh / batterieKapazitaet_kWh) * 100);
        //log(`Batterie-SOC nach Reichweite: ${neueSoC}% aktuelleSoC =${aktuelleBatterieSoC_Pro}  entladeneEnergie_kWh = ${entladeneEnergie_kWh} batterieKapazitaet_kWh = ${batterieKapazitaet_kWh}  `,'warn');
        neueSoC = Math.max(neueSoC, 0);
        return {
            state:true,
            soc: neueSoC
        };
    
    } catch (error) {
        log(`Fehler in Funktion prognoseBatterieSOC: ${error.message}`, 'error');
    }
}

// Aufruf mit startSOC: Berechnet die Ladezeit basierend auf der aktuellen Batterieladung und dem maximalen Ladezustand.
// Aufruf mit dauer_h: Berechnet die Ladezeit auf Basis des Hausverbrauchs und der Ladeleistung nach ablauf von dauer_h.
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
        const maxLadeleistung_kW = (maxLadeleistung-200) / 1000; // 200W abziehen da E3DC nicht auf eingestellten Wert regelt sondern drunter bleibt
        
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
    try {
        LogProgrammablauf += '29,';
        const currentTime = new Date(); // Aktuelle Zeit abrufen
        const targetDate = new Date(targetTime);
        if (!Array.isArray(timerObjektID) || !Array.isArray(timerState)) {
            throw new Error("timerObjektID oder timerState ist kein gültiges Array");
        }
        // Prüfen ob timer bereits gesetzt wurde
        const z = timerTarget.findIndex(time => time.getTime() === targetDate.getTime());
        if(z > 0){
            if(timerObjektID[z] == stateID && timerState[z] == state){
                LogProgrammablauf += '29/1,';
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
        if (!(targetTime instanceof Date) || isNaN(targetDate.getTime())) {
            LogProgrammablauf += '29/2,';
            log(`Fehler in function setStateAtSpecificTime,targetTime ist kein date Objekt / targetTime = ${targetTime} `, 'warn')
            return;
        }
        // @ts-ignore Zeitdifferenz berechnen 
        let timeDiff = targetDate.getTime() - currentTime.getTime();
        // Wenn Startzeit in der vergangeheit, ignorieren ausser bei Batterie Entladesperre
        if(timeDiff > 0 || (timeDiff <= 0 && stateID === sID_BatterieEntladesperre && state === true) ){
            // Timeout setzen, um den State nach der Zeitdifferenz zu ändern
            LogProgrammablauf += '29/3,';
            let id = setTimeout(async () => {
                try {
                    const stateAkt =(await getStateAsync(stateID)).val
                    if (stateAkt != state){
                        await setStateAsync(stateID, state);
                        log(`State ${stateID} wurde durch Timer um ${targetTime.toLocaleTimeString()} auf ${state} gesetzt.`, 'warn');
                    }
                    if (stateID === sID_BatterieLaden && state === false) {
                        if (stateAkt != state){
                            await setStateAsync(sID_timerAktiv, false)
                            log(`State ${stateID} wurde durch Timer um ${targetTime.toLocaleTimeString()} auf ${state} gesetzt.`, 'warn');
                        };
                    }
                    if (stateID === sID_BatterieEntladesperre && state === false) {bBattSperrePrio = false;}
                    if (stateID === sID_BatterieEntladesperre && state === true) {bBattSperrePrio = true;}
                } catch (error) {
                    log(`Fehler im Timer function setStateAtSpecificTime: ${error.message}`, 'error');
                }
            }, timeDiff);
        
            timerObjektID.push(objektID);
            timerIds.push(id);
            timerTarget.push(targetTime)
            timerState.push(state)
            if(objektID == 'Laden'){await setStateAsync(sID_timerAktiv, true);}    
        }
    } catch (error) {
        log(`Fehler in Funktion setStateAtSpecificTime: ${error.message}`, 'error');
    }
}

// Die Funktion bestLoadTime dient dazu, innerhalb eines bestimmten Zeitraums den günstigsten Startzeitpunkt
// für eine Ladezeit (in Stunden) zu ermitteln, basierend auf den Preisdaten Tibber.
function bestLoadTime(dateStartTime, dateEndTime, nladezeit_h) {
    try {
        // Variablen für günstigsten Ladezeitblock initialisieren
        let billigsterBlockPreis = Infinity;
        let billigsterPreis = Infinity;
        let billigsteZeit = null;
        
        // Konvertiere Start- und Endzeit zu Datumsobjekten, falls notwendig
        dateStartTime = new Date(dateStartTime);
        dateEndTime = new Date(dateEndTime);
        
        // Überprüfe, ob Start- und Endzeiten gültig sind
        if (isNaN(dateStartTime) || isNaN(dateEndTime)) {
            log(`function bestLoadTime: Ungültiges Start- oder Enddatum`, 'error');
            return null;
        }

        // Validierung der globalen Variable datenTibberLink48h
        if (!Array.isArray(datenTibberLink48h) || datenTibberLink48h.length === 0) {
            log(`function bestLoadTime: datenTibberLink48h ist keine gültiges Array oder enthält keine Werte.`, 'error');
            return null;
        }

        // Konvertiere und validiere die Ladezeit
        if (isNaN(nladezeit_h)) {
            log(`function bestLoadTime: ladezeit_h ist keine gültige Zahl`, 'error');
            return null;
        }
        
        // Ladezeit begrenzen, wenn sie länger als der verfügbare Zeitraum ist
        const difference_ms = dateEndTime.getTime() - dateStartTime.getTime();
        nladezeit_h = Math.min(Math.floor(difference_ms / (1000 * 60 * 60)), nladezeit_h);
          
        // Ladezeit muss eine ganze Zahl sein und mindestens 1 
        nladezeit_h = Math.max(Math.ceil(nladezeit_h), 1);
        
        // Auf volle Stunden runden
        dateStartTime.setMinutes(0, 0, 0);        
        if (dateEndTime.getMinutes() > 0 || dateEndTime.getSeconds() > 0 || dateEndTime.getMilliseconds() > 0) {
            // Eine Stunde hinzufügen, wenn nicht schon exakt eine volle Stunde
            dateEndTime.setHours(dateEndTime.getHours() + 1);
        }
        dateEndTime.setMinutes(0, 0, 0);
        // Ermittlung der Zeitgrenzen
        const validStartTime_max = new Date(datenTibberLink48h[0].startsAt);
        const validStartTime_min = new Date(datenTibberLink48h[datenTibberLink48h.length - (1+nladezeit_h)].startsAt);
        const validEndTime = new Date(datenTibberLink48h[datenTibberLink48h.length - 1].startsAt);
        validEndTime.setHours(validEndTime.getHours() + 1);

        // Validierung von dateStartTime und dateEndTime
        if (dateStartTime < validStartTime_max) {
            log(`dateStartTime liegt vor dem gültigen Zeitraum. Anpassung auf ${validStartTime_max}`, 'warn');
            dateStartTime = validStartTime_max;
        }
        if (dateStartTime > validStartTime_min) {
            log(`dateStartTime liegt vor dem gültigen Zeitraum. Anpassung auf ${validStartTime_min}`, 'warn');
            dateStartTime = validStartTime_min;
        }
        if (dateEndTime > validEndTime) {
            log(`dateEndTime liegt nach dem gültigen Zeitraum. Anpassung auf ${validEndTime}`, 'warn');
            dateEndTime = validEndTime;
        }

        // Iteriere durch die Daten, um den günstigsten Ladezeitpunkt innerhalb des Zeitraums zu finden
        for (let i = 0; i < datenTibberLink48h.length - nladezeit_h; i++) {
            const startEntry = datenTibberLink48h[i];
            let startTime
            startTime = new Date(startEntry.startsAt);
                         
            // Prüfe, ob der Startzeitpunkt innerhalb des angegebenen Zeitrahmens liegt
            if (startTime.getTime() >= dateStartTime.getTime() && startTime.getTime() < dateEndTime.getTime()) {
                // Berechne die Gesamtkosten für den Stundenblock
                let blockPreis = 0;
                for (let j = 0; j < nladezeit_h; j++) {
                    const entry = datenTibberLink48h[i + j];
                    blockPreis += entry.total;
                }
                
                // Suche den günstigsten Stunden Preis
                if(datenTibberLink48h[i].total < billigsterPreis ){
                    billigsterPreis = datenTibberLink48h[i].total
                }
                
                // Prüfe, ob dieser Block der günstigste ist
                if (blockPreis < billigsterBlockPreis) {
                    billigsterBlockPreis = blockPreis;
                    billigsteZeit = startTime;
                }
            }
        }
        
        // Aktualisiere den durchschnittlichen Preis pro Stunde
        billigsterBlockPreis = billigsterBlockPreis / nladezeit_h;
        // Gibt die günstigste Zeit zurück, falls vorhanden
        if (billigsteZeit) {
            return{
                zeit: new Date(billigsteZeit),
                preis_d: round(billigsterBlockPreis,4), 
                preis: billigsterPreis
            }
        
        } else {
            log(`function bestLoadTime: Kein Eintrag gefunden dateStartTime = ${dateStartTime} dateEndTime = ${dateEndTime} datenTibberLink48h.length = ${datenTibberLink48h.length} billigsteZeit = ${billigsteZeit} nladezeit_h = ${nladezeit_h}`, 'error');
        }
    } catch (error) {
        log(`Fehler in Funktion bestLoadTime: ${error.message}`, 'error');
    }
}
        
async function createDiagramm(){
    // JSON-Daten parsen
    const value = (await getStateAsync(sID_Autonomiezeit)).val;
    // überprüft, ob value einen / enthält, und wählt dann die entsprechende split-Methode.
    const [stunden, minuten] = value.includes('/')
        ? value.split(' / ')[1].split(' ')[0].split(':').map(Number)
        : value.split(' ')[0].split(':').map(Number);
    
    let reichweite_h = round(stunden + (minuten /60),0)
    // Listen für axisLabels und data initialisieren
    const axisLabels = [];
    const dataPoints = [];
    const barDataPoints = [];
    const barDataPoints2 = [];
    // Hole aktuelle Zeit
    const currentDateTime = new Date();
    const battDateTime = new Date(currentDateTime.getTime() + (reichweite_h * 3600000));
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
            "yAxis_max": 1,
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
            barDataPoints.push(entryDate === currentDate && entryHour === currentHour ? 0.2 : 0);
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
        LogProgrammablauf += '27,';
        //Durchschnittspreis berechnen
        const ersteGewichtung = batterieLadedaten[0].soc; // Gewichtung des ersten Eintrags
        let gewichteteSumme = 0;
        let gesamtGewichtung = 0;
        // Gewichtete Summe und Gesamtgewichtung berechnen
        batterieLadedaten.forEach((data, index) => {
            const gewicht = index === 0 ? ersteGewichtung : 1; // Erste Gewichtung oder 1
            gewichteteSumme += data.price * gewicht;
            gesamtGewichtung += gewicht;
        });

        strompreisBatterie = round(gewichteteSumme / gesamtGewichtung, 4);
        bruttoPreisBatterie = round(strompreisBatterie * (1 / (systemwirkungsgrad / 100)),4);
        if(bBatteriepreisAktiv){
            await setStateAsync(sID_StrompreisBatterie, bruttoPreisBatterie);
        }else{
            await setStateAsync(sID_StrompreisBatterie, strompreisBatterie);
        }    
    } else {
        // Wenn keine Daten gespeichert sind, dann null
        await setStateAsync(sID_StrompreisBatterie, null);
        strompreisBatterie = null
        bruttoPreisBatterie = null
    }
 }

// aktuellen Tibber Preis aus JSON auslesen
async function getCurrentPrice() {
    try {    
        // Hole die aktuelle Uhrzeit und runde auf volle Stunden
        const roundedTime = new Date(new Date().setMinutes(0, 0, 0));
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
            if (startsAt.getTime() === roundedTime.getTime()) {
                aktuellerPreisTibber = entry.total;  // Aktuellen Preis speichern
            }
        }
        // Durch das Array datenMorgen loopen um den günstigsten Preis 48h zu finden
        if (Array.isArray(datenMorgen)) {
            for (let entry of datenMorgen) {
                // Setze den niedrigsten Preis, wenn noch keiner definiert ist oder der aktuelle Preis niedriger ist
                if (minStrompreis_48h === null || entry.total < minStrompreis_48h) {
                    minStrompreis_48h = entry.total;
                }
            }
        }
        // Gib den aktuellen Preis zurück
        return aktuellerPreisTibber;
    } catch (error) {
        log(`Fehler in Funktion getCurrentPrice(): ${error.message}`, 'error');
    }
}

// Runden. Parameter float digit, int digits Anzahl der Stellen
function round(digit, digits) {
    digit = (Math.round(digit * Math.pow(10, digits)) / Math.pow(10, digits));
    return digit;
}

// Funktion zum Formatieren der Datumswerte. Rückgabe im Format TT.MM mit führender Null 08.08
function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Monate sind 0-basiert
    return `${day}.${month}`;
}


async function DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend)
{
    const [prognoseLadezeitBatterie,statusText,Batterie_SOC,reichweiteBatterie,BatterieLaden,Power_Bat_W,Power_Grid,eAutoLaden,bEntladenSperren] = await Promise.all([
        getStateAsync(sID_ladezeitBatterie),
        getStateAsync(sID_status),
        getStateAsync(sID_Batterie_SOC),
        getStateAsync(sID_Autonomiezeit),
        getStateAsync(sID_BatterieLaden),
        getStateAsync(sID_Power_Bat_W),
        getStateAsync(sID_Power_Grid),
        getStateAsync(sID_eAutoLaden),
        getStateAsync(sID_BatterieEntladesperre)
    ]).then(states => states.map(state => state.val));
    const _arrayPrognoseAuto_kWh = JSON.parse((await getStateAsync(sID_PrognoseAuto_kWh))?.val || '[]');
    const tagHeute = new Date().getDate();
    const tagMorgen = new Date(new Date().setDate(new Date().getDate() + 1)).getDate();
    let heuteErwartetePVLeistung_kWh = round(_arrayPrognoseAuto_kWh[tagHeute],2);
    let morgenErwartetePVLeistung_kWh = round(_arrayPrognoseAuto_kWh[tagMorgen],2);
    
    if (DebugAusgabeDetail){log(`************************************************************************************`)}
    if (DebugAusgabeDetail){log(`** timerTarget = ${JSON.stringify(timerTarget)}`)}
    if (DebugAusgabeDetail){log(`** timerState = ${JSON.stringify(timerState)}`)}
    if (DebugAusgabeDetail){log(`** timerObjektID = ${JSON.stringify(timerObjektID)}`)}
    if (DebugAusgabeDetail){log(`** minStrompreis_48h = ${minStrompreis_48h}`)}
    if (DebugAusgabeDetail){log(`** batterieKapazitaet_kWh = ${batterieKapazitaet_kWh}`)}
    if (DebugAusgabeDetail){log(`** Batterie_SOC = ${Batterie_SOC}`)}
    if (DebugAusgabeDetail){log(`** Power_Bat_W = ${Power_Bat_W}`)}
    if (DebugAusgabeDetail){log(`** Power_Grid = ${Power_Grid}`)}
    if (DebugAusgabeDetail){log(`** prognoseLadezeitBatterie = ${prognoseLadezeitBatterie}`)}
    if (DebugAusgabeDetail){log(`** reichweiteBatterie = ${reichweiteBatterie}`)}
    if (DebugAusgabeDetail){log(`** Bruttostrompreis Batterie angewählt = ${bBatteriepreisAktiv}`)}
    if (DebugAusgabeDetail){log(`** Nettostrompreis Batterie = ${strompreisBatterie}`)}
    if (DebugAusgabeDetail){log(`** Bruttostrompreis Batterie = ${bruttoPreisBatterie}`)}
    if (DebugAusgabeDetail){log(`** Aktueller Preis Tibber = ${aktuellerPreisTibber}`)}
    if (DebugAusgabeDetail){log(`** Preis Tibber mit Ladeverluste = ${effektivPreisTibber}`)}
    if (DebugAusgabeDetail){log(`** naechstePhasen[1].endLocale = ${ergebnis.naechstePhasen[1]?.endLocale}`)}
    if (DebugAusgabeDetail){log(`** naechstePhasen[1].startLocale = ${ergebnis.naechstePhasen[1]?.startLocale}`)}
    if (DebugAusgabeDetail){log(`** naechstePhasen[1].Type = ${ergebnis.naechstePhasen[1]?.type}`)}
    if (DebugAusgabeDetail){log(`** naechstePhasen[0].endLocale = ${ergebnis.naechstePhasen[0]?.endLocale}`)}
    if (DebugAusgabeDetail){log(`** naechstePhasen[0].startLocale = ${ergebnis.naechstePhasen[0]?.startLocale}`)}
    if (DebugAusgabeDetail){log(`** naechstePhasen[0].Type = ${ergebnis.naechstePhasen[0]?.type}`)}
    if (DebugAusgabeDetail){log(`** aktivePhase.endLocale = ${ergebnis.aktivePhase?.endLocale}`)}
    if (DebugAusgabeDetail){log(`** aktivePhase.startLocale = ${ergebnis.aktivePhase?.startLocale}`)}
    if (DebugAusgabeDetail){log(`** aktivePhase.Type = ${ergebnis.aktivePhase?.type}`)}
    if (DebugAusgabeDetail){log(`** Schwellwert Spitzenstrompreis = ${spitzenSchwellwert}`)}
    if (DebugAusgabeDetail){log(`** Schwellwert hoher Strompreis = ${hoherSchwellwert}`)}
    if (DebugAusgabeDetail){log(`** Schwellwert niedriger Strompreis = ${niedrigerSchwellwert}`)}
    if (DebugAusgabeDetail){log(`** schneeBedeckt = ${bSchneeBedeckt}`)}
    if (DebugAusgabeDetail){log(`** Prognose PV-Leistung heute = ${heuteErwartetePVLeistung_kWh} kWh`)}
    if (DebugAusgabeDetail){log(`** Prognose PV-Leistung morgen = ${morgenErwartetePVLeistung_kWh} kWh`)}
    if (DebugAusgabeDetail){log(`** pvLeistungAusreichend = ${pvLeistungAusreichend}`)}
    if (DebugAusgabeDetail){log(`** bReichweiteSunrise = ${bReichweiteSunrise}`)}
    if (DebugAusgabeDetail){log(`** eAutoLaden = ${eAutoLaden}`)}
    if (DebugAusgabeDetail){log(`** BatterieEntladenSperren = ${bEntladenSperren}`)}
    if (DebugAusgabeDetail){log(`** BatterieLaden = ${BatterieLaden}`)}
    if (DebugAusgabeDetail){log(`** battSperrePrio = ${bBattSperrePrio}`)}
    if (DebugAusgabeDetail){log(`** Status = ${statusText}`)}
    if (DebugAusgabeDetail){log(`** ProgrammAblauf = ${LogProgrammablauf} `,'warn')}
    if (DebugAusgabeDetail){log(`*******************  Debug LOG Tibber Skript ${scriptVersion} *******************`)}
}


// Funktion sucht im array data Preise über und unter dem Schwellwert und gibt die Startzeit und Endzeit der einzelnen Phasen als array zurück
async function findeergebnisphasen(data, highThreshold, lowThreshold) {
    let peakPhases = [];
    let highPhases = [];
    let lowPhases = [];
    let normalPhases = [];
    let currentPhase = null;

    highThreshold = parseFloat(highThreshold);
    lowThreshold = parseFloat(lowThreshold);
    
    // Berechne den Spitzenschwellwert basierend auf dem hohen Schwellwert und dem Systemwirkungsgrad
    let spitzenschwellwert = parseFloat((highThreshold * (1 / (systemwirkungsgrad / 100))).toFixed(4));
    
    //log(`highThreshold = ${highThreshold} lowThreshold = ${lowThreshold} systemwirkungsgrad = ${systemwirkungsgrad} spitzenschwellwert= ${spitzenschwellwert}`,'warn')
    if (!Array.isArray(data) || data.length === 0) {
        console.error("Fehler: 'data' ist entweder kein Array oder es ist leer.");
        return; // Funktion beenden, wenn `data` leer oder kein Array ist
    }
    
    if (highThreshold === NaN || lowThreshold === NaN || spitzenschwellwert === NaN || systemwirkungsgrad === NaN) {
        log(`function findeergebnisphasen highThreshold oder lowThreshold sind keine gültige Zahl`, 'error');
        return;
    }

    if (highThreshold < lowThreshold) {
        log(`Schwellwert hoher Strompreis ist niedriger als Schwellwert niedriger Strompreis, Schwellwert hoher Strompreis wurde angepasst`, 'warn');
        highThreshold = lowThreshold + 0.1;
    }

    // Funktion zum Hinzufügen einer Phase in die entsprechende Liste
    function addPhase(phaseList, phase) {
        //log(`phaseList = ${phaseList}`,'warn')
        //log(`phase = ${JSON.stringify(phase)}`,'warn')
        if (phase) {
            // Endzeit um eine Stunde erhöhen
            let endTime = new Date(phase.end);
            endTime.setHours(endTime.getHours() + 1);

            // Füge die Phase zur Liste hinzu
            phaseList.push({
                type: phase.type,  // Speichere den Typ der Phase (spitze, hoch, normal, niedrig)
                start: phase.start,
                end: endTime,
                averagePrice: phase.total / phase.hours,
                startLocale: phase.start.toLocaleString(),
                endLocale: endTime.toLocaleString()
            });
        }
    }

    function getPhaseArray(currentPhase) {
        switch (currentPhase?.type) {
            case 'peak':
                return peakPhases;
            case 'high':
                return highPhases;
            case 'normal':
                return normalPhases;
            case 'low':
                return lowPhases;
            default:
                return null;
        }
    }

    // Durchlaufe die Daten und verarbeite die Preise
    for (let i = 0; i < data.length; i++) {
        let tibberData = data[i];
        let price = tibberData.total;
        let startTime = new Date(tibberData.startsAt);

        // Wenn der Preis über dem Spitzenschwellwert liegt (Spitzenpreisphase)
        if (price > spitzenschwellwert) {
            if (currentPhase && currentPhase.type === 'peak') {
                // Fortführung einer Spitzenpreisphase
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.hours++;
            } else {
                // Beende die aktuelle Phase und starte eine neue Spitzenpreisphase
                addPhase(getPhaseArray(currentPhase), currentPhase);
                              
                currentPhase = {
                    type: 'peak',
                    start: startTime,
                    end: startTime,
                    total: price,
                    hours: 1
                };
            }
        }

        // Wenn der Preis zwischen Hoch- und Spitzenschwellwert liegt (Hochpreisphase)
        else if (price > highThreshold && price <= spitzenschwellwert) {
            if (currentPhase && currentPhase.type === 'high') {
                // Fortführung einer Hochpreisphase
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.hours++;
            } else {
                // Beende die aktuelle Phase und starte eine neue Hochpreisphase
                addPhase(getPhaseArray(currentPhase), currentPhase);
                currentPhase = {
                    type: 'high',
                    start: startTime,
                    end: startTime,
                    total: price,
                    hours: 1
                };
            }
        }

        // Wenn der Preis kleiner oder gleich dem niedrigen Schwellwert liegt (Niedrigpreisphase)
        else if (price <= lowThreshold) {
            if (currentPhase && currentPhase.type === 'low') {
                // Fortführung einer Niedrigpreisphase
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.hours++;
            } else {
                // Beende die aktuelle Phase und starte eine neue Niedrigpreisphase
                addPhase(getPhaseArray(currentPhase), currentPhase);
                currentPhase = {
                    type: 'low',
                    start: startTime,
                    end: startTime,
                    total: price,
                    hours: 1
                };
            }
        }

        // Wenn der Preis zwischen niedrigem und hohem Schwellwert liegt (Normalpreisphase)
        else if (price > lowThreshold && price <= highThreshold) {
            if (currentPhase && currentPhase.type === 'normal') {
                // Fortführung einer Normalpreisphase
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.hours++;
            } else {
                // Beende die aktuelle Phase und starte eine neue Normalpreisphase
                addPhase(getPhaseArray(currentPhase), currentPhase);
                currentPhase = {
                    type: 'normal',
                    start: startTime,
                    end: startTime,
                    total: price,
                    hours: 1
                };
            }
        }
    }

    // Letzte Phase hinzufügen
    addPhase(getPhaseArray(currentPhase), currentPhase);
    
    // Alle Phasen zusammenführen
    let allePhasen = [...peakPhases, ...highPhases, ...normalPhases, ...lowPhases];

    // Sortiere Phasen nach Startzeit
    allePhasen.sort((a, b) => a.start - b.start);

    // Aktuelle Zeit
    let jetzt = new Date();

    // Finde die aktuelle Phase, in der die aktuelle Zeit liegt
    let aktivePhase = allePhasen.find(phase => phase.start <= jetzt && phase.end >= jetzt);
    
    // Gib auch die nächsten Phasen aus
    let naechstePhasen = allePhasen.filter(phase => phase.start > jetzt);

    return { peakPhases, highPhases, normalPhases, lowPhases, aktivePhase, naechstePhasen };
}

// Funktion prüft alle Daten im Array datenTibberLink48h, beginnend mit der aktuellen Uhrzeit bis zu der übergebenen Zeit,
// und ermittelt den günstigsten und teuersten Preis. Wenn der Preisunterschied größer als preisDiff € ist, gibt sie die Zeit zurück,
// ab der der Preis um preisDiff teurer ist.
async function preisUnterschiedPruefen(bisZeit,preisDiff) {
    try {    
        LogProgrammablauf += '15,';
        let aktuelleZeit = new Date();
        let bisZeitDate = new Date(bisZeit); 
        
        // Validierung von preisDiff
        preisDiff = parseFloat(preisDiff.toFixed(4))
        if (isNaN(preisDiff)) {
            log(`function preisUnterschiedPruefen: preisDiff ist keine gültige Zahl`, 'error');
            return {
                state:false,
                peakZeit: null,
                dauerInStunden: null
            }; 
        }

        // Validierung von dateStartTime und dateEndTime und Ermittlung der Zeitgrenzen
        const validStartTime = new Date(datenTibberLink48h[0].startsAt);
        const validEndTime = new Date(datenTibberLink48h[datenTibberLink48h.length - 1].startsAt);
        validEndTime.setHours(validEndTime.getHours() + 1);
        if (aktuelleZeit < validStartTime) {
            log(`dateStartTime liegt vor dem gültigen Zeitraum. Anpassung auf ${validStartTime}`, 'warn');
            aktuelleZeit = validStartTime;
        }
        if (bisZeitDate > validEndTime) {
            log(`dateEndTime liegt nach dem gültigen Zeitraum. Anpassung auf ${validEndTime}`, 'warn');
            bisZeitDate = validEndTime;
        }

        // Auf volle Stunden runden
        aktuelleZeit.setMinutes(0, 0, 0);
        if (bisZeitDate.getMinutes() > 0 || bisZeitDate.getSeconds() > 0 || bisZeitDate.getMilliseconds() > 0) {
            // Eine Stunde hinzufügen, wenn nicht schon exakt eine volle Stunde
            bisZeitDate.setHours(bisZeitDate.getHours() + 1);
        }
        bisZeitDate.setMinutes(0, 0, 0);
        
        // Filtere die Daten basierend auf der aktuellen Uhrzeit und der angegebenen Uhrzeit
        const gefilterteDaten = datenTibberLink48h.filter(d => {
            const startZeit = new Date(d.startsAt);
            return startZeit >= aktuelleZeit && startZeit <= bisZeitDate;
        });
        if (gefilterteDaten.length === 0) {
            LogProgrammablauf += '15/1,';
            return {// Startzeit und ende Zeit sind gleich
                state:false,
                peakZeit: null,
                dauerInStunden: null
            }; 
        }
        // Ermittle den günstigsten und teuersten Preis
        let guenstigsterPreis = Infinity, teuersterPreis = -Infinity;
        gefilterteDaten.forEach(d => {
            const preis = d.total;
            if (preis < guenstigsterPreis) {
                guenstigsterPreis = preis;
            }
            if (preis > teuersterPreis) {
                teuersterPreis = preis;
            }
        });
        
        // Wenn der teuerste Preis gleich dem aktuellen Preis ist dann wurde Peak bereits erreicht.Nicht mehr laden.
        if(aktuellerPreisTibber >= teuersterPreis){
            //Peak erreicht
            LogProgrammablauf += '15/2,';
            return {
                state:false,
                peakZeit: null,
                dauerInStunden: null
            };
        }
        
        // Preisunterschied prüfen
        const preisDifferenz = parseFloat((teuersterPreis - guenstigsterPreis).toFixed(4));
        //log(`preisDifferenz = ${preisDifferenz} teuersterPreis = ${teuersterPreis} guenstigsterPreis = ${guenstigsterPreis}`,'warn')
        if (preisDifferenz >= preisDiff) {
            LogProgrammablauf += '15/3,';
            // Finde den Zeitpunkt, ab dem der Preis um preisDiff € teurer ist
            const teuererPreisZeitpunkt = gefilterteDaten.find(d => d.total >= parseFloat((guenstigsterPreis + preisDiff).toFixed(4)));
            if (teuererPreisZeitpunkt) {
                LogProgrammablauf += '15/4,';
                // Berechne die Dauer, bis der Preis nicht mehr um preisDiff € teurer ist
                let endZeit = null;
                let teurerPreisWert = teuererPreisZeitpunkt.total;
                for (let i = gefilterteDaten.indexOf(teuererPreisZeitpunkt) + 1; i < gefilterteDaten.length; i++) {
                    if (gefilterteDaten[i].total <= parseFloat((teurerPreisWert - preisDiff).toFixed(4))) {
                        endZeit = gefilterteDaten[i].startsAt;
                        break;
                    }
                    if(gefilterteDaten.length == i+1 && endZeit == null){
                        // Preis bleibt bis 0:00 Uhr preisDiff über günstigsten Preis 
                        endZeit = gefilterteDaten[i].startsAt;
                    }
                }
                
                if (endZeit) {
                    const startZeitDate = new Date(teuererPreisZeitpunkt.startsAt);
                    const endZeitDate = new Date(endZeit);
                    // @ts-ignore Berechnung der Dauer in Stunden 
                    const stundenDauer = (endZeitDate - startZeitDate) / (1000 * 60 * 60); // Millisekunden in Stunden umwandeln
                    return {
                        state:true,
                        peakZeit: new Date(teuererPreisZeitpunkt.startsAt),
                        dauerInStunden: stundenDauer
                    };
                }
            }
        }
        
        LogProgrammablauf += '15/5,';
        return {
            state:false,
            peakZeit: null,
            dauerInStunden: null
        };
    } catch (error) {
        log(`Fehler in Funktion preisUnterschiedPruefen(): ${error.message}`, 'error');
    }

}

async function loescheAlleTimer(timerID) {
    if(timerID == 'all'){
        await Promise.all([
            setStateAsync(sID_timerAktiv,false),
            setStateAsync(sID_BatterieLaden,false),
            setStateAsync(sID_BatterieEntladesperre,false),
            setStateAsync(sID_eAutoLaden,false)
        ]);
        bBattSperrePrio = false;
        timerIds.forEach(id => clearTimeout(id));
        timerIds = [];
        timerTarget = [];
        timerObjektID = [];
        timerState = [];
        log(`Timer gelöscht`,'warn')
        return;
    }
    
    // Durchlaufe das Array in umgekehrter Reihenfolge und lösche die passenden Timer
    for (let index = timerObjektID.length - 1; index >= 0; index--) {
        if (timerObjektID[index] === timerID) {
            clearTimeout(timerIds[index]);

            // Entferne den Timer und seine zugehörigen Daten
            timerObjektID.splice(index, 1);
            timerIds.splice(index, 1);
            timerTarget.splice(index, 1);
            timerState.splice(index, 1);
        }
    }

    // Zustand je nach Timer-Typ aktualisieren und Log-Eintrag ergänzen
    switch (timerID) {
        case 'Laden':
            setState(sID_timerAktiv, false);
            LogProgrammablauf += '30,';
            break;
        case 'Entladesperre':
            LogProgrammablauf += '31,';
            break;
        case 'Auto':
            LogProgrammablauf += '32,';
            break;
    }
}

// Schwellwerte automatisch setzen
async function autoPreisanpassung(strompreis) {
    if (strompreis.toFixed(2) != strompreis.toFixed(4)) {
        hoherSchwellwert =toFloat((Math.ceil(strompreis * 100) / 100 +0.04).toFixed(2));
    } else {
        hoherSchwellwert =(strompreis + 0.05).toFixed(2);
    }
    //hoherSchwellwert = parseFloat((strompreis * (1 / (systemwirkungsgrad / 100))).toFixed(4));
    niedrigerSchwellwert = stromgestehungskosten
    
    bLock = true;
    await setStateAsync(sID_niedrigerSchwellwertStrompreis,stromgestehungskosten)
    await setStateAsync(sID_hoherSchwellwertStrompreis,hoherSchwellwert)
    bLock = false;
}

// Wiederholter Abruf mit Timeout bei leeren Daten
async function getParsedStateWithRetry(id, retries = 3, delayMs = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const state = await getStateAsync(id);
            const val = state?.val;
            // Prüfen: val darf nicht undefined, null, leerer String oder "undefined"/"null" als String sein
            if (typeof val === 'string' && val.trim() !== '' && val !== 'undefined' && val !== 'null') {
                try {
                    return JSON.parse(val);
                } catch (parseErr) {
                    log(`JSON-Fehler bei ${id} (Versuch ${attempt}): ${parseErr.message}`, 'warn');
                }
            } else {
                log(`Ungültiger oder leerer Wert bei ${id} (Versuch ${attempt}): ${val}`, 'warn');
            }
        } catch (err) {
            log(`Fehler beim Abrufen von ${id} (Versuch ${attempt}): ${err.message}`, 'error');
        }

        if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    throw new Error(`Konnte gültige JSON-Daten für ${id} nach ${retries} Versuchen nicht abrufen.`);
}

//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************

// Wird aufgerufen wenn sich an den States Tibber.User_Anpassungen was ändert
const regexPatternTibber = new RegExp(`${PfadEbene1}.${PfadEbene2[3]}`);
on({id: regexPatternTibber, change: "ne"}, async function (obj){	
    if (bLock) return;
    bLock = true;
    setTimeout(() => (bLock = false), 100);
    log(`-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-`,'warn')
    const idMapping = {
        [sID_maxSoC]: val => (maxBatterieSoC = val),
        [sID_maxLadeleistungUser_W]: val => (maxLadeleistungUser_W = val),
        [sID_hoherSchwellwertStrompreis]: val => (hoherSchwellwert = val),
        [sID_niedrigerSchwellwertStrompreis]: val => (niedrigerSchwellwert = val),
        [sID_Schneebedeckt]: val => (bSchneeBedeckt = val),
        [sID_autPreisanpassung]: val => (bAutPreisanpassung = val),
        [sID_Systemwirkungsgrad]: val => (systemwirkungsgrad = val),
        [sID_BatteriepreisAktiv]: val => (bBatteriepreisAktiv = val),
        [sID_Stromgestehungskosten]: val => (stromgestehungskosten = val),
        [sID_ScriptAktiv]: val => (bScriptAktiv = val),
    };
    // Setze die zugehörige Variable, falls die ID im Mapping existiert
    if (idMapping[obj.id]) idMapping[obj.id](obj.state.val);
    if (obj.id.split('.')[4] == 'automPreisanpassung' && obj.state.val == true){await autoPreisanpassung(minStrompreis_48h)}
    if (obj.id.split('.')[4] == 'BatteriepreisAktiv'){await berechneBattPrice();}
    
    await Promise.all([
        tibberSteuerungHauskraftwerk(),
        createDiagramm()
    ]);
});

// Triggern wenn neue JSON Preise von TibberLink geladen werden
on({id: arrayID_TibberPrices, change: "ne"}, async function (obj){
    [datenHeute, datenMorgen] = await Promise.all([
            getParsedStateWithRetry(sID_PricesTodayJSON),
            getParsedStateWithRetry(sID_PricesTomorrowJSON)
    ]);
    datenTibberLink48h = [...datenHeute, ...datenMorgen];
    // aktuellen Strompreis berechnen
    aktuellerPreisTibber = await getCurrentPrice()     
    effektivPreisTibber = parseFloat((aktuellerPreisTibber * (1 / (systemwirkungsgrad / 100))).toFixed(4));
    // Schwellwert setzen
    if(bAutPreisanpassung){await autoPreisanpassung(minStrompreis_48h)}
});

// Triggern wenn Notstromstatus e3dc-rscp sich ändert
on({id: sID_Notrom_Status, change: "ne"}, async function (obj){
    if(obj.state.val == 4 || obj.state.val == 1){bNotstromAktiv = true}
});

// Triggern wenn Batterie SoC e3dc-rscp sich ändert
on({id: sID_Batterie_SOC, change: "ne"}, async function (obj){	
    if(bStart){return};
    try {
                
        let [batterieLaden,power_Grid] = await Promise.all([
            getStateAsync(sID_BatterieLaden),
            getStateAsync(sID_Power_Grid)
        ]).then(states => states.map(state => state.val));
        
        aktuelleBatterieSoC_Pro = obj.state.val
        
        // Laden stoppen, wenn max. SOC erreicht oder überschritten ist
        if(aktuelleBatterieSoC_Pro >= maxBatterieSoC){
            LogProgrammablauf += '28,';
            batterieLaden ? await setStateAsync(sID_BatterieLaden,false): null; 
            await loescheAlleTimer('Laden');
        }
        // SOC gesunken: Gewichteten Durchschnittspreis ermitteln und Array neu setzen
        if (aktuelleBatterieSoC_Pro < batterieSOC_alt && batterieLadedaten.length > 1) {
            const allePreise = batterieLadedaten.map(data => data.price);
            const ersteGewichtung = batterieLadedaten[1].soc -1; // Gewichtung des ersten Eintrags
            const restGewichtungen = batterieLadedaten.slice(1).map(() => 1); // Gewichtung aller weiteren Einträge = 1

            let gewichteteSumme = 0;
            let gesamtGewichtung = 0;

            // Gewichtete Summe und Gesamtgewichtung berechnen
            batterieLadedaten.forEach((data, index) => {
                const gewicht = index === 0 ? ersteGewichtung : 1; // Erste Gewichtung oder 1
                gewichteteSumme += data.price * gewicht;
                gesamtGewichtung += gewicht;
            });

            const gewichteterDurchschnittspreis = round(gewichteteSumme / gesamtGewichtung, 4);
            
            // Array neu setzen mit dem gewichteten Durchschnittspreis
            batterieLadedaten = [{
                soc: aktuelleBatterieSoC_Pro,
                price: gewichteterDurchschnittspreis
            }];

            // Array speichern
            await setStateAsync(sID_BatterieLadedaten, JSON.stringify(batterieLadedaten));
        }

        // Neue Werte schreiben wenn der SOC ansteigt
        if(power_Grid >= 500 && batterieLaden && aktuelleBatterieSoC_Pro > batterieSOC_alt){
            const neuerEintrag = {
                soc: aktuelleBatterieSoC_Pro,
                price: aktuellerPreisTibber,
            };
            batterieLadedaten.push(neuerEintrag);
            await setStateAsync(sID_BatterieLadedaten, JSON.stringify(batterieLadedaten));
        }else if(aktuelleBatterieSoC_Pro > batterieSOC_alt){
            const neuerEintrag = {
                soc: aktuelleBatterieSoC_Pro,
                price: stromgestehungskosten,
            };
            batterieLadedaten.push(neuerEintrag);
            await setStateAsync(sID_BatterieLadedaten, JSON.stringify(batterieLadedaten));
        }
        batterieSOC_alt = aktuelleBatterieSoC_Pro
    } catch (error) {
        log(`Fehler in der Triggerfunktion Batterie: ${error.message}`, 'error');
    }
});

// Tibber Steuerung alle 1 min. aufrufen.
let scheduleTibber = schedule("*/1 * * * *", async function() {
    if(!bNotstromAktiv){
        await berechneBattPrice();
        await tibberSteuerungHauskraftwerk();
        await createDiagramm();
        
    }else{
        log(`Es wurde auf Notstrom umgeschaltet Script Tibber wurde angehalten und muss neu gestartet werden`,'error')
        await Promise.all([
            setStateAsync(sID_BatterieLaden, false),
            setStateAsync(sID_BatterieEntladesperre, false),
            setStateAsync(sID_eAutoLaden, false)
        ]);
        clearSchedule(scheduleTibber);
    }
});

// Bei Sonnenaufgang Merker zurücksetzen
schedule('{"time":{"exactTime":true,"start":"sunrise"},"period":{"days":1}}', function () { 
    log(`Merker bReichweiteSunrise wurde auf false gesetzt`)
    bReichweiteSunrise = false
});

//Bei Scriptende alle Timer löschen
onStop(function () { 
    loescheAlleTimer('all')
    setState(sID_status, ``)
    log(`-==== Alle Timer beendet ====-`)
}, 100);

ScriptStart();