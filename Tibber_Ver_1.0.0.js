'use strict';
//------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++++
const instanz = '0_userdata.0';                                                                        	        // Instanz Script Charge-Control
const PfadEbene1 = 'Tibber';                                                                     	            // Pfad innerhalb der Instanz
const tibberDP = `${instanz}.${PfadEbene1}.`;
const PfadEbene2 = ['Anzeige_VIS','OutputSignal','History','USER_ANPASSUNGEN']                		            // Pfad innerhalb PfadEbene1
const DebugAusgabeDetail = true;
//++++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++
//------------------------------------------------------------------------------------------------------

//******************************************************************************************************
//**************************************** Deklaration Variablen ***************************************
//******************************************************************************************************
log('-==== Tibber Script Version 1.0.0 ====-');

// IDs Script Charge_Control
const sIDPrognoseAuto_kWh =`0_userdata.0.Charge_Control.History.PrognoseAuto_kWh_`;
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

// IDs des Adapters TibberLink
const sID_PricesTodayJSON = `tibberlink.0.Homes.9c846e80-68d6-4548-bf3b-d220296216c2.PricesToday.json`          //Strompreise für aktuellen Tag
const sID_PricesTomorrowJSON = `tibberlink.0.Homes.9c846e80-68d6-4548-bf3b-d220296216c2.PricesTomorrow.json`    //Strompreise für nächsten Tag
const sID_LastUpdateJSON = `tibberlink.0.Homes.9c846e80-68d6-4548-bf3b-d220296216c2.PricesToday.lastUpdate`     //Strompreise letztes Update
const sID_CurrentPrice = `tibberlink.0.Homes.9c846e80-68d6-4548-bf3b-d220296216c2.CurrentPrice.total`           //aktueller Strompreis

// IDs des Script Tibber
const sID_BatterieLaden =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`; 
const sID_eAutoLaden = `${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`;
const sID_BatterieEntladesperre =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`; 
const sID_DiagramJosonChart =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`;                            // JSON für Diagramm Tibber Preise in VIS
const sID_maxSoC =`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`; 
const sID_maxLadeleistungUser_W =`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxLadeleistung`; 
const sID_minStrompreis = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.minStrompreis`;
const sID_Schneebedeckt = `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.pvSchneebedeckt`;
const sID_aktuellerEigenverbrauch = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`;
const sID_besteLadezeit = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.besteLadezeit`;
const sID_ladezeitBatterie = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`;
const sID_timerAktiv = `${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`;

let pvPrognoseHeute, pvPrognoseMorgen,job, maxBatterieSoC, aktuelleBatterieSoC_Pro, maxLadeleistungUser_W, minStrompreisUser = 0, schneeBedeckt;
let batterieKapazitaet_kWh, blockpreisTimer = 0,billigsterEinzelpreisBlock = 0, minStrompreis_48h = 0, LogProgrammablauf = "";

let bLock = false;                                                                 

let timerIds = [], timerTarget = [];

//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************
// Alle nötigen Objekt ID's anlegen 
async function createState(){
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.aktuellerEigenverbrauch`, {'def':'', 'name':'Anzeige in VIS durchschnittlicher Eigenverbrauch' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.besteLadezeit`, {'def':'', 'name':'Anzeige in VIS bester Zeitraum um Batterie zu lsden' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.ladezeitBatterie`, {'def': 0, 'name':'Anzeige in VIS Prognose Ladezeit Batterie bei aktuellen Einstellungen' ,'type':'number', 'unit':'h'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.timerAktiv`, {'def':false, 'name':'Anzeige in VIS Status Timer um Batterie zu laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieLaden`, {'def':false, 'name':'Schnittstelle zu Charge-Control laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.eAutoLaden`, {'def':false, 'name':'Schnittstelle zu E3DC_Wallbox Script Auto laden' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.BatterieEntladesperre`, {'def':false, 'name':'Schnittstelle zu Charge-Control Entladesperre' ,'type':'boolean'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.JSON_Chart`, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxLadeleistung`, {'def':0, 'name':'max Ladeleistung mit der die Batterie geladen wird' ,'type':'number', 'unit':'W'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.minStrompreis`, {'def':0.24, 'name':'min Strompreis ab der die Batterie geladen wird' ,'type':'number', 'unit':'€'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.maxSOC_Batterie`, {'def':80, 'name':'max SOC in % der Batterie bis zu dem aus dem Netz geladen werden soll' ,'type':'number', 'unit':'%'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.pvSchneebedeckt`, {'def':false, 'name':'Kann in VIS manuell auf true gesetzt werden,wenn Schnee auf den PV Modulen liegt' ,'type':'boolean'});
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
    [schneeBedeckt,aktuelleBatterieSoC_Pro,maxBatterieSoC, maxLadeleistungUser_W,minStrompreisUser] = await Promise.all([
        getStateAsync(sID_Schneebedeckt),
        getStateAsync(sID_Batterie_SOC),
        getStateAsync(sID_maxSoC),
        getStateAsync(sID_maxLadeleistungUser_W),
        getStateAsync(sID_minStrompreis)
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
    batterieKapazitaet_kWh = batterieKapazitaet_kWh * (entladetiefe_Pro/100);
    batterieKapazitaet_kWh = round(((batterieKapazitaet_kWh/100)*aSOC_Bat_Pro),0);
            
    // Tibber-Steuerung starten
    LogProgrammablauf += '0,';
    tibberSteuerungHauskraftwerk()
    
} 

async function tibberSteuerungHauskraftwerk(){
    try {    
        LogProgrammablauf += '1,';
        const [reichweiteBatterie] = await Promise.all([
            getStateAsync(sID_Autonomiezeit).then(state => state.val)      // Reichweite der Batterie in h und min.
        ]);
        
        const [reichweiteStunden, minuten] = reichweiteBatterie.split(' / ')[1].split(' ')[0].split(':').map(Number);
        // Prüfen, ob die prognostizierte PV-Leistung zum Laden der Batterie innerhalb der Reichweite ausreicht
        const pvLeistungAusreichend = await pruefeReichweiteUndPrognosePVLeistung(reichweiteStunden);
        // Prüfen ob die prognostizierte PV Leistung zum laden der Batterie innerhalb der Reichweite ausreicht und Batterie SOC unter max SOC
        if(!pvLeistungAusreichend && aktuelleBatterieSoC_Pro < maxBatterieSoC){
            LogProgrammablauf += '4,';
            // Günstigsten Preis innerhalb der Reichweite ermitteln
            const dateBesterPreis = await findeGuenstigsteLadezeitInnerhalbReichweite(48,1)
            // Prognose Batterie-SOC am Ende der Reichweite
            const prognoseBattSOC = await prognoseBatterieSOC(reichweiteStunden)
            // benötigte Ladezeit um Batterie wieder auf max. SOC zu laden.
            const LadedauerMaxSOC_h = await berechneLadezeit(prognoseBattSOC)
            // Günstigsten zusammenhängenden Stundenblock finden, der die Ladezeit abdecken kann
            const dateStartLadezeit = await findeGuenstigsteLadezeitInnerhalbReichweite(reichweiteStunden,LadedauerMaxSOC_h)
            // Prüfen ob durchschnitt zusammenhängede Ladezeit Preis und bester 48h Preis unter min. Preis ist
            if(blockpreisTimer > minStrompreisUser && minStrompreis_48h > minStrompreisUser){
                await clearAllTimeouts();
                LogProgrammablauf += '6,';
                DebugLog();
                return;
            }
            // Prüfen ob durchschnitt zusammenhängede Ladezeit Preis unter min. Preis ist sonst Startzeit bester 48h Preis für Timer verwenden.
            const besteLadezeit = blockpreisTimer < minStrompreisUser ? dateStartLadezeit : dateBesterPreis;
            // Prüfen ob die Startzeit vor der Ablaufzeit Timer ist, dann Timer weiterlaufen lassen
            if (timerTarget[1] <= besteLadezeit || timerTarget[1] == null){
                // Alle Timer beenden und neue Zeit setzen
                await clearAllTimeouts();            
                await setStateAtSpecificTime(besteLadezeit,sID_BatterieLaden,true)
                let dateEndLadezeit = new Date(besteLadezeit);
                if(besteLadezeit == dateBesterPreis){
                    dateEndLadezeit.setHours(dateEndLadezeit.getHours() + 1, 0, 0, 0);
                }else{
                    dateEndLadezeit.setHours(dateEndLadezeit.getHours() + LadedauerMaxSOC_h, 0, 0, 0);
                }
                await setStateAtSpecificTime(dateEndLadezeit, sID_BatterieLaden, false);
            }
            


        }else{
            LogProgrammablauf += '5,';
            await clearAllTimeouts();
        }
    
        // Funktion schreiben die den Strommpreis beim laden von der Batterie ermittelt

        // Funktion schreiben die Prüft wann der Preis günstiger ist als der aktuelle und wieviele zusammenhängende Stunden das der Fall ist

        // Funktion schreiben die Prüft ob der aktuelle Preis günstiger ist als der errechnete Batterie Preis mit WR Verlusten (Laden / Entladen der Batterie regeln)

        DebugLog();
    
    
    } catch (error) {
        log(`Fehler in Funktion tibberSteuerungHauskraftwerk: ${error.message}`, 'error');
    }
    
}


// Funktion prüft ob die PV-Leistung von Sonnenaufgang bis Sonnenuntergang ausreicht um die Batterie zu laden
// und innerhalb der Reichweite der Batterie liegt.
async function pruefeReichweiteUndPrognosePVLeistung(rangeHours) {
    try {
        LogProgrammablauf += '2,';
        if(schneeBedeckt){return false;}
        const prognoseBattSOC = await prognoseBatterieSOC(rangeHours)
        // Den aktuellen Batterie-SOC und maxSoC in Prozent abrufen
        const [erwartetePVLeistung_kWh] = await Promise.all([
            getStateAsync(sID_PrognoseBerechnung_kWh_heute).then(state => state.val)
        ]);
     
        // Berechnen der benötigten Energie, um die Batterie auf maxSoC zu laden
        const zuLadendeProzent = maxBatterieSoC - prognoseBattSOC;
        if (zuLadendeProzent <= 0) {
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
        sID_ladezeitBatterie
        await setStateAsync(sID_ladezeitBatterie,Math.ceil(ladezeitStunden));
        return Math.ceil(ladezeitStunden);
    } catch (error) {
        log(`Fehler in Funktion berechneLadezeit: ${error.message}`, 'error');
    }
}


async function setStateAtSpecificTime(targetTime, stateID, wert) {
    const currentTime = new Date(); // Aktuelle Zeit abrufen

    // Überprüfen, ob die Zielzeit bereits vergangen ist und es eine Startzeit ist; wenn ja, sofort Laden
    if (wert && targetTime <= currentTime) {
        await setStateAsync(stateID, true);
        log(`State ${stateID} wurde um ${targetTime.toLocaleTimeString()} auf ${wert} gesetzt.`, 'warn');
        return;
    }

    // @ts-ignore Zeitdifferenz berechnen 
    let timeDiff = targetTime - currentTime;

    // Timeout setzen, um den State nach der Zeitdifferenz zu ändern
    let id = setTimeout(() => {
        setStateAsync(stateID, wert);
        log(`State ${stateID} wurde um ${targetTime.toLocaleTimeString()} auf ${wert} gesetzt.`, 'warn');
    }, timeDiff);

    await setStateAsync(sID_timerAktiv, true);
    timerIds.push(id);
    timerTarget.push(targetTime);
}



// Funktion sucht den günstigsten Preis innerhalb der Reichweite "rangeHours" und für eine zusammenhängende Zeitblock "areaHours"
async function findeGuenstigsteLadezeitInnerhalbReichweite(rangeHours, areaHours) {
    LogProgrammablauf += '3,';
    const [datenHeute, datenMorgen] = await Promise.all([
        getStateAsync(sID_PricesTodayJSON),
        getStateAsync(sID_PricesTomorrowJSON)
    ]).then(states => states.map(state => JSON.parse(state.val)));
    const aktuellerPreis = (await getStateAsync(sID_CurrentPrice)).val
    
    if (!Array.isArray(datenHeute) || !Array.isArray(datenMorgen) || rangeHours <= 0 || areaHours <= 0) {
        throw new Error("Invalid input");
    }

    const preiseTibberArray = [...datenHeute, ...datenMorgen];
    const now = new Date(); // Aktuelle Zeit

    // Variable zur Speicherung des günstigsten Preises und der entsprechenden Zeit
    let billigsterBlockPreis = Infinity;
    let billigsterEinzelpreis = Infinity;
    let billigsteZeit = null;

    // Iteriere durch die Daten und finde den günstigsten zusammenhängenden Stundenblock innerhalb der Reichweite
    for (let i = 0; i < preiseTibberArray.length - areaHours + 1; i++) {
        const startEntry = preiseTibberArray[i];
        const startTime = new Date(startEntry.startsAt);

        // @ts-ignore Berechne den Unterschied in Stunden zur aktuellen Zeit
        const timeDifference = Math.floor((startTime - now) / (1000 * 60 * 60));

        // Prüfe, ob der Startzeitpunkt innerhalb der Reichweite liegt
        if (timeDifference >= 0 && timeDifference < rangeHours) {
            // Berechne die Gesamtkosten für den aktuellen Stundenblock
            let blockPreis = 0;
            for (let j = 0; j < areaHours; j++) {
                const entry = preiseTibberArray[i + j];
                if (entry.total < billigsterEinzelpreis) {
                    billigsterEinzelpreis = entry.total;
                }
                blockPreis += entry.total;
            }

            // Prüfe, ob dieser Block der günstigste ist
            if (blockPreis < billigsterBlockPreis) {
                billigsterBlockPreis = blockPreis;
                billigsteZeit = startTime;
            }else{
                billigsterEinzelpreis = Infinity;
            }
        }
    }

    // Prüfe, ob der aktuelle Preis günstiger ist
    if(areaHours ==1 && rangeHours == 48){minStrompreis_48h = billigsterBlockPreis}else{blockpreisTimer = billigsterBlockPreis / areaHours; billigsterEinzelpreisBlock = billigsterEinzelpreis }
    
    if (aktuellerPreis < blockpreisTimer && areaHours !=1) {
        // Speichere die aktuelle Zeit als Startzeit
        await setStateAsync(sID_besteLadezeit, `Jetzt`);
        return now; // Rückgabe der aktuellen Zeit
    }
    
    // Formatiere die günstigste Zeit in Stunden für VIS Anzeige
    if (billigsteZeit) {
        const tag = billigsteZeit.toLocaleDateString('de-DE', {day:'2-digit',month: '2-digit'});
        const stunden = billigsteZeit.getHours();
        const stundenBis = (stunden + areaHours)%24;
        await setStateAsync(sID_besteLadezeit,`${tag} / ${stunden}:00 - ${stundenBis}:00 Uhr `)
        return billigsteZeit;
    } else {
        return null; // Kein Eintrag innerhalb der Reichweite gefunden
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
    await setStateAsync(sID_timerAktiv,false)
    await setStateAsync(sID_BatterieLaden,false);
    log(`Timer gelöscht`,'warn')
    timerIds.forEach(id => clearTimeout(id));
    timerIds = [];
    timerTarget = [];
}

async function DebugLog()
{
    log(`*******************  Debug LOG Tibber Skript  *******************`)
    if (DebugAusgabeDetail){log(`timerIds1 = ${timerIds[0]} timerIds2 = ${timerIds[1]}`)}
    if (DebugAusgabeDetail){log(`timerTarget1 = ${timerTarget[0]} timerTarget2 = ${timerTarget[1]}`)}
    if (DebugAusgabeDetail){log(`blockpreisTimer = ${blockpreisTimer}`)}
    if (DebugAusgabeDetail){log(`billigsterEinzelpreisBlock = ${billigsterEinzelpreisBlock}`)}
    if (DebugAusgabeDetail){log(`minStrompreis_48h = ${minStrompreis_48h}`)}
    if (DebugAusgabeDetail){log(`minStrompreisUser = ${minStrompreisUser}`)}
    log(`ProgrammAblauf = ${LogProgrammablauf} `,'warn')
    
}


//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************

// Wird aufgerufen wenn sich an den States Tibber.User_Anpassungen was ändert
on({id: /\Tibber.USER_ANPASSUNGEN/, change: "ne"}, async function (obj){	
    if (bLock) return;
    bLock = true;
    setTimeout(() => bLock = false, 100);
    log(`-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-`,'warn')
    if (obj.id.split('.')[4] == 'maxSOC_Batterie' ){maxBatterieSoC = obj.state.val}
    if (obj.id.split('.')[4] == 'maxLadeleistung' ){maxLadeleistungUser_W = obj.state.val}
    if (obj.id.split('.')[4] == 'minStrompreis' ){minStrompreisUser = obj.state.val}
    if (obj.id.split('.')[4] == 'pvSchneebedeckt' ){schneeBedeckt = obj.state.val}
    await tibberSteuerungHauskraftwerk(); 
    await createDiagramm();
});

on({id: sID_Batterie_SOC, change: "ne"}, async function (obj){	
    aktuelleBatterieSoC_Pro = obj.state.val
    if(aktuelleBatterieSoC_Pro >= maxBatterieSoC){
        await clearAllTimeouts();
        await setStateAsync(sID_BatterieLaden,false);
    }
});

// Tibber Steuerung jede Stunde aufrufen.
schedule("0 * * * *", async function() {
    await tibberSteuerungHauskraftwerk(); 
    await createDiagramm();
});

//Bei Scriptende alle Timer löschen
onStop(function () { 
    clearAllTimeouts()
    log(`-==== Alle Timer beendet ====-`)
}, 100);


ScriptStart();