'use strict';
//------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++++
const instanz = '0_userdata.0';                                                                        	        // Instanz Script
const PfadEbene1 = 'TibberSkript';                                                                     	        // Pfad innerhalb der Instanz
const PfadEbene2 = ['Anzeige_VIS','OutputSignal','History','USER_ANPASSUNGEN']                		            // Pfad innerhalb PfadEbene1
const tibberLinkId = '9c846e80-68d6-4548-bf3b-d220296216c2'                                                     // Persönliche ID Adapter TibberLink
const DebugAusgabeDetail = true;
const stromgestehungskosten = 0.1057                                                                            // alle Kosten, die innerhalb der vorgesehenen Laufzeit (20 Jahre) entstehen addiert, dividiert durch den Ertrag an Solarstrom
//++++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++
//------------------------------------------------------------------------------------------------------

//******************************************************************************************************
//**************************************** Deklaration Variablen ***************************************
//******************************************************************************************************
const scriptVersion = 'Version 1.0.6'
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

// IDs des Adapters TibberLink
const sID_PricesTodayJSON = `tibberlink.0.Homes.${tibberLinkId}.PricesToday.json`          //Strompreise für aktuellen Tag
const sID_PricesTomorrowJSON = `tibberlink.0.Homes.${tibberLinkId}.PricesTomorrow.json`    //Strompreise für nächsten Tag
const sID_LastUpdateJSON = `tibberlink.0.Homes.${tibberLinkId}.PricesToday.lastUpdate`     //Strompreise letztes Update

// IDs des Script Tibber
const sID_aktuellerEigenverbrauch = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`;
const sID_besteLadezeit = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.besteLadezeit`;
const sID_ladezeitBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`;
const sID_timerAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`;
const sID_EnergieAusNetzBatterie_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.energieAusNetzBatterie`
const sID_StrompreisBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`

const sID_BatterieLaden =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`; 
const sID_eAutoLaden = `${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`;
const sID_BatterieEntladesperre =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`; 

const sID_DiagramJosonChart =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`;                            // JSON für Diagramm Tibber Preise in VIS
const sID_BatterieLadedaten = `${instanz}.${PfadEbene1}.${PfadEbene2[2]}.BatterieLadedaten`

const sID_maxSoC =`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`; 
const sID_maxLadeleistungUser_W =`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxLadeleistung`; 
const sID_maxStrompreis = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxStrompreis`;
const sID_Schneebedeckt = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.pvSchneebedeckt`;
const sID_Systemwirkungsgrad = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Systemwirkungsgrad`
const sID_BatteriepreisAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.BatteriepreisAktiv`


let maxBatterieSoC, aktuelleBatterieSoC_Pro, maxLadeleistungUser_W, maxStrompreisUser = 0, schneeBedeckt;
let batterieKapazitaet_kWh, billigsterEinzelpreisBlock = 0, billigsterBlockPreis = 0, minStrompreis_48h = 0, LogProgrammablauf = "";
let batterieSOC_alt = null, aktuellerPreisTibber = null, preis_alt = null,strompreisBatterie,bruttoPreisBatterie,systemwirkungsgrad, batteriepreisAktiv ;

let bLock = false, bEntladenSperren = false;                                                                 

let timerIds = [], timerTarget = [], batterieLadedaten = [];

//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************
// Alle nötigen Objekt ID's anlegen 
async function createState(){
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`, {'def':'', 'name':'Anzeige in VIS durchschnittlicher Eigenverbrauch' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.besteLadezeit`, {'def':'', 'name':'Anzeige in VIS bester Zeitraum um Batterie zu lsden' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`, {'def': 0, 'name':'Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen' ,'type':'number', 'unit':'h'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`, {'def':false, 'name':'Anzeige in VIS Status Timer um Batterie zu laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.energieAusNetzBatterie`, {'def': 0, 'name':'Anzeige in VIS Prognose energie aus Netzt Batterie' ,'type':'number', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.strompreisBatterie`, {'def': 0, 'name':'Anzeige in VIS aktueller Strompreis Batterie' ,'type':'number', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`, {'def':false, 'name':'Schnittstelle zu Charge-Control laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`, {'def':false, 'name':'Schnittstelle zu E3DC_Wallbox Script Auto laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`, {'def':false, 'name':'Schnittstelle zu Charge-Control Entladesperre' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.BatterieLadedaten`, {'def':[], 'name':'Batterie Start SOC mit Strompreis' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxLadeleistung`, {'def':0, 'name':'max Ladeleistung mit der die Batterie geladen wird' ,'type':'number', 'unit':'W'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxStrompreis`, {'def':0.24, 'name':'min Strompreis ab der die Batterie geladen wird' ,'type':'number', 'unit':'€'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`, {'def':80, 'name':'max SOC in % der Batterie bis zu dem aus dem Netz geladen werden soll' ,'type':'number', 'unit':'%'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.pvSchneebedeckt`, {'def':false, 'name':'Kann in VIS manuell auf true gesetzt werden,wenn Schnee auf den PV Modulen liegt' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`, {'def':80, 'name':'max SOC in % der Batterie bis zu dem aus dem Netz geladen werden soll' ,'type':'number', 'unit':'%'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Systemwirkungsgrad`, {'def':88, 'name':'max Wirkungsgrad inkl. Batterie' ,'type':'number', 'unit':'%'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.BatteriepreisAktiv`, {'def':false, 'name':'Anwahl in VIS ob Batteriepreis berücksichtigt wird' ,'type':'boolean'});
}

// Wird nur beim Start vom Script aufgerufen
async function ScriptStart()
{
    // Erstelle die Objekt IDs
    await createState();    
    log('-==== alle Objekt ID\'s angelegt ====-');
    // Erstelle das Tibber Diagramm
    await createDiagramm();
    // User Anpassungen parallel abrufen
    [batteriepreisAktiv,batterieLadedaten,systemwirkungsgrad, schneeBedeckt,aktuelleBatterieSoC_Pro,
    maxBatterieSoC, maxLadeleistungUser_W,maxStrompreisUser] = await Promise.all([
        getStateAsync(sID_BatteriepreisAktiv),
        getStateAsync(sID_BatterieLadedaten),
        getStateAsync(sID_Systemwirkungsgrad),
        getStateAsync(sID_Schneebedeckt),
        getStateAsync(sID_Batterie_SOC),
        getStateAsync(sID_maxSoC),
        getStateAsync(sID_maxLadeleistungUser_W),
        getStateAsync(sID_maxStrompreis)
    ]).then(states => states.map(state => state.val));
    batterieLadedaten = JSON.parse(batterieLadedaten)
    
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
    batterieKapazitaet_kWh = batterieKapazitaet_kWh * (entladetiefe_Pro/100);
    batterieKapazitaet_kWh = round(((batterieKapazitaet_kWh/100)*aSOC_Bat_Pro),0);
    // Entladesperre Batterie prüfen
     LogProgrammablauf += '0,';
    await checkAndUpdateEntladenSperren();        
    // Tibber-Steuerung starten
    await tibberSteuerungHauskraftwerk()
    
} 

async function tibberSteuerungHauskraftwerk(){
    try {    
        const [reichweiteBatterie] = await Promise.all([
            getStateAsync(sID_Autonomiezeit).then(state => state.val)      // Reichweite der Batterie in h und min.
        ]);
        
        const [reichweiteStunden, minuten] = reichweiteBatterie.split(' / ')[1].split(' ')[0].split(':').map(Number);
        // Prüfen, ob die prognostizierte PV-Leistung zum Laden der Batterie innerhalb der Reichweite ausreicht
        const pvLeistungAusreichend = await pruefeReichweiteUndPrognosePVLeistung(reichweiteStunden);
        // Prüfen ob die prognostizierte PV Leistung zum laden der Batterie innerhalb der Reichweite ausreicht und Batterie SOC unter max SOC
        if(!pvLeistungAusreichend && aktuelleBatterieSoC_Pro < maxBatterieSoC){
            LogProgrammablauf += '4,';
            // Prognose Batterie-SOC am Ende der Reichweite
            const prognoseBattSOC = await prognoseBatterieSOC(reichweiteStunden)
            // benötigte Ladezeit um Batterie wieder auf max. SOC zu laden.
            const LadedauerMaxSOC_h = await berechneLadezeit(prognoseBattSOC)
            // Günstigsten zusammenhängenden Stundenblock finden, der die Ladezeit abdecken kann
            const dateStartLadezeit = await bestLoadTime(reichweiteStunden,LadedauerMaxSOC_h)
            // Prüfen ob durchschnitt zusammenhängede Ladezeit Preis und bester 48h Preis unter min. Preis ist
            if(billigsterBlockPreis > maxStrompreisUser && minStrompreis_48h > maxStrompreisUser){
                await clearAllTimeouts();
                setStateAsync(sID_besteLadezeit, `über max. Preis`)
                LogProgrammablauf += '6,';
                await DebugLog();
                LogProgrammablauf = '';
                return;
            }
            // Prüfen ob die Startzeit vor der Ablaufzeit Timer ist, dann Timer weiterlaufen lassen
            if (timerTarget[1] <= dateStartLadezeit || timerTarget[1] == null){
                // Alle Timer beenden und neue Zeit setzen
                await clearAllTimeouts();            
                await setStateAtSpecificTime(dateStartLadezeit,sID_BatterieLaden,true)
                let dateEndLadezeit = new Date(dateStartLadezeit);
                dateEndLadezeit.setHours(dateEndLadezeit.getHours() + LadedauerMaxSOC_h, 0, 0, 0);
                await setStateAtSpecificTime(dateEndLadezeit, sID_BatterieLaden, false);
            }
            


        }else{
            LogProgrammablauf += '14,';
            if(aktuelleBatterieSoC_Pro > maxBatterieSoC){
                setStateAsync(sID_besteLadezeit, `max SOC erreicht`)
            }else{
                setStateAsync(sID_besteLadezeit, `PV-Prognose`)
            }
            await clearAllTimeouts();
        }
    
        // Funktion schreiben die den Strommpreis beim laden von der Batterie ermittelt

        // Funktion schreiben die Prüft wann der Preis günstiger ist als der aktuelle und wieviele zusammenhängende Stunden das der Fall ist

        // Funktion schreiben die Prüft ob der aktuelle Preis günstiger ist als der errechnete Batterie Preis mit WR Verlusten (Laden / Entladen der Batterie regeln)

        await DebugLog();
        LogProgrammablauf = '';
    
    } catch (error) {
        //log(`Fehler in Funktion tibberSteuerungHauskraftwerk: ${error.message}`, 'error');
    }
    
}


// Funktion prüft ob die PV-Leistung von Sonnenaufgang bis Sonnenuntergang ausreicht um die Batterie zu laden
// und innerhalb der Reichweite der Batterie liegt.
async function pruefeReichweiteUndPrognosePVLeistung(rangeHours) {
    try {
        LogProgrammablauf += '9,';
        if(schneeBedeckt){return false;}
        const prognoseBattSOC = await prognoseBatterieSOC(rangeHours)
        // Den aktuellen Batterie-SOC und maxSoC in Prozent abrufen
        const [erwartetePVLeistung_kWh] = await Promise.all([
            getStateAsync(sID_PrognoseBerechnung_kWh_heute).then(state => state.val)
        ]);
     
        // Berechnen der benötigten Energie, um die Batterie auf maxSoC zu laden
        const zuLadendeProzent = maxBatterieSoC - prognoseBattSOC;
        if (zuLadendeProzent <= 0) {
            LogProgrammablauf += '2,';
            return true;
        }
        const zuLadendeKapazitaet_kWh = (batterieKapazitaet_kWh * zuLadendeProzent) / 100;

        // Zeiten für Sonnenaufgang und goldene Stunde abrufen und um 2 h korrigieren
        const sunrise = new Date(getAstroDate("sunrise"));
        const goldenHour = new Date(getAstroDate("goldenHour"));
        sunrise.setHours(sunrise.getHours() + 2);
        goldenHour.setHours(goldenHour.getHours() - 2);
        
        // Aktuelle Zeit und Zielzeit berechnen
        const now = new Date();
        const targetTime = new Date(now.getTime() + rangeHours * 60 * 60 * 1000);
        
        // Prüfen, ob der Zielzeitpunkt nach Sonnenaufgang liegt
        if (targetTime < sunrise) {
            return false;
        }
        
        // Prüfen, ob die erwartete PV-Leistung ausreicht, um die Batterie auf maxSoC zu laden
        if (erwartetePVLeistung_kWh >= zuLadendeKapazitaet_kWh ) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        log(`Fehler in Funktion pruefeReichweiteUndPrognosePVLeistung: ${error.message}`, 'error');
        return false;
    }
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

// Setzt Timer Batterie Laden für Startzeit und Endzeit 
async function setStateAtSpecificTime(targetTime, stateID, state) {
    const currentTime = new Date(); // Aktuelle Zeit abrufen
    if (!(targetTime instanceof Date) || isNaN(targetTime.getTime())) {
        LogProgrammablauf += '7,';
        return;
    }
    
    // Überprüfen, ob die Zielzeit bereits vergangen ist und es eine Startzeit ist; wenn ja, sofort Laden
    if (state && targetTime <= currentTime) {
        LogProgrammablauf += '8,';
        await setStateAsync(stateID, true);
        log(`State ${stateID} wurde um ${targetTime.toLocaleTimeString()} auf ${state} gesetzt.`, 'warn');
        timerIds.push(0);
        timerTarget.push(targetTime);
        return;
    }
    LogProgrammablauf += '10,';
    // @ts-ignore Zeitdifferenz berechnen 
    let timeDiff = targetTime - currentTime;

    // Timeout setzen, um den State nach der Zeitdifferenz zu ändern
    let id = setTimeout(() => {
        setStateAsync(stateID, state);
        log(`State ${stateID} wurde um ${targetTime.toLocaleTimeString()} auf ${state} gesetzt.`, 'warn');
    }, timeDiff);

    await setStateAsync(sID_timerAktiv, true);
    timerIds.push(id);
    timerTarget.push(targetTime);
}

// Funktion sucht die günstigste Start Zeit zum laden innerhalb der Reichweite
async function bestLoadTime(reichweite_h,ladezeit_h) {
    LogProgrammablauf += '3,';
    const now = new Date(); // Aktuelle Zeit
    const [datenHeute, datenMorgen] = await Promise.all([
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
    // Wenn die Reichweite 0 ist,  sofort laden wenn der Preis unter UserPreis ist
    if (reichweite_h <= 0 && aktuellerPreisTibber < maxStrompreisUser) {
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
    
    if (aktuellerPreisTibber < billigsterBlockPreis && aktuellerPreisTibber < maxStrompreisUser) {
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
    const [dataToday, dataTomorrow] = await Promise.all([
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
    extractData(dataToday);
    extractData(dataTomorrow);
   
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
    aktuellerPreisTibber = await getCurrentPrice()
    batterieLadedaten = JSON.parse((await getStateAsync(sID_BatterieLadedaten)).val)
    // Wenn es gespeicherte Ladedaten gibt, prüfe den letzten Preis
    if (batterieLadedaten.length > 0 && batteriepreisAktiv) {
        LogProgrammablauf += '5,';
        //strompreisBatterie = batterieLadedaten[batterieLadedaten.length - 1].price;
        //Durchschnittspreis berechnen
        const gesamt = batterieLadedaten.reduce((summe, eintrag) => summe + eintrag.price, 0);
        strompreisBatterie = round(gesamt / batterieLadedaten.length,4);
        
        // Überprüfe, ob der aktuelle Preis niedriger ist als der Batterie Preis inkl. Ladeverluste
        // alle Kosten, die innerhalb der vorgesehenen Laufzeit (20 Jahre) entstehen addiert, dividiert durch den Ertrag an Solarstrom
        bruttoPreisBatterie = strompreisBatterie != stromgestehungskosten ? round(strompreisBatterie * (1 / (systemwirkungsgrad / 100)),4) : stromgestehungskosten;
        await setStateAsync(sID_StrompreisBatterie, bruttoPreisBatterie);

        if (aktuellerPreisTibber < bruttoPreisBatterie) {
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
    
    aktuellerPreisTibber = null;

    // Durch das Array dataToday loopen
    for (let entry of dataToday) {
        // Konvertiere startsAt in ein Date-Objekt
        let startsAt = new Date(entry.startsAt);
        
        // Prüfe, ob die Startzeit mit der aktuellen Stunde übereinstimmt
        if (startsAt.getTime() === currentTime.getTime()) {
            return entry.total;  // Funktion mit dem gefundenen Preis beenden
        }
    }
    // Wenn kein passender Preis gefunden wurde
    return null;
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
    if (DebugAusgabeDetail){log(`maxStrompreisUser = ${maxStrompreisUser}`)}
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
    log(`ProgrammAblauf = ${LogProgrammablauf} `,'warn')
    
}

//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************

// Zähler: Laden Batterie aus Netz erfassen
on({id: sID_Power_Bat_W, change: "ne",valGt: 0}, async function(obj) {
    let [leistungBatterie,BatterieLaden,Power_Grid] = await Promise.all([
        getStateAsync(obj.id),
        getStateAsync(sID_BatterieLaden),
        getStateAsync(sID_Power_Grid)
    ]).then(states => states.map(state => state.val));
    leistungBatterie = Math.abs(leistungBatterie);
    
    if(Power_Grid >= leistungBatterie && BatterieLaden && leistungBatterie > 0){
       if(aktuelleBatterieSoC_Pro > batterieSOC_alt){
            batterieSOC_alt = aktuelleBatterieSoC_Pro
            //preis_alt = aktuellerPreisTibber
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

// Wird aufgerufen wenn sich an den States Tibber.User_Anpassungen was ändert
const regexPatternTibber = new RegExp(`${PfadEbene1}.${PfadEbene2[3]}`);
on({id: regexPatternTibber, change: "ne"}, async function (obj){	
    if (bLock) return;
    bLock = true;
    setTimeout(() => bLock = false, 100);
    log(`-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-`,'warn')
    if (obj.id.split('.')[4] == 'maxSOC_Batterie' ){maxBatterieSoC = obj.state.val}
    if (obj.id.split('.')[4] == 'maxLadeleistung' ){maxLadeleistungUser_W = obj.state.val}
    if (obj.id.split('.')[4] == 'maxStrompreis' ){maxStrompreisUser = obj.state.val}
    if (obj.id.split('.')[4] == 'pvSchneebedeckt' ){schneeBedeckt = obj.state.val}
    if (obj.id.split('.')[4] == 'Systemwirkungsgrad' ){systemwirkungsgrad = obj.state.val}
    if (obj.id.split('.')[4] == 'BatteriepreisAktiv' ){batteriepreisAktiv = obj.state.val}
    await tibberSteuerungHauskraftwerk(); 
    await createDiagramm();
});

on({id: sID_Batterie_SOC, change: "ne"}, async function (obj){	
    aktuelleBatterieSoC_Pro = obj.state.val
    // Alle Werte im Array löschen mit höherem SOC als aktueller SOC
    batterieLadedaten = batterieLadedaten.filter(data => data.soc <= aktuelleBatterieSoC_Pro);
    await setStateAsync(sID_BatterieLadedaten,JSON.stringify(batterieLadedaten));
    if(aktuelleBatterieSoC_Pro >= maxBatterieSoC){
        await clearAllTimeouts();
        await setStateAsync(sID_BatterieLaden,false);
    }
});


// Tibber Steuerung jede Stunde aufrufen.
schedule("0 * * * *", async function() {
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