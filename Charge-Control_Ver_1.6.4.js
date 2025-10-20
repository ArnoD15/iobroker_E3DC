// Anpassung der Funktion berechneReinenHausverbrauch:
//  - Statt nur den berechneten Verbrauchswert zu speichern, wird nun ein Objekt mit { hour, value } gespeichert.
//    Dadurch lassen sich spätere Auswertungen des Verbrauchs nach Stunden realisieren.


'use strict';
// ============================================================================
// ============================ USER ANPASSUNGEN ==============================
// ============================================================================

const LogparserSyntax = true                                                                            // Wenn true wird die LOG Ausgabe an Adapter Logparser angepasst
const instanzE3DC_RSCP = 'e3dc-rscp.0'                                                                 	// Instanz e3dc-rscp Adapter

const instanz = '0_userdata.0';                                                                        	// Instanz Script Charge-Control
const PfadEbene1 = 'Charge_Control';                                                                    // Pfad innerhalb der Instanz
const PfadEbene2 = ['Parameter','Allgemein','History','Proplanta','USER_ANPASSUNGEN']                	// Pfad innerhalb PfadEbene1
const idTibber = `${instanz}.TibberSkript`;                                                             // ObjektID Tibber Skript

const BUFFER_SIZE= 5;                                                                                   // Größe des Buffers für gleitenden Durchschnitt

// ============================================================================
// ======================= ENDE USER ANPASSUNGEN ==============================
// ============================================================================

logChargeControl(`-==== Charge-Control Version 1.6.4 ====-`);

//*************************************** ID's Adapter e3dc.rscp ***************************************
const sID_Power_Home_W =`${instanzE3DC_RSCP}.EMS.POWER_HOME`;                                           // aktueller Hausverbrauch E3DC                                         // Pfad ist abhängig von Variable ScriptHausverbrauch siehe function CheckState()
const sID_Batterie_SOC =`${instanzE3DC_RSCP}.EMS.BAT_SOC`;                                              // aktueller Batterie_SOC
const sID_PvLeistung_E3DC_W =`${instanzE3DC_RSCP}.EMS.POWER_PV`;                                        // aktuelle PV_Leistung
const sID_PvLeistung_ADD_W =`${instanzE3DC_RSCP}.EMS.POWER_ADD`;                                        // Zusätzliche Einspeiser Leistung
const sID_Power_Wallbox_W =`${instanzE3DC_RSCP}.EMS.POWER_WB_ALL`;                                      // aktuelle Wallbox Leistung
const sID_Power_Bat_W = `${instanzE3DC_RSCP}.EMS.POWER_BAT`;                                            // aktuelle Batterie_Leistung'
const sID_Installed_Peak_Power =`${instanzE3DC_RSCP}.EMS.INSTALLED_PEAK_POWER`;                         // Wp der installierten PV Module
const sID_Bat_Discharge_Limit =`${instanzE3DC_RSCP}.EMS.SYS_SPECS.maxBatDischargPower`;                 // Batterie Entladelimit
const sID_Bat_Charge_Limit =`${instanzE3DC_RSCP}.EMS.SYS_SPECS.maxBatChargePower`;                      // Batterie Ladelimit
const sID_Notrom_Status =`${instanzE3DC_RSCP}.EMS.EMERGENCY_POWER_STATUS`;                              // 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
const sID_SPECIFIED_Battery_Capacity_0 =`${instanzE3DC_RSCP}.BAT.BAT_0.SPECIFIED_CAPACITY`;             // Installierte Batterie Kapazität Batteriekreis 0
const sID_SPECIFIED_Battery_Capacity_1 =`${instanzE3DC_RSCP}.BAT.BAT_1.SPECIFIED_CAPACITY`;             // Installierte Batterie Kapazität Batteriekreis 1
const sID_FirmwareVersion =`${instanzE3DC_RSCP}.INFO.SW_RELEASE`;                                       // Aktuelle Virmware Version E3DC
const sID_POWER_LIMITS_USED =`${instanzE3DC_RSCP}.EMS.POWER_LIMITS_USED`;                               // Leistungs-Limits aktiviert
const sID_Manual_Charge_Energy = `${instanzE3DC_RSCP}.EMS.MANUAL_CHARGE_ENERGY`;                        // Manuelle Ladung Batterie aus dem Netz
const sID_SET_POWER_MODE =`${instanzE3DC_RSCP}.EMS.SET_POWER_MODE`;                                     // Lademodus
const sID_SET_POWER_VALUE_W =`${instanzE3DC_RSCP}.EMS.SET_POWER_VALUE`;                                 // Eingestellte Ladeleistung
const sID_Max_wrleistung_W =`${instanzE3DC_RSCP}.EMS.SYS_SPECS.maxAcPower`;                             // Maximale Wechselrichter Leistung
const sID_Einspeiselimit_Pro =`${instanzE3DC_RSCP}.EMS.DERATE_AT_PERCENT_VALUE`;                        // Eingestellte Einspeisegrenze E3DC in Prozent
const sID_BAT0_Alterungszustand =`${instanzE3DC_RSCP}.BAT.BAT_0.ASOC`;                                  // Batterie ASOC e3dc-rscp
const sID_Max_Discharge_Power_W =`${instanzE3DC_RSCP}.EMS.MAX_DISCHARGE_POWER`;                         // Eingestellte maximale Batterie-Entladeleistung. (Variable Einstellung E3DC)
const sID_Max_Charge_Power_W =`${instanzE3DC_RSCP}.EMS.MAX_CHARGE_POWER`;                               // Eingestellte maximale Batterie-Ladeleistung. (Variable Einstellung E3DC)
const sID_DISCHARGE_START_POWER =`${instanzE3DC_RSCP}.EMS.DISCHARGE_START_POWER`;                       // Anfängliche Batterie-Entladeleistung
let sID_PARAM_EP_RESERVE_W =`${instanzE3DC_RSCP}.EP.PARAM_0.PARAM_EP_RESERVE_ENERGY`;                   // Eingestellte Notstrom Reserve E3DC
const sID_Powersave =`${instanzE3DC_RSCP}.EMS.POWERSAVE_ENABLED`;                                       // Powersave Modus
const sID_BattTraining = `${instanzE3DC_RSCP}.EMS.STATUS_9`;                                            // Batterie Training aktiv


//************************************* ID's Skript ChargeControl *************************************
const sID_Saved_Power_W =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Saved_Power_W`;                                                     // Leistung die mit Charge-Control gerettet wurde
const sID_PVErtragLM2 =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Saved_PowerLM2_kWh`;                                                  // Leistungszähler für PV Leistung die mit Charge-Control gerettet wurde
const sID_Automatik_Prognose =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Automatik`;                                                    // Vorwahl in VIS true = automatik false = manuell
const sID_Automatik_Regelung =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Automatik_Regelung`;                                           // Vorwahl in VIS true = automatik false = manuell
const sID_NotstromAusNetz =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.NotstromAusNetz`;                                                 // Vorwahl in VIS true = Notstrom aus Netz nachladen 
const sID_EinstellungAnwahl =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EinstellungAnwahl`;                                             // Vorwahl in VIS Einstellung 1-5
const sID_PVErtragLM0 =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstPvErtragLM0_kWh`;                                                  // Leistungszähler PV-Leistung
const sID_PVErtragLM1 =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstPvErtragLM1_kWh`;                                                  // Leistungszähler zusätzlicher WR (extern)
const sID_PrognoseAnwahl =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseAnwahl`;                                                   // Aktuelle Einstellung welche Prognose für Berechnung verwendet wird
const sID_EigenverbrauchDurchschnitt =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchDurchschnitt`;                           // Anzeige in VIS:Durchschnittlicher Eigenverbrauch Tag / Nacht
const sID_EigenverbrauchTag_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchTag`;                                         // Einstellung täglicher Eigenverbrauch in VIS oder über anderes Script
const sID_HausverbrauchBereinigt_W = `${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Hausverbrauch`;                                         // Reiner Hausverbrauch ohne WB, LW-Pumpe oder Heizstab
const sID_arrayHausverbrauchDurchschnitt = `${instanz}.${PfadEbene1}.${PfadEbene2[1]}.arrayHausverbrauchDurchschnitt`;                  // Array zum speichern vom durchschnittlicher Hausverbrauch ohne WB, LW-Pumpe oder Heizstab
const sID_arrayHausverbrauch = `${instanz}.${PfadEbene1}.${PfadEbene2[1]}.arrayHausverbrauch`;                                          // Array zum speichern der Leistung Hausverbrauch ohne WB, LW-Pumpe oder Heizstab
const sID_AnzeigeHistoryMonat =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistorySelect`;                                               // Vorwahl in VIS: Umschaltung der Monate im View Prognose
const sID_arrayPV_LeistungTag_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.istPV_LeistungTag_kWh`;
const sID_PrognoseProp_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh`;
const sID_PrognoseAuto_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh`;
const sID_PrognoseSolcast90_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast90_kWh`;
const sID_PrognoseSolcast_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast_kWh`;
const sID_Regelbeginn_MEZ =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Regelbeginn_MEZ`;                                                 // Anzeige in VIS: Regelbeginn in MEZ Zeit
const sID_Regelende_MEZ =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Regelende_MEZ`;                                                     // Anzeige in VIS: Regelende in MEZ Zeit
const sID_Ladeende_MEZ =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Ladeende_MEZ`;                                                       // Anzeige in VIS: Ladeende in MEZ Zeit
const sID_Notstrom_min_Proz =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Notstrom_min`;
const sID_Notstrom_sockel_Proz =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Notstrom_sockel`;
const sID_Notstrom_akt =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Notstrom_akt`;
const sID_Autonomiezeit =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Autonomiezeit`;                                                     // Anzeige in VIS: Reichweite der Batterie bei entladung
const sID_AutonomiezeitDurchschnitt =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.AutonomiezeitDurchschnitt`;                             // Anzeige in VIS: Reichweite der Batterie bei entladung
const sID_BatSoc_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Batteriekapazität_kWh`;                                                // Anzeige in VIS: Batteriekapazität in kWh
const sID_FirmwareDate =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.FirmwareDate`;                                                       // Anzeige in VIS: Firmware Datum
const sID_LastFirmwareVersion =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.LastFirmwareVersion`;                                         // Anzeige in VIS: Firmware Version
const sID_out_Akt_Ladeleistung_W=`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Akt_Berechnete_Ladeleistung_W`;                             // Ausgabe der berechneten Ladeleistung um diese in VIS anzuzeigen.
let sID_UntererLadekorridor_W =[],sID_Ladeschwelle_Proz =[],sID_Ladeende_Proz=[],sID_Ladeende2_Proz=[],sID_RegelbeginnOffset=[],sID_RegelendeOffset=[],sID_LadeendeOffset=[],sID_Unload_Proz=[];
for (let i = 0; i <= 5; i++) {
    sID_UntererLadekorridor_W[i] =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.UntererLadekorridor_${i}`;
    sID_Ladeschwelle_Proz[i] =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Ladeschwelle_${i}`;
    sID_Ladeende_Proz[i] =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Ladeende_${i}`;
    sID_Ladeende2_Proz[i] =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Ladeende2_${i}`;
    sID_RegelbeginnOffset[i] =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.RegelbeginnOffset_${i}`;
    sID_RegelendeOffset[i] =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.RegelendeOffset_${i}`;
    sID_LadeendeOffset[i] =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.LadeendeOffset_${i}`;
    sID_Unload_Proz[i] =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Unload_${i}`;
}

const arrayID_Notstrom =[sID_Notstrom_min_Proz,sID_Notstrom_sockel_Proz];
const arrayID_Parameters = [
  [sID_UntererLadekorridor_W[0], sID_Ladeschwelle_Proz[0], sID_Ladeende_Proz[0], sID_Ladeende2_Proz[0], sID_RegelbeginnOffset[0], sID_RegelendeOffset[0], sID_LadeendeOffset[0], sID_Unload_Proz[0]],
  [sID_UntererLadekorridor_W[1], sID_Ladeschwelle_Proz[1], sID_Ladeende_Proz[1], sID_Ladeende2_Proz[1], sID_RegelbeginnOffset[1], sID_RegelendeOffset[1], sID_LadeendeOffset[1], sID_Unload_Proz[1]],
  [sID_UntererLadekorridor_W[2], sID_Ladeschwelle_Proz[2], sID_Ladeende_Proz[2], sID_Ladeende2_Proz[2], sID_RegelbeginnOffset[2], sID_RegelendeOffset[2], sID_LadeendeOffset[2], sID_Unload_Proz[2]],
  [sID_UntererLadekorridor_W[3], sID_Ladeschwelle_Proz[3], sID_Ladeende_Proz[3], sID_Ladeende2_Proz[3], sID_RegelbeginnOffset[3], sID_RegelendeOffset[3], sID_LadeendeOffset[3], sID_Unload_Proz[3]],
  [sID_UntererLadekorridor_W[4], sID_Ladeschwelle_Proz[4], sID_Ladeende_Proz[4], sID_Ladeende2_Proz[4], sID_RegelbeginnOffset[4], sID_RegelendeOffset[4], sID_LadeendeOffset[4], sID_Unload_Proz[4]],
  [sID_UntererLadekorridor_W[5], sID_Ladeschwelle_Proz[5], sID_Ladeende_Proz[5], sID_Ladeende2_Proz[5], sID_RegelbeginnOffset[5], sID_RegelendeOffset[5], sID_LadeendeOffset[5], sID_Unload_Proz[5]],
];
// Flache Liste aller Parameter-IDs erstellen
const allParameterIDs = arrayID_Parameters.flat();

//************************************** Globale Variable ***************************************

// @ts-ignore
const fs = require('fs').promises;
// @ts-ignore
const axios = require('axios');
const MAX_ENTRIES = 480; // 8 Stunden x 3600 Sekunden pro Tag /60 executionInterval

//******************** Globale Variable Array ********************
const idCache = {}
let hausverbrauchBuffer = []; // Buffer für Hausverbrauchswerte
let listeners = [];  // Array zum Speichern aller Listener-Objekte
let homeConsumption ={Montag: { night: [], day: [] },Dienstag: { night: [], day: [] },Mittwoch: { night: [], day: [] },
        Donnerstag: { night: [], day: [] },Freitag: { night: [], day: [] },Samstag: { night: [], day: [] },Sonntag: { night: [], day: [] }
};
let homeAverage ={Montag: { night: [], day: [] },Dienstag: { night: [], day: [] },Mittwoch: { night: [], day: [] },
        Donnerstag: { night: [], day: [] },Freitag: { night: [], day: [] },Samstag: { night: [], day: [] },Sonntag: { night: [], day: [] }
};
let SummePV_Leistung_Tag_kW =[{0:'',1:'',2:'',3:'',4:'',5:'',6:'',7:''},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0}];
let baseUrlsCountrys = {
    "de" : "https://www.proplanta.de/Wetter/profi-wetter.php?SITEID=60&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=0",
    "at" : "https://www.proplanta.de/Wetter-Oesterreich/profi-wetter-at.php?SITEID=70&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=0",
    "ch" : "https://www.proplanta.de/Wetter-Schweiz/profi-wetter-ch.php?SITEID=80&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=0",
};
let arrayPV_LeistungTag_kWh = new Array(32), arrayPrognoseProp_kWh = new Array(32), arrayPrognoseAuto_kWh = new Array(32);
let arrayPrognoseSolcast90_kWh = new Array(32), arrayPrognoseSolcast_kWh = new Array(32);

//******************** Globale Variable zuweisung in Funktion CheckState() ********************
let logflag,sLogPath,bLogAusgabe,bDebugAusgabe,bDebugAusgabeDetail,Offset_sunriseEnd_min,minWertPrognose_kWh,Entladetiefe_Pro;
let Systemwirkungsgrad_Pro,bScriptTibber,bEvcc,country,ProplantaOrt,ProplantaPlz,BewoelkungsgradGrenzwert,bSolcast;
let nModulFlaeche,nWirkungsgradModule,nKorrFaktor,nMinPvLeistungTag_kWh,nMaxPvLeistungTag_kWh;
let SolcastDachflaechen,Resource_Id_Dach=[],SolcastAPI_key,tibberMaxLadeleistungUser_W, startDischargeDefault;
let sID_LeistungHeizstab_W, sID_WallboxLadeLeistung_1_W,sID_WallboxLadeLeistung_2_W,sID_LeistungLW_Pumpe_W; 
let sID_Path_evcc_loadpoint1_charging,sID_Path_evcc_loadpoint2_charging,sID_Path_evcc_mode1, sID_Path_evcc_mode2,sID_Path_ScriptTibber;

//******************************* Globale Variable Time Counter *******************************
let lastDebugLogTime = 0, lastExecutionTime = 0, count0 = 0, count1 = 0, count2 = 0, count3 = 0;
let Timer0 = null, Timer1 = null,Timer2 = null,TimerProplanta= null;
let RE_AstroSolarNoon,LE_AstroSunset,RB_AstroSolarNoon,RE_AstroSolarNoon_alt_milisek,RB_AstroSolarNoon_alt_milisek,Zeit_alt_milisek=0,ZeitE3DC_SetPowerAlt_ms=0;

//******************************* Globale Variable Boolean *******************************
let bStart = true, bM_Notstrom = false, bStoppTriggerParameter = false, bStoppTriggerEinstellungAnwahl =false, bNotstromVerwenden;
let bStatus_Notstrom_SOC=false, bLadenEntladenStoppen= false, bLadenEntladenStoppen_alt=false,bCharging_evcc = false;
let bM_Abriegelung = false, bLadenAufNotstromSOC = false, bHeuteNotstromVerbraucht = false, bCheckConfig = true, bBattTraining = false;
let bNotstromAusNetz, bAutomatikAnwahl, bAutomatikRegelung, bManuelleLadungBatt, bTibberLaden = false, bTibberEntladesperre = false,bRegelungAktiv = false;

//*********************************** Globale Variable ***********************************
let LogProgrammablauf = "", Notstrom_Status,Batterie_SOC_Proz, Speichergroesse_kWh
let Max_wrleistung_W ,InstalliertPeakLeistung, Einspeiselimit_Pro, Einspeiselimit_kWh, maximumLadeleistung_W, Bat_Discharge_Limit_W
let EinstellungAnwahl,PrognoseAnwahl, M_Power=0,M_Power_alt=0,Set_Power_Value_W=0,tibberMaxLadeleistung_W= null;
let Batterie_SOC_alt_Proz=0, Notstrom_SOC_Proz = 0, Summe0 = 0, Summe1 = 0, Summe2 = 0, Summe3 = 0, baseurl, TibberSubscribeID;
let sMode_evcc,nEvcc_Instanz, nEvcc_WB1_Loadpoint, nEvcc_WB2_Loadpoint, hystereseWatt = 2000;

//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************

// Wird nur beim Start vom Script aufgerufen
async function ScriptStart()
{
    await CreateState();
    logChargeControl(`-==== alle Objekt ID\'s angelegt ====-`);
    await CheckState();
    logChargeControl(`-==== alle Objekte ID\'s überprüft ====-`);
    await pruefeAdapterEinstellungen();
    // Proplanta Länderauswahl zuordnen
    baseurl = await baseUrlsCountrys[country];
    
    [homeConsumption, homeAverage, arrayPrognoseAuto_kWh, arrayPrognoseSolcast90_kWh,
        arrayPrognoseProp_kWh, arrayPrognoseSolcast_kWh, arrayPV_LeistungTag_kWh
    ] = (await Promise.all([
        getStateAsync(sID_arrayHausverbrauch),
        getStateAsync(sID_arrayHausverbrauchDurchschnitt),
        getStateAsync(sID_PrognoseAuto_kWh),
        getStateAsync(sID_PrognoseSolcast90_kWh),
        getStateAsync(sID_PrognoseProp_kWh),
        getStateAsync(sID_PrognoseSolcast_kWh),
        getStateAsync(sID_arrayPV_LeistungTag_kWh)
    ])).map(s => JSON.parse(s.val));

    [bAutomatikAnwahl, bAutomatikRegelung, bNotstromAusNetz, Notstrom_Status,PrognoseAnwahl, EinstellungAnwahl, Max_wrleistung_W
    , InstalliertPeakLeistung, Einspeiselimit_Pro, maximumLadeleistung_W, Bat_Discharge_Limit_W, Batterie_SOC_Proz, bBattTraining
    ]= await Promise.all([
        getStateAsync(sID_Automatik_Prognose),      // Vorwahl in VIS true = automatik false = manuell
        getStateAsync(sID_Automatik_Regelung),      // Vorwahl in VIS true = automatik false = manuell
        getStateAsync(sID_NotstromAusNetz),         // Vorwahl in VIS true = Notstrom aus Netz nachladen
        getStateAsync(sID_Notrom_Status),           // 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
        getStateAsync(sID_PrognoseAnwahl),          // Aktuelle Einstellung welche Prognose für Berechnung verwendet wird
        getStateAsync(sID_EinstellungAnwahl),       // Vorwahl in VIS Einstellung 1-5
        getStateAsync(sID_Max_wrleistung_W),        // Maximale Wechselrichter Leistung
        getStateAsync(sID_Installed_Peak_Power),    // Installierte Peak Leistung der PV-Module
        getStateAsync(sID_Einspeiselimit_Pro),      // Einspeiselimit in Prozent
        getStateAsync(sID_Bat_Charge_Limit),        // Maximal mögliche Batterie Ladeleistung
        getStateAsync(sID_Bat_Discharge_Limit),     // Maximal mögliche Batterie Entladeleistung
        getStateAsync(sID_Batterie_SOC),            // Aktueller Batterie SOC
        getStateAsync(sID_BattTraining)             // Batterie Training aktiv
    ]).then(states => states.map(state => state.val));
    Max_wrleistung_W = Max_wrleistung_W - 200;                                         // Maximale Wechselrichter Leistung (Abzüglich 200 W, um die Trägheit der Steuerung auszugleichen)
    Einspeiselimit_kWh = ((InstalliertPeakLeistung/100)*Einspeiselimit_Pro-200)/1000   // Einspeiselimit (Abzüglich 200 W, um die Trägheit der Steuerung auszugleichen)
    
    if (bEvcc) {
        sID_Path_evcc_loadpoint1_charging = `evcc.${nEvcc_Instanz}.loadpoint.${nEvcc_WB1_Loadpoint}.status.charging`
        sID_Path_evcc_loadpoint2_charging = `evcc.${nEvcc_Instanz}.loadpoint.${nEvcc_WB2_Loadpoint}.status.charging`
        sID_Path_evcc_mode1 = `evcc.${nEvcc_Instanz}.loadpoint.${nEvcc_WB1_Loadpoint}.status.mode`
        sID_Path_evcc_mode2 = `evcc.${nEvcc_Instanz}.loadpoint.${nEvcc_WB2_Loadpoint}.status.mode`

        const useID1 = existsObject(sID_Path_evcc_loadpoint1_charging);
        const useID2 = existsObject(sID_Path_evcc_loadpoint2_charging);
        const useID3 = existsObject(sID_Path_evcc_mode1);
        const useID4 = existsObject(sID_Path_evcc_mode2);
    
        if (useID1 || useID2) {
            if (useID1 && !useID2) {
               bCharging_evcc = (await getStateAsync(sID_Path_evcc_loadpoint1_charging)).val;
            } else if (!useID1 && useID2) {
                bCharging_evcc = (await getStateAsync(sID_Path_evcc_loadpoint2_charging)).val;
            } else if (useID1 && useID2) {
                const [val1, val2] = await Promise.all([
                    getStateAsync(sID_Path_evcc_loadpoint1_charging),
                    getStateAsync(sID_Path_evcc_loadpoint2_charging)
                ]).then(states => states.map(state => state.val));
                bCharging_evcc = val1 || val2;
            }
        }
        if (useID3 || useID4) {
            if (useID3 && !useID4) {
               sMode_evcc = (await getStateAsync(sID_Path_evcc_mode1)).val
            } else if (!useID3 && useID4) {
                sMode_evcc = (await getStateAsync(sID_Path_evcc_mode2)).val
            } else {
                const [val3, val4] = await Promise.all([
                    getStateAsync(sID_Path_evcc_mode1),
                    getStateAsync(sID_Path_evcc_mode2)
                ]).then(states => states.map(state => state.val));
                if (val3 == 'pv' && val4 == 'pv') {
                    sMode_evcc = 'pv';
                }
            }    
        }
        
    }
     
    if ((await getStateAsync(sID_Manual_Charge_Energy)).val > 0){bManuelleLadungBatt = true}else{bManuelleLadungBatt = false}
    // Wetterdaten beim Programmstart aktualisieren und Timer starten.
    await Speichergroesse()                                             // aktuell verfügbare Batterie Speichergröße berechnen
    if (bSolcast) {await SheduleSolcast(SolcastDachflaechen);}          // Wetterdaten Solcast abrufen wenn User Variable 30_AbfrageSolcast = true
    await MEZ_Regelzeiten();                                            // RE,RB und Ladeende berechnen
    await Notstromreserve();                                            // Eingestellte Notstromreserve berechnen
    await SheduleProplanta();                                           // Wetterdaten Proplanta abrufen danach wird WetterprognoseAktualisieren() augerufen und ein Timer gestartet.
    bStart = false
    await registerEventHandlers();
    LogProgrammablauf += '0,';
}   

// Alle nötigen Objekt ID's anlegen 
async function CreateState(){
    try {
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Notstrom_min`, {'def':30, 'name':'Speicherreserve in % bei Wintersonnenwende 21.12', 'type':'number', 'role':'value', 'desc':'Speicherreserve in % bei winterminimum', 'unit':'%'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Notstrom_sockel`, {'def':20, 'name':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'type':'number', 'role':'value', 'desc':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'unit':'%'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Autonomiezeit`, {'def':"", 'name':'verbleibende Reichweite der Batterie in h und m', 'type':'string', 'role':'value', 'desc':'verbleibende Reichweite der Batterie in h'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.AutonomiezeitDurchschnitt`, {'def':"", 'name':'Durchschnittliche verbleibende Reichweite der Batterie in h und m', 'type':'string', 'role':'value', 'desc':'verbleibende Reichweite der Batterie in h'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Batteriekapazität_kWh`, {'def':0, 'name':'verbleibende Reichweite der Batterie in kWh', 'type':'number', 'role':'value', 'desc':'verbleibende Reichweite der Batterie in kWh', 'unit':'kWh'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Hausverbrauch`, {'def':0, 'name':'Reiner Hausverbrauch ohne WB, LW-Pumpe oder Heizstab' , 'type':'number', 'role':'value', 'unit':'W'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.arrayHausverbrauchDurchschnitt`, {'def':{"Montag":{"night":100,"day":100},"Dienstag":{"night":100,"day":100},"Mittwoch":{"night":100,"day":100},"Donnerstag":{"night":100,"day":100},"Freitag":{"night":100,"day":100},"Samstag":{"night":100,"day":100},"Sonntag":{"night":100,"day":100}}, 'name':'Merker durchschnittlicher Hausverbrauch ohne Wallbox und Heizstab' , 'type':'string', 'role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.arrayHausverbrauch`, {'def':{"Montag":{"night":[{ "hour": 14, "value": 380 }],"day":[{ "hour": 14, "value": 380 }]},"Dienstag":{"night":[{ "hour": 14, "value": 380 }],"day":[{ "hour": 14, "value": 380 }]},"Mittwoch":{"night":[{ "hour": 14, "value": 380 }],"day":[{ "hour": 14, "value": 380 }]},"Donnerstag":{"night":[{ "hour": 14, "value": 380 }],"day":[{ "hour": 14, "value": 380 }]},"Freitag":{"night":[{ "hour": 14, "value": 380 }],"day":[{ "hour": 14, "value": 380 }]},"Samstag":{"night":[{ "hour": 14, "value": 380 }],"day":[{ "hour": 14, "value": 380 }]},"Sonntag":{"night":[{ "hour": 14, "value": 380 }],"day":[{ "hour": 14, "value": 380 }]}}, 'name':'Merker Leistung Hausverbrauch ohne Wallbox und Heizstab' , 'type':'string', 'role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Notstrom_akt`, {'def':0, 'name':'aktuell berechnete Notstromreserve', 'type':'number', 'role':'value', 'desc':'aktuell berechnete Notstromreserve', 'unit':'%'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EinstellungAnwahl`, {'def':0, 'name':'Aktuell manuell angewählte Einstellung', 'type':'number', 'role':'State'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchTag`, {'def':0, 'name':'min. Eigenverbrauch von 6:00 Uhr bis 19:00 Uhr in kWh', 'type':'number', 'role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Automatik`, {'def':false, 'name':'Bei true werden die Parameter automatisch nach Wetterprognose angepast' , 'type':'boolean', 'role':'State', 'desc':'Automatik Charge-Control ein/aus'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Automatik_Regelung`, {'def':false, 'name':'Bei true ist die Lade Regelung eingeschaltet' , 'type':'boolean', 'role':'State', 'desc':'Automatik Charge-Control ein/aus'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.NotstromAusNetz`, {'def':false, 'name':'Bei true wird aus dem Netz bis Notstrom SOC nachgeladen' , 'type':'boolean', 'role':'State', 'desc':'Notstrom aus Netz nachladen'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseBerechnung_kWh_heute`, {'def':0, 'name':'Prognose für Berechnung' , 'type':'number', 'role':'value', 'unit':'kWh'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Regelbeginn_MEZ`, {'def':'00:00', 'name':'Regelbeginn MEZ', 'type':'string', 'role':'string', 'desc':'Regelbeginn MEZ Zeit', 'unit':'Uhr'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Regelende_MEZ`, {'def':'00:00', 'name':'Regelende MEZ', 'type':'string', 'role':'string', 'desc':'Regelende MEZ Zeit', 'unit':'Uhr'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Ladeende_MEZ`, {'def':'00:00', 'name':'Ladeende MEZ', 'type':'string', 'role':'string', 'desc':'Ladeende MEZ Zeit', 'unit':'Uhr'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Saved_Power_W`, {'def':0, 'name':'Überschuss in W' , 'type':'number', 'role':'value', 'unit':'W'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Saved_PowerLM2_kWh`, {'def':0, 'name':'kWh Leistungsmesser 2' , 'type':'number', 'role':'value', 'unit':'kWh'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstPvErtragLM0_kWh`, {'def':0, 'name':'kWh Leistungsmesser 0 ' , 'type':'number', 'role':'value', 'unit':'kWh'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstPvErtragLM1_kWh`, {'def':0, 'name':'kWh Leistungsmesser 1 ' , 'type':'number', 'role':'value', 'unit':'kWh'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchDurchschnitt`, {'def':'', 'name':'Eigenverbrauch Durchschnitt Tag/Nacht ' , 'type':'string'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseAnwahl`, {'def':0, 'name':'Beide Berechnung nach min. Wert = 0 nur Proplanta=1 nur Solcast=2 Beide Berechnung nach max. Wert=3 Beide Berechnung nach Ø Wert=4 nur Solcast90=5' , 'type':'number', 'role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.FirmwareDate`, {'def':formatDate(new Date(), "DD.MM.YYYY hh:mm:ss"), 'name':'Datum Firmware Update' , 'type':'string', 'role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.LastFirmwareVersion`, {'def':"", 'name':'Alte Frimware Version' , 'type':'string', 'role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Akt_Berechnete_Ladeleistung_W`, {'def':0, 'name':'Aktuell eingestellte ist Ladeleistung in W' , 'type':'number', 'role':'value', 'unit':'W'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON`, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.istPV_LeistungTag_kWh`, {'def':'[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]', 'name':'Array für Summe PV Leistung Tag in kWh' ,'type':'string'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh`, {'def':'[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]', 'name':'Array für Prognose Proplanta PV Leistung Tag in kWh' ,'type':'string'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh`, {'def':'[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]', 'name':'Array für verwendete Prognose im Automatikmodus' ,'type':'string'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast90_kWh`, {'def':'[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]', 'name':'Array für Prognose Solcast PV-Leistung in Kilowatt (kW) 90. Perzentil (hohes Szenario)' ,'type':'string'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast_kWh`, {'def':'[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]', 'name':'Array für Prognose Solcast PV-Leistung in Kilowatt (kW)' ,'type':'string'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistorySelect`, {'def':1, 'name':'Select Menü für materialdesign json chart' ,'type':'number'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`, {'def':'0', 'name':'Aktualisierung Proplanta' ,'type':'string'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`, {'def':NaN, 'name':'Bewölkungsgrad 12 Uhr Proplanta' ,'type':'number'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`, {'def':NaN, 'name':'Bewölkungsgrad 15 Uhr Proplanta' ,'type':'number'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_0`, {'def':0, 'name':'Max Temperatur heute' ,'type':'number', 'unit':'°C'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_1`, {'def':0, 'name':'Max Temperatur Morgen' ,'type':'number', 'unit':'°C'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_2`, {'def':0, 'name':'Max Temperatur Übermorgen' ,'type':'number', 'unit':'°C'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_3`, {'def':0, 'name':'Max Temperatur in vier Tagen' ,'type':'number', 'unit':'°C'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_0`, {'def':0, 'name':'Min Temperatur heute' ,'type':'number', 'unit':'°C'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_1`, {'def':0, 'name':'Min Temperatur Morgen' ,'type':'number', 'unit':'°C'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_2`, {'def':0, 'name':'Min Temperatur Übermorgen' ,'type':'number', 'unit':'°C'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_3`, {'def':0, 'name':'Min Temperatur in vier Tagen' ,'type':'number', 'unit':'°C'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogHistoryLokal`, {'def':false,'name':'History Daten in Lokaler Datei speichern' ,'type':'boolean', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogHistoryPath`, {'def':'','name':'Pfad zur Sicherungsdatei History ' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Path_LeistungHeizstab`, {'def':'','name':'Pfad zu den Leistungswerte Heizstab eintragen ansonsten leer lassen ' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Path_WallboxLadeLeistung_1`, {'def':'','name':'Pfad zu den Leistungswerte Wallbox1 die nicht vom E3DC gesteuert wird eintragen ansonsten leer lassen ' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Path_WallboxLadeLeistung_2`, {'def':'','name':'Pfad zu den Leistungswerte Wallbox2 die nicht vom E3DC gesteuert wird eintragen ansonsten leer lassen ' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Path_LeistungLW_Pumpe`, {'def':'','name':'Pfad zu den Leistungswerte Wärmepumpe eintragen ansonsten leer lassen ' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogAusgabe`, {'def':false,'name':'Zusätzliche allgemeine LOG Ausgaben' ,'type':'boolean', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_DebugAusgabe`, {'def':false,'name':'Debug Ausgabe im LOG zur Fehlersuche' ,'type':'boolean', 'unit':'','role':'State'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_DebugAusgabeDetail`, {'def':false,'name':'Zusätzliche LOG Ausgaben der Lade-Regelung' ,'type':'boolean', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Offset_sunriseEnd`, {'def':60,'name':'Wieviele Minuten nach Sonnenaufgang soll die Notstromreserve noch abdecken' ,'type':'number', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_minWertPrognose_kWh`, {'def':0,'name':'Wenn Prognose nächster Tag > als minWertPrognode_kWh wird die Notstromreserve freigegeben 0=Notstromreserve nicht freigegeben' ,'type':'number', 'unit':'kWh','role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_maxEntladetiefeBatterie`, {'def':90,'name':'Die Entladetiefe der Batterie in % aus den technischen Daten E3DC (beim S10E pro 90%)' ,'type':'number', 'unit':'%','role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Systemwirkungsgrad`, {'def':88,'name':'max. Systemwirkungsgrad inkl. Batterie in % aus den technischen Daten E3DC (beim S10E 88%)' ,'type':'number', 'unit':'%','role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_ScriptTibber`, {'def':false,'name':'Wenn das Script Tibber verwendet wird auf True setzen)' ,'type':'boolean', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_ScriptTibber_Path`, {'def':'0_userdata.0.TibberSkript','name':'Pfad zu ID TibberSkript eintragen ansonsten leer lassen ' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Discharge_Start_Power`, {'def':65,'name':'Einstellung E3DC untere Entladeschwelle W)' ,'type':'number', 'unit':'W','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_evcc`, {'def':false,'name':'Wenn evcc verwendet wird auf True setzen' ,'type':'boolean', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_evcc_Instanz`, {'def':0,'name':'Die Instanz vom evcc Adapter eintragen' ,'type':'number', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_evcc_WB1_Loadpoint`, {'def':0,'name':'Nr EVCC Loadpoint Wallbox 1 eintragen' ,'type':'number', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_evcc_WB2_Loadpoint`, {'def':0,'name':'Nr EVCC Loadpoint Wallbox 2 eintragen' ,'type':'number', 'unit':'','role':'state'});
        
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaCountry`, {'def':'de','name':'Ländercode für Proplanta de,at, ch, fr, it' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaOrt`, {'def':'','name':'Wohnort für Abfrage Wetterdaten Proplanta' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaPlz`, {'def':'','name':'Postleitzahl für Abfrage Wetterdaten Proplanta' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_BewoelkungsgradGrenzwert`, {'def':90,'name':'wird als Umschaltkriterium für die Einstellung 2-5 verwendet' ,'type':'number', 'unit':'%','role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_AbfrageSolcast`, {'def':false,'name':'true = Daten Solcast werden abgerufen false = Daten Solcast werden nicht abgerufen' ,'type':'boolean', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastDachflaechen`, {'def':0,'name':'Aktuell max. zwei Dachflächen möglich' ,'type':'number', 'unit':'Stück','role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastResource_Id_Dach1`, {'def':'','name':'Rooftop 1 Id von der Homepage Solcast' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastResource_Id_Dach2`, {'def':'','name':'Rooftop 2 Id von der Homepage Solcast' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastAPI_key`, {'def':'','name':'API Key von der Homepage Solcast' ,'type':'string', 'unit':'','role':'state'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_ModulFlaeche`, {'def':0,'name':'Installierte Modulfläche in m² (Silizium-Zelle 156x156x60 Zellen x 50 Module)' ,'type':'number', 'unit':'m²','role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_WirkungsgradModule`, {'def':21,'name':'Wirkungsgrad / Effizienzgrad der Solarmodule in % bezogen auf die Globalstrahlung (aktuelle Module haben max. 24 %)' ,'type':'number', 'unit':'%','role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_KorrekturFaktor`, {'def':0,'name':'Korrektur Faktor in Prozent. Reduziert die berechnete Prognose um diese anzugleichen.nKorrFaktor= 0 ohne Korrektur' ,'type':'number', 'unit':'%','role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_minPvLeistungTag_kWh`, {'def':3,'name':'minimal Mögliche PV-Leistung. Wenn Prognose niedriger ist wird mit diesem Wert gerechnet' ,'type':'number', 'unit':'kWh','role':'value'});
        await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_maxPvLeistungTag_kWh`, {'def':105,'name':'max. Mögliche PV-Leistung. Wenn Prognose höher ist wird mit diesem Wert gerechnet' ,'type':'number', 'unit':'kWh','role':'value'});
        for (let i = 0; i <= 31; i++) {
            if(i <=6){
                await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_${i}`, {'def':'0', 'name':'Datum Proplanta' ,'type':'string'});
            }
            if(i <= 5){
                await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.UntererLadekorridor_${i}`, {'def':500, 'name':'Die Ladeleistung soll sich oberhalb dieses Wertes bewegen', 'type':'number', 'role':'value', 'desc':'UntererLadekorridor', 'unit':'W'});
                await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Ladeschwelle_${i}`, {'def':0, 'name':'bis zur dieser Schwelle wird geladen bevor die Regelung beginnt', 'type':'number', 'role':'value', 'desc':'Ladeschwelle', 'unit':'%'});
                await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Ladeende_${i}`, {'def':80, 'name':'Zielwert bis Ende Regelung, dannach wird Ladung auf ladeende2 weiter geregelt', 'type':'number', 'role':'value', 'desc':'Ladeende', 'unit':'%'});
                await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Ladeende2_${i}`, {'def':93, 'name':'ladeende2 kann der Wert abweichend vom Defaultwert 93% gesetzt werden.Muss > ladeende sein', 'type':'number', 'role':'value', 'desc':'Ladeende2', 'unit':'%'});
                await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.RegelbeginnOffset_${i}`, {'def':"02:00", 'name':'Offset Wert start Regelbeginn in min. von solarNoon (höchster Sonnenstand) = 0 ', 'type':'string', 'role':'value', 'desc':'RB_Offset'});
                await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.RegelendeOffset_${i}`, {'def':"02:00", 'name':'Offset Wert ende Regelung in min. von solarNoon (höchster Sonnenstand) = 0 ', 'type':'string', 'role':'value', 'desc':'RE_Offset'});
                await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.LadeendeOffset_${i}`, {'def':"02:00", 'name':'Offset Wert Ladeende in min. von sunset (Sonnenuntergang) = 0 ', 'type':'string', 'role':'value', 'desc':'LE_Offset'});
                await createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Unload_${i}`, {'def':100, 'name':'Zielwert beim entladen.Die ladeschwelle muss < unload sein', 'type':'number', 'role':'value', 'desc':'Unload', 'unit':'%'});
            }
            if (i > 0 && i < 13){
                let n = i.toString().padStart(2,"0");
                createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${n}`, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
            }
        }
    } catch (err) {
        logChargeControl(`Fehler in Funktion CreateState()`, 'error');
    }
}

// Alle User Eingaben prüfen ob Werte eingetragen wurden und Werte zuweisen
async function CheckState() {
    const idUSER_ANPASSUNGEN = `${instanz}.${PfadEbene1}.${PfadEbene2[4]}`;
    const objekte = [
        { id: '10_LogHistoryLokal', varName: 'logflag', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_LogHistoryPath', varName: 'sLogPath', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_Path_LeistungHeizstab', varName: 'sID_LeistungHeizstab_W', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_Path_WallboxLadeLeistung_1', varName: 'sID_WallboxLadeLeistung_1_W', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_Path_WallboxLadeLeistung_2', varName: 'sID_WallboxLadeLeistung_2_W', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_Path_LeistungLW_Pumpe', varName: 'sID_LeistungLW_Pumpe_W', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_LogAusgabe', varName: 'bLogAusgabe', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_DebugAusgabe', varName: 'bDebugAusgabe', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_DebugAusgabeDetail', varName: 'bDebugAusgabeDetail', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_Offset_sunriseEnd', varName: 'Offset_sunriseEnd_min', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_minWertPrognose_kWh', varName: 'minWertPrognose_kWh', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_maxEntladetiefeBatterie', varName: 'Entladetiefe_Pro', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen', min: 0, max: 100, errorMsg: 'Entladetiefe Batterie muss zwischen 0% und 100% sein' },
        { id: '10_Systemwirkungsgrad', varName: 'Systemwirkungsgrad_Pro', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen', min: 0, max: 100, errorMsg: 'Systemwirkungsgrad muss zwischen 0% und 100% sein' },
        { id: '10_ScriptTibber', varName: 'bScriptTibber', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen'},
        { id: '10_ScriptTibber_Path', varName: 'sID_Path_ScriptTibber', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '10_Discharge_Start_Power', varName: 'startDischargeDefault', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen'},
        { id: '10_evcc', varName: 'bEvcc', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen'},
        { id: '10_evcc_Instanz', varName: 'nEvcc_Instanz', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen'},
        { id: '10_evcc_WB1_Loadpoint', varName: 'nEvcc_WB1_Loadpoint', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen'},
        { id: '10_evcc_WB2_Loadpoint', varName: 'nEvcc_WB2_Loadpoint', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen'},
        { id: '20_ProplantaCountry', varName: 'country', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '20_ProplantaOrt', varName: 'ProplantaOrt', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '20_ProplantaPlz', varName: 'ProplantaPlz', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '20_BewoelkungsgradGrenzwert', varName: 'BewoelkungsgradGrenzwert', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '30_AbfrageSolcast', varName: 'bSolcast', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '40_ModulFlaeche', varName: 'nModulFlaeche', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '40_WirkungsgradModule', varName: 'nWirkungsgradModule', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '40_KorrekturFaktor', varName: 'nKorrFaktor', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '40_minPvLeistungTag_kWh', varName: 'nMinPvLeistungTag_kWh', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '40_maxPvLeistungTag_kWh', varName: 'nMaxPvLeistungTag_kWh', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' }
    ];
    const objekteSolcast = [
        { id: '30_SolcastDachflaechen', varName: 'SolcastDachflaechen', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '30_SolcastResource_Id_Dach1', varName: 'Resource_Id_Dach[1]', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '30_SolcastResource_Id_Dach2', varName: 'Resource_Id_Dach[2]', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
        { id: '30_SolcastAPI_key', varName: 'SolcastAPI_key', beschreibung: 'enthält keinen gültigen Wert, bitte prüfen' },
    ];
    const objekteTibber = [
        { id: 'BatterieEntladesperre', varName: 'bTibberEntladesperre', beschreibung: 'enthält keinen gültigen Wert, bitte unter Skripte im ioBroker prüfen ob das TibberSkript läuft' },
        { id: 'BatterieLaden', varName: 'bTibberLaden', beschreibung: 'enthält keinen gültigen Wert, bitte unter Skripte im ioBroker prüfen ob das TibberSkript läuft' },
        { id: 'maxLadeleistung', varName: 'tibberMaxLadeleistungUser_W', beschreibung: 'enthält keinen gültigen Wert, bitte unter Skripte im ioBroker prüfen ob das TibberSkript läuft' },
    ];

    for (const obj of objekte) {
        const state = await getStateAsync(`${idUSER_ANPASSUNGEN}.${obj.id}`);
        if (!state || typeof state.val === 'undefined' || state.val === null) {
            logError(obj.beschreibung, `${idUSER_ANPASSUNGEN}.${obj.id}`);
            continue;
        }

        const value = state.val;
        eval(`${obj.varName} = value`);
    
        if (obj.min !== undefined && (value < obj.min || value > obj.max)) {
            console.error(obj.errorMsg);
        }
    }
    
    if (bScriptTibber) {
        for (const obj of objekteTibber) {
            let state;
            if (obj.id === 'maxLadeleistung') {
                state = await getStateAsync(`${idTibber}.USER_ANPASSUNGEN.${obj.id}`);
            } else {
                state = await getStateAsync(`${idTibber}.OutputSignal.${obj.id}`);
            }

            if (!state || typeof state.val === 'undefined' || state.val === null) {
                logError(obj.beschreibung, `${idTibber}...${obj.id}`);
                continue;
            }

            const value = state.val;
            eval(`${obj.varName} = value`);

            if (obj.min !== undefined && (value < obj.min || value > obj.max)) {
                console.error(obj.errorMsg);
            }
        }
    } else {
        unsubscribe(TibberSubscribeID);
        bTibberEntladesperre = false;
        bTibberLaden = false;
    }
    
    if (bSolcast) {
        for (const obj of objekteSolcast) {
            const state = await getStateAsync(`${idUSER_ANPASSUNGEN}.${obj.id}`);
            if (!state || typeof state.val === 'undefined' || state.val === null) {
                logError(obj.beschreibung, `${idUSER_ANPASSUNGEN}.${obj.id}`);
                continue;
            }

            const value = state.val;
            eval(`${obj.varName} = value`);

            if (obj.min !== undefined && (value < obj.min || value > obj.max)) {
                console.error(obj.errorMsg);
            }
        }

        // Daten von Solcast immer zwischen 04:01 und 04:59 Uhr abholen wenn const Solcast = true
        schedule(`${Math.floor(Math.random() * (59 - 1 + 1)) + 1} 4 * * *`, function () {
            SheduleSolcast(SolcastDachflaechen);
        });
    }

    // Pfadangaben zu den Modulen Modbus und e3dc-rscp überprüfen
    const PruefeID = [
        sID_Batterie_SOC, sID_PvLeistung_E3DC_W, sID_PvLeistung_ADD_W,
        sID_Power_Home_W, sID_Power_Wallbox_W, sID_Bat_Discharge_Limit, sID_Bat_Charge_Limit,
        sID_Notrom_Status, sID_SPECIFIED_Battery_Capacity_0, sID_SET_POWER_MODE, sID_SET_POWER_VALUE_W,
        sID_Max_Discharge_Power_W, sID_Max_Charge_Power_W, sID_Max_wrleistung_W,
        sID_BAT0_Alterungszustand, sID_DISCHARGE_START_POWER, sID_PARAM_EP_RESERVE_W
    ];

    for (const id of PruefeID) {
        if (!(await existsObjectAsync(id))) {
            logError('existiert nicht, bitte prüfen', id);
        }
    }
}

// Aktualisiert die Prognose Werte und das Diagramm PV-Prognosen in VIS
async function WetterprognoseAktualisieren()
{
    try {
        //Prognosen in kWh umrechen
        await Prognosen_Berechnen();
        // Diagramm aktualisieren
        await makeJson();
        // Einstellungen 1-5 je nach Überschuss PV Leistung Wetterprognose und Bewölkung anwählen 
        const ueberschuss = await Ueberschuss_Prozent();
        await Einstellung(ueberschuss);
    } catch (err) {
        logChargeControl(`Fehler in Funktion WetterprognoseAktualisieren(): ${err.message}`, 'error');
    }    
}

// Programmablauf für die Laderegelung der Batterie wird im 3 sek. Takt getriggert
async function Ladesteuerung()
{
    let dAkt = new Date();
    const currentTime = Date.now();
    
    const [
        stateSetPowerMode,
        statePvLeistungE3DC,
        statePvLeistungADD,
        stateWallboxPower,
        stateUntererLadekorridor
    ] = await Promise.all([
        getStateAsync(sID_SET_POWER_MODE),
        getStateAsync(sID_PvLeistung_E3DC_W),
        getStateAsync(sID_PvLeistung_ADD_W),
        getStateAsync(sID_Power_Wallbox_W),
        getStateAsync(sID_UntererLadekorridor_W[EinstellungAnwahl])
    ]);

    const SET_POWER_MODE        = stateSetPowerMode?.val ?? 0;
    const PV_Leistung_E3DC_W    = statePvLeistungE3DC?.val ?? 0;
    const PV_Leistung_ADD_W     = statePvLeistungADD?.val ?? 0;
    const WallboxPower          = stateWallboxPower?.val ?? 0;
    const UntererLadekorridor_W = stateUntererLadekorridor?.val ?? 0;
    
    const Power_Home_W =toInt((await getStateAsync(sID_Power_Home_W)).val + WallboxPower);                          // Aktueller Hausverbrauch + Ladeleistung Wallbox E3DC externe Wallbox ist bereits im Hausverbrauch enthalten. 
    const PV_Leistung_Summe_W = toInt(PV_Leistung_E3DC_W + Math.abs(PV_Leistung_ADD_W));                            // Summe PV-Leistung  
    Notstrom_Status = (await getStateAsync(sID_Notrom_Status)).val;                                                 // aktueller Notstrom Status E3DC 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
    bNotstromVerwenden = await CheckPrognose();                                                                     // Prüfen ob Notstrom verwendet werden kann bei hoher PV Prognose für den nächsten Tag
    
    const newSOC = (await getStateAsync(sID_Batterie_SOC)).val;
    
    // Batterie SOC erst bei -2% oder + 1% oder 0% aktualisieren um Schwankungen der Batterie auszugleichen
    if (newSOC > Batterie_SOC_Proz || Batterie_SOC_Proz - newSOC >= 2 || newSOC == 0) {
        Batterie_SOC_Proz = newSOC;
    }
    
    // === Debug-Logging nur alle 3 Sekunden ===
    if (bDebugAusgabe && (currentTime - lastDebugLogTime >= 3000)) {
        await DebugLog();
        lastDebugLogTime = currentTime;
    }
        
    LogProgrammablauf = "";

    // === Entladesperre prüfen ===
    const jetzt = new Date();
    const vorSonnenuntergang = jetzt < getAstroDate("sunset");

    const darfEntladen =
        Notstrom_Status === 1 || //Notstrom 1 = aktiv
        Notstrom_Status === 4 || //Notstrom 4 = Inselbetrieb
        bNotstromVerwenden ||
        bTibberLaden ||
        bLadenAufNotstromSOC ||
        Batterie_SOC_Proz > Notstrom_SOC_Proz ||
        (PV_Leistung_E3DC_W > 100 && vorSonnenuntergang);
    
    if (darfEntladen){
        // === Entladen ist erlaubt ===
        
        LogProgrammablauf += '1,';
        await EMS(true); // EMS Laden/Entladen aktivieren
        
        // Wenn bNotstromVerwenden einmal true war, wird mit dem Merker bM_Notstrom das Ausschalten der Lade/Enladeleistung bis Sonnenaufgang verhindert
        if (bNotstromVerwenden && !bM_Notstrom){bM_Notstrom = true };
    
    } else if (
        Batterie_SOC_Proz <= Notstrom_SOC_Proz &&
        (
            (new Date() > getAstroDate("sunset") && !bM_Notstrom) ||
            (new Date() < getAstroDate("sunrise") && !bM_Notstrom)
        )
        ) {
            LogProgrammablauf += '2,';
            await EMS(false); // EMS Laden/Endladen ausschalten    
            
            // Notstrom SOC um 2% erhöhen, um Pendelverhalten zu verhindern, da die Batterieladung nach dem ausschalten wieder ansteigen kann.
            Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val +2
    }

    // Zwischen Sonnenuntergang und Sonnenaufgang kann Merker Notstrom entladen wieder zurückgesetzt werden.
    if (new Date() < getAstroDate("sunset") && new Date() > getAstroDate("sunrise") && bM_Notstrom){bM_Notstrom = false;LogProgrammablauf += '3,';}
    
    // Nur wenn PV-Leistung vorhanden ist oder Entladen freigegeben ist Regelung starten.
    if((PV_Leistung_Summe_W > (UntererLadekorridor_W + Power_Home_W) || getState(sID_Max_Discharge_Power_W).val > 0 || getState(sID_Max_Charge_Power_W).val > 0) && !bTibberLaden){
        LogProgrammablauf += '6,';
        bStatus_Notstrom_SOC = await Notstrom_SOC_erreicht();
        // Wenn Notstrom SOC nicht erreicht ist oder Notstrom SOC erreicht wurde und mehr PV-Leistung als benötigt vorhanden ist (Überschuss) regelung starten
        if((PV_Leistung_Summe_W - Power_Home_W) > toInt(UntererLadekorridor_W) && (bStatus_Notstrom_SOC || bTibberEntladesperre) || (!bStatus_Notstrom_SOC && !bTibberEntladesperre)){
            LogProgrammablauf += '7,';
            let Ladeschwelle_Proz = (await getStateAsync(sID_Ladeschwelle_Proz[EinstellungAnwahl])).val                 // Parameter Ladeschwelle
            
            // Wenn SOC Ladeschwelle erreicht wurde, mit der Laderegelung starten
            if(Batterie_SOC_Proz > Ladeschwelle_Proz){
                LogProgrammablauf += '9,';
                
                // Prüfen ob vor Regelbeginn
                if (dAkt.getTime() < RB_AstroSolarNoon.getTime()) {
                    LogProgrammablauf += '11,';
                    // Vor Regelbeginn.
                    let Unload_Proz = (await getStateAsync(sID_Unload_Proz[EinstellungAnwahl])).val;
                    
                    // Um auf SOC Unload zu entladen, muss der Parameter Ladeschwelle kleiner sein, ansonsten wird Unload ignoriert.
                    if(Ladeschwelle_Proz <= Unload_Proz){
                        LogProgrammablauf += '12,';
                        // Ist der Batterie SoC > Unload und PV Leistung vorhanden wird entladen
                        if ((Batterie_SOC_Proz - Unload_Proz) > 0 && PV_Leistung_Summe_W > 0){
                            LogProgrammablauf += '13,';
                            // Batterie SoC > Unload und PV Leistung vorhanden
                            // Neuberechnung der Ladeleistung erfolgt, wenn der SoC sich ändert oder nach Ablauf von höchstens 5 Minuten oder tLadezeitende sich ändert oder die letzte Ladeleistung 0 W war oder die Parameter sich geändert haben.
                            if(Batterie_SOC_Proz != Batterie_SOC_alt_Proz || (dAkt.getTime() - Zeit_alt_milisek) > 30000 || RB_AstroSolarNoon.getTime() != RB_AstroSolarNoon_alt_milisek || M_Power == 0 || M_Power == maximumLadeleistung_W || bCheckConfig){
                                Batterie_SOC_alt_Proz = Batterie_SOC_Proz; bCheckConfig = false; RB_AstroSolarNoon_alt_milisek = RB_AstroSolarNoon.getTime(); Zeit_alt_milisek = dAkt.getTime();
                                LogProgrammablauf += '14,';
                                // Berechnen der Entladeleistung bis zum Unload SOC in W/sek.
                                M_Power = Math.round(((Unload_Proz - Batterie_SOC_Proz)*Speichergroesse_kWh*10*3600) / (Math.trunc((RB_AstroSolarNoon.getTime()- dAkt.getTime())/1000)));
                                // Prüfen ob die PV-Leistung plus Entladeleistung Batterie die max. WR-Leistung übersteigt
                                if((PV_Leistung_E3DC_W - M_Power)> Max_wrleistung_W){
                                 M_Power = PV_Leistung_E3DC_W - Max_wrleistung_W
                                }
                            }
                        }else if((PV_Leistung_Summe_W - Power_Home_W) > toInt(UntererLadekorridor_W) || (PV_Leistung_Summe_W - Power_Home_W) > 0 ){
                            // Unload SOC erreicht und PV-Leistung höher als Eigenverbrauch.Laden der Batterie erst nach Regelbeginn zulassen (0 W)
                            LogProgrammablauf += '15,';
                            bLadenEntladenStoppen = true
                            M_Power = 0;
                        }else if((PV_Leistung_Summe_W - Power_Home_W) <= 0 ){
                            // Unload SOC erreicht und PV-Leistung niedriger als Eigenverbrauch.(idle)
                            LogProgrammablauf += '16,';
                            M_Power = maximumLadeleistung_W;
                        }
                    }else{
                        // Ladeschwelle größer Unload. Standard Regelung E3dc überlassen (idle)
                        LogProgrammablauf += '17,';
                        M_Power = maximumLadeleistung_W;
                    }
                // Prüfen ob nach Regelbeginn vor Regelende
                }else if(dAkt.getTime() < RE_AstroSolarNoon.getTime()){ 
                    LogProgrammablauf += '18,';
                    // Nach Regelbeginn vor Regelende    
                            
                    // Neuberechnung der Ladeleistung erfolgt, wenn der SoC sich ändert oder nach Ablauf von höchstens 5 Minuten oder tLadezeitende sich ändert oder die letzte Ladeleistung 0 W war oder die Parameter sich geändert haben.
                    if(Batterie_SOC_Proz != Batterie_SOC_alt_Proz || (dAkt.getTime() - Zeit_alt_milisek) > 30000 || RE_AstroSolarNoon.getTime() != RE_AstroSolarNoon_alt_milisek || M_Power == 0 || M_Power == maximumLadeleistung_W || bCheckConfig){
                        Batterie_SOC_alt_Proz = Batterie_SOC_Proz; bCheckConfig = false; RE_AstroSolarNoon_alt_milisek = RE_AstroSolarNoon.getTime(); Zeit_alt_milisek = dAkt.getTime();
                        let Ladeende_Proz = (await getStateAsync(sID_Ladeende_Proz[EinstellungAnwahl])).val // Parameter Ladeende
                        LogProgrammablauf += '19,';
                        // Berechnen der Ladeleistung bis zum Ladeende SOC in W/sek.
                        M_Power = Math.round(((Ladeende_Proz - Batterie_SOC_Proz)*Speichergroesse_kWh*10*3600) / (Math.trunc((RE_AstroSolarNoon.getTime()-dAkt.getTime())/1000)));
                        
                        if (M_Power < toInt(UntererLadekorridor_W) && PV_Leistung_Summe_W -Power_Home_W > 0){
                            LogProgrammablauf += '20,';
                            // Berechnete Ladeleistung ist niedriger als unterer Ladekorridor.Laden Stoppen (0 W)
                            bLadenEntladenStoppen = true
                            M_Power = 0;
                        }else if (M_Power < toInt(UntererLadekorridor_W) && PV_Leistung_Summe_W -Power_Home_W <= 0){
                            // Berechnete Ladeleistung ist niedriger als unterer Ladekorridor und PV-Leistung zu gering.Entladen freigeben (idle)
                            LogProgrammablauf += '21,';
                            M_Power = maximumLadeleistung_W;
                        }
                    }
                // Prüfen ob nach Regelende vor Ladeende
                }else if(dAkt.getTime() < LE_AstroSunset.getTime()){
                    LogProgrammablauf += '22,';
                    // Nach Regelende vor Ladeende
                    let Ladeende_Proz = (await getStateAsync(sID_Ladeende_Proz[EinstellungAnwahl])).val     // Parameter Ladeende
                    let Ladeende2_Proz = (await getStateAsync(sID_Ladeende2_Proz[EinstellungAnwahl])).val   // Parameter Ladeende2
        
                    // Wenn SOC Ladeende_Proz oder Ladeende2_Proz erreicht wurde, Merker setzen um Batterieschwankungen -1% zu ignorieren.
                    if (Batterie_SOC_Proz < Ladeende_Proz){
                        LogProgrammablauf += '23,';
                        M_Power = maximumLadeleistung_W;
                    }else if (Batterie_SOC_Proz < Ladeende2_Proz){
                        LogProgrammablauf += '24,';
                        // Berechnen der Ladeleistung bis zum Ladeende2 SOC in W/sek.
                        // Neuberechnung der Ladeleistung erfolgt, wenn der SoC sich ändert oder nach Ablauf von höchstens 30 Sek. oder tLadezeitende sich ändert oder die letzte Ladeleistung 0 W war oder die Parameter sich geändert haben.
                        if(Batterie_SOC_Proz != Batterie_SOC_alt_Proz || (dAkt.getTime() - Zeit_alt_milisek) > 30000 || RE_AstroSolarNoon.getTime() != RE_AstroSolarNoon_alt_milisek || M_Power == 0 || M_Power == maximumLadeleistung_W || bCheckConfig){
                            Batterie_SOC_alt_Proz = Batterie_SOC_Proz; bCheckConfig = false; RE_AstroSolarNoon_alt_milisek = RE_AstroSolarNoon.getTime(); Zeit_alt_milisek = dAkt.getTime();
                            LogProgrammablauf += '25,';
                            M_Power = Math.round(((Ladeende2_Proz - Batterie_SOC_Proz)*Speichergroesse_kWh*10*3600) / (Math.trunc((LE_AstroSunset.getTime()-dAkt.getTime())/1000)));
                            if (M_Power < toInt(UntererLadekorridor_W) && PV_Leistung_Summe_W -Power_Home_W > 0){
                                LogProgrammablauf += '26,';
                                // Berechnete Ladeleistung ist niedriger als unterer Ladekorridor.Laden Stoppen (0 W)
                                M_Power = 0;
                                bLadenEntladenStoppen = true
                            }else if (M_Power < toInt(UntererLadekorridor_W) && PV_Leistung_Summe_W -Power_Home_W <= 0){
                                LogProgrammablauf += '27,';
                                // Berechnete Ladeleistung ist niedriger als unterer Ladekorridor und PV-Leistung zu gering.Entladen freigeben (idle)
                                M_Power = maximumLadeleistung_W;
                            }
                        }   
                    }else if(PV_Leistung_Summe_W -Power_Home_W > 0){
                        // Ladeende2 erreicht und PV-Leistung höher als Eigenverbrauch (0 W))
                        // Laden Entladen stoppen
                        LogProgrammablauf += '28,';
                        bLadenEntladenStoppen = true
                        M_Power = 0;
                    }else{
                        // Ladeende2 erreicht und PV-Leistung niedriger als Eigenverbrauch. (idle)
                        // Laderegelung an E3DC übergeben um Batterie zu entladen
                        LogProgrammablauf += '29,';
                        M_Power = maximumLadeleistung_W;
                    }
                // Prüfen ob nach Ladeende
                }else if(dAkt.getTime() > LE_AstroSunset.getTime()){
                    LogProgrammablauf += '30,';
                    // Nach Sommerladeende
                    let Ladeende2_Proz = (await getStateAsync(sID_Ladeende2_Proz[EinstellungAnwahl])).val    // Parameter Ladeende2
        
                    // Wurde Batterie SOC Ladeende2 erreicht, dann Ladung beenden ansonsten mit maximal möglicher Ladeleistung Laden.
                    if (Batterie_SOC_Proz < Ladeende2_Proz && PV_Leistung_Summe_W > toInt(UntererLadekorridor_W)){
                        // SOC Ladeende2 nicht erreicht und ausreichend PV-Leistung vorhanden. (idle)
                        LogProgrammablauf += '31,';
                        M_Power = maximumLadeleistung_W;
                    }else if(Batterie_SOC_Proz >= Ladeende2_Proz && PV_Leistung_Summe_W -Power_Home_W > 0){
                        // SOC Ladeende2 erreicht und PV-Leistung höher als Eigenverbrauch. (0 W)
                        LogProgrammablauf += '32,';
                        bLadenEntladenStoppen = true
                        M_Power = 0;
                    }else if(Batterie_SOC_Proz >= Ladeende2_Proz && PV_Leistung_Summe_W-Power_Home_W <= 0 ){
                        // SOC Ladeende2 erreicht und PV-Leistung < Eigenverbrauch. (idle)
                        LogProgrammablauf += '33,';
                        M_Power = maximumLadeleistung_W;
                    }
                }
            }else{ 
                // SOC Ladeschwelle wurde nicht erreicht.Regelung E3DC übelassen (Standard:laden mit voller PV-Leistung)
                LogProgrammablauf += '10,';
                M_Power = maximumLadeleistung_W;
            }
            if (!bLadenEntladenStoppen) {
                // Zähler wieviel Leistung mit Charge-Control gesichert wurde
                let Power = Math.max(0, PV_Leistung_E3DC_W - (Einspeiselimit_kWh * 1000) - Power_Home_W);
                let Power_WR = Math.max(0, PV_Leistung_E3DC_W - Max_wrleistung_W);
                let MaxPower = Math.max(Power, Power_WR);
                await setStateAsync(sID_Saved_Power_W, MaxPower);
                if (MaxPower > 0 && M_Power < MaxPower) {
                    LogProgrammablauf += '38,';
                    M_Power = MaxPower;
                    bM_Abriegelung = true;
                }
                // Prüfen ob Berechnete Ladeleistung innerhalb der min. und max. Grenze ist
                if (M_Power < Bat_Discharge_Limit_W*-1){LogProgrammablauf += '39,'; M_Power = Bat_Discharge_Limit_W*-1;} 
                if (M_Power > maximumLadeleistung_W){LogProgrammablauf += '40,'; M_Power = maximumLadeleistung_W;}

                //Prüfen ob berechnete Ladeleistung M_Power zu Netzbezug führt nur wenn LadenStoppen = false ist
                const ladeleistung = Math.max(0, M_Power);
                const ueberschuss = PV_Leistung_Summe_W - (Power_Home_W + ladeleistung);
                if (bDebugAusgabe){log(`ueberschuss = ${ueberschuss} hystereseWatt = ${hystereseWatt} bRegelungAktiv = ${bRegelungAktiv} M_Power=${M_Power}`)}
                if (!bRegelungAktiv && ueberschuss > hystereseWatt) {
                    hystereseWatt = 2000                        // Beim einschalten auf Standard Wert setzen
                    bRegelungAktiv = true;                      // Regelung übernimmt CC
                } else if (bRegelungAktiv && ueberschuss < 500) {
                    hystereseWatt = Math.max(2000,M_Power)      // Berechnete Ladeleistung Merken beim ausschalten 
                    bRegelungAktiv = false;                     // Regelung übernimmt E3DC
                }               
                if (!bRegelungAktiv) {
                    // Regelung E3DC überlassen 
                    LogProgrammablauf += '34,';
                    M_Power = maximumLadeleistung_W;
                }

                // Prüfen ob Berechnete Leistung negativ ist und entladen wird wenn LadenStoppen = false ist
                if (M_Power < 0 && !bLadenEntladenStoppen) {
                    const Entladeleistung = Math.abs(M_Power);
                    const PowerGrid = PV_Leistung_Summe_W - Power_Home_W + Entladeleistung;

                    if (PowerGrid < 0) {
                        // Netzbezug trotz Entladung → Entladeleistung erhöhen
                        LogProgrammablauf += '35,';
                        const neueEntladeleistung = Entladeleistung + Math.abs(PowerGrid);
                        M_Power = -neueEntladeleistung;
                        bCheckConfig = true;
                    }
                }
            }
        }else{
            if(bTibberEntladesperre){LogProgrammablauf += '37,';}else{LogProgrammablauf += '8,';}
            // Notstrom SOC erreicht oder Tibber Entladesperre aktiv und nicht ausreichend PV-Leistung vorhanden 
            // Entladen der Batterie stoppen
            bLadenEntladenStoppen = true
        }
        
        // Leerlauf beibehalten bis sich der Wert M_Power ändert oder LadenEntladenStoppen true ist
        if(M_Power_alt != maximumLadeleistung_W || M_Power != maximumLadeleistung_W || bLadenEntladenStoppen ){
                
            // Alle 6 sek. muss mindestens ein Steuerbefehl an e3dc.rscp Adapter gesendet werden sonst übernimmt E3DC die Steuerung
            if((bLadenEntladenStoppen != bLadenEntladenStoppen_alt || M_Power != M_Power_alt || (dAkt.getTime()- ZeitE3DC_SetPowerAlt_ms)> 5000) && !bLadenAufNotstromSOC){
                ZeitE3DC_SetPowerAlt_ms = dAkt.getTime();
                M_Power_alt = M_Power;
                bLadenEntladenStoppen_alt = bLadenEntladenStoppen
                
                if(M_Power == 0 || bLadenEntladenStoppen){
                // Entladen / Laden der Batterie stoppen    
                    LogProgrammablauf += '41,';
                    Set_Power_Value_W = 0;
                    //log(`Entladen stoppen bLadenEntladenStoppen = ${bLadenEntladenStoppen}`,'warn')
                    await setStateAsync(sID_SET_POWER_MODE,1); // Idle
                    await setStateAsync(sID_SET_POWER_VALUE_W,0)
                    await setStateAsync(sID_out_Akt_Ladeleistung_W,0);
                    bLadenEntladenStoppen = false
                    
                }else if(M_Power == maximumLadeleistung_W ){
                // E3DC die Steuerung überlassen, dann wird mit der maximal möglichen Ladeleistung geladen oder entladen
                    LogProgrammablauf += '42,';
                    Set_Power_Value_W = 0
                    //log(`Steuerung E3DC überlassen Set_Power_Value_W = ${Set_Power_Value_W}`,'warn')
                    await setStateAsync(sID_SET_POWER_MODE,0); // Normal
                    await setStateAsync(sID_out_Akt_Ladeleistung_W,maximumLadeleistung_W);
                    
                }else if(M_Power > 0){
                // Entladen / Laden der Batterie regeln
                    LogProgrammablauf += '43,';
                    // Beim ersten Aufruf oder wenn Berechnung Netzbezug bedeuten würde
                    // oder wenn Einspeisegrenze erreicht wurde, Wert M_Power übernehmen und erst dann langsam erhöhen oder senken
                    if (Set_Power_Value_W < 1) {
                        //log(`M_Power = ${M_Power} übernehmen`, 'warn');
                        Set_Power_Value_W = M_Power;
                    } else if (bM_Abriegelung) {
                        //log(`Einspeisegrenze erreicht M_Power = ${M_Power} übernehmen`, 'warn');
                        Set_Power_Value_W = M_Power + 100;
                        bM_Abriegelung = false;
                    }
                    
                    // Leistung langsam erhöhen oder senken um Schwankungen zu verhindern
                    if(M_Power > Set_Power_Value_W){
                        Set_Power_Value_W ++
                    }else if(M_Power < Set_Power_Value_W){
                        Set_Power_Value_W -= 3;
                    }
                    //log(`Regelung Set_Power_Value_W ist = ${Set_Power_Value_W}`,'warn')
                    await setStateAsync(sID_SET_POWER_MODE,3); // Laden
                    await setStateAsync(sID_SET_POWER_VALUE_W,Set_Power_Value_W) // E3DC bleib beim Laden im Schnitt um ca 82 W unter der eingestellten Ladeleistung
                    await setStateAsync(sID_out_Akt_Ladeleistung_W,Set_Power_Value_W);
            
                }else if(M_Power < 0 && Batterie_SOC_Proz > Notstrom_SOC_Proz){
                    LogProgrammablauf += '44,';
                    // Beim ersten aufruf Wert M_Power übernehmen und erst dann langsam erhöhen oder senken
                    if(Set_Power_Value_W >= 0){Set_Power_Value_W=M_Power}
                    if(!bCheckConfig){
                        // Leistung langsam erhöhen oder senken um Schwankungen auszugleichen
                       if(M_Power > Set_Power_Value_W){
                            Set_Power_Value_W++
                        }else if(M_Power < Set_Power_Value_W){
                            Set_Power_Value_W--
                        }
                    }else{
                        Set_Power_Value_W = M_Power
                    }
                    await setStateAsync(sID_SET_POWER_MODE,2); // Entladen
                    await setStateAsync(sID_SET_POWER_VALUE_W,Math.abs(Set_Power_Value_W)) // E3DC bleib beim Entladen im Schnitt um ca 65 W über der eingestellten Ladeleistung
                    await setStateAsync(sID_out_Akt_Ladeleistung_W,Set_Power_Value_W);
                }
                
            }
        }else{
            // Absicherung falls bei den Adaptereinstellung e3dc-rscp SET_POWER Wiederholintervall nicht 0 eingestellt ist
            if(SET_POWER_MODE > 0){
                await setStateAsync(sID_SET_POWER_MODE,0); // Normal
                await setStateAsync(sID_out_Akt_Ladeleistung_W,maximumLadeleistung_W);
            }
        }
        
    }else if(bScriptTibber && bTibberLaden){
        LogProgrammablauf += '36,';
        // Absicherung das Netzleistung nicht 22000W (32A * 3 ) übersteigt 
        const steigungsrate = 100;
        const maxGesamtleistung = 20000;
        if(tibberMaxLadeleistung_W === null){tibberMaxLadeleistung_W = tibberMaxLadeleistungUser_W}
        let gesamtleistung
        if (PV_Leistung_Summe_W >= Power_Home_W) {
            gesamtleistung = tibberMaxLadeleistung_W;
        } else {
            gesamtleistung = Math.abs(PV_Leistung_Summe_W - Power_Home_W) + tibberMaxLadeleistung_W;
        }
                
        if (gesamtleistung > maxGesamtleistung) {
            tibberMaxLadeleistung_W -= gesamtleistung - maxGesamtleistung;    
        }else{
            const differenz = tibberMaxLadeleistungUser_W - tibberMaxLadeleistung_W;
            // Annäherung in beide Richtungen mit Wert steigungsrate
            if (Math.abs(differenz) >= steigungsrate && 
                Power_Home_W + tibberMaxLadeleistung_W + Math.sign(differenz) * steigungsrate <= maxGesamtleistung) {
                tibberMaxLadeleistung_W += Math.sign(differenz) * steigungsrate;
            } else {
                tibberMaxLadeleistung_W = tibberMaxLadeleistungUser_W;
            }
        }
        if (tibberMaxLadeleistung_W < 0){tibberMaxLadeleistung_W = 0}
        await setStateAsync(sID_SET_POWER_MODE,4); // Laden
        await setStateAsync(sID_SET_POWER_VALUE_W,tibberMaxLadeleistung_W) // E3DC bleib beim Laden im Schnitt um ca 82 W unter der eingestellten Ladeleistung
    }
}




async function DebugLog()
{
    log(`*******************  Debug LOG Charge-Control  *******************`)
    if (bDebugAusgabeDetail){log(`10_Offset_sunriseEnd = ${Offset_sunriseEnd_min}`)}
    if (bDebugAusgabeDetail){log(`10_minWertPrognose_kWh = ${minWertPrognose_kWh}`)}
    if (bDebugAusgabeDetail){log(`10_maxEntladetiefeBatterie = ${Entladetiefe_Pro}`)}
    if (bDebugAusgabeDetail){log(`10_Systemwirkungsgrad = ${Systemwirkungsgrad_Pro}`)}
    if (bDebugAusgabeDetail){log(`40_minPvLeistungTag_kWh = ${nMinPvLeistungTag_kWh}`)}
    if (bDebugAusgabeDetail){log(`40_maxPvLeistungTag_kWh = ${nMaxPvLeistungTag_kWh}`)}
    if (bDebugAusgabeDetail){log(`40_KorrekturFaktor = ${nKorrFaktor}`)}
    if (bDebugAusgabeDetail){log(`40_WirkungsgradModule = ${nWirkungsgradModule}`)}
    if (bDebugAusgabeDetail){log(`bAutomatikAnwahl =${bAutomatikAnwahl}`)}
    if (bDebugAusgabeDetail){log(`bAutomatikRegelung =${bAutomatikRegelung}`)}
    if (bDebugAusgabeDetail){log(`Einstellungen =${EinstellungAnwahl}`)}
    if (bDebugAusgabeDetail){log(`Start Regelzeitraum = ${RB_AstroSolarNoon.getHours().toString().padStart(2,"0")}:${RB_AstroSolarNoon.getMinutes().toString().padStart(2,"0")}`)}
    if (bDebugAusgabeDetail){log(`Ende Regelzeitraum= ${RE_AstroSolarNoon.getHours().toString().padStart(2,"0")}:${RE_AstroSolarNoon.getMinutes().toString().padStart(2,"0")}`)}
    if (bDebugAusgabeDetail){log(`Ladeende= ${LE_AstroSunset.getHours().toString().padStart(2,"0")}:${LE_AstroSunset.getMinutes().toString().padStart(2,"0")}`)}
    if (bDebugAusgabeDetail){log(`Unload = ${(await getStateAsync(sID_Unload_Proz[EinstellungAnwahl])).val}`)}
    if (bDebugAusgabeDetail){log(`Ladeende = ${(await getStateAsync(sID_Ladeende_Proz[EinstellungAnwahl])).val}`)}
    if (bDebugAusgabeDetail){log(`Ladeende2 = ${(await getStateAsync(sID_Ladeende2_Proz[EinstellungAnwahl])).val}`)}
    if (bDebugAusgabeDetail){log(`Ladeschwelle = ${(await getStateAsync(sID_Ladeschwelle_Proz[EinstellungAnwahl])).val}`)}
    if (bDebugAusgabeDetail){log(`Unterer Ladekorridor = ${(await getStateAsync(sID_UntererLadekorridor_W[EinstellungAnwahl])).val}`)}
    if (bDebugAusgabeDetail){log(`Offset Regelbeginn = ${(await getStateAsync(sID_RegelbeginnOffset[EinstellungAnwahl])).val}`)}
    if (bDebugAusgabeDetail){log(`Offset Regelende = ${(await getStateAsync(sID_RegelendeOffset[EinstellungAnwahl])).val}`)}
    if (bDebugAusgabeDetail){log(`Offset Ladeende = ${(await getStateAsync(sID_LadeendeOffset[EinstellungAnwahl])).val}`)}
    if (bDebugAusgabeDetail){log(`Notstrom min = ${(await getStateAsync(sID_Notstrom_min_Proz)).val}`)}
    if (bDebugAusgabeDetail){log(`Notstrom Sockel = ${(await getStateAsync(sID_Notstrom_sockel_Proz)).val}`)}
    if (bDebugAusgabeDetail){log(`Eigenverbrauch Nacht = ${await Hausverbrauch('night')} Wh`)}
    if (bDebugAusgabeDetail){log(`Power_Home_W (Hausverbrauch & Wallbox) = ${(await getStateAsync(sID_Power_Home_W)).val+(await getStateAsync(sID_Power_Wallbox_W)).val}W`)}
    if (bDebugAusgabeDetail){log(`Batterie Leistung = ${(await getStateAsync(sID_Power_Bat_W)).val} W`)}
    if (bDebugAusgabeDetail){log(`PV Leistung = ${(await getStateAsync(sID_PvLeistung_E3DC_W)).val+Math.abs((await getStateAsync(sID_PvLeistung_ADD_W)).val)} W`)}
    if (bDebugAusgabeDetail){log(`Speichergroesse = ${Speichergroesse_kWh}kWh `)}
    if (bDebugAusgabeDetail){log(`Batterie SoC = ${(await getStateAsync(sID_Batterie_SOC)).val} %`)}
    if (bDebugAusgabeDetail){log(`Notstrom_SOC_Proz= ${Notstrom_SOC_Proz} %`)}
    if (bDebugAusgabeDetail){log(`Notstrom_SOC_erreicht = ${bStatus_Notstrom_SOC}`)}
    if (bDebugAusgabeDetail){log(`bNotstromVerwenden =${bNotstromVerwenden}`)}
    if (bDebugAusgabeDetail){log(`bNotstromAusNetz =${bNotstromAusNetz}`)}
    if (bDebugAusgabeDetail){log(`Notstrom_Status = ${(await getStateAsync(sID_Notrom_Status)).val}`)}
    if (bDebugAusgabeDetail){log(`bM_Notstrom = ${bM_Notstrom}`)}
    if (bDebugAusgabeDetail){log(`M_Power = ${M_Power}`)}
    if (bDebugAusgabeDetail){log(`Set_Power_Value_W = ${Set_Power_Value_W}`)} 
    
    log(`ProgrammAblauf = ${LogProgrammablauf} `,'warn')
    
}


// Prüfen ob Notstrom SOC erreicht wurde um das entladen der Batterie zu verhindern.
async function Notstrom_SOC_erreicht()
{   
    if (Notstrom_Status == 1 || Notstrom_Status == 4 || Batterie_SOC_Proz > Notstrom_SOC_Proz || bNotstromVerwenden || Batterie_SOC_Proz == 0){
        // Entladen einschalten
        Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val
        LogProgrammablauf += '4,';
        return false;
    }else{
        // Endladen ausschalten
        // Notstrom SOC um 2% erhöhen, um ein ständiges aus und einschalten zu vermeiden.
        Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val +2
        LogProgrammablauf += '5,';
        return true;
    }        
}

// EMS laden und entladen der Batterie aus/ein schalten
// Führt zu Schreibzugriffe auf die interne SSD vom Hauskraftwerk und sollte nicht ständig geändert werden.
async function EMS(bState)
{
    const [Akk_max_Discharge_Power_W, Akk_max_Charge_Power_W] = await Promise.all([
        getStateAsync(sID_Max_Discharge_Power_W),                                               // Aktuell eingestellte Entladeleistung 
        getStateAsync(sID_Max_Charge_Power_W)                                                   // Aktuell eingestellte Ladeleistung  
    ]).then(states => states.map(state => state.val));
    
    // EMS einschalten
    if(bState && (Akk_max_Discharge_Power_W == 0 || Akk_max_Charge_Power_W == 0)){
        await Promise.all([
            setStateAsync(sID_POWER_LIMITS_USED,true),
            setStateAsync(sID_Max_Discharge_Power_W, Bat_Discharge_Limit_W),
            setStateAsync(sID_DISCHARGE_START_POWER, startDischargeDefault),
            setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
        ]);    
        logChargeControl(`-==== ⚠️ EMS Laden/Entladen der Batterie ist eingeschaltet ⚠️ ====-`,"warn");
    }
    // EMS ausschalten
    if(!bState && Batterie_SOC_Proz !=0 && (Akk_max_Discharge_Power_W != 0 || Akk_max_Charge_Power_W != 0)){
        await Promise.all([
            setStateAsync(sID_POWER_LIMITS_USED, true),
            setStateAsync(sID_DISCHARGE_START_POWER, 0),
            setStateAsync(sID_Max_Discharge_Power_W, 0),
            setStateAsync(sID_Max_Charge_Power_W, 0),
            setStateAsync(sID_Powersave, true)
        ]);
        logChargeControl(`-==== ⚠️ Notstrom Reserve erreicht, Laden/Entladen der Batterie ist ausgeschaltet ⚠️ ====-`,"warn");
    }
}

// Notstromreserve berechnen (Notstrom_min_Proz = Speicherreserve in % bei Wintersonnenwende 21.12 / Notstrom_sockel_Proz =  min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9. )
async function Notstromreserve()
{
    let dAkt = new Date();
    let dStart = new Date(dAkt.getFullYear()+',1,1');
    if ((await getStateAsync(sID_PARAM_EP_RESERVE_W)).val == 0){
        // @ts-ignore
        let tm_yday = Math.round(Math.abs(dAkt - dStart) / (1000 * 60 * 60 * 24 ));
        const [Notstrom_sockel_Proz,Notstrom_min_Proz] = await Promise.all([
            getStateAsync(sID_Notstrom_sockel_Proz),                    // Parameter Charge-Control Notstrom Sockel
            getStateAsync(sID_Notstrom_min_Proz)                        // Parameter Charge-Control Notstrom min
        ]).then(states => states.map(state => state.val));
        
        Notstrom_SOC_Proz = Math.max(0,Math.round(Notstrom_sockel_Proz + (Notstrom_min_Proz - Notstrom_sockel_Proz) * Math.cos((tm_yday+9)*2*3.14/365)))
        await setStateAsync(sID_Notstrom_akt,Notstrom_SOC_Proz)
    }else{
        logChargeControl(`-==== ⚠️ Notstromreserve wurde beim Hauskraftwerk eingestellt und wird nicht von Charge-Control gesteuert ⚠️ ====-`,"warn");
        await setStateAsync(sID_Notstrom_akt,0)
        Notstrom_SOC_Proz = 0;
    }
}


// Einstellungen 1-5 je nach Überschuss PV Leistung Wetterprognose und Bewölkung anwählen 
async function Einstellung(UeberschussPrognoseProzent)
{
    let Bedeckungsgrad12,Bedeckungsgrad15;
    EinstellungAnwahl =  (await getStateAsync(sID_EinstellungAnwahl)).val    
    if (UeberschussPrognoseProzent== null){
      logChargeControl(`-==== Überschuss PV-Leistung konnte nicht berechnet werden. Ueberschuss=${UeberschussPrognoseProzent} ====-`,"error");
      return  
    }
        
    // Bewölkung für weitere Entscheidung ermitteln
    Bedeckungsgrad12 = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`)).val;
    Bedeckungsgrad15 = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`)).val;
    if (bLogAusgabe){logChargeControl(`Bewölkungsgrad 12 Uhr Proplanta ${Bedeckungsgrad12}`);}
    if (bLogAusgabe){logChargeControl(`Bewölkungsgrad 15 Uhr Proplanta ${Bedeckungsgrad12}`);}
    if (Number.isNaN(Bedeckungsgrad12) && bAutomatikAnwahl || Number.isNaN(Bedeckungsgrad15) && bAutomatikAnwahl )
    {
      logChargeControl(`-==== ⚠️ Bewölkungsgrad_12 oder Bewölkungsgrad_15 wurde nicht abgerufen. 12=${Bedeckungsgrad12} 15=${Bedeckungsgrad15} ⚠️ ====-`,"warn");
      return  
    }
          
    // Einstellung 1
    // Prognose PV-Leistung geringer als benötigter Eigenverbrauch, Überschuss zu 100% in Batterie speichern
	if (UeberschussPrognoseProzent === 0 && bAutomatikAnwahl)
	{
		if (bLogAusgabe){logChargeControl(`-==== Einstellung 1 aktiv ====-`,"info");}
        if(EinstellungAnwahl != 1){
            await setStateAsync(sID_EinstellungAnwahl,1);
        }
	}	
	
    // Einstellung 2
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen
    // und keine Bewölkung > 90% 
	if (UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 < BewoelkungsgradGrenzwert && Bedeckungsgrad15 < BewoelkungsgradGrenzwert && bAutomatikAnwahl) 
    {
		if (bLogAusgabe){logChargeControl(`-==== Einstellung 2 aktiv ====-`,"info");}
        if(EinstellungAnwahl != 2){
            await setStateAsync(sID_EinstellungAnwahl,2);
        }
	}	
	
    // Einstellung 3
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 18:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 >= BewoelkungsgradGrenzwert && Bedeckungsgrad15 >= BewoelkungsgradGrenzwert && bAutomatikAnwahl) || (bAutomatikAnwahl === false && EinstellungAnwahl ===3))
	{
		if (bLogAusgabe){logChargeControl(`-==== Einstellung 3 aktiv ====-`,"info");}
        if(EinstellungAnwahl != 3){
            await setStateAsync(sID_EinstellungAnwahl,3);
        }
	}	
	
    // Einstellung 4
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 15:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 >= BewoelkungsgradGrenzwert && Bedeckungsgrad15 < BewoelkungsgradGrenzwert && bAutomatikAnwahl) || (bAutomatikAnwahl === false && EinstellungAnwahl ===4))
	{
		if (bLogAusgabe){logChargeControl(`-==== Einstellung 4 aktiv ====-`,"info");}
        if(EinstellungAnwahl != 4){
            await setStateAsync(sID_EinstellungAnwahl,4);
        }
    }
	
    // Einstellung 5
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 15:00 - 18:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 < BewoelkungsgradGrenzwert && Bedeckungsgrad15 >= BewoelkungsgradGrenzwert && bAutomatikAnwahl) || (bAutomatikAnwahl === false && EinstellungAnwahl ===5))
    {
        if (bLogAusgabe){logChargeControl(`-==== Einstellung 5 aktiv ====-`,"info");}
        if(EinstellungAnwahl != 5){
            await setStateAsync(sID_EinstellungAnwahl,5);
        }
	}
    
}

// Die Funktion ändert die Prognosewerte für das Diagramm und berechnet die Prognose in kWh je nach Auswahl 
async function Prognosen_Berechnen() {
   
    let Tag = [], PrognoseProplanta_kWh_Tag = [], PrognoseSolcast_kWh_Tag = [], PrognoseSolcast90_kWh_Tag = [], Prognose_kWh_Tag = [];
    let DatumAk = new Date();
    let TagHeute = DatumAk.getDate();
    let IstSummePvLeistung_kWh = arrayPV_LeistungTag_kWh[TagHeute];

    // Lokale Kopien der Array-Werte für schnelleren Zugriff
    let arrayProp = arrayPrognoseProp_kWh;
    let arraySolcast = arrayPrognoseSolcast_kWh;
    let arraySolcast90 = arrayPrognoseSolcast90_kWh;

    // Initialisierung der Tag- und Prognose-Daten
    for (let i = 0; i < 7; i++) {
        let nextTag = nextDay(i);
        Tag[i] = nextTag;
        PrognoseProplanta_kWh_Tag[i] = arrayProp[nextTag] || 0;
        PrognoseSolcast_kWh_Tag[i] = arraySolcast[nextTag] || 0;
        PrognoseSolcast90_kWh_Tag[i] = arraySolcast90[nextTag] || 0;
    }

    // Schleife zur Berechnung der Prognose
    for (let i = 0; i < 7; i++) {
        let prop = PrognoseProplanta_kWh_Tag[i];
        let solcast = PrognoseSolcast_kWh_Tag[i];
        let solcast90 = PrognoseSolcast90_kWh_Tag[i];

        // Frühzeitiges Abbrechen der Berechnung, wenn keine Prognosedaten vorliegen
        if (prop === 0 && solcast === 0 && solcast90 === 0) {
            Prognose_kWh_Tag[i] = 0;
            continue;
        }

        // Auswahl der Prognose basierend auf PrognoseAnwahl, mit zwischengespeicherten Werten
        switch (PrognoseAnwahl) {
            case 1:
                Prognose_kWh_Tag[i] = prop; // Proplanta
                break;
            case 2:
                Prognose_kWh_Tag[i] = solcast; // Solcast
                break;
            case 3:
                Prognose_kWh_Tag[i] = Math.max(prop, solcast); // Maximalwert
                break;
            case 4:
                Prognose_kWh_Tag[i] = (prop + solcast) / 2; // Durchschnitt
                break;
            case 5:
                Prognose_kWh_Tag[i] = solcast90; // Solcast 90
                break;
            case 6:
                Prognose_kWh_Tag[i] = (solcast + solcast90) / 2; // Durchschnitt Solcast und Solcast90
                break;
            default:
                Prognose_kWh_Tag[i] = Math.min(prop, solcast); // Minimalwert
        }

        // Anwenden des Korrekturfaktors und Begrenzungen
        Prognose_kWh_Tag[i] = Math.max(Math.min((Prognose_kWh_Tag[i] / 100) * (100 - nKorrFaktor), nMaxPvLeistungTag_kWh), nMinPvLeistungTag_kWh);
    }

    // Korrigieren der Prognose mit der tatsächlichen PV-Leistung
    if (Prognose_kWh_Tag[0] > IstSummePvLeistung_kWh) {
        Prognose_kWh_Tag[0] -= IstSummePvLeistung_kWh;
        arrayPrognoseAuto_kWh[Tag[0]] = Prognose_kWh_Tag[0] + IstSummePvLeistung_kWh;
    } else {
        arrayPrognoseAuto_kWh[Tag[0]] = Prognose_kWh_Tag[0];
    }

    // Werte setzen für die folgenden Tage
    const sunsetHeute_ms = getAstroDate("sunset").getTime() - 2*3600000;
    
    // Nach Sonnenuntergang die Prognose für nächsten Tag setzen
    if(DatumAk.getTime() > sunsetHeute_ms){
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseBerechnung_kWh_heute`, Prognose_kWh_Tag[1]);
    }else{
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseBerechnung_kWh_heute`, Prognose_kWh_Tag[0]);    
    }
    
    for (let i = 1; i < 7; i++) {
        if (Tag[i] === '1') break;
        arrayPrognoseAuto_kWh[Tag[i]] = Prognose_kWh_Tag[i];
    }

    await setStateAsync(sID_PrognoseAuto_kWh, JSON.stringify(arrayPrognoseAuto_kWh));
}

// Die Funktion berechnet den Überschuss anhand der PrognoseBerechnung_kWh_heute 
// nach Abzug von Eigenverbrauch und Ladekapazität des Batteriespeicher.
async function Ueberschuss_Prozent()
{
    const [nEigenverbrauchTag, Prognose_kWh, AktSpeicherSoC] = await Promise.all([
        getStateAsync(sID_EigenverbrauchTag_kWh),
        getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseBerechnung_kWh_heute`),
        getStateAsync(sID_Batterie_SOC)
    ]).then(states => states.map(state => state.val));
    
    let Ueberschuss_Prozent = 0,Ueberschuss_kWh = 0,FreieKapBatterie_kWh = 0;
    let Rest_Eigenverbrauch_kWh = (await getStateAsync(sID_EigenverbrauchTag_kWh)).val;
    let dStart = new Date(0, 0, 0, 6,0,0, 0);
    let dAkt = new Date();
     //Vom nEigenverbrauch Tag von 6:00 bis 20:00 Uhr bereits verbrauchte kWh abziehen
    if (Zeitbereich("06:00","20:00")){
        let Diff_Minuten = (dAkt.getMinutes()- dStart.getMinutes())+((dAkt.getHours()- dStart.getHours())*60)
        Rest_Eigenverbrauch_kWh = nEigenverbrauchTag-((nEigenverbrauchTag/780)*Diff_Minuten);
    }

    FreieKapBatterie_kWh = await Batterie_kWh(AktSpeicherSoC);
    if (Prognose_kWh != null){
        Ueberschuss_kWh =(Prognose_kWh - Rest_Eigenverbrauch_kWh)- FreieKapBatterie_kWh;
	    if (Ueberschuss_kWh < 0){Ueberschuss_kWh = 0;}
        Ueberschuss_Prozent = await BatterieProzent(Ueberschuss_kWh);
	    if (Ueberschuss_Prozent>100){Ueberschuss_Prozent=100;}
        if (bLogAusgabe){logChargeControl(`Eigenverbrauch Tag = ${nEigenverbrauchTag}`,"info");}
        if (bLogAusgabe){logChargeControl(`AktSpeicherSoC in % = ${AktSpeicherSoC}`,"info");}
        if (bLogAusgabe){logChargeControl(`Ueberschuss in kWh ${Ueberschuss_kWh} = (Prognose kWh ${Prognose_kWh} - Berechneter Eigenverbrauch ${Rest_Eigenverbrauch_kWh}) - FreieKapBatterie_kWh ${FreieKapBatterie_kWh}`,"info");}
        if (bLogAusgabe){logChargeControl(`Ueberschuss in Prozent = ${Ueberschuss_Prozent}`,"info");}
        return round(Ueberschuss_Prozent, 0);
    
    }else{
        if (bLogAusgabe){logChargeControl(`-==== PrognoseBerechnung_kWh_heute Variable hat keinen Wert ====-`,"info");}
        return null
    }
}

// materialdesing JSON Chart Werte speichern
async function makeJson(){
    let chart = {}
    let axisLabels = [];
    let date = new Date();
	let mm = (date.getMonth()+1).toString().padStart(2,"0");
    
    
    for (let i = 1; i <= 31; i++) {
        axisLabels.push(i);
    }

    chart = {
        axisLabels: axisLabels,
        graphs: [
            {
                data: arrayPrognoseAuto_kWh.slice(1),
                type: 'line',
                datalabel_show: 'false',
                datalabel_offset: -12,
                datalabel_borderRadius: 15,
                datalabel_steps: 1,
                color: 'red',
                line_PointColor: 'red',
                line_PointColorBorder: 'red',
                line_pointSize: 2,
                line_Thickness: 3,
                line_pointStyle: 'circle',
                line_UseFillColor: false,
                legendText: 'Prognose Auto',
                yAxis_id: 0,
                yAxis_gridLines_show: true,
                yAxis_gridLines_border_show: true,
                yAxis_gridLines_ticks_show: true,
                yAxis_showTicks: false,
                yAxis_zeroLineWidth: 0.4,
            },
            {
                data: arrayPrognoseProp_kWh.slice(1),
                type: 'line',
                datalabel_show: 'false',
                datalabel_offset: -12,
                datalabel_borderRadius: 15,
                datalabel_steps: 1,
                color: '#7be0fe',
                line_PointColor: '#7be0fe',
                line_PointColorBorder: '#7be0fe',
                line_pointSize: 2,
                line_Thickness: 2,
                line_pointStyle: 'rectRot',
                line_UseFillColor: false,
                legendText: 'Prognose Proplanta',
                yAxis_id: 0,
                yAxis_gridLines_show: true,
                yAxis_gridLines_border_show: true,
                yAxis_gridLines_ticks_show: true,
                yAxis_showTicks: false,
                yAxis_zeroLineWidth: 0.4,
            },
            {
                data: arrayPrognoseSolcast_kWh.slice(1),
                type: 'line',
                datalabel_show: 'false',
                datalabel_offset: -12,
                datalabel_borderRadius: 15,
                datalabel_steps: 1,
                color: '#01DF01',
                line_PointColor: '#01DF01',
                line_PointColorBorder: '#01DF01',
                line_pointSize: 2,
                line_Thickness: 2,
                line_pointStyle: 'rectRot',
                line_UseFillColor: false,
                legendText: 'Prognose Solcast',
                yAxis_id: 0,
                yAxis_gridLines_show: true,
                yAxis_gridLines_border_show: true,
                yAxis_gridLines_ticks_show: true,
                yAxis_showTicks: false,
                yAxis_zeroLineWidth: 0.4,
            },
            {
                data: arrayPrognoseSolcast90_kWh.slice(1),
                type: 'line',
                datalabel_show: 'false',
                datalabel_offset: -12,
                datalabel_borderRadius: 15,
                datalabel_steps: 1,
                color: '#FF00FF',
                line_PointColor: '#FF00FF',
                line_PointColorBorder: '#FF00FF',
                line_pointSize: 2,
                line_Thickness: 2,
                line_pointStyle: 'rectRot',
                line_UseFillColor: false,
                legendText: 'Prognose Solcast 90',
                yAxis_id: 0,
                yAxis_gridLines_show: true,
                yAxis_gridLines_border_show: true,
                yAxis_gridLines_ticks_show: true,
                yAxis_showTicks: false,
                yAxis_zeroLineWidth: 0.4,
            },
            {
                data: arrayPV_LeistungTag_kWh.slice(1),
                type: 'bar',
                datalabel_color: 'white',
                datalabel_offset: 12,
                datalabel_show: true,
                datalabel_borderRadius: 15,
                datalabel_steps: 1,
                datalabel_fontSize: 12,
                datalabel_minDigits: 0,
                datalabel_maxDigits: 0,
                color: 'green',
                line_PointColor: 'green',
                line_PointColorBorder: 'green',
                line_pointSize: 0,
                line_Thickness: 3,
                legendText: 'PV-Leistung',
                yAxis_id: 0,
                yAxis_gridLines_show: true,
                yAxis_gridLines_border_show: true,
                yAxis_gridLines_ticks_show: true,
                yAxis_showTicks: false,
                yAxis_zeroLineWidth: 0.4,
                line_UseFillColor: false,
                line_FillBetweenLines: '+1'
            }
        ]
    }
    await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${mm}`,JSON.stringify(chart),true);
}

// Funktion erstellt eine Sicherungsdatei der History JSON vom letzten Monat
async function writelog() {
    let date = new Date();
    let mm = date.getMonth();
    let Jahr = date.getFullYear();
    if (mm === 0) {
        mm = 12;
        Jahr -= 1;
    }
    let MM = mm.toString().padStart(2, "0");
    
    // Annahme: getStateAsync und fsw sind korrekt definiert
    let historyJSON = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${MM}`)).val;
    let logString = `${MM}.${Jahr}\n${historyJSON}\n`;

    if (logflag === true) {
        try {
            await fs.appendFile(sLogPath, logString);
        } catch (err) {
            logChargeControl("-==== History lokal sichern: Routine writelog - Logfile nicht gefunden - wird angelegt ====-",'info');
            await fs.writeFile(sLogPath, logString);
        }
    }

    await setStateAsync(sID_AnzeigeHistoryMonat, date.getMonth() + 1); // Anzeige VIS auf aktuelles Monat einstellen
}

// Verfügbare Speichergröße in kWh berechnen
async function Speichergroesse()
{
    let Kapa_Bat_Wh
    if (existsState(sID_SPECIFIED_Battery_Capacity_1)){
        Kapa_Bat_Wh = (await getStateAsync(sID_SPECIFIED_Battery_Capacity_0)).val+(await getStateAsync(sID_SPECIFIED_Battery_Capacity_1)).val;
    }else{
        Kapa_Bat_Wh = (await getStateAsync(sID_SPECIFIED_Battery_Capacity_0)).val
    }
    let ASOC_Bat_Pro = (await getStateAsync(sID_BAT0_Alterungszustand)).val;
    // E3DC verwendet ca. 10% der Batteriekapazität um sicherzustellen das diese nie ganz entladen wird.
    Kapa_Bat_Wh = Kapa_Bat_Wh * (Entladetiefe_Pro/100);
    Speichergroesse_kWh = round(((Kapa_Bat_Wh/100)*ASOC_Bat_Pro)/1000,0);
    logChargeControl(`-==== Speichergroesse_kWh=${Speichergroesse_kWh} ====-`,"info");
}

// Freie Batterie Speicherkapazität in kWh berechnen, Parameter BatterieSoC in %
function Batterie_kWh(BatterieSoC)
{
    let Ergebniss = 0;
    Ergebniss = Speichergroesse_kWh-((Speichergroesse_kWh/100)*BatterieSoC);
    return round(Ergebniss, 2);
}; 


// kWh in % Speichergröße umrechnen, Parameter wert in %
function BatterieProzent(wert)
{
    let Ergebniss = 0;
    Ergebniss = wert/(Speichergroesse_kWh/100);
    return Ergebniss;
}; 

// Runden. Parameter float digit, int digits Anzahl der Stellen
function round(digit, digits) {
    digit = (Math.round(digit * Math.pow(10, digits)) / Math.pow(10, digits));
    return digit;
}


// Addiert zum Datum x Tage und liefert das Datum im Format yyyy-mm-dd
function nextDayDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('sv-SE');
}


// Addiert zum Tag x Tage und liefert den Tag
function nextDay(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const day = date.getDate();

    return `${day}`;
}


// Summe PV Leistung berechnen Leistungszähler 0 und Leistungszähler 1
async function SummePvLeistung(){   
    if(!bStart){
        let DatumAk = new Date();
	    //let TagHeute = DatumAk.getDate().toString().padStart(2,"0");
	    let TagHeute = DatumAk.getDate();
        let IstPvLeistung0_kWh = 0;
	    let IstPvLeistung1_kWh = 0;
	    let IstPvLeistung_kWh = 0;
	
        if (existsState(sID_PVErtragLM0)){
	        IstPvLeistung0_kWh = parseFloat((await getStateAsync(sID_PVErtragLM0)).val);
	    }
	    if (existsState(sID_PVErtragLM1)){
	        IstPvLeistung1_kWh = parseFloat((await getStateAsync(sID_PVErtragLM1)).val);
	    }
	    IstPvLeistung_kWh = IstPvLeistung0_kWh + IstPvLeistung1_kWh;
	    arrayPV_LeistungTag_kWh[TagHeute] = IstPvLeistung_kWh
        await setStateAsync(sID_arrayPV_LeistungTag_kWh, JSON.stringify(arrayPV_LeistungTag_kWh));
    
        await makeJson();
    }
};

// Methode zum Addieren/Subtrahieren einer Menge an Minuten auf eine Uhrzeit
// time = Uhrzeit im Format HH:MM
// offset = Zeit in Minuten
function addMinutes(time, offset) {
    // Uhrzeit in Stunden und Minuten teilen
    let [hours, minutes] = time.split(":").map(Number);
    
    // Umrechnen der Uhrzeit in Minuten seit Tagesbeginn
    let timeSince24 = hours * 60 + minutes + Math.round(offset);

    // Überlaufbehandlung für negative und große Werte
    timeSince24 = ((timeSince24 % 1440) + 1440) % 1440;

    // Errechnen von Stunden und Minuten aus der Gesamtzeit seit Tagesbeginn
    let resHours = Math.floor(timeSince24 / 60);
    let resMinutes = timeSince24 % 60;

    // Sicherstellen, dass der Wert für Minuten immer zweistellig ist
    let sMinuten = resMinutes.toString().padStart(2, "0");

    // Ausgabe des formatierten Ergebnisses
    return `${resHours}:${sMinuten}`;
}

// Daten der Webseite Proplanta abrufen
const InterrogateProplanta = async () => {
    try {
        const response = await axios.get(baseurl);
        if (response.status >= 200 && response.status <= 206 && response.data != null) {
            if (bLogAusgabe){logChargeControl(`Rueckmeldung InterrogateProplanta response.status = ${response.status}`,"info");}
            return response.data;
        } else {
            throw new Error(`Error Proplanta, status code = ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error Proplanta: ${error.message}`);
    }
};


async function SheduleProplanta() { 
    if (!baseurl) {
        logChargeControl(`-==== falsche Länderbezeichnung! ====-`,"info");
        return;
    }
    const statePaths = [
        `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_`,
        `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_`,
        `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_`,
        `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`,
        `${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`
    ];
    // alle alten Werte löschen
    const resetPromises = [];
    for (let i = 0; i <= 6; i++) {
        resetPromises.push(setStateAsync(`${statePaths[0]}${i}`, 'null'));
        if (i <= 3) {
            resetPromises.push(setStateAsync(`${statePaths[1]}${i}`, NaN));
            resetPromises.push(setStateAsync(`${statePaths[2]}${i}`, NaN));
        }
    }
    resetPromises.push(setStateAsync(statePaths[3], NaN)); //Bewoelkungsgrad_12
    resetPromises.push(setStateAsync(statePaths[4], NaN)); //Bewoelkungsgrad_15
    // parallele asynchrone Aufrufe abwarten
    await Promise.all(resetPromises);
    if (bLogAusgabe){logChargeControl(` ******************* Es wird die Globalstrahlung ab Tag 0 von Proplanta abgerufen ******************* `,"info");}
    // Url mit Länderbezeichnung zusammenstellen
    baseurl = baseurl.replace(/#PLZ#/ig, ProplantaPlz).replace(/#ORT#/ig, ProplantaOrt).replace(/&wT=4/ig, '&wT=0');
    
    await InterrogateProplanta().then(async function(result0){
        let GlobalstrahlungTag0,GlobalstrahlungTag1,GlobalstrahlungTag2,GlobalstrahlungTag3;
        let ArrayBereinig = await HTML_CleanUp(result0)    
            
        // Prüfen ob Globalstrahlung für heute in eine Zahl umgewandelt werden kann,wenn nicht noch mal nach 1 Stunde abrufen
        if (isNaN(parseFloat(ArrayBereinig[13]))){
            GlobalstrahlungTag0 = 0;
            //xhr.abort
            let d = new Date();
            let uhrzeit = addMinutes(d.getHours() + ":" + d.getMinutes(), 60)
            await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`,uhrzeit);
            if (bLogAusgabe){logChargeControl(`Näste Aktualisierung Wetterdaten =${uhrzeit} Uhr `,"info");}
        }else{
            let Tag0 = nextDay(0), Tag1 = nextDay(1),Tag2 = nextDay(2), Tag3 =nextDay(3);
            // Prüfen ob Werte in eine Zahl umgewandelt werden können,wenn nicht 0 zuweisen     
            for (let i=0; i < ArrayBereinig.length; i++) {
                //if (LogAusgabe){log(`i =${i} Wert ab Tag 0=${ArrayBereinig[i]}`);}
                    
                if (ArrayBereinig[i] == 'Globalstrahlung'){
                    if (isNaN(parseFloat(ArrayBereinig[i+1]))){GlobalstrahlungTag0 = 0;}else{GlobalstrahlungTag0 = parseFloat(ArrayBereinig[i+1]);}      
                    if (isNaN(parseFloat(ArrayBereinig[i+2]))){GlobalstrahlungTag1 = 0;}else{GlobalstrahlungTag1 = parseFloat(ArrayBereinig[i+2]);}      
                    if (isNaN(parseFloat(ArrayBereinig[i+3]))){GlobalstrahlungTag2 = 0;}else{GlobalstrahlungTag2 = parseFloat(ArrayBereinig[i+3]);}      
                    if (isNaN(parseFloat(ArrayBereinig[i+4]))){GlobalstrahlungTag3 = 0;}else{GlobalstrahlungTag3 = parseFloat(ArrayBereinig[i+4]);}      
                }
                if (ArrayBereinig[i] == 'Datum'){
                    if (/^\d{2}([./-])\d{2}\1\d{4}$/.test(ArrayBereinig[i+1] )){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_0`, ArrayBereinig[i+1]);}
                    if (/^\d{2}([./-])\d{2}\1\d{4}$/.test(ArrayBereinig[i+3] )){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_1`, ArrayBereinig[i+3]);}
                    if (/^\d{2}([./-])\d{2}\1\d{4}$/.test(ArrayBereinig[i+5] )){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_2`, ArrayBereinig[i+5]);}
                    if (/^\d{2}([./-])\d{2}\1\d{4}$/.test(ArrayBereinig[i+7] )){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_3`, ArrayBereinig[i+7]);}
                }
                if (ArrayBereinig[i] == 'Bedeckungsgrad'){
                    if (isNaN(parseFloat(ArrayBereinig[i+2]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`, parseFloat(ArrayBereinig[i+2]));}      
                    if (isNaN(parseFloat(ArrayBereinig[i+7]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`, parseFloat(ArrayBereinig[i+7]));}
                }
                if (ArrayBereinig[i] == 'max. Temperatur'){
                    if (isNaN(parseFloat(ArrayBereinig[i+1]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_0`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_0`, parseFloat(ArrayBereinig[i+1]));}      
                    if (isNaN(parseFloat(ArrayBereinig[i+2]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_1`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_1`, parseFloat(ArrayBereinig[i+2]));}      
                    if (isNaN(parseFloat(ArrayBereinig[i+3]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_2`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_2`, parseFloat(ArrayBereinig[i+3]));}      
                    if (isNaN(parseFloat(ArrayBereinig[i+4]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_3`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_3`, parseFloat(ArrayBereinig[i+4]));}      
                } 
                if (ArrayBereinig[i] == 'min. Temperatur'){
                    if (isNaN(parseFloat(ArrayBereinig[i+1]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_0`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_0`, parseFloat(ArrayBereinig[i+1]));}      
                    if (isNaN(parseFloat(ArrayBereinig[i+2]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_1`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_1`, parseFloat(ArrayBereinig[i+2]));}      
                    if (isNaN(parseFloat(ArrayBereinig[i+3]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_2`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_2`, parseFloat(ArrayBereinig[i+3]));}      
                    if (isNaN(parseFloat(ArrayBereinig[i+4]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_3`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_3`, parseFloat(ArrayBereinig[i+4]));}      
                }
                
            }
                      
            // Proplanta Globalstrahlung in kWh umrechnen und in History speichern *********************************************************  
            if (bLogAusgabe){logChargeControl(` Globalstrahlung Tag0 =${GlobalstrahlungTag0}  Globalstrahlung Tag1 =${GlobalstrahlungTag1}  Globalstrahlung Tag2 =${GlobalstrahlungTag2}  Globalstrahlung Tag3 =${GlobalstrahlungTag3}`,"info");}
            let PrognoseProplanta_kWh_Tag0 = (GlobalstrahlungTag0 * nModulFlaeche) * (nWirkungsgradModule/100);
            let PrognoseProplanta_kWh_Tag1 = (GlobalstrahlungTag1 * nModulFlaeche) * (nWirkungsgradModule/100);
            let PrognoseProplanta_kWh_Tag2 = (GlobalstrahlungTag2 * nModulFlaeche) * (nWirkungsgradModule/100);
            let PrognoseProplanta_kWh_Tag3 = (GlobalstrahlungTag3 * nModulFlaeche) * (nWirkungsgradModule/100);
            arrayPrognoseProp_kWh[Tag0] = PrognoseProplanta_kWh_Tag0
            if (Tag1!= '1'){
                arrayPrognoseProp_kWh[Tag1] = PrognoseProplanta_kWh_Tag1
                if (Tag2!= '1'){
                    arrayPrognoseProp_kWh[Tag2] = PrognoseProplanta_kWh_Tag2
                    if (Tag3!= '1'){
                        arrayPrognoseProp_kWh[Tag3] = PrognoseProplanta_kWh_Tag3
                    }
                }
            }
            
            if (typeof ArrayBereinig[35] !== 'undefined') {
                await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`,ArrayBereinig[35].replace(".",":"));
                if (bLogAusgabe){logChargeControl(` Näste Aktualisierung Wetterdaten =${ArrayBereinig[35].replace(".",":")} Uhr `,"info");}
            } else {
                await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`,"6:00");
                if (bLogAusgabe){logChargeControl(` Näste Aktualisierung Wetterdaten = konnte nicht abgerufen werden. Standard 6:00 Uhr wurde gesetzt `,"info");}
            }
            await setStateAsync(sID_PrognoseProp_kWh,JSON.stringify(arrayPrognoseProp_kWh))   
            
        }
    }, function(error) {
            logChargeControl(` Error in der function InterrogateProplanta. Fehler = ${error} `,"warn");
            // Nach einer Stunde neuer Versuch die Daten abzurufen
            let d = new Date();
            d.setHours (d.getHours() + 1);
            let  uhrzeit = `${d.getHours()}:${d.getMinutes()}`;
            setState(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`,uhrzeit);
            if(bLogAusgabe){logChargeControl(` Näste Aktualisierung Wetterdaten =${uhrzeit} Uhr `,"info");}
    })   
        
    if(bLogAusgabe){logChargeControl(` ******************* Es wird die Globalstrahlung ab Tag 4 von Proplanta abgerufen ******************* `,"info");}
    // Url mit Länderbezeichnung zusammenstellen
    baseurl = baseurl.replace(/#PLZ#/ig, ProplantaPlz).replace(/#ORT#/ig, ProplantaOrt).replace(/&wT=0/ig, "&wT=4");
    await InterrogateProplanta().then(async function(result4){
        let GlobalstrahlungTag4,GlobalstrahlungTag5,GlobalstrahlungTag6;
        let ArrayBereinig = await HTML_CleanUp(result4)    
            
        for (let i=0; i < ArrayBereinig.length; i++) {
            //log(`i =${i} Wert ab Tag 4=${ArrayBereinig[i]}`);
            if (ArrayBereinig[i] == 'Globalstrahlung'){
                if (isNaN(parseFloat(ArrayBereinig[i+1]))){GlobalstrahlungTag4 = 0;}else{GlobalstrahlungTag4 = parseFloat(ArrayBereinig[i+1]);}      
                if (isNaN(parseFloat(ArrayBereinig[i+2]))){GlobalstrahlungTag5 = 0;}else{GlobalstrahlungTag5 = parseFloat(ArrayBereinig[i+2]);}      
                if (isNaN(parseFloat(ArrayBereinig[i+3]))){GlobalstrahlungTag6 = 0;}else{GlobalstrahlungTag6 = parseFloat(ArrayBereinig[i+3]);} 
            }
            if (ArrayBereinig[i] == 'Datum'){
                if (/^\d{2}([./-])\d{2}\1\d{4}$/.test(ArrayBereinig[i+1] )){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_4`, ArrayBereinig[i+1]);}
                if (/^\d{2}([./-])\d{2}\1\d{4}$/.test(ArrayBereinig[i+3] )){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_5`, ArrayBereinig[i+3]);}
                if (/^\d{2}([./-])\d{2}\1\d{4}$/.test(ArrayBereinig[i+5] )){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_6`, ArrayBereinig[i+5]);}
            }
        }
            
        let Tag0 = nextDay(4), Tag1 = nextDay(5),Tag2 = nextDay(6);
        // Prüfen ob Werte in eine Zahl umgewandelt werden können,wenn nicht 0 zuweisen     
               
        // Proplanta Globalstrahlung in kWh umrechnen und in History speichern *********************************************************  
        if(bLogAusgabe){logChargeControl(` Globalstrahlung Tag4 =${GlobalstrahlungTag4}  Globalstrahlung Tag5 =${GlobalstrahlungTag5}  Globalstrahlung Tag6 =${GlobalstrahlungTag6}`,"info");}
        let PrognoseProplanta_kWh_Tag4 = (GlobalstrahlungTag4 * nModulFlaeche) * (nWirkungsgradModule/100);
        let PrognoseProplanta_kWh_Tag5 = (GlobalstrahlungTag5 * nModulFlaeche) * (nWirkungsgradModule/100);
        let PrognoseProplanta_kWh_Tag6 = (GlobalstrahlungTag6 * nModulFlaeche) * (nWirkungsgradModule/100);
        if (Tag0!= '1'){
            arrayPrognoseProp_kWh[Tag0] = PrognoseProplanta_kWh_Tag4
            if (Tag1!= '1'){
                arrayPrognoseProp_kWh[Tag1] = PrognoseProplanta_kWh_Tag5
                if (Tag2!= '1'){
                    arrayPrognoseProp_kWh[Tag2] = PrognoseProplanta_kWh_Tag6
                }
            }
        }
        await setStateAsync(sID_PrognoseProp_kWh,JSON.stringify(arrayPrognoseProp_kWh))   
        
    }, function(error) {
        logChargeControl(`-==== Error in der function InterrogateProplanta. Fehler = ${error} ====- `,"warn");
        // Nach einer Stunde neuer Versuch die Daten abzurufen
        let d = new Date(), Stunde = d.getHours();
        d.setHours (Stunde + 1);
        let  uhrzeit = `${d.getHours()}:${d.getMinutes()}`;
        setState(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`,uhrzeit);
        logChargeControl(` Näste Aktualisierung Wetterdaten =${uhrzeit} Uhr `,"info");
    })
    // Timer für nächsten Abruf starten
    if (TimerProplanta) clearSchedule(TimerProplanta);

    let StartZeit = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`)).val;
    if (StartZeit != null) {
        StartZeit = addMinutes(StartZeit, 10);
        const [hour, minute] = StartZeit.split(':');
        TimerProplanta = schedule({ hour, minute }, SheduleProplanta);
    } else {
        TimerProplanta = schedule({ hour: 3, minute: 0 }, SheduleProplanta);
        logChargeControl(`-==== Nächste Aktualisierung Wetterdaten 3:00 Uhr ====-`,"info");
    }
    if (!bStart) await WetterprognoseAktualisieren();
}

function HTML_CleanUp(data) {
    // Extrahieren der verschiedenen Datenabschnitte
    const maxTemperatur = extractData(data, 'max. Temperatur', 'gef&uuml;hlte max. Temp.');
    const minTemperatur = extractData(data, 'min. Temperatur', 'gef&uuml;hlte min. Temp.');
    const Globalstrahlung = extractData(data, 'Globalstrahlung', '<b>Wetterzustand</b>');
    let Bedeckungsgrad = extractData(data, '<tr id="BD_12" class="BEDECKUNGSGRAD">', '<tr id="BD_18" class="BEDECKUNGSGRAD">');
    Bedeckungsgrad = 'Bedeckungsgrad' + Bedeckungsgrad;
    const Datum = extractData(data, '<b>Datum</b', '<style>');
    const nextAktZeit = extractData(data, 'n&auml;chste Aktualisierung', '', 29, 5);

    // Zusammenfügen der Datenabschnitte
    let StringProplanta = maxTemperatur + minTemperatur + Globalstrahlung + Bedeckungsgrad + Datum + nextAktZeit;
    //log(`StringProplanta = ${StringProplanta}`)
    // HTML-Tags entfernen und Daten bereinigen
    StringProplanta = StringProplanta.replace(/<\/tr>/ig, "\n")
                                      .replace(/<\/table>/ig, "")
                                      .replace(/<\/td>/ig, "|")
                                      .replace(/&deg;C/ig, "")
                                      .replace(/(<script(.|\n|\r)+?<\/script>|<style(.|\n|\r)+?<\/style>)/ig, "")
                                      .replace(/(&nbsp;|<([^>]+)>)/ig, '|')
                                      .replace(/&#48;/g, '0').replace(/&#49;/g, '1').replace(/&#50;/g, '2')
                                      .replace(/&#51;/g, '3').replace(/&#52;/g, '4').replace(/&#53;/g, '5')
                                      .replace(/&#54;/g, '6').replace(/&#55;/g, '7').replace(/&#56;/g, '8')
                                      .replace(/&#57;/g, '9')
                                      .replace(/&#([^;]+);/g, '|')
                                      .replace(/(%|\r)/g, '')
                                      .replace(/(kWh\/qm|\r)/g, '')
                                      .replace(/,/g, '.');

    // Array aus restlichen Daten erstellen
    let ArrayProplanta = StringProplanta.split('|');
    // Alle leeren Werte löschen
    let ArrayBereinigt = ArrayProplanta.filter(e => e.trim() !== "");
    /*for (let i=0; i < ArrayBereinigt.length; i++) {
        if (LogAusgabe){log(`i =${i} Wert ab Tag 0=${ArrayBereinigt[i]}`);}
    } */
    return ArrayBereinigt;
}

// Extrahieren der verschiedenen Datenabschnitte
function extractData(data, startPattern, endPattern, offsetStart = 0, offsetEnd = 0) {
    const startIndex = data.indexOf(startPattern) + offsetStart;
    const endIndex = data.indexOf(endPattern, startIndex) + offsetEnd;
    return data.slice(startIndex, endIndex);
}

const InterrogateSolcast = async (DachFl) => {
    if (DachFl !== 1 && DachFl !== 2) {
        throw new Error('Invalid DachFl value, must be 1 or 2');
    }
    const url = `https://api.solcast.com.au/rooftop_sites/${Resource_Id_Dach[DachFl]}/forecasts?format=json&api_key=${SolcastAPI_key}&hours=168`;
    try {
        const response = await axios.get(url);
        if (response.status >= 200 && response.status <= 206) {
            logChargeControl(` Rueckmeldung response.status Solcast= ${response.status}`,"info");
            return response.data;
        } else {
            throw new Error(`Error, status code = ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
};

// Prognose Solcast abrufen.
async function SheduleSolcast(DachFl) { 
    if (DachFl <= 0 || DachFl > 2) return;
    const dAkt = new Date();
    const hours = dAkt.getHours();
    const Monat = nextDayDate(0).slice(5, 7); // Monat vom ersten Tag merken
    const processResult = async (result, z) => {
        const ArrayTageswerte = result['forecasts'];
        for (let d = 0; d < 7; d++) {
            const Datum = nextDayDate(d);
            ArrayTageswerte.forEach(entry => {
                if (entry.period_end.includes(Datum)) {
                    SummePV_Leistung_Tag_kW[1][d] += entry.pv_estimate;
                    SummePV_Leistung_Tag_kW[3][d] += entry.pv_estimate90;
                }
            });

            if (z === 1) {
                const Prognose = round(SummePV_Leistung_Tag_kW[1][d] / 2, 2);
                const Prognose90 = round(SummePV_Leistung_Tag_kW[3][d] / 2, 2);
                logChargeControl(` Summe PV Leistung Tag ${Datum} pv_estimate= ${Prognose} pv_estimate90= ${Prognose90}`,"info");
                if (Datum.slice(5, 7) === Monat && (hours <= 4 || d !== 0)) {
                    arrayPrognoseSolcast_kWh[nextDay(d)] = Prognose
                    arrayPrognoseSolcast90_kWh[nextDay(d)] = Prognose90
                    await setStateAsync(sID_PrognoseSolcast_kWh,JSON.stringify(arrayPrognoseSolcast_kWh))
                    await setStateAsync(sID_PrognoseSolcast90_kWh,JSON.stringify(arrayPrognoseSolcast90_kWh))
                }
                SummePV_Leistung_Tag_kW[1][d] = 0;
                SummePV_Leistung_Tag_kW[3][d] = 0;
            }
        }
    };

    const requests = [];
    for (let z = DachFl; z > 0; z--) {
        if (bLogAusgabe){logChargeControl(` ****************************** Es wird Solcast Dach ${z} abgerufen ****************************** `,"info");}
        requests.push(await InterrogateSolcast(z).then(result => processResult(result, z)).catch(error => {
            logChargeControl(`-==== Error in der function InterrogateSolcast. Fehler = ${error} ====-`,"warn");
        }));
    }
    
    await Promise.all(requests);
    if (!bStart) await WetterprognoseAktualisieren();
}


//prüft, ob die aktuelle Uhrzeit im Bereich einer Zeitspanne liegt.
// @author 2020 Stephan Kreyenborg <stephan@kreyenborg.koeln>    
function Zeitbereich(startTime,endTime) {
    var currentDate = new Date();
    var startDate = new Date(currentDate.getTime());
    startDate.setHours(startTime.split(":")[0]);
    startDate.setMinutes(startTime.split(":")[1]);
    if (startTime.split(":")[2]) {
        startDate.setSeconds(startTime.split(":")[2]);
    }
    var endDate = new Date(currentDate.getTime());
    endDate.setHours(endTime.split(":")[0]);
    endDate.setMinutes(endTime.split(":")[1]);
    if (endTime.split(":")[2]) {
        endDate.setSeconds(endTime.split(":")[2]);
    }
    var valid_time_frame = false
    if (endTime > startTime) {
        valid_time_frame = (currentDate >= startDate && currentDate <= endDate) ? true : false;
    } else {
        valid_time_frame = (currentDate >= endDate && currentDate <= startDate) ? false : true;
    }
    return valid_time_frame;
}


// Zeiten Start und Ende 
async function MEZ_Regelzeiten(){
    RB_AstroSolarNoon = new Date(getAstroDate("solarNoon"));
    RE_AstroSolarNoon = new Date(getAstroDate("solarNoon"));
    LE_AstroSunset = new Date(getAstroDate("sunset"));

    let strRegelbeginnOffset = (await getStateAsync(sID_RegelbeginnOffset[EinstellungAnwahl])).val.split(":");
    let RegelbeginnOffset_hours = parseInt(strRegelbeginnOffset[0]); 
    let RegelbeginnOffset_minutes = parseInt(strRegelbeginnOffset[1]);
    let RegelbeginnOffset = -(RegelbeginnOffset_hours * 60 + RegelbeginnOffset_minutes); 
    
    let strRegelendeOffset = (await getStateAsync(sID_RegelendeOffset[EinstellungAnwahl])).val.split(":");
    let RegelendeOffset_hours = parseInt(strRegelendeOffset[0]); 
    let RegelendeOffset_minutes = parseInt(strRegelendeOffset[1]);
    let RegelendeOffset = RegelendeOffset_hours * 60 + RegelendeOffset_minutes; 
    
    let strLadeendeOffset = (await getStateAsync(sID_LadeendeOffset[EinstellungAnwahl])).val.split(":");
    let LadeendeOffset_hours = parseInt(strLadeendeOffset[0]); 
    let LadeendeOffset_minutes = parseInt(strLadeendeOffset[1]);
    let LadeendeOffset = -(LadeendeOffset_hours * 60 + LadeendeOffset_minutes); 

    RB_AstroSolarNoon.setMinutes(RB_AstroSolarNoon.getMinutes() + RegelbeginnOffset)
    RE_AstroSolarNoon.setMinutes(RE_AstroSolarNoon.getMinutes() + RegelendeOffset)
    LE_AstroSunset.setMinutes(LE_AstroSunset.getMinutes() + LadeendeOffset)
    
    const formatTime = (date) => `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    
    // Setze die neuen Zeiten
    await Promise.all([
        setStateAsync(sID_Regelbeginn_MEZ, formatTime(RB_AstroSolarNoon)),
        setStateAsync(sID_Regelende_MEZ, formatTime(RE_AstroSolarNoon)),
        setStateAsync(sID_Ladeende_MEZ, formatTime(LE_AstroSunset))
    ]);
}


// Prüfen ob Notstrom verwendet werden kann bei hoher PV Prognose für den nächsten Tag
async function CheckPrognose(){
    //if (DebugAusgabe){log(`CheckPrognose: Batterie SOC = ${Batterie_SOC_Proz} Notstrom_SOC_Proz= ${Notstrom_SOC_Proz}`)}
    if (Batterie_SOC_Proz <= Notstrom_SOC_Proz){
        const heute = new Date
        const morgen = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate() + 1);
        const Durschnitt_Wh = await Hausverbrauch('night');
        const KapBatterie_Wh = (Speichergroesse_kWh/100)*Batterie_SOC_Proz*1000;
        const sunriseEndTimeHeute_ms = getAstroDate("sunriseEnd").getTime()+Offset_sunriseEnd_min*60000;
        const sunriseEndTimeMorgen_ms = getAstroDate("sunriseEnd",morgen).getTime()+Offset_sunriseEnd_min*60000;
        const ReichweiteMinuten = parseFloat(((KapBatterie_Wh/Durschnitt_Wh)*60).toFixed(0));
        const ReichweiteTime_ms = new Date(heute.getTime() + ReichweiteMinuten*60000).getTime()
        
        // Prüfen ob aktuelle Zeit vor oder nach sunriseEnd liegt
        //if (DebugAusgabe){log(`CheckPrognose: sunriseEnd ms = ${sunriseEndTimeHeute_ms} Aktuelle Zeit ms = ${heute.getTime()}`)}  
        if (sunriseEndTimeHeute_ms < heute.getTime()){
            // Nach Sonnenaufgang
            //if (DebugAusgabe){log(`CheckPrognose: Nach Sonnenaufgang`)}
            let Tag = nextDay(1);
            let PrognoseMorgen_kWh = arrayPrognoseAuto_kWh[Tag]
            //if (DebugAusgabe){log(`CheckPrognose: Reichweite ms =${ReichweiteTime_ms} Reichweite Stunden =${round((ReichweiteTime_ms-heute.getTime())/3600000,2)} sunriseEndTimeMorgen_ms = ${sunriseEndTimeMorgen_ms} sunriseEndTimeMorgen Stunden =${round((sunriseEndTimeMorgen_ms-heute.getTime())/3600000,2)} PrognoseMorgen_kWh =${PrognoseMorgen_kWh} minWertPrognose_kWh =${minWertPrognose_kWh}`)}
            // Prüfen ob die Reichweite Batterie SOC größer ist als Sonnenaufgang + offset
            if(ReichweiteTime_ms > sunriseEndTimeMorgen_ms && PrognoseMorgen_kWh > minWertPrognose_kWh && minWertPrognose_kWh > 0){
                // Batterie reicht bis zum Sonnenaufgang, es kann entladen werden
                bHeuteNotstromVerbraucht = true;
                return true
            }
        }else{
            // Vor Sonnenaufgang
            //if (DebugAusgabe){log(`CheckPrognose: Vor Sonnenaufgang`)}
            let Tag = nextDay(0);
            let PrognoseMorgen_kWh = arrayPrognoseAuto_kWh[Tag]
            //if (DebugAusgabe){log(`CheckPrognose: Reichweite ms =${ReichweiteTime_ms} Reichweite Stunden =${round((ReichweiteTime_ms-heute.getTime())/3600000,2)} sunriseEndTimeHeute_ms = ${sunriseEndTimeHeute_ms} sunriseEndTimeHeute Stunden =${round((sunriseEndTimeHeute_ms-heute.getTime())/3600000,2)} PrognoseMorgen_kWh =${PrognoseMorgen_kWh} minWertPrognose_kWh =${minWertPrognose_kWh}`)}
            // Prüfen ob die Reichweite Batterie SOC größer ist als Sonnenaufgang + offset
            if(ReichweiteTime_ms > sunriseEndTimeHeute_ms && PrognoseMorgen_kWh > minWertPrognose_kWh && minWertPrognose_kWh > 0){
                // Batterie reicht bis zum Sonnenaufgang, es kann entladen werden
                bHeuteNotstromVerbraucht = true;
                return true
            }
    
        }
    }
    // Wenn Notstrom einmal zum entladen freigegeben wurde, soll bis 0 kWh entladen werden
    if (bHeuteNotstromVerbraucht){return true}
    return false
}

// Leistungsmesser0 PV-Leistung E3DC jede minute in W/h umrechen W = P*t
async function Wh_Leistungsmesser0() {
  let AufDieMinute = '* * * * *';
  Timer0 = schedule(AufDieMinute,async () => {
    let Pmin = Summe0 / count0 || 0;
    if (count0 > 0 && Summe0 > 0) {
      await setStateAsync(sID_PVErtragLM0, (await getStateAsync(sID_PVErtragLM0)).val + Pmin / 60 / 1000, true); 
      count0 = Summe0 = 0;
    } else if (count0 === 0 && Summe0 === 0) {
      clearSchedule(Timer0);
      Timer0 = null;
    }
  });
}

// Leistungsmesser1 externe PV-Leistung jede minute in W/h umrechen W = P*t
async function Wh_Leistungsmesser1(){
	let AufDieMinute =  '* * * * *';
	Timer1 = schedule(AufDieMinute,async () => {   
		let Pmin = Summe1/count1;
		if(count1>0 && Summe1 >0){
			await setStateAsync(sID_PVErtragLM1, (await getStateAsync(sID_PVErtragLM1)).val + Pmin/60/1000,true);//kWh
			count1 = Summe1 = 0;
		}else if (count1===0 && Summe1 ===0) {
			clearSchedule(Timer1);
			Timer1=null;
        }  
    });
} 

// Leistungsmesser2 durch Regelung Charge-Control gerettet jede minute in W/h umrechen W = P*t
async function Wh_Leistungsmesser2(){
	let AufDieMinute =  '* * * * *';
	Timer2 = schedule(AufDieMinute,async () => {   
		let Pmin = Summe2/count2;
		if(count2>0 && Summe2 >0){
			await setStateAsync(sID_PVErtragLM2, (await getStateAsync(sID_PVErtragLM2)).val + Pmin/60/1000,true);//kWh
			count2= Summe2 = 0;
		}else if(count2===0 && Summe2 ===0){
				clearSchedule(Timer2);
				Timer2=null;
        }  
    });
} 

async function BatterieLaden(){
    const Akk_max_Charge_Power_W = (await getStateAsync(sID_Max_Charge_Power_W)).val;                       // Aktuell eingestellte Ladeleistung 
    const LadeleistungBat = Akk_max_Charge_Power_W /2;
    await Promise.all([
            setStateAsync(sID_SET_POWER_MODE, 4), // Charge
            setStateAsync(sID_SET_POWER_VALUE_W, LadeleistungBat)
    ]);
}

// Batterie bis auf Notstrom SOC laden
async function LadeNotstromSOC(){
    const nbr_Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val                               // Berechneter Notstrom SOC
    while (!(Batterie_SOC_Proz >= nbr_Notstrom_SOC_Proz)) {
        await BatterieLaden();
        await new Promise(resolve => setTimeout(resolve, 4000)); // alle 5 Sekunde wiederholen sonst übernimmt E3DC die Regelung
        Batterie_SOC_Proz = (await getStateAsync(sID_Batterie_SOC)).val;
        if ((await getStateAsync(sID_Notrom_Status)).val == 4 || (await getStateAsync(sID_Notrom_Status)).val == 1){break;}
    }
    bLadenAufNotstromSOC=false
}

// Funktion zur Berechnung der reinen Hausverbrauchsleistung je Wochentag unterteilt in Tag und Nacht
async function berechneReinenHausverbrauch(powerHome) {
    try {
        const currentTime = Date.now();
        const [
            wallboxLeistung1,
            wallboxLeistung2,
            leistungHeizstab,
            leistungWaermepumpe
        ] = await Promise.all([
            safeGetState(sID_WallboxLadeLeistung_1_W),
            safeGetState(sID_WallboxLadeLeistung_2_W),
            safeGetState(sID_LeistungHeizstab_W),
            safeGetState(sID_LeistungLW_Pumpe_W)
        ]);
        const wb1Power = wallboxLeistung1.val;
        const wb2Power = wallboxLeistung2.val;
        const heizstabPower = leistungHeizstab.val;
        const waermepumpePower = leistungWaermepumpe.val;
        // Berechne die reine Hausverbrauchsleistung
        let reinerHausverbrauch_W = round(powerHome - heizstabPower - waermepumpePower - wb1Power - wb2Power, 0);
        // Sicherstellen, dass der Hausverbrauch ohne Heizstab nicht negativ ist
        reinerHausverbrauch_W = Math.max(reinerHausverbrauch_W, 0);
        count3 ++
	    Summe3 = Summe3 + reinerHausverbrauch_W;
        
        // Prüfen, ob seit der letzten Ausführung 60 Sekunden vergangen sind
        if (currentTime - lastExecutionTime >= 60000) {
            const Pmin = round(Summe3/count3,0)
            const now = new Date();
            const currentDay = now.toLocaleDateString('de-DE', { weekday: 'long' });
            const currentHour = now.getHours();
        
            // Abend (21:00 Uhr bis 05:00 Uhr des nächsten Tages) oder Tag (05:00 Uhr bis 21:00 Uhr)
            const timeInterval = (currentHour >= 21 || currentHour < 5) ? 'night' : 'day';
        
            // Wenn kein Array. Initialisiere es als leeres Array
            if (!Array.isArray(homeConsumption[currentDay][timeInterval])) {homeConsumption[currentDay][timeInterval] = [];}
            if (!Array.isArray(homeAverage[currentDay][timeInterval])) {homeAverage[currentDay][timeInterval] = [];}
        
            if (homeConsumption[currentDay][timeInterval].length >= MAX_ENTRIES) {
            homeConsumption[currentDay][timeInterval].shift();// Entferne den ältesten Eintrag, wenn die maximale Größe erreicht ist
            }
            // Füge den neuen Wert hinzu
            homeConsumption[currentDay][timeInterval].push({
                hour: currentHour,
                value: Pmin
            });
            count3= Summe3 = 0
            // Durchschnitt Hausverbrauch berechnen
            for (const [day, intervals] of Object.entries(homeConsumption)) {
                for (const [interval, values] of Object.entries(intervals)) {
                    const totalConsumption = values.reduce((acc, entry) => acc + entry.value, 0);
                    homeAverage[day][interval] = values.length ? round(totalConsumption / values.length, 0) : 0;
                }
            }
            // Anzeige für VIS
            await setStateAsync(sID_EigenverbrauchDurchschnitt,`${homeAverage[currentDay]['day']} W / ${homeAverage[currentDay]['night']} W`)
            await Promise.all([
                setStateAsync(sID_arrayHausverbrauchDurchschnitt, JSON.stringify(homeAverage)),
                setStateAsync(sID_arrayHausverbrauch, JSON.stringify(homeConsumption)),
            ]);
            lastExecutionTime = currentTime;
        }   
        // Wert in den Buffer einfügen
        hausverbrauchBuffer.push(reinerHausverbrauch_W);
        
        // Buffergröße begrenzen
        if (hausverbrauchBuffer.length > BUFFER_SIZE) {
            hausverbrauchBuffer.shift(); // Ältesten Wert entfernen
        }

        // Gleitenden Durchschnitt berechnen
        const averageReinerHausverbrauch_W = round(hausverbrauchBuffer.reduce((acc, val) => acc + val, 0) / hausverbrauchBuffer.length,0);
        
        // Durchschnitt verwenden wenn der Berechnete Hausverbrauch 0 W ist
        reinerHausverbrauch_W = (reinerHausverbrauch_W == 0) ? averageReinerHausverbrauch_W : reinerHausverbrauch_W;
        
        // Speichere das Ergebnis
        await Promise.all([
            setStateAsync(sID_HausverbrauchBereinigt_W, reinerHausverbrauch_W)
        ]);
        
    } catch (error) {
        logChargeControl(`Fehler bei der Berechnung des reinen Hausverbrauchs: ${error.message}`,'error');
    }
}

// Prüft IDs vorab auf Gültigkeit
async function safeGetState(id) {
    if (!id) return { val: 0 };

    if (!(id in idCache)) {
        try {
            const obj = existsObject(id);
            idCache[id] = !!obj;
            if (!obj) {
                logChargeControl(`⚠️ Ungültige State-ID: ${id} ⚠️`,'warn');
            }
        } catch (err) {
            logChargeControl(`⚠️ Fehler beim Prüfen von State-ID ${id}:${err.message} ⚠️`, 'warn');
            idCache[id] = false;
        }
    }

    if (!idCache[id]) return { val: 0 };

    try {
        const state = await getStateAsync(id);
        return state && typeof state.val !== 'undefined' ? state : { val: 0 };
    } catch (err) {
        logChargeControl(`⚠️ Fehler beim Lesen von State ${id}:${err.message} ⚠️`, 'warn');
        return { val: 0 };
    }
}

// Funktion gibt den Hausverbrauch vom aktuellen Tag oder Nacht zurück
async function Hausverbrauch(timeInterval) {
    if (!['night', 'day'].includes(timeInterval)) {
        logChargeControl('Ungültiges Zeitintervall. Verwenden Sie "night" oder "day".','error');
        return;
    }
    
    if (!homeAverage) {
        logChargeControl('⚠️ Keine Daten im averageConsumption vorhanden. ⚠️','warn');
        return 0;
    }
    
    const now = new Date();
    const currentDay = now.toLocaleDateString('de-DE', { weekday: 'long' });

    // Prüfen, ob für den aktuellen Tag Daten vorhanden sind
    if (homeAverage[currentDay] && homeAverage[currentDay][timeInterval] !== undefined) {
        const consumption = homeAverage[currentDay][timeInterval];
        if (bDebugAusgabeDetail){log(`Verbrauch für ${timeInterval} am ${currentDay}: ${consumption} Wh`);}
        return consumption;
    } else {
        logChargeControl(`⚠️ Keine Verbrauchsdaten für ${timeInterval} am ${currentDay} vorhanden. ⚠️`,'warn');
        return 0;
    }
}

// Funktion zur Protokollierung von Fehlern
function logError(message, id) {
    logChargeControl(` Die Objekt ID = ${id} ${message} `,"error");
}

// Funktion zur Berechnung der Reichweite basierend auf dem aktuellen Verbrauch oder dem Durchschnittsverbrauch
async function calculateBatteryRange(currentConsumptionW) {
    // Setze currentConsumptionW auf 0, wenn es null, undefined oder kleiner als 0 is
    currentConsumptionW = (currentConsumptionW == null || currentConsumptionW >= 0) ? 0 : currentConsumptionW;
    const akt_Autonomiezeit = (await getState(sID_Autonomiezeit)).val
    if (!homeAverage) {
        console.error('Keine Daten im homeAverage vorhanden.');
        return;
    }
    // Hilfsfunktion zum Erhalten des Tagesnamens
    function getDayString(date, weekday) {
        return date.toLocaleDateString('de-DE', { weekday });
    }

    const now = new Date();
    const currentDay = getDayString(now, 'long');
    const currentHour = now.getHours();
    const nextDay = new Date(now);
    nextDay.setDate(now.getDate() + 1);
    const nextDayString = getDayString(nextDay, 'long');
    const lastDay = new Date(now);
    lastDay.setDate(now.getDate() - 1);
    const lastDayString = getDayString(lastDay, 'long');

    // Berechnung der aktuellen Batteriekapazität in kWh basierend auf dem SOC
    const batterieSocProzent = (await getStateAsync(sID_Batterie_SOC)).val;
    const batterieSocKWh = (Speichergroesse_kWh / 100) * batterieSocProzent;
    // Berechnung der Notstromreserve in kWh
    let notstromKWh= (await getStateAsync(sID_PARAM_EP_RESERVE_W)).val / 1000;
    if (Notstrom_SOC_Proz != 0) {
        notstromKWh = (Speichergroesse_kWh / 100) * Notstrom_SOC_Proz;
    }
    // prüfen ob eingestellter Notstrom unterschritten wurde, wenn ja bei der Reichweite nicht mehr berücksichtigen
    if(notstromKWh > batterieSocKWh){notstromKWh = 0}
    // Berechnung der verfügbaren kWh unter Berücksichtigung der Notstromreserve und des Wirkungsgrads
    let verfuegbareKWh = (batterieSocKWh - notstromKWh) * (Systemwirkungsgrad_Pro / 100);
    const battkWh = verfuegbareKWh;
    // Verbrauchswerte für die Zeitintervalle night und day oder aktuellen Verbrauch wenn nicht vorhanden
    const consumption = {
        currentDayNightW: homeAverage[currentDay]?.['night'] ?? currentConsumptionW ?? 0,
        nextDayDayW: homeAverage[nextDayString]?.['day'] ?? currentConsumptionW ?? 0,
        nextDayNightW: homeAverage[nextDayString]?.['night'] ?? currentConsumptionW ?? 0,
        currentDayDayW: homeAverage[currentDay]?.['day'] ?? currentConsumptionW ?? 0,
        lastDayNightW: homeAverage[lastDayString]?.['night'] ?? currentConsumptionW ?? 0
    };
    // Prüfen, ob einer der Werte 0 ist und die Funktion beenden
    if (Object.values(consumption).some(value => value === 0)) {
        console.error('Verbrauchswert ist 0. Die Reichweite kann nicht berechnet werden.');
        return;
    }

    // Berechnung der Reichweite
    let totalRangeMinutes = 0, consumptionKWh = 0, rangeMinutes = 0;
        
    // Berechnung von 00:00 Uhr bis 5:00 Uhr
    if (currentHour <= 5) {
        // Berechnung bis 5:00 Uhr
        rangeMinutes = (verfuegbareKWh * 1000) / consumption.lastDayNightW * 60;
        if(rangeMinutes > (5 - currentHour)*60){
            consumptionKWh = ((5 - currentHour) * consumption.lastDayNightW) / 1000;
            rangeMinutes = (5 - currentHour)*60
        }else{
            consumptionKWh = ((rangeMinutes/60) * consumption.lastDayNightW) / 1000;
        }
        totalRangeMinutes += rangeMinutes;
        verfuegbareKWh -= consumptionKWh;
        if (verfuegbareKWh > 0) {
            // Berechnung von 5:00 Uhr bis 21:00 Uhr
            rangeMinutes = (verfuegbareKWh * 1000) / consumption.currentDayDayW * 60;
            if(rangeMinutes > 16*60){
                consumptionKWh = (16 * consumption.currentDayDayW) / 1000;
                rangeMinutes = 16*60
            }else{
               consumptionKWh = ((rangeMinutes/60) * consumption.currentDayDayW) / 1000;
            }
            totalRangeMinutes += rangeMinutes;
            verfuegbareKWh -= consumptionKWh;
            if (verfuegbareKWh > 0) {
                // Berechnung von 21:00 Uhr bis 5:00 Uhr
                rangeMinutes = (verfuegbareKWh * 1000) / consumption.currentDayNightW * 60;
                if(rangeMinutes > 8*60){
                    consumptionKWh = (8 * consumption.currentDayNightW) / 1000;
                    rangeMinutes = 8*60
                }else{
                    consumptionKWh = ((rangeMinutes/60) * consumption.currentDayNightW) / 1000;
                }
                totalRangeMinutes += rangeMinutes;
                verfuegbareKWh -= consumptionKWh;
                if (verfuegbareKWh > 0) {
                    // Berechnung nächster Tag von 5:00 Uhr bis 21:00 Uhr    
                    rangeMinutes = (verfuegbareKWh * 1000) / consumption.nextDayNightW * 60;
                    if(rangeMinutes > 16*60){
                        consumptionKWh = (16 * consumption.nextDayNightW) / 1000;
                        rangeMinutes = 16*60
                    }else{
                        consumptionKWh = ((rangeMinutes/60) * consumption.nextDayNightW) / 1000;
                    }
                    totalRangeMinutes += rangeMinutes;
                    verfuegbareKWh -= consumptionKWh;
                }
            }
        }
    } else if (currentHour <= 21) {
        // Berechnung von 05:01 Uhr bis 21:00 Uhr
        rangeMinutes = (verfuegbareKWh * 1000) / consumption.currentDayDayW * 60;
        if(rangeMinutes > (5 + 16 - currentHour)*60){
            consumptionKWh = ((5 + 16 - currentHour) * consumption.currentDayDayW) / 1000;
            rangeMinutes = (5 + 16 - currentHour)*60
        }else{
            consumptionKWh = ((rangeMinutes/60) * consumption.currentDayDayW) / 1000;
        }
        totalRangeMinutes += rangeMinutes;
        verfuegbareKWh -= consumptionKWh;
        if (verfuegbareKWh > 0) {
            // Berechnung von 21:00 Uhr bis 5:00 Uhr
            rangeMinutes = (verfuegbareKWh * 1000) / consumption.currentDayNightW * 60;
            if(rangeMinutes > 8*60){
                consumptionKWh = (8 * consumption.currentDayNightW) / 1000;
                rangeMinutes = 8*60
            }else{
               consumptionKWh = ((rangeMinutes/60) * consumption.currentDayNightW) / 1000;
            }
            totalRangeMinutes += rangeMinutes;
            verfuegbareKWh -= consumptionKWh;
            if (verfuegbareKWh > 0) {
                // Berechnung nächster Tag von 5:00 Uhr bis 21:00 Uhr
                rangeMinutes = (verfuegbareKWh * 1000) / consumption.nextDayDayW * 60;
                if(rangeMinutes > 16*60){
                    consumptionKWh = (16 * consumption.nextDayDayW) / 1000;
                    rangeMinutes = 16*60
                }else{
                    consumptionKWh = ((rangeMinutes/60) * consumption.nextDayDayW) / 1000;
                }
                totalRangeMinutes += rangeMinutes;
                verfuegbareKWh -= consumptionKWh;
                if (verfuegbareKWh > 0) {
                    // Berechnung nächster Tag von 21:00 Uhr bis 5:00 Uhr  
                    rangeMinutes = (verfuegbareKWh * 1000) / consumption.nextDayNightW * 60;
                    if(rangeMinutes > 8*60){
                        consumptionKWh = (8 * consumption.nextDayNightW) / 1000;
                        rangeMinutes = 8*60
                    }else{
                        consumptionKWh = ((rangeMinutes/60) * consumption.nextDayNightW) / 1000;
                    }
                    totalRangeMinutes += rangeMinutes;
                    verfuegbareKWh -= consumptionKWh;
                }
            }
        }
    } else if (currentHour > 21) {
        // Berechnung von 21:01 Uhr bis nächster Tag 5:00 Uhr
        rangeMinutes = (verfuegbareKWh * 1000) / consumption.currentDayNightW * 60;
        if(rangeMinutes > (5 + 24 - currentHour)*60){
            consumptionKWh = ((5 + 24 - currentHour) * consumption.currentDayNightW) / 1000;
            rangeMinutes = (5 + 24 - currentHour) * 60
        }else{
            consumptionKWh = ((rangeMinutes/60) * consumption.currentDayNightW) / 1000;
        }
        totalRangeMinutes += rangeMinutes;
        verfuegbareKWh -= consumptionKWh;
        if (verfuegbareKWh > 0) {
            // Berechnung nächster Tag von 5:00 Uhr bis 21:00 Uhr
            rangeMinutes = (verfuegbareKWh * 1000) / consumption.nextDayDayW * 60;
            if(rangeMinutes > 16*60){
                consumptionKWh = (16 * consumption.nextDayDayW) / 1000;
                rangeMinutes = 16*60
            }else{
               consumptionKWh = ((rangeMinutes/60) * consumption.nextDayDayW) / 1000;
            }
            totalRangeMinutes += rangeMinutes;
            verfuegbareKWh -= consumptionKWh;
            if (verfuegbareKWh > 0) {
                // Berechnung nächster Tag von 21:00 Uhr bis 5:00 Uhr
                rangeMinutes = (verfuegbareKWh * 1000) / consumption.nextDayNightW * 60;
                if(rangeMinutes > 8*60){
                    consumptionKWh = (8 * consumption.nextDayNightW) / 1000;
                    rangeMinutes = 8*60
                }else{
                    consumptionKWh = ((rangeMinutes/60) * consumption.nextDayNightW) / 1000;
                }
                totalRangeMinutes += rangeMinutes;
                verfuegbareKWh -= consumptionKWh;
            }
        }
    }else{
        console.error('Keine Daten currentHour vorhanden.');
        return;
    }
    
    // Umwandlung der Reichweite in Stunden und Minuten
    const totalHours = Math.floor(totalRangeMinutes / 60);
    const totalMinutes = Math.round(totalRangeMinutes % 60);
    
    
    let currentRangeHours
    if (currentConsumptionW !== 0) {
       currentRangeHours = (battkWh * 1000) / Math.abs(currentConsumptionW);
    } else {
       currentRangeHours = totalRangeMinutes / 60
    }
    const currentHours = Math.floor(currentRangeHours);
    const currentMinutes = Math.round((currentRangeHours - currentHours) * 60);
    
    // Aktualisierung der Autonomiezeit, wenn sich die Reichweite signifikant geändert hat
    //if(akt_Autonomiezeit != `${currentHours}:${currentMinutes.toString().padStart(2,"0")} h / ${totalHours}:${totalMinutes.toString().padStart(2,"0")} h`){
    if(akt_Autonomiezeit != `${currentHours}:${currentMinutes.toString().padStart(2,"0")} h`){
        await setStateAsync(sID_Autonomiezeit, `${currentHours}:${currentMinutes.toString().padStart(2,"0")} h` );
        await setStateAsync(sID_AutonomiezeitDurchschnitt, `${totalHours}:${totalMinutes.toString().padStart(2,"0")} h` );
    }
    
}

// Einstellungen e3dc-rscp Adapter prüfen
async function pruefeAdapterEinstellungen() {
    // Verwende 'await' für asynchrone Funktion
    const e3dc_rscp_Adapter = await getObject(`system.adapter.${instanzE3DC_RSCP}`);
    // @ts-ignore
    const adapterVersion = e3dc_rscp_Adapter.common.version;
        
    // Fehler in der Version 1.4.1 abfangen "PARAM_EP_RESERVE_ENERGY" nicht mehr unter PARAM_0
    if (adapterVersion == "1.4.1"){
        sID_PARAM_EP_RESERVE_W =`${instanzE3DC_RSCP}.EP.PARAM_EP_RESERVE_ENERGY`;                 // Eingestellte Notstrom Reserve E3DC
        logChargeControl(`⚠️ Bitte die e3dc-rscp Adapter Version 1.4.1 updaten ⚠️`,'warn');
    }
    
    // Tags, die geprüft werden sollen
    const tagsToCheckChargeControl = [
        { tag: "TAG_EMS_REQ_POWER_PV"},
        { tag: "TAG_EMS_REQ_POWER_BAT"},
        { tag: "TAG_EMS_REQ_POWER_HOME"},
        { tag: "TAG_EMS_REQ_POWER_GRID"},
        { tag: "TAG_EMS_REQ_POWER_ADD"},
        { tag: "TAG_EMS_REQ_BAT_SOC"},
        { tag: "TAG_EMS_REQ_MODE"},
        { tag: "TAG_EMS_REQ_STATUS"},
        { tag: "TAG_EMS_REQ_POWER_PV_AC_OUT"},
        { tag: "TAG_PM_REQ_POWER_L1"},
        { tag: "TAG_PM_REQ_POWER_L2"},
        { tag: "TAG_PM_REQ_POWER_L3"},
        { tag: "TAG_PM_REQ_ENERGY_L1"},
        { tag: "TAG_PM_REQ_ENERGY_L2"},
        { tag: "TAG_PM_REQ_ENERGY_L3"},
        { tag: "TAG_PVI_REQ_AC_POWER"},
        { tag: "TAG_PVI_REQ_AC_VOLTAGE"},
        { tag: "TAG_PVI_REQ_AC_CURRENT"},
        { tag: "TAG_PVI_REQ_DC_POWER"},
        { tag: "TAG_PVI_REQ_DC_VOLTAGE"},
        { tag: "TAG_PVI_REQ_DC_CURRENT"},
        { tag: "TAG_PVI_REQ_DC_STRING_ENERGY_ALL"},
        { tag: "TAG_SYS_REQ_IS_SYSTEM_REBOOTING"},
        { tag: "TAG_BAT_REQ_TRAINING_MODE"},
        { tag: "TAG_WB_REQ_PM_POWER_L1"},
        { tag: "TAG_WB_REQ_PM_POWER_L2"},
        { tag: "TAG_WB_REQ_PM_POWER_L3"}
    ];

    // Überprüfung der Intervalle
    for (let { tag} of tagsToCheckChargeControl) {
        const item = e3dc_rscp_Adapter.native.polling_intervals.find(interval => interval.tag === tag);
        if (item && item.interval !== `S`) {
            logChargeControl(`⚠️ Bitte die Einstellungen des e3dc-rscp Adapter für ${tag} auf Abfrageintervall 'S' (kurz) setzen. ⚠️`, 'warn');
        }
    }

    // Überprüfung des kurzen Abfrageintervalls
    const pollingIntervalShort = e3dc_rscp_Adapter.native.polling_interval_short;
    if (pollingIntervalShort > 5) {
        logChargeControl(`⚠️ Bitte das kurze Abfrageintervall des e3dc-rscp Adapter auf maximal 5 Sekunden setzen. ⚠️`, 'warn');
    }
    
    
    if(e3dc_rscp_Adapter.native.setpower_interval != 0){
        logChargeControl(`!! Bei den Instanzeinstellungen vom Adapter e3dc-rscp wurde das SET_POWER Wiederholintervall nicht auf 0 eingestellt. Bitte ändern !!`,'error')
        return;
    }


}

async function unsubscribeAll() {
    listeners.forEach(listener => {
        if (listener) unsubscribe(listener);
    });
}

function logChargeControl(message, level) {
    const validLevels = ['info', 'warn', 'error', 'debug'];
    const logLevel = validLevels.includes(level) ? level : 'info';

    const prefix = LogparserSyntax ? '##{"from":"Charge-Control", "message":"' : '';
    const suffix = LogparserSyntax ? '"}##' : '';
    log(`${prefix}${message}${suffix}`, logLevel);
}

//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************

// Funktion, um die Event-Handler zu registrieren
async function registerEventHandlers() {
    if (bStart){return};
    
    
    // Zaehler LM0 PV-Leistung E3DC
    listeners[0] = on(sID_PvLeistung_E3DC_W,async function (obj) {
        let Leistung = (await getStateAsync(obj.id)).val;
        if(Leistung > 0){
		    if(!Timer0)await Wh_Leistungsmesser0();
		    count0 ++
		    Summe0 = Summe0 + Leistung;
	    }
    });
 
    // Zaehler LM1 externe PV-Leistung
    listeners[1] = on(sID_PvLeistung_ADD_W,async function(obj) {
        let Leistung = Math.abs((await getStateAsync(obj.id)).val);
        if(Leistung > 0){
		    if(!Timer1)await Wh_Leistungsmesser1();
		    count1 ++
		    Summe1 = Summe1 + Leistung;
	    }
    });

    // Zaehler LM2 Leistung durch Regelung Charge-Control gerettet 
    listeners[2] = on({id: sID_Saved_Power_W, valGt: 0},async function (obj) {
        if(!Timer2)await Wh_Leistungsmesser2();
        count2 ++
	    Summe2 = Summe2 + obj.state.val;
    });

    // Triggern wenn sich Hausverbrauch Leistung ändert
    listeners[3] = on(sID_Power_Home_W,async function(obj) {
        await berechneReinenHausverbrauch(Math.abs(obj.state.val));
    });
    
    // Triggern wenn sich Einstellung Notstrom E3DC ändert
    listeners[4] = on(sID_PARAM_EP_RESERVE_W,async function(obj) {
        await Notstromreserve();
    });

    // Triggern wenn State bNotstromAusNetz in VIS geändert wird
    listeners[5] = on({id: sID_NotstromAusNetz, change: "ne"}, async function (obj){
	    bNotstromAusNetz = (await getStateAsync(obj.id)).val;
        if(bNotstromAusNetz) {
            if (bLogAusgabe){logChargeControl(` -==== Notstrom SOC aus Netz nachladen eingeschaltet ====- `,"info");}
        }else{
            if (bLogAusgabe){logChargeControl(` -==== Notstrom SOC aus Netz nachladen ausgeschaltet ====- `,"info");}
        }
    });  

    // Triggern wenn State Automatik Prognose in VIS geändert wird
    listeners[6] = on({id: sID_Automatik_Prognose, change: "ne"}, async function (obj){
	    bAutomatikAnwahl = (await getStateAsync(obj.id)).val;
        if(bAutomatikAnwahl) {
            bStoppTriggerEinstellungAnwahl = true;
            await WetterprognoseAktualisieren()
            bStoppTriggerEinstellungAnwahl = false
            await setStateAsync(sID_EinstellungAnwahl,0);
            EinstellungAnwahl = 0
        }else{
            await setStateAsync(sID_EinstellungAnwahl,0);
            EinstellungAnwahl = 0
        }
    });  

    // Triggern wenn manuelle Ladung Batterie eingeschalten wird
    listeners[7] = on({id: sID_Manual_Charge_Energy, change: "ne"}, async function (obj){
	    if ((await getStateAsync(obj.id)).val>0){bManuelleLadungBatt = true}else{bManuelleLadungBatt = false}
     
        if(bManuelleLadungBatt) {
            if (bLogAusgabe){logChargeControl(` -==== manuelles Laden der Batterie ist eingeschalten ====- `,"info");}
            if ((await getStateAsync(sID_Max_Discharge_Power_W)).val == 0 || (await getStateAsync(sID_DISCHARGE_START_POWER)).val == 0 || (await getStateAsync(sID_Max_Charge_Power_W)).val == 0){
                await setStateAsync(sID_Max_Discharge_Power_W, Bat_Discharge_Limit_W)
                await setStateAsync(sID_DISCHARGE_START_POWER, startDischargeDefault)
                await setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
            }
        }else{
            if (bLogAusgabe){logChargeControl(` -==== manuelles Laden der Batterie ist ausgeschalten ====- `,"info");}
        }
    });  

    // Triggern wenn State Automatik Regelung in VIS geändert wird
    listeners[8] = on({id: sID_Automatik_Regelung, change: "ne"}, async function (obj){
	    bAutomatikRegelung = (await getStateAsync(obj.id)).val;
        if(bAutomatikRegelung) {
            if (bLogAusgabe){logChargeControl(` -==== Automatik Laderegelung eingeshaltet ====- `,"info");}
        }else{
            if (bLogAusgabe){logChargeControl(` -==== Automatik Laderegelung gestoppt Laden/Entladen der Batterie ist eingeschaltet ====- `,"info");}
            if ((await getStateAsync(sID_Max_Discharge_Power_W)).val == 0 || (await getStateAsync(sID_DISCHARGE_START_POWER)).val == 0 || (await getStateAsync(sID_Max_Charge_Power_W)).val == 0){
                await setStateAsync(sID_Max_Discharge_Power_W, Bat_Discharge_Limit_W)
                await setStateAsync(sID_DISCHARGE_START_POWER, startDischargeDefault)
                await setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
            }
        }
    });  

    // Triggern bei Änderung Eigenverbrauch soll der Überschuss neu berechnet werden.
    listeners[9] = on({id: sID_EigenverbrauchTag_kWh, change: "ne"}, async function (obj){
	    if (bLogAusgabe){logChargeControl(` -==== Wert Eigenverbrauch wurde auf  ${getState(obj.id).val} kWh geändert ====- `,"info");}
        bStoppTriggerEinstellungAnwahl = true
        await WetterprognoseAktualisieren();
        bStoppTriggerEinstellungAnwahl = false
    });  


    // Triggern wenn State HistorySelect in VIS geändert wird
    listeners[10] = on({id: sID_AnzeigeHistoryMonat, change: "ne"}, async function (obj){
	    let Auswahl = (await getStateAsync(obj.id)).val
        let Auswahl_0 = Auswahl.toString().padStart(2,"0");
        if (Auswahl<=12){
            let JsonString = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${Auswahl_0}`)).val;
            await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON`,JsonString);
        }else{
            logChargeControl(` ⚠️ State ${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistorySelect darf nicht > 12 sein ⚠️ `,"warn");
        }
    }); 

    // Triggern wenn sich an den States HistoryJSON_xx was ändert um in VIS immer das aktuelle 
    // Diagramm anzuzeigen
    listeners[11] = on({id: /\.HistoryJSON_/, change: "ne"}, async function (){	
        let Auswahl = (await getStateAsync(sID_AnzeigeHistoryMonat)).val;
        let Auswahl_0 = Auswahl.toString().padStart(2,"0");
        if (Auswahl<=12){
            let JsonString = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${Auswahl_0}`)).val;
            await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON`,JsonString);
        }else{
            logChargeControl(` ⚠️ State ${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistorySelect darf nicht > 12 sein ⚠️ `,"warn");
        }
    });

    // Triggern wenn sich an den States .USER_ANPASSUNGEN was ändert
    listeners[12] = on({id: /\Charge_Control.USER_ANPASSUNGEN/, change: "ne"}, async function (obj){	
        logChargeControl(`-==== ⚠️ User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ⚠️ ====-`,"warn");
        await CheckState();
        await unsubscribeAll();
        await registerEventHandlers();
    });


    // Triggern bei Änderung der PrognoseAnwahl, Einstellung 0-5 in VIS, jeweilige Prognose abrufen
    listeners[13] = on({id: sID_PrognoseAnwahl, change: "ne"},async function(obj) {
        PrognoseAnwahl = (await getStateAsync(obj.id)).val
        if (PrognoseAnwahl <= 6){
            if(bLogAusgabe && PrognoseAnwahl == 0){logChargeControl("-==== Proplanta u. Solcast angewählt, Berechnung nach min. Wert ====-",'info')};
            if(bLogAusgabe && PrognoseAnwahl == 1){logChargeControl("-==== Proplanta angewählt ====-",'info')};
            if(bLogAusgabe && PrognoseAnwahl == 2){logChargeControl("-==== Solcast angewählt ====-",'info')};
            if(bLogAusgabe && PrognoseAnwahl == 3){logChargeControl("-==== Proplanta u. Solcast angewählt, Berechnung nach max. Wert ====-",'info')};
            if(bLogAusgabe && PrognoseAnwahl == 4){logChargeControl("-==== Proplanta u. Solcast angewählt, Berechnung nach Ø Wert ====-",'info')};
            if(bLogAusgabe && PrognoseAnwahl == 5){logChargeControl("-==== Solcast 90 angewählt ====-",'info')};
            if(bLogAusgabe && PrognoseAnwahl == 6){logChargeControl("-==== Solcast 90 u. Solcast angewählt, Berechnung nach Ø Wert ====-",'info')};
            bStoppTriggerEinstellungAnwahl = true
            await WetterprognoseAktualisieren();
            bStoppTriggerEinstellungAnwahl = false
        }else{
            logChargeControl(` -==== ⚠️ Falscher Wert State PrognoseAnwahl ⚠️ ====- `,"warn");
        }
    });

    // Triggern wenn sich an den Notstrom Werten was ändert
    listeners[14] = on({id: arrayID_Notstrom  , change: "ne"}, async function (obj) {
        await Notstromreserve(); 
    });


    // Triggern wenn sich die Einstellung 1-5 ändert.
    // Wenn die Änderung nicht über Script erfolgt wird Automatik Einstellung nach Prognose beendet
    listeners[15] = on({ id: sID_EinstellungAnwahl, change: "ne", valGt: 0 }, async function (obj) {
        const val = obj.state.val;
    
        if (bAutomatikAnwahl) {
            // @ts-ignore
            let CallingJavascript = ''+obj.state.from.match(/javascript/ig)
            if (CallingJavascript !== 'javascript'){
                bAutomatikAnwahl = false
                await setStateAsync(sID_Automatik_Prognose, false);
                logChargeControl(` -==== ⚠️ Manuelle Anwahl ! Automatische Einstellung nach Prognose beendet ⚠️ ====- `,"warn");
                return
            }
            EinstellungAnwahl = obj.state.val
            bCheckConfig = true;
            await MEZ_Regelzeiten();
            if (val !== 0) {
                logChargeControl(` -==== ⚠️ Automatische Änderung der Einstellung nach Prognose. Einstellung ${EinstellungAnwahl} aktiv ⚠️ ====- `,"warn");
                if (bStoppTriggerEinstellungAnwahl){return}
                await WetterprognoseAktualisieren();
            }
        } else {
        bStoppTriggerParameter = true;
            // Dynamisch die Werte der Parameter-IDs setzen
            const setStatePromises = arrayID_Parameters[0].map((param, index) => {
                return setStateAsync(param, getState(arrayID_Parameters[val][index]).val);
            });
            await Promise.all(setStatePromises);
            EinstellungAnwahl = 0;
            await setStateAsync(sID_EinstellungAnwahl, 0);
            await MEZ_Regelzeiten();
            bCheckConfig = true;
            logChargeControl(` -==== ⚠️ Manuelle Änderung der Einstellung. ⚠️ ====- `,"warn");
            bStoppTriggerParameter = false;
        }
    });

    // Triggern wenn sich an den einzelnen Parameter (Einstellung 0 -1) was ändert um die Ladeleistung neu zu berechnen.
    listeners[16] = on({ id: allParameterIDs, change: "ne" }, async function (obj) {
        // Wenn die Einstellung 0 im manuellen Betrieb geändert wird muss das Triggern der einzelnen Parameter ignoriert werden. 
        if (bStoppTriggerParameter) return;
        // Den Index des Parameters finden, der sich geändert hat
        const index = arrayID_Parameters.findIndex(params => params.includes(obj.id));
        if (EinstellungAnwahl === index) {
            logChargeControl(`-==== ⚠️ User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ⚠️ ====-`,"warn");
            bCheckConfig = true;
            await MEZ_Regelzeiten();
        }
    });


    // Triggern wenn sich an den Batterie Leistungswerten oder Spannung was ändert
    listeners[17] = on({id: sID_BAT0_Alterungszustand, change: "ne"}, async function (obj) {
        await Speichergroesse();
        bCheckConfig = true
        logChargeControl(` -==== ⚠️ Speichergröße hat sich geändert Speichergroesse_kWh = ${Speichergroesse_kWh} ⚠️ ====- `,"warn");
    });

    // Batterie Kapazität in kWh berechnen wenn sich der SOC in % ändert
    listeners[18] = on({id: sID_Batterie_SOC, change: "ne"}, async function (obj) {
        let BatSoc = obj.state.val;   
        await setStateAsync(sID_BatSoc_kWh,Math.round((Speichergroesse_kWh*(Systemwirkungsgrad_Pro/100) * BatSoc))/100,true);
        await calculateBatteryRange(0);
    });

    // Triggern wenn sich am Status Batterie Training was ändert
    listeners[19] = on({id: sID_BattTraining, change: "ne"}, async function (obj) {
        bBattTraining = obj.state.val;   
        logChargeControl(` -==== ⚠️ Batterie Training ist aktiv ⚠️ ====- `,"warn");
    });

    // Batterie Reichweite beim entladen der Batterie berechnen
    listeners[20] = on({id: sID_Power_Bat_W, change: "ne",valLt: 0}, async function (obj) {
        await calculateBatteryRange(obj.state.val);
    });

    // Speichert zum Zeitpunkt eines Firmware-Updates das Datum des Updates und die alte Versionsnummer.
    listeners[21] = on({id: sID_FirmwareVersion,change: "ne"}, async function(obj){
        await setStateAsync(sID_FirmwareDate, formatDate(new Date(), "DD.MM.YYYY hh:mm:ss"));
        await setStateAsync(sID_LastFirmwareVersion, obj.oldState.val);
    });

    // Summe PV-Leistung berechnen bei Änderung
    if (existsState(sID_PVErtragLM0)){
        listeners[22] = on({id: sID_PVErtragLM0,change: "ne"}, function (obj){SummePvLeistung();});
    }
    if (existsState(sID_PVErtragLM1)){
        listeners[23] = on({id: sID_PVErtragLM1,change: "ne"}, function (obj){SummePvLeistung();});	
    }

    // Triggern wenn Variable bScriptTibber= true und sID_Path_ScriptTibber existiert
    if (bScriptTibber) {
        if (sID_Path_ScriptTibber?.trim()) {
            const regexPattern = new RegExp(sID_Path_ScriptTibber);
        
            listeners[24] = on({ id: regexPattern, change: "ne" }, async function (obj) {
                const key = obj.id.split('.')[4];
                const value = obj.state.val;
                const logText = `-==== ⚠️ Tibber output signal ${key} wurde in ${value} geändert ====-`;

                const keyActions = {
                    BatterieEntladesperre: () => { bTibberEntladesperre = value; },
                    BatterieLaden: () => { bTibberLaden = value; },
                    maxLadeleistung: () => { tibberMaxLadeleistungUser_W = value; }
                };

                if (key in keyActions) {
                    keyActions[key]();
                    logChargeControl(logText, 'warn');
                }
            });

        } else {
            logChargeControl("⚠️ Kein gültiger Tibber Skript-State gefunden!", "warn");
        }
    } else {
        bTibberEntladesperre = false;
        bTibberLaden = false;
    }
    
    // Triggern wenn Variable bEvcc= true und sID_Path_evcc_loadpoint1_charging oder sID_Path_evcc_loadpoint2_charging existiert
    if (bEvcc) {
        const idsToCheck = [
            sID_Path_evcc_loadpoint1_charging,
            sID_Path_evcc_loadpoint2_charging,
            sID_Path_evcc_mode1,
            sID_Path_evcc_mode2
        ];

        const arrayID_evcc = (
            await Promise.all(idsToCheck.map(async id => (await existsObject(id)) ? id : null))
        ).filter(Boolean);

        if (arrayID_evcc.length === 0) {
            logChargeControl("⚠️ EVCC ist aktiv, aber keine gültigen Objektpfade für charging oder mode gefunden!", "warn");
            return;
        }

        listeners[25] = on({ id: arrayID_evcc, change: "ne" }, async ({ id, state }) => {
            const loadpoint = id.split('.')[3];
            const objekID = id.split('.')[5];
            const value = state.val;

            logChargeControl(`🔄 evcc Änderung: ${objekID} (LP${loadpoint}) → ${value}`,'info');

            if (loadpoint === '1') {
                if (objekID === 'mode') {
                    sMode_evcc = value;
                } else if (objekID === 'charging') {
                    bCharging_evcc = value;
                }
                return;
            }

            if (loadpoint === '2') {
                if (objekID === 'mode') {
                    const [mode1, mode2] = await Promise.all(
                        [sID_Path_evcc_mode1, sID_Path_evcc_mode2].map(async id =>
                            (await existsObject(id)) ? (await getStateAsync(id)).val : null
                        )
                    );
                    sMode_evcc = (mode1 === 'pv' && mode2 === 'pv') ? 'pv' : 'off';
                } else if (objekID === 'charging') {
                    const [c1, c2] = await Promise.all([
                        getStateAsync(sID_Path_evcc_loadpoint1_charging),
                        getStateAsync(sID_Path_evcc_loadpoint2_charging)
                    ]);
                    bCharging_evcc = (c1?.val ?? false) || (c2?.val ?? false);
                }
                return;
            }

            logChargeControl("⚠️ Aktuell werden von CC nur zwei Wallboxen berücksichtigt.", "warn");
        });
    }

}

// Jede Minute Hausverbrauch erfassen.
schedule("*/1 * * * *", async function () {
    const state = await getStateAsync(sID_Power_Home_W);
    await berechneReinenHausverbrauch(Math.abs(state.val));
});

schedule('*/3 * * * * *', async function() {
    // Vor Regelung Skript Startdurchlauf erst abwarten  
    //log(`bCharging_evcc = ${bCharging_evcc} sMode_evcc = ${sMode_evcc}`)
    if(!bStart && bAutomatikRegelung && !bManuelleLadungBatt && !bBattTraining && (!bCharging_evcc || sMode_evcc === 'pv')){await Ladesteuerung();}
});

// jeden Monat am 1 History Daten Tag aktuelles Monat Löschen
schedule("0 0 1 * *", async function() {
    arrayPrognoseProp_kWh.fill(0)
    arrayPrognoseAuto_kWh.fill(0)
    arrayPrognoseSolcast90_kWh.fill(0)
    arrayPrognoseSolcast_kWh.fill(0)
    arrayPV_LeistungTag_kWh.fill(0)
    await Promise.all([
        setStateAsync(sID_PrognoseProp_kWh,JSON.stringify(arrayPrognoseProp_kWh)),
        setStateAsync(sID_PrognoseAuto_kWh,JSON.stringify(arrayPrognoseAuto_kWh)),
        setStateAsync(sID_PrognoseSolcast90_kWh,JSON.stringify(arrayPrognoseSolcast90_kWh)),
        setStateAsync(sID_PrognoseSolcast_kWh,JSON.stringify(arrayPrognoseSolcast_kWh)),
        setStateAsync(sID_arrayPV_LeistungTag_kWh,JSON.stringify(arrayPV_LeistungTag_kWh))
    ]);
    await writelog();
});

// jeden Tag um 12:00 aktualisieren.
schedule({hour: 12, minute: 0}, function () { 
	bHeuteNotstromVerbraucht = false
});

// jeden Tag um 00:01 Tageswert nullen und Regelzeiten aktualisieren.
schedule({hour: 0, minute: 1}, function () { 
	setState(sID_PVErtragLM0,0,true);
	setState(sID_PVErtragLM1,0,true);
	MEZ_Regelzeiten();
    if (bLogAusgabe){logChargeControl(` -==== Tagesertragswert auf 0 gesetzt ====- `,"info");}
});

// jeden Tag um 02:00 prüfen ob Notstrom SOC mit Batterie SOC übereinstimmt.
schedule({hour: 2, minute: 0}, async function () { 
    if (bNotstromAusNetz){
        let nbr_Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val                             // Berechneter Notstrom SOC
        Batterie_SOC_Proz = (await getStateAsync(sID_Batterie_SOC)).val;                                    // Aktueller Batterie SOC E3DC 
        let Notstrom_Status = (await getStateAsync(sID_Notrom_Status)).val;                                 // aktueller Notstrom Status E3DC 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
        if (Batterie_SOC_Proz < nbr_Notstrom_SOC_Proz && !bHeuteNotstromVerbraucht && Notstrom_Status != 4){
            bLadenAufNotstromSOC=true
            await setStateAsync(sID_POWER_LIMITS_USED,true);
            logChargeControl(` -==== ⚠️ Batterie wird bis NotstromSOC aus dem Netz geladen ⚠️ ====- `,"warn");
            await LadeNotstromSOC();
        }
    }
    hystereseWatt = 2000                                                                                    // In der Nacht Hysterese Standard Wert setzen
});

//Bei Scriptende alle Timer löschen
onStop(function () { 
    clearSchedule(Timer0);
    clearSchedule(Timer1);
    clearSchedule(Timer2);
    clearSchedule(TimerProplanta);
}, 100);

ScriptStart();