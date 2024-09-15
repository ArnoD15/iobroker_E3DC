'use strict';
//------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++++
const instanz = '0_userdata.0';                                                                        	        // Instanz Script
const PfadEbene1 = 'TibberSkript';                                                                     	        // Pfad innerhalb der Instanz
const PfadEbene2 = ['Anzeige_VIS','OutputSignal','History','USER_ANPASSUNGEN']                		            // Pfad innerhalb PfadEbene1
const DebugAusgabeDetail = true;

//++++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++
//------------------------------------------------------------------------------------------------------

//******************************************************************************************************
//**************************************** Deklaration Variablen ***************************************
//******************************************************************************************************
const scriptVersion = 'Version 1.1.0'
log(`-==== Tibber Skript ${scriptVersion} ====-`);

// IDs Script Charge_Control
const sID_Autonomiezeit =`0_userdata.0.Charge_Control.Allgemein.Autonomiezeit`;
const sID_arrayHausverbrauch =`0_userdata.0.Charge_Control.Allgemein.arrayHausverbrauchDurchschnitt`;
const sID_maxEntladetiefeBatterie =`0_userdata.0.Charge_Control.USER_ANPASSUNGEN.10_maxEntladetiefeBatterie`
const sID_PrognoseBerechnung_kWh_heute =`0_userdata.0.Charge_Control.Allgemein.PrognoseBerechnung_kWh_heute`

// IDs des Adapters e3dc-rscp
const sID_Batterie_SOC =`e3dc-rscp.0.EMS.BAT_SOC`;                                                              // aktueller Batterie_SOC
const sID_Bat_Charge_Limit =`e3dc-rscp.0.EMS.SYS_SPECS.maxBatChargePower`;                                      // Batterie Ladelimit
const sID_SPECIFIED_Battery_Capacity_0 =`e3dc-rscp.0.BAT.BAT_0.SPECIFIED_CAPACITY`;                             // Installierte Batterie Kapazität Batteriekreis 0
const sID_SPECIFIED_Battery_Capacity_1 =`e3dc-rscp.0.BAT.BAT_1.SPECIFIED_CAPACITY`;                             // Installierte Batterie Kapazität Batteriekreis 1
const sID_BAT0_Alterungszustand =`e3dc-rscp.0.BAT.BAT_0.ASOC`;                                                  // Batterie ASOC e3dc-rscp
const sID_Power_Bat_W = `e3dc-rscp.0.EMS.POWER_BAT`;                                                            // aktuelle Batterie_Leistung'
const sID_Power_Grid = `e3dc-rscp.0.EMS.POWER_GRID`                                                             // Leistung aus Netz

// IDs des Adapters TibberLink, Zuweisung in Funktion ScriptStart() wegen persönlicher ID
let sID_PricesTodayJSON
let sID_PricesTomorrowJSON

// IDs des Script Tibber
const sID_aktuellerEigenverbrauch = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`;        // Anzeige in VIS durchschnittlicher Eigenverbrauch
const sID_besteLadezeit = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.besteLadezeit`;                            // Anzeige in VIS bester Zeitraum um Batterie zu laden und Status
const sID_ladezeitBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`;                      // Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen
const sID_timerAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`;                                  // Anzeige in VIS Status Timer um Batterie zu laden
const sID_StrompreisBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`                   // Anzeige in VIS aktueller Strompreis Batterie

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
const sID_BatteriepreisAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.BatteriepreisAktiv`
const sID_TibberLink_ID = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.tibberLinkId`
const sID_Stromgestehungskosten = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.stromgestehungskosten`

let maxBatterieSoC, aktuelleBatterieSoC_Pro, maxLadeleistungUser_W, tibberLinkId, stromgestehungskosten;
let batterieKapazitaet_kWh, billigsterEinzelpreisBlock = 0, billigsterBlockPreis = 0, minStrompreis_48h = null, LogProgrammablauf = "";
let batterieSOC_alt = null, aktuellerPreisTibber = null, preis_alt = null,strompreisBatterie,bruttoPreisBatterie,systemwirkungsgrad, batteriepreisAktiv ;
let hoherSchwellwert, niedrigerSchwellwert;

let bLock = false, bEntladenSperren = false, schneeBedeckt = false;                                                                 

let timerIds = [], timerTarget = [], timerObjektID = [],timerState =[], batterieLadedaten = [], datenHeute = [], datenMorgen = [];
let preisPhasen = { highPhases: [], lowPhases: [] }, spitzenPhasen = { highPhases: [], lowPhases: [] }; 

//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************
// Alle nötigen Objekt ID's anlegen 
async function createState(){
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`, {'def':'', 'name':'Anzeige in VIS durchschnittlicher Eigenverbrauch' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.besteLadezeit`, {'def':'', 'name':'Anzeige in VIS bester Zeitraum um Batterie zu laden und Status' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`, {'def': 0, 'name':'Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen' ,'type':'number', 'unit':'h'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`, {'def':false, 'name':'Anzeige in VIS Status Timer um Batterie zu laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`, {'def': 0, 'name':'Anzeige in VIS aktueller Strompreis Batterie' ,'type':'number', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`, {'def':false, 'name':'Schnittstelle zu Charge-Control laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`, {'def':false, 'name':'Schnittstelle zu E3DC_Wallbox Script Auto laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`, {'def':false, 'name':'Schnittstelle zu Charge-Control Entladesperre' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.BatterieLadedaten`, {'def':[], 'name':'Batterie Start SOC mit Strompreis' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxLadeleistung`, {'def':0, 'name':'max Ladeleistung mit der die Batterie geladen wird' ,'type':'number', 'unit':'W'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.hoherSchwellwertStrompreis`, {'def':0.24, 'name':'Strompreisgrenze für Hochpreisphase' ,'type':'number', 'unit':'€'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.niedrigerSchwellwertStrompreis`, {'def':0.2, 'name':'Strompreisgrenze für Niedrigpreisphase' ,'type':'number', 'unit':'€'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`, {'def':80, 'name':'max SOC in % der Batterie bis zu dem aus dem Netz geladen werden soll' ,'type':'number', 'unit':'%'});
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
    // Erstelle die Objekt IDs
    await createState();    
    log('-==== alle Objekt ID\'s angelegt ====-');
    
    // User Anpassungen parallel abrufen
    [stromgestehungskosten,tibberLinkId, batteriepreisAktiv,batterieLadedaten,systemwirkungsgrad, schneeBedeckt,aktuelleBatterieSoC_Pro,
    maxBatterieSoC, maxLadeleistungUser_W,hoherSchwellwert,niedrigerSchwellwert] = await Promise.all([
        getStateAsync(sID_Stromgestehungskosten),
        getStateAsync(sID_TibberLink_ID),
        getStateAsync(sID_BatteriepreisAktiv),
        getStateAsync(sID_BatterieLadedaten),
        getStateAsync(sID_Systemwirkungsgrad),
        getStateAsync(sID_Schneebedeckt),
        getStateAsync(sID_Batterie_SOC),
        getStateAsync(sID_maxSoC),
        getStateAsync(sID_maxLadeleistungUser_W),
        getStateAsync(sID_hoherSchwellwertStrompreis),
        getStateAsync(sID_niedrigerSchwellwertStrompreis)
    ]).then(states => states.map(state => state.val));
        
    // PV-Prognose und Batteriekapazität parallel abrufen
    const [batteryCapacity0 , entladetiefe_Pro, aSOC_Bat_Pro] = await Promise.all([
        getStateAsync(sID_SPECIFIED_Battery_Capacity_0).then(state => state.val),
        getStateAsync(sID_maxEntladetiefeBatterie).then(state => state.val),
        getStateAsync(sID_BAT0_Alterungszustand).then(state => state.val)
    ]);
    
    if (existsState(sID_SPECIFIED_Battery_Capacity_1)){
        const batteryCapacity1 = (await getStateAsync(sID_SPECIFIED_Battery_Capacity_1)).val
        batterieKapazitaet_kWh = (batteryCapacity0 + batteryCapacity1) / 1000;
    }else{
        batterieKapazitaet_kWh = batteryCapacity0 / 1000;
    }
    
    // IDs des Adapters TibberLink
    sID_PricesTodayJSON = `tibberlink.0.Homes.${tibberLinkId}.PricesToday.json`          //Strompreise für aktuellen Tag
    sID_PricesTomorrowJSON = `tibberlink.0.Homes.${tibberLinkId}.PricesTomorrow.json`    //Strompreise für nächsten Tag
    
    batterieLadedaten = JSON.parse(batterieLadedaten)
    batterieKapazitaet_kWh = batterieKapazitaet_kWh * (entladetiefe_Pro/100);
    batterieKapazitaet_kWh = round(((batterieKapazitaet_kWh/100)*aSOC_Bat_Pro),0);
    LogProgrammablauf += '0,';
    
    // Erstelle das Tibber Diagramm
    await createDiagramm();
    // Entladesperre Batterie prüfen
    await checkAndUpdateEntladenSperren();        
    // Tibber-Steuerung starten
    await tibberSteuerungHauskraftwerk()
} 


async function tibberSteuerungHauskraftwerk() {
    try {    
        const datejetzt = new Date();
        const [reichweite_h, minuten] = (await getStateAsync(sID_Autonomiezeit)).val.split(' / ')[1].split(' ')[0].split(':').map(Number);
        const endZeitBatterie = new Date(datejetzt.getTime() + reichweite_h * 3600000 + minuten * 60000);

        const pvLeistungAusreichend = await pruefePVLeistung(reichweite_h);

        if (!pvLeistungAusreichend && aktuelleBatterieSoC_Pro < maxBatterieSoC) {
            LogProgrammablauf += '3,';
            const daten48h = datenHeute.concat(datenMorgen);
            const preisPhasen = await findePreisPhasen(daten48h, hoherSchwellwert, niedrigerSchwellwert);

            const naechsteNiedrigphase = findeAktuelleOderNaechstePhase(preisPhasen.lowPhases);
            const naechsteHochphase = findeAktuelleOderNaechstePhase(preisPhasen.highPhases);

            // Niedrigpreisphase prüfen und Timer setzen
            await handleNiedrigphase(naechsteNiedrigphase, endZeitBatterie);

            // Hochpreisphase prüfen und Timer setzen
            await handleHochphase(naechsteHochphase, naechsteNiedrigphase, endZeitBatterie, reichweite_h);

            // Spitzenpreisphase prüfen und Timer setzen
            await handleSpitzenphase(naechsteHochphase, reichweite_h, datejetzt, daten48h, hoherSchwellwert);
            
            // Preis zwischen hoch und niedrig Phase und keine PV-Leistung
            if (aktuellerPreisTibber < hoherSchwellwert && aktuellerPreisTibber > niedrigerSchwellwert) {
                log(`naechsteNiedrigphase.Startzeit = ${naechsteNiedrigphase.Startzeit}`,'warn')
                LogProgrammablauf += '6,';
                if (!(await getStateAsync(sID_timerAktiv)).val) {
                    
                    if(naechsteNiedrigphase.Startzeit){
                        LogProgrammablauf += '21,';
                        // @ts-ignore Zeitraum bis zum Ende der Niedrigpreisphase ermitteln
                        
                        const minSchwellwert = (minStrompreis_48h + parseFloat(niedrigerSchwellwert))/2
                        const niedrigPhasen = await findePreisPhasen(daten48h, niedrigerSchwellwert ,minSchwellwert );
                        const naechsteTiefPhasen = findeAktuelleOderNaechstePhase(niedrigPhasen.lowPhases)
                        // @ts-ignore
                        let zeitraum_h = round((naechsteTiefPhasen.Endzeit - datejetzt) / (1000 * 60 * 60),0)
                        
                        // Prüfen ob bereits naechsteTiefPhasen.Startzeit begonnen hat. 
                        if(zeitraum_h < 0){zeitraum_h = 0}
                        const startSOC_pro = await prognoseBatterieSOC(zeitraum_h)
                        
                        // Berechne Ladezeit bis auf Eingestellten max SOC
                        const ladedauer_h = await berechneLadezeit(startSOC_pro)
                        const dateStartLadezeit = new Date(await bestLoadTime(zeitraum_h,ladedauer_h))
                        const dateEndeLadezeit = new Date(dateStartLadezeit.getTime() + ladedauer_h * 60 * 60 * 1000);
                        log(`naechsteNiedrigphase.Startzeit = ${naechsteNiedrigphase.Startzeit} naechsteTiefPhasen.Endzeit = ${naechsteTiefPhasen.Endzeit} zeitraum_h = ${zeitraum_h} dateStartLadezeit = ${dateStartLadezeit} dateEndeLadezeit = ${dateEndeLadezeit}`,'warn')
                        await setStateAtSpecificTime(dateStartLadezeit,sID_BatterieLaden,true)
                        await setStateAtSpecificTime(dateEndeLadezeit,sID_BatterieLaden,false);
                        
                    }else{
                        // Timer für eine Stunde Laden setzen
                        const dateEnde = new Date(datejetzt.getTime() + 60 * 60 * 1000);
                        await setStateAtSpecificTime(datejetzt,sID_BatterieLaden,true)
                        await setStateAtSpecificTime(dateEnde,sID_BatterieLaden,false);
                    }
                    

                }
            }

            // E-Auto Laden prüfen
            await handleEAutoLaden();

        } else {
            await handlePvLadung(aktuelleBatterieSoC_Pro, maxBatterieSoC);
        }

        await DebugLog();
        LogProgrammablauf = '';

    } catch (error) {
        // Fehlerbehandlung zentralisieren
        handleError(error);
    }
}

// Helper-Funktionen für wiederkehrende Muster
async function handleNiedrigphase(naechsteNiedrigphase, endZeitBatterie) {
    if (naechsteNiedrigphase.Startzeit && naechsteNiedrigphase.Startzeit < endZeitBatterie) {
        LogProgrammablauf += '15,';
        await setStateAtSpecificTime(naechsteNiedrigphase.Startzeit, sID_BatterieLaden, true);
        await setStateAtSpecificTime(naechsteNiedrigphase.Endzeit, sID_BatterieLaden, false);
    }
}

async function handleHochphase(naechsteHochphase, naechsteNiedrigphase, endZeitBatterie, reichweite_h) {
    if (naechsteHochphase.Startzeit && naechsteHochphase.Startzeit < naechsteNiedrigphase.Startzeit) {
        if (naechsteHochphase.Startzeit > endZeitBatterie || naechsteHochphase.Endzeit > endZeitBatterie) {
            const dauerHochphase_h = (naechsteHochphase.Endzeit - naechsteHochphase.Startzeit) / (1000 * 60 * 60);
            if (dauerHochphase_h > reichweite_h && aktuellerPreisTibber < hoherSchwellwert) {
                LogProgrammablauf += '16,';
                await setStateAtSpecificTime(new Date(), sID_BatterieEntladesperre, true);
                await setStateAtSpecificTime(naechsteHochphase.Startzeit, sID_BatterieEntladesperre, false);
            }
        }
    }
}

async function handleSpitzenphase(naechsteHochphase, reichweite_h, datejetzt, daten48h, hoherSchwellwert) {
    if (naechsteHochphase.Startzeit <= datejetzt) {
        const DiffStart = round((naechsteHochphase.Endzeit - datejetzt) / (1000 * 60 * 60), 0);
        if (DiffStart > reichweite_h) {
            LogProgrammablauf += '17,';
            const spitzenSchwellwert = round(hoherSchwellwert * (1 / (systemwirkungsgrad / 100)), 4);
            const spitzenPhasen = await findePreisPhasen(daten48h, spitzenSchwellwert, spitzenSchwellwert);
            const naechsteSpitzenphase = findeAktuelleOderNaechstePhase(spitzenPhasen.highPhases);
            if (naechsteSpitzenphase.Startzeit) {
                // @ts-ignore
                const dauerSpitzenphase_h = (naechsteSpitzenphase.Endzeit - naechsteSpitzenphase.Startzeit) / (1000 * 60 * 60);
                const ladedauerUeberbrueckung = await berechneLadezeitBatterie(dauerSpitzenphase_h);

                // @ts-ignore
                const differenzStunden = Math.max(0, Math.floor((naechsteSpitzenphase.Startzeit - datejetzt) / (1000 * 60 * 60)));
                const dateStartLadezeit = new Date(await bestLoadTime(differenzStunden, ladedauerUeberbrueckung));
                const dateEndeLadezeit = new Date(dateStartLadezeit.getTime() + ladedauerUeberbrueckung * 60 * 60 * 1000);
                LogProgrammablauf += '18,';
                await setStateAtSpecificTime(dateStartLadezeit, sID_BatterieLaden, true);
                await setStateAtSpecificTime(dateEndeLadezeit, sID_BatterieLaden, false);
                if (dateEndeLadezeit < naechsteSpitzenphase.Startzeit) {
                    await setStateAtSpecificTime(dateEndeLadezeit, sID_BatterieEntladesperre, true);
                    await setStateAtSpecificTime(naechsteSpitzenphase.Startzeit, sID_BatterieEntladesperre, false);
                }
            }
        }
    }
}

async function handleEAutoLaden() {
    const dateStartLadezeit = new Date();
    LogProgrammablauf += '22,';
    if (aktuellerPreisTibber < hoherSchwellwert) {
        await setStateAtSpecificTime(dateStartLadezeit, sID_eAutoLaden, true);
    } else {
        await setStateAtSpecificTime(dateStartLadezeit, sID_eAutoLaden, false);
    }
}

async function handlePvLadung(aktuelleBatterieSoC_Pro, maxBatterieSoC) {
    LogProgrammablauf += '14,';
    if (aktuelleBatterieSoC_Pro > maxBatterieSoC) {
        await setStateAsync(sID_besteLadezeit, `max SOC erreicht`);
    } else {
        await setStateAsync(sID_besteLadezeit, `Laden mit PV-Leistung`);
    }
}

// Zentralisierte Fehlerbehandlung
function handleError(error) {
    log(`Fehler in Funktion tibberSteuerungHauskraftwerk: ${error.message}`, 'error');
}


// Funktion sucht entweder die aktuelle Phase oder die nächste Phase mit Start- und Endzeit.
function findeAktuelleOderNaechstePhase(arrayPhases) {
    // Aktuelle Zeit
    const jetzt = new Date();
    // Suche nach der aktuell aktiven Phase (Startzeit in der Vergangenheit, Endzeit in der Zukunft)
    const aktuellePhase = arrayPhases
        .find(phase => new Date(phase.start) <= jetzt && new Date(phase.end) > jetzt);
    if (aktuellePhase) {
        return {
            Startzeit: new Date(aktuellePhase.start),
            Endzeit: new Date(aktuellePhase.end)
        };
    }

    // Falls keine aktive Phase gefunden wurde, suche die nächste Phase mit Start- und Endzeit in der Zukunft
    const naechstePhase = arrayPhases
        .filter(phase => new Date(phase.start) > jetzt) // Nur Phasen in der Zukunft @ts-ignore
        //@ts-ignore
        .sort((a, b) => new Date(a.start) - new Date(b.start))[0]; // Sortiere nach Startzeit und wähle die früheste
    if (naechstePhase) {
        return {
            Startzeit: new Date(naechstePhase.start),
            Endzeit: new Date(naechstePhase.end)
        };
    }

    //Falls keine passende Phase gefunden wird, gib null zurück
    return {
        Startzeit: null,
        Endzeit: null
    };
}


// Funktion prüft die Reichweite der Batterie bis zum Sonnenaufgang und ob die Prognose PV-Leistung dann ausreicht.
async function pruefePVLeistung(reichweiteStunden) {
    LogProgrammablauf += '4,';
    
    // Wenn PV-Module Schneebedeckt sind, nicht berechnen
    if(schneeBedeckt){return false;}
    
    const heute = new Date();
    const morgen = new Date(heute);
    morgen.setDate(heute.getDate() + 1);
    
    // PV-Prognose für den heutigen Tag in kWh
    let erwartetePVLeistung_kWh = await getStateAsync(sID_PrognoseBerechnung_kWh_heute).then(state => state.val);

    // Prognose des Batterie SOC nach Ablauf von "reichweiteStunden" in %
    const prognoseBattSOC = await prognoseBatterieSOC(reichweiteStunden);

    // Berechnung der benötigten kWh, um die Batterie nach den gegebenen Stunden aufzuladen
    const benoetigteKapazitaet_kWh = (100 - prognoseBattSOC) / 100 * batterieKapazitaet_kWh;

    // Sonnenaufgangszeit und Sonnenuntergangszeit
    const sunriseEndTimeHeute_ms = getAstroDate("sunriseEnd").getTime();
    const sunsetHeute_ms = getAstroDate("sunset").getTime();
    const sunriseEndTimeMorgen_ms = getAstroDate("sunriseEnd", morgen).getTime();
    
    // Aktuelle Zeit in Millisekunden
    const aktuelleZeit_ms = Date.now();

    // Berechne die gesamte Sonnenzeit in Stunden (Sonnenaufgang bis Sonnenuntergang)
    const gesamteSonnenstunden = (sunsetHeute_ms - sunriseEndTimeHeute_ms) / (1000 * 60 * 60);

    // Berechne die verbleibenden Sonnenstunden ab der aktuellen Zeit bis zum Sonnenuntergang
    const verbleibendeSonnenstunden = (sunsetHeute_ms - aktuelleZeit_ms) / (1000 * 60 * 60);

    // Wenn es nach Sonnenaufgang ist und noch vor Sonnenuntergang
    if (aktuelleZeit_ms >= sunriseEndTimeHeute_ms && aktuelleZeit_ms < sunsetHeute_ms) {
        // Berechne die angepasste PV-Leistung für den Rest des Tages
        erwartetePVLeistung_kWh = (verbleibendeSonnenstunden / gesamteSonnenstunden) * erwartetePVLeistung_kWh;
    }else{
        erwartetePVLeistung_kWh = 0
    }
    
    // Berechne die verbleibende Zeit in Stunden bis zum Sonnenaufgang  (heute und morgen)
    const stundenBisSunriseHeute = (sunriseEndTimeHeute_ms - aktuelleZeit_ms) / (1000 * 60 * 60);
    const stundenBisSunriseMorgen = (sunriseEndTimeMorgen_ms - aktuelleZeit_ms) / (1000 * 60 * 60);

    // Prüfe, ob es vor oder nach Sonnenuntergang ist
    if (aktuelleZeit_ms < sunsetHeute_ms) {
        // Es ist vor Sonnenuntergang: Prüfe nur bis zum Sonnenaufgang heute
        if (reichweiteStunden >= stundenBisSunriseHeute) {
            // Überprüfung: Reicht die angepasste PV-Leistung aus, um die Batterie zu laden?
            if (erwartetePVLeistung_kWh >= benoetigteKapazitaet_kWh) {
                return true; // Die PV-Leistung reicht aus, und die Batterie hält bis zum Sonnenaufgang
            }
        }
    } else {
        // Es ist nach Sonnenuntergang: Prüfe auch bis zum Sonnenaufgang morgen
        if (reichweiteStunden >= stundenBisSunriseMorgen) {
            return true; // Die Batterie hält bis zum Sonnenaufgang + 1 Stunde morgen
        }
    }
    LogProgrammablauf += '2,';
    return false; // Entweder reicht die Batterie-Reichweite nicht, oder die PV-Leistung reicht nicht aus
}

// Funktion berechnet den Batterie SOC nach einer variablen Zeit in h bei einem berechnetem Durchschnittsverbrauch.
async function prognoseBatterieSOC(entladezeitStunden) {
    try {
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

// Funktion berechnet die Ladezeit bis maxSoC bei einem variablen startSOC.Es wird auf volle Stunden aufgerundet.
async function berechneLadezeit(startSOC) {
    try {
        const [maxLadeleistungE3DC_W] = await Promise.all([
            getStateAsync(sID_Bat_Charge_Limit)
        ]).then(states => states.map(state => state.val));
        
        const maxLadeleistung = Math.min(maxLadeleistungUser_W, maxLadeleistungE3DC_W);
        // Differenz zwischen dem aktuellen SoC und dem gewünschten maxSoC berechnen
        const zuLadendeProzent = maxBatterieSoC - startSOC;
  
        if (zuLadendeProzent <= 0) {
            return 0;
        }
        // Berechnung der zu ladenden Kapazität in kWh
        const zuLadendeKapazitaet_kWh = (batterieKapazitaet_kWh * zuLadendeProzent) / 100;
        // Berechnung der Ladezeit in Stunden
        const ladezeitStunden = zuLadendeKapazitaet_kWh / (maxLadeleistung / 1000);
        // Ladezeit in Stunden und Minuten formatieren
        await setStateAsync(sID_ladezeitBatterie,Math.ceil(ladezeitStunden));
        return Math.ceil(ladezeitStunden);
    } catch (error) {
        log(`Fehler in Funktion berechneLadezeit: ${error.message}`, 'error');
    }
}

// Funktion Berechnet die benötigte Ladezeit in Stunden, um eine bestimmte Dauer mit der aktuellen durchschnittlichen 
// Energieverbrauchsrate zu überbrücken, basierend auf der maximalen Ladeleistung des Nutzers.
async function berechneLadezeitBatterie(dauer_h) {
    try {
        // Leistungsdaten vom aktuellen Tag abrufen
        const hausverbrauch = JSON.parse((await getStateAsync(sID_arrayHausverbrauch)).val);

        // Aktuellen Wochentag und Zeitintervall (Tag/Nacht) bestimmen
        const now = new Date();
        const currentDay = now.toLocaleDateString('de-DE', { weekday: 'long' });
        
        const hausverbrauch_day_kWh = hausverbrauch[currentDay]['day'] / 1000;
        const hausverbrauch_night_kWh = hausverbrauch[currentDay]['night'] / 1000;

        // Durchschnittlicher Verbrauch in kWh pro Stunde
        const durchschnittlicherVerbrauch_kWh = (hausverbrauch_day_kWh + hausverbrauch_night_kWh) / 2;

        // Benötigte Energie in kWh für die gegebene Dauer
        const benoetigteEnergie_kWh = round(durchschnittlicherVerbrauch_kWh * dauer_h, 2);

        // Ladeleistung des Nutzers (in kW) ermitteln
        maxLadeleistungUser_W
        const maxLadeleistungUser_kW = maxLadeleistungUser_W / 1000;

        // Ladezeit berechnen (in Stunden)
        const ladezeitInStunden = benoetigteEnergie_kWh / maxLadeleistungUser_kW;

        return Math.ceil(ladezeitInStunden);

    } catch (error) {
        log(`Fehler in Funktion berechneLadezeitBatterie: ${error.message}`, 'error');
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
        LogProgrammablauf += '28,';
        log(`Fehler in function setStateAtSpecificTime,targetTime ist kein date Objekt / targetTime = ${targetTime} `, 'warn')
        return;
    }
    // @ts-ignore Zeitdifferenz berechnen 
    let timeDiff = targetTime - currentTime;
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
    LogProgrammablauf += '10,';
    if(objektID == 'Laden' && state == true){await setStateAsync(sID_timerAktiv, true);}
}

// Funktion sucht den günstigsten Preis über eine zusammenhängende dauer in Stunden "ladezeit_h"
// innerhalb einer Reichweite "reichweite_h" in Stunden
async function bestLoadTime(reichweite_h,ladezeit_h) {
    LogProgrammablauf += '20,';
    const now = new Date(); // Aktuelle Zeit
    [datenHeute, datenMorgen] = await Promise.all([
        getStateAsync(sID_PricesTodayJSON),
        getStateAsync(sID_PricesTomorrowJSON)
    ]).then(states => states.map(state => JSON.parse(state.val)));
    const preiseTibberArray = [...datenHeute, ...datenMorgen];

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
    for (let i = 0; i < preiseTibberArray.length - ladezeit_h + 1; i++) {
        const startEntry = preiseTibberArray[i];
        const startTime = new Date(startEntry.startsAt);

        // @ts-ignore Berechne den Unterschied in Stunden zur aktuellen Zeit
        const timeDifference = Math.floor((startTime - now) / (1000 * 60 * 60));

        // Prüfe, ob der Startzeitpunkt innerhalb der Reichweite liegt
        if (timeDifference >= 0 && timeDifference < reichweite_h) {
            // Berechne die Gesamtkosten für den aktuellen Stundenblock
            let blockPreis = 0;
            for (let j = 0; j < ladezeit_h; j++) {
                const entry = preiseTibberArray[i + j];
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
    minStrompreis_48h = preiseTibberArray.reduce((min, current) => current.total < min ? current.total : min, preiseTibberArray[0].total);
    billigsterBlockPreis = billigsterBlockPreis / ladezeit_h
    
    if (aktuellerPreisTibber < billigsterBlockPreis && aktuellerPreisTibber < hoherSchwellwert) {
        LogProgrammablauf += '11,';
        // Speichere die aktuelle Zeit als Startzeit
        await setStateAsync(sID_besteLadezeit, `Jetzt`);
        return now; // Rückgabe der aktuellen Zeit
    }

    // Formatiere die günstigste Zeit in Stunden für VIS Anzeige
    if (billigsteZeit) {
        LogProgrammablauf += '12,';
        const tag = billigsteZeit.toLocaleDateString('de-DE', {day:'2-digit',month: '2-digit'});
        const stunden = billigsteZeit.getHours();
        const stundenBis = (stunden + ladezeit_h)%24;
        await setStateAsync(sID_besteLadezeit,`${tag} / ${stunden}:00 - ${stundenBis}:00 Uhr `)
        return billigsteZeit;
    } else {
        LogProgrammablauf += '13,';
        return Infinity; // Kein Eintrag innerhalb der Reichweite gefunden
    }
}


async function createDiagramm(){
    // JSON-Daten parsen
    [datenHeute, datenMorgen] = await Promise.all([
        getStateAsync(sID_PricesTodayJSON),
        getStateAsync(sID_PricesTomorrowJSON)
    ]).then(states => states.map(state => JSON.parse(state.val)));
    // Listen für axisLabels und data initialisieren
    const axisLabels = [];
    const dataPoints = [];
    const barDataPoints = [];
    // Hole aktuelle Zeit
    const currentDateTime = new Date();
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
		    }
        ]
    };
    
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
        });
    };

    // Daten heute und morgen extrahieren
    extractData(datenHeute);
    extractData(datenMorgen);
   
    // JSON-Chart erstellen
    diagramJsonChart.axisLabels = axisLabels;
    diagramJsonChart.graphs[0].data = dataPoints;
    diagramJsonChart.graphs[1].data = barDataPoints;
    
    // JSON-Chart speichern
    const outputJsonStr = JSON.stringify(diagramJsonChart, null, 4);
    await setStateAsync(sID_DiagramJosonChart,outputJsonStr)
}

// Funktion zur Überprüfung und Aktualisierung der Entladesperre
async function checkAndUpdateEntladenSperren() {
    // aktuellen Preis Tibber prüfen
    aktuellerPreisTibber = await getCurrentPrice();
    batterieLadedaten = JSON.parse((await getStateAsync(sID_BatterieLadedaten)).val)
    // Wenn es gespeicherte Ladedaten gibt, prüfe den letzten Preis
    if (batterieLadedaten.length > 0 ) {
        LogProgrammablauf += '5,';
        //Durchschnittspreis berechnen
        const gesamt = batterieLadedaten.reduce((summe, eintrag) => summe + eintrag.price, 0);
        strompreisBatterie = round(gesamt / batterieLadedaten.length,4);
        
        // Überprüfe, ob der aktuelle Preis niedriger ist als der Batterie Preis inkl. Ladeverluste
        // alle Kosten, die innerhalb der vorgesehenen Laufzeit (20 Jahre) entstehen addiert, dividiert durch den Ertrag an Solarstrom
        bruttoPreisBatterie = strompreisBatterie != stromgestehungskosten ? round(strompreisBatterie * (1 / (systemwirkungsgrad / 100)),4) : stromgestehungskosten;
        await setStateAsync(sID_StrompreisBatterie, bruttoPreisBatterie);

        if (aktuellerPreisTibber < bruttoPreisBatterie && batteriepreisAktiv) {
            bEntladenSperren = true;
        } else {
            bEntladenSperren = false;
        }
    } else {
        // Wenn keine Daten gespeichert sind, Entladen nicht sperren
        bEntladenSperren = false;
        await setStateAsync(sID_StrompreisBatterie, 0);
    }
    await setStateAsync(sID_BatterieEntladesperre, bEntladenSperren);
}


// aktuellen Tibber Preis aus JSON auslesen
async function getCurrentPrice() {
    LogProgrammablauf += '1,';
    const [dataToday] = await Promise.all([
        getStateAsync(sID_PricesTodayJSON)
    ]).then(states => states.map(state => JSON.parse(state.val)));

    // Hole die aktuelle Uhrzeit und runde auf volle Stunden
    const currentTime = new Date();
    currentTime.setMinutes(0, 0, 0);  // Auf volle Stunde runden
    
    let aktuellerPreisTibber = null;
    minStrompreis_48h = null;  // Setze den niedrigsten Preis zu Beginn auf null

    // Durch das Array dataToday loopen
    for (let entry of dataToday) {
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

// Addiert zum Datum x Tage und liefert das Datum im Format yyyy-mm-dd
function nextDayDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
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

async function DebugLog()
{
    const [prognoseLadezeitBatterie,besteLadezeit,PrognoseBerechnung_kWh_heute,Batterie_SOC,reichweiteBatterie,BatterieLaden,Power_Bat_W,Power_Grid,eAutoLaden] = await Promise.all([
        getStateAsync(sID_ladezeitBatterie),
        getStateAsync(sID_besteLadezeit),
        getStateAsync(sID_PrognoseBerechnung_kWh_heute),
        getStateAsync(sID_Batterie_SOC),
        getStateAsync(sID_Autonomiezeit),
        getStateAsync(sID_BatterieLaden),
        getStateAsync(sID_Power_Bat_W),
        getStateAsync(sID_Power_Grid),
        getStateAsync(sID_eAutoLaden)
    ]).then(states => states.map(state => state.val));
    
    
    log(`*******************  Debug LOG Tibber Skript ${scriptVersion} *******************`)
    if (DebugAusgabeDetail){log(`timerIds1 = ${timerIds[0]}`)}
    if (DebugAusgabeDetail){log(`timerIds2 = ${timerIds[1]}`)}
    if (DebugAusgabeDetail){log(`timerTarget1 = ${timerTarget[0]}`)}
    if (DebugAusgabeDetail){log(`timerTarget2 = ${timerTarget[1]}`)}
    if (DebugAusgabeDetail){log(`besteLadezeit = ${besteLadezeit}`)}
    if (DebugAusgabeDetail){log(`billigsterEinzelpreisBlock = ${billigsterEinzelpreisBlock}`)}
    if (DebugAusgabeDetail){log(`billigsterBlockPreis = ${billigsterBlockPreis}`)}
    if (DebugAusgabeDetail){log(`minStrompreis_48h = ${minStrompreis_48h}`)}
    if (DebugAusgabeDetail){log(`Schwellwert hoher Strompreis = ${hoherSchwellwert}`)}
    if (DebugAusgabeDetail){log(`Schwellwert niedriger Strompreis = ${niedrigerSchwellwert}`)}
    if (DebugAusgabeDetail){log(`schneeBedeckt = ${schneeBedeckt}`)}
    if (DebugAusgabeDetail){log(`PrognoseBerechnung_kWh_heute = ${PrognoseBerechnung_kWh_heute}`)}
    if (DebugAusgabeDetail){log(`batterieKapazitaet_kWh = ${batterieKapazitaet_kWh}`)}
    if (DebugAusgabeDetail){log(`Batterie_SOC = ${Batterie_SOC}`)}
    if (DebugAusgabeDetail){log(`prognoseLadezeitBatterie = ${prognoseLadezeitBatterie}`)}
    if (DebugAusgabeDetail){log(`reichweiteBatterie = ${reichweiteBatterie}`)}
    if (DebugAusgabeDetail){log(`batteriepreisAktiv = ${batteriepreisAktiv}`)}
    if (DebugAusgabeDetail){log(`strompreisBatterie = ${strompreisBatterie}`)}
    if (DebugAusgabeDetail){log(`bruttoPreisBatterie = ${bruttoPreisBatterie}`)}
    if (DebugAusgabeDetail){log(`aktuellerPreisTibber = ${aktuellerPreisTibber}`)}
    if (DebugAusgabeDetail){log(`bEntladenSperren = ${bEntladenSperren}`)}
    if (DebugAusgabeDetail){log(`BatterieLaden = ${BatterieLaden}`)}
    if (DebugAusgabeDetail){log(`Power_Bat_W = ${Power_Bat_W}`)}
    if (DebugAusgabeDetail){log(`Power_Grid = ${Power_Grid}`)}
    if (DebugAusgabeDetail){log(`eAutoLaden = ${eAutoLaden}`)}
    if (DebugAusgabeDetail){log(`Hochpreisphasen: ${JSON.stringify(preisPhasen.highPhases)}`)}
    if (DebugAusgabeDetail){log(`Niedrigpreisphasen: ${JSON.stringify(preisPhasen.lowPhases)}`)}
    log(`ProgrammAblauf = ${LogProgrammablauf} `,'warn')
    
}

// Funktion sucht im array data Preise über und unter dem Schwellwert und gibt die Startzeit und Endzeit der einzelnen Phasen als array zurück
async function findePreisPhasen(data, highThreshold, lowThreshold) {
    
    let highPhases = [];
    let lowPhases = [];
    let currentPhase = null;
    if(highThreshold < lowThreshold){
        log(`Schwellwert hoher Strompreis ist niedriger als Schwellwert niedriger Strompreis, Schwellwert hoher Strompreis wurde angepasst`,'warn')
        highThreshold = lowThreshold + 0.1
    }
    // Funktion zum Hinzufügen einer Phase in die entsprechende Liste
    function addPhase(phaseList, phase) {
        if (phase) {
            phaseList.push({
                start: phase.start,
                end: phase.end,
                averagePrice: phase.total / phase.hours
            });
        }
    }

    for (let i = 0; i < data.length; i++) {
        let hourData = data[i];
        let price = hourData.total;

        if (price >= highThreshold) {
            // Wenn der Preis hoch ist, füge zur Hochpreis-Phase hinzu
            if (currentPhase && currentPhase.type === 'high') {
                currentPhase.end = hourData.startsAt;
                currentPhase.total += price;
                currentPhase.hours++;
            } else {
                // Falls eine neue Hochpreisphase beginnt
                addPhase(currentPhase && currentPhase.type === 'low' ? lowPhases : highPhases, currentPhase);
                currentPhase = {
                    type: 'high',
                    start: hourData.startsAt,
                    end: hourData.startsAt,
                    total: price,
                    hours: 1
                };
            }
        } else if (price <= lowThreshold) {
            // Wenn der Preis niedrig ist, füge zur Niedrigpreis-Phase hinzu
            if (currentPhase && currentPhase.type === 'low') {
                currentPhase.end = hourData.startsAt;
                currentPhase.total += price;
                currentPhase.hours++;
            } else {
                // Falls eine neue Niedrigpreisphase beginnt
                addPhase(currentPhase && currentPhase.type === 'high' ? highPhases : lowPhases, currentPhase);
                currentPhase = {
                    type: 'low',
                    start: hourData.startsAt,
                    end: hourData.startsAt,
                    total: price,
                    hours: 1
                };
            }
        } else {
            // Wenn der Preis "normal" ist, Phase beenden
            addPhase(currentPhase && currentPhase.type === 'high' ? highPhases : lowPhases, currentPhase);
            currentPhase = null;
        }
    }

    // Letzte Phase hinzufügen, falls vorhanden
    addPhase(currentPhase && currentPhase.type === 'high' ? highPhases : lowPhases, currentPhase);
    LogProgrammablauf += '7,';
    return { highPhases, lowPhases };
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
    if (obj.id.split('.')[4] == 'maxSOC_Batterie' ){maxBatterieSoC = obj.state.val}
    if (obj.id.split('.')[4] == 'maxLadeleistung' ){maxLadeleistungUser_W = obj.state.val}
    if (obj.id.split('.')[4] == 'maxStrompreis' ){hoherSchwellwert = obj.state.val}
    if (obj.id.split('.')[4] == 'pvSchneebedeckt' ){schneeBedeckt = obj.state.val}
    if (obj.id.split('.')[4] == 'Systemwirkungsgrad' ){systemwirkungsgrad = obj.state.val}
    if (obj.id.split('.')[4] == 'BatteriepreisAktiv' ){batteriepreisAktiv = obj.state.val}
    await tibberSteuerungHauskraftwerk(); 
    await createDiagramm();
});

on({id: sID_Batterie_SOC, change: "ne"}, async function (obj){	
    const jetzt = new Date();
    
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
        await setStateAtSpecificTime(jetzt, sID_BatterieLaden, false); 
    }
    
    // Neue Werte schreiben wenn der SOC ansteigt
    if(Power_Grid >= leistungBatterie && BatterieLaden && leistungBatterie > 0){
       if(aktuelleBatterieSoC_Pro > batterieSOC_alt){
            // Aktuellen Preis aus JSON TibberLink auslesen
            aktuellerPreisTibber = await getCurrentPrice();
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


// Tibber Steuerung alle 10 min. aufrufen.
schedule("*/10 * * * *", async function() {
    await checkAndUpdateEntladenSperren();
    await tibberSteuerungHauskraftwerk(); 
    await createDiagramm();
});

//Bei Scriptende alle Timer löschen
onStop(function () { 
    clearAllTimeouts()
    setState(sID_besteLadezeit, ``)
    log(`-==== Alle Timer beendet ====-`)
}, 100);


ScriptStart();