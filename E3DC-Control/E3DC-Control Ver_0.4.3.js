'use strict';
/*****************************************************************************************
Version: 0.4.3      Wenn die PV-Erzeugung die Prognose übersteigt, wird diese nicht mehr bei der Überschussberechnung abgezogen.
					Damit soll verhindert werden, dass die Einstellung sich ändert, wenn die Prognose zu gering war.
Version: 0.4.2      Fehler in der Prognoseberechnung und Fehler das Timer bei Scriptende nicht beendet werden korrigiert.
Version: 0.4.1      Fehler in der Prognoseberechnung korrigiert.
Version: 0.4.0      Die Solar Prognose Forecast wurde entfernt und dafür die Prognose Solcast integriert.
                    Es müssen folgende States gelöscht werden:
                    - 0_userdata.0.E3DC-Control.Forecast
                    - 0_userdata.0.E3DC-Control.History.PrognoseFore_kWh_01 bis 31
                    In VIS muss in der View SolarDiag_Prognose der Materialdesign Select Button die Menüpunkte 2 in Solcast 
                    umbenant werden.
                    Kleinere Fehler beseitigt.

******************************************************************************************/
//++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN ++++++++++++++++++++++++++++++++++

//****************************** Einstellungen E3DC-Control *****************************
const sServerIP = "xxx.xxx.xxx.xxx";            // IP Adresse vom E3DC
const sServerPort = "5033";                     // Server Port
const sE3dcUser = "xxxxxx.xxxxxx@xxxxxx.xx"; 	// E3DC User
const sE3dcPasswort = "xxxxxxxxxxxxx";          // E3DC Passwort um sich einzuloggen bei der Website
const sAesPasswort = "xxxxxxxxxxxxx";           // E3DC AES Passwort neu zu vergebendes PW am E3DC
const sWurzelzaehler = "0";                     // 0= interneraZaehler 6 = externer Zaehler 
const sExt1 = "false";                          // true, wenn ein externer Zaehler genutzt wird
const sExt2 = "false";                          // true, wenn ein externer Zaehler genutzt wird
const sPfadE3DC = "/home/iobroker/E3DC-Control/e3dc.config.txt" // Pfad zur e3dc.config.txt. User iobroker muss Zugriffsrechte haben.
// Für alle anderen Parameter werden States angelegt die über VIS geändert werden können
// Die Standardwerte müssen erst angepasst werden bevor die Funktion DatenSchreiben verwendet wird.
let logflag = true;                             // History Daten in Lokaler Datei speichern 
const sLogPath = "/home/iobroker/E3DC-Control/HistoryPV_Leistung.json"; // Pfad zur Sicherungsdatei History 

//******************************** Einstellungen Proplanta ******************************
const country = "de"                            // Ländercode de,at, ch, fr, it
const ProplantaOrt = 'xxxxxxxxxxxss'           	// Welcher Wohnort soll abgefragt werden
const ProplantaPlz = 'xxxxx'                    // Postleitzahl

//******************************** Einstellungen Solcast ******************************
let Resource_Id_Dach=[];
const SolcastDachflaechen = 2;                              // Aktuell max. zwei Dachflächen möglich
Resource_Id_Dach[1] = ''                 					// Rooftop 1 Id von der Homepage Solcast
Resource_Id_Dach[2] = ''                 					// Rooftop 2 Id von der Homepage Solcast
const SolcastAPI_key = ''   								// Solcast API Key
const Solcast = false;                                      // true = Daten Solcast werden abgerufen false = Daten Solcast werden nicht abgerufenb

//********************* Einstellungen Automatische Prognoseberechnung *******************
const nModulFlaeche = 73;                       // 73 Installierte Modulfläche in m² (Silizium-Zelle 156x156x60 Zellen x 50 Module)
const nWirkungsgradModule = 20;                 // 18.4 Wirkungsgrad der Solarmodule in %
const nSpeicherMax_kWh = 39.0;					// Maximale Speichergroesse für Automatische Prognoseberechnung 
const nKorrFaktor = 0                           // nKorrFaktor in Prozent. Reduziert die berechnete Prognose um diese anzugleichen.nKorrFaktor= 0 ohne Korrektur 
const nMinPvLeistungTag_kWh = 3                 // minimal Mögliche PV-Leistung. Wenn Prognose niedriger ist wird mit diesem Wert gerechnet
const nMaxPvLeistungTag_kWh = 105               // max. Mögliche PV-Leistung. Wenn Prognose höher ist wird mit diesem Wert gerechnet
let nMinUnloadSoC= 100                          // min. Wert in % was die Batterie entladen werden darf um Kapazität für Überschussladung zu schaffen. 100 = keine Entladung
let sEinspeiselimit =[], sUntererLadekorridor =[],sObererLadekorridor =[],sMinimumLadeleistung =[],sMaximumLadeleistung =[];
let sLadeschwelle =[],sLadeende=[],sLadeende2=[],sWinterminimum=[],sSommermaximum=[],sSommerladeende=[],sSpeichergroesse=[],sUnload=[];

// Prognose - Eigenverbrauch ist geringer als benötigte Leistung um Batterie auf 100% zu laden
sEinspeiselimit[1] = 10.4;
sUntererLadekorridor[1] = 0;
sObererLadekorridor[1] = 4500;
sMinimumLadeleistung[1] = 0;
sMaximumLadeleistung[1] = 12000;
sLadeschwelle[1] = 80;
sLadeende[1] = 95;
sLadeende2[1] = 100;
sWinterminimum[1] = 11.50;
sSommermaximum[1] = 13.2;
sSommerladeende[1] = 18.00;
sSpeichergroesse[1] = 39.0;
sUnload[1] = 100;

//*********************************** Einstellung 2 *************************************
// Prognose - Eigenverbrauch ist höher als benötigte Leistung um Batterie auf 100% zu laden keine Bewölkung > 90% 
sEinspeiselimit[2] = 10.4;
sUntererLadekorridor[2] = 0;
sObererLadekorridor[2] = 4500;
sMinimumLadeleistung[2] = 0;
sMaximumLadeleistung[2] = 12000;
sLadeschwelle[2] = 0;
sLadeende[2] = 85;
sLadeende2[2] = 99;
sWinterminimum[2] = 11.50;          // Das winterminimum sollte um den Sonnenhöchststand am 21.12. liegen.Sonnenhöchstand am 21.12. 12:09 UTC
sSommermaximum[2] = 13.2;          // Sommermaximum sollte die zeit sein, wo es am 21.6. noch zu Überschuss kommen kann.Sonnenhöchstand am 21.06. 13:12 UTC
sSommerladeende[2] = 18.00;         // Sommerladeende sollte dann den zeitpunkt des sonnenuntergangs entsprechen
sSpeichergroesse[2] = 15.0;         // 15.0
// sUnload wird automatisch auf Aktuellen Batterie SoC oder berechneten UnloadSoC eingestellt um ein Laden der Batterie bis zum Start der Regelung zu verhindern

//*********************************** Einstellung 3 *************************************
// Prognose - Eigenverbrauch ist höher als benötigte Leistung um Batterie auf 100% zu laden ab 12:00 - 18:00 Uhr Bewölkung > 90%
sEinspeiselimit[3] = 10.4;
sUntererLadekorridor[3] = 0;
sObererLadekorridor[3] = 4500;
sMinimumLadeleistung[3] = 0;
sMaximumLadeleistung[3] = 12000;
sLadeschwelle[3] = 70;
sLadeende[3] = 90;
sLadeende2[3] = 95;
sWinterminimum[3] = 11.50;
sSommermaximum[3] = 13.2;
sSommerladeende[3] = 13.00;
sSpeichergroesse[3] = 15.0;
sUnload[3] = 100;

//*********************************** Einstellung 4 *************************************
// Prognose - Eigenverbrauch ist höher als benötigte Leistung um Batterie auf 100% zu laden ab 12:00 - 15:00 Uhr Bewölkung > 90%
sEinspeiselimit[4] = 10.4;
sUntererLadekorridor[4] = 0;
sObererLadekorridor[4] = 4500;
sMinimumLadeleistung[4] = 0;
sMaximumLadeleistung[4] = 12000;
sLadeschwelle[4] = 50;
sLadeende[4] = 90;
sLadeende2[4] = 95;
sWinterminimum[4] = 11.5;
sSommermaximum[4] = 13.2;
sSommerladeende[4] = 15.00;
sSpeichergroesse[4] = 39.0;
sUnload[4] = 100;

//*********************************** Einstellung 5 *************************************
// Prognose - Eigenverbrauch ist höher als benötigte Leistung um Batterie auf 100% zu laden ab 15:00 - 18:00 Uhr Bewölkung > 90%
sEinspeiselimit[5] = 10.4;
sUntererLadekorridor[5] = 500;
sObererLadekorridor[5] = 4500;
sMinimumLadeleistung[5] = 500;
sMaximumLadeleistung[5] = 12000;
sLadeschwelle[5] = 60;
sLadeende[5] = 90;
sLadeende2[5] = 95;
sWinterminimum[5] = 11.5;
sSommermaximum[5] = 13.2;
sSommerladeende[5] = 15.00;         //15.00
sSpeichergroesse[5] = 39.0;         //39.0
sUnload[5] = 100;

//****************************** Einstellungen Modul Modbus *****************************
const sID_Batterie_SOC = 'modbus.0.holdingRegisters.40083_Batterie_SOC';                        // Pfad State Modul ModBus Batterie_SOC'
const sID_PvLeistungLM0_W = 'modbus.0.holdingRegisters.40068_PV_Leistung'                       // Pfad State Modul ModBus PV_Leistung'
const sID_PvLeistungLM1_W = 'modbus.0.holdingRegisters.40076_Zusaetzliche_Einspeiser_Leistung'  // Pfad State Modul ModBus Zusätzliche Einspeiser Leistung Tag

//********************* Einstellungen Instanz Script E3DC-Control ***********************
let instanz = '0_userdata.0.';
// Pfad innerhalb der Instanz
let PfadEbene1 = 'E3DC-Control.';
let PfadEbene2 = ['Parameter.', 'Allgemein.', 'History.', 'Proplanta.']
const LogAusgabe = true                           // Zusätzliche LOG Ausgaben 
const DebugAusgabe = false                       // Debug Ausgabe im LOG zur Fehlersuche
//---------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN ++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------

//***************************************************************************************************
//*********************************** User Eingaben prüfen ******************************************
//***************************************************************************************************

if ((typeof sServerIP != "string") || (typeof sServerIP == "undefined")){console.error("sServerIP muss als String eingegeben werden");}
if ((typeof sServerPort != "string") || (typeof sServerPort == "undefined")){console.error("sServerPort muss als String eingegeben werden");}
if ((typeof sE3dcUser != "string") || (typeof sE3dcUser == "undefined")){console.error("sE3dcUser muss als String eingegeben werden");}
if ((typeof sE3dcPasswort != "string") || (typeof sE3dcPasswort == "undefined")){console.error("sE3dcPasswort muss als String eingegeben werden");}
if ((typeof sAesPasswort != "string") || (typeof sAesPasswort == "undefined")){console.error("sAesPasswort muss als String eingegeben werden");}
if ((typeof sWurzelzaehler != "string") || (typeof sWurzelzaehler == "undefined")){console.error("sWurzelzaehler muss als String eingegeben werden");}
if ((typeof sExt1 != "string") || (typeof sExt1 == "undefined")){console.error("sExt1 muss als String eingegeben werden");}
if ((typeof sExt2 != "string") || (typeof sExt2 == "undefined")){console.error("sExt2 muss als String eingegeben werden");}
if ((typeof sPfadE3DC != "string") || (typeof sPfadE3DC == "undefined")){console.error("PfadE3DC muss als String eingegeben werden");}
if ((typeof nModulFlaeche != "number") || (typeof nModulFlaeche == undefined)){console.error("nModulFlaeche muss als Number eingegeben werden");}
if ((typeof nWirkungsgradModule != "number") || (typeof nWirkungsgradModule == undefined)){console.error("nWirkungsgradModule muss als Number eingegeben werden");}
if ((typeof nSpeicherMax_kWh != "number") || (typeof nSpeicherMax_kWh == undefined)){console.error("nSpeicherMax_kWh muss als Number eingegeben werden");}
if ((typeof nMinUnloadSoC != "number") || (typeof nMinUnloadSoC == undefined)){console.error("nMinUnloadSoC muss als Zahl, Type Number eingegeben werden");}
if (typeof country != 'string' || typeof country == 'undefined') {console.error('country muss als String eingegeben werden');}
if (Solcast){
    if ((typeof SolcastDachflaechen != "number") || (typeof SolcastDachflaechen == "undefined")){console.error("SolcastDachflaechen muss als Type Number eingegeben werden");}
    if ((typeof Resource_Id_Dach[1] != "string") || (typeof Resource_Id_Dach[1] == "undefined")){console.error("Resource_Id_Dach[1] muss als String eingegeben werden");}
    if ((typeof Resource_Id_Dach[2] != "string") || (typeof Resource_Id_Dach[2] == "undefined")){console.error("Resource_Id_Dach[2] muss als String eingegeben werden");}
    if ((typeof SolcastAPI_key != "string") || (typeof SolcastAPI_key == "undefined")){console.error("SolcastAPI_key muss als String eingegeben werden");}
}

//***************************************************************************************************
//************************************ Deklaration Variablen ****************************************
//***************************************************************************************************

const fs = require('fs').promises;       
const fsw = require('fs');
// @ts-ignore
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let xhr = new XMLHttpRequest();
let xhr1 = new XMLHttpRequest();
let xhr2 = new XMLHttpRequest();
// @ts-ignore
const dst = require('is-it-bst');
let AutomatikAnwahl,ZeitAnwahl_MEZ_MESZ,EinstellungAnwahl,PrognoseAnwahl,count0 = 0, count1 = 0, Summe0 = 0, Summe1 = 0,TimerObj;
let sWrleistung,sHtmin,sHtsockel,sHton,sHtoff,sHtsat,sHtsun,sDebug,sWallbox,sWBmode,sWBminLade,sPeakshave;
let Timer0 = null, Timer1 = null,Timer2 = null;
let SummePV_Leistung_Tag_kW =[{0:'',1:'',2:'',3:'',4:'',5:'',6:'',7:''},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0}];
let baseUrls = {
    "de" : "https://www.proplanta.de/Wetter/profi-wetter.php?SITEID=60&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=",
    "at" : "https://www.proplanta.de/Wetter-Oesterreich/profi-wetter-at.php?SITEID=70&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=",
    "ch" : "https://www.proplanta.de/Wetter-Schweiz/profi-wetter-ch.php?SITEID=80&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=",
    "fr" : "https://www.proplanta.de/Wetter-Frankreich/profi-wetter-fr.php?SITEID=50&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter-Frankreich&wT=",
    "it" : "https://www.proplanta.de/Wetter-Italien/profi-wetter-it.php?SITEID=40&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter-Italien&wT=",
};
let baseurl = baseUrls[country];


const sID_Automatik = instanz + PfadEbene1 + PfadEbene2[1]+'Automatik';                     /* true = automatik false = manuell */
const sID_Anwahl_MEZ_MESZ = instanz + PfadEbene1 + PfadEbene2[1] + 'Anwahl_MEZ_MESZ';       /* true = MESZ ,false = MEZ */
const sID_EinstellungAnwahl = instanz + PfadEbene1 + PfadEbene2[1] + 'EinstellungAnwahl';   /* Einstellung 1-5 */
const sID_PVErtragLM0 = instanz + PfadEbene1 + PfadEbene2[1] + 'IstPvErtragLM0_kWh';
const sID_PVErtragLM1 = instanz + PfadEbene1 + PfadEbene2[1] + 'IstPvErtragLM1_kWh';
const sID_Einstellung = instanz + PfadEbene1 + PfadEbene2[1] + 'Einstellung';
const sID_PrognoseAnwahl = instanz + PfadEbene1 + PfadEbene2[1] + 'PrognoseAnwahl';
const sIDEigenverbrauchTag = instanz + PfadEbene1 + PfadEbene2[1] + 'EigenverbrauchTag';
const sID_AnzeigeHistoryMonat = instanz + PfadEbene1 + PfadEbene2[2] + 'HistorySelect';

//***************************************************************************************************
//**************************************** Create states ********************************************
//***************************************************************************************************

let statesToCreate = [
[PfadEbene1 + PfadEbene2[0] + 'Einspeiselimit', {'def':10.0, 'name':'bei 15kWp beginnt die 70% Einspeisegrenze bei 10.5 kWh -0.1 Sicherheit', 'type':'number', 'role':'value', 'desc':'Einspeiselimit', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[0] + 'UntererLadekorridor', {'def':500, 'name':'Die Ladeleistung soll sich innerhalb diesen Korridors bewegen', 'type':'number', 'role':'value', 'desc':'UntererLadekorridor', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'ObererLadekorridor', {'def':4500, 'name':'beim S10 E PRO wird 4500 empfohlen', 'type':'number', 'role':'value', 'desc':'ObererLadekorridor', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'MinimumLadeleistung', {'def':500, 'name':'es soll mind. mit dieser Leistung geladen werden, liegt sie darunter, stoppt die Ladung.', 'type':'number', 'role':'value', 'desc':'MinimumLadeleistung', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'MaximumLadeleistung', {'def':12000, 'name':'Leistung der Batteriewandler 3000 beim E10, beim Pro zwischen 6000 u. 12000 immer > MINIMUMLADELEISTUNG', 'type':'number', 'role':'value', 'desc':'MaximumLadeleistung', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'Wrleistung', {'def':12000, 'name':'AC-Leistung des WR, 12000 bei PRO', 'type':'number', 'role':'value', 'desc':'Wrleistung', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'Ladeschwelle', {'def':0, 'name':'bis zur dieser Schwelle wird geladen bevor die Regelung beginnt', 'type':'number', 'role':'value', 'desc':'Ladeschwelle', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'Ladeende', {'def':80, 'name':'Zielwert bis Ende Regelung, dannach wird Ladung auf ladeende2 weiter geregelt', 'type':'number', 'role':'value', 'desc':'Ladeende', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'Ladeende2', {'def':93, 'name':'ladeende2 kann der Wert abweichend vom Defaultwert 93% gesetzt werden.Muss > ladeende sein', 'type':'number', 'role':'value', 'desc':'Ladeende2', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'Winterminimum', {'def':11.02, 'name':'winterminimum wintersonnenwende', 'type':'number', 'role':'value', 'desc':'Winterminimum', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'Sommermaximum', {'def':13.12, 'name':'sommermaximum sommersonnenwende', 'type':'number', 'role':'value', 'desc':'Sommermaximum', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'Sommerladeende', {'def':18.00, 'name':'Zielwert bis Ende Regelung, dannach wird Ladung auf 93% weiter geregelt', 'type':'number', 'role':'value', 'desc':'Sommerladeende', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'Speichergroesse', {'def':39.0, 'name':'nutzbare Kapazitaet des S10 Speichers', 'type':'number', 'role':'value', 'desc':'Speichergroesse', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[0] + 'Unload', {'def':100, 'name':'Zielwert beim entladen.Die ladeschwelle muss < unload sein', 'type':'number', 'role':'value', 'desc':'Unload', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'HTmin', {'def':30, 'name':'Speicherreserve in % bei Wintersonnenwende 21.12', 'type':'number', 'role':'value', 'desc':'Speicherreserve in % bei winterminimum', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'HTsockel', {'def':20, 'name':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'type':'number', 'role':'value', 'desc':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'HTon', {'def':5.00, 'name':'Uhrzeit UTC für Freigabe Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'type':'number', 'role':'value', 'desc':'Uhrzeit UTC für Freigabe Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'HToff', {'def':13.12, 'name':'Uhrzeit UTC für Sperre Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'type':'number', 'role':'value', 'desc':'Uhrzeit UTC für Sperre Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'HTsat', {'def':'false', 'name':'Hochtarif auch am Samstag = true', 'type':'string', 'role':'state', 'desc':'Hochtarif auch am Samstag = true'}],
[PfadEbene1 + PfadEbene2[0] + 'HTsun', {'def':'false', 'name':'Hochtarif auch am Sonntag = true', 'type':'string', 'role':'state', 'desc':'Hochtarif auch am Sonntag = true'}],
[PfadEbene1 + PfadEbene2[0] + 'Wallbox', {'def':'false', 'name':'Steuerung Wollbox ein = true', 'type':'string', 'role':'state', 'desc':'Steuerung Wollbox ein = true'}],
[PfadEbene1 + PfadEbene2[0] + 'Debug', {'def':'false', 'name':'zusätzliche debug ausgaben in der Shell = true', 'type':'string', 'role':'state', 'desc':'zusätzliche debug ausgaben in der Shell = true'}],
[PfadEbene1 + PfadEbene2[0] + 'WBminLade', {'def':3000, 'name':'min. Ladeleistung Wallbox', 'type':'number', 'role':'value', 'desc':'min. Ladeleistung Wallbox', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'WBmode', {'def':0, 'name':'Priorität der Wallbox ', 'type':'number', 'role':'value', 'desc':'Priorität der Wallbox'}],
[PfadEbene1 + PfadEbene2[0] + 'Peakshave', {'def':0, 'name':'Zur zeit ist nur reines Peakshaving realisiert, d.h. wenn man nicht mehr als z.B. 10kW Strombezug aus dem Netz haben möchte, dann speist der E3DC soviel aus, dass die 10kW Netzbezug eingehalten werden.', 'type':'number', 'role':'value', 'desc':'Begrenzung des Netzbezug'}],
[PfadEbene1 + PfadEbene2[1] + 'Winterminimum_MEZ', {'def':'11.02', 'name':'winterminimum wintersonnenwende MEZ', 'type':'string', 'role':'string', 'desc':'Winterminimum', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[1] + 'Sommermaximum_MEZ', {'def':'13.12', 'name':'sommermaximum sommersonnenwende MEZ', 'type':'string', 'role':'string', 'desc':'Sommermaximum', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[1] + 'Sommerladeende_MEZ', {'def':'18.00', 'name':'Sommerladeende MEZ', 'type':'string', 'role':'string', 'desc':'Sommerladeende', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[1] + 'Listenelement_Nr', {'def':0, 'name':'Aktive Anwahl Listenelement in VIS' , 'type':'number', 'role':'value'}],
[PfadEbene1 + PfadEbene2[1] + 'HTon_MEZ', {'def':'5.00', 'name':'Uhrzeit MEZ für Freigabe Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'type':'string', 'role':'string', 'desc':'Uhrzeit UTC für Freigabe Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[1] + 'HToff_MEZ', {'def':'13.12', 'name':'Uhrzeit MEZ für Sperre Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'type':'string', 'role':'string', 'desc':'Uhrzeit UTC für Sperre Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[1] + 'Einstellung', {'def':0, 'name':'Aktuell angewählte Einstellung', 'type':'number', 'role':'State'}],
[PfadEbene1 + PfadEbene2[1] + 'EinstellungAnwahl', {'def':0, 'name':'Aktuell manuell angewählte Einstellung', 'type':'number', 'role':'State'}],
[PfadEbene1 + PfadEbene2[1] + 'EigenverbrauchTag', {'def':26, 'name':'min. Eigenverbrauch von 6:00 Uhr bis 19:00 Uhr in kWh', 'type':'number', 'role':'value'}],
[PfadEbene1 + PfadEbene2[1] + 'DatenSchreiben', {'def':false, 'name':'Bei true werden die Werte in die e3dc.config.txt gespeichert' , 'type':'boolean', 'role':'State', 'desc':'Bei true werden die Werte in die e3dc.config.txt gespeichert'}],
[PfadEbene1 + PfadEbene2[1] + 'DatenLesen', {'def':false, 'name':'Bei true werden die Parameter aus der e3dc.config.txt eingelesen' , 'type':'boolean', 'role':'State', 'desc':'Bei true werden die Parameter aus der e3dc.config.txt eingelesen'}],
[PfadEbene1 + PfadEbene2[1] + 'Automatik', {'def':false, 'name':'Bei true werden die Parameter automatisch nach Wetterprognose angepast' , 'type':'boolean', 'role':'State', 'desc':'State zum auslesen vom Fehlerspeicher '}],
[PfadEbene1 + PfadEbene2[1] + 'Anwahl_MEZ_MESZ', {'def':false, 'name':'true = MESZ ,false = MEZ' , 'type':'boolean', 'role':'State', 'desc':'Umschalten von MEZ auf MESZ '}],
[PfadEbene1 + PfadEbene2[1] + 'IstSummePvLeistung_kWh', {'def':0, 'name':'Summe kWh Leistungsmesser 0 und Leistungsmesser 1 ' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[1] + 'PrognoseBerechnung_kWh_heute', {'def':0, 'name':'Prognose für Berechnung' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[1] + 'Regelbeginn_MEZ', {'def':'00.00', 'name':'Regelbeginn MEZ', 'type':'string', 'role':'string', 'desc':'Regelbeginn MEZ Zeit', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[1] + 'Regelende_MEZ', {'def':'00.00', 'name':'Regelende MEZ', 'type':'string', 'role':'string', 'desc':'Regelende MEZ Zeit', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[1] + 'Ladeende_MEZ', {'def':'00.00', 'name':'Ladeende MEZ', 'type':'string', 'role':'string', 'desc':'Ladeende MEZ Zeit', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[1] + 'IstPvErtragLM0_kWh', {'def':0, 'name':'kWh Leistungsmesser 0 ' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[1] + 'IstPvErtragLM1_kWh', {'def':0, 'name':'kWh Leistungsmesser 1 ' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[1] + 'PrognoseAnwahl', {'def':0, 'name':'Beide Berechnung nach min. Wert = 0 nur Proplanta=1 nur Solcast=2 Beide Berechnung nach max. Wert=3 Beide Berechnung nach Ø Wert=4 nur Solcast90=5' , 'type':'number', 'role':'value'}],
[PfadEbene1 + PfadEbene2[2] + 'HistoryJSON', {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'}],
[PfadEbene1 + PfadEbene2[2] + 'HistorySelect', {'def':1, 'name':'Select Menü für materialdesign json chart' ,'type':'number'}],
[PfadEbene1 + PfadEbene2[3] + 'Datum_Tag_0', {'def':'0', 'name':'Datum Proplanta' ,'type':'string'}],
[PfadEbene1 + PfadEbene2[3] + 'Datum_Tag_1', {'def':'0', 'name':'Datum Proplanta' ,'type':'string'}],
[PfadEbene1 + PfadEbene2[3] + 'Datum_Tag_2', {'def':'0', 'name':'Datum Proplanta' ,'type':'string'}],
[PfadEbene1 + PfadEbene2[3] + 'Datum_Tag_3', {'def':'0', 'name':'Datum Proplanta' ,'type':'string'}],
[PfadEbene1 + PfadEbene2[3] + 'NaesteAktualisierung', {'def':'0', 'name':'Aktualisierung Proplanta' ,'type':'string'}],
[PfadEbene1 + PfadEbene2[3] + 'Bewoelkungsgrad_12', {'def':200, 'name':'Bewölkungsgrad 12 Uhr Proplanta' ,'type':'number'}],
[PfadEbene1 + PfadEbene2[3] + 'Bewoelkungsgrad_15', {'def':200, 'name':'Bewölkungsgrad 15 Uhr Proplanta' ,'type':'number'}],
[PfadEbene1 + PfadEbene2[3] + 'Max_Temperatur_Tag_0', {'def':0, 'name':'Max Temperatur heute' ,'type':'number', 'unit':'°C'}],
[PfadEbene1 + PfadEbene2[3] + 'Max_Temperatur_Tag_1', {'def':0, 'name':'Max Temperatur Morgen' ,'type':'number', 'unit':'°C'}],
[PfadEbene1 + PfadEbene2[3] + 'Max_Temperatur_Tag_2', {'def':0, 'name':'Max Temperatur Übermorgen' ,'type':'number', 'unit':'°C'}],
[PfadEbene1 + PfadEbene2[3] + 'Max_Temperatur_Tag_3', {'def':0, 'name':'Max Temperatur in vier Tagen' ,'type':'number', 'unit':'°C'}],
[PfadEbene1 + PfadEbene2[3] + 'Min_Temperatur_Tag_0', {'def':0, 'name':'Min Temperatur heute' ,'type':'number', 'unit':'°C'}],
[PfadEbene1 + PfadEbene2[3] + 'Min_Temperatur_Tag_1', {'def':0, 'name':'Min Temperatur Morgen' ,'type':'number', 'unit':'°C'}],
[PfadEbene1 + PfadEbene2[3] + 'Min_Temperatur_Tag_2', {'def':0, 'name':'Min Temperatur Übermorgen' ,'type':'number', 'unit':'°C'}],
[PfadEbene1 + PfadEbene2[3] + 'Min_Temperatur_Tag_3', {'def':0, 'name':'Min Temperatur in vier Tagen' ,'type':'number', 'unit':'°C'}],
];

for (let i = 1; i <= 31; i++) {
	let statePV_Leistung, stateProgProp,stateProgAuto,stateHystory,stateSolcast,stateSolcast90;
    let n = zeroPad(i,2);
    statePV_Leistung = [PfadEbene1 + PfadEbene2[2] + 'IstPvLeistung_kWh_' +n, {'def':0, 'name':'PV-Leistung Tag sourceanalytix' ,'type':'number', 'unit':'kWh'}]
    stateProgProp = [PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_' +n, {'def':0, 'name':'Tagesprognose Proplanta', 'type':'number', 'unit':'kWh'}]
    stateProgAuto = [PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_' +n, {'def':0, 'name':'Berechnete Prognose bei Anwahl Automatik' ,'type':'number', 'unit':'kWh'}]
    stateSolcast = [PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast_kWh_' +n, {'def':0, 'name':'Schätzung der PV-Leistung Solcast in Kilowatt (kW)' ,'type':'number', 'unit':'kWh'}]
    stateSolcast90 = [PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast90_kWh_' +n, {'def':0, 'name':'Schätzung der PV-Leistung in Kilowatt (kW) 90. Perzentil (hohes Szenario)' ,'type':'number', 'unit':'kWh'}]
    
    if (i < 13){
        stateHystory = [PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_' +n, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'}]
        statesToCreate.push(stateHystory)
    }
    
    statesToCreate.push(statePV_Leistung)
    statesToCreate.push(stateProgProp)
    statesToCreate.push(stateProgAuto)
    statesToCreate.push(stateSolcast)
    statesToCreate.push(stateSolcast90)
    
}

createUserStates(instanz, false, statesToCreate, async function(){
    log('-==== Jetzt sind alle States abgearbeitet ====-');
    AutomatikAnwahl = getState(sID_Automatik).val;
    PrognoseAnwahl = getState(sID_PrognoseAnwahl).val;
    setState(sID_Anwahl_MEZ_MESZ, dst());  
    await setStateAsync(sID_Einstellung,0);
    ZeitAnwahl_MEZ_MESZ = getState(sID_Anwahl_MEZ_MESZ).val
    EinstellungAnwahl = getState(sID_EinstellungAnwahl).val
    Wh_Leistungsmesser0();
    Wh_Leistungsmesser1();
    // Wetterdaten beim Programmstart aktualisieren und Timer starten.
    await PrognosedatenAbrufen();    
    await UTC_Dezimal_to_MEZ();
    await MEZ_Regelzeiten()
    
});
//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************

async function main()
{
    //Prognosen in kWh umrechen
    await Prognosen_Berechnen();
    // Diagramm aktualisieren
    await makeJson();
    // Einstellungen 1-5 je nach Überschuss PV Leistung Wetterprognose und Bewölkung anwählen 
    Einstellung(await Ueberschuss_Prozent());

}

// Einstellungen 1-5 je nach Überschuss PV Leistung Wetterprognose und Bewölkung anwählen 
async function Einstellung(UeberschussPrognoseProzent)
{
    let Bedeckungsgrad12,Bedeckungsgrad15,UnloadSoC,AktSpeicherSoC;
    let Einstellung_alt = (await getStateAsync(sID_Einstellung)).val;    
    //Prüfen ob State existiert, sonst error Meldung und Variable null zuweisen
    if (existsState(sID_Batterie_SOC)){
         AktSpeicherSoC = (await getStateAsync(sID_Batterie_SOC)).val;
    }else{
        log('-==== State sBatterie_SOC ist nicht vorhanden ====-','error');
        AktSpeicherSoC = null;
    }
        
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
    
    // UnloadSoC berechnen (UnloadSoC wird aktuell mur bei Einstellung 2 verwendet)
    if (AktSpeicherSoC != null && UeberschussPrognoseProzent != null){
        UnloadSoC = AktSpeicherSoC-UeberschussPrognoseProzent;
	    if (LogAusgabe){log('Berechneter Unload SoC ist = '+UnloadSoC);}
        if (UnloadSoC<0){UnloadSoC=0;}
	    if (UnloadSoC < nMinUnloadSoC){UnloadSoC = nMinUnloadSoC;}
    }
    
    // Einstellung 1
    // Prognose PV-Leistung geringer als benötigter Eigenverbrauch, Überschuss zu 100% in Batterie speichern
	if ((UeberschussPrognoseProzent === 0 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===1))
	{
		if (LogAusgabe){log('Einstellung 1 aktiv');}
        if(Einstellung_alt != 1){
            await setStateAsync(sID_Einstellung,1);
            await StateRead();
		    await e3dcConfigWrite(1);
            await e3dcConfigRead();
        }
	}	
	
    // Einstellung 2
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen
    // und keine Bewölkung > 90% 
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 < 90 && Bedeckungsgrad15 < 90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===2))
    {
		if (LogAusgabe){log('Einstellung 2 aktiv');}
        if(Einstellung_alt != 2){
            await setStateAsync(sID_Einstellung,2);
            await StateRead();
		    if (nMinUnloadSoC == 100){
                if (AktSpeicherSoC != null){
                    if (AktSpeicherSoC >= 50){sUnload[2] = AktSpeicherSoC;}// Aktueller Batterie SoC = unload verhindert ein Laden der Batterie bis zum Start der Regelung
                    if (AktSpeicherSoC < 50){sUnload[2] = 100;}            // Wenn Batterie SoC unter 50% soll gleich geladen werden 
                }
            }else{
                sUnload[2] = UnloadSoC
            }      
            await e3dcConfigWrite(2);
            await e3dcConfigRead();
        
        }
	}	
	
    // Einstellung 3
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 18:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12>=90 && Bedeckungsgrad15>=90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===3))
	{
		if (LogAusgabe){log('Einstellung 3 aktiv');}
        if(Einstellung_alt != 3){
            await setStateAsync(sID_Einstellung,3);
            await StateRead();
		    await e3dcConfigWrite(3);
            await e3dcConfigRead();
        }
	}	
	
    // Einstellung 4
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 15:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 >= 90 && Bedeckungsgrad15 < 90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===4))
	{
		if (LogAusgabe){log('Einstellung 4 aktiv');}
        if(Einstellung_alt != 4){
            await setStateAsync(sID_Einstellung,4);
            await StateRead();
		    await e3dcConfigWrite(4);
            await e3dcConfigRead();
        }
    }
	
    // Einstellung 5
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 15:00 - 18:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12<90 && Bedeckungsgrad15>=90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===5))
    {
        if (LogAusgabe){log('Einstellung 5 aktiv');}
        if(Einstellung_alt != 5){
            await setStateAsync(sID_Einstellung,5);
            await StateRead();
		    await e3dcConfigWrite(5);
            await e3dcConfigRead();
        }
	}
    
}

// Die Funktion ändert die Prognosewerte für das Diagramm und berechnet die Prognose in kWh je nach Auswahl 
async function Prognosen_Berechnen()
{
    let Tag =[], PrognoseProplanta_kWh_Tag =[],PrognoseSolcast_kWh_Tag=[],PrognoseSolcast90_kWh_Tag=[],Prognose_kWh_Tag =[];
	let IstSummePvLeistung_kWh = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'IstSummePvLeistung_kWh')).val;
    // Array Tag Datum von heute bis + Tag eintragen
    for (let i = 0; i < 7 ; i++){
        Tag[i] = nextDayDate(i).slice(8,10);
    }
    // Array die Aktuellen kWh von Heute + 3 Tage vorraus zuweisen
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
    // wenn die produzierte PV-Leistung < als Prognose ist.
    if (Prognose_kWh_Tag[0] > IstSummePvLeistung_kWh) {
        Prognose_kWh_Tag[0] = Prognose_kWh_Tag[0]-IstSummePvLeistung_kWh;
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+Tag[0], Prognose_kWh_Tag[0]+IstSummePvLeistung_kWh);
    }else{
        setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+Tag[0], Prognose_kWh_Tag[0]);
    }
	if (LogAusgabe){log('Bereits produzierte PV-Leistung  = '+IstSummePvLeistung_kWh);}
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
    let Rest_Eigenverbrauch_kWh = (await getStateAsync(sIDEigenverbrauchTag)).val;
	let nEigenverbrauchTag = (await getStateAsync(sIDEigenverbrauchTag)).val;
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


// Freie Batterie Speicherkapazität in kWh berechnen, Parameter BatterieSoC in %
function Batterie_kWh(BatterieSoC)
{
    let Ergebniss = 0;
    Ergebniss = nSpeicherMax_kWh-((nSpeicherMax_kWh/100)*BatterieSoC);
    return round(Ergebniss, 2);
}; 


// kWh in % Speichergröße umrechnen, Parameter wert in %
function BatterieProzent(wert)
{
    let Ergebniss = 0;
    if (LogAusgabe){log('BatterieProzent(wert)='+wert)};
    Ergebniss = wert/(nSpeicherMax_kWh/100);
    return Ergebniss;
}; 

// Runden. Parameter float wert, int dez Anzahl der Stellen
function round(wert, dez) {
    let umrechnungsfaktor = Math.pow(10,dez);
    return Math.round(wert * umrechnungsfaktor) / umrechnungsfaktor;
} 

// e3dc.config.txt mit den aktuellen Werten neu schreiben
async function e3dcConfigWrite(i){    
    let string = " ";
	// erzeuge String
	string = "server_ip = " +sServerIP+ "\nserver_port = " +sServerPort+ "\ne3dc_user = " +sE3dcUser+ "\ne3dc_password = "
            +sE3dcPasswort+ "\naes_password = " +sAesPasswort+ "\nwallbox = " +sWallbox+ "\next1 = " +sExt1+ "\next2 = "
            +sExt2+ "\nwurzelzaehler = " +sWurzelzaehler+ "\neinspeiselimit = " +sEinspeiselimit[i]+ "\nuntererLadekorridor = "
            +sUntererLadekorridor[i]+ "\nobererLadekorridor = " +sObererLadekorridor[i]+ "\nminimumLadeleistung = " +sMinimumLadeleistung[i]+
            "\nmaximumLadeleistung = " +sMaximumLadeleistung[i]+ "\nwrleistung = " +sWrleistung+ "\nladeschwelle = " +sLadeschwelle[i]+
            "\nladeende = " +sLadeende[i]+ "\nladeende2 = " +sLadeende2[i]+ "\nwinterminimum = " +sWinterminimum[i]+ "\nsommermaximum = " +sSommermaximum[i]+
            "\nsommerladeende = " +sSommerladeende[i]+ "\nspeichergroesse = " +sSpeichergroesse[i]+ "\nunload = " +sUnload[i]+
            "\nhtmin = " +sHtmin+ "\nhtsockel = " +sHtsockel+ "\nhton = " +sHton+ "\nhtoff = " +sHtoff+ "\nhtsat = " +sHtsat
            + "\nhtsun = " +sHtsun+ "\ndebug = " +sDebug+ "\nwbmode = " +sWBmode+ "\nwbminlade = " +sWBminLade+ "\npeakshave = " +sPeakshave+ "\n";

	// String in Datei e3dc.config.txt schreiben
    try{
        await fs.writeFile(sPfadE3DC , string)
        console.log('-==== E3DC Config Datei gespeichert! ====-');
		await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'DatenSchreiben',false);
     } catch (error){    
         log('-==== Fehler beim Schreiben der e3dc.config.txt Error = '+ error+' ====-', 'warn')
	}
};

// Einlesen der Werte e3dc.config.txt
async function e3dcConfigRead()  
{
    let StateParameter = ['Einspeiselimit','UntererLadekorridor','ObererLadekorridor',
    'MinimumLadeleistung','MaximumLadeleistung','Wrleistung','Ladeschwelle','Ladeende',
    'Ladeende2','Winterminimum','Sommermaximum','Sommerladeende','Speichergroesse','Unload',
    'HTmin','HTsockel','HTon','HToff','HTsat','HTsun','Debug','Wallbox','WBmode','WBminLade','Peakshave']
    try{
        let data = await fs.readFile(sPfadE3DC, 'utf8')
        data = data.replace(/\n/g, " ");
        data = data.replace("//", " ");
        data = data.toLowerCase();
        let SrtingSplit = data.split(' ');
        for (let i in StateParameter) {
            var idx = SrtingSplit.indexOf(StateParameter[i].toLowerCase());
            if (idx != -1 && !isNaN(parseFloat(SrtingSplit[idx+2]))){            
                await setStateAsync(instanz + PfadEbene1 + PfadEbene2[0]+StateParameter[i], parseFloat(SrtingSplit[idx+2]));
            }else if(idx != -1 && isNaN(parseFloat(SrtingSplit[idx+2]))){
                await setStateAsync(instanz + PfadEbene1 + PfadEbene2[0]+StateParameter[i], SrtingSplit[idx+2]);
            }else{
                log('-==== Parameter '+StateParameter[i]+' wurde nicht gefunden ====-', 'warn');
                log('-==== idx ='+idx+' SrtingSplit ='+SrtingSplit[idx+2]+' ====-');
            }
        }
        await UTC_Dezimal_to_MEZ();
        await MEZ_Regelzeiten();
    } catch (error){
    log('-==== Parameter Fehler beim einlesen der Parameter Error = '+ error+' ====-', 'warn')
    }
    log('-==== E3DC Config Datei eingelesen! ====-');
    setState(instanz + PfadEbene1 + PfadEbene2[1] + 'DatenLesen',false);
};



// Einlesen der aktuellen Werte ioBroker
async function StateRead() 
{
	sEinspeiselimit[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Einspeiselimit').val;
    sUntererLadekorridor[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'UntererLadekorridor').val;
    sObererLadekorridor[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'ObererLadekorridor').val;
    sMinimumLadeleistung[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'MinimumLadeleistung').val;
    sMaximumLadeleistung[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'MaximumLadeleistung').val;
    sWrleistung = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Wrleistung').val;
    sLadeschwelle[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Ladeschwelle').val;
    sLadeende[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Ladeende').val;
    sLadeende2[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Ladeende2').val;
    sWinterminimum[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Winterminimum').val;
    sSommermaximum[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Sommermaximum').val;
    sSommerladeende[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Sommerladeende').val;
    sSpeichergroesse[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Speichergroesse').val;
    sUnload[0] = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Unload').val;
    sHtmin = getState(instanz + PfadEbene1 + PfadEbene2[0]+'HTmin').val;
    sHtsockel = getState(instanz + PfadEbene1 + PfadEbene2[0]+'HTsockel').val;
    sHton = getState(instanz + PfadEbene1 + PfadEbene2[0]+'HTon').val;
    sHtoff = getState(instanz + PfadEbene1 + PfadEbene2[0]+'HToff').val;
    sHtsat = getState(instanz + PfadEbene1 + PfadEbene2[0]+'HTsat').val;
    sHtsun = getState(instanz + PfadEbene1 + PfadEbene2[0]+'HTsun').val;
    sDebug = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Debug').val;
    sWallbox = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Wallbox').val;
    sWBmode = getState(instanz + PfadEbene1 + PfadEbene2[0]+'WBmode').val;
    sWBminLade = getState(instanz + PfadEbene1 + PfadEbene2[0]+'WBminLade').val;
    sPeakshave = (await getStateAsync(instanz + PfadEbene1 + PfadEbene2[0]+'Peakshave')).val;
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


 // Create states under 0_userdata.0 or javascript.x
 // Autor:Mic (ioBroker) | Mic-M (github)
 // Version: 1.2 (20 October 2020)
function createUserStates(where, force, statesToCreate, callback = undefined) {
 
    const WARN = false; // Only for 0_userdata.0: Throws warning in log, if state is already existing and force=false. Default is false, so no warning in log, if state exists.
    const DELAY = 50; // Delay in milliseconds (ms). Increase this to 100, if it is not working.

    // Validate "where"
    if (where.endsWith('.')) where = where.slice(0, -1); // Remove trailing dot
    if ( (where.match(/^((javascript\.([1-9][0-9]|[0-9]))$|0_userdata\.0$)/) == null) ) {
        log('This script does not support to create states under [' + where + ']', 'error');
        return;
    }

    // Prepare "statesToCreate" since we also allow a single state to create
    if(!Array.isArray(statesToCreate[0])) statesToCreate = [statesToCreate]; // wrap into array, if just one array and not inside an array

    // Add "where" to STATES_TO_CREATE
    for (let i = 0; i < statesToCreate.length; i++) {
        let lpPath = statesToCreate[i][0].replace(/\.*\./g, '.'); // replace all multiple dots like '..', '...' with a single '.'
        lpPath = lpPath.replace(/^((javascript\.([1-9][0-9]|[0-9])\.)|0_userdata\.0\.)/,'') // remove any javascript.x. / 0_userdata.0. from beginning
        lpPath = where + '.' + lpPath; // add where to beginning of string
        statesToCreate[i][0] = lpPath;
    }

    if (where != '0_userdata.0') {
        // Create States under javascript.x
        let numStates = statesToCreate.length;
        statesToCreate.forEach(function(loopParam) {
            if (DebugAusgabe) log('[Debug] Now we are creating new state [' + loopParam[0] + ']');
            let loopInit = (loopParam[1]['def'] == undefined) ? null : loopParam[1]['def']; // mimic same behavior as createState if no init value is provided
            createState(loopParam[0], loopInit, force, loopParam[1], function() {
                numStates--;
                if (numStates === 0) {
                    if (DebugAusgabe) log('[Debug] All states processed.');
                    if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                        if (DebugAusgabe) log('[Debug] Function to callback parameter was provided');
                        return callback();
                    } else {
                        return;
                    }
                }
            });
        });
    } else {
        // Create States under 0_userdata.0
        let numStates = statesToCreate.length;
        let counter = -1;
        statesToCreate.forEach(function(loopParam) {
            counter += 1;
            if (DebugAusgabe) log ('[Debug] Currently processing following state: [' + loopParam[0] + ']');
            if( ($(loopParam[0]).length > 0) && (existsState(loopParam[0])) ) { // Workaround due to https://github.com/ioBroker/ioBroker.javascript/issues/478
                // State is existing.
                if (WARN && !force) log('State [' + loopParam[0] + '] is already existing and will no longer be created.', 'warn');
                if (!WARN && DebugAusgabe) log('[Debug] State [' + loopParam[0] + '] is already existing. Option force (=overwrite) is set to [' + force + '].');
                if(!force) {
                    // State exists and shall not be overwritten since force=false
                    // So, we do not proceed.
                    numStates--;
                    if (numStates === 0) {
                        if (DebugAusgabe) log('[Debug] All states successfully processed!');
                        if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                            if (DebugAusgabe) log('[Debug] An optional callback function was provided, which we are going to execute now.');
                            return callback();
                        } else {  // no callback, return anyway
                            return;
                        }
                    } else {
                        // We need to go out and continue with next element in loop.
                        return; // https://stackoverflow.com/questions/18452920/continue-in-cursor-foreach
                    }
                } // if(!force)
            }

            // State is not existing or force = true, so we are continuing to create the state through setObject().
            let obj = {};
            obj.type = 'state';
            obj.native = {};
            obj.common = loopParam[1];
            // @ts-ignore
            setObject(loopParam[0], obj, function (err) {
                if (err) {
                    log('Cannot write object for state [' + loopParam[0] + ']: ' + err);
                } else {
                    if (DebugAusgabe) log('[Debug] Now we are creating new state [' + loopParam[0] + ']')
                    let init = null;
                    if(loopParam[1].def === undefined) {
                        if(loopParam[1].type === 'number') init = 0;
                        if(loopParam[1].type === 'boolean') init = false;
                        if(loopParam[1].type === 'string') init = '';
                    } else {
                        init = loopParam[1].def;
                    }
                    setTimeout(function() {
                        setState(loopParam[0], init, true, function() {
                            if (DebugAusgabe) log('[Debug] setState durchgeführt: ' + loopParam[0]);
                            numStates--;
                            if (numStates === 0) {
                                if (DebugAusgabe) log('[Debug] All states processed.');
                                if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                                    if (DebugAusgabe) log('[Debug] Function to callback parameter was provided');
                                    return callback();
                                }
                            }
                        });
                    }, DELAY + (20 * counter) );
                }
            });
        });
    }
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
                    reject('Error, status code = '+ xhr.status)
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


// Daten Solcast beim Skript Start und jede Stunde von 4:10 Uhr bis 10:20 aktualisieren
async function SheduleSolcast(DachFl) { 
    let Date, Monat;
    if (DachFl > 0 && DachFl <= 2 ){
        for (let z = DachFl; z > 0; z--) {
            if (LogAusgabe){log('****************************** Es wird Solcast Dach '+z+' abgerufen ******************************');}
            await InterrogateSolcast(z).then(async function(result){
                let objDaten = JSON.parse(result)
                log('Rueckmeldung XHR.Status= '+ xhr2.status)
                //log('DAten='+JSON.stringify(objDaten))
                let ArrayTageswerte = objDaten['forecasts'];
                for (let d = 0; d < 7; d++) {
                    Date = nextDayDate(d);
                    if (d == 0) {Monat = Date.slice(5,7)} // Monat merken um am Monatende nicht vom Monatsanfang die Werte zu überschreiben
                    for (let i = 0; i < ArrayTageswerte.length; i++) {
                        if (ArrayTageswerte[i].period_end.search(Date)>-1){
                            SummePV_Leistung_Tag_kW[1][d] = SummePV_Leistung_Tag_kW[1][d] + ArrayTageswerte[i].pv_estimate
                            SummePV_Leistung_Tag_kW[3][d] = SummePV_Leistung_Tag_kW[3][d] + ArrayTageswerte[i].pv_estimate90
                        }
                    }
                    if (z ==1){
                        log('Summe PV Leistung Tag '+Date+ ' pv_estimate= '+round(SummePV_Leistung_Tag_kW[1][d]/2,2)+' pv_estimate10= '+round(SummePV_Leistung_Tag_kW[2][d]/2,2)+' pv_estimate90= '+round(SummePV_Leistung_Tag_kW[3][d]/2,2))
                        if (Date.slice(5,7) == Monat) {
                            setState(instanz +PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast_kWh_' +Date.slice(8,10),round(SummePV_Leistung_Tag_kW[1][d]/2,2));
                            setState(instanz +PfadEbene1 + PfadEbene2[2] + 'PrognoseSolcast90_kWh_' +Date.slice(8,10),round(SummePV_Leistung_Tag_kW[3][d]/2,2));
                        }
                        SummePV_Leistung_Tag_kW[1][d] = 0;
                        SummePV_Leistung_Tag_kW[2][d] = 0;
                        SummePV_Leistung_Tag_kW[3][d] = 0;
                    }
                }
            }, function(error) {
                log ('Error in der function InterrogateSolcast. Fehler = '+error, 'warn')
            })   
        }
                
    }
}


// Zeitformat UTC dezimal in MEZ Uhrzeit 
async function UTC_Dezimal_to_MEZ(){
    let UTC_Dez_Minuten='';
    let UTC_Dez_Stunden ='';
    let MEZ_Zeit =[];
    let MESZ_Zeit =[];
    let nWinterminimum = (parseFloat((await getStateAsync(instanz + PfadEbene1 + PfadEbene2[0] + 'Winterminimum')).val)).toFixed(2);
    let nSommermaximum = (parseFloat((await getStateAsync(instanz + PfadEbene1 + PfadEbene2[0] + 'Sommermaximum')).val)).toFixed(2);
    let nSommerladeende = (parseFloat((await getStateAsync(instanz + PfadEbene1 + PfadEbene2[0] + 'Sommerladeende')).val)).toFixed(2);
    let nHTon = (parseFloat((await getStateAsync(instanz + PfadEbene1 + PfadEbene2[0] + 'HTon')).val)).toFixed(2);
    let nHToff = (parseFloat((await getStateAsync(instanz + PfadEbene1 + PfadEbene2[0] + 'HToff')).val)).toFixed(2);
    

    let UTC_Dez = [nWinterminimum,nSommermaximum,nSommerladeende,nHTon,nHToff];
    for (let i = 0; i < 5 ; i++){
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
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'HTon_MEZ',MESZ_Zeit[3]);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'HToff_MEZ',MESZ_Zeit[4]);
    }else{
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Winterminimum_MEZ',MEZ_Zeit[0]);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommermaximum_MEZ',MEZ_Zeit[1]);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommerladeende_MEZ',MEZ_Zeit[2]);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'HTon_MEZ',MEZ_Zeit[3]);
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'HToff_MEZ',MEZ_Zeit[4]);

    }
     
}


// Zeiten Start und Ende E3DC-Control Regelung von eba
async function MEZ_Regelzeiten(){
    let dAkt = new Date();
    let jjjj= dAkt.getFullYear();
    let dStart = new Date(jjjj+',1,1');
    // @ts-ignore
    let tm_yday = Math.round(Math.abs(dAkt - dStart) / (1000 * 60 * 60 * 24 ));
    let ZeitAnwahl_MEZ_MESZ = (await getStateAsync(sID_Anwahl_MEZ_MESZ)).val
    
    let nWinterminimum = parseFloat((await getStateAsync(instanz + PfadEbene1 + PfadEbene2[0] + 'Winterminimum')).val);
    let nSommermaximum = parseFloat((await getStateAsync(instanz + PfadEbene1 + PfadEbene2[0] + 'Sommermaximum')).val);
    let nSommerladeende = parseFloat((await getStateAsync(instanz + PfadEbene1 + PfadEbene2[0] + 'Sommerladeende')).val);
    
    let cLadezeitende1 =Math.floor((nWinterminimum+(nSommermaximum-nWinterminimum)/2)*3600);
    let cLadezeitende2 =Math.floor((nWinterminimum+0.5+(nSommerladeende-nWinterminimum - 0.5)/2)*3600);
    let cLadezeitende3 = Math.floor((nWinterminimum-(nSommermaximum-nWinterminimum)/2)*3600);
    
    let tLadezeitende = Math.floor(cLadezeitende1+Math.cos((tm_yday+9)*2*3.14/365)*-((nSommermaximum-nWinterminimum)/2)*3600);
    let tLadezeitende2 = Math.floor(cLadezeitende2+Math.cos((tm_yday+9)*2*3.14/365)*-((nSommerladeende-nWinterminimum-0.5)/2)*3600);
    let tLadezeitende3 = Math.floor(cLadezeitende3-Math.cos((tm_yday+9)*2*3.14/365)*-((nSommermaximum-nWinterminimum)/2)*3600);
    let tZeitgleichung = Math.floor((-0.171 * Math.sin((0.0337 * tm_yday + 0.465)) - 0.1299 * Math.sin((0.01787 * tm_yday - 0.168)))*3600);
    
    tLadezeitende = tLadezeitende - tZeitgleichung;
    tLadezeitende2 = tLadezeitende2 - tZeitgleichung;
    tLadezeitende3 = tLadezeitende3 - tZeitgleichung;
    
    let tRegelbeginn_Minuten = Math.floor(tLadezeitende3%3600/60);
    let tRegelbeginn_Stunden = Math.trunc(tLadezeitende3/3600);
    let tRegelende_Minuten = Math.floor(tLadezeitende%3600/60);  
    let tRegelende_Stunden = Math.trunc(tLadezeitende/3600);
    let tLadeende_Minuten = Math.floor(tLadezeitende2%3600/60);
    let tLadeende_Stunden = Math.trunc(tLadezeitende2/3600);      

    // ZeitAnwahl_MEZ_MESZ = true = MESZ Zeit
    if (ZeitAnwahl_MEZ_MESZ){
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Regelbeginn_MEZ',addMinutes(tRegelbeginn_Stunden+':'+tRegelbeginn_Minuten,120));
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Regelende_MEZ',addMinutes(tRegelende_Stunden+':'+tRegelende_Minuten,120));
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Ladeende_MEZ',addMinutes(tLadeende_Stunden+':'+tLadeende_Minuten,120));
    }else{
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Regelbeginn_MEZ',addMinutes(tRegelbeginn_Stunden+':'+tRegelbeginn_Minuten,60));
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Regelende_MEZ',addMinutes(tRegelende_Stunden+':'+tRegelende_Minuten,60));
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[1] + 'Ladeende_MEZ',addMinutes(tLadeende_Stunden+':'+tLadeende_Minuten,60));
    }
    
    if (LogAusgabe){
        log('RB = '+tRegelbeginn_Stunden+':'+tRegelbeginn_Minuten);
        log('RE = '+tRegelende_Stunden+':'+tRegelende_Minuten);
        log('LE = '+tLadeende_Stunden+':'+tLadeende_Minuten);
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
			if(DebugAusgabe)log(['Schedule Umrechnen W = P*t.  Minutenwert Leistung: '+ Pmin, ' Minutenwert Arbeit: ' + (Pmin/60/1000), ' Tageswert Ertrag: ' +PVErtrag ].join(''));
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


//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************

// Zaehler LM0
on(sID_PvLeistungLM0_W, function(obj) {
    let Leistung = getState(obj.id).val;
    if(Leistung > 0){
		if(!Timer0)Wh_Leistungsmesser0();
		count0 ++
		Summe0 = Summe0 + Leistung;
		//if(DebugAusgabe)log(['Summe: ' + Summe0, ' Zaehler: '+count0, ' Addition: + ' +Leistung ].join(''));
    }
});
 
// Zaehler LM1
on(sID_PvLeistungLM1_W, function(obj) {
    let Leistung = Math.abs(getState(obj.id).val);
    if(Leistung > 0){
		if(!Timer1)Wh_Leistungsmesser1();
		count1 ++
		Summe1 = Summe1 + Leistung;
		//if(DebugAusgabe)log(['Summe: ' + Summe1, ' Zaehler: '+count1, ' Addition: + ' +Leistung ].join(''));
    }
});


// Wird aufgerufen wenn State Automatik in VIS geändert wird
on({id: sID_Automatik}, async function (obj){
	 AutomatikAnwahl = getState(obj.id).val;
     if(AutomatikAnwahl) {
        if (LogAusgabe){log('-==== Automatik gestartet ====-');}
        await setStateAsync(sID_EinstellungAnwahl,0);
        main();
    }else{
        if (LogAusgabe){log('-==== Automatik gestoppt ====-');}
    }
});  

// Bei Änderung Eigenverbrauch soll der Überschuss neu berechnet werden.
on({id: sIDEigenverbrauchTag, change: "ne"}, function (obj){
	if (LogAusgabe){log('-==== Wert Eigenverbrauch wurde auf '+getState(obj.id).val+' kWh geändert ====-');}
    main();
});  


// Wird aufgerufen wenn State HistorySelect in VIS geändert wird
on({id: sID_AnzeigeHistoryMonat}, async function (obj){
	let Auswahl = (await getStateAsync(obj.id)).val
    let Auswahl_0 = await zeroPad(Auswahl,2);
    if (Auswahl<=12){
        let JsonString = (await getStateAsync(instanz +PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_' +Auswahl_0)).val;
        await setStateAsync(instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON',JsonString);
    }else{
        log('State '+instanz + PfadEbene1 + PfadEbene2[2] + 'HistorySelect darf nicht > 12 sein ','warn');
    }
}); 

// e3dc.config.txt mit den aktuellen Werten neu schreiben wenn in VIS State DatenSchreiben = true
on({id: instanz + PfadEbene1 + PfadEbene2[1] + 'DatenSchreiben', val: true, change:'ne'}, async function (){
	await StateRead();
	await e3dcConfigWrite(0);
    await e3dcConfigRead();
});

// Einlesen der Werte e3dc.config.txt wenn in VIS State DatenLesen = true 
on({id: instanz + PfadEbene1 + PfadEbene2[1] + 'DatenLesen', val: true, change:'ne'}, async function (obj){
	await e3dcConfigRead();
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
on({id: sID_EinstellungAnwahl, change: "ne"}, async function (obj){
    if (obj.state.val !=0 && obj.state.val <= 5 ){
        EinstellungAnwahl = obj.state.val
        await setStateAsync(sID_Automatik,false,true);
        if(LogAusgabe)log("Trigger manuelle Programmvorwahl");
        main();
    }
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

//Diagramm für stevie77 um 22 Uhr aktualisieren
schedule({hour: 22, minute: 1}, function(){setTimeout(function(){makeJson();},300);});

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
    setState(sID_Anwahl_MEZ_MESZ, dst());  /*true = MESZ ,false = MEZ*/
    if(LogAusgabe)log('-==== MESZ Status ====-');
});

// jeden Tag um 00:01 Tageswert nullen.
schedule({hour: 0, minute: 1}, function () { 
	setState(sID_PVErtragLM0,0,true);
	setState(sID_PVErtragLM1,0,true);
	if (LogAusgabe)log('-==== Tagesertragswert auf 0 gesetzt ====-');
});

//Bei Scriptende alle Timer löschen
onStop(function () { 
        clearSchedule(Timer0);
        clearSchedule(Timer1);
        clearSchedule(Timer2);
}, 100);
