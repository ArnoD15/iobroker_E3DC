'use strict';
//------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++++
const instanz = '0_userdata.0';                                                                        	        // Instanz Script
const PfadEbene1 = 'TibberSkript';                                                                     	        // Pfad innerhalb der Instanz
const PfadEbene2 = ['Anzeige_VIS','OutputSignal','History','USER_ANPASSUNGEN']                		            // Pfad innerhalb PfadEbene1

const instanzE3DC_RSCP = 'e3dc-rscp.0'
const DebugAusgabeDetail = true;
const DebugAusgabe = true;

// Hysterese-Schwellen
const hystereseReichweite_h = 0.5;                                                                              // Hysterese-Schwelle von ±30 Minuten
const hystereseBatterie_pro = 2;                                                                                // Hysterese-Schwelle von ±2 %
const hystereseKapazitaet = 2;                                                                                  // Hysterese-Schwelle von ±2 kWh
//++++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++
//------------------------------------------------------------------------------------------------------

const scriptVersion = 'Version 2.1.1'
log(`-==== Tibber Skript ${scriptVersion} gestartet ====-`);

//******************************************************************************************************
//**************************************** Deklaration Variablen ***************************************
//******************************************************************************************************

// IDs Script Charge_Control
const sID_Autonomiezeit =`${instanz}.Charge_Control.Allgemein.AutonomiezeitDurchschnitt`;
const sID_arrayHausverbrauch =`${instanz}.Charge_Control.Allgemein.arrayHausverbrauchDurchschnitt`;
const sID_maxEntladetiefeBatterie =`${instanz}.Charge_Control.USER_ANPASSUNGEN.10_maxEntladetiefeBatterie`
const sID_PrognoseAuto_kWh =`${instanz}.Charge_Control.History.PrognoseAuto_kWh`
const sID_AbfrageSolcast =`${instanz}.Charge_Control.USER_ANPASSUNGEN.30_AbfrageSolcast`
const sID_SolcastDachflaechen =`${instanz}.Charge_Control.USER_ANPASSUNGEN.30_SolcastDachflaechen`
const sID_SolcastResource_Id_Dach1 =`${instanz}.Charge_Control.USER_ANPASSUNGEN.30_SolcastResource_Id_Dach1`
const sID_SolcastResource_Id_Dach2 =`${instanz}.Charge_Control.USER_ANPASSUNGEN.30_SolcastResource_Id_Dach2`
const sID_SolcastAPI_key =`${instanz}.Charge_Control.USER_ANPASSUNGEN.30_SolcastAPI_key`
const sID_PV_Leistung_Tag_kWh =`${instanz}.Charge_Control.Allgemein.IstPvErtragLM0_kWh`

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
const sID_statusLaden = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.status`;                                     // Anzeige in VIS Status Laden
const sID_statusEntladesperre = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.statusEntladesperre`;                // Anzeige in VIS Status Entladesperre
const sID_ladezeitBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`;                      // Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen
const sID_timerAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`;                                  // Anzeige in VIS Status Timer um Batterie zu laden
const sID_StrompreisBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`                   // Anzeige in VIS aktueller Strompreis Batterie
const sID_peakSchwellwert_VIS = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Spitzenstrompreis`                   // Anzeige in VIS Schwellwert Spitzenstrompreis

const sID_BatterieLaden =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`;                             // Schnittstelle zu Charge-Control für die Ladefreigabe
const sID_eAutoLaden = `${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`;                                  // Schnittstelle zu Wallbox Script Auto laden
const sID_BatterieEntladesperre =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`;             // Schnittstelle zu Charge-Control für die Entladesperre

const sID_DiagramJosonChart =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`;                            // JSON für Diagramm Tibber Preise in VIS
const sID_DiagramJsonChartHeute =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_ChartHeute`;                   // JSON für Diagramm Tibber Preise in VIS
const sID_DiagramJsonChartMorgen =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_ChartMorgen`;                 // JSON für Diagramm Tibber Preise in VIS
const sID_BatterieLadedaten = `${instanz}.${PfadEbene1}.${PfadEbene2[2]}.BatterieLadedaten`                     // JSON zum berechnen vom Batterie Strompreis
const sID_PvSolcastSumme =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_PvSolcastSumme`;                      // JSON für PV Prognosen 24 h von Solcast

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
// @ts-ignore
const axios = require('axios');

let maxBatterieSoC = 0, aktuelleBatterieSoC_Pro,aktuelleBatterieSoC_alt = 0, ladeZeit_h, maxLadeleistungUser_W, stromgestehungskosten;
let benoetigteKapAktuell_kWh_alt = 0, benoetigteKapPrognose_kWh_alt = 0, maxLadeleistungE3DC_W = 0, pvAbweichung_kWh = 0;
let batterieKapazitaet_kWh = 0, minStrompreis_48h = 0, nReichweite_alt = 0, LogProgrammablauf = "";
let batterieSOC_alt = null, aktuellerPreisTibber = null, effektivPreisTibber = null ;
let hoherSchwellwert = 0, niedrigerSchwellwert = 0, peakSchwellwert = 0, systemwirkungsgrad = 0;
let strompreisBatterie, bruttoPreisBatterie, SolcastDachflaechen,SolcastAPI_key;

let bNachladenPeak = false, bLock = false, bSchneeBedeckt = false, bAutPreisanpassung = false, bNotstromAktiv = false, bBatteriepreisAktiv = false, bStart = true;                                                                 
let bBattLaden = false, bBattSperre = false, bBattSperrePrio = false, bReichweiteSunrise = false, bScriptAktiv = true, bSolcast = false, statusLadenText = ``,statusEntladesperreText = ``;
let timerIds = [], timerTarget = [], timerObjektID = [],timerState =[], batterieLadedaten = [],datenHeute =[], datenMorgen = [], datenTibberLink48h = [], Resource_Id_Dach=[];


//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************
// Alle nötigen Objekt ID's anlegen 
async function createState(){
    const createStatePromises = [
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`, { 'def': '', 'name': 'Anzeige in VIS durchschnittlicher Eigenverbrauch', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.status`, { 'def': '', 'name': 'Anzeige in VIS Status', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.statusEntladesperre`, { 'def': '', 'name': 'Anzeige in VIS Status Entladesperre', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`, { 'def': 0, 'name': 'Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen', 'type': 'number', 'unit': 'h' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`, { 'def': false, 'name': 'Anzeige in VIS Status Timer um Batterie zu laden', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.diagrammAktiv`, { 'def': false, 'name': 'Anzeige in VIS Diagramm Ladezeiten', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`, { 'def': 0, 'name': 'Anzeige in VIS aktueller Strompreis Batterie', 'type': 'number', 'unit': '€' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Spitzenstrompreis`, { 'def': 0, 'name': 'Anzeige in VIS Schwellwert Spitzenstrompreis', 'type': 'number', 'unit': '€' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`, { 'def': false, 'name': 'Schnittstelle zu Charge-Control laden', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`, { 'def': false, 'name': 'Schnittstelle zu Wallbox Script Auto laden', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`, { 'def': false, 'name': 'Schnittstelle zu Charge-Control Entladesperre', 'type': 'boolean' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`, { 'def': '[]', 'name': 'JSON für materialdesign json chart', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_ChartHeute`, { 'def': '[]', 'name': 'JSON für materialdesign json chart', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_ChartMorgen`, { 'def': '[]', 'name': 'JSON für materialdesign json chart', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.BatterieLadedaten`, { 'def': [], 'name': 'Batterie Start SOC mit Strompreis', 'type': 'string' }),
        createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_PvSolcastSumme`, { 'def': '[]', 'name': 'JSON für PV Prognosen 24 h von Solcast', 'type': 'string' }),
        
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
        getStateAsync(sID_BAT0_Alterungszustand),
        getStateAsync(sID_AbfrageSolcast),
        getStateAsync(sID_Bat_Charge_Limit)
    ]);
    
    batterieLadedaten        = results[0].val;
    aktuelleBatterieSoC_Pro  = results[1].val;
    const batteryCapacity0   = results[2].val;
    const entladetiefe_Pro   = results[3].val;
    const aSOC_Bat_Pro       = results[4].val;
    bSolcast                 = results[5].val;
    maxLadeleistungE3DC_W    = results[6].val;
    
    if (bSolcast){
        const resultsSolcast = await Promise.all([
            getStateAsync(sID_SolcastDachflaechen),
            getStateAsync(sID_SolcastResource_Id_Dach1),
            getStateAsync(sID_SolcastResource_Id_Dach2),
            getStateAsync(sID_SolcastAPI_key)
        ]);
    
        SolcastDachflaechen        = resultsSolcast[0].val;
        Resource_Id_Dach[1]        = resultsSolcast[1].val;
        Resource_Id_Dach[2]        = resultsSolcast[2].val;
        SolcastAPI_key             = resultsSolcast[3].val;
    }

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
    
    batterieLadedaten = safeJsonParse(batterieLadedaten, []);
    batterieKapazitaet_kWh = (batterieKapazitaet_kWh * (entladetiefe_Pro/100)) * (aSOC_Bat_Pro/100);
	batterieKapazitaet_kWh = round(batterieKapazitaet_kWh, 2);
    aktuellerPreisTibber = await getCurrentPrice()
    effektivPreisTibber = parseFloat((aktuellerPreisTibber * (1 / (systemwirkungsgrad / 100))).toFixed(4));
    
    // Erstelle das Tibber Diagramm
    await createDiagramm();
    // Strompreis Batterie berechnen
    await berechneBattPrice();        
    // Schwellwert setzen
    if(bAutPreisanpassung){await autoPreisanpassung(minStrompreis_48h)}
    await pruefeAbweichung();
    // Tibber-Steuerung starten
    await tibberSteuerungHauskraftwerk()
    bStart = false;
    
} 

//  State-Typen können variieren (Adapter-/Script-Einstellungen). Defensive Parsing verhindert Laufzeitfehler.
function safeJsonParse(val, fallback) {
  if (val == null) return fallback;
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return fallback; }
  }
  if (typeof val === 'object') return val;
  return fallback;
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
            const assign = {
				maxLadeleistungUser_W: v => maxLadeleistungUser_W = v,
				hoherSchwellwert: v => hoherSchwellwert = v,
				niedrigerSchwellwert: v => niedrigerSchwellwert = v,
				bSchneeBedeckt: v => bSchneeBedeckt = v,
				bAutPreisanpassung: v => bAutPreisanpassung = v,
				maxBatterieSoC: v => maxBatterieSoC = v,
				systemwirkungsgrad: v => systemwirkungsgrad = v,
				bBatteriepreisAktiv: v => bBatteriepreisAktiv = v,
				stromgestehungskosten: v => stromgestehungskosten = v,
				bScriptAktiv: v => bScriptAktiv = v,
			};
			assign[obj.varName]?.(value);
            
			if (obj.min !== undefined && (value < obj.min || value > obj.max)) {
                log(obj.errorMsg, 'error');
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

// Setzt eine Entladesperre in Segmenten (Cap), statt am Stück.
// startTime: Date, endTime: Date, capMin: number (z. B. 90)
async function setEntladesperreMitCap(startTime, endTime, capMin) {
    try {
        const capMs = capMin * 60 * 1000;
        let segStart = new Date(startTime);
        const end = new Date(endTime);

        // Sicherheit: existierende Entladesperren-Timer löschen, damit wir sauber segmentieren
        await loescheAlleTimer('Entladesperre');
        
        while (segStart < end) {
            const segEnd = new Date(Math.min(segStart.getTime() + capMs, end.getTime()));
            // Segment setzen
            await setStateAtSpecificTime(segStart, sID_BatterieEntladesperre, true);
            await setStateAtSpecificTime(segEnd, sID_BatterieEntladesperre, false);
            let message = `Entladesperre wird von ${segStart} bis ${segEnd} gesetzt)`
            statusEntladesperreText != message ? await setStateAsync(sID_statusEntladesperre,message): null;
            // nächstes Segment beginnt direkt am Ende des aktuellen
            segStart = new Date(segEnd.getTime());
        }
    } catch (e) {
        log(`Fehler in setEntladesperreMitCap: ${e.message}`, 'error');
    }
}

// Ablaufsteuerung zum regeln der Batterieladung bei günstigen Tibber Preise
async function tibberSteuerungHauskraftwerk() {
    try {    
        if (!bScriptAktiv){return;}
        LogProgrammablauf += '1,';
        [bBattLaden,statusLadenText,statusEntladesperreText,bBattSperre,peakSchwellwert] = await Promise.all([
            getStateAsync(sID_BatterieLaden),
            getStateAsync(sID_statusLaden),
            getStateAsync(sID_statusEntladesperre),
            getStateAsync(sID_BatterieEntladesperre),
            getStateAsync(sID_peakSchwellwert_VIS)
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
        
		// Früh-Löse-Regel: Wenn Sperre aktiv (Prio) und Preis wieder <= hoherSchwellwert, Sperre aufheben
		if (bBattSperrePrio && aktuellerPreisTibber <= hoherSchwellwert) {
			await loescheAlleTimer('Entladesperre');
			if (getState(sID_BatterieEntladesperre).val === true) {
				await setStateAsync(sID_BatterieEntladesperre, false);
                await setStateAsync(sID_statusEntladesperre, ``).catch(()=>{})
            }
			bBattSperrePrio = false;
		}
		
        // Funktion prüfe Freigabe laden vom E-Auto aufrufen
        await EAutoLaden(naechsteNiedrigphase);
        
        // Kann die Batterie mit PV-Leistung geladen werden wenn ja dann Funktion beenden
        if (pvLeistungAusreichend.state) {
            LogProgrammablauf += '2,';
            await loescheAlleTimer('Laden')
            await loescheAlleTimer('Entladesperre');
            bBattSperrePrio = false;
            bBattLaden ? await setStateAsync(sID_BatterieLaden,false): null;    
            if (bBattSperre) {
                await setStateAsync(sID_BatterieEntladesperre, false);
                await setStateAsync(sID_statusEntladesperre, ``).catch(()=>{});
            }    
            
            let message = `PV Prognose hoch,es wird bei Sonnenaufgang mit PV Leistung geladen (aktive Phase: ${aktivePhase.type})`;
            statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
            await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
            LogProgrammablauf = '';
            return;
        }

        // Entladen der Batterie sperren wenn Batteriepreis höher als Tibberpreis und sperre nicht über Timer gesetzt wurde
        if (!bBattSperrePrio) {
            if (preisBatterie > aktuellerPreisTibber) {
                if(!bBattSperre){
                    await setStateAsync(sID_BatterieEntladesperre, true);
                    let message = `Batteriepreis (${preisBatterie}€) ist höher als Tibber Preis (${aktuellerPreisTibber}€) Entladen wurde gesperrt)`
                    statusEntladesperreText != message ? await setStateAsync(sID_statusEntladesperre,message): null;
                }
            } else if (bBattSperre) {
                await setStateAsync(sID_BatterieEntladesperre, false);
                await setStateAsync(sID_statusEntladesperre, ``).catch(()=>{})
            }
        }
        
        // Wenn max SOC erreicht wurde Funktion beenden -3% um pendeln zu verhindern
        if (aktuelleBatterieSoC_Pro >= maxBatterieSoC - 3) {
            LogProgrammablauf += '3,';
            let message = `max SOC erreicht. Laden beendet (aktive Phase: ${aktivePhase.type})`;
            statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
            await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
            LogProgrammablauf = '';
            return;
        }
      
        const naechsteNormalphase = findeNaechstePhase(ergebnis.normalPhases);
        const naechstePhase0 = ergebnis?.naechstePhasen[0] // @ts-ignore
        const aktivePhaseType = aktivePhase.type;    
        peakSchwellwert != spitzenSchwellwert ? await setStateAsync(sID_peakSchwellwert_VIS, spitzenSchwellwert):null;
        
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
                        statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
                        await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
                        LogProgrammablauf = '';
                        return;
                    }else if(!bNachladenPeak){
                        LogProgrammablauf += '10/4,';
                        // Batteriesperre reicht aus, sofort entladen sperren.
                        bNachladenPeak = true; // weiteres Nachladen in der Peakphase verhindern.
                        const vonTime = new Date()
                        const bisTime = new Date(ergebnisPreisvergleich.peakZeit)
                        
						await setEntladesperreMitCap(vonTime, bisTime, 90);
                        
						// Nach der Preissteigerung Merker zurücksetzen.
                        const dauerEndePreissteigerung_ms = dauerEndePreissteigerung_h * 1000 * 60 * 60;
                        setTimeout(() => {bNachladenPeak = false;}, dauerEndePreissteigerung_ms);
                        const startTime = vonTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        const endeTime = bisTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        let message = `Batteriesperre während Peakphase von ${startTime} bis ${endeTime} (aktive Phase: ${aktivePhase.type})`
                        statusEntladesperreText != message ? await setStateAsync(sID_statusEntladesperre,message): null;
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
                statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
                    statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
                    statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
                        
						await setEntladesperreMitCap(vonTime, bisTime, 90);
                        
						const startTime = vonTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        const endeTime = bisTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                        let message = `Batterie sperre von ${startTime} bis ${endeTime} um Peakphase zu überbrücken (aktive Phase: ${aktivePhase.type})`
                        statusEntladesperreText != message ? await setStateAsync(sID_statusEntladesperre,message): null;
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
                                await setEntladesperreMitCap(new Date(start.zeit), new Date(naechstePhase0.start), 90);
                                const startTime = start.zeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                                const endeTime = endeZeit.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' Uhr';
                                let message = `Batterie laden von ${startTime} bis ${endeTime} um Peakphase zu überbrücken (aktive Phase: ${aktivePhase.type})`
                                statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
                    statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
                    bBattLaden ? await setStateAsync(sID_BatterieLaden,false): null;
                    if(preisBatterie < aktuellerPreisTibber){
                        await loescheAlleTimer('Entladesperre')
                        bBattSperrePrio = false;
                        if (bBattSperre) {
                            await setStateAsync(sID_BatterieEntladesperre, false);
                            await setStateAsync(sID_statusEntladesperre, ``).catch(()=>{});
                        }    
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
                    statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
                statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
                statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
                    statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
                statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
            //log(`Programmablauf 13 vonTime = ${vonTime} bisTime = ${bisTime} ladeZeit_h = ${ladeZeit_h}`)
            const dateBesteStartLade = bestLoadTime(vonTime,bisTime,ladeZeit_h)
            const dateEndeLadezeit = new Date(dateBesteStartLade.zeit);
            //log(`dateBesteStartLade = ${dateBesteStartLade} dateEndeLadezeit = ${dateEndeLadezeit}`)
            dateEndeLadezeit.setHours(dateEndeLadezeit.getHours() + ladeZeit_h);
            await setStateAtSpecificTime(new Date(dateBesteStartLade.zeit), sID_BatterieLaden, true);
            await setStateAtSpecificTime(new Date(dateEndeLadezeit), sID_BatterieLaden, false);
            await DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend.state);
            LogProgrammablauf = '';
            return;
        }
        LogProgrammablauf += '14,';
        let message = `Nicht laden (aktive Phase: ${aktivePhase.type})`
        statusLadenText != message ? await setStateAsync(sID_statusLaden,message): null;
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
        const endZeit = new Date(datejetzt.getTime() + 5 * 60 * 60 * 1000); // aktuelle Zeit plus 5h

        // Stelle sicher, dass startzeit ein Date-Objekt ist
        const startZeit = naechsteNiedrigphase.startzeit instanceof Date 
            ? naechsteNiedrigphase.startzeit 
            : new Date(naechsteNiedrigphase.startzeit);

        if (startZeit.getTime() < endZeit.getTime()) {
            LogProgrammablauf += '20,';
            // Innerhalb 5 h kommt eine Niedrigphase – E-Auto Laden warten
            if (startZeit.getTime() > datejetzt.getTime()) {
                await setStateAsync(sID_eAutoLaden, false);
            }
            await setStateAtSpecificTime(startZeit, sID_eAutoLaden, true);
        } else {
            if (aktuellerPreisTibber !== null && aktuellerPreisTibber < hoherSchwellwert) {
                LogProgrammablauf += '21,';
                await setStateAsync(sID_eAutoLaden, true);
            } else {
                LogProgrammablauf += '22,';
                await loescheAlleTimer('Auto');
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

        // Nur zukünftige Phasen filtern
        const naechstePhase = arrayPhases
            .filter(phase => new Date(phase.start) > jetzt)
            // @ts-ignore
            .sort((a, b) => new Date(a.start) - new Date(b.start))[0];

        if (naechstePhase) {
            const start = new Date(naechstePhase.start);
            const end = new Date(naechstePhase.end);
            return {
                state: true,
                startzeit: start,
                endzeit: end,
                startzeitLokal: start.toLocaleString(),
                endzeitLokal: end.toLocaleString()
            };
        }

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

// Funktion prüft, ob die Batterie durch erwartete PV-Leistung geladen werden kann
// und ob die Reichweite ausreicht, um bis zum nächsten Sonnenaufgang zu kommen.
async function pruefePVLeistung(reichweiteStunden) {
    try {
        LogProgrammablauf += '18,';

        // Reichweite validieren und auf ganze Stunden abrunden
        let nreichweiteStunden = Math.floor(parseFloat(reichweiteStunden));
        if (isNaN(nreichweiteStunden)) {
            log(`function pruefePVLeistung(): reichweiteStunden ist keine gültige Zahl`, 'error');
            return { state: false };
        }
        
        // Prüfen, ob PV-Module schneebedeckt sind
        if (bSchneeBedeckt) {
            LogProgrammablauf += '18/1,';
            return { state: false };
        }

        const jetzt = new Date();
        const morgen = new Date(jetzt.getTime() + 24 * 60 * 60 * 1000);

        // Sonnenaufgang/-untergang
        const sunriseHeute = getAstroDate("sunrise", jetzt).getTime();
        const sunsetHeute = getAstroDate("sunset", jetzt).getTime() - 2 * 3600000; // -2h Puffer
        const sunriseMorgen = getAstroDate("sunrise", morgen).getTime();

        // PV-Prognose
        let arrayPrognoseAuto_kWh = safeJsonParse((await getStateAsync(sID_PrognoseAuto_kWh)).val, []);
                
        // 1..31 -> Array[1..31] genutzt, auch am Monatsübergang = 1
        const heuteIndex = jetzt.getDate();
        const morgenIndex = morgen.getDate();
        
		function numberOrZero(v) {
			const n = typeof v === 'string' ? parseFloat(v) : v;
			return (typeof n === 'number' && !isNaN(n)) ? n : 0;
		}

		let pvHeute = 0, pvMorgen = 0;

		if (Array.isArray(arrayPrognoseAuto_kWh) && arrayPrognoseAuto_kWh.length >= 31) {
			pvHeute = numberOrZero(arrayPrognoseAuto_kWh[heuteIndex] ?? 0);
			pvMorgen = numberOrZero(arrayPrognoseAuto_kWh[morgenIndex] ?? 0);
		} else {
			log('PV-Prognose: Monatsarray fehlt oder hat <31 Einträge – setze pvHeute/pvMorgen = 0', 'warn');
			pvHeute = 0;
			pvMorgen = 0;
		}

		pvHeute = round(pvHeute, 1);
		pvMorgen = round(pvMorgen, 1);
		
        // --- PV-Prognose-Korrektur auf Basis der Ist-Abweichung (in kWh) berechnet in der Funktion pruefeAbweichung() ---
        let korrekturFaktor = pvAbweichung_kWh || 0;
        if(korrekturFaktor > 0 ){korrekturFaktor = 0}
        const pvHeuteKorr = pvHeute + korrekturFaktor;
        if (DebugAusgabe){log(`PV Prognose heute: ${pvHeute} kWh, Abweichung: ${pvAbweichung_kWh} kWh, nach Korrektur: ${pvHeuteKorr} kWh`,'warn');}
        
        // Benötigte Kapazität
        const progBattSoC = await prognoseBatterieSOC(nreichweiteStunden);
        let benoetigteKapPrognose = round((100 - progBattSoC.soc) / 100 * batterieKapazitaet_kWh, 0);
        const ladeWirkungsgrad = systemwirkungsgrad/100;
        let benoetigteKapPrognoseEff = benoetigteKapPrognose / ladeWirkungsgrad;
        let benoetigteKapAktuell = round((100 - aktuelleBatterieSoC_Pro) / 100 * batterieKapazitaet_kWh, 0);
        // Hysterese anwenden
        if (Math.abs(benoetigteKapPrognoseEff - benoetigteKapPrognose_kWh_alt) < hystereseKapazitaet) {
            benoetigteKapPrognoseEff = benoetigteKapPrognose_kWh_alt;
        } else {
            benoetigteKapPrognose_kWh_alt = benoetigteKapPrognoseEff;
        }

        if (Math.abs(benoetigteKapAktuell - benoetigteKapAktuell_kWh_alt) < hystereseKapazitaet) {
            benoetigteKapAktuell = benoetigteKapAktuell_kWh_alt;
        } else {
            benoetigteKapAktuell_kWh_alt = benoetigteKapAktuell;
        }

        // Zeit bis nächster Sonnenaufgang + 3h Puffer
        let stundenBisSunrise = 0;
        const jetztMs = Date.now();
        if (jetztMs < sunriseHeute) {
            stundenBisSunrise = round((sunriseHeute - jetztMs) / 3600000 + 3, 0);
        } else if (jetztMs >= sunsetHeute) {
            stundenBisSunrise = round((sunriseMorgen - jetztMs) / 3600000 + 3, 0);
        } else {
            // Zwischen Sonnenaufgang und Sonnenuntergang
            const verbleibendeSonnenstunden = (sunsetHeute - jetztMs) / 3600000;
            const gesamteSonnenstunden = (sunsetHeute - sunriseHeute) / 3600000;
            const pvBisSunset = (pvHeuteKorr / gesamteSonnenstunden) * verbleibendeSonnenstunden;

            if (pvBisSunset >= benoetigteKapAktuell) {
                LogProgrammablauf += '18/2,';
                return { state: true };
            } else {
                LogProgrammablauf += '18/3,';
                return { state: false };
            }
        }

        // Prüfen, ob Reichweite ausreicht
        if (nreichweiteStunden < stundenBisSunrise && !bReichweiteSunrise) {
            LogProgrammablauf += '18/4,';
            return { state: false };
        }
        bReichweiteSunrise = true;

        // Prognose für morgen prüfen
        if (jetztMs >= sunsetHeute) {
            const progMorgen = await prognoseBatterieSOC(stundenBisSunrise);
            const benoetigteKapMorgen = (100 - progMorgen.soc) / 100 * batterieKapazitaet_kWh;
            if (pvMorgen >= benoetigteKapMorgen) {
                LogProgrammablauf += '18/5,';
                return { state: true };
            }
        } else {
            // Heute prüfen
            // prüfen ob die max. Ladeleistung ausreicht.
            
            const jetztMs = Date.now();
            const verbleibendeSonnenstunden = (sunsetHeute - jetztMs) / 3600000;
            const maxLadbareEnergie = (maxLadeleistungE3DC_W / 1000) * verbleibendeSonnenstunden;
            
            if (pvHeuteKorr >= benoetigteKapPrognoseEff && maxLadbareEnergie >= benoetigteKapPrognoseEff) {
                LogProgrammablauf += '18/6,';
                return { state: true };
            }
        }

        LogProgrammablauf += '18/7,';
        return { state: false };
    } catch (error) {
        log(`Fehler in Funktion pruefePVLeistung(): ${error.message}`, 'error');
    }
}

// Funktion berechnet den Batterie-SOC nach einer variablen Zeit in Stunden bei einem berechneten Durchschnittsverbrauch.
async function prognoseBatterieSOC(entladezeitStunden) {
    try {
        // Ladezeit runden und sicherstellen, dass es eine Zahl ist
        entladezeitStunden = round(+entladezeitStunden, 0) || 0;

        // Leistungsdaten vom aktuellen Tag abrufen
        const hausverbrauch = safeJsonParse((await getStateAsync(sID_arrayHausverbrauch)).val, {});

        // Aktuellen Wochentag bestimmen
        const now = new Date();
        const currentDay = now.toLocaleDateString('de-DE', { weekday: 'long' });

        // Prüfen, ob Daten für den Tag vorhanden sind
        if (!hausverbrauch[currentDay] || hausverbrauch[currentDay].day == null || hausverbrauch[currentDay].night == null) {
            log(`prognoseBatterieSOC: Hausverbrauch für ${currentDay} nicht vorhanden`, 'error');
            return { state: false, soc: aktuelleBatterieSoC_Pro };
        }

        // Tages- und Nachtverbrauch in kWh berechnen
        const hausverbrauch_day_kWh = hausverbrauch[currentDay].day / 1000;
        const hausverbrauch_night_kWh = hausverbrauch[currentDay].night / 1000;

        // Durchschnittliche entladene Energie berechnen
        const entladeneEnergie_kWh = round(((hausverbrauch_day_kWh + hausverbrauch_night_kWh) / 2) * entladezeitStunden, 2);

        // Aktuellen Eigenverbrauch im System aktualisieren (optional)
        await setStateAsync(
            sID_aktuellerEigenverbrauch,
            `${round(hausverbrauch_day_kWh * 1000, 0)} W / ${round(hausverbrauch_night_kWh * 1000, 0)} W`
        );

        // Neuen Batterie-SOC berechnen
        let neueSoC = Math.floor(aktuelleBatterieSoC_Pro - (entladeneEnergie_kWh / batterieKapazitaet_kWh) * 100);
        neueSoC = Math.max(neueSoC, 0); // SOC nicht negativ machen

        return {
            state: true,
            soc: neueSoC
        };

    } catch (error) {
        log(`Fehler in Funktion prognoseBatterieSOC: ${error.message}`, 'error');
        return { state: false, soc: aktuelleBatterieSoC_Pro };
    }
}

// Aufruf mit startSOC: Berechnet die Ladezeit basierend auf der aktuellen Batterieladung und dem maximalen Ladezustand.
// Aufruf mit dauer_h: Berechnet die Ladezeit auf Basis des Hausverbrauchs und der Ladeleistung nach ablauf von dauer_h.
async function berechneLadezeitBatterie(dauer_h = null, startSOC = null) {
    try {
        if (dauer_h !== null && startSOC !== null) {
            throw new Error("Es darf entweder 'dauer_h' oder 'startSOC' gesetzt sein, nicht beide gleichzeitig.");
        }

        const hausverbrauch = safeJsonParse((await getStateAsync(sID_arrayHausverbrauch)).val, {});
        maxLadeleistungE3DC_W = (await getStateAsync(sID_Bat_Charge_Limit)).val;

        const maxLadeleistung = Math.min(maxLadeleistungUser_W, maxLadeleistungE3DC_W);
        const maxLadeleistung_kW = (maxLadeleistung - 200) / 1000;

        if (!hausverbrauch) return 0;

        const now = new Date();
        const currentDay = now.toLocaleDateString('de-DE', { weekday: 'long' });

        if (!hausverbrauch[currentDay] || hausverbrauch[currentDay].day == null || hausverbrauch[currentDay].night == null) {
            log(`berechneLadezeitBatterie: Hausverbrauch für ${currentDay} nicht vorhanden`, 'error');
            return 0;
        }

        const hausverbrauch_day_kWh = hausverbrauch[currentDay].day / 1000;
        const hausverbrauch_night_kWh = hausverbrauch[currentDay].night / 1000;
        const durchschnittlicherVerbrauch_kWh = (hausverbrauch_day_kWh + hausverbrauch_night_kWh) / 2;

        if (maxLadeleistung_kW <= 0) {
            log(`berechneLadezeitBatterie: Ungültige Ladeleistung ${maxLadeleistung_kW} kW`, 'error');
            return 0;
        }

        let ladezeitInStunden = 0;

        if (dauer_h !== null) {
            const benoetigteEnergie_kWh = round(durchschnittlicherVerbrauch_kWh * dauer_h, 2);
            ladezeitInStunden = benoetigteEnergie_kWh / maxLadeleistung_kW;
        } else if (startSOC !== null) {
            const zuLadendeProzent = maxBatterieSoC - startSOC;
            if (zuLadendeProzent > 0) {
                const zuLadendeKapazitaet_kWh = (batterieKapazitaet_kWh * zuLadendeProzent) / 100;
                ladezeitInStunden = zuLadendeKapazitaet_kWh / maxLadeleistung_kW;
            }
        }

        if (startSOC !== null) {
            await setStateAsync(sID_ladezeitBatterie, Math.ceil(ladezeitInStunden));
        }

        return Math.ceil(ladezeitInStunden);

    } catch (error) {
        log(`Fehler in Funktion berechneLadezeitBatterie: ${error.message}`, 'error');
        return 0;
    }
}

// Setzt Timer Batterie Laden für Startzeit und Endzeit 
async function setStateAtSpecificTime(targetTime, stateID, state) {
    try {
        LogProgrammablauf += '29,';
        //log(`setStateAtSpecificTime: targetTime = ${targetTime} stateID = ${stateID} state = ${state} `);
        const currentTime = new Date();
        const targetDate = new Date(targetTime);

        if (!Array.isArray(timerObjektID) || !Array.isArray(timerState)) {
            throw new Error("timerObjektID oder timerState ist kein gültiges Array");
        }

		if (!(targetTime instanceof Date) || isNaN(targetDate.getTime())) {
            LogProgrammablauf += '29/2,';
            log(`Fehler in function setStateAtSpecificTime, targetTime ist kein Date-Objekt / targetTime = ${targetTime} `, 'warn');
            return;
        }

        // Erzeuge logische Aktion aus stateID
		const objektID = {
			[sID_BatterieEntladesperre]: 'Entladesperre',
			[sID_BatterieLaden]: 'Laden',
			[sID_eAutoLaden]: 'Auto'
		}[stateID] || '';

		// Duplikate erkennen: gleiche Zielzeit ±1s, gleiche Aktion, gleicher Ziel-State
		const dupIdx = timerTarget.findIndex((t, i) =>
			Math.abs(t.getTime() - targetDate.getTime()) < 1000 &&
			timerObjektID[i] === objektID &&
			timerState[i] === state
		);
		if (dupIdx >= 0) {
			LogProgrammablauf += '29/1,';
			return; // identischer Timer existiert bereits
		}

        const matchingIndices = timerObjektID
            .map((id, index) => (id === objektID && timerState[index] === state ? index : -1))
            .filter(index => index !== -1);

        if (matchingIndices.length > 0) {
            LogProgrammablauf += '29/4,';
            for (const index of matchingIndices) {
                clearTimeout(timerIds[index]);
                timerObjektID.splice(index, 1);
                timerIds.splice(index, 1);
                timerTarget.splice(index, 1);
                timerState.splice(index, 1);

                if (objektID === 'Laden' && state === true) {
                    await setStateAsync(sID_timerAktiv, false);
                }
            }
        }

        let timeDiff = targetDate.getTime() - currentTime.getTime();
        //log(`timeDiff = ${timeDiff} stateID = ${stateID} objektID = ${objektID} state = ${state}`);

        // Wenn Startzeit in der Vergangenheit, ignorieren außer bei Batterie Entladesperre
        if (timeDiff > 0 || (timeDiff <= 0 && stateID === sID_BatterieEntladesperre && state === true)) {
            LogProgrammablauf += '29/3,';
            let id = setTimeout(async () => {
                try {
                    const stateAkt = (await getStateAsync(stateID)).val;
                    if (stateAkt != state) {
                        await setStateAsync(stateID, state);
                        //log(`State ${stateID} wurde durch Timer um ${targetTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} auf ${state} gesetzt.`, 'warn');
                    }
                    if (stateID === sID_BatterieLaden && state === false) {
                        if (stateAkt != state) {
                            await setStateAsync(sID_timerAktiv, false);
                            //log(`State ${stateID} wurde durch Timer um ${targetTime.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} auf ${state} gesetzt.`, 'warn');
                        }
                    }
                    if (stateID === sID_BatterieEntladesperre && state === false) { bBattSperrePrio = false; }
                    if (stateID === sID_BatterieEntladesperre && state === true) { bBattSperrePrio = true; }
                } catch (error) {
                    log(`Fehler im Timer function setStateAtSpecificTime: ${error.message}`, 'error');
                }
            }, timeDiff);

            timerObjektID.push(objektID);
            timerIds.push(id);
            timerTarget.push(targetDate);
            timerState.push(state);

            if (objektID == 'Laden') { await setStateAsync(sID_timerAktiv, true); }

            // Warnung bei zu vielen Timern
            if (timerIds.length > 200) {
                log(`Warnung: Es sind aktuell ${timerIds.length} Timer aktiv!`, 'warn');
            }
        }
    } catch (error) {
        log(`Fehler in Funktion setStateAtSpecificTime: ${error.message}`, 'error');
    }
}

// Funktion sucht den günstigsten Startzeitpunkt für eine Ladezeit innerhalb eines Zeitraums.
// Unterstützt jetzt auch 15-Minuten-Intervalle statt Stundenwerte.
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
        if (isNaN(nladezeit_h) || nladezeit_h <= 0) {
			log(`function bestLoadTime: ungültige Ladezeit (nladezeit_h=${nladezeit_h}`,'warn');
			return null;
		}
		
        // Intervall in Minuten automatisch erkennen (z. B. 15, 30, 60)
        const intervalMin = detectIntervalMinutes(datenTibberLink48h);
        const interval_h = intervalMin / 60;
        const stepsPerHour = 60 / intervalMin;

        // Anzahl der Datensätze, die eine Ladezeit abdecken (z. B. 2 h Ladezeit = 8 × 15 min)
        const ladezeitSteps = Math.max(Math.round(nladezeit_h * stepsPerHour), 1);

        // Zeitgrenzen prüfen
        const firstEntryTime = new Date(datenTibberLink48h[0].startsAt);
        const lastEntryTime = new Date(datenTibberLink48h[datenTibberLink48h.length - 1].startsAt);
        const lastEndTime = new Date(lastEntryTime.getTime() + intervalMin * 60 * 1000);
		
		const minFensterMs = nladezeit_h * 60 * 60 * 1000;
		if (dateStartTime >= dateEndTime) {
			log(`function bestLoadTime: Zeitfenster leer nach Clamping (start=${dateStartTime.toISOString()}, end=${dateEndTime.toISOString()}`, 'warn');
			return null;
		}
		
        if ((dateEndTime.getTime() - dateStartTime.getTime()) < minFensterMs) {
			const minLadezeitMs = 30 * 60 * 1000; 
            // min. 30 min Laden sonst nächstes Fenster abwarten
            if ((dateEndTime.getTime() - dateStartTime.getTime()) < minLadezeitMs) {
                if ((dateEndTime.getTime() - dateStartTime.getTime()) < minLadezeitMs) {
                    return null;
                }else{
                    const diff = minFensterMs - (dateEndTime.getTime() - dateStartTime.getTime());
                    dateEndTime = new Date(dateEndTime.getTime() + diff);
                    log(`Benötigte Ladezeit ${nladezeit_h}h war zu Lang. Ladezeitende wurde auf ${dateEndTime.getHours().toString().padStart(2, '0')}:${dateEndTime.getMinutes().toString().padStart(2, '0')} angepasst.`,'warn')
                }
            }
        }
        
		if (!Array.isArray(datenTibberLink48h) || datenTibberLink48h.length < 2) {
			log(`function bestLoadTime: datenTibberLink48h unzureichend (len=${Array.isArray(datenTibberLink48h) ? datenTibberLink48h.length : 'n/a'}`, 'warn');
			return null;
		}

		if (dateStartTime < firstEntryTime) {
            log(`dateStartTime liegt vor dem gültigen Zeitraum. Anpassung auf ${firstEntryTime}`, 'warn');
            dateStartTime = firstEntryTime;
        }
        if (dateEndTime > lastEndTime) {
            log(`dateEndTime liegt nach dem gültigen Zeitraum. Anpassung auf ${lastEndTime}`, 'warn');
            dateEndTime = lastEndTime;
        }

        // Hauptschleife: Alle möglichen Ladezeitblöcke prüfen
        for (let i = 0; i < datenTibberLink48h.length - ladezeitSteps; i++) {
            const startEntry = datenTibberLink48h[i];
            const startTime = new Date(startEntry.startsAt);

            // Nur Blöcke innerhalb des Zeitraums berücksichtigen
            if (startTime >= dateStartTime && startTime < dateEndTime) {
                let blockPreis = 0;

                // Summiere Preise im Ladeblock
                for (let j = 0; j < ladezeitSteps; j++) {
                    const entry = datenTibberLink48h[i + j];
                    if (!entry) continue;
                    blockPreis += entry.total;
                }

                // Kleinster Einzelpreis (z. B. wichtig für Batterie)
                if (datenTibberLink48h[i].total < billigsterPreis) {
                    billigsterPreis = datenTibberLink48h[i].total;
                }

                // Prüfe, ob dieser Block der günstigste ist
                if (blockPreis < billigsterBlockPreis) {
                    billigsterBlockPreis = blockPreis;
                    billigsteZeit = startTime;
                }
            }
        }

        // Durchschnittspreis pro Stunde (über alle 15-min-Werte im Block)
        const blockDauer_h = ladezeitSteps * interval_h;
        const durchschnittspreis = billigsterBlockPreis / blockDauer_h;

        if (billigsteZeit) {
            return {
                zeit: new Date(billigsteZeit),
                preis_d: round(durchschnittspreis, 4),
                preis: billigsterPreis,
                intervall: intervalMin,
                ladezeitSteps
            };
        } else {
            log(`function bestLoadTime: Kein Eintrag gefunden dateStartTime=${dateStartTime} dateEndTime=${dateEndTime}`, 'error');
            return null;
        }
    } catch (error) {
        log(`Fehler in function bestLoadTime: ${error.message}`, 'error');
        return null;
    }
}


async function createDiagramm() {
    const value = (await getStateAsync(sID_Autonomiezeit)).val;
    const [stunden, minuten] = value.includes('/')
        ? value.split(' / ')[1].split(' ')[0].split(':').map(Number)
        : value.split(' ')[0].split(':').map(Number);

    const reichweite_h = round(stunden + (minuten / 60), 0);

    // Zeitangaben berechnen
    const currentDateTime = new Date();
    const battDateTime = new Date(currentDateTime.getTime() + reichweite_h * 3600000);

    // Hilfsfunktion zum Erstellen eines Diagramm-JSONs
    const createChart = (data, label) => {
        const axisLabels = [];
        const dataPoints = [];
        const barDataPoints = [];
        const barDataPoints2 = [];
        const toleranceMs = 7.5 * 60 * 1000; // 7,5 Minuten Toleranz

        data.forEach(entry => {
            const date = new Date(entry.startsAt);
            const timeLabel = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} Uhr`;
            axisLabels.push(timeLabel);
            dataPoints.push(entry.total);

            const entryTime = date.getTime();
            const diffCurrent = Math.abs(entryTime - currentDateTime.getTime());
            const diffBatt = Math.abs(entryTime - battDateTime.getTime());

            barDataPoints.push(diffCurrent <= toleranceMs ? 0.2 : 0);
            barDataPoints2.push(diffBatt <= toleranceMs ? 0.2 : 0);
        });

        return {
            "axisLabels": axisLabels,
            "graphs": [
                {
                    "data": dataPoints,
                    "type": "line",
                    "color": "gray",
                    "yAxis_show": false,
                    "line_pointSizeHover": 5,
                    "line_pointSize": 2,
                    "line_Tension": 0.2,
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
                    "datalabel_fontSize": 11,
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
                },
                {
                    "data": barDataPoints,
                    "type": "bar",
                    "color": "#140CF2",
                    "yAxis_min": 0.0,
                    "yAxis_max": 1,
                    "datalabel_show": false
                },
                {
                    "data": barDataPoints2,
                    "type": "bar",
                    "color": "#f01a1a",
                    "yAxis_min": 0,
                    "yAxis_max": 1,
                    "datalabel_show": false,
                    "tooltip_title": "Reichweite Batterie"
                }
            ],
            "meta": { "day": label }
        };
    };

    // Diagramme separat erstellen
    const chartHeute = createChart(datenHeute, "Heute");
    const chartMorgen = createChart(datenMorgen, "Morgen");
    const combinedData = [...datenHeute, ...datenMorgen];
    const chartKombi = createChart(combinedData, "Heute + Morgen");
    chartKombi.graphs.forEach(graph => {
        graph.datalabel_show = false;
    });
    // Diagramme speichern
    await setStateAsync(sID_DiagramJsonChartHeute, JSON.stringify(chartHeute, null, 4));
    await setStateAsync(sID_DiagramJsonChartMorgen, JSON.stringify(chartMorgen, null, 4));
    await setStateAsync(sID_DiagramJosonChart, JSON.stringify(chartKombi, null, 4));
}

// Funktion berechnet den Batteriepreis
async function berechneBattPrice() {
    try {
        const batterieLadedaten = JSON.parse((await getStateAsync(sID_BatterieLadedaten)).val);

        if (Array.isArray(batterieLadedaten) && batterieLadedaten.length > 0) {
            LogProgrammablauf += '27,';
            
            // Gewichtete Summe berechnen
            const ersteGewichtung = batterieLadedaten[0].soc; // Gewichtung des ersten Eintrags
            let gewichteteSumme = 0;
            let gesamtGewichtung = 0;

            batterieLadedaten.forEach((data, index) => {
                const gewicht = index === 0 ? ersteGewichtung : 1;
                gewichteteSumme += data.price * gewicht;
                gesamtGewichtung += gewicht;
            });

            // Durchschnittspreis
            strompreisBatterie = round(gewichteteSumme / gesamtGewichtung, 4);

            // Brutto-Preis nur berechnen, wenn systemwirkungsgrad > 0
            bruttoPreisBatterie = (systemwirkungsgrad > 0)
                ? round(strompreisBatterie * (1 / (systemwirkungsgrad / 100)), 4)
                : strompreisBatterie;

            // Setze State abhängig von bBatteriepreisAktiv
            await setStateAsync(
                sID_StrompreisBatterie,
                bBatteriepreisAktiv ? bruttoPreisBatterie : strompreisBatterie
            );

        } else {
            // Keine Ladedaten vorhanden
            await setStateAsync(sID_StrompreisBatterie, null);
        }
    } catch (error) {
        log(`Fehler in Funktion berechneBattPrice(): ${error.message}`, 'error');
    }
}

// Aktuellen Tibber-Preis aus JSON auslesen (auto-erkennend: 15min oder 60min)
async function getCurrentPrice() {
    try {
        const now = new Date();

        // Globale Variablen zurücksetzen
        aktuellerPreisTibber = null;
        minStrompreis_48h = null;

        // Intervall bestimmen (z. B. 15 oder 60 Minuten)
        const intervalMinutes = detectIntervalMinutes(datenHeute);
        const intervalMs = intervalMinutes * 60 * 1000;

        // Aktuelle Zeit auf gültiges Intervall runden
        const roundedTime = new Date(now);
        const minutes = roundedTime.getMinutes();
        const roundedMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;
        roundedTime.setMinutes(roundedMinutes, 0, 0);

        // Kleine Toleranz für Rundungs- oder Übertragungsabweichungen
        const toleranceMs = Math.min(60 * 1000, intervalMs / 2);

        // Hilfsfunktion zur Preisverarbeitung
        function processData(dataArray) {
            if (!Array.isArray(dataArray)) return;

            for (let entry of dataArray) {
                const startsAt = new Date(entry.startsAt);

                // Niedrigster Preis (48h)
                if (minStrompreis_48h === null || entry.total < minStrompreis_48h) {
                    minStrompreis_48h = entry.total;
                }

                // Preis für aktuelles Intervall finden
                if (Math.abs(startsAt.getTime() - roundedTime.getTime()) < toleranceMs) {
                    aktuellerPreisTibber = entry.total;
                }
            }
        }

        // Heute und ggf. Morgen-Daten prüfen
        processData(datenHeute);
        processData(datenMorgen);

        // Fallback: falls kein Treffer, nächsten Eintrag mit nächstliegender Zeit nehmen
        if (aktuellerPreisTibber === null && Array.isArray(datenHeute)) {
            const sorted = datenHeute
                .map(e => ({ ...e, t: new Date(e.startsAt).getTime() }))
                .sort((a, b) => Math.abs(a.t - now.getTime()) - Math.abs(b.t - now.getTime()));
            if (sorted.length > 0) aktuellerPreisTibber = sorted[0].total;
        }

        return aktuellerPreisTibber;
    } catch (error) {
        log(`Fehler in Funktion getCurrentPrice(): ${error.message}`, 'error');
    }
}

// Runden. Parameter float digit, int digits Anzahl der Stellen
function round(value, digits = 2) {
    if (typeof value !== 'number' || isNaN(value)) return 0;
    const factor = Math.pow(10, digits);
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

async function DebugLog(ergebnis,spitzenSchwellwert,pvLeistungAusreichend)
{
    const [prognoseLadezeitBatterie,statusLadenText,statusEntladesperreText,Batterie_SOC,reichweiteBatterie,BatterieLaden,Power_Bat_W,Power_Grid,eAutoLaden,bEntladenSperren] = await Promise.all([
        getStateAsync(sID_ladezeitBatterie),
        getStateAsync(sID_statusLaden),
        getStateAsync(sID_statusEntladesperre),
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
    
    if (DebugAusgabe){log(`************************************************************************************`)}
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
    if (DebugAusgabeDetail){log(`** StatusLaden = ${statusLadenText}`)}
    if (DebugAusgabeDetail){log(`** StatusEntladesperre = ${statusEntladesperreText}`)}
    if (DebugAusgabe){log(`** ProgrammAblauf = ${LogProgrammablauf} `,'warn')}
    if (DebugAusgabe){log(`*******************  Debug LOG Tibber Skript ${scriptVersion} *******************`)}
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
        log("Fehler: 'data' ist leer oder kein Array", "error");
        return; // Funktion beenden, wenn `data` leer oder kein Array ist
    }
    
    if (isNaN(highThreshold) || isNaN(lowThreshold) || isNaN(spitzenschwellwert) || isNaN(systemwirkungsgrad)) {
        log(`function findeergebnisphasen highThreshold oder lowThreshold sind keine gültige Zahl`, 'error');
        return;
    }

    if (highThreshold < lowThreshold) {
        log(`Schwellwert hoher Strompreis ist niedriger als Schwellwert niedriger Strompreis, Schwellwert hoher Strompreis wurde angepasst`, 'warn');
        highThreshold = lowThreshold + 0.1;
    }

    // Intervallzeit (in Minuten) automatisch bestimmen (z.B. 15)
    const intervalMin = detectIntervalMinutes(data);
    const intervalMs = intervalMin * 60 * 1000;

    // Funktion zum Hinzufügen einer Phase in die entsprechende Liste
    function addPhase(phaseList, phase) {
        //log(`phaseList = ${phaseList}`,'warn')
        //log(`phase = ${JSON.stringify(phase)}`,'warn')
        if (phase) {
            // Endzeit um ein Intervall verlängern
            let endTime = new Date(phase.end.getTime() + intervalMs);
            
            // Füge die Phase zur Liste hinzu
            phaseList.push({
                type: phase.type,  // Speichere den Typ der Phase (spitze, hoch, normal, niedrig)
                start: phase.start,
                end: endTime,
                averagePrice: phase.total / phase.intervals,
                startLocale: phase.start.toLocaleString(),
                endLocale: endTime.toLocaleString()
            });
        }
    }

    function getPhaseArray(currentPhase) {
        switch (currentPhase?.type) {
            case 'peak':   return peakPhases;
            case 'high':   return highPhases;
            case 'normal': return normalPhases;
            case 'low':    return lowPhases;
            default:       return null;
        }
    }

    // --- Hauptlogik: Preise durchlaufen ---
    for (let i = 0; i < data.length; i++) {
        const tibberData = data[i];
        const price = tibberData.total ?? tibberData.value ?? tibberData.price ?? 0;
        const startTime = new Date(tibberData.startsAt || tibberData.start || tibberData.time);
        
        if (isNaN(price) || !startTime.getTime()) continue;

        // Spitzenpreisphase
        if (price > spitzenschwellwert) {
            if (currentPhase && currentPhase.type === 'peak') {
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.intervals++;
            } else {
                addPhase(getPhaseArray(currentPhase), currentPhase);
                currentPhase = { type: 'peak', start: startTime, end: startTime, total: price, intervals: 1 };
            }
        }

        // Hochpreisphase
        else if (price > highThreshold && price <= spitzenschwellwert) {
            if (currentPhase && currentPhase.type === 'high') {
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.intervals++;
            } else {
                addPhase(getPhaseArray(currentPhase), currentPhase);
                currentPhase = { type: 'high', start: startTime, end: startTime, total: price, intervals: 1 };
            }
        }

        // Niedrigpreisphase
        else if (price <= lowThreshold) {
            if (currentPhase && currentPhase.type === 'low') {
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.intervals++;
            } else {
                addPhase(getPhaseArray(currentPhase), currentPhase);
                currentPhase = { type: 'low', start: startTime, end: startTime, total: price, intervals: 1 };
            }
        }

        // Normalpreisphase
        else {
            if (currentPhase && currentPhase.type === 'normal') {
                currentPhase.end = startTime;
                currentPhase.total += price;
                currentPhase.intervals++;
            } else {
                addPhase(getPhaseArray(currentPhase), currentPhase);
                currentPhase = { type: 'normal', start: startTime, end: startTime, total: price, intervals: 1 };
            }
        }
    }

    // Letzte Phase hinzufügen
    addPhase(getPhaseArray(currentPhase), currentPhase);
    
    // Alle Phasen zusammenführen und sortieren
    const allePhasen = [...peakPhases, ...highPhases, ...normalPhases, ...lowPhases]
        .sort((a, b) => a.start - b.start);

    // Aktuelle Phase und nächste Phasen bestimmen
    const jetzt = new Date();
    const aktivePhase = allePhasen.find(p => p.start <= jetzt && p.end > jetzt) || null;
    const naechstePhasen = allePhasen.filter(p => p.start > jetzt);

    return { peakPhases, highPhases, normalPhases, lowPhases, aktivePhase, naechstePhasen };
}

// Funktion prüft alle Daten im Array datenTibberLink48h, beginnend mit der aktuellen Uhrzeit bis zu der übergebenen Zeit,
// und ermittelt den günstigsten und teuersten Preis. Wenn der Preisunterschied größer als preisDiff € ist, gibt sie die Zeit zurück,
// ab der der Preis um preisDiff teurer ist.
async function preisUnterschiedPruefen(bisZeit, preisDiff) {
    try {
        LogProgrammablauf += '15,';

        if (!Array.isArray(datenTibberLink48h) || datenTibberLink48h.length === 0) {
            log(`function preisUnterschiedPruefen: datenTibberLink48h ist leer oder kein Array`, 'error');
            return { state: false, peakZeit: null, dauerInStunden: null };
        }

        let aktuelleZeit = new Date();
        let bisZeitDate = new Date(bisZeit);

        // Intervall aus den Daten bestimmen (15/60 Min etc.)
        const intervalMin = detectIntervalMinutes(datenTibberLink48h);
        const intervalMs = intervalMin * 60 * 1000;

        // preisDiff validieren
        preisDiff = parseFloat(preisDiff);
        if (isNaN(preisDiff)) {
            log(`function preisUnterschiedPruefen: preisDiff ist keine gültige Zahl`, 'error');
            return { state: false, peakZeit: null, dauerInStunden: null };
        }
        preisDiff = parseFloat(preisDiff.toFixed(4));

        // Zeitgrenzen prüfen
        const validStartTime = new Date(datenTibberLink48h[0].startsAt);
        const lastStart = new Date(datenTibberLink48h[datenTibberLink48h.length - 1].startsAt);
        const validEndTime = new Date(lastStart.getTime() + intervalMs); // Ende des letzten Intervalls

        if (aktuelleZeit < validStartTime) aktuelleZeit = validStartTime;
        if (bisZeitDate > validEndTime) bisZeitDate = validEndTime;

        // auf Intervallraster nach oben runden für bisZeitDate
        const roundToInterval = (d) => {
            const t = d.getTime();
            const mod = t % intervalMs;
            return new Date(mod === 0 ? t : t + (intervalMs - mod));
        };
        aktuelleZeit = roundToInterval(aktuelleZeit);
        bisZeitDate = roundToInterval(bisZeitDate);

        // Filter auf relevanten Zeitraum
        const gefilterteDaten = datenTibberLink48h.filter(d => {
            const startZeit = new Date(d.startsAt);
            return startZeit >= aktuelleZeit && startZeit <= bisZeitDate;
        });

        if (gefilterteDaten.length === 0) {
            LogProgrammablauf += '15/1,';
            return { state: false, peakZeit: null, dauerInStunden: null };
        }

        // günstigsten und teuersten Preis ermitteln
        let guenstigsterPreis = Infinity, teuersterPreis = -Infinity;
        for (const d of gefilterteDaten) {
            const preis = parseFloat(d.total);
            if (!isNaN(preis)) {
                if (preis < guenstigsterPreis) guenstigsterPreis = preis;
                if (preis > teuersterPreis) teuersterPreis = preis;
            }
        }

        // Peak bereits erreicht?
        if (aktuellerPreisTibber !== null && aktuellerPreisTibber >= teuersterPreis) {
            LogProgrammablauf += '15/2,';
            return { state: false, peakZeit: null, dauerInStunden: null };
        }

        const preisDifferenz = parseFloat((teuersterPreis - guenstigsterPreis).toFixed(4));

        if (preisDifferenz >= preisDiff) {
            LogProgrammablauf += '15/3,';

            const schwelleAb = parseFloat((guenstigsterPreis + preisDiff).toFixed(4));
            const teuererPreisZeitpunkt = gefilterteDaten.find(d => {
                const p = parseFloat(d.total);
                return !isNaN(p) && p >= schwelleAb;
            });

            if (teuererPreisZeitpunkt) {
                LogProgrammablauf += '15/4,';
                let endZeit = null;
                const startIndex = gefilterteDaten.indexOf(teuererPreisZeitpunkt);

                // Ende ist das Ende des zuletzt noch „teuren“ Intervalls: startsAt + interval
                for (let i = startIndex + 1; i < gefilterteDaten.length; i++) {
                    const preis = parseFloat(gefilterteDaten[i].total);
                    const schwelle = parseFloat((teuererPreisZeitpunkt.total - preisDiff).toFixed(4));
                    if (!isNaN(preis) && preis <= schwelle) {
                        // Ende des vorherigen Intervalls (i-1)
                        const prevStart = new Date(gefilterteDaten[i - 1].startsAt).getTime();
                        endZeit = new Date(prevStart + intervalMs);
                        break;
                    }
                }

                if (!endZeit) {
                    // bleibt bis Ende teuer
                    const lastStartG = new Date(gefilterteDaten[gefilterteDaten.length - 1].startsAt).getTime();
                    endZeit = new Date(lastStartG + intervalMs);
                }

                // @ts-ignore
                const stundenDauer = (endZeit - new Date(teuererPreisZeitpunkt.startsAt)) / (1000 * 60 * 60);

                return {
                    state: true,
                    peakZeit: new Date(teuererPreisZeitpunkt.startsAt),
                    dauerInStunden: stundenDauer
                };
            }
        }

        LogProgrammablauf += '15/5,';
        return { state: false, peakZeit: null, dauerInStunden: null };

    } catch (error) {
        log(`Fehler in Funktion preisUnterschiedPruefen(): ${error.message}`, 'error');
        return { state: false, peakZeit: null, dauerInStunden: null };
    }
}

async function loescheAlleTimer(timerID) {
    try {
        const alleTimer = timerID === 'all';

        // Timer-Indices sammeln, die gelöscht werden sollen
        const indicesToDelete = alleTimer
            ? [...Array(timerObjektID.length).keys()]
            : timerObjektID
                .map((id, index) => (id === timerID ? index : -1))
                .filter(index => index !== -1);

        // Timer löschen
        for (const index of indicesToDelete.reverse()) { // reverse, damit Splice sicher ist
            clearTimeout(timerIds[index]);
            timerObjektID.splice(index, 1);
            timerIds.splice(index, 1);
            timerTarget.splice(index, 1);
            timerState.splice(index, 1);
        }

        if (alleTimer){
            await Promise.all([
                setStateAsync(sID_timerAktiv,false),
                setStateAsync(sID_BatterieLaden,false),
                setStateAsync(sID_statusLaden, ``).catch(()=>{}),
                setStateAsync(sID_BatterieEntladesperre,false),
                setStateAsync(sID_statusEntladesperre, ``).catch(()=>{}),
                setStateAsync(sID_eAutoLaden,false)
            ]);
            bBattSperrePrio = false;
        }
        // States zurücksetzen
        if (timerID === 'Laden') {
            await setStateAsync(sID_timerAktiv, false);
            LogProgrammablauf += '30,';
        }
        if (timerID === 'Entladesperre') {
            LogProgrammablauf += '31,';
        }
        if (alleTimer || timerID === 'Auto') {
            LogProgrammablauf += '32,';
        }
        //log(`Timer${alleTimer ? ' alle' : ` '${timerID}'`} gelöscht`, 'warn');
    
    } catch (error) {
        log(`Fehler in loescheAlleTimer: ${error.message}`, 'error');
    }
}

// Schwellwerte automatisch setzen
async function autoPreisanpassung(strompreis) {
    let strompreisNum = parseFloat(strompreis);
    
    if (round(strompreisNum, 2) !== round(strompreisNum, 4)) {
        hoherSchwellwert = round(Math.ceil(strompreisNum * 100) / 100 + 0.04, 2);
    } else {
        hoherSchwellwert = round(strompreisNum + 0.05, 2);
    }

    niedrigerSchwellwert = round(parseFloat(stromgestehungskosten), 2);
    
    bLock = true;
    await setStateAsync(sID_niedrigerSchwellwertStrompreis, niedrigerSchwellwert);
    await setStateAsync(sID_hoherSchwellwertStrompreis, hoherSchwellwert);
    bLock = false;
}

// Wiederholter Abruf mit Timeout bei leeren Daten
async function getParsedStateWithRetry(id, retries = 3, delayMs = 5000) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const state = await getStateAsync(id);
            let val = state?.val;
            if (typeof val === 'string') val = val.trim();

            if (val && val !== 'undefined' && val !== 'null') {
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

    // Optional: return null statt throw, wenn kein Fehler geworfen werden soll
    throw new Error(`Konnte gültige JSON-Daten für ${id} nach ${retries} Versuchen nicht abrufen.`);
}

// Liefert das Zeit-Feld (ISO-String) aus einem Daten-Eintrag.
// Unterstützt gängige Feldnamen: startsAt, start, time, timestamp, dateTime, ...
// Gibt null zurück, wenn nichts gefunden wurde.
function getStartTimeFromEntry(entry) {
    if (!entry) return null;
    if (entry.startsAt) return entry.startsAt;
    if (entry.start) return entry.start;
    if (entry.time) return entry.time;
    if (entry.timestamp) return entry.timestamp;
    if (entry.dateTime) return entry.dateTime;
    // Fallback: versuche erste String-Eigenschaft, die als Datum geparst werden kann
    for (const k of Object.keys(entry)) {
        const v = entry[k];
        if (typeof v === 'string' && !isNaN(Date.parse(v))) return v;
    }
    return null;
}

// Bestimmt die Intervall-Länge (in Minuten) anhand der ersten beiden Einträge.
// Falls nicht bestimmbar, wird 60 Minuten zurückgegeben (Fallback).
function detectIntervalMinutes(data) {
    try {
        if (!Array.isArray(data) || data.length < 2) return 60;
        const s0 = getStartTimeFromEntry(data[0]);
        const s1 = getStartTimeFromEntry(data[1]);
        if (!s0 || !s1) return 60;
        const t0 = new Date(s0).getTime();
        const t1 = new Date(s1).getTime();
        if (isNaN(t0) || isNaN(t1)) return 60;
        const diffMin = Math.round(Math.abs(t1 - t0) / (1000 * 60));
        // Schutz: wenn diff ungewöhnlich klein/ groß -> fallback
        if (diffMin <= 0 || diffMin > 24 * 60) return 60;
        return diffMin;
    } catch (e) {
        // Bei Fehlern fallback auf 60 Minuten
        return 60;
    }
}

const InterrogateSolcast = async (DachFl) => {
    if (DachFl !== 1 && DachFl !== 2) {
        throw new Error('Invalid DachFl value, must be 1 or 2');
    }
    const url = `https://api.solcast.com.au/rooftop_sites/${Resource_Id_Dach[DachFl]}/forecasts?format=json&api_key=${SolcastAPI_key}&hours=24`;
    try {
        const response = await axios.get(url);
        if (response.status >= 200 && response.status <= 206) {
            if (DebugAusgabe) log(`✅ Solcast-Antwort für Dach ${DachFl}: ${response.status}`, "info");
            return response.data;
        } else {
            throw new Error(`HTTP Status = ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Fehler beim Abrufen Solcast Dach ${DachFl}: ${error.message}`);
    }
};

// Summiert die PV-Prognosen beider Dachflächen (je 30 Minuten)
function kombiniereSolcastDaten(dach1, dach2) {
    if (!Array.isArray(dach1) || !Array.isArray(dach2)) {
        throw new Error('Beide Eingaben müssen Arrays sein!');
    }

    const laenge = Math.min(dach1.length, dach2.length);
    const summenArray = [];

    for (let i = 0; i < laenge; i++) {
        const d1 = dach1[i];
        const d2 = dach2[i];
        const periodEnd = new Date(d1.period_end);
        const hourLocal = periodEnd.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

        if (d1.period_end !== d2.period_end) {
            log(`⚠️ Zeitabweichung bei Index ${i}: ${d1.period_end} ≠ ${d2.period_end}`, "warn");
        }

        summenArray.push({
            period_end: d1.period_end,
            hourLocal, // lokale Uhrzeit hinzufügen
            pv_estimate: (d1.pv_estimate || 0) + (d2.pv_estimate || 0),
            pv_estimate10: (d1.pv_estimate10 || 0) + (d2.pv_estimate10 || 0),
            pv_estimate90: (d1.pv_estimate90 || 0) + (d2.pv_estimate90 || 0)
        });
    }

    return summenArray;
}

// Prognose Solcast abrufen.
async function SheduleSolcast() { 
    try {
        if (DebugAusgabe){log("🌅 TibberSkript Starte täglichen Solcast-Abruf...", "warn");}
        let gesamtPrognose = [];

        if (SolcastDachflaechen === 1) {
            const result = await InterrogateSolcast(1);
            gesamtPrognose = result.forecasts.map(entry => ({
                ...entry,
                hourLocal: new Date(entry.period_end).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
            }));
        } else if (SolcastDachflaechen === 2) {
            const [res1, res2] = await Promise.all([InterrogateSolcast(1), InterrogateSolcast(2)]);
            gesamtPrognose = kombiniereSolcastDaten(res1.forecasts, res2.forecasts);
        } else {
            log(`❌ Ungültige Dachflächenzahl: ${SolcastDachflaechen}`, "warn");
            return;
        }
        
        // Prognose speichern
        await setStateAsync(sID_PvSolcastSumme, JSON.stringify(gesamtPrognose), true);
        log(`✅ Solcast-Prognose gespeichert (${gesamtPrognose.length} Einträge)`, "info");

    } catch (err) {
        log(`❌ Fehler in SheduleSolcast(): ${err.message}`, "warn");
    }
}

// ========== ABWEICHUNGSPRÜFUNG ==========
async function pruefeAbweichung() {
    try {
        const prognoseState = await getStateAsync(sID_PvSolcastSumme);
        if (!prognoseState?.val) return log("⚠️ Keine Prognosedaten gefunden", "warn");
        const prognose = JSON.parse(prognoseState.val);

        const jetzt = new Date();

        // Prognosewerte bis aktuelle Uhrzeit summieren
        const prognoseBisJetzt = prognose.filter(p => new Date(p.period_end) <= jetzt);
        const prognoseSumme_kWh = prognoseBisJetzt.reduce((sum, e) => sum + (e.pv_estimate * 0.5), 0); // 0.5h = 30min

        // Ist-Leistung (Tagesertrag bisher)
        const istState = await getStateAsync(sID_PV_Leistung_Tag_kWh);
        const istSumme_kWh = istState?.val || 0;
        
        pvAbweichung_kWh = istSumme_kWh - prognoseSumme_kWh;
        if (DebugAusgabe){log(`🔍 Prognose bis jetzt: ${prognoseSumme_kWh.toFixed(2)} kWh | Ist: ${istSumme_kWh.toFixed(2)} kWh | Δ=${pvAbweichung_kWh.toFixed(2)} kWh`, "warn");}
                
    } catch (err) {
        log(`❌ Fehler in pruefeAbweichung(): ${err.message}`, "warn");
    }
}

//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************

// Event-Handler für Änderungen an Tibber-User-Parametern
const regexPatternTibber = new RegExp(`${PfadEbene1}\\.${PfadEbene2[3]}`);

on({ id: regexPatternTibber, change: "ne" }, async function (obj) {
    if (bLock) return;
    bLock = true;

    // Lock nach kurzer Verzögerung freigeben
    setTimeout(() => { bLock = false; }, 100);

    const param = obj.id.split('.')[4];
    const val = obj.state.val;

    log(`-==== User Parameter ${param} wurde in ${val} geändert ====-`, 'warn');

    // Mapping: State ID → Variable aktualisieren
    const idMapping = {
        [sID_maxSoC]: v => maxBatterieSoC = parseFloat(v),
        [sID_maxLadeleistungUser_W]: v => maxLadeleistungUser_W = parseFloat(v),
        [sID_hoherSchwellwertStrompreis]: v => hoherSchwellwert = parseFloat(v),
        [sID_niedrigerSchwellwertStrompreis]: v => niedrigerSchwellwert = parseFloat(v),
        [sID_Schneebedeckt]: v => bSchneeBedeckt = Boolean(v),
        [sID_autPreisanpassung]: v => bAutPreisanpassung = Boolean(v),
        [sID_Systemwirkungsgrad]: v => systemwirkungsgrad = parseFloat(v),
        [sID_BatteriepreisAktiv]: v => bBatteriepreisAktiv = Boolean(v),
        [sID_Stromgestehungskosten]: v => stromgestehungskosten = parseFloat(v),
        [sID_ScriptAktiv]: v => bScriptAktiv = Boolean(v),
    };

    if (idMapping[obj.id]) idMapping[obj.id](val);

    // Spezielle Aktionen für bestimmte Parameter
    if (param === 'automPreisanpassung' && val === true) {
        await autoPreisanpassung(minStrompreis_48h);
    }

    if (param === 'BatteriepreisAktiv') {
        await berechneBattPrice();
    }

    // Parallele Funktionen ausführen, Fehler einzelner Funktionen loggen
    await Promise.all([
        tibberSteuerungHauskraftwerk().catch(e => log(`Fehler in tibberSteuerungHauskraftwerk: ${e.message}`, 'error')),
        createDiagramm().catch(e => log(`Fehler in createDiagramm: ${e.message}`, 'error'))
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
            const ersteGewichtung = batterieLadedaten[1]?.soc - 1 || 1;
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

// Tibber Steuerung alle 10 min. aufrufen.
let scheduleTibber = schedule("*/10 * * * *", async function() {
    if(!bNotstromAktiv){
        await berechneBattPrice();
        await tibberSteuerungHauskraftwerk();
        await createDiagramm();
        
    }else{
        log(`Es wurde auf Notstrom umgeschaltet Script Tibber wurde angehalten und muss neu gestartet werden`,'error')
        await Promise.all([
            setStateAsync(sID_BatterieLaden, false),
            setStateAsync(sID_statusLaden, ``).catch(()=>{}),
            setStateAsync(sID_BatterieEntladesperre, false),
            setStateAsync(sID_statusEntladesperre, ``).catch(()=>{}),
            setStateAsync(sID_eAutoLaden, false)
        ]);
        clearSchedule(scheduleTibber);
    }
});

//Bei Scriptende alle Timer löschen
onStop(async function () { 
    loescheAlleTimer('all')
    await setStateAsync(sID_statusLaden, ``).catch(()=>{})
    await setStateAsync(sID_statusEntladesperre, ``).catch(()=>{})
    log(`-==== Alle Timer beendet ====-`)
}, 100);

// ========== ZEITSTEUERUNG ==========
schedule("0 4 * * *", async () => {   // jeden Tag um 04:00 Uhr
    await SheduleSolcast();
});

schedule("0 10-17 * * *", async () => { // stündlich 10:00–17:00
    await pruefeAbweichung();
});

// Bei Sonnenaufgang Merker zurücksetzen
schedule('{"time":{"exactTime":true,"start":"sunrise"},"period":{"days":1}}', function () { 
    log(`Merker bReichweiteSunrise wurde auf false gesetzt`)
    bReichweiteSunrise = false
});

ScriptStart();