/*****************************************************************************************
 Version: 0.2.29    kleinere Optimierungen im Skript
 Version: 0.2.28    Nach Abruf der Wetterdaten wird die Main() Funktion um 12000 ms verzögert aufgerufen, weil sonst die neuen Werte noch nicht gespeichert wurden.
                    Die Main() Funktion wurde beim Programmstart zweimal aufgerufen.
 Version: 0.2.27    Beim Umschalten zwischen Proplanta und Forecast wurde das Diagramm nicht bzw. nur verzögert aktualisiert. 
                    Durch die Verzögerung ist beim schnellen Umschalten auch nicht mit den richtigen Werten gerechnet worden,
                    so das eine falsche Einstellung angewählt wurde. 
                    Bei Anwahl Automatik wird jetzt der State EinstellungAnwahl auf 0 gesetzt, um bei einer manuellen Anwahl
                    der Einstellung (Werte im Bereich 1-5) im Skript, das als Änderung erkannt wird.
 Version: 0.2.26    Update Function createUserStates auf Version: 1.2 (20 October 2020) von Mic (ioBroker) | Mic-M (github) 
 Version: 0.2.25    Beim Abrufen der Wetterdaten Forecast, wurden die letzten Werte vorher nicht gelöscht.
					Wenn aus irgendeinem Grund keine neuen Daten abgerufen werden konnten, wurde mit den alten Werten gerechnet.
 Version: 0.2.24    Regelzeitraum Start, Ende und Ladezeitende werden jetzt nach der Formel von Eberhard richtig berechnet.
 Version: 0.2.23    Fehler behoben das die History Sicherungsdatei keine Werte gespeichert wurden und das falsche Monat eingelesen wurde.  
                    Die History Sicherungsdatei wird jetz nicht jedesmal neu erstellt sondern nur eine neue Zeile mit jeweiligem Datum eingefügt.
                    Die Anzeige PV-Leistung Prognose in VIS wird jetzt automatisch auf das aktuelle Monat umgestellt.
                    Danke an @smartboart.
 Version: 0.2.22    Fehler manuelles Umschalten der Einstellungen ohne Internetverbindung nicht möglich korrigiert 
 Version: 0.2.21    Fehler beim Speichern History JSON korrigiert wo es möglich war das der aktuelle Monat mit falschen Daten überschrieben wurde.
                    Neue Funktion von smartboat, Daten der json zusätzlich in eine Datei schreiben hinzugefügt.
 Version: 0.2.20    Fehler in der Zeitberechnung RB,RE,LE korrigiert.
 Version: 0.2.19    Zeitberechnung Ladeende an E3DC-Control Ver. 28.11.28.0 angepasst
 Version: 0.2.18    Parameter Wallbox (true,false) kann in Vis eingestellt werden. Es sind auch Änderungen in VIS erforderlich.
 Version: 0.2.17    Neue E3DC-Control Version von Eberhard, die Parameter "wbminlade" und "wbmode" integriert. Es sind auch Änderungen in VIS erforderlich,
                    um diese in Vis zu ändern. 
 Version: 0.2.16    Problem dass bei Prognoseanwahl Änderung Proplanta Forcast oder beide die json nicht gleich aktualisiert wird behoben.Danke an smartboart.
 Version: 0.2.15    Es können jetzt für 5 verschiedene Dachflächen die Prognosewerte von Forecast abgerufen werden.
 Version: 0.2.14    Fehler in der Function Prognosen_kWh_Berechnen() korrigiert.Verzögerung für Aufruf der Function InterrogateForecast(). Danke an michael74.
 Version: 0.2.13    Neuer State EigenverbrauchTag um den Eigenverbrauch aus VIS oder anderem Script variabel anpassen zu können.
                    Hinweis von smartboart, Verzögerung beim schreiben der e3dc-config.txt umgesetzt
 Version: 0.2.12    Neuer State "PrognoseAnwahl" hinzugefügt. Es kann jetzt in VIS ausgewählt werden, welche Prognose für die Berechnung verwendet wird.
                    0= Proplanta u. Forecast 1=Proplanta 2=Forecast.
 Version: 0.2.11    Es wird geprüft ob die neue Einstellung ungleich der bereits angewählten Einstellung ist.
                    Dadurch wird ein unnötiges Speichern der e3dc-config.txt verhindert, wenn sich an der Einstellung nichts ändert.
                    Letzte Abfrage der Prognosedaten auf 10:20 Uhr geändert.
 Version: 0.2.10    Forecast Daten werden jede Stunde von 4:10 Uhr bis 15:20 aktualisiert.
					Fehler in der function Ueberschuss_Prozent() behoben, die zu einer falschen Berechnung vom Eigenverbrauch geführt hat.
 Version: 0.2.09    PV Ertragszähler von smartboart integriert.Adapter SourceAnalytix wird nicht mehr benötigt.
 Version: 0.2.08    Wenn von Proplanta keine Werte bei der ersten Abfrage kommen, wird diese zweimal wiederholt.
 Version: 0.2.07    Umschaltung MEZ oder MESZ wird automatisch ausgeführt.Man kann aber immer noch manuell umschalten.
                    Verzögerung beim Aufruf der main() function nach manueller Amwahl der Einstellungen 1-5.
                    Es muss das NPM-Module "is-it-bst" in der Javascript Instanz installiert werden.
 Version: 0.2.06    Regelzeitraum Start, Ende und Ladezeitende werden jetzt nach der Formel von Eberhard berechnet und je nach Einstellung in MEZ oder MESZ
                    in VIS angezeigt. Es wird die Systemzeit vom IoBroker verwendet, da ich über Modbus keine Zeit vom E3DC bekomme.
                    Wenn diese beiden Zeiten nicht synchron sind, stimmen die Zeiten natürlich nicht. Die manuelle Anwahl der 5 Einstellungen ist jetzt möglich,
                    Danke an @smartboart für seine Vorarbeit.
 Version: 0.2.05    Zeiten werden in MEZ umgerechnet und in eigenen States gespeichert:'Winterminimum_MEZ','Sommermaximum_MEZ','Sommerladeende_MEZ'
                    'HTon_MEZ','HToff_MEZ'.
                    Fehler in der PrognoseBerechnung_kWh_heute korrigiert, durch die laufende Neuberechnung muss
                    die bereits produzierte PV-Leistung von der Prognose Tag abgezogen werden und das Gleiche bei nEigenverbrauchTag in kWh.
                    nKorrFaktor geändert, es wird jetzt der % Wert angegeben um den die Prognose reduziert werden soll.
 Version: 0.2.04    Nach der aktualisierung Proplanta wird die Function main() aufgerufen und neu berechnet
 Version: 0.2.03    Proplanta URL für Ländercode de,at, ch, fr, it hinzugefügt mit neuer constante country in den User Einstellungen.
 Version: 0.2.02    Neuer State NaesteAktualisierung hinzugefügt.Von der Webseite Proplanta wird die Zeit "nächste Aktualisierung" gespeichert.
                    Die Daten von Proplanta werden 10 min. nach der Aktualisierung der Webseite automatisch abgerufen.
 Version: 0.2.01    Diagramm wird um 22:00 Uhr noch mal aktualisiert, Unload kann im Automatik Betrieb über Variable nMinUnloadSoC begrenzt werden,
                    oder mit nMinUnloadSoC=100 deaktiviert werden. Kleinere Fehler behoben.
 Version: 0.2.00    ACHTUNG !! Anpassungen in VIS erforderlich, da sich States geändert haben.
                    Abfrage Globalstrahlung von Proplanta integriert. Typescript Proplanta wird nicht mehr benötigt.
                    Bei der Prognose Proplanta wird jetzt Vorschau für vier Tage im Diagramm angezeigt.
                    Neuer State für die Summe von Leistungsmesser 0 und Leistungsmesser 1, um diesen in Vis anzuzeigen.
                    Nur noch ein Korrekturfaktor in %, um die berechnende Prognosewerte anzugleichen.
                    Script optimiert und aufgeräumt. Neue State Struktur erstellt, um das Ganze übersichtlicher zu gestalten.
                    Diagramm wird jetzt bei Änderungen der PV-Leistung regelmäßig aktualisiert. Error Handling optimiert.
******************************************************************************************/
//++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN ++++++++++++++++++++++++++++++++++

//****************************** Einstellungen E3DC-Control *****************************
const sServerIP = "";							// IP Adresse vom E3DC
const sServerPort = "5033";                     // Server Port
const sE3dcUser = "";							// E3DC User
const sE3dcPasswort = "";          				// E3DC Passwort um sich einzuloggen bei der Website
const sAesPasswort = "";						// E3DC AES Passwort neu zu vergebendes PW am E3DC
const sWurzelzaehler = "0";						// 0= interneraZaehler 6 = externer Zaehler 
const sExt1 = "false";                          // true, wenn ein externer Zaehler genutzt wird
const sExt2 = "false";                          // true, wenn ein externer Zaehler genutzt wird
const sPfadE3DC = "/home/iobroker/E3DC-Control/e3dc.config.txt" // Pfad zur e3dc.config.txt. User iobroker muss Zugriffsrechte haben.
// Für alle anderen Parameter werden States angelegt die über VIS geändert werden können
// Die Standardwerte müssen erst angepasst werden bevor die Funktion DatenSchreiben verwendet wird.
var logflag = true;                             // History Daten in Lokaler Datei speichern 
const sLogPath = "/home/iobroker/E3DC-Control/HistoryPV_Leistung.json"; // Pfad zur Sicherungsdatei History 

//****************************** Einstellungen forcast,solar ****************************
let nDeclination =[],nAzimuth =[],nPower_kWp =[];
let nDachflaechen = 2;                          // Es können bis zu 5 unterschiedliche Dachflächen abgefragt werden 0 = deaktiviert
const nLatitude = xx.xxxx;                      // Die geographische Breite vom Standort der Photovoltaikanlage
const nLongitude = xx.xxxx;                     // Die geographische Länge vom Standort der Photovoltaikanlage
// Dachfläche 1
nDeclination[1] = 42;                           // Ausrichtung der Module (Dachneigung) 
nAzimuth[1] = -4;                               // Ausrichtung der Module (-180=north, -90=east, 0=south, 90=west, 180=north)
nPower_kWp[1] = 7.8;                            // Leistung aller Module in kWp
// Dachfläche 2
nDeclination[2] = 35;                           // Ausrichtung der Module (Dachneigung) 
nAzimuth[2] = -4;                               // Ausrichtung der Module (-180=north, -90=east, 0=south, 90=west, 180=north)
nPower_kWp[2] = 7.2;                            // Leistung aller Module in kWp
// Dachfläche 3
nDeclination[3] = 0;                            // Ausrichtung der Module (Dachneigung) 
nAzimuth[3] = 0;                                // Ausrichtung der Module (-180=north, -90=east, 0=south, 90=west, 180=north)
nPower_kWp[3] = 0;                              // Leistung aller Module in kWp
// Dachfläche 4
nDeclination[4] = 0;                            // Ausrichtung der Module (Dachneigung) 
nAzimuth[4] = 0;                                // Ausrichtung der Module (-180=north, -90=east, 0=south, 90=west, 180=north)
nPower_kWp[4] = 0;                              // Leistung aller Module in kWp
// Dachfläche 5
nDeclination[5] = 0;                            // Ausrichtung der Module (Dachneigung) 
nAzimuth[5] = 0;                                // Ausrichtung der Module (-180=north, -90=east, 0=south, 90=west, 180=north)
nPower_kWp[5] = 0;                              // Leistung aller Module in kWp

//******************************** Einstellungen Proplanta ******************************
const country = "de"                            // Ländercode de,at, ch, fr, it
const ProplantaOrt = ''           				// Welcher Wohnort soll abgefragt werden
const ProplantaPlz = ''                    		// Postleitzahl

//********************* Einstellungen Automatische Prognoseberechnung *******************
const nModulFlaeche = 73;                       // Installierte Modulfläche in m² (Silizium-Zelle 156x156x60 Zellen x 50 Module)
const nWirkungsgradModule = 18.4;               // Wirkungsgrad der Solarmodule in %
const nSpeicherMax_kWh = 39.0;					// Maximale Speichergroesse für Automatische Prognoseberechnung 
const nKorrFaktor = 0                           // nKorrFaktor in Prozent. Reduziert die berechnete Prognose um diese anzugleichen.nKorrFaktor= 0 ohne Korrektur 
const nMinPvLeistungTag_kWh = 3                 // minimal Mögliche PV-Leistung. Wenn Prognose niedriger ist wird mit diesem Wert gerechnet
const nMaxPvLeistungTag_kWh = 100               // max. Mögliche PV-Leistung. Wenn Prognose höher ist wird mit diesem Wert gerechnet
let nMinUnloadSoC= 100                          // min. Wert in % was die Batterie entladen werden darf um Kapazität für Überschussladung zu schaffen. 100 = keine Entladung
let sEinspeiselimit =[], sUntererLadekorridor =[],sObererLadekorridor =[],sMinimumLadeleistung =[],sMaximumLadeleistung =[];
let sLadeschwelle =[],sLadeende=[],sLadeende2=[],sWinterminimum=[],sSommermaximum=[],sSommerladeende=[],sSpeichergroesse=[],sUnload=[];

//*********************************** Einstellung 1 *************************************
// Prognose - Eigenverbrauch ist geringer als benötigte Leistung um Batterie auf 100% zu laden
sEinspeiselimit[1] = 10.4;
sUntererLadekorridor[1] = 0;
sObererLadekorridor[1] = 4500;
sMinimumLadeleistung[1] = 0;
sMaximumLadeleistung[1] = 12000;
sLadeschwelle[1] = 95;
sLadeende[1] = 95;
sLadeende2[1] = 100;
sWinterminimum[1] = 11.50;
sSommermaximum[1] = 14.00;
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
sLadeende2[2] = 95;
sWinterminimum[2] = 11.50;          // Das winterminimum sollte um den Sonnenhöchststand am 21.12. liegen.Sonnenhöchstand am 21.12. 12:09 UTC
sSommermaximum[2] = 14.00;          // Sommermaximum sollte die zeit sein, wo es am 21.6. noch zu Überschuss kommen kann.Sonnenhöchstand am 21.06. 13:12 UTC
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
sWinterminimum[3] = 5.00;
sSommermaximum[3] = 6.00;
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
sWinterminimum[4] = 12.09;
sSommermaximum[4] = 14.00;
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
sWinterminimum[5] = 12.09;
sSommermaximum[5] = 14.00;
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
let PfadEbene2 = ['Parameter.', 'Allgemein.', 'History.', 'Proplanta.', 'Forecast.']
const LogAusgabe = true                           // Zusätzliche LOG Ausgaben 
const DebugAusgabe = false                        // Debug Ausgabe im LOG zur Fehlersuche
//---------------------------------------------------------------------------------------
//+++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN +++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------



//***************************************************************************************************
//************************************ Deklaration Variablen ****************************************
//***************************************************************************************************

const fs = require('fs');       
// @ts-ignore
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
// @ts-ignore
const dst = require('is-it-bst');
let AutomatikAnwahl,ZeitAnwahl_MEZ_MESZ,EinstellungAnwahl,PrognoseAnwahl;
let sWrleistung,sHtmin,sHtsockel,sHton,sHtoff,sHtsat,sHtsun,sDebug,sWallbox,sWBmode,sWBminLade,sPeakshave;
let xhr = new XMLHttpRequest();
let count0 = 0, count1 = 0, Summe0 = 0, Summe1 = 0, Timer0 = null, Timer1 = null,Timer2 = null,Timer3 = null, merker0 = false, merker1 = false;
let TimerForecast;
let xhrProplanta = new XMLHttpRequest();
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
[PfadEbene1 + PfadEbene2[0] + 'Einspeiselimit', {'def':'10.0', 'name':'bei 15kWp beginnt die 70% Einspeisegrenze bei 10.5 kWh -0.1 Sicherheit', 'type':'string', 'role':'string', 'desc':'Einspeiselimit', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[0] + 'UntererLadekorridor', {'def':'500', 'name':'Die Ladeleistung soll sich innerhalb diesen Korridors bewegen', 'type':'string', 'role':'string', 'desc':'UntererLadekorridor', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'ObererLadekorridor', {'def':'4500', 'name':'beim S10 E PRO wird 4500 empfohlen', 'type':'string', 'role':'string', 'desc':'ObererLadekorridor', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'MinimumLadeleistung', {'def':'500', 'name':'es soll mind. mit dieser Leistung geladen werden, liegt sie darunter, stoppt die Ladung.', 'type':'string', 'role':'string', 'desc':'MinimumLadeleistung', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'MaximumLadeleistung', {'def':'12000', 'name':'Leistung der Batteriewandler 3000 beim E10, beim Pro zwischen 6000 u. 12000 immer > MINIMUMLADELEISTUNG', 'type':'string', 'role':'string', 'desc':'MaximumLadeleistung', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'Wrleistung', {'def':'12000', 'name':'AC-Leistung des WR, 12000 bei PRO', 'type':'string', 'role':'string', 'desc':'Wrleistung', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'Ladeschwelle', {'def':'0', 'name':'bis zur dieser Schwelle wird geladen bevor die Regelung beginnt', 'type':'string', 'role':'string', 'desc':'Ladeschwelle', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'Ladeende', {'def':'80', 'name':'Zielwert bis Ende Regelung, dannach wird Ladung auf ladeende2 weiter geregelt', 'type':'string', 'role':'string', 'desc':'Ladeende', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'Ladeende2', {'def':'93', 'name':'ladeende2 kann der Wert abweichend vom Defaultwert 93% gesetzt werden.Muss > ladeende sein', 'type':'string', 'role':'string', 'desc':'Ladeende2', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'Winterminimum', {'def':'11.02', 'name':'winterminimum wintersonnenwende', 'type':'string', 'role':'string', 'desc':'Winterminimum', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'Sommermaximum', {'def':'13.12', 'name':'sommermaximum sommersonnenwende', 'type':'string', 'role':'string', 'desc':'Sommermaximum', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'Sommerladeende', {'def':'18.00', 'name':'Zielwert bis Ende Regelung, dannach wird Ladung auf 93% weiter geregelt', 'type':'string', 'role':'string', 'desc':'Sommerladeende', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'Speichergroesse', {'def':'39.0', 'name':'nutzbare Kapazitaet des S10 Speichers', 'type':'string', 'role':'string', 'desc':'Speichergroesse', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[0] + 'Unload', {'def':'100', 'name':'Zielwert beim entladen.Die ladeschwelle muss < unload sein', 'type':'string', 'role':'string', 'desc':'Unload', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'HTmin', {'def':'30', 'name':'Speicherreserve in % bei Wintersonnenwende 21.12', 'type':'string', 'role':'string', 'desc':'Speicherreserve in % bei winterminimum', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'HTsockel', {'def':'20', 'name':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'type':'string', 'role':'string', 'desc':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'unit':'%'}],
[PfadEbene1 + PfadEbene2[0] + 'HTon', {'def':'5.00', 'name':'Uhrzeit UTC für Freigabe Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'type':'string', 'role':'string', 'desc':'Uhrzeit UTC für Freigabe Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'HToff', {'def':'13.12', 'name':'Uhrzeit UTC für Sperre Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'type':'string', 'role':'string', 'desc':'Uhrzeit UTC für Sperre Speicher entladen.(5.5 = 7:30 Uhr Sommerzeit)', 'unit':'Uhr'}],
[PfadEbene1 + PfadEbene2[0] + 'HTsat', {'def':'false', 'name':'Hochtarif auch am Samstag = true', 'type':'string', 'role':'string', 'desc':'Hochtarif auch am Samstag = true'}],
[PfadEbene1 + PfadEbene2[0] + 'HTsun', {'def':'false', 'name':'Hochtarif auch am Sonntag = true', 'type':'string', 'role':'string', 'desc':'Hochtarif auch am Sonntag = true'}],
[PfadEbene1 + PfadEbene2[0] + 'Wallbox', {'def':'false', 'name':'Steuerung Wollbox ein = true', 'type':'string', 'role':'string', 'desc':'Steuerung Wollbox ein = true'}],
[PfadEbene1 + PfadEbene2[0] + 'Debug', {'def':'false', 'name':'zusätzliche debug ausgaben in der Shell = true', 'type':'string', 'role':'string', 'desc':'zusätzliche debug ausgaben in der Shell = true'}],
[PfadEbene1 + PfadEbene2[0] + 'WBminLade', {'def':'3000', 'name':'min. Ladeleistung Wallbox', 'type':'string', 'role':'string', 'desc':'min. Ladeleistung Wallbox', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'WBmode', {'def':'0', 'name':'Priorität der Wallbox ', 'type':'string', 'role':'string', 'desc':'Priorität der Wallbox'}],
[PfadEbene1 + PfadEbene2[0] + 'Peakshave', {'def':'0', 'name':'Zur zeit ist nur reines Peakshaving realisiert, d.h. wenn man nicht mehr als z.B. 10kW Strombezug aus dem Netz haben möchte, dann speist der E3DC soviel aus, dass die 10kW Netzbezug eingehalten werden.', 'type':'string', 'role':'string', 'desc':'Begrenzung des Netzbezug'}],
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
[PfadEbene1 + PfadEbene2[1] + 'PrognoseAnwahl', {'def':0, 'name':'Proplanta und Forecast = 0 nur Proplanta=1 nur Forecast=2' , 'type':'number', 'role':'value'}],
[PfadEbene1 + PfadEbene2[2] + 'HistoryJSON', {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'}],
[PfadEbene1 + PfadEbene2[2] + 'HistorySelect', {'def':1, 'name':'Select Menü für materialdesign json chart' ,'type':'number'}],
[PfadEbene1 + PfadEbene2[3] + 'PrognoseProp_kWh_heute', {'def':0, 'name':'Tagesprognose Tag1 Proplanta' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[3] + 'PrognoseProp_kWh_morgen', {'def':0, 'name':'Tagesprognose Tag2 Proplanta' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[3] + 'Globalstrahlung_Tag_0', {'def':0, 'name':'Globalstrahlung Proplanta' ,'type':'number'}],
[PfadEbene1 + PfadEbene2[3] + 'Globalstrahlung_Tag_1', {'def':0, 'name':'Globalstrahlung Proplanta' ,'type':'number'}],
[PfadEbene1 + PfadEbene2[3] + 'Globalstrahlung_Tag_2', {'def':0, 'name':'Globalstrahlung Proplanta' ,'type':'number'}],
[PfadEbene1 + PfadEbene2[3] + 'Globalstrahlung_Tag_3', {'def':0, 'name':'Globalstrahlung Proplanta' ,'type':'number'}],
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
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_heute', {'def':0, 'name':'Tagesprognose Tag1 forecast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_morgen', {'def':0, 'name':'Tagesprognose Tag2 forecast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D1_heute', {'def':0, 'name':'Tagesprognose heute Dachfläche 1 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D1_morgen', {'def':0, 'name':'Tagesprognose Morgen Dachfläche 1 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D2_heute', {'def':0, 'name':'Tagesprognose heute Dachfläche 2 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D2_morgen', {'def':0, 'name':'Tagesprognose Morgen Dachfläche 2 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D3_heute', {'def':0, 'name':'Tagesprognose heute Dachfläche 3 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D3_morgen', {'def':0, 'name':'Tagesprognose Morgen Dachfläche 3 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D4_heute', {'def':0, 'name':'Tagesprognose heute Dachfläche 4 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D4_morgen', {'def':0, 'name':'Tagesprognose Morgen Dachfläche 4 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D5_heute', {'def':0, 'name':'Tagesprognose heute Dachfläche 5 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
[PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D5_morgen', {'def':0, 'name':'Tagesprognose Morgen Dachfläche 5 forcast.solar' , 'type':'number', 'role':'value', 'unit':'kWh'}],
];

for (let i = 1; i <= 31; i++) {
	let statePV_Leistung, stateProgProp, stateProgFore, stateProgAuto,stateHystory;
    let n = zeroPad(i,2);
    statePV_Leistung = [PfadEbene1 + PfadEbene2[2] + 'IstPvLeistung_kWh_' +n, {'def':0, 'name':'PV-Leistung Tag sourceanalytix' ,'type':'number', 'unit':'kWh'}]
    stateProgFore = [PfadEbene1 + PfadEbene2[2] + 'PrognoseFore_kWh_' +n, {'def':0, 'name':'Tagesprognose forcast.solar', 'type':'number', 'unit':'kWh'}]
    stateProgProp = [PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_' +n, {'def':0, 'name':'Tagesprognose Proplanta', 'type':'number', 'unit':'kWh'}]
    stateProgAuto = [PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_' +n, {'def':0, 'name':'Berechnete Prognose bei Anwahl Automatik' ,'type':'number', 'unit':'kWh'}]
    
    if (i < 13){
        stateHystory = [PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_' +n, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'}]
        statesToCreate.push(stateHystory)
    }
    
    statesToCreate.push(statePV_Leistung)
    statesToCreate.push(stateProgFore)
    statesToCreate.push(stateProgProp)
    statesToCreate.push(stateProgAuto)
}

createUserStates(instanz, false, statesToCreate, function(){
    log('Jetzt sind alle States abgearbeitet');
    AutomatikAnwahl = getState(sID_Automatik).val;
    PrognoseAnwahl = getState(sID_PrognoseAnwahl).val;
    setState(sID_Anwahl_MEZ_MESZ, dst());  
    setState(sID_Einstellung,0);
    ZeitAnwahl_MEZ_MESZ = getState(sID_Anwahl_MEZ_MESZ).val
    EinstellungAnwahl = getState(sID_EinstellungAnwahl).val
    Wh_Leistungsmesser0();
    Wh_Leistungsmesser1();
    // Daten Forecast beim Programmstart aktualisieren
    // Werte für jede Dachfläche im Abstand von 5 sek. abrufen
   
    let i = nDachflaechen;
    // Alte Forecast Werte Löschen vor Aktualisierung
    for (let i = 1; i <= 5; i++) {
        setState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D'+ i +'_heute',0);
        setState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D'+ i +'_morgen',0);
    }
    TimerForecast = setInterval(CallForecast, 5000);
    function CallForecast() {
	    InterrogateForecast (i,2); 
	    i--;
	    if ( i < 1 ) {
        clearInterval(TimerForecast);
    }    
}

// Daten Proplanta einmal beim Programmstart aktualisieren
InterrogateProplanta(2);
// Regelmässige Aktualisierung Daten Proplanta beim Programmstart starten
ScheduleProplanta();    
// Stündliche Aktualisierung Daten Forecast beim Programmstart starten
SheduleForecast();

});
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
if ((typeof nDachflaechen != "number") || (typeof nDachflaechen == undefined)){console.error("Dachflächen muss als Number eingegeben werden");}
if (((typeof nLatitude != "number") || (typeof nLatitude == undefined))&& nDachflaechen != 0 ) {console.error("Latitude muss als Number eingegeben werden");}
if (((typeof nLongitude != "number") || (typeof nLongitude == undefined))&& nDachflaechen != 0 ){console.error("Longitude muss als Number eingegeben werden");}
if (((typeof nDeclination[1] != "number") || (typeof nDeclination[1] == undefined))&& nDachflaechen != 0 ){console.error("Declination1 muss als Number eingegeben werden");}
if (((typeof nDeclination[2] != "number") || (typeof nDeclination[2] == undefined))&& nDachflaechen != 0 ){console.error("Declination2 muss als Number eingegeben werden");}
if (((typeof nDeclination[3] != "number") || (typeof nDeclination[3] == undefined))&& nDachflaechen != 0 ){console.error("Declination3 muss als Number eingegeben werden");}
if (((typeof nDeclination[4] != "number") || (typeof nDeclination[4] == undefined))&& nDachflaechen != 0 ){console.error("Declination4 muss als Number eingegeben werden");}
if (((typeof nDeclination[5] != "number") || (typeof nDeclination[5] == undefined))&& nDachflaechen != 0 ){console.error("Declination5 muss als Number eingegeben werden");}
if (((typeof nAzimuth[1] != "number") || (typeof nAzimuth[1] == undefined))&& nDachflaechen != 0 ){console.error("Azimuth1 muss als Number eingegeben werden");}
if (((typeof nAzimuth[2] != "number") || (typeof nAzimuth[2] == undefined))&& nDachflaechen != 0 ){console.error("Azimuth2 muss als Number eingegeben werden");}
if (((typeof nAzimuth[3] != "number") || (typeof nAzimuth[3] == undefined))&& nDachflaechen != 0 ){console.error("Azimuth3 muss als Number eingegeben werden");}
if (((typeof nAzimuth[4] != "number") || (typeof nAzimuth[4] == undefined))&& nDachflaechen != 0 ){console.error("Azimuth4 muss als Number eingegeben werden");}
if (((typeof nAzimuth[5] != "number") || (typeof nAzimuth[5] == undefined))&& nDachflaechen != 0 ){console.error("Azimuth5 muss als Number eingegeben werden");}
if (((typeof nPower_kWp[1] != "number") || (typeof nPower_kWp[1] == undefined))&& nDachflaechen != 0 ){console.error("Power_kWp1 muss als Number eingegeben werden");}
if (((typeof nPower_kWp[2] != "number") || (typeof nPower_kWp[2] == undefined))&& nDachflaechen != 0 ){console.error("Power_kWp2 muss als Number eingegeben werden");}
if (((typeof nPower_kWp[3] != "number") || (typeof nPower_kWp[3] == undefined))&& nDachflaechen != 0 ){console.error("Power_kWp3 muss als Number eingegeben werden");}
if (((typeof nPower_kWp[4] != "number") || (typeof nPower_kWp[4] == undefined))&& nDachflaechen != 0 ){console.error("Power_kWp4 muss als Number eingegeben werden");}
if (((typeof nPower_kWp[5] != "number") || (typeof nPower_kWp[5] == undefined))&& nDachflaechen != 0 ){console.error("Power_kWp5 muss als Number eingegeben werden");}
if ((typeof nModulFlaeche != "number") || (typeof nModulFlaeche == undefined)){console.error("nModulFlaeche muss als Number eingegeben werden");}
if ((typeof nWirkungsgradModule != "number") || (typeof nWirkungsgradModule == undefined)){console.error("nWirkungsgradModule muss als Number eingegeben werden");}
if ((typeof nSpeicherMax_kWh != "number") || (typeof nSpeicherMax_kWh == undefined)){console.error("nSpeicherMax_kWh muss als Number eingegeben werden");}
if ((typeof nMinUnloadSoC != "number") || (typeof nMinUnloadSoC == undefined)){console.error("nMinUnloadSoC muss als Zahl, Type Number eingegeben werden");}
if (typeof country != 'string' || typeof country == 'undefined') {console.error('country muss als String eingegeben werden');}
//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************

function main()
{
    // Berechnug der Regelzeiten aktualisieren
    MEZ_Regelzeiten();
    
    //Prognosen in kWh umrechen
    Prognosen_kWh_Berechnen();
    
    // Diagramm aktualisieren
    setTimeout(function(){makeJson();},300); //verzögerung asyncron min. 300 ms erforderlich;
        
    // Überschuss PV-Leistung berechnen
    let UeberschussPrognoseProzent = Ueberschuss_Prozent();
    
    // Einstellungen 1-5 je nach Überschuss PV Leistung Wetterprognose und Bewölkung anwählen 
    Einstellung(UeberschussPrognoseProzent);
}

// Einstellungen 1-5 je nach Überschuss PV Leistung Wetterprognose und Bewölkung anwählen 
function Einstellung(UeberschussPrognoseProzent)
{
    let Bedeckungsgrad12,Bedeckungsgrad15,UnloadSoC,AktSpeicherSoC;
    let Einstellung_alt = getState(sID_Einstellung).val;    
    
    //Prüfen ob State existiert, sonst error Meldung und Variable null zuweisen
    if (existsState(sID_Batterie_SOC)){
         AktSpeicherSoC = getState(sID_Batterie_SOC).val;
    }else{
        log('State sBatterie_SOC ist nicht vorhanden','error');
        AktSpeicherSoC = null;
    }
        
    if (UeberschussPrognoseProzent== null){
      log('Überschuss PV-Leistung konnte nicht berechnet werden. Ueberschuss='+UeberschussPrognoseProzent,'error');  
      return  
    }
        
    // Bewölkung für weitere Entscheidung ermitteln
    Bedeckungsgrad12 = getState(instanz + PfadEbene1 + PfadEbene2[3] + 'Bewoelkungsgrad_12').val;
    Bedeckungsgrad15 = getState(instanz + PfadEbene1 + PfadEbene2[3] + 'Bewoelkungsgrad_15').val;
    if (LogAusgabe){log('Bewölkungsgrad 12 Uhr Proplanta '+Bedeckungsgrad12);}
    if (LogAusgabe){log('Bewölkungsgrad 15 Uhr Proplanta '+Bedeckungsgrad15);}
    if (Bedeckungsgrad12 == 200 && AutomatikAnwahl || Bedeckungsgrad15 == 200 && AutomatikAnwahl )
    {
      log('Bewölkungsgrad_12 oder Bewölkungsgrad_15 wurde nicht abgerufen. 12='+Bedeckungsgrad12+' 15='+Bedeckungsgrad15,'warn');  
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
            setState(sID_Einstellung,1);
            StateRead();
		    setTimeout(function() { e3dcConfigWrite(1);},500);
            setTimeout(e3dcConfigRead, 1500);
        }
	}	
	
    // Einstellung 2
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen
    // und keine Bewölkung > 87% 
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 < 90 && Bedeckungsgrad15 < 90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===2))
    {
		if (LogAusgabe){log('Einstellung 2 aktiv');}
        if(Einstellung_alt != 2){
            setState(sID_Einstellung,2);
            StateRead();
		    if (nMinUnloadSoC == 100){
                if (AktSpeicherSoC != null){
                    if (AktSpeicherSoC >= 50){sUnload[2] = AktSpeicherSoC;}// Aktueller Batterie SoC = unload verhindert ein Laden der Batterie bis zum Start der Regelung
                    if (AktSpeicherSoC < 50){sUnload[2] = 100;}            // Wenn Batterie SoC unter 50% soll gleich geladen werden 
                }
            }else{
                sUnload[2] = UnloadSoC
            }      
            setTimeout(function() { e3dcConfigWrite(2);},500);
		    setTimeout(e3dcConfigRead, 1500);
        }
	}	
	
    // Einstellung 3
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 18:00 Uhr Bewölkung > 87%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12>=90 && Bedeckungsgrad15>=90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===3))
	{
		if (LogAusgabe){log('Einstellung 3 aktiv');}
        if(Einstellung_alt != 3){
            setState(sID_Einstellung,3);
            StateRead();
		    setTimeout(function() { e3dcConfigWrite(3);},500);
		    setTimeout(e3dcConfigRead, 1500);
        }
	}	
	
    // Einstellung 4
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 15:00 Uhr Bewölkung > 87%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 >= 90 && Bedeckungsgrad15 < 90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===4))
	{
		if (LogAusgabe){log('Einstellung 4 aktiv');}
        if(Einstellung_alt != 4){
            setState(sID_Einstellung,4);
            StateRead();
		    setTimeout(function() { e3dcConfigWrite(4);},500);
		    setTimeout(e3dcConfigRead, 1500);
        }
    }
	
    // Einstellung 5
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 15:00 - 18:00 Uhr Bewölkung > 87%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12<90 && Bedeckungsgrad15>=90 && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===5))
    {
        if (LogAusgabe){log('Einstellung 5 aktiv');}
        if(Einstellung_alt != 5){
            setState(sID_Einstellung,5);
            StateRead();
		    setTimeout(function() { e3dcConfigWrite(5);},500);
		    setTimeout(e3dcConfigRead, 1500);
        }
	}
    
}

// Die Funktion rechnet die Prognosewerte Proplanta und Forecast in kWh um und Speichert 
// die Werte in den entspechenden States ab
function Prognosen_kWh_Berechnen()
{
    let Prognose_kWh_heute = 0,Prognose_kWh_Tag1 = 0,Prognose_kWh_Tag2 = 0,Prognose_kWh_Tag3 = 0;
    let DatumAk = new Date();
	let Tag0 = DatumAk.getDate();
	DatumAk.setDate(Tag0 + 1);
    let Tag1 = DatumAk.getDate();
    DatumAk.setDate(Tag1 + 1);
    let Tag2 = DatumAk.getDate();
    DatumAk.setDate(Tag2 + 1);
    let Tag3 = DatumAk.getDate();

    let Tag0_0 = zeroPad(Tag0,2);
    let Tag1_0 = zeroPad(Tag1,2);
    let Tag2_0 = zeroPad(Tag2,2);
    let Tag3_0 = zeroPad(Tag3,2);
    let PrognoseForecas_kWh_heute = 0;
    let PrognoseForecas_kWh_morgen = 0;
    let PrognoseProplanta_kWh_Tag0 = 0;
    let PrognoseProplanta_kWh_Tag1 = 0;
    let PrognoseProplanta_kWh_Tag2 = 0;
    let PrognoseProplanta_kWh_Tag3 = 0;
    let GlobalstrahlungTag0 = (getState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_0').val);
    let GlobalstrahlungTag1 = (getState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_1').val);   
    let GlobalstrahlungTag2 = (getState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_2').val);   
    let GlobalstrahlungTag3 = (getState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_3').val);   
    let IstSummePvLeistung_kWh = (getState(instanz + PfadEbene1 + PfadEbene2[1] + 'IstSummePvLeistung_kWh').val);
    let ForecastHeute_Dach =[],ForecastMorgen_Dach =[];
    
    //Werte Forecast für jede Dachfläche addieren
    let i = nDachflaechen;
    if (i>0 && i<6){
        while (i > 0) {
            ForecastHeute_Dach[i] = (getState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D'+i+'_heute').val);
            ForecastMorgen_Dach[i] = (getState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D'+i+'_morgen').val);
            if (ForecastHeute_Dach[i] != 0){
                PrognoseForecas_kWh_heute += ForecastHeute_Dach[i];
                PrognoseForecas_kWh_morgen += ForecastMorgen_Dach[i];
            }else{
                PrognoseForecas_kWh_heute = 0;
                PrognoseForecas_kWh_morgen = 0;
                break;
            }
            i--;
        }
    }
    
    PrognoseProplanta_kWh_Tag0 = (GlobalstrahlungTag0 * nModulFlaeche) * (nWirkungsgradModule/100);
    PrognoseProplanta_kWh_Tag1 = (GlobalstrahlungTag1 * nModulFlaeche) * (nWirkungsgradModule/100);
    PrognoseProplanta_kWh_Tag2 = (GlobalstrahlungTag2 * nModulFlaeche) * (nWirkungsgradModule/100);
    PrognoseProplanta_kWh_Tag3 = (GlobalstrahlungTag3 * nModulFlaeche) * (nWirkungsgradModule/100);


    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+Tag0_0, PrognoseProplanta_kWh_Tag0);
    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseFore_kWh_'+Tag0_0, PrognoseForecas_kWh_heute);
    setState(instanz + PfadEbene1 + PfadEbene2[3] + 'PrognoseProp_kWh_heute', PrognoseProplanta_kWh_Tag0);
	setState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_heute', PrognoseForecas_kWh_heute);
    if (Tag1!= 1){
        setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+Tag1_0, PrognoseProplanta_kWh_Tag1);
	    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseFore_kWh_'+Tag1_0, PrognoseForecas_kWh_morgen);
    }
    if (Tag2!= 1){setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+Tag2_0, PrognoseProplanta_kWh_Tag2);}
    if (Tag3!= 1){setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+Tag3_0, PrognoseProplanta_kWh_Tag3);}
    
    setState(instanz + PfadEbene1 + PfadEbene2[3] + 'PrognoseProp_kWh_morgen', PrognoseProplanta_kWh_Tag1);
	setState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_morgen', PrognoseForecas_kWh_morgen);
    if (LogAusgabe){log('Prognose Forecast in kWh = '+ PrognoseForecas_kWh_heute);}
    if (LogAusgabe){log('Prognose Proplanta in kWh = '+ PrognoseProplanta_kWh_Tag0);}

    // Für die Berechnung wird die niedrigere Prognose verwendet die nicht == 0 ist
    if (PrognoseForecas_kWh_heute == 0 && PrognoseProplanta_kWh_Tag0 == 0){
        if (LogAusgabe){log('Prognose für heute konnte nicht abgerufen werden')};
        return null
    }else{
        if (PrognoseForecas_kWh_heute == 0 || PrognoseAnwahl == 1){Prognose_kWh_heute = PrognoseProplanta_kWh_Tag0;}
        if (PrognoseProplanta_kWh_Tag0 == 0 || PrognoseAnwahl == 2){Prognose_kWh_heute = PrognoseForecas_kWh_heute;}
        if (PrognoseForecas_kWh_heute != 0 && PrognoseProplanta_kWh_Tag0 != 0 && PrognoseAnwahl == 0) {
            if (PrognoseForecas_kWh_heute > PrognoseProplanta_kWh_Tag0) {
                Prognose_kWh_heute = PrognoseProplanta_kWh_Tag0;
            }
            if (PrognoseProplanta_kWh_Tag0 > PrognoseForecas_kWh_heute){
                Prognose_kWh_heute = PrognoseForecas_kWh_heute;
            }
        }
    }   
    if (PrognoseForecas_kWh_morgen == 0 && PrognoseProplanta_kWh_Tag1 == 0){
        if (LogAusgabe){log('Prognose für Morgen konnte nicht abgerufen werden')};
        return null
    }else{
        if (PrognoseForecas_kWh_morgen == 0 || PrognoseAnwahl == 1){Prognose_kWh_Tag1 = PrognoseProplanta_kWh_Tag1;}
        if (PrognoseProplanta_kWh_Tag1 == 0 || PrognoseAnwahl == 2){Prognose_kWh_Tag1 = PrognoseForecas_kWh_morgen;}
        if (PrognoseForecas_kWh_morgen != 0 && PrognoseProplanta_kWh_Tag1 != 0 && PrognoseAnwahl == 0) {
            if (PrognoseForecas_kWh_morgen > PrognoseProplanta_kWh_Tag1) {
                Prognose_kWh_Tag1 = PrognoseProplanta_kWh_Tag1;
            }
            if (PrognoseProplanta_kWh_Tag1 > PrognoseForecas_kWh_morgen){
                Prognose_kWh_Tag1 = PrognoseForecas_kWh_morgen;
            }
        }
    } 
    
    // nKorrFaktor abziehen
    Prognose_kWh_heute = (Prognose_kWh_heute/100)*(100-nKorrFaktor)
    Prognose_kWh_Tag1 = (Prognose_kWh_Tag1/100)*(100-nKorrFaktor) 
    Prognose_kWh_Tag2 = (PrognoseProplanta_kWh_Tag2/100)*(100-nKorrFaktor) 
    Prognose_kWh_Tag3 = (PrognoseProplanta_kWh_Tag3/100)*(100-nKorrFaktor) 
    if (LogAusgabe){log('Prognose_kWh nach Abzug Korrekturfaktor  = '+ Prognose_kWh_heute);}
    // nMaxPvLeistungTag_kWh verwenden wenn die Prognose höher ist
    if (Prognose_kWh_heute > nMaxPvLeistungTag_kWh) {Prognose_kWh_heute = nMaxPvLeistungTag_kWh;}
    if (Prognose_kWh_Tag1 > nMaxPvLeistungTag_kWh) {Prognose_kWh_Tag1 = nMaxPvLeistungTag_kWh;}
    if (Prognose_kWh_Tag2 > nMaxPvLeistungTag_kWh) {Prognose_kWh_Tag2 = nMaxPvLeistungTag_kWh;}
    if (Prognose_kWh_Tag3 > nMaxPvLeistungTag_kWh) {Prognose_kWh_Tag3 = nMaxPvLeistungTag_kWh;}

    // nMinPvLeistungTag_kWh verwenden wenn die Prognose niedriger ist
    if (Prognose_kWh_heute < nMinPvLeistungTag_kWh) {Prognose_kWh_heute = nMinPvLeistungTag_kWh;}
    if (Prognose_kWh_Tag1 < nMinPvLeistungTag_kWh) {Prognose_kWh_Tag1 = nMinPvLeistungTag_kWh;}
    if (Prognose_kWh_Tag2 < nMinPvLeistungTag_kWh) {Prognose_kWh_Tag2 = nMinPvLeistungTag_kWh;}
    if (Prognose_kWh_Tag3 < nMinPvLeistungTag_kWh) {Prognose_kWh_Tag3 = nMinPvLeistungTag_kWh;}

    // Bereits produzierte PV-Leistung muss von der Tagesprognose abgezogen werden
    Prognose_kWh_heute = Prognose_kWh_heute-IstSummePvLeistung_kWh;
    if (LogAusgabe){log('Bereits produzierte PV-Leistung  = '+IstSummePvLeistung_kWh);}


    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+Tag0_0, Prognose_kWh_heute+IstSummePvLeistung_kWh);
    setState(instanz + PfadEbene1 + PfadEbene2[1] + 'PrognoseBerechnung_kWh_heute', Prognose_kWh_heute);
    if (Tag1!= 1){setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+Tag1_0, Prognose_kWh_Tag1);}
    if (Tag2!= 1){setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+Tag2_0, Prognose_kWh_Tag2);}
    if (Tag3!= 1){setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+Tag3_0, Prognose_kWh_Tag3);}
    if (LogAusgabe){log('Prognose_kWh_heute für Berechnung = '+Prognose_kWh_heute);}
    
}; 


// Die Funktion berechnet den Überschuss anhand der PrognoseBerechnung_kWh_heute 
// nach Abzug von Eigenverbrauch und Ladekapazität des Batteriespeicher.
function Ueberschuss_Prozent()
{
    log('Start Ueberschuss_Prozent');
    let Ueberschuss_Prozent = 0,Ueberschuss_kWh = 0,FreieKapBatterie_kWh = 0;
    let Rest_Eigenverbrauch_kWh = getState(sIDEigenverbrauchTag).val;
	let nEigenverbrauchTag = getState(sIDEigenverbrauchTag).val;
    let Prognose_kWh = getState(instanz + PfadEbene1 + PfadEbene2[1] + 'PrognoseBerechnung_kWh_heute').val;
    let AktSpeicherSoC = getState(sID_Batterie_SOC).val;
    var dStart = new Date(0, 0, 0, 6,0,0, 0);
    var dAkt = new Date();
     //Vom nEigenverbrauch Tag von 6:00 bis 19:00 Uhr bereits verbrauchte kWh abziehen
    if (toInt(dAkt.getHours()) < 19 && toInt(dAkt.getHours())>6){
        let Diff_Minuten = (dAkt.getMinutes()- dStart.getMinutes())+((dAkt.getHours()- dStart.getHours())*60)
        Rest_Eigenverbrauch_kWh = nEigenverbrauchTag-((nEigenverbrauchTag/780)*Diff_Minuten);
    }

    var d = new Date(0, 0, 0, 6,0,0, 0);
    let Minuten = d.getMinutes()
    FreieKapBatterie_kWh = Batterie_kWh(AktSpeicherSoC);
    if (Prognose_kWh != null){
        Ueberschuss_kWh =(Prognose_kWh - Rest_Eigenverbrauch_kWh)- FreieKapBatterie_kWh;
	    if (Ueberschuss_kWh < 0){Ueberschuss_kWh = 0;}
        Ueberschuss_Prozent = BatterieProzent(Ueberschuss_kWh);
	    if (Ueberschuss_Prozent>100){Ueberschuss_Prozent=100;}
        if (LogAusgabe){log('Berechneter Eigenverbrauch = '+Rest_Eigenverbrauch_kWh);}
        if (LogAusgabe){log('AktSpeicherSoC in % = '+AktSpeicherSoC);}
	    if (LogAusgabe){log('FreieKapBatterie_kWh = '+FreieKapBatterie_kWh);}
        if (LogAusgabe){log('Ueberschuss in kWh = '+Ueberschuss_kWh);}
        if (LogAusgabe){log('Ueberschuss in Prozent = '+Ueberschuss_Prozent);}
        log('ende Ueberschuss_Prozent');
        return round(Ueberschuss_Prozent, 0);
    
    }else{
        if (DebugAusgabe){log('PrognoseBerechnung_kWh_heute Variable hat keinen Wert');}
        log('ende Ueberschuss_Prozent null');
        return null
    }
}

// materialdesing JSON Chart Werte speichern
function makeJson(){
    let chart = {}
    let values1 = [], values2 = [], values3 = [], values4 = [], axisLabels = [];
    let akkPV_Leistung, akkProgFore, akkProgProp, akkProgAuto;
    let date = new Date();
	let mm = date.getMonth() + 1;
    let MM = zeroPad(mm,2);
    for (let i = 1; i <= 31; i++) {
	    let n= zeroPad(i,2);
        akkPV_Leistung = getState(instanz + PfadEbene1 + PfadEbene2[2] + 'IstPvLeistung_kWh_' + n).val
        akkProgFore = getState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseFore_kWh_' + n).val
        akkProgProp = getState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_' + n).val
        akkProgAuto = getState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_' + n).val
            
        values1.push(akkProgAuto)
        values2.push(akkProgFore)
        values3.push(akkProgProp)
        values4.push(akkPV_Leistung)
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
                datalabel_show: false,
                datalabel_borderRadius: 15,
                datalabel_offset: -12,
                datalabel_steps: 3,
                color: 'blue',
                line_PointColor: 'blue',
                line_PointColorBorder: 'blue',
                line_pointSize: 2,
                line_Thickness: 2,
                line_pointStyle: 'triangle',
                line_UseFillColor: false,
                legendText: 'Prognose Forecast',
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
                data: values4,
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
    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_'+MM,JSON.stringify(chart),true);
    if (DebugAusgabe){log('JSON History ertellt');}
}

// Funktion erstellt eine Sicherungsdatei der History JSON vom letzten Monat
function writelog() {
    let date = new Date();
	let mm = date.getMonth();
    if (mm == 0){mm = 12}
    let MM = zeroPad(mm,2);
    let Jahr = date.getFullYear()
    let string =MM +"."+ Jahr +"\n"+ getState(instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_'+MM).val+"\n";
    if ( logflag === true) {
        fs.readFile(sLogPath, 'utf8', function(err,data){ 
            if (!err) {  
                fs.appendFileSync(sLogPath, string );
            }else{
                if(logflag)log("History lokal sichern: Routine writelog - Logfile nicht gefunden - wird angelegt");
                fs.writeFileSync(sLogPath, string );
            }
        });       
    } ; 
    setState(sID_AnzeigeHistoryMonat,date.getMonth()+1); // Anzeige VIS auf aktuelles Monat einstellen
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
function e3dcConfigWrite(i)
{    
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
    fs.writeFile(sPfadE3DC , string, (err) => {
	    if (err) throw err;
		console.log('E3DC Config Datei gespeichert!');
		setState(instanz + PfadEbene1 + PfadEbene2[1] + 'DatenSchreiben',false);
	});
};

// Einlesen der Werte e3dc.config.txt
function e3dcConfigRead()  
{
    let Parameter = ['einspeiselimit','untererLadekorridor','obererLadekorridor',
    'minimumLadeleistung','maximumLadeleistung','wrleistung','ladeschwelle','ladeende',
    'ladeende2','winterminimum','sommermaximum','sommerladeende','speichergroesse','unload',
    'htmin','htsockel','hton','htoff','htsat','htsun','debug','wallbox','wbmode','wbminlade','peakshave']
    let StateParameter = ['Einspeiselimit','UntererLadekorridor','ObererLadekorridor',
    'MinimumLadeleistung','MaximumLadeleistung','Wrleistung','Ladeschwelle','Ladeende',
    'Ladeende2','Winterminimum','Sommermaximum','Sommerladeende','Speichergroesse','Unload',
    'HTmin','HTsockel','HTon','HToff','HTsat','HTsun','Debug','Wallbox','WBmode','WBminLade','Peakshave']
    fs.readFile(sPfadE3DC, 'utf8', function(err, data) {
        if (err) throw err;
        data = data.replace(/\n/g, " ");
        data = data.replace("//", " ");
        let SrtingSplit = data.split(' ');
        for (let i in Parameter) {
            var idx = SrtingSplit.indexOf(Parameter[i]);
            if (idx != -1){            
                setState(instanz + PfadEbene1 + PfadEbene2[0]+StateParameter[i], SrtingSplit[idx+2]);
            }else{
                if (LogAusgabe){log('Parameter '+Parameter[i]+' wurde nicht gefunden')};
            }
        }
        console.log('E3DC Config Datei eingelesen!');
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'DatenLesen',false);
    });

};



// Einlesen der aktuellen Werte ioBroker
function StateRead() 
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
    sPeakshave = getState(instanz + PfadEbene1 + PfadEbene2[0]+'Peakshave').val;
}

//InterrogateForecast(2,2);
// Prognose forecast PV-Leistung in W je Dachfläche abrufen.Wenn die Seite nicht erreichbar ist,
// oder kein Wert nach der zweiten Abfrage zurückgegeben wird,ist der Rückgabewert=0.
function InterrogateForecast(DachFl,AnzWiederholungen) 
{
    try {
        xhr.abort();
        if (DachFl > 0 && DachFl <= 5 ){
			xhr.open("GET","https://api.forecast.solar/estimate/watthours/day/"+nLatitude+"/"+nLongitude+"/"+nDeclination[DachFl]+"/"+nAzimuth[DachFl]+"/"+nPower_kWp[DachFl], true);
			xhr.responseType = "json";
			xhr.send();
        }
		
	}
    catch(Fehler1){
        xhr.abort();
        log ('Catch in der function InterrogateForecast aktiv. Fehler = '+Fehler1, 'warn')
         
    }
       
    //wird aufgerufen wenn xhr.send erfolgreich abgeschlossen wurde
	xhr.onload = function (){
        let Response1,Response2;
	    log('Rueckmeldung :' + xhr.responseText)
        const obj = JSON.parse(xhr.responseText);
        if (obj.result != null){
            
            if (DachFl > 0 && DachFl <= 5 ){
		        Response1 = obj.result[getCurrentDate()];
		        Response2 = obj.result[nextDayDate()];
                if (Response1 === undefined || Response2 === undefined){
                    xhr.abort();
                    if (AnzWiederholungen>0){InterrogateForecast(DachFl,AnzWiederholungen-1);}
                }else{
                    setState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D'+ DachFl +'_heute',Response1/1000);
                    setState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D'+ DachFl +'_morgen',Response2/1000);
                    log('Gespeichert wurde Dachfläche ='+DachFl+'/'+AnzWiederholungen+' : '+Response1+' :'+Response2);
                }
            }
        }else{
            log('Es konnten keine Daten von Forecast abgerufen werden  '+obj.result,'warn');    
        }
	}
}

// Prognose Proplanta Globalstrahlung abrufen.Wenn die Seite nicht erreichbar ist,
// oder kein Wert nach der zweiten Abfrage zurückgegeben wird,ist der Rückgabewert=0.
function InterrogateProplanta(AnzWiederholungen) {
    if (baseurl == null || typeof baseurl === undefined) {
        log('flasche Länderbezeichnung!');
    }else{
        baseurl = baseurl.replace(/#PLZ#/ig, ProplantaPlz).replace(/#ORT#/ig, ProplantaOrt);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_0', 0);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_1', 0);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_2', 0);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_3', 0);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_0', 'null');
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_1', 'null');
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_2', 'null');
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_3', 'null');
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_12', 200);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_15', 200);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_0', 200);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_1', 200);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_2', 200);
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_3', 200);   
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_0', 200);   
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_1', 200);     
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_2', 200);  
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_3', 200);
        try {
            xhrProplanta.abort();
            xhrProplanta.open("GET",baseurl, true);
		    xhrProplanta.responseType = "text";
		    xhrProplanta.send();
	    }
  
        catch(Fehler){
            xhrProplanta.abort();
            log ('Catch in der function InterrogateProplanta aktiv. Fehler = '+Fehler, 'warn')
        }
    }
    //wird aufgerufen wenn xhrProplanta.send erfolgreich abgeschlossen wurde
	xhrProplanta.onload = function () 
	{
        // nicht benötigte HTML Daten löschen
        let Data = xhrProplanta.responseText
        
        //Alles bis max. Temperatur löschen
        let idx = Data.indexOf('<tr id="TMAX" class="">');
        Data = Data.replace(Data.substring(0, idx), "");
        
        // Von min. Temp. der darauf folgenden Nacht bis Globalstrahlung löschen
        let idx1 = Data.indexOf('<tr id="NMIN" class="">');
        let idx2 = Data.indexOf('Globalstrahlung');
        Data = Data.replace(Data.substring(idx1, idx2), "");
        
        // Von Wetterzustand bis Bedeckungsgrad löschen
        idx1 = Data.indexOf('<tr id="WETTERZUSTAND">');
        idx2 = Data.indexOf('<tr id="BEDECKUNGSGRAD">');
        Data = Data.replace(Data.substring(idx1, idx2), "");
        
        // Von Windrichtungkompass bis letzte Aktualisierung löschen
        idx1 = Data.indexOf('<tr class="WINDRICHTUNGKOMPASS">');
        idx2 = Data.indexOf('letzte');
        Data = Data.replace(Data.substring(idx1, idx2), "");
        
        // Nach der letzten Uhrzeit "letzte Aktualisierung" bis zum Ende löschen
        idx = Data.indexOf('Uhr');
        Data = Data.replace(Data.substring(idx+45, Data.length), "");
        
        // HTML Tags löschen und Daten bereinigen
        Data=HTML_CleanUp(Data);

        // Array aus restlichen Daten erstellen     
        let SrtingSplit = Data.split('|');

        // Alle Werte löschen die leer sind       
        let result = SrtingSplit.filter(function(e){ return e.replace(/(\r\n|\n|\r)/gm,"")});
        
        // Restlichen Werte die nicht benötigt werden entfernen
        result.splice(5,5)
        result.splice(10,5)
        result.splice(15,2)
        result.splice(60,2)
        if (DebugAusgabe){
            for (let i in result) {
                log("i ="+i+' Wert=' + result[i]);
            }
        } 
        // Prüfen ob Globalstrahlung für heute in eine Zahl umgewandelt werden kann,wenn nicht noch mal nach 1 min. abrufen
        if (isNaN(parseFloat(result[11]))){
            setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_0', 0);
            xhr.abort();
            if (AnzWiederholungen>0){
                setTimeout(function(){InterrogateProplanta(AnzWiederholungen-1);},60000);
            }
        }else{
            setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_0', parseFloat(result[11]));
        } 
        // Prüfen ob Werte in eine Zahl umgewandelt werden können,wenn nicht 0 zuweisen     
        if (isNaN(parseFloat(result[12]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_1', 0);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_1', parseFloat(result[12]));}      
        if (isNaN(parseFloat(result[13]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_2', 0);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_2', parseFloat(result[13]));}      
        if (isNaN(parseFloat(result[14]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_3', 0);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Globalstrahlung_Tag_3', parseFloat(result[14]));}      
        if (isNaN(parseFloat(result[41]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_12', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_12', parseFloat(result[41]));}      
        if (isNaN(parseFloat(result[46]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_15', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Bewoelkungsgrad_15', parseFloat(result[46]));}      
        if (isNaN(parseFloat(result[1]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_0', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_0', parseFloat(result[1]));}      
        if (isNaN(parseFloat(result[2]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_1', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_1', parseFloat(result[2]));}      
        if (isNaN(parseFloat(result[3]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_2', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_2', parseFloat(result[3]));}      
        if (isNaN(parseFloat(result[4]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_3', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Max_Temperatur_Tag_3', parseFloat(result[4]));}      
        if (isNaN(parseFloat(result[6]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_0', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_0', parseFloat(result[6]));}      
        if (isNaN(parseFloat(result[7]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_1', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_1', parseFloat(result[7]));}      
        if (isNaN(parseFloat(result[8]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_2', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_2', parseFloat(result[8]));}      
        if (isNaN(parseFloat(result[9]))){setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_3', 200);}else{setState(instanz + PfadEbene1 + PfadEbene2[3]+'Min_Temperatur_Tag_3', parseFloat(result[9]));}      
        

        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_0', result[16].slice(0, 11));
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_1', result[17].slice(0, 11));
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_2', result[18].slice(0, 11));
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'Datum_Tag_3', result[19].slice(0, 11));
        setState(instanz + PfadEbene1 + PfadEbene2[3]+'NaesteAktualisierung',result[60].slice(64, 69).replace(".",":"));
        setTimeout(function(){main();},12000); //Zeit wird benötigt um alle Werte sicher zu speichern bevor main ausgeführt wird
    }
}

// HTML Tags löschen und Daten bereinigen
function HTML_CleanUp(data) {
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

// Liefert das Datum vom nächsten Tag im Format yyyy-mm-dd
function nextDayDate(nextDay) {
    if (!nextDay) {
	    nextDay = new Date();
	}
    nextDay.setDate(nextDay.getDate() + 1);
    let mm = nextDay.getMonth() + 1;
    let dd = nextDay.getDate();
    let yyyy = nextDay.getFullYear();
    let MM = zeroPad(mm,2);
    let DD = zeroPad(dd,2);
    return yyyy + '-' + MM + '-' + DD;
}


// Liefert das Datum im Format yyyy-mm-dd
function getCurrentDate(date) {
    if (!date) {
	    date = new Date();
	}
	let today = date;
	let dd = today.getDate();
	let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();
	let DD = zeroPad(dd,2);
    let MM = zeroPad(mm,2);
    return yyyy + '-' + MM + '-' + DD;
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
function SummePvLeistung(){   
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
	setState(instanz + PfadEbene1 + PfadEbene2[2] + 'IstPvLeistung_kWh_'+ TagHeute_0, IstPvLeistung_kWh);
    setState(instanz + PfadEbene1 + PfadEbene2[1] + 'IstSummePvLeistung_kWh', IstPvLeistung_kWh);
    
    setTimeout(function(){makeJson();},300);
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

// Daten Proplanta 10 min. nach aktualisierung Webseite abholen 
function ScheduleProplanta(){
    if(Timer2){clearSchedule(Timer2)};
    let StateZeit = getState(instanz + PfadEbene1 + PfadEbene2[3] + 'NaesteAktualisierung').val;
    if (StateZeit != null){
        StateZeit = addMinutes(StateZeit, 10)
        let t = StateZeit.split(':')
        Timer2 = schedule({hour: t[0], minute: t[1]}, function(){InterrogateProplanta(2);});
    }else{
        Timer2 = schedule({hour: 5, minute: 25}, function(){InterrogateProplanta(2);});
        log('Nächste Aktualisierung Standardzeit')
    }
}

// Daten Forecast jede Stunde von 4:10 Uhr bis 10:20 aktualisieren
function SheduleForecast(){
    if(Timer3){clearSchedule(Timer3)};
    Timer3 = schedule('{"time":{"start":"04:10","end":"10:20","mode":"hours","interval":1},"period":{"days":1}}', function(){
        let i = nDachflaechen;
        TimerForecast = setInterval(CallForecast, 5000);
        for (let i = 1; i <= 5; i++) {
            setState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D'+ i +'_heute',0);
            setState(instanz + PfadEbene1 + PfadEbene2[4] + 'PrognoseFore_kWh_D'+ i +'_morgen',0);
        }
        function CallForecast() {
	        log('*************************** Es wurde Dach '+i+' abgerufen **********************************');
            InterrogateForecast (i,2);
	        i--;
	        if ( i < 1 ) {
                clearInterval(TimerForecast);
                setTimeout(function(){main();},5000); //Zeit wird benötigt bevor main ausgeführt wird
            }
        }
    });
}

// Zeitformat UTC dezimal in MEZ Uhrzeit 
function UTC_Dezimal_to_MEZ(){
    let UTC_Dez_Minuten='';
    let UTC_Dez_Stunden ='';
    let MEZ_Zeit =[];
    let MESZ_Zeit =[];
    let nWinterminimum = (parseFloat(getState(instanz + PfadEbene1 + PfadEbene2[0] + 'Winterminimum').val)).toFixed(2);
    let nSommermaximum = (parseFloat(getState(instanz + PfadEbene1 + PfadEbene2[0] + 'Sommermaximum').val)).toFixed(2);
    let nSommerladeende = (parseFloat(getState(instanz + PfadEbene1 + PfadEbene2[0] + 'Sommerladeende').val)).toFixed(2);
    let nHTon = (parseFloat(getState(instanz + PfadEbene1 + PfadEbene2[0] + 'HTon').val)).toFixed(2);
    let nHToff = (parseFloat(getState(instanz + PfadEbene1 + PfadEbene2[0] + 'HToff').val)).toFixed(2);
    

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
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Winterminimum_MEZ',MESZ_Zeit[0]);
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommermaximum_MEZ',MESZ_Zeit[1]);
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommerladeende_MEZ',MESZ_Zeit[2]);
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'HTon_MEZ',MESZ_Zeit[3]);
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'HToff_MEZ',MESZ_Zeit[4]);
    }else{
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Winterminimum_MEZ',MEZ_Zeit[0]);
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommermaximum_MEZ',MEZ_Zeit[1]);
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Sommerladeende_MEZ',MEZ_Zeit[2]);
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'HTon_MEZ',MEZ_Zeit[3]);
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'HToff_MEZ',MEZ_Zeit[4]);

    }
    
}


// Zeiten Start und Ende E3DC-Control Regelung von eba
function MEZ_Regelzeiten(){
    let dAkt = new Date();
    let jjjj= dAkt.getFullYear();
    let dStart = new Date(jjjj+',1,1');
    // @ts-ignore
    let tm_yday = Math.round(Math.abs(dAkt - dStart) / (1000 * 60 * 60 * 24 ));
    let ZeitAnwahl_MEZ_MESZ = getState(sID_Anwahl_MEZ_MESZ).val
    
    let nWinterminimum = parseFloat(getState(instanz + PfadEbene1 + PfadEbene2[0] + 'Winterminimum').val);
    let nSommermaximum = parseFloat(getState(instanz + PfadEbene1 + PfadEbene2[0] + 'Sommermaximum').val);
    let nSommerladeende = parseFloat(getState(instanz + PfadEbene1 + PfadEbene2[0] + 'Sommerladeende').val);
    
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
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Regelbeginn_MEZ',addMinutes(tRegelbeginn_Stunden+':'+tRegelbeginn_Minuten,120));
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Regelende_MEZ',addMinutes(tRegelende_Stunden+':'+tRegelende_Minuten,120));
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Ladeende_MEZ',addMinutes(tLadeende_Stunden+':'+tLadeende_Minuten,120));
    }else{
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Regelbeginn_MEZ',addMinutes(tRegelbeginn_Stunden+':'+tRegelbeginn_Minuten,60));
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Regelende_MEZ',addMinutes(tRegelende_Stunden+':'+tRegelende_Minuten,60));
        setState(instanz + PfadEbene1 + PfadEbene2[1] + 'Ladeende_MEZ',addMinutes(tLadeende_Stunden+':'+tLadeende_Minuten,60));
    }
    
    //if (DebugAusgabe){
        log('RB = '+tRegelbeginn_Stunden+':'+tRegelbeginn_Minuten);
        log('RE = '+tRegelende_Stunden+':'+tRegelende_Minuten);
        log('LE = '+tLadeende_Stunden+':'+tLadeende_Minuten);
    //}
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
				merker0 = true;
				if(LogAusgabe)log('minütlicher Schedule gestoppt');
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
				merker1 = true;
				if(LogAusgabe)log('minütlicher Schedule gestoppt');
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
		if(merker0)Wh_Leistungsmesser0();
		merker0 = false;
		count0 ++
		Summe0 = Summe0 + Leistung;
		//if(DebugAusgabe)log(['Summe: ' + Summe0, ' Zaehler: '+count0, ' Addition: + ' +Leistung ].join(''));
    }
});
 
 // Zaehler LM1
on(sID_PvLeistungLM1_W, function(obj) {
    let Leistung = Math.abs(getState(obj.id).val);
    if(Leistung > 0){
		if(merker1)Wh_Leistungsmesser1();
		merker1 = false;
		count1 ++
		Summe1 = Summe1 + Leistung;
		//if(DebugAusgabe)log(['Summe: ' + Summe1, ' Zaehler: '+count1, ' Addition: + ' +Leistung ].join(''));
    }
});

// Wird aufgerufen wenn State Automatik in VIS geändert wird
on({id: sID_Automatik}, function (obj){
	 AutomatikAnwahl = getState(obj.id).val;
     if(AutomatikAnwahl) {
        if (LogAusgabe){log('Automatik gestartet');}
        setState(sID_EinstellungAnwahl,0);
        main();
    }else{
        if (LogAusgabe){log('Automatik gestoppt');}
    }
});  

// Bei Änderung Eigenverbrauch soll der Überschuss neu berechnet werden.
on({id: sIDEigenverbrauchTag}, function (obj){
	if (LogAusgabe){log('Wert Eigenverbrauch wurde auf '+getState(obj.id).val+' kWh geändert');}
    main();
});  


// Wird aufgerufen wenn State HistorySelect in VIS geändert wird
on({id: sID_AnzeigeHistoryMonat}, function (obj){
	let Auswahl = getState(obj.id).val
    let Auswahl_0 = zeroPad(Auswahl,2);
    if (Auswahl<=12){
        let JsonString = getState(instanz +PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_' +Auswahl_0).val;
        setState(instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON',JsonString);
    }else{
        log('State '+instanz + PfadEbene1 + PfadEbene2[2] + 'HistorySelect darf nicht > 12 sein ','warn');
    }
}); 

// e3dc.config.txt mit den aktuellen Werten neu schreiben wenn in VIS State DatenSchreiben = true
on({id: instanz + PfadEbene1 + PfadEbene2[1] + 'DatenSchreiben', val: true, change:'ne'}, function (){
	StateRead();
	setTimeout(function() { e3dcConfigWrite(0);},500);
    setTimeout(e3dcConfigRead, 1500);
});

// Einlesen der Werte e3dc.config.txt wenn in VIS State DatenLesen = true 
on({id: instanz + PfadEbene1 + PfadEbene2[1] + 'DatenLesen', val: true, change:'ne'}, function (obj){
	e3dcConfigRead();
});

// Wird aufgerufen wenn sich an den States HistoryJSON_xx was ändert um in VIS immer das aktuelle 
// Diagramm anzuzeigen
on({id: /\.HistoryJSON_/, change: "ne"}, function (){	
    let Auswahl = getState(sID_AnzeigeHistoryMonat).val;
    let Auswahl_0 = zeroPad(Auswahl,2);
    if (Auswahl<=12){
        let JsonString = getState(instanz +PfadEbene1 + PfadEbene2[2] + 'HistoryJSON_' +Auswahl_0).val;
        setState(instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON',JsonString);
        //if (LogAusgabe){log('HistoryJSON_'+ Auswahl_0 + ' wurde unter HistoryJSON gespeichert');}
    }else{
        log('State '+instanz + PfadEbene1 + PfadEbene2[2] + 'HistorySelect darf nicht > 12 sein ', 'warn');
    }
});

// manuelle Änderung der ME(S)Z Zeitanzeige in VIS
on({id: sID_Anwahl_MEZ_MESZ, change: "ne"}, function (obj){
    ZeitAnwahl_MEZ_MESZ = getState(obj.id).val
    UTC_Dezimal_to_MEZ();
    MEZ_Regelzeiten();
});

// ME(S)Z Zeiten in VIS aktualisieren wenn sich eine Einstellung ändert
on({id: instanz + PfadEbene1 + PfadEbene2[0] + 'Winterminimum', change: "ne"}, function (){UTC_Dezimal_to_MEZ();});
on({id: instanz + PfadEbene1 + PfadEbene2[0] + 'Sommermaximum', change: "ne"}, function (){UTC_Dezimal_to_MEZ();});
on({id: instanz + PfadEbene1 + PfadEbene2[0] + 'Sommerladeende', change: "ne"}, function (){UTC_Dezimal_to_MEZ();});
on({id: instanz + PfadEbene1 + PfadEbene2[0] + 'HTon', change: "ne"}, function (){UTC_Dezimal_to_MEZ();});
on({id: instanz + PfadEbene1 + PfadEbene2[0] + 'HToff', change: "ne"}, function (){UTC_Dezimal_to_MEZ();});

// Daten Proplanta 10 min. nach aktualisierung Webseite abholen 
on({id: instanz + PfadEbene1 + PfadEbene2[3] + 'NaesteAktualisierung', change: "ne"}, function (obj){
    if(getState(sID_PrognoseAnwahl).val != 2) {
        ScheduleProplanta();
    }
});

// Bei Änderung der PrognoseAnwahl, Einstellung 0-2 in VIS, jeweilige Prognose abrufen
on({id: sID_PrognoseAnwahl, change: "ne"}, function(obj) {
    PrognoseAnwahl = getState(obj.id).val
    if(LogAusgabe && PrognoseAnwahl == 0){log("Proplanta und Forecast angewählt")};
    if(LogAusgabe && PrognoseAnwahl == 1){log("Proplanta angewählt")};
    if(LogAusgabe && PrognoseAnwahl == 2){log("Forecast angewählt")};
    main();
});

// Bei Betättigung der Button Einstellung 1-5 in VIS jeweilige Einstellung laden und automatik ausschalten
on({id: sID_EinstellungAnwahl, change: "ne"}, function (obj){
    EinstellungAnwahl = getState(obj.id).val
    if (EinstellungAnwahl !=0){
        setState(sID_Automatik,false,true);
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


//Diagramm für stevie77 um 22 Uhr aktualisieren
schedule({hour: 22, minute: 1}, function(){setTimeout(function(){makeJson();},300);});

// jeden Monat am 1 History Daten Tag aktuelles Monat Löschen
schedule("0 0 1 * *", function() {
   for (let i = 1; i <= 31; i++) {
        let n = zeroPad(i,2);
        setState(instanz + PfadEbene1 + PfadEbene2[2] + 'IstPvLeistung_kWh_'+ n, 0);
        setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseProp_kWh_'+ n, 0);
	    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseFore_kWh_'+ n, 0);
	    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'PrognoseAuto_kWh_'+ n, 0);
    }
    setTimeout(function(){writelog();},60*1000);
});

// Automatische Umschaltung von MEZ / MESZ
schedule("0 4 24-31 3,10 7", function() {
    setState(sID_Anwahl_MEZ_MESZ, dst());  /*true = MESZ ,false = MEZ*/
    if(LogAusgabe)log('MESZ Status '+dst);
});

// jeden Tag um 00:01 Tageswert nullen.
schedule({hour: 0, minute: 1}, function () { 
	setState(sID_PVErtragLM0,0,true);
	setState(sID_PVErtragLM1,0,true);
	if (LogAusgabe)log('Tagesertragswert auf 0 gesetzt');
});