'use strict';
let Resource_Id_Dach=[];
let sID_UntererLadekorridor_W =[],sID_Ladeschwelle_Proz =[],sID_Ladeende_Proz=[],sID_Ladeende2_Proz=[],sID_Winterminimum=[],sID_Sommermaximum=[],sID_Sommerladeende=[],sID_Unload_Proz=[];

/**********************************************************************************************************
 Version: 1.0.10    getSchedules(false) ersetzt, da es nicht bei allen Problemlos funktioniert.
 Version: 1.0.9     Fehler, dass Timer bei Neustart vom Skript nicht gelöscht werden, behoben.
                    Fehler, dass eine Aktualisierung des State "EinstellungAnwahl" zu einem Aufruf von der Funktion Main() führte, behoben.
                    Fehler, dass die Function Main() beim Scriptstart vor der aktualisierung der Prognosewerte Proplanta aufgerufen wurde, behoben.
 Version: 1.0.8     Wenn Notstromreserve erreicht ist, wird auch DISCHARGE_START_POWER, MAX_CHARGE_POWER und MAX_DISCHARGE_POWER auf 0 gesetzt,
                    damit der WR in den Standby-Modus wechselt und die Batterie nicht weiter entladen wird.
                    Aktualisierung der State SET_POWER_VALUE auf 5 sek. reduziert und kleinere Fehler behoben.
 Version: 1.0.7     Nach der Zeit Ladeende (Sommer Ladeende) wird die Regelung ausgeschaltet 
 Version: 1.0.6     Beim Skript Start werden jetzt auch die Prognosewerte Solcast abgerufen mit folgender Einschränkung:
                    Vor 4 Uhr werden die Prognosewerte für den aktuellen Tag + 6 Tage aktualisiert
                    Nach 4 Uhr werden nur die Prognosewerte für den nächsten Tag + 5 Tage aktualisiert
 Version: 1.0.5     Ea werden 200 W vom Einspeiselimit und der maximalen Wechselrichterleistung abgezogen, um die Trägheit der Steuerung auszugleichen 
 Version: 1.0.4     Speichergröße berechnen geändert. Von der max. Kapazität der Batterie, werden 10% abgezogen die E3DC verwendet,
                    um ein Entladen auf 0% oder laden auf 100% zu verhindern.
                    Da das typabhängig ist, muss die Entladetiefe in % im Script unter Einstellungen E3DC eingetragen werden.
                    Fehler korrigiert das SET_POWER_MODE und SET_POWER_VALUE beim Skript Start zu einem Fehler führen, wenn diese beiden State
                    nicht definiert sind.
 Version: 1.0.3     Auch die Entladeleistung wird langsam erhöht, um Kurve zu glätten.
 Version: 1.0.2     Speichergröße berechnen geändert. Es wird der ASOC (Alterungszustand) von Bat_0 verwendet, um die
                    verfügbare Batterie Kapazität zu berechnen
 Version: 1.0.1     Wenn weniger als 500 W in das Netz eingespeist werden können, wird die Regelung ausgeschaltet.
                    Bei wechselnder Bewölkung ist die Regelung zu langsam, um Netzbezug zu verhindern, deswegen wird bereits 
                    ab einer Einspeiseleistung von 500 W die Regelung E3DC überlassen.
 Version: 1.0.0     Das Zusatzprogramm E3DC-Control wird ab dieser Version nicht mehr benötig, dafür muss der
                    Adapter e3dc-rscp installiert sein.
 **********************************************************************************************************/
//+++++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++++++

//*************************************** Einstellungen Charge-Control **************************************
let logflag = true;                                             // History Daten in Lokaler Datei speichern 
const sLogPath = "/home/iobroker/HistoryPV_Leistung.json";      // Pfad zur Sicherungsdatei History 
const LogAusgabe = true                                         // Zusätzliche allgemeine LOG Ausgaben 
const DebugAusgabe = false                                      // Debug Ausgabe im LOG zur Fehlersuche
const LogAusgabeSteuerung = true                                // Zusätzliche LOG Ausgaben der Lade-Steuerung

//***************************************** Einstellungen Proplanta ***************************************
const country = "de"                                            // Ländercode de,at, ch, fr, it
const ProplantaOrt = 'xxxxxxxxxxxxxxxx'                           // Welcher Wohnort soll abgefragt werden
const ProplantaPlz = 'xxxxx'                                    // Postleitzahl

//***************************************** Einstellungen Solcast *****************************************
const Solcast = true;                                           // true = Daten Solcast werden abgerufen false = Daten Solcast werden nicht abgerufenb
const SolcastDachflaechen = 2;                                  // Aktuell max. zwei Dachflächen möglich
Resource_Id_Dach[1] = 'xxxx-xxxx-xxxx-xxxx'                     // Rooftop 1 Id von der Homepage Solcast
Resource_Id_Dach[2] = 'xxxx-xxxx-xxxx-xxxx'                     // Rooftop 2 Id von der Homepage Solcast
const SolcastAPI_key = 'xxxxxxxx-xx-xxxxxxxxxxxxxxxxxxxx'       // Solcast API Key

//******************************************** Einstellungen E3DC *******************************************
const Entladetiefe_Pro = 90;                                    // Die Entladetiefe der Batterie in % aus den technischen Daten E3DC

//************************************* Einstellungen Diagramm Prognose ***********************************
const nModulFlaeche = 73;                       // 73 Installierte Modulfläche in m² (Silizium-Zelle 156x156x60 Zellen x 50 Module)
const nWirkungsgradModule = 18;                 // Wirkungsgrad / Effizienzgrad der Solarmodule in % bezogen auf die Globalstrahlung (aktuelle Module haben max. 24 %)
const nKorrFaktor = 0                           // nKorrFaktor in Prozent. Reduziert die berechnete Prognose um diese anzugleichen.nKorrFaktor= 0 ohne Korrektur 
const nMinPvLeistungTag_kWh = 3                 // minimal Mögliche PV-Leistung. Wenn Prognose niedriger ist wird mit diesem Wert gerechnet
const nMaxPvLeistungTag_kWh = 105               // max. Mögliche PV-Leistung. Wenn Prognose höher ist wird mit diesem Wert gerechnet


//****************************** Einstellungen Modul Modbus *****************************
const sID_Batterie_SOC = 'modbus.0.holdingRegisters.40083_Batterie_SOC';                            // Pfad Modul ModBus aktueller Batterie_SOC'
const sID_PvLeistung_E3DC_W = 'modbus.0.holdingRegisters.40068_PV_Leistung'                         // Pfad Modul ModBus aktuelle PV_Leistung'
const sID_PvLeistung_ADD_W = 'modbus.0.holdingRegisters.40076_Zusaetzliche_Einspeiser_Leistung'     // Pfad Modul ModBus Zusätzliche Einspeiser Leistung
const sID_BatterieLeistung_W ='modbus.0.holdingRegisters.40070_Batterie_Leistung'                   // Pfad Modul ModBus aktuelle Batterie Leistung
const sID_Power_Grid_W = 'modbus.0.holdingRegisters.40074_Netz_Leistung'                            // Pfad Modul ModBus aktuelle Netz Leistung
const sID_Power_Home_W = 'modbus.0.holdingRegisters.40072_Hausverbrauch_Leistung'                   // Pfad Modul ModBus aktueller Hausverbrauch
//****************************** Einstellungen Modul e3dc.rscp *****************************
const sID_Bat_Discharge_Limit = 'e3dc-rscp.0.EMS.BAT_DISCHARGE_LIMIT'                               // Batterie Entladelimit (negativer Wert)
const sID_Bat_Charge_Limit = 'e3dc-rscp.0.EMS.BAT_CHARGE_LIMIT'                                     // Batterie Ladelimit
const sID_Notrom_Status = 'e3dc-rscp.0.EMS.EMERGENCY_POWER_STATUS'                                  // 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
const sID_installed_Battery_Capacity ='e3dc-rscp.0.EMS.SYS_SPECS.installedBatteryCapacity'          // Installierte Batterie Kapazität E3DC
const sID_SET_POWER_MODE = 'e3dc-rscp.0.EMS.SET_POWER_MODE'                                         // Lademodus
const sID_SET_POWER_VALUE_W ='e3dc-rscp.0.EMS.SET_POWER_VALUE'                                      // Eingestellte Ladeleistung
const sID_Max_Discharge_Power_W = 'e3dc-rscp.0.EMS.MAX_DISCHARGE_POWER'                             // Eingestellte maximale Batterie-Entladeleistung. (Variable Einstellung E3DC)
const sID_Max_Charge_Power_W = 'e3dc-rscp.0.EMS.MAX_CHARGE_POWER'                                   // Eingestellte maximale Batterie-Ladeleistung. (Variable Einstellung E3DC)
const sID_startDischargeDefault = 'e3dc-rscp.0.EMS.SYS_SPECS.startDischargeDefault'                 // Anfängliche Entladeleistung Standard
const sID_Max_wrleistung_W = 'e3dc-rscp.0.EMS.SYS_SPECS.maxAcPower'                                 // Maximale Wechselrichter Leistung
const sID_Einspeiselimit_W = 'e3dc-rscp.0.EMS.DERATE_AT_POWER_VALUE'                                // Eingestellte Einspeisegrenze E3DC
const sID_BAT0_Alterungszustand = 'e3dc-rscp.0.BAT.BAT_0.ASOC'                                      // Batterie ASOC e3dc-rscp
const sID_DISCHARGE_START_POWER = 'e3dc-rscp.0.EMS.DISCHARGE_START_POWER'                           // Anfängliche Batterie-Entladeleistung

//********************* Einstellungen Instanz Script Charge-Control ***********************
let instanz = '0_userdata.0.';
// Pfad innerhalb der Instanz
let PfadEbene1 = 'Charge_Control.';
let PfadEbene2 = ['Parameter.','Allgemein.','History.','Proplanta.']

//---------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN ++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------

//***************************************************************************************************
//*********************************** User Eingaben prüfen ******************************************
//***************************************************************************************************
let Start = true
ScriptStart();
if ((typeof nModulFlaeche != "number") || (typeof nModulFlaeche == undefined)){console.error("nModulFlaeche muss als Number eingegeben werden");}
if ((typeof nWirkungsgradModule != "number") || (typeof nWirkungsgradModule == undefined)){console.error("nWirkungsgradModule muss als Number eingegeben werden");}
if (typeof country != 'string' || typeof country == 'undefined') {console.error('country muss als String eingegeben werden');}
if ((typeof Entladetiefe_Pro != "number") || (typeof Entladetiefe_Pro == undefined)){console.error("Entladetiefe Batterie muss als Number eingegeben werden");}
if(Entladetiefe_Pro < 0 || Entladetiefe_Pro >100){console.error("Entladetiefe Batterie muss zwischen 0% und 100% sein");}
if (Solcast){
    if ((typeof SolcastDachflaechen != "number") || (typeof SolcastDachflaechen == "undefined")){console.error("SolcastDachflaechen muss als Type Number eingegeben werden");}
    if ((typeof Resource_Id_Dach[1] != "string") || (typeof Resource_Id_Dach[1] == "undefined")){console.error("Resource_Id_Dach[1] muss als String eingegeben werden");}
    if ((typeof Resource_Id_Dach[2] != "string") || (typeof Resource_Id_Dach[2] == "undefined")){console.error("Resource_Id_Dach[2] muss als String eingegeben werden");}
    if ((typeof SolcastAPI_key != "string") || (typeof SolcastAPI_key == "undefined")){console.error("SolcastAPI_key muss als String eingegeben werden");}
}
if (!existsState(sID_Batterie_SOC)){log('State '+sID_Batterie_SOC+' ist nicht vorhanden','error')} ;
if (!existsState(sID_PvLeistung_E3DC_W)){log('State '+sID_PvLeistung_E3DC_W+' ist nicht vorhanden','error')} ;
if (!existsState(sID_PvLeistung_ADD_W)){log('State '+sID_PvLeistung_ADD_W+' ist nicht vorhanden','error')} ;
if (!existsState(sID_BatterieLeistung_W)){log('State '+sID_BatterieLeistung_W+' ist nicht vorhanden','error')} ;
if (!existsState(sID_Power_Grid_W)){log('State '+sID_Power_Grid_W+' ist nicht vorhanden','error')} ;
if (!existsState(sID_Power_Home_W)){log('State '+sID_Power_Home_W+' ist nicht vorhanden','error')} ;

if (!existsState(sID_Bat_Discharge_Limit)){log('State '+sID_Bat_Discharge_Limit+' ist nicht vorhanden','error')} ;
if (!existsState(sID_Bat_Charge_Limit)){log('State '+sID_Bat_Charge_Limit+' ist nicht vorhanden','error')} ;
if (!existsState(sID_Notrom_Status)){log('State '+sID_Notrom_Status+' ist nicht vorhanden','error')} ;
if (!existsState(sID_installed_Battery_Capacity)){log('State '+sID_installed_Battery_Capacity+' ist nicht vorhanden','error')} ;
if (!existsObject(sID_SET_POWER_MODE)){log('State '+sID_SET_POWER_MODE+' ist nicht vorhanden','error')} ;
if (!existsObject(sID_SET_POWER_VALUE_W)){log('State '+sID_SET_POWER_VALUE_W+' ist nicht vorhanden','error')} ;
if (!existsState(sID_Max_Discharge_Power_W)){log('State '+sID_Max_Discharge_Power_W+' ist nicht vorhanden','error')} ;
if (!existsState(sID_Max_Charge_Power_W)){log('State '+sID_Max_Charge_Power_W+' ist nicht vorhanden','error')} ;
if (!existsState(sID_startDischargeDefault)){log('State '+sID_startDischargeDefault+' ist nicht vorhanden','error')} ;
if (!existsState(sID_Max_wrleistung_W)){log('State '+sID_Max_wrleistung_W+' ist nicht vorhanden','error')} ;
if (!existsState(sID_Einspeiselimit_W)){log('State '+sID_Einspeiselimit_W+' ist nicht vorhanden','error')} ;
if (!existsState(sID_BAT0_Alterungszustand)){log('State '+sID_BAT0_Alterungszustand+' ist nicht vorhanden','error')} ;
if (!existsState(sID_DISCHARGE_START_POWER)){log('State '+sID_DISCHARGE_START_POWER+' ist nicht vorhanden','error')} ;

//***************************************************************************************************
//************************************ Deklaration Variablen ****************************************
//***************************************************************************************************
// @ts-ignore
const dst = require('is-it-bst');
const fsw = require('fs');
// @ts-ignore
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const sID_Saved_Power_W = instanz + PfadEbene1 + PfadEbene2[1] + 'Saved_Power_W'            // Leistung die mit Charge-Control gerettet wurde
const sID_PVErtragLM2 = instanz + PfadEbene1 + PfadEbene2[1] + 'Saved_PowerLM2_kWh';        // Leistungszähler für PV Leistung die mit Charge-Control gerettet wurde
const sID_Automatik = instanz + PfadEbene1 + PfadEbene2[1]+'Automatik';                     // true = automatik false = manuell
const sID_Anwahl_MEZ_MESZ = instanz + PfadEbene1 + PfadEbene2[1] + 'Anwahl_MEZ_MESZ';       // true = MESZ ,false = MEZ
const sID_EinstellungAnwahl = instanz + PfadEbene1 + PfadEbene2[1] + 'EinstellungAnwahl';   // Einstellung 1-5
const sID_PVErtragLM0 = instanz + PfadEbene1 + PfadEbene2[1] + 'IstPvErtragLM0_kWh';        // Leistungszähler PV-Leistung
const sID_PVErtragLM1 = instanz + PfadEbene1 + PfadEbene2[1] + 'IstPvErtragLM1_kWh';        // Leistungszähler zusätzlicher WR (extern)
const sID_PrognoseAnwahl = instanz + PfadEbene1 + PfadEbene2[1] + 'PrognoseAnwahl';         // Aktuelle Einstellung welche Prognose für Berechnung verwendet wird
const sID_EigenverbrauchTag = instanz + PfadEbene1 + PfadEbene2[1] + 'EigenverbrauchTag';    // Einstellung täglicher Eigenverbrauch in VIS oder über anderes Script
const sID_AnzeigeHistoryMonat = instanz + PfadEbene1 + PfadEbene2[2] + 'HistorySelect';     // Umschaltung der Monate im View Prognose in VIS 
const sID_Regelbeginn_MEZ = instanz + PfadEbene1 + PfadEbene2[1] + 'Regelbeginn_MEZ';       // Berechneter Regelbeginn in MEZ Zeit
const sID_Regelende_MEZ = instanz + PfadEbene1 + PfadEbene2[1] + 'Regelende_MEZ';
const sID_Ladeende_MEZ =instanz + PfadEbene1 + PfadEbene2[1] + 'Ladeende_MEZ';
const sID_Notstrom_min_Proz = instanz + PfadEbene1 + PfadEbene2[0]+'Notstrom_min';
const sID_Notstrom_sockel_Proz = instanz + PfadEbene1 + PfadEbene2[0]+'Notstrom_sockel';
const sID_Notstrom_akt = instanz + PfadEbene1 + PfadEbene2[1]+'Notstrom_akt';
for (let i = 0; i <= 5; i++) {
    sID_UntererLadekorridor_W[i] = instanz + PfadEbene1 + PfadEbene2[0]+'UntererLadekorridor_'+i;
    sID_Ladeschwelle_Proz[i] = instanz + PfadEbene1 + PfadEbene2[0]+'Ladeschwelle_'+i;
    sID_Ladeende_Proz[i] = instanz + PfadEbene1 + PfadEbene2[0]+'Ladeende_'+i;
    sID_Ladeende2_Proz[i] = instanz + PfadEbene1 + PfadEbene2[0]+'Ladeende2_'+i;
    sID_Winterminimum[i] = instanz + PfadEbene1 + PfadEbene2[0]+'Winterminimum_'+i;
    sID_Sommermaximum[i] = instanz + PfadEbene1 + PfadEbene2[0]+'Sommermaximum_'+i;
    sID_Sommerladeende[i] = instanz + PfadEbene1 + PfadEbene2[0]+'Sommerladeende_'+i;
    sID_Unload_Proz[i] = instanz + PfadEbene1 + PfadEbene2[0]+'Unload_'+i;
}
const arrayID_Notstrom =[sID_Notstrom_min_Proz,sID_Notstrom_sockel_Proz];
const arrayID_Parameter1 =[sID_UntererLadekorridor_W[1],sID_Ladeschwelle_Proz[1],sID_Ladeende_Proz[1],sID_Ladeende2_Proz[1],sID_Winterminimum[1],sID_Sommerladeende[1],sID_Sommermaximum[1],sID_Unload_Proz[1]];
const arrayID_Parameter2 =[sID_UntererLadekorridor_W[2],sID_Ladeschwelle_Proz[2],sID_Ladeende_Proz[2],sID_Ladeende2_Proz[2],sID_Winterminimum[2],sID_Sommerladeende[2],sID_Sommermaximum[2],sID_Unload_Proz[2]];
const arrayID_Parameter3 =[sID_UntererLadekorridor_W[3],sID_Ladeschwelle_Proz[3],sID_Ladeende_Proz[3],sID_Ladeende2_Proz[2],sID_Winterminimum[3],sID_Sommerladeende[3],sID_Sommermaximum[3],sID_Unload_Proz[3]];
const arrayID_Parameter4 =[sID_UntererLadekorridor_W[4],sID_Ladeschwelle_Proz[4],sID_Ladeende_Proz[4],sID_Ladeende2_Proz[2],sID_Winterminimum[4],sID_Sommerladeende[4],sID_Sommermaximum[4],sID_Unload_Proz[4]];
const arrayID_Parameter5 =[sID_UntererLadekorridor_W[5],sID_Ladeschwelle_Proz[5],sID_Ladeende_Proz[5],sID_Ladeende2_Proz[2],sID_Winterminimum[5],sID_Sommerladeende[5],sID_Sommermaximum[5],sID_Unload_Proz[5]];

let xhr = new XMLHttpRequest();
let xhr2 = new XMLHttpRequest();

let Max_wrleistung_W = getState(sID_Max_wrleistung_W).val - 200;                // Maximale Wechselrichter Leistung (Abzüglich 200 W, um die Trägheit der Steuerung auszugleichen)
let Einspeiselimit_kWh = (getState(sID_Einspeiselimit_W).val - 200)/1000;       // Einspeiselimit (Abzüglich 200 W, um die Trägheit der Steuerung auszugleichen)
let maximumLadeleistung_W = getState(sID_Bat_Charge_Limit).val;                 // Maximal mögliche Batterie Ladeleistung
let Bat_Discharge_Limit_W = getState(sID_Bat_Discharge_Limit).val;              // Maximal mögliche Batterie Entladeleistung (negativer Wert)
let startDischargeDefault = getState(sID_startDischargeDefault).val;            // Anfängliche Entladeleistung Standard
let Speichergroesse_kWh                                                         // Installierte Batterie Speicher Kapazität wird in Funktion Speichergroesse() berechnet


let AutomatikAnwahl,ZeitAnwahl_MEZ_MESZ,EinstellungAnwahl,PrognoseAnwahl,count0 = 0, count1 = 0, count2 = 0, Summe0 = 0, Summe1 = 0, Summe2 = 0;
let tRegelende,tSommerladeende,tRegelbeginn,tRegelende_alt,tRegelbeginn_alt,Zeit_alt_UTC_sek=0,ZeitE3DC_SetPower_alt=0;
let M_Power,M_Power_alt =0,BAT_Notstrom_Enladen=true,E3DC_Set_Power_Mode=0,E3DC_Set_Power_Mode_alt=0,Set_Power_Value_W=0,Batterie_SOC_alt_Proz=0;
let Notstrom_SOC_Proz = 0;
let Timer0 = null, Timer1 = null,Timer2 = null,Timer3 = null;
let CheckConfig = true, Schritt = 0;
let SummePV_Leistung_Tag_kW =[{0:'',1:'',2:'',3:'',4:'',5:'',6:'',7:''},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0}];
let baseUrls = {
    "de" : "https://www.proplanta.de/Wetter/profi-wetter.php?SITEID=60&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=",
    "at" : "https://www.proplanta.de/Wetter-Oesterreich/profi-wetter-at.php?SITEID=70&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=",
    "ch" : "https://www.proplanta.de/Wetter-Schweiz/profi-wetter-ch.php?SITEID=80&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=",
    "fr" : "https://www.proplanta.de/Wetter-Frankreich/profi-wetter-fr.php?SITEID=50&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter-Frankreich&wT=",
    "it" : "https://www.proplanta.de/Wetter-Italien/profi-wetter-it.php?SITEID=40&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter-Italien&wT=",
};
let baseurl = baseUrls[country];


// Wenn noch vom Script gestartet Schedules aktiv sind, dann diese beenden.
clearSchedule(Timer0);
clearSchedule(Timer1);
clearSchedule(Timer2);
clearSchedule(Timer3);

//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************

// Wird nur beim Start vom Script aufgerufen
async function ScriptStart()
{
    await CreateState();
    log('-==== Jetzt sind alle States abgearbeitet ====-');
    AutomatikAnwahl = getState(sID_Automatik).val;
    PrognoseAnwahl = getState(sID_PrognoseAnwahl).val;
    setState(sID_Anwahl_MEZ_MESZ, dst());  
    ZeitAnwahl_MEZ_MESZ = getState(sID_Anwahl_MEZ_MESZ).val
    EinstellungAnwahl = getState(sID_EinstellungAnwahl).val
    Wh_Leistungsmesser0();                                              // Leistungsmesser PV Leistung E3DC starten
    Wh_Leistungsmesser1();                                              // Leistungsmesser PV Leistung zusätzliche Einspeiser starten
    Wh_Leistungsmesser2();                                              // Leistungsmesser Überschussleistung starten
    // Wetterdaten beim Programmstart aktualisieren und Timer starten.
    await Speichergroesse()                                             // aktuell verfügbare Batterie Speichergröße berechnen
    if (Solcast) {await SheduleSolcast(SolcastDachflaechen);}           // Wetterdaten Solcast abrufen
    await UTC_Dezimal_to_MEZ();                                         // UTC Zeiten in MEZ umrechnen
    await MEZ_Regelzeiten();                                            // RE,RB und Ladeende berechnen
    await Notstromreserve();                                            // Eingestellte Notstromreserve berechnen
    await PrognosedatenAbrufen();                                       // Wetterdaten Proplanta abrufen danach wird main() augerufen
    Start = false;
}   

async function CreateState(){
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Notstrom_min', {'def':30, 'name':'Speicherreserve in % bei Wintersonnenwende 21.12', 'type':'number', 'role':'value', 'desc':'Speicherreserve in % bei winterminimum', 'unit':'%'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Notstrom_sockel', {'def':20, 'name':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'type':'number', 'role':'value', 'desc':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'unit':'%'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Notstrom_akt', {'def':0, 'name':'aktuell berechnete Notstromreserve', 'type':'number', 'role':'value', 'desc':'aktuell berechnete Notstromreserve', 'unit':'%'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Winterminimum_MEZ', {'def':'11.02', 'name':'winterminimum wintersonnenwende MEZ', 'type':'string', 'role':'string', 'desc':'Winterminimum', 'unit':'Uhr'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Sommermaximum_MEZ', {'def':'13.12', 'name':'sommermaximum sommersonnenwende MEZ', 'type':'string', 'role':'string', 'desc':'Sommermaximum', 'unit':'Uhr'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Sommerladeende_MEZ', {'def':'18.00', 'name':'Sommerladeende MEZ', 'type':'string', 'role':'string', 'desc':'Sommerladeende', 'unit':'Uhr'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Listenelement_Nr', {'def':0, 'name':'Aktive Anwahl Listenelement in VIS' , 'type':'number', 'role':'value'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'EinstellungAnwahl', {'def':0, 'name':'Aktuell manuell angewählte Einstellung', 'type':'number', 'role':'State'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'EigenverbrauchTag', {'def':0, 'name':'min. Eigenverbrauch von 6:00 Uhr bis 19:00 Uhr in kWh', 'type':'number', 'role':'value'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Automatik', {'def':false, 'name':'Bei true werden die Parameter automatisch nach Wetterprognose angepast' , 'type':'boolean', 'role':'State', 'desc':'Automatik Charge-Control ein/aus'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Anwahl_MEZ_MESZ', {'def':false, 'name':'true = MESZ ,false = MEZ' , 'type':'boolean', 'role':'State', 'desc':'Umschalten von MEZ auf MESZ '});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'IstSummePvLeistung_kWh', {'def':0, 'name':'Summe kWh Leistungsmesser 0 und Leistungsmesser 1 ' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'PrognoseBerechnung_kWh_heute', {'def':0, 'name':'Prognose für Berechnung' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Regelbeginn_MEZ', {'def':'00.00', 'name':'Regelbeginn MEZ', 'type':'string', 'role':'string', 'desc':'Regelbeginn MEZ Zeit', 'unit':'Uhr'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Regelende_MEZ', {'def':'00.00', 'name':'Regelende MEZ', 'type':'string', 'role':'string', 'desc':'Regelende MEZ Zeit', 'unit':'Uhr'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Ladeende_MEZ', {'def':'00.00', 'name':'Ladeende MEZ', 'type':'string', 'role':'string', 'desc':'Ladeende MEZ Zeit', 'unit':'Uhr'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Saved_Power_W', {'def':0, 'name':'Überschuss in W' , 'type':'number', 'role':'value', 'unit':'W'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Saved_PowerLM2_kWh', {'def':0, 'name':'kWh Leistungsmesser 2' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'IstPvErtragLM0_kWh', {'def':0, 'name':'kWh Leistungsmesser 0 ' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'IstPvErtragLM1_kWh', {'def':0, 'name':'kWh Leistungsmesser 1 ' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'PrognoseAnwahl', {'def':0, 'name':'Beide Berechnung nach min. Wert = 0 nur Proplanta=1 nur Solcast=2 Beide Berechnung nach max. Wert=3 Beide Berechnung nach Ø Wert=4 nur Solcast90=5' , 'type':'number', 'role':'value'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'HistoryJSON', {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'HistorySelect', {'def':1, 'name':'Select Menü für materialdesign json chart' ,'type':'number'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Datum_Tag_0', {'def':'0', 'name':'Datum Proplanta' ,'type':'string'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Datum_Tag_1', {'def':'0', 'name':'Datum Proplanta' ,'type':'string'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Datum_Tag_2', {'def':'0', 'name':'Datum Proplanta' ,'type':'string'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Datum_Tag_3', {'def':'0', 'name':'Datum Proplanta' ,'type':'string'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'NaesteAktualisierung', {'def':'0', 'name':'Aktualisierung Proplanta' ,'type':'string'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Bewoelkungsgrad_12', {'def':200, 'name':'Bewölkungsgrad 12 Uhr Proplanta' ,'type':'number'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Bewoelkungsgrad_15', {'def':200, 'name':'Bewölkungsgrad 15 Uhr Proplanta' ,'type':'number'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Max_Temperatur_Tag_0', {'def':0, 'name':'Max Temperatur heute' ,'type':'number', 'unit':'°C'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Max_Temperatur_Tag_1', {'def':0, 'name':'Max Temperatur Morgen' ,'type':'number', 'unit':'°C'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Max_Temperatur_Tag_2', {'def':0, 'name':'Max Temperatur Übermorgen' ,'type':'number', 'unit':'°C'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Max_Temperatur_Tag_3', {'def':0, 'name':'Max Temperatur in vier Tagen' ,'type':'number', 'unit':'°C'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Min_Temperatur_Tag_0', {'def':0, 'name':'Min Temperatur heute' ,'type':'number', 'unit':'°C'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Min_Temperatur_Tag_1', {'def':0, 'name':'Min Temperatur Morgen' ,'type':'number', 'unit':'°C'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Min_Temperatur_Tag_2', {'def':0, 'name':'Min Temperatur Übermorgen' ,'type':'number', 'unit':'°C'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[3] + 'Min_Temperatur_Tag_3', {'def':0, 'name':'Min Temperatur in vier Tagen' ,'type':'number', 'unit':'°C'});

    for (let i = 0; i <= 5; i++) {
	    createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'UntererLadekorridor_'+i, {'def':500, 'name':'Die Ladeleistung soll sich oberhalb dieses Wertes bewegen', 'type':'number', 'role':'value', 'desc':'UntererLadekorridor', 'unit':'W'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Ladeschwelle_'+i, {'def':0, 'name':'bis zur dieser Schwelle wird geladen bevor die Regelung beginnt', 'type':'number', 'role':'value', 'desc':'Ladeschwelle', 'unit':'%'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Ladeende_'+i, {'def':80, 'name':'Zielwert bis Ende Regelung, dannach wird Ladung auf ladeende2 weiter geregelt', 'type':'number', 'role':'value', 'desc':'Ladeende', 'unit':'%'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Ladeende2_'+i, {'def':93, 'name':'ladeende2 kann der Wert abweichend vom Defaultwert 93% gesetzt werden.Muss > ladeende sein', 'type':'number', 'role':'value', 'desc':'Ladeende2', 'unit':'%'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Winterminimum_'+i, {'def':11.02, 'name':'winterminimum wintersonnenwende', 'type':'number', 'role':'value', 'desc':'Winterminimum', 'unit':'Uhr'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Sommermaximum_'+i, {'def':13.12, 'name':'sommermaximum sommersonnenwende', 'type':'number', 'role':'value', 'desc':'Sommermaximum', 'unit':'Uhr'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Sommerladeende_'+i, {'def':18.00, 'name':'Zielwert bis Ende Regelung, dannach wird Ladung auf 93% weiter geregelt', 'type':'number', 'role':'value', 'desc':'Sommerladeende', 'unit':'Uhr'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Unload_'+i, {'def':100, 'name':'Zielwert beim entladen.Die ladeschwelle muss < unload sein', 'type':'number', 'role':'value', 'desc':'Unload', 'unit':'%'});
    }

    for (let i = 1; i <= 31; i++) {
	    let n = zeroPad(i,2);
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'IstPvLeistung_kWh_' +n, {'def':0, 'name':'PV-Leistung Tag sourceanalytix' ,'type':'number', 'unit':'kWh'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_' +n, {'def':0, 'name':'Tagesprognose Proplanta', 'type':'number', 'unit':'kWh'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_' +n, {'def':0, 'name':'Berechnete Prognose bei Anwahl Automatik' ,'type':'number', 'unit':'kWh'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast_kWh_' +n, {'def':0, 'name':'Schätzung der PV-Leistung Solcast in Kilowatt (kW)' ,'type':'number', 'unit':'kWh'});
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast90_kWh_' +n, {'def':0, 'name':'Schätzung der PV-Leistung in Kilowatt (kW) 90. Perzentil (hohes Szenario)' ,'type':'number', 'unit':'kWh'});
    
        if (i < 13){
            createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_' +n, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
        }
    }
}


async function main()
{
    //Prognosen in kWh umrechen
    await Prognosen_Berechnen();
    // Diagramm aktualisieren
    await makeJson();
    // Einstellungen 1-5 je nach Überschuss PV Leistung Wetterprognose und Bewölkung anwählen 
    Einstellung(await Ueberschuss_Prozent());

}


// Steuerung der Ladeleistung Batterie 
async function Ladesteuerung()
{
    let dAkt = new Date();
    let jjjj= dAkt.getUTCFullYear();
    let dd = dAkt.getUTCDate();
    let mm = dAkt.getUTCMonth()+1;
    let dAkt_UTC = Date.UTC(jjjj, mm,dd, dAkt.getUTCHours(),dAkt.getUTCMinutes(),dAkt.getUTCSeconds());
    let tStart_UTC = Date.UTC(jjjj,mm,dd,0,0,0);
    // @ts-ignore
    let Zeit_aktuell_UTC_sek = Math.round(Math.abs(dAkt_UTC - tStart_UTC) / 1000);              // sek von 0:00 Uhr bis aktuelle Zeit 
    let Notstrom_Status = (await getStateAsync(sID_Notrom_Status)).val;                         // aktueller Notstrom Status E3DC 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
    let Batterie_SOC_Proz = (await getStateAsync(sID_Batterie_SOC)).val;                        // Aktueller Batterie SOC E3DC
    let PV_Leistung_ADD_W = (await getStateAsync(sID_PvLeistung_ADD_W)).val;                    // Aktuelle zusätzliche PV Leistung externer WR         
    let PV_Leistung_E3DC_W = (await getStateAsync(sID_PvLeistung_E3DC_W)).val;                  // Aktuelle PV Leistung E3DC
    let PV_Leistung_Summe_W = PV_Leistung_E3DC_W + Math.abs(PV_Leistung_ADD_W);                 // Summe PV Leistung, PV_Leistung_ADD_W (negativer Wert)
    let Power_Home_W = (await getStateAsync(sID_Power_Home_W)).val;                             // Aktueller Hausverbrauch E3DC   
    let Akk_max_Discharge_Power_W = (await getStateAsync(sID_Max_Discharge_Power_W)).val;       // Aktuell eingestellte Entladeleistung   
    let Akk_max_Charge_Power_W = (await getStateAsync(sID_Max_Charge_Power_W)).val;             // Aktuell eingestellte Ladeleistung   
    
    // Das Entladen aus dem Speicher wird freigegeben wenn Notstrom oder Inselbetrieb aktiv ist oder der Batterie SOC > der berechneten Reserve liegt
    // Notstrom_Status 0=nicht möglich 1=active 2= nicht Active 3= nicht verfügbar 4= Inselbetrieb
    if (Notstrom_Status == 1 || Notstrom_Status == 4 || Notstrom_SOC_Proz < Batterie_SOC_Proz ){
        // Endladen einschalten
        BAT_Notstrom_Enladen = true;
        if(Akk_max_Discharge_Power_W == 0 || Akk_max_Charge_Power_W == 0){
            await setStateAsync(sID_Max_Discharge_Power_W, Math.abs(Bat_Discharge_Limit_W))
            await setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
            await setStateAsync(sID_DISCHARGE_START_POWER, startDischargeDefault)
        }
    
    }else{
        // Endladen ausschalten
        BAT_Notstrom_Enladen = false;
    }                                                                                          
        
    // Nur wenn PV-Leistung vorhanden ist Regelung starten.
    if(PV_Leistung_Summe_W >0 ){ //|| Zeit_aktuell_sek < tRegelbeginn)
        let Power = 0;
        let Unload_Proz = (await getStateAsync(sID_Unload_Proz[EinstellungAnwahl])).val;                            // Parameter Unload
        let Ladeende_Proz = (await getStateAsync(sID_Ladeende_Proz[EinstellungAnwahl])).val                         // Parameter Ladeende
        let Ladeende2_Proz = (await getStateAsync(sID_Ladeende2_Proz[EinstellungAnwahl])).val                       // Parameter Ladeende2
        let UntererLadekorridor_W = (await getStateAsync(sID_UntererLadekorridor_W[EinstellungAnwahl])).val         // Parameter UntererLadekorridor
        let Ladeschwelle_Proz = (await getStateAsync(sID_Ladeschwelle_Proz[EinstellungAnwahl])).val                 // Parameter Ladeschwelle
        
        // Prüfen ob SOC Batterie > Ladeschwelle.Bis zu diesem SoC Wert wird sofort mit der gesamten überschüssigen PV-Leistung geladen. Erst wenn die ladeschwelle erreicht wird, wird mit dem geregelten Laden begonnen  
        if (Batterie_SOC_Proz > Ladeschwelle_Proz) { //SOC Ladeschwelle wurde erreicht.
            // Prüfen ob vor Regelbeginn
            if (Zeit_aktuell_UTC_sek < tRegelbeginn) { // Vor Regelbeginn.
                if(LogAusgabeSteuerung && Schritt != 1){log('-==== Vor Regelbeginn ====-','warn');Schritt = 1;}
                // Ist Unload < Ladeschwelle wird bis Ladeschwelle geladen und Unload ignoriert
                if(Ladeschwelle_Proz <= Unload_Proz){
                    let Unload_SOC_Proz = 100
                    // Ist der Batterie SoC > Unload wird entladen
                    if ((Batterie_SOC_Proz - Unload_Proz) > 0){
                        if ((Batterie_SOC_Proz - Unload_Proz) < 1){
                            Unload_SOC_Proz = Batterie_SOC_Proz
                        }else{
                            // Es wird bis Regelbeginn auf Unload entladen
                            Unload_SOC_Proz = Unload_Proz;
                        }
                        // Neuberechnung der Ladeleistung erfolgt, wenn der SoC sich ändert oder nach Ablauf von höchstens 5 Minuten oder tLadezeitende sich ändert oder die letzte Ladeleistung 0 W war oder die Parameter sich geändert haben.
                        if(Batterie_SOC_Proz != Batterie_SOC_alt_Proz || (Zeit_aktuell_UTC_sek - Zeit_alt_UTC_sek) > 300 || tRegelbeginn != tRegelbeginn_alt || M_Power == 0 || M_Power == maximumLadeleistung_W || CheckConfig){
                            Batterie_SOC_alt_Proz = Batterie_SOC_Proz; CheckConfig = false; tRegelbeginn_alt = tRegelbeginn; Zeit_alt_UTC_sek = Zeit_aktuell_UTC_sek;
                            // Berechnen der Entladeleistung bis zum Unload SOC in W/sek.
                            M_Power = Math.round(((Unload_SOC_Proz - Batterie_SOC_Proz)*Speichergroesse_kWh*10*3600) / (tRegelbeginn-Zeit_aktuell_UTC_sek)) ;
                            if(LogAusgabeSteuerung){log('-==== 1 M_Power:'+M_Power+' = Math.round(((Unload_SOC_Proz:'+Unload_SOC_Proz+' - Batterie_SOC_Proz:'+Batterie_SOC_Proz+')*Speichergroesse_kWh:'+Speichergroesse_kWh+'*10*3600) / (tRegelbeginn:'+tRegelbeginn+' - Zeit_aktuell_UTC_sek:'+Zeit_aktuell_UTC_sek+')) ====-')}
                
                            // Prüfen ob die PV-Leistung plus Entladeleistung Batterie die max. WR-Leistung übersteigt
                            if((PV_Leistung_E3DC_W - M_Power)> Max_wrleistung_W){
                                M_Power = PV_Leistung_E3DC_W - Max_wrleistung_W
                            }
                        }
                        // Laden der Batterie erst nach Regelbeginn zulassen
                        if(M_Power > 0){M_Power = 0;}
                        
                    }else{
                        M_Power = 0;
                    }
                }
           
            }else if(Zeit_aktuell_UTC_sek < tRegelende){ // Nach Regelbeginn vor Regelende
                if(LogAusgabeSteuerung && Schritt != 2){log('-==== Nach Regelbeginn vor Regelende ====-','warn');Schritt=2;}
                // Neuberechnung der Ladeleistung erfolgt, wenn der SoC sich ändert oder nach Ablauf von höchstens 5 Minuten oder tLadezeitende sich ändert oder die letzte Ladeleistung 0 W war oder die Parameter sich geändert haben.
                if(Batterie_SOC_Proz != Batterie_SOC_alt_Proz || (Zeit_aktuell_UTC_sek - Zeit_alt_UTC_sek) > 300 || tRegelende != tRegelende_alt || M_Power == 0 || M_Power == maximumLadeleistung_W || CheckConfig){
                    Batterie_SOC_alt_Proz = Batterie_SOC_Proz; CheckConfig = false; tRegelende_alt = tRegelende; Zeit_alt_UTC_sek = Zeit_aktuell_UTC_sek;
                    // Berechnen der Ladeleistung bis zum Ladeende SOC in W/sek.
                    M_Power = Math.round(((Ladeende_Proz - Batterie_SOC_Proz)*Speichergroesse_kWh*10*3600) / (tRegelende-Zeit_aktuell_UTC_sek));
                    if(LogAusgabeSteuerung){log('-==== 2 M_Power:'+M_Power+' = Math.round(((Ladeende_Proz:'+Ladeende_Proz+' - Batterie_SOC_Proz:'+Batterie_SOC_Proz+')*Speichergroesse_kWh:'+Speichergroesse_kWh+'*10*3600) / (tRegelende:'+tRegelende+' - Zeit_aktuell_UTC_sek:'+Zeit_aktuell_UTC_sek+')) ====-')}
                    if (M_Power < UntererLadekorridor_W || M_Power < 0){
                        M_Power = 0
                    }
                }
            
            }else if(Zeit_aktuell_UTC_sek < tSommerladeende){ // Nach Regelende vor Sommerladeende
                if(LogAusgabeSteuerung && Schritt != 3){log('-==== Nach Regelende vor Sommerladeende ====-','warn');Schritt=3;}
                if (Batterie_SOC_Proz < Ladeende_Proz){
                    M_Power = maximumLadeleistung_W;
                }else if (Batterie_SOC_Proz < Ladeende2_Proz){
                    // Berechnen der Ladeleistung bis zum Ladeende SOC in W/sek.
                    // Neuberechnung der Ladeleistung erfolgt, wenn der SoC sich ändert oder nach Ablauf von höchstens 5 Minuten oder tLadezeitende sich ändert oder die letzte Ladeleistung 0 W war oder die Parameter sich geändert haben.
                    if(Batterie_SOC_Proz != Batterie_SOC_alt_Proz || (Zeit_aktuell_UTC_sek - Zeit_alt_UTC_sek) > 300 || tRegelende != tRegelende_alt || M_Power == 0 || M_Power == maximumLadeleistung_W || CheckConfig){
                        Batterie_SOC_alt_Proz = Batterie_SOC_Proz; CheckConfig = false; tRegelende_alt = tRegelende; Zeit_alt_UTC_sek = Zeit_aktuell_UTC_sek;
                        M_Power = Math.round(((Ladeende2_Proz - Batterie_SOC_Proz)*Speichergroesse_kWh*10*3600) / (tSommerladeende-Zeit_aktuell_UTC_sek));
                        if(LogAusgabeSteuerung){log('-==== 3 M_Power:'+M_Power+' = Math.round(((Ladeende2_Proz:'+Ladeende2_Proz+' - Batterie_SOC_Proz:'+Batterie_SOC_Proz+')* Speichergroesse_kWh:'+Speichergroesse_kWh+' * 10 * 3600)/(tSommerladeende:'+tSommerladeende+' - Zeit_aktuell_UTC_sek:'+Zeit_aktuell_UTC_sek+')) ====-')}
                        if (M_Power < 0){M_Power = 0;} 
                    }   
                }else{
                    M_Power = 0;
                }
            }else if(Zeit_aktuell_UTC_sek > tSommerladeende){// Nach Sommerladeende
                // Wurde Batterie SOC Ladeende2 erreicht, dann Ladung beenden ansonsten mit maximal möglicher Ladeleistung Laden.
                if(LogAusgabeSteuerung && Schritt != 4){log('-==== Sommerladeende überschritten ====-','warn');Schritt=4;}
                M_Power = maximumLadeleistung_W;
            }
        }else{ // SOC Ladeschwelle wurde nicht erreicht. 
            M_Power = maximumLadeleistung_W;
            if(Akk_max_Charge_Power_W == 0){
                await setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
            }
        
        }

        // Prüfen ob höhere Ladeleistung nötig ist um Einspeisegrenze einhalten zu können.
        Power = (PV_Leistung_E3DC_W - (Einspeiselimit_kWh * 1000))-Power_Home_W
        // Prüfen ob die PV-leistung die WR-Leistung überschreiten.
        let Power_WR = PV_Leistung_E3DC_W - Max_wrleistung_W
        if (Power < 0){Power = 0}
        if (Power_WR < 0){Power_WR=0}

        if(Power_WR > 0 || Power > 0){
            if (Power_WR > Power){
                await setStateAsync(sID_Saved_Power_W,Power_WR)
                if(M_Power < Power_WR){M_Power = Power_WR;if(LogAusgabeSteuerung ){log('-==== Power_WR:'+Power_WR+' M_Power:'+M_Power+' ====-')};}
            }else{
                await setStateAsync(sID_Saved_Power_W,Power)
                if(M_Power < Power){M_Power = Power;if(LogAusgabeSteuerung ){log('-==== Power:'+Power+' M_Power:'+M_Power+' ====-')};}
            }  
        }else{
            await setStateAsync(sID_Saved_Power_W,0)
        }
      
        // Prüfen ob Berechnete Ladeleistung innerhalb der min. und max. Grenze ist
        if (M_Power < Bat_Discharge_Limit_W){M_Power = Bat_Discharge_Limit_W;} 
        if (M_Power > maximumLadeleistung_W){M_Power = maximumLadeleistung_W;}
        
    }
    
    //Prüfen ob berechnete Ladeleistung M_Power zu Netzbezug führt
    if(M_Power >= 0){   
        let PowerGrid = PV_Leistung_Summe_W -(Power_Home_W + M_Power)
        if(PowerGrid < 500 && M_Power != maximumLadeleistung_W){// Führt zu Netzbezug, Steuerung ausschalten
            M_Power = maximumLadeleistung_W
            if(LogAusgabeSteuerung){log('-==== Ladesteuerung gestoppt ====-','warn');}
        }   
    }else{
        let PowerGrid = PV_Leistung_Summe_W -(Power_Home_W - M_Power)
        if(LogAusgabeSteuerung){log('Entladeleistung M_Power='+M_Power,'warn');}
        if(PowerGrid < M_Power ){// Führt zu Netzbezug, Entladeleistung erhöhen
            M_Power = PowerGrid
            // Merker um neu Berechnung zu triggern
            CheckConfig = true;
            if(LogAusgabeSteuerung){log('Entladeleistung PowerGrid ='+PowerGrid,'warn');}
        }   
    }
    // Leerlauf beibehalten bis sich der Wert M_Power ändert oder Notstrom Reserve erreicht ist
    if(M_Power_alt != maximumLadeleistung_W || M_Power != maximumLadeleistung_W || !BAT_Notstrom_Enladen ){
        // Alle 10 sek. muss mindestens ein Steuerbefehl an e3dc.rscp Adapter gesendet werden sonst übernimmt E3DC die Steuerung
        if(M_Power != M_Power_alt || E3DC_Set_Power_Mode != E3DC_Set_Power_Mode_alt || (Zeit_aktuell_UTC_sek- ZeitE3DC_SetPower_alt)> 5){
            ZeitE3DC_SetPower_alt = Zeit_aktuell_UTC_sek;M_Power_alt = M_Power;

            if(M_Power == 0 || !BAT_Notstrom_Enladen ){
                Set_Power_Value_W = 0;
                await setStateAsync(sID_SET_POWER_MODE,1); // Idle
                await setStateAsync(sID_SET_POWER_VALUE_W,0)
                // Statische Lade/Entladesperre nur wenn Notstrom SOC erreicht wurde um SSD Schreibzugriffe zu reduzieren
                if((Akk_max_Discharge_Power_W != 0 || Akk_max_Charge_Power_W != 0) && !BAT_Notstrom_Enladen){
                    await setStateAsync(sID_DISCHARGE_START_POWER, 0)
                    await setStateAsync(sID_Max_Discharge_Power_W, 0)
                    await setStateAsync(sID_Max_Charge_Power_W, 0)
                }
                if (LogAusgabeSteuerung){log('Schritt = '+Schritt+' E3DC_Set_Power_Mode = 1');}
            }else if(M_Power == maximumLadeleistung_W){
                // E3DC die Steuerun überlassen, dann wird mit der maximal möglichen Ladeleistung geladen oder entladen
                if(Akk_max_Discharge_Power_W == 0 || Akk_max_Charge_Power_W == 0){
                    await setStateAsync(sID_Max_Discharge_Power_W, Math.abs(Bat_Discharge_Limit_W))
                    await setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
                    await setStateAsync(sID_DISCHARGE_START_POWER, startDischargeDefault)
                }
                Set_Power_Value_W = 0
                await setStateAsync(sID_SET_POWER_MODE,0); // Normal
                if(LogAusgabeSteuerung){log('-==== Schritt = '+Schritt+' keine Steuerung ====-')}
                
            }else if(M_Power > 0){
                // Beim ersten aufruf Wert M_Power übernehmen und erst dann langsam erhöhen oder senken
                if(Set_Power_Value_W < 1){Set_Power_Value_W=M_Power}
                // Leistung langsam erhöhrn oder senken um Schwankungen auszugleichen
                if(M_Power > Set_Power_Value_W){
                    Set_Power_Value_W = Set_Power_Value_W + 1
                }else if(M_Power < Set_Power_Value_W){
                    Set_Power_Value_W = Set_Power_Value_W-1
                }
                if(Akk_max_Discharge_Power_W == 0 || Akk_max_Charge_Power_W == 0){
                    await setStateAsync(sID_Max_Discharge_Power_W, Math.abs(Bat_Discharge_Limit_W))
                    await setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
                    await setStateAsync(sID_DISCHARGE_START_POWER, startDischargeDefault)
                }
                await setStateAsync(sID_SET_POWER_MODE,3); // Laden
                await setStateAsync(sID_SET_POWER_VALUE_W,Set_Power_Value_W) // E3DC bleib beim Laden im Schnitt um ca 82 W unter der eingestellten Ladeleistung
                if (LogAusgabeSteuerung){log('Schritt = '+Schritt+' E3DC_Set_Power_Mode = 3 (laden)  Set_Power_Value_W = '+Set_Power_Value_W+' M_Power = '+M_Power,'warn');}
            
            }else if(M_Power < 0){
                // Beim ersten aufruf Wert M_Power übernehmen und erst dann langsam erhöhen oder senken
                if(Set_Power_Value_W >= 0){Set_Power_Value_W=M_Power}
                if(!CheckConfig){
                    // Leistung langsam erhöhrn oder senken um Schwankungen auszugleichen
                    if(M_Power > Set_Power_Value_W){
                        Set_Power_Value_W = Set_Power_Value_W + 1
                    }else if(M_Power < Set_Power_Value_W){
                        Set_Power_Value_W = Set_Power_Value_W-1
                    }
                }else{
                    Set_Power_Value_W = M_Power
                }
                if(Akk_max_Discharge_Power_W == 0 || Akk_max_Charge_Power_W == 0){
                    await setStateAsync(sID_Max_Discharge_Power_W, Math.abs(Bat_Discharge_Limit_W))
                    await setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
                    await setStateAsync(sID_DISCHARGE_START_POWER, startDischargeDefault)
                }
                await setStateAsync(sID_SET_POWER_MODE,2); // Entladen
                await setStateAsync(sID_SET_POWER_VALUE_W,Math.abs(Set_Power_Value_W)) // E3DC bleib beim Entladen im Schnitt um ca 65 W über der eingestellten Ladeleistung
                if (LogAusgabeSteuerung){log('Schritt = '+Schritt+' E3DC_Set_Power_Mode = 2 (entladen) Set_Power_Value_W = '+Set_Power_Value_W+' M_Power = '+M_Power,'warn');}
            }
            E3DC_Set_Power_Mode_alt=E3DC_Set_Power_Mode;
            if (LogAusgabeSteuerung){
                if (!BAT_Notstrom_Enladen){log('-==== Notstrom Reserve erreicht, Entladen der Batterie ist ausgeschaltet ====-')}
                //log('Berechnete Notstromreserve Notstrom_SOC_Proz ='+Notstrom_SOC_Proz)
                                
            } 
       
        
        }

    }
}

// Notstromreserve berechnen (Notstrom_min_Proz = Speicherreserve in % bei Wintersonnenwende 21.12 / Notstrom_sockel_Proz =  min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9. )
async function Notstromreserve()
{
    
    let dAkt = new Date();
    let jjjj= dAkt.getFullYear();
    let dStart = new Date(jjjj+',1,1');
    // @ts-ignore
    let tm_yday = Math.round(Math.abs(dAkt - dStart) / (1000 * 60 * 60 * 24 ));
    let Notstrom_sockel_Proz = (await getStateAsync(sID_Notstrom_sockel_Proz)).val           // Parameter Charge-Control Notstrom Sockel
    let Notstrom_min_Proz = (await getStateAsync(sID_Notstrom_min_Proz)).val                 // Parameter Charge-Control Notstrom min
    Notstrom_SOC_Proz = Math.round(Notstrom_sockel_Proz + (Notstrom_min_Proz - Notstrom_sockel_Proz) * Math.cos((tm_yday+9)*2*3.14/365))
    await setStateAsync(sID_Notstrom_akt,Notstrom_SOC_Proz)
}


// Einstellungen 1-5 je nach Überschuss PV Leistung Wetterprognose und Bewölkung anwählen 
async function Einstellung(UeberschussPrognoseProzent)
{
    let Bedeckungsgrad12,Bedeckungsgrad15;
    EinstellungAnwahl =  (await getStateAsync(sID_EinstellungAnwahl)).val    
    if (UeberschussPrognoseProzent== null){
      log('-==== Überschuss PV-Leistung konnte nicht berechnet werden. Ueberschuss='+UeberschussPrognoseProzent+' ====-','error');  
      return  
    }
        
    // Bewölkung für weitere Entscheidung ermitteln
    Bedeckungsgrad12 = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[3] + 'Bewoelkungsgrad_12')).val;
    Bedeckungsgrad15 = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[3] + 'Bewoelkungsgrad_15')).val;
    if (LogAusgabe){log('Bewölkungsgrad 12 Uhr Proplanta '+Bedeckungsgrad12);}
    if (LogAusgabe){log('Bewölkungsgrad 15 Uhr Proplanta '+Bedeckungsgrad15);}
    if (Bedeckungsgrad12 == 200 && AutomatikAnwahl || Bedeckungsgrad15 == 200 && AutomatikAnwahl )
    {
      log('-==== Bewölkungsgrad_12 oder Bewölkungsgrad_15 wurde nicht abgerufen. 12='+Bedeckungsgrad12+' 15='+Bedeckungsgrad15+' ====-','warn');  
      return  
    }
          
    // Einstellung 1
    // Prognose PV-Leistung geringer als benötigter Eigenverbrauch, Überschuss zu 100% in Batterie speichern
	if (UeberschussPrognoseProzent === 0 && AutomatikAnwahl)
	{
		if (LogAusgabe){log('Einstellung 1 aktiv AutomatikAnwahl='+AutomatikAnwahl+' EinstellungAnwahl='+1);}
        if(EinstellungAnwahl != 1){
            await setStateAsync(sID_EinstellungAnwahl,1);
        }
	}	
	
    // Einstellung 2
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen
    // und keine Bewölkung > 90% 
	if (UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 < 90 && Bedeckungsgrad15 < 90 && AutomatikAnwahl) 
    {
		if (LogAusgabe){log('Einstellung 2 aktiv EinstellungAnwahl='+EinstellungAnwahl);}
        if(EinstellungAnwahl != 2){
            await setStateAsync(sID_EinstellungAnwahl,2);
        }
	}	
	
    // Einstellung 3
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 18:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12>=90 && Bedeckungsgrad15>=90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===3))
	{
		if (LogAusgabe){log('Einstellung 3 aktiv');}
        if(EinstellungAnwahl != 3){
            await setStateAsync(sID_EinstellungAnwahl,3);
        }
	}	
	
    // Einstellung 4
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 15:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 >= 90 && Bedeckungsgrad15 < 90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===4))
	{
		if (LogAusgabe){log('Einstellung 4 aktiv');}
        if(EinstellungAnwahl != 4){
            await setStateAsync(sID_EinstellungAnwahl,4);
        }
    }
	
    // Einstellung 5
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 15:00 - 18:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12<90 && Bedeckungsgrad15>=90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===5))
    {
        if (LogAusgabe){log('Einstellung 5 aktiv');}
        if(EinstellungAnwahl != 5){
            await setStateAsync(sID_EinstellungAnwahl,5);
        }
	}
    
}

// Die Funktion ändert die Prognosewerte für das Diagramm und berechnet die Prognose in kWh je nach Auswahl 
async function Prognosen_Berechnen()
{
    let Tag =[], PrognoseProplanta_kWh_Tag =[],PrognoseSolcast_kWh_Tag=[],PrognoseSolcast90_kWh_Tag=[],Prognose_kWh_Tag =[];
	let IstSummePvLeistung_kWh = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'IstSummePvLeistung_kWh')).val;
    // Array Tag Datum von heute bis + 5 Tag eintragen
    for (let i = 0; i < 7 ; i++){
        Tag[i] = nextDayDate(i).slice(8,10);
    }
    // Array die Aktuellen kWh von Heute + 5 Tage vorraus zuweisen
    for (let i = 0; i < 7 ; i++){
        PrognoseProplanta_kWh_Tag[i] = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[2]+'PrognoseProp_kWh_'+Tag[i])).val;  
        PrognoseSolcast_kWh_Tag[i] = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[2]+'PrognoseSolcast_kWh_'+Tag[i])).val;  
        PrognoseSolcast90_kWh_Tag[i] = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[2]+'PrognoseSolcast90_kWh_'+Tag[i])).val;  
    }
    
    if (LogAusgabe){log('Prognose Solcast in kWh = '+ PrognoseSolcast_kWh_Tag[0]);}
    if (LogAusgabe){log('Prognose Solcast 90 Perzentil in kWh = '+ PrognoseSolcast90_kWh_Tag[0]);}
    if (LogAusgabe){log('Prognose Proplanta in kWh = '+ PrognoseProplanta_kWh_Tag[0]);}

    // Berechnung der Prognose nach Einstellung PrognoseAnwahl
    for (let i = 0; i < 7 ; i++){
        if (PrognoseSolcast_kWh_Tag[i] == 0 && PrognoseSolcast90_kWh_Tag[i] == 0 && PrognoseProplanta_kWh_Tag[i] == 0){
            if (LogAusgabe){log('-==== Prognose für Tag'+i+' konnte nicht abgerufen werden ====-')};
            Prognose_kWh_Tag[i] = 0;
        }else{
            if ((PrognoseSolcast_kWh_Tag[i] == 0 && PrognoseSolcast90_kWh_Tag[i] == 0) || PrognoseAnwahl == 1){Prognose_kWh_Tag[i] = PrognoseProplanta_kWh_Tag[i];}
            if ((PrognoseProplanta_kWh_Tag[i] == 0 && PrognoseSolcast90_kWh_Tag[i] == 0) || PrognoseAnwahl == 2){Prognose_kWh_Tag[i] = PrognoseSolcast_kWh_Tag[i];}
            if ((PrognoseProplanta_kWh_Tag[i] == 0 && PrognoseSolcast_kWh_Tag[i] == 0) || PrognoseAnwahl == 5){Prognose_kWh_Tag[i] = PrognoseSolcast90_kWh_Tag[i];}
            
            if (PrognoseSolcast_kWh_Tag[i] != 0 && PrognoseProplanta_kWh_Tag[i] != 0 && PrognoseAnwahl == 0) {
                if (PrognoseSolcast_kWh_Tag[i] > PrognoseProplanta_kWh_Tag[i]) {
                    Prognose_kWh_Tag[i] = PrognoseProplanta_kWh_Tag[i];
                }
                if (PrognoseProplanta_kWh_Tag[i] >PrognoseSolcast_kWh_Tag[i]){
                    Prognose_kWh_Tag[i] = PrognoseSolcast_kWh_Tag[i];
                }
            }
            if (PrognoseSolcast_kWh_Tag[i] != 0 && PrognoseProplanta_kWh_Tag[i] != 0 && PrognoseAnwahl == 3) {
                if (PrognoseSolcast_kWh_Tag[i] < PrognoseProplanta_kWh_Tag[i]) {
                    Prognose_kWh_Tag[i] = PrognoseProplanta_kWh_Tag[i];
                }
                if (PrognoseProplanta_kWh_Tag[i] < PrognoseSolcast_kWh_Tag[i]){
                    Prognose_kWh_Tag[i] = PrognoseSolcast_kWh_Tag[i];
                }
            }
            if (PrognoseSolcast_kWh_Tag[i] != 0 && PrognoseProplanta_kWh_Tag[i] != 0 && PrognoseAnwahl == 4) {
                Prognose_kWh_Tag[i] = (PrognoseProplanta_kWh_Tag[i]+PrognoseSolcast_kWh_Tag[i])/2;
            }
            if (PrognoseSolcast_kWh_Tag[i] != 0 && PrognoseSolcast90_kWh_Tag[i] != 0 && PrognoseAnwahl == 6) {
                Prognose_kWh_Tag[i] = (PrognoseSolcast90_kWh_Tag[i]+PrognoseSolcast_kWh_Tag[i])/2;
            }
            // nKorrFaktor abziehen
            Prognose_kWh_Tag[i] = (Prognose_kWh_Tag[i]/100)*(100-nKorrFaktor)
            // nMaxPvLeistungTag_kWh verwenden wenn die Prognose höher ist
            if (Prognose_kWh_Tag[i] > nMaxPvLeistungTag_kWh) {Prognose_kWh_Tag[i] = nMaxPvLeistungTag_kWh;}
            // nMinPvLeistungTag_kWh verwenden wenn die Prognose niedriger ist
            if (Prognose_kWh_Tag[i] != 0) {
                if (Prognose_kWh_Tag[i] < nMinPvLeistungTag_kWh) {Prognose_kWh_Tag[i] = nMinPvLeistungTag_kWh;}
            }
        }
    }
    if (LogAusgabe){log('Prognose_kWh nach Abzug Korrekturfaktor  = '+ Prognose_kWh_Tag[0]);}
       
    // Bereits produzierte PV-Leistung muss von der Tagesprognose abgezogen werden
    Prognose_kWh_Tag[0] = Prognose_kWh_Tag[0]-IstSummePvLeistung_kWh;
    if (LogAusgabe){log('Bereits produzierte PV-Leistung  = '+IstSummePvLeistung_kWh);}


    setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+Tag[0], Prognose_kWh_Tag[0]+IstSummePvLeistung_kWh);
    await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'PrognoseBerechnung_kWh_heute', Prognose_kWh_Tag[0]);
    // Nur bis ende vom aktuellen Monat werte eintragen, sonst werden die ersten Tage vom aktuellen Monat mit den Werten vom nächsten Monat überschrieben. 
    for (let i = 1; i < 7 ; i++){
        if (Tag[i] == '01'){break;}
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+Tag[i], Prognose_kWh_Tag[i]);
    }
    
    
    if (LogAusgabe){log('Prognose_kWh_heute für Berechnung = '+Prognose_kWh_Tag[0]);}
    
}; 


// Die Funktion berechnet den Überschuss anhand der PrognoseBerechnung_kWh_heute 
// nach Abzug von Eigenverbrauch und Ladekapazität des Batteriespeicher.
async function Ueberschuss_Prozent()
{
    let Ueberschuss_Prozent = 0,Ueberschuss_kWh = 0,FreieKapBatterie_kWh = 0;
    let Rest_Eigenverbrauch_kWh = (await getStateAsync(sID_EigenverbrauchTag)).val;
	let nEigenverbrauchTag = (await getStateAsync(sID_EigenverbrauchTag)).val;
    let Prognose_kWh = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'PrognoseBerechnung_kWh_heute')).val;
    let AktSpeicherSoC = (await getStateAsync(sID_Batterie_SOC)).val;
    let dStart = new Date(0, 0, 0, 6,0,0, 0);
    let dAkt = new Date();
     //Vom nEigenverbrauch Tag von 6:00 bis 19:00 Uhr bereits verbrauchte kWh abziehen
    if (toInt(dAkt.getHours()) < 19 && toInt(dAkt.getHours())>6){
        let Diff_Minuten = (dAkt.getMinutes()- dStart.getMinutes())+((dAkt.getHours()- dStart.getHours())*60)
        Rest_Eigenverbrauch_kWh = nEigenverbrauchTag-((nEigenverbrauchTag/780)*Diff_Minuten);
    }

    FreieKapBatterie_kWh = await Batterie_kWh(AktSpeicherSoC);
    if (Prognose_kWh != null){
        Ueberschuss_kWh =(Prognose_kWh - Rest_Eigenverbrauch_kWh)- FreieKapBatterie_kWh;
	    if (Ueberschuss_kWh < 0){Ueberschuss_kWh = 0;}
        Ueberschuss_Prozent = await BatterieProzent(Ueberschuss_kWh);
	    if (Ueberschuss_Prozent>100){Ueberschuss_Prozent=100;}
        if (LogAusgabe){log('Eigenverbrauch Tag = '+nEigenverbrauchTag);}
        if (LogAusgabe){log('AktSpeicherSoC in % = '+AktSpeicherSoC);}
	    if (LogAusgabe){log('Ueberschuss in kWh '+Ueberschuss_kWh+' = (Prognose kWh '+Prognose_kWh+' - Berechneter Eigenverbrauch '+Rest_Eigenverbrauch_kWh+') - FreieKapBatterie_kWh '+FreieKapBatterie_kWh);}
        if (LogAusgabe){log('Ueberschuss in Prozent = '+Ueberschuss_Prozent);}
        return round(Ueberschuss_Prozent, 0);
    
    }else{
        if (DebugAusgabe){log('-==== PrognoseBerechnung_kWh_heute Variable hat keinen Wert ====-');}
        return null
    }
}

// materialdesing JSON Chart Werte speichern
async function makeJson(){
    let chart = {}
    let values1 = [], values2 = [], values3 = [], values4 = [], values5 = [], axisLabels = [];
    let akkPV_Leistung, akkProgProp, akkProgAuto,akkProgSolcast,akkProgSolcast90;
    let date = new Date();
	let mm = date.getMonth() + 1;
    let mm0 = zeroPad(mm,2);
    for (let i = 1; i <= 31; i++) {
	    let n= zeroPad(i,2);
        akkPV_Leistung = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'IstPvLeistung_kWh_' + n)).val
        akkProgProp = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_' + n)).val
        akkProgSolcast = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast_kWh_' + n)).val
        akkProgSolcast90 = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast90_kWh_' + n)).val
        akkProgAuto = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_' + n)).val
            
        values1.push(akkProgAuto)
        values2.push(akkProgProp)
        values3.push(akkProgSolcast)
        values4.push(akkProgSolcast90)
        values5.push(akkPV_Leistung)

    }
    for (let i = 1; i <= 31; i++) {
        axisLabels.push(i);
    }

    chart = {
        axisLabels: axisLabels,
        graphs: [
            {
                data: values1,
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
                data: values2,
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
                data: values3,
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
                data: values4,
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
                data: values5,
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
    await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_'+mm0,JSON.stringify(chart),true);
    if (DebugAusgabe){log('-==== JSON History ertellt ====-');}
}

// Funktion erstellt eine Sicherungsdatei der History JSON vom letzten Monat
async function writelog() {
    let date = new Date();
	let mm = date.getMonth();
    if (mm == 0){mm = 12}
    let MM = zeroPad(mm,2);
    let Jahr = date.getFullYear()
    let string =MM +"."+ Jahr +"\n"+ (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_'+MM)).val+"\n";
    if ( logflag === true) {
        fsw.readFile(sLogPath, 'utf8', function(err,data){ 
            if (!err) {  
                fsw.appendFileSync(sLogPath, string );
            }else{
                if(logflag)log("-==== History lokal sichern: Routine writelog - Logfile nicht gefunden - wird angelegt ====-");
                fsw.writeFileSync(sLogPath, string );
            }
        });         
    } ; 
    await setStateAsync(sID_AnzeigeHistoryMonat,date.getMonth()+1); // Anzeige VIS auf aktuelles Monat einstellen
}

// Verfügbare Speichergröße berechnen
async function Speichergroesse()
{
    let Kapa_Bat_Wh = (await getStateAsync(sID_installed_Battery_Capacity)).val;
    let ASOC_Bat_Pro = (await getStateAsync(sID_BAT0_Alterungszustand)).val;
    // E3DC verwendet ca. 10% der Batteriekapazität um sicherzustellen das diese nie ganz entladen wird.
    Kapa_Bat_Wh = Kapa_Bat_Wh * (Entladetiefe_Pro/100);
    Speichergroesse_kWh = round(((Kapa_Bat_Wh/100)*ASOC_Bat_Pro)/1000,0);
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
    if (LogAusgabe){log('BatterieProzent(wert)='+wert)};
    Ergebniss = wert/(Speichergroesse_kWh/100);
    return Ergebniss;
}; 

// Runden. Parameter float wert, int dez Anzahl der Stellen
function round(wert, dez) {
    let umrechnungsfaktor = Math.pow(10,dez);
    return Math.round(wert * umrechnungsfaktor) / umrechnungsfaktor;
} 


// Addiert zum Datum x Tag und liefert das Datum im Format yyyy-mm-dd
function nextDayDate(days) {
    let today = new Date();
	today.setDate(today.getDate() + days);
    let mm = today.getMonth() + 1; //January is 0!
    let dd = today.getDate();
    let yyyy = today.getFullYear();
    let mm0 = zeroPad(mm,2);
    let dd0 = zeroPad(dd,2);
    return yyyy + '-' + mm0 + '-' + dd0;
}


// Autor:Mic (ioBroker) | Mic-M (github)
// Fügt Vornullen zu einer Zahl hinzu, macht also z.B. aus 7 eine "007". 
// Akzeptiert sowohl Datentyp number und string als Eingabe.
// Autor:Mic (ioBroker) | Mic-M (github)
function zeroPad(num, places) {
    let zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;        
} 

// Summe PV Leistung berechnen Leistungszähler 0 und Leistungszähler 1
async function SummePvLeistung(){   
    let DatumAk = new Date();
	let TagHeute = DatumAk.getDate();
	let TagHeute_0 = zeroPad(TagHeute,2);
	let IstPvLeistung0_kWh = 0;
	let IstPvLeistung1_kWh = 0;
	let IstPvLeistung_kWh = 0;
	if (existsState(sID_PVErtragLM0)){
	    IstPvLeistung0_kWh = parseFloat(getState(sID_PVErtragLM0).val);
	    if (DebugAusgabe) {log('PV-Leistung Leistungsmesser 0 Heute = '+IstPvLeistung0_kWh);}
	}
	if (existsState(sID_PVErtragLM1)){
	    IstPvLeistung1_kWh = parseFloat(getState(sID_PVErtragLM1).val);
	    if (DebugAusgabe) {log('PV-Leistung Leistungsmesser 1 Heute = '+IstPvLeistung1_kWh);}
	}
	IstPvLeistung_kWh = IstPvLeistung0_kWh + IstPvLeistung1_kWh;
	await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'IstPvLeistung_kWh_'+ TagHeute_0, IstPvLeistung_kWh);
    await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'IstSummePvLeistung_kWh', IstPvLeistung_kWh);
    
    makeJson();
};

// Methode zum addieren/subtrahieren einer Menge an Minuten auf eine Uhrzeit
// time = Uhrzeit im Format HH:MM
// offset = Zeit in Minuten
function addMinutes(time, offset){
    // Uhrzeit wird in Stunden und Minuten geteilt
    let elements = time.split(":");
    let hours = elements[0];   
    let minutes = elements[1];
    // Aufrunden des Offsets fuer den Fall, dass eine Fliesskommazahl uebergeben wird
    let roundOffset = Math.ceil(offset);
    // Umrechnen der Uhrzeit in Minuten seit Tagesbeginn
    let timeSince24 = (hours * 60) + parseInt(minutes);
    // Addieren des uebergebenen Offsets
    timeSince24 = timeSince24 + roundOffset;
    // Ueberlaufbehandlung
    if(timeSince24 < 0){
        timeSince24 = timeSince24 + 1440;
    }else{
        if(timeSince24 > 1440){
            timeSince24 = timeSince24 - 1440;
        }
    } 
    // Errechnen von Stunden und Minuten aus dem Gesamtzeit seit Tagesbeginn
    let resMinutes = timeSince24 % 60;
    let resHours = (timeSince24 - resMinutes)/60;
    // Sicherstellen, dass der Wert fuer Minuten immer zweistellig ist
    let sMinuten = zeroPad(resMinutes,2);
    // Ausgabe des formatierten Ergebnisses
    return resHours + ":" + sMinuten;
}

// Wetterdaten Proplanta abrufen vor Aufruf main()
async function PrognosedatenAbrufen(){
    await SheduleProplanta()
    // Timer für nächsten Abruf starten
    if(Timer2){clearSchedule(Timer2)};
    let StateZeit = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[3] + 'NaesteAktualisierung')).val;
    if (StateZeit != null){
        StateZeit = addMinutes(StateZeit, 10)
        let t = StateZeit.split(':')
        Timer2 = schedule({hour: t[0], minute: t[1]}, function(){PrognosedatenAbrufen();});
    }else{
        Timer2 = schedule({hour: 5, minute: 25}, function(){PrognosedatenAbrufen();});
        log('Nächste Aktualisierung Wetterdaten 5:25 Uhr')
    }
    main();
}

// Prognose Proplanta abrufen.
function InterrogateProplanta(){
    return new Promise(function(resolve, reject){
        xhr.onreadystatechange = function(){
            if (xhr.readyState ==4){
                if(xhr.status < 200 || xhr.status > 206 || xhr.responseText == null){
                    reject('Error Proplanta, status code = '+ xhr.status)
                }else{
                    resolve(xhr.responseText)
                }
            }
        }
        xhr.ontimeout = function (e) {
            reject('Timeout beim abrufen der Daten von Proplanta')
        };
        xhr.open("GET",baseurl, true);
        xhr.responseType = "text";
		xhr.send();
    
    });
}

// Daten Proplanta beim Skript Start und nach aktualisierung Webseite aktualisieren
async function SheduleProplanta() { 
    if (baseurl == null || typeof baseurl === undefined) {
        log('falsche Länderbezeichnung!');
    }else{
        // Url mit Länderbezeichnung zusammenstellen und alle alten Werte löschen
        baseurl = baseurl.replace(/#PLZ#/ig, ProplantaPlz).replace(/#ORT#/ig, ProplantaOrt);
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_0', 'null');
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_1', 'null');
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_2', 'null');
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_3', 'null');
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_12', 200);
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_15', 200);
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_0', 200);
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_1', 200);
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_2', 200);
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_3', 200);   
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_0', 200);   
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_1', 200);     
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_2', 200);  
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_3', 200);    
        
        if (LogAusgabe){log('******************* Es wird die Globalstrahlung von Proplanta abgerufen *******************');}
        await InterrogateProplanta().then(async function(result){
            let GlobalstrahlungTag0,GlobalstrahlungTag1,GlobalstrahlungTag2,GlobalstrahlungTag3;
            if (LogAusgabe){log('Rueckmeldung InterrogateProplanta XHR.Status= '+ xhr.status)}
            let HTMLBereinigt = await HTML_CleanUp(result)    
            // Array aus restlichen Daten erstellen     
            let SrtingSplit = HTMLBereinigt.split('|');    
            // Alle Werte löschen die leer sind       
            let ArrayBereinig = SrtingSplit.filter(function(e){ return e.replace(/(\r\n|\n|\r)/gm,"")});
        
            // Restlichen Werte die nicht benötigt werden entfernen
            ArrayBereinig.splice(5,5)
            ArrayBereinig.splice(10,5)
            ArrayBereinig.splice(15,2)
            ArrayBereinig.splice(60,2)
            if (DebugAusgabe){
                for (let i in ArrayBereinig) {
                    log("i ="+i+' Wert=' + ArrayBereinig[i]);
                }
            } 
            // Prüfen ob Globalstrahlung für heute in eine Zahl umgewandelt werden kann,wenn nicht noch mal nach 1 Stunde abrufen
            if (isNaN(parseFloat(ArrayBereinig[11]))){
                GlobalstrahlungTag0 = 0;
                xhr.abort
                let d = new Date(), Stunde = d.getHours();
                d.setHours (Stunde + 1);
                let  uhrzeit = d.getHours() + ":" + d.getMinutes();
                setState(instanz + PfadEbene1 + PfadEbene2[3]+'NaesteAktualisierung',uhrzeit);
                if(LogAusgabe){log('Näste Aktualisierung Wetterdaten ='+uhrzeit +' Uhr')}

            }else{
                let Tag0 = nextDayDate(0).slice(8,10), Tag1 = nextDayDate(1).slice(8,10),Tag2 = nextDayDate(2).slice(8,10), Tag3 =nextDayDate(3).slice(8,10);
                // Prüfen ob Werte in eine Zahl umgewandelt werden können,wenn nicht 0 zuweisen     
                if (isNaN(parseFloat(ArrayBereinig[11]))){GlobalstrahlungTag0 = 0;}else{GlobalstrahlungTag0 = parseFloat(ArrayBereinig[11]);}      
                if (isNaN(parseFloat(ArrayBereinig[12]))){GlobalstrahlungTag1 = 0;}else{GlobalstrahlungTag1 = parseFloat(ArrayBereinig[12]);}      
                if (isNaN(parseFloat(ArrayBereinig[13]))){GlobalstrahlungTag2 = 0;}else{GlobalstrahlungTag2 = parseFloat(ArrayBereinig[13]);}      
                if (isNaN(parseFloat(ArrayBereinig[14]))){GlobalstrahlungTag3 = 0;}else{GlobalstrahlungTag3 = parseFloat(ArrayBereinig[14]);}      
                if (isNaN(parseFloat(ArrayBereinig[41]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_12', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_12', parseFloat(ArrayBereinig[41]));}      
                if (isNaN(parseFloat(ArrayBereinig[46]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_15', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_15', parseFloat(ArrayBereinig[46]));}      
                if (isNaN(parseFloat(ArrayBereinig[1]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_0', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_0', parseFloat(ArrayBereinig[1]));}      
                if (isNaN(parseFloat(ArrayBereinig[2]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_1', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_1', parseFloat(ArrayBereinig[2]));}      
                if (isNaN(parseFloat(ArrayBereinig[3]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_2', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_2', parseFloat(ArrayBereinig[3]));}      
                if (isNaN(parseFloat(ArrayBereinig[4]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_3', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_3', parseFloat(ArrayBereinig[4]));}      
                if (isNaN(parseFloat(ArrayBereinig[6]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_0', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_0', parseFloat(ArrayBereinig[6]));}      
                if (isNaN(parseFloat(ArrayBereinig[7]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_1', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_1', parseFloat(ArrayBereinig[7]));}      
                if (isNaN(parseFloat(ArrayBereinig[8]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_2', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_2', parseFloat(ArrayBereinig[8]));}      
                if (isNaN(parseFloat(ArrayBereinig[9]))){setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_3', 200);}else{setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_3', parseFloat(ArrayBereinig[9]));}      
        
                // Proplanta Globalstrahlung in kWh umrechnen und in History speichern *********************************************************  
                let PrognoseProplanta_kWh_Tag0 = (GlobalstrahlungTag0 * nModulFlaeche) * (nWirkungsgradModule/100);
                let PrognoseProplanta_kWh_Tag1 = (GlobalstrahlungTag1 * nModulFlaeche) * (nWirkungsgradModule/100);
                let PrognoseProplanta_kWh_Tag2 = (GlobalstrahlungTag2 * nModulFlaeche) * (nWirkungsgradModule/100);
                let PrognoseProplanta_kWh_Tag3 = (GlobalstrahlungTag3 * nModulFlaeche) * (nWirkungsgradModule/100);
                setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+Tag0, PrognoseProplanta_kWh_Tag0);
                if (Tag1!= '01'){
                    setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+Tag1, PrognoseProplanta_kWh_Tag1);
                    if (Tag2!= '01'){
                        setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+Tag2, PrognoseProplanta_kWh_Tag2);
                        if (Tag3!= '01'){
                            setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+Tag3, PrognoseProplanta_kWh_Tag3);
                        }
                    }
                }
                /********************************************************************************************************************************/
                
                
                
                
                setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_0', ArrayBereinig[16].slice(0, 11));
                setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_1', ArrayBereinig[17].slice(0, 11));
                setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_2', ArrayBereinig[18].slice(0, 11));
                setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_3', ArrayBereinig[19].slice(0, 11));
                await setStateAsync(instanz + PfadEbene1 + PfadEbene2[3]+'NaesteAktualisierung',ArrayBereinig[60].slice(64, 69).replace(".",":"));
                if(LogAusgabe){log('Näste Aktualisierung Wetterdaten ='+ArrayBereinig[60].slice(64, 69).replace(".",":") +' Uhr')}
            
            }
            
        }, function(error) {
                log ('Error in der function InterrogateProplanta. Fehler = '+error, 'warn')
                // Nach einer Stunde neuer Versuch die Daten abzurufen
                let d = new Date(), Stunde = d.getHours();
                d.setHours (Stunde + 1);
                let  uhrzeit = d.getHours() + ":" + d.getMinutes();
                setState(instanz + PfadEbene1 + PfadEbene2[3]+'NaesteAktualisierung',uhrzeit);
                if(LogAusgabe){log('Näste Aktualisierung Wetterdaten ='+uhrzeit +' Uhr')}
        })   
        
    }
}

// Proplanta HTML Tags löschen und Daten bereinigen
function HTML_CleanUp(data) {
    //Alles bis max. Temperatur löschen
    let idx = data.indexOf('<tr id="TMAX" class="">');
    data = data.replace(data.substring(0, idx), "");
    
    // Von min. Temp. der darauf folgenden Nacht bis Globalstrahlung löschen
    let idx1 = data.indexOf('<tr id="NMIN" class="">');
    let idx2 = data.indexOf('Globalstrahlung');
    data = data.replace(data.substring(idx1, idx2), "");
        
    // Von Wetterzustand bis Bedeckungsgrad löschen
    idx1 = data.indexOf('<tr id="WETTERZUSTAND">');
    idx2 = data.indexOf('<tr id="BEDECKUNGSGRAD">');
    data = data.replace(data.substring(idx1, idx2), "");
        
    // Von Windrichtungkompass bis letzte Aktualisierung löschen
    idx1 = data.indexOf('<tr class="WINDRICHTUNGKOMPASS">');
    idx2 = data.indexOf('letzte');
    data = data.replace(data.substring(idx1, idx2), "");
        
    // Nach der letzten Uhrzeit "letzte Aktualisierung" bis zum Ende löschen
    idx = data.indexOf('Uhr');
    data = data.replace(data.substring(idx+45, data.length), "");
        
    // HTML Tags löschen und Daten bereinigen 
    data = data.replace(/<\/tr>/ig, "\n").replace(/<\/table>/ig, "").replace(/<\/td>/ig, "|").replace(/&deg;C/ig, "");
    //entfernt allt tags, bei img tags, lässt es die srcr stehen:
    data = data.replace(/(<script(.|\n|\r)+?(?=<\/sc)<\/script>|<style(.|\n|\r)+?(?=<\/)<\/style>)/ig, "");
    data = data.replace( /<img([^>]+)>/ig,
        function ($0, $1) {
            if ($0.indexOf('symbole/') >0) {
                let src = $0.indexOf('src=');
                let alt = $0.indexOf('alt=');
                if ((alt > -1) && (src > -1)) {
                    let srcs = $0.substring(src + 5).split(/["']/)[0];
                    let altss = $0.substring(alt + 5).split(/["']/)[0];
                    return srcs + '##' + altss;
                }
            }
            return ""; 
        }
    );
    data = data.replace(/(&nbsp;|<([^>]+)>)/ig, '');
    data = data.replace(/&#48;/g, '0').replace(/&#49;/g, '1').replace(/&#50;/g, '2').replace(/&#51;/g, '3').replace(/&#52;/g, '4').replace(/&#53;/g, '5').replace(/&#54;/g, '6').replace(/&#55;/g, '7').replace(/&#56;/g, '8').replace(/&#57;/g, '9');
    data = data.replace(/&#([^;]+);/g, '|');
    data = data.replace(/(\s*\t|<\s*\/*br\s*>)\s*/g, '|');
    data = data.replace(/(%|\r)/g, '').replace(/(kWh\/qm|\r)/g, '').replace(/,/g, '.');
    
    return data
}

// Prognose Solcast PV-Leistung in kW je Dachfläche abrufen.
function InterrogateSolcast(DachFl){
    return new Promise(function(resolve, reject){
        xhr2.onreadystatechange = function(){
            if (xhr2.readyState ==4){
                if(xhr2.status < 200 || xhr2.status > 206 || xhr2.responseText == null){
                    reject('Error, status code = '+ xhr2.status)
                }else{
                    resolve(xhr2.responseText)
                }
            }
        }
        xhr2.ontimeout = function (e) {
            reject('Timeout beim abrufen der Daten von Solcast')
        };
        if (DachFl==1 || DachFl==2){
            xhr2.open("GET",'https://api.solcast.com.au/rooftop_sites/'+Resource_Id_Dach[DachFl]+'/forecasts?format=json&api_key='+SolcastAPI_key, true);
            xhr2.responseType = "json";
            xhr2.send();
        }
    });
}


// Daten Solcast aktualisieren
async function SheduleSolcast(DachFl) { 
    let Datum, Monat;
    let dAkt = new Date();
    if (DachFl > 0 && DachFl <= 2 ){
        for (let z = DachFl; z > 0; z--) {
            if (LogAusgabe){log('****************************** Es wird Solcast Dach '+z+' abgerufen ******************************');}
            await InterrogateSolcast(z).then(async function(result){
                let objDaten = JSON.parse(result)
                log('Rueckmeldung XHR.Status Solcast= '+ xhr2.status)
                //log('DAten='+JSON.stringify(objDaten))
                let ArrayTageswerte = objDaten['forecasts'];
                
                for (let d = 0 ; d < 7; d++) {
                    Datum = nextDayDate(d);
                    if (d == 0) {Monat = Datum.slice(5,7);} // Monat merken um am Monatende nicht vom Monatsanfang die Werte zu überschreiben
                    for (let i = 0; i < ArrayTageswerte.length; i++) {
                        if (ArrayTageswerte[i].period_end.search(Datum)>-1){
                            SummePV_Leistung_Tag_kW[1][d] = SummePV_Leistung_Tag_kW[1][d] + ArrayTageswerte[i].pv_estimate
                            SummePV_Leistung_Tag_kW[3][d] = SummePV_Leistung_Tag_kW[3][d] + ArrayTageswerte[i].pv_estimate90
                        }
                    }
                    if (z ==1){
                        log('Summe PV Leistung Tag '+Datum+ ' pv_estimate= '+round(SummePV_Leistung_Tag_kW[1][d]/2,2)+' pv_estimate90= '+round(SummePV_Leistung_Tag_kW[3][d]/2,2))
                        if (Datum.slice(5,7) == Monat) {
                            // Nach 4 Uhr die Werte vom aktuellen Tag nicht überschreiben
                            if (toInt(dAkt.getHours()) <= 4 || d != 0){
                                setState(instanz +PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast_kWh_' +Datum.slice(8,10),round(SummePV_Leistung_Tag_kW[1][d]/2,2));
                                setState(instanz +PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast90_kWh_' +Datum.slice(8,10),round(SummePV_Leistung_Tag_kW[3][d]/2,2));
                            }
                        }
                        SummePV_Leistung_Tag_kW[1][d] = 0;
                        SummePV_Leistung_Tag_kW[3][d] = 0;
                    }
                }
                
            }, function(error) {
                log ('Error in der function InterrogateSolcast. Fehler = '+error, 'warn')
            })   
        }
        if(!Start){main();}      
    }
}


// Zeitformat UTC dezimal in MEZ Uhrzeit 
async function UTC_Dezimal_to_MEZ(){
    let UTC_Dez_Minuten='';
    let UTC_Dez_Stunden ='';
    let MEZ_Zeit =[];
    let MESZ_Zeit =[];
    let nWinterminimum = (parseFloat((await getStateAsync(sID_Winterminimum[EinstellungAnwahl])).val)).toFixed(2);
    let nSommermaximum = (parseFloat((await getStateAsync(sID_Sommermaximum[EinstellungAnwahl])).val)).toFixed(2);
    let nSommerladeende = (parseFloat((await getStateAsync(sID_Sommerladeende[EinstellungAnwahl])).val)).toFixed(2);
    
    

    let UTC_Dez = [nWinterminimum,nSommermaximum,nSommerladeende];
    for (let i = 0; i < 3 ; i++){
        UTC_Dez_Minuten = ''+Math.trunc(((parseInt(UTC_Dez[i].slice(UTC_Dez[i].indexOf('.')+1,UTC_Dez[i].length))/100)*60));
        UTC_Dez_Stunden = UTC_Dez[i].slice(0,UTC_Dez[i].indexOf('.'))
        if (parseInt(UTC_Dez_Minuten) < 10){
            MEZ_Zeit[i] = addMinutes(UTC_Dez_Stunden +':0'+ UTC_Dez_Minuten,60);
            MESZ_Zeit[i] = addMinutes(UTC_Dez_Stunden +':0'+ UTC_Dez_Minuten,120);
        }else{
            MEZ_Zeit[i] = addMinutes(UTC_Dez_Stunden +':'+ UTC_Dez_Minuten,60)
            MESZ_Zeit[i] = addMinutes(UTC_Dez_Stunden +':'+ UTC_Dez_Minuten,120)
        }
    }
    if (ZeitAnwahl_MEZ_MESZ){
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Winterminimum_MEZ',MESZ_Zeit[0]);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommermaximum_MEZ',MESZ_Zeit[1]);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommerladeende_MEZ',MESZ_Zeit[2]);
    }else{
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Winterminimum_MEZ',MEZ_Zeit[0]);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommermaximum_MEZ',MEZ_Zeit[1]);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommerladeende_MEZ',MEZ_Zeit[2]);
    }
     
}


// Zeiten Start und Ende Regelung von eba
async function MEZ_Regelzeiten(){
    let dAkt = new Date();
    let jjjj= dAkt.getFullYear();
    let dStart = new Date(jjjj+',1,1');
    // @ts-ignore
    let tm_yday = Math.round(Math.abs(dAkt - dStart) / (1000 * 60 * 60 * 24 ));
    let ZeitAnwahl_MEZ_MESZ = (await getStateAsync(sID_Anwahl_MEZ_MESZ)).val
    
    let nWinterminimum = parseFloat((await getStateAsync(sID_Winterminimum[EinstellungAnwahl])).val);
    let nSommermaximum = parseFloat((await getStateAsync(sID_Sommermaximum[EinstellungAnwahl])).val);
    let nSommerladeende = parseFloat((await getStateAsync(sID_Sommerladeende[EinstellungAnwahl])).val);
    
    let cLadezeitende1 =Math.floor((nWinterminimum+(nSommermaximum-nWinterminimum)/2)*3600);
    let cLadezeitende2 =Math.floor((nWinterminimum+0.5+(nSommerladeende-nWinterminimum - 0.5)/2)*3600);
    let cLadezeitende3 = Math.floor((nWinterminimum-(nSommermaximum-nWinterminimum)/2)*3600);
    
    tRegelende = Math.floor(cLadezeitende1+Math.cos((tm_yday+9)*2*3.14/365)*-((nSommermaximum-nWinterminimum)/2)*3600);
    tSommerladeende = Math.floor(cLadezeitende2+Math.cos((tm_yday+9)*2*3.14/365)*-((nSommerladeende-nWinterminimum-0.5)/2)*3600);
    tRegelbeginn = Math.floor(cLadezeitende3-Math.cos((tm_yday+9)*2*3.14/365)*-((nSommermaximum-nWinterminimum)/2)*3600);
    let tZeitgleichung = Math.floor((-0.171 * Math.sin((0.0337 * tm_yday + 0.465)) - 0.1299 * Math.sin((0.01787 * tm_yday - 0.168)))*3600);
    
    tRegelende = tRegelende - tZeitgleichung;
    tSommerladeende = tSommerladeende - tZeitgleichung;
    tRegelbeginn = tRegelbeginn - tZeitgleichung;
    

    let tRegelbeginn_Minuten = Math.floor(tRegelbeginn%3600/60);
    let tRegelbeginn_Stunden = Math.trunc(tRegelbeginn/3600);
    let tRegelende_Minuten = Math.floor(tRegelende%3600/60);  
    let tRegelende_Stunden = Math.trunc(tRegelende/3600);
    let tLadeende_Minuten = Math.floor(tSommerladeende%3600/60);
    let tLadeende_Stunden = Math.trunc(tSommerladeende/3600);      

    // ZeitAnwahl_MEZ_MESZ = true = MESZ Zeit
    if (ZeitAnwahl_MEZ_MESZ){
        await setStateAsync(sID_Regelbeginn_MEZ,addMinutes(tRegelbeginn_Stunden+':'+tRegelbeginn_Minuten,120));
        await setStateAsync(sID_Regelende_MEZ,addMinutes(tRegelende_Stunden+':'+tRegelende_Minuten,120));
        await setStateAsync(sID_Ladeende_MEZ,addMinutes(tLadeende_Stunden+':'+tLadeende_Minuten,120));
    }else{
        await setStateAsync(sID_Regelbeginn_MEZ,addMinutes(tRegelbeginn_Stunden+':'+tRegelbeginn_Minuten,60));
        await setStateAsync(sID_Regelende_MEZ,addMinutes(tRegelende_Stunden+':'+tRegelende_Minuten,60));
        await setStateAsync(sID_Ladeende_MEZ,addMinutes(tLadeende_Stunden+':'+tLadeende_Minuten,60));
    }
    
    if (LogAusgabe){
        log('RB UTC = '+tRegelbeginn_Stunden+':'+tRegelbeginn_Minuten);
        log('RE UTC = '+tRegelende_Stunden+':'+tRegelende_Minuten);
        log('LE UTC = '+tLadeende_Stunden+':'+tLadeende_Minuten);
    }
}

// Leistungsmesser0 jede minute in W/h umrechen W = P*t
// Autor:smartboart (ioBroker)
function Wh_Leistungsmesser0(){
	if(DebugAusgabe)log('Funktion Schedulestart aktiv'); 
	let AufDieMinute =  '* * * * *';
	Timer0 = schedule(AufDieMinute, function(){   
		if(DebugAusgabe)log('minütlicher Schedule aktiv');       
		let PVErtrag = getState (sID_PVErtragLM0).val;  
		let Pmin = Summe0/count0;
		if(count0>0 && Summe0 >0){
			setState(sID_PVErtragLM0, PVErtrag + Pmin/60/1000,true);//kWh
			if(DebugAusgabe)log(['Schedule Umrechnen W = P*t.  Minutenwert Leistung: '+ Pmin, ' Minutenwert Arbeit: ' + (Pmin/60/1000), ' Tageswert Ertrag: ' +PVErtrag ].join(''));
			setTimeout(function(){
				count0=0;
				Summe0=0;
				if(DebugAusgabe)log(['Reset: Count =  '+ count0, ' Summe = ' + Summe0 ].join(''));
			},100);
		}else{
			if(count0===0 && Summe0 ===0){
				clearSchedule(Timer0);
				Timer0 = null;
                if(DebugAusgabe)log('minütlicher Schedule gestoppt');
            }
        }  
    });
}

// Leistungsmesser1 jede minute in W/h umrechen W = P*t
// Autor:smartboart (ioBroker)
function Wh_Leistungsmesser1(){
	if(DebugAusgabe)log('Funktion Schedulestart aktiv'); 
	let AufDieMinute =  '* * * * *';
	Timer1 = schedule(AufDieMinute, function(){   
		if(DebugAusgabe)log('minütlicher Schedule aktiv');       
		let PVErtrag = getState (sID_PVErtragLM1).val;  
		let Pmin = Summe1/count1;
		if(count1>0 && Summe1 >0){
			setState(sID_PVErtragLM1, PVErtrag + Pmin/60/1000,true);//kWh
			setTimeout(function(){
				count1=0;
				Summe1=0;
				if(DebugAusgabe)log(['Reset: Count =  '+ count1, ' Summe = ' + Summe1 ].join(''));
			},100);
		}else{
			if(count1===0 && Summe1 ===0){
				clearSchedule(Timer1);
				Timer1=null;
                if(DebugAusgabe)log('minütlicher Schedule gestoppt');
            }
        }  
    });
} 


// Leistungsmesser2 jede minute in W/h umrechen W = P*t
// Autor:smartboart (ioBroker)
function Wh_Leistungsmesser2(){
	if(DebugAusgabe)log('Funktion Schedulestart LM2 aktiv'); 
	let AufDieMinute =  '* * * * *';
	Timer3 = schedule(AufDieMinute, function(){   
		if(DebugAusgabe)log('minütlicher Schedule Timer3 aktiv');       
		let PVErtrag = getState (sID_PVErtragLM2).val;  
		let Pmin = Summe2/count2;
		if(count2>0 && Summe2 >0){
			setState(sID_PVErtragLM2, PVErtrag + Pmin/60/1000,true);//kWh
			setTimeout(function(){
				count2=0;
				Summe2=0;
			},100);
		}else{
			if(count2===0 && Summe2 ===0){
				clearSchedule(Timer3);
				Timer3=null;
                if(DebugAusgabe)log('minütlicher Schedule Timer3 gestoppt');
            }
        }  
    });
} 

//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************


// Zaehler LM0
on(sID_PvLeistung_E3DC_W, function(obj) {
    let Leistung = getState(obj.id).val;
    if(Leistung > 0){
		if(!Timer0)Wh_Leistungsmesser0();
		count0 ++
		Summe0 = Summe0 + Leistung;
		//if(DebugAusgabe)log(['Summe: ' + Summe0, ' Zaehler: '+count0, ' Addition: + ' +Leistung ].join(''));
    }
});
 
// Zaehler LM1
on(sID_PvLeistung_ADD_W, function(obj) {
    let Leistung = Math.abs(getState(obj.id).val);
    if(Leistung > 0){
		if(!Timer1)Wh_Leistungsmesser1();
		count1 ++
		Summe1 = Summe1 + Leistung;
	}
});

// Zaehler LM2
on({id: sID_Saved_Power_W, valGt: 0}, function (obj) {
    if(!Timer3)Wh_Leistungsmesser2();
    count2 ++
	Summe2 = Summe2 + obj.state.val;
});



// Wird aufgerufen wenn State Automatik in VIS geändert wird
on({id: sID_Automatik, change: "ne"}, async function (obj){
	 AutomatikAnwahl = getState(obj.id).val;
     if(AutomatikAnwahl) {
        if (LogAusgabe){log('-==== Automatik gestartet ====-');}
        main();
    }else{
        if (LogAusgabe){log('-==== Automatik gestoppt ====-');}
        await setStateAsync(sID_EinstellungAnwahl,0);
        EinstellungAnwahl = 0
    }
});  

// Bei Änderung Eigenverbrauch soll der Überschuss neu berechnet werden.
on({id: sID_EigenverbrauchTag, change: "ne"}, function (obj){
	if (LogAusgabe){log('-==== Wert Eigenverbrauch wurde auf '+getState(obj.id).val+' kWh geändert ====-');}
    main();
});  


// Wird aufgerufen wenn State HistorySelect in VIS geändert wird
on({id: sID_AnzeigeHistoryMonat, change: "ne"}, async function (obj){
	let Auswahl = (await getStateAsync(obj.id)).val
    let Auswahl_0 = await zeroPad(Auswahl,2);
    if (Auswahl<=12){
        let JsonString = (await getStateAsync(instanz +PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_' +Auswahl_0)).val;
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON',JsonString);
    }else{
        log('State '+instanz + PfadEbene1 + PfadEbene2[2] + 'HistorySelect darf nicht > 12 sein ','warn');
    }
}); 


// Wird aufgerufen wenn sich an den States HistoryJSON_xx was ändert um in VIS immer das aktuelle 
// Diagramm anzuzeigen
on({id: /\.HistoryJSON_/, change: "ne"}, async function (){	
    let Auswahl = (await getStateAsync(sID_AnzeigeHistoryMonat)).val;
    let Auswahl_0 = await zeroPad(Auswahl,2);
    if (Auswahl<=12){
        let JsonString = (await getStateAsync(instanz +PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_' +Auswahl_0)).val;
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON',JsonString);
        //if (LogAusgabe){log('HistoryJSON_'+ Auswahl_0 + ' wurde unter HistoryJSON gespeichert');}
    }else{
        log('State '+instanz + PfadEbene1 + PfadEbene2[2] + 'HistorySelect darf nicht > 12 sein ', 'warn');
    }
});

// manuelle Änderung der ME(S)Z Zeitanzeige in VIS
on({id: sID_Anwahl_MEZ_MESZ, change: "ne"}, async function (obj){
    ZeitAnwahl_MEZ_MESZ = (await getStateAsync(obj.id)).val
    await UTC_Dezimal_to_MEZ();
    await MEZ_Regelzeiten();
});

// Bei Änderung der PrognoseAnwahl, Einstellung 0-5 in VIS, jeweilige Prognose abrufen
on({id: sID_PrognoseAnwahl, change: "ne"},async function(obj) {
    PrognoseAnwahl = (await getStateAsync(obj.id)).val
    if (PrognoseAnwahl <= 6){
        if(LogAusgabe && PrognoseAnwahl == 0){log("Proplanta u. Solcast angewählt, Berechnung nach min. Wert")};
        if(LogAusgabe && PrognoseAnwahl == 1){log("Proplanta angewählt")};
        if(LogAusgabe && PrognoseAnwahl == 2){log("Solcast angewählt")};
        if(LogAusgabe && PrognoseAnwahl == 3){log("Proplanta u. Solcast angewählt, Berechnung nach max. Wert")};
        if(LogAusgabe && PrognoseAnwahl == 4){log("Proplanta u. Solcast angewählt, Berechnung nach Ø Wert")};
        if(LogAusgabe && PrognoseAnwahl == 5){log("Solcast 90 angewählt")};
        if(LogAusgabe && PrognoseAnwahl == 6){log("Solcast 90 u. Solcast angewählt, Berechnung nach Ø Wert")};
        main();
    }else{
        log('-==== Falscher Wert State PrognoseAnwahl ====-','warn');
    }
});

// Bei Betättigung der Button Einstellung 1-5 in VIS jeweilige Einstellung laden und automatik ausschalten
on({id: sID_EinstellungAnwahl, change: "ne",valGt: 0}, async function (obj){
    if(AutomatikAnwahl== true){
        EinstellungAnwahl = obj.state.val
        CheckConfig = true
        await MEZ_Regelzeiten();
        if (obj.state.val != 0 && obj.state.val <= 5 ){
            if(LogAusgabe)log("Trigger manuelle Programmvorwahl");
            main();
        }
    }else{
        await setStateAsync(sID_UntererLadekorridor_W[0],getState(sID_UntererLadekorridor_W[obj.state.val]).val)
        await setStateAsync(sID_Ladeschwelle_Proz[0],getState(sID_Ladeschwelle_Proz[obj.state.val]).val)
        await setStateAsync(sID_Ladeende_Proz[0],getState(sID_Ladeende_Proz[obj.state.val]).val)
        await setStateAsync(sID_Ladeende2_Proz[0],getState(sID_Ladeende2_Proz[obj.state.val]).val)
        await setStateAsync(sID_Winterminimum[0],getState(sID_Winterminimum[obj.state.val]).val)
        await setStateAsync(sID_Sommermaximum[0],getState(sID_Sommermaximum[obj.state.val]).val)
        await setStateAsync(sID_Sommerladeende[0],getState(sID_Sommerladeende[obj.state.val]).val)
        await setStateAsync(sID_Unload_Proz[0],getState(sID_Unload_Proz[obj.state.val]).val)
        EinstellungAnwahl = 0
        await setStateAsync(sID_EinstellungAnwahl,0);
    }
});


// Triggern wenn sich an den Notstrom Werten was ändert
on({id: arrayID_Notstrom, change: "ne"}, async function (obj) {
    await Notstromreserve(); 
});


// Triggern wenn sich an Einstellung 1 was ändert
on({id: arrayID_Parameter1, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==1){
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an Einstellung 2 was ändert
on({id: arrayID_Parameter2, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==2){
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an Einstellung 3 was ändert
on({id: arrayID_Parameter3, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==3){
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an Einstellung 4 was ändert
on({id: arrayID_Parameter4, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==4){
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an Einstellung 5 was ändert
on({id: arrayID_Parameter5, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==5){
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an den Batterie Leistungswerten oder Spannung was ändert
on({id: sID_BAT0_Alterungszustand, change: "ne"}, async function (obj) {
    await Speichergroesse();
    CheckConfig = true
    log('-==== Speichergröße hat sich geändert Speichergroesse_kWh ='+Speichergroesse_kWh+' ====-','warn')
});

schedule('*/3 * * * * *', async function() {
    Ladesteuerung(); 
});

// Summe PV-Leistung berechnen bei Änderung
if (existsState(sID_PVErtragLM0)){
    on({id: sID_PVErtragLM0,change: "ne"}, function (obj){SummePvLeistung();});
}
if (existsState(sID_PVErtragLM1)){
    on({id: sID_PVErtragLM1,change: "ne"}, function (obj){SummePvLeistung();});	
}

// Daten von Solcast immer um 04:00 Uhr abholen wenn const Solcast = true
if (Solcast) {
    schedule('{"time":{"exactTime":true,"start":"04:00"},"period":{"days":1}}', function() {
        SheduleSolcast(SolcastDachflaechen);
    });
}

// jeden Monat am 1 History Daten Tag aktuelles Monat Löschen
schedule("0 0 1 * *", async function() {
   for (let i = 1; i <= 31; i++) {
        let n = zeroPad(i,2);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'IstPvLeistung_kWh_'+ n, 0);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+ n, 0);
	    await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+ n, 0);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast_kWh_'+ n, 0);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast90_kWh_'+ n, 0);
    }
    writelog();
});

// Automatische Umschaltung von MEZ / MESZ
schedule("0 4 24-31 3,10 7", function() {
    setState(sID_Anwahl_MEZ_MESZ, dst());  //true = MESZ ,false = MEZ
    if(LogAusgabe)log('-==== MESZ Status '+dst+' ====-');
});

// jeden Tag um 00:01 Tageswert nullen und Regelzeiten aktualisieren.
schedule({hour: 0, minute: 1}, function () { 
	setState(sID_PVErtragLM0,0,true);
	setState(sID_PVErtragLM1,0,true);
	MEZ_Regelzeiten();
    if (LogAusgabe)log('-==== Tagesertragswert auf 0 gesetzt ====-');
    
});

//Bei Scriptende alle Timer löschen
onStop(function () { 
    clearSchedule(Timer0);
    clearSchedule(Timer1);
    clearSchedule(Timer2);
    clearSchedule(Timer3);
}, 100);


