'use strict';
//------------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++++
const LogparserSyntax = true                                                                            // Wenn true wird die LOG Ausgabe an Adapter Logparser angepasst
const instanzE3DC_RSCP = 'e3dc-rscp.0'                                                                 	// Instanz e3dc-rscp Adapter

const instanz = '0_userdata.0';                                                                        	// Instanz Script Charge-Control
let PfadEbene1 = 'Charge_Control';                                                                     	// Pfad innerhalb der Instanz
let PfadEbene2 = ['Parameter','Allgemein','History','Proplanta','USER_ANPASSUNGEN']                		// Pfad innerhalb PfadEbene1

//++++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN +++++++++++++++++++++++++++++++++++++++
//------------------------------------------------------------------------------------------------------

//******************************************************************************************************
//**************************************** Deklaration Variablen ***************************************
//******************************************************************************************************
let Logparser1 ='',Logparser2 ='';
if (LogparserSyntax){Logparser1 ='##{"from":"Charge-Control", "message":"';Logparser2 ='"}##'}
log(`${Logparser1} -==== Charge-Control Version 1.2.9 ====- ${Logparser2}`);
//******************************************* Modul e3dc.rscp ******************************************
const sID_Batterie_SOC =`${instanzE3DC_RSCP}.EMS.BAT_SOC`;                                              // aktueller Batterie_SOC
const sID_PvLeistung_E3DC_W =`${instanzE3DC_RSCP}.EMS.POWER_PV`;                                        // aktuelle PV_Leistung
const sID_PvLeistung_ADD_W =`${instanzE3DC_RSCP}.EMS.POWER_ADD`;                                        // Zusätzliche Einspeiser Leistung
const sID_Power_Home_W =`${instanzE3DC_RSCP}.EMS.POWER_HOME`;                                           // aktueller Hausverbrauch
const sID_Power_Wallbox_W =`${instanzE3DC_RSCP}.EMS.POWER_WB_ALL`;                                      // aktuelle Wallbox Leistung
const sID_Power_Bat_W = `${instanzE3DC_RSCP}.EMS.POWER_BAT`;                                            // aktuelle Batterie_Leistung'
const sID_Installed_Peak_Power =`${instanzE3DC_RSCP}.EMS.INSTALLED_PEAK_POWER`;                         // Wp der installierten PV Module
const sID_Bat_Discharge_Limit =`${instanzE3DC_RSCP}.EMS.SYS_SPECS.maxBatDischargPower`;                 // Batterie Entladelimit
const sID_Bat_Charge_Limit =`${instanzE3DC_RSCP}.EMS.SYS_SPECS.maxBatChargePower`;                      // Batterie Ladelimit
const sID_startDischargeDefault =`${instanzE3DC_RSCP}.EMS.SYS_SPECS.startDischargeDefault`;             // Anfängliche Entladeleistung Standard
const sID_Notrom_Status =`${instanzE3DC_RSCP}.EMS.EMERGENCY_POWER_STATUS`;                              // 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
const sID_SPECIFIED_Battery_Capacity_0 =`${instanzE3DC_RSCP}.BAT.BAT_0.SPECIFIED_CAPACITY`;             // Installierte Batterie Kapazität Batteriekreis 0
const sID_SPECIFIED_Battery_Capacity_1 =`${instanzE3DC_RSCP}.BAT.BAT_1.SPECIFIED_CAPACITY`;             // Installierte Batterie Kapazität Batteriekreis 1


const sID_SET_POWER_MODE =`${instanzE3DC_RSCP}.EMS.SET_POWER_MODE`;                                     // Lademodus
const sID_SET_POWER_VALUE_W =`${instanzE3DC_RSCP}.EMS.SET_POWER_VALUE`;                                 // Eingestellte Ladeleistung
const sID_Max_wrleistung_W =`${instanzE3DC_RSCP}.EMS.SYS_SPECS.maxAcPower`;                             // Maximale Wechselrichter Leistung
const sID_Einspeiselimit_Pro =`${instanzE3DC_RSCP}.EMS.DERATE_AT_PERCENT_VALUE`;                        // Eingestellte Einspeisegrenze E3DC in Prozent
const sID_BAT0_Alterungszustand =`${instanzE3DC_RSCP}.BAT.BAT_0.ASOC`;                                  // Batterie ASOC e3dc-rscp
const sID_Max_Discharge_Power_W =`${instanzE3DC_RSCP}.EMS.MAX_DISCHARGE_POWER`;                         // Eingestellte maximale Batterie-Entladeleistung. (Variable Einstellung E3DC)
const sID_Max_Charge_Power_W =`${instanzE3DC_RSCP}.EMS.MAX_CHARGE_POWER`;                               // Eingestellte maximale Batterie-Ladeleistung. (Variable Einstellung E3DC)
const sID_DISCHARGE_START_POWER =`${instanzE3DC_RSCP}.EMS.DISCHARGE_START_POWER`;                       // Anfängliche Batterie-Entladeleistung
const sID_PARAM_EP_RESERVE_W =`${instanzE3DC_RSCP}.EP.PARAM_0.PARAM_EP_RESERVE_W`;                      // Eingestellte Notstrom Reserve E3DC

const fsw = require('fs');
// @ts-ignore
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
let xhr = new XMLHttpRequest();
let xhr2 = new XMLHttpRequest();

let Resource_Id_Dach=[];
let sID_UntererLadekorridor_W =[],sID_Ladeschwelle_Proz =[],sID_Ladeende_Proz=[],sID_Ladeende2_Proz=[],sID_RegelbeginnOffset=[],sID_RegelendeOffset=[],sID_LadeendeOffset=[],sID_Unload_Proz=[];
let logflag,sLogPath,LogAusgabe,DebugAusgabe,LogAusgabeRegelung,Offset_sunriseEnd_min,minWertPrognose_kWh;
let country,ProplantaOrt,ProplantaPlz,BewoelkungsgradGrenzwert;
let Solcast,SolcastDachflaechen,SolcastAPI_key,Entladetiefe_Pro,Systemwirkungsgrad_Pro;
let nModulFlaeche,nWirkungsgradModule,nKorrFaktor,nMinPvLeistungTag_kWh,nMaxPvLeistungTag_kWh;     
let bStart = true,bM_Notstrom = false,bScheduleGestoppt = false;

const sID_Saved_Power_W =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Saved_Power_W`;             // Leistung die mit Charge-Control gerettet wurde
const sID_PVErtragLM2 =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Saved_PowerLM2_kWh`;          // Leistungszähler für PV Leistung die mit Charge-Control gerettet wurde
const sID_Automatik_Prognose =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Automatik`;            // true = automatik false = manuell
const sID_Automatik_Regelung =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Automatik_Regelung`;   // true = automatik false = manuell
const sID_NotstromAusNetz =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.NotstromAusNetz`;         // true = Notstrom aus Netz nachladen 
const sID_EinstellungAnwahl =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EinstellungAnwahl`;     // Einstellung 1-5
const sID_PVErtragLM0 =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstPvErtragLM0_kWh`;          // Leistungszähler PV-Leistung
const sID_PVErtragLM1 =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstPvErtragLM1_kWh`;          // Leistungszähler zusätzlicher WR (extern)
const sID_PVErtragLM3 =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchAbend_kWh`;     // Leistungszähler Eigenverbrauch von 0:00 Uhr bis 8:00 Uhr
const sID_PrognoseAnwahl =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseAnwahl`;           // Aktuelle Einstellung welche Prognose für Berechnung verwendet wird
const sID_EigenverbrauchDurchschnitt_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchDurchschnitt_kWh`; // Durchschnittlicher Eigenverbrauch von 0:00 Uhr bis 8:00 Uhr
const sID_EigenverbrauchTag =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchTag`;     // Einstellung täglicher Eigenverbrauch in VIS oder über anderes Script
const sID_AnzeigeHistoryMonat =`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistorySelect`;       // Umschaltung der Monate im View Prognose in VIS 
const sID_Regelbeginn_MEZ =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Regelbeginn_MEZ`;         // Berechneter Regelbeginn in MEZ Zeit
const sID_Regelende_MEZ =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Regelende_MEZ`;
const sID_Ladeende_MEZ =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Ladeende_MEZ`;
const sID_Notstrom_min_Proz =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Notstrom_min`;
const sID_Notstrom_sockel_Proz =`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Notstrom_sockel`;
const sID_Notstrom_akt =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Notstrom_akt`;
const sID_Autonomiezeit =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Autonomiezeit`;
const sID_BatSoc_kWh =`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Batteriekapazität_kWh`;
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
const arrayID_Parameter1 =[sID_UntererLadekorridor_W[1],sID_Ladeschwelle_Proz[1],sID_Ladeende_Proz[1],sID_Ladeende2_Proz[1],sID_RegelbeginnOffset[1],sID_RegelendeOffset[1],sID_LadeendeOffset[1],sID_Unload_Proz[1]];
const arrayID_Parameter2 =[sID_UntererLadekorridor_W[2],sID_Ladeschwelle_Proz[2],sID_Ladeende_Proz[2],sID_Ladeende2_Proz[2],sID_RegelbeginnOffset[2],sID_RegelendeOffset[2],sID_LadeendeOffset[2],sID_Unload_Proz[2]];
const arrayID_Parameter3 =[sID_UntererLadekorridor_W[3],sID_Ladeschwelle_Proz[3],sID_Ladeende_Proz[3],sID_Ladeende2_Proz[3],sID_RegelbeginnOffset[3],sID_RegelendeOffset[3],sID_LadeendeOffset[3],sID_Unload_Proz[3]];
const arrayID_Parameter4 =[sID_UntererLadekorridor_W[4],sID_Ladeschwelle_Proz[4],sID_Ladeende_Proz[4],sID_Ladeende2_Proz[4],sID_RegelbeginnOffset[4],sID_RegelendeOffset[4],sID_LadeendeOffset[4],sID_Unload_Proz[4]];
const arrayID_Parameter5 =[sID_UntererLadekorridor_W[5],sID_Ladeschwelle_Proz[5],sID_Ladeende_Proz[5],sID_Ladeende2_Proz[5],sID_RegelbeginnOffset[5],sID_RegelendeOffset[5],sID_LadeendeOffset[5],sID_Unload_Proz[5]];

let Max_wrleistung_W = getState(sID_Max_wrleistung_W).val - 200;                        // Maximale Wechselrichter Leistung (Abzüglich 200 W, um die Trägheit der Steuerung auszugleichen)
let InstalliertPeakLeistung = getState(sID_Installed_Peak_Power).val;                   // Installierte Peak Leistung der PV-Module
let Einspeiselimit_Pro = getState(sID_Einspeiselimit_Pro).val;                          // Einspeiselimit in Prozent
let Einspeiselimit_kWh = ((InstalliertPeakLeistung/100)*Einspeiselimit_Pro-200)/1000    // Einspeiselimit (Abzüglich 200 W, um die Trägheit der Steuerung auszugleichen)
//let Einspeiselimit_kWh = (getState(sID_Einspeiselimit_W).val - 200)/1000;             // Einspeiselimit (Abzüglich 200 W, um die Trägheit der Steuerung auszugleichen)
let maximumLadeleistung_W = getState(sID_Bat_Charge_Limit).val;                         // Maximal mögliche Batterie Ladeleistung
let Bat_Discharge_Limit_W = getState(sID_Bat_Discharge_Limit).val;                      // Maximal mögliche Batterie Entladeleistung
let startDischargeDefault = getState(sID_startDischargeDefault).val;                    // Anfängliche Entladeleistung Standard
let Batterie_SOC_Proz = getState(sID_Batterie_SOC).val;
let Speichergroesse_kWh                                                                 // Installierte Batterie Speicher Kapazität wird in Funktion Speichergroesse() berechnet


let AutomatikAnwahl,AutomatikRegelung,NotstromAusNetz,EinstellungAnwahl,PrognoseAnwahl,count0 = 0, count1 = 0, count2 = 0, count3 = 0, Summe0 = 0, Summe1 = 0, Summe2 = 0, Summe3 = 0;
let RE_AstroSolarNoon,LE_AstroSunset,RB_AstroSolarNoon,RE_AstroSolarNoon_alt_milisek,RB_AstroSolarNoon_alt_milisek,Zeit_alt_milisek=0,ZeitE3DC_SetPowerAlt_ms=0,ReichweiteAktVerbrauchAlt=0;
let M_Power=0,M_Power_alt=0,Notstrom_SOC_erreicht=true,Set_Power_Value_W=0,Batterie_SOC_alt_Proz=0,bLadenEntladenStoppen= false,bLadenEntladenStoppen_alt=false;
let Notstrom_SOC_Proz = 0, M_Abriegelung=false,LadenAufNotstromSOC=false,HeuteNotstromVerbraucht=true;
let Timer0 = null, Timer1 = null,Timer2 = null,Timer3 = null,Timer4 = null, TimerProplanta= null;
let CheckConfig = true, Schritt = 0;
let SummePV_Leistung_Tag_kW =[{0:'',1:'',2:'',3:'',4:'',5:'',6:'',7:''},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0},{0:0,1:0,2:0,3:0,4:0,5:0,6:0,7:0}];
let baseUrls = {
    "de" : "https://www.proplanta.de/Wetter/profi-wetter.php?SITEID=60&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=0",
    "at" : "https://www.proplanta.de/Wetter-Oesterreich/profi-wetter-at.php?SITEID=70&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=0",
    "ch" : "https://www.proplanta.de/Wetter-Schweiz/profi-wetter-ch.php?SITEID=80&PLZ=#PLZ#&STADT=#ORT#&WETTERaufrufen=stadt&Wtp=&SUCHE=Wetter&wT=0",
};
let baseurl

ScriptStart();
//***************************************************************************************************
//**************************************** Function Bereich *****************************************
//***************************************************************************************************

// Wird nur beim Start vom Script aufgerufen
async function ScriptStart()
{
    await CreateState();
    log(`${Logparser1} -==== alle Objekt ID\'s angelegt ====- ${Logparser2}`);
    await CheckState();
    log(`${Logparser1} -==== alle Objekte ID\'s überprüft ====- ${Logparser2}`);
    AutomatikAnwahl = (await getStateAsync(sID_Automatik_Prognose)).val;
    AutomatikRegelung = (await getStateAsync(sID_Automatik_Regelung)).val;
    NotstromAusNetz = (await getStateAsync(sID_NotstromAusNetz)).val;
    PrognoseAnwahl = (await getStateAsync(sID_PrognoseAnwahl)).val;
    EinstellungAnwahl = (await getStateAsync(sID_EinstellungAnwahl)).val
    // Wetterdaten beim Programmstart aktualisieren und Timer starten.
    await Speichergroesse()                                             // aktuell verfügbare Batterie Speichergröße berechnen
    if (Solcast) {await SheduleSolcast(SolcastDachflaechen);}           // Wetterdaten Solcast abrufen
    //await UTC_Dezimal_to_MEZ();                                         // UTC Zeiten in MEZ umrechnen
    await MEZ_Regelzeiten();                                            // RE,RB und Ladeende berechnen
    await Notstromreserve();                                            // Eingestellte Notstromreserve berechnen
    await PrognosedatenAbrufen();                                       // Wetterdaten Proplanta abrufen danach wird main() augerufen
    bStart = false;
}   

// Alle nötigen Objekt ID's anlegen 
async function CreateState(){
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Notstrom_min`, {'def':30, 'name':'Speicherreserve in % bei Wintersonnenwende 21.12', 'type':'number', 'role':'value', 'desc':'Speicherreserve in % bei winterminimum', 'unit':'%'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Notstrom_sockel`, {'def':20, 'name':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'type':'number', 'role':'value', 'desc':'min. SOC Wert bei Tag-/Nachtgleiche 21.3./21.9.', 'unit':'%'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Autonomiezeit`, {'def':"", 'name':'verbleibende Reichweite der Batterie in h und m', 'type':'string', 'role':'value', 'desc':'verbleibende Reichweite der Batterie in h'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Batteriekapazität_kWh`, {'def':0, 'name':'verbleibende Reichweite der Batterie in kWh', 'type':'number', 'role':'value', 'desc':'verbleibende Reichweite der Batterie in kWh', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Notstrom_akt`, {'def':0, 'name':'aktuell berechnete Notstromreserve', 'type':'number', 'role':'value', 'desc':'aktuell berechnete Notstromreserve', 'unit':'%'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Listenelement_Nr`, {'def':0, 'name':'Aktive Anwahl Listenelement in VIS' , 'type':'number', 'role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EinstellungAnwahl`, {'def':0, 'name':'Aktuell manuell angewählte Einstellung', 'type':'number', 'role':'State'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchTag`, {'def':0, 'name':'min. Eigenverbrauch von 6:00 Uhr bis 19:00 Uhr in kWh', 'type':'number', 'role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Automatik`, {'def':false, 'name':'Bei true werden die Parameter automatisch nach Wetterprognose angepast' , 'type':'boolean', 'role':'State', 'desc':'Automatik Charge-Control ein/aus'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Automatik_Regelung`, {'def':false, 'name':'Bei true ist die Lade Regelung eingeschaltet' , 'type':'boolean', 'role':'State', 'desc':'Automatik Charge-Control ein/aus'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.NotstromAusNetz`, {'def':false, 'name':'Bei true wird aus dem Netz bis Notstrom SOC nachgeladen' , 'type':'boolean', 'role':'State', 'desc':'Notstrom aus Netz nachladen'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstSummePvLeistung_kWh`, {'def':0, 'name':'Summe kWh Leistungsmesser 0 und Leistungsmesser 1 ' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseBerechnung_kWh_heute`, {'def':0, 'name':'Prognose für Berechnung' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Regelbeginn_MEZ`, {'def':'00.00', 'name':'Regelbeginn MEZ', 'type':'string', 'role':'string', 'desc':'Regelbeginn MEZ Zeit', 'unit':'Uhr'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Regelende_MEZ`, {'def':'00.00', 'name':'Regelende MEZ', 'type':'string', 'role':'string', 'desc':'Regelende MEZ Zeit', 'unit':'Uhr'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Ladeende_MEZ`, {'def':'00.00', 'name':'Ladeende MEZ', 'type':'string', 'role':'string', 'desc':'Ladeende MEZ Zeit', 'unit':'Uhr'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Saved_Power_W`, {'def':0, 'name':'Überschuss in W' , 'type':'number', 'role':'value', 'unit':'W'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.Saved_PowerLM2_kWh`, {'def':0, 'name':'kWh Leistungsmesser 2' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstPvErtragLM0_kWh`, {'def':0, 'name':'kWh Leistungsmesser 0 ' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstPvErtragLM1_kWh`, {'def':0, 'name':'kWh Leistungsmesser 1 ' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchAbend_kWh`, {'def':0, 'name':'kWh Eigenverbrauch Summe von 0:00 Uhr bis 8:00 Uhr ' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.EigenverbrauchDurchschnitt_kWh`, {'def':0, 'name':'kWh Eigenverbrauch Durchschnitt von 0:00 Uhr bis 8:00 Uhr ' , 'type':'number', 'role':'value', 'unit':'kWh'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseAnwahl`, {'def':0, 'name':'Beide Berechnung nach min. Wert = 0 nur Proplanta=1 nur Solcast=2 Beide Berechnung nach max. Wert=3 Beide Berechnung nach Ø Wert=4 nur Solcast90=5' , 'type':'number', 'role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON`, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistorySelect`, {'def':1, 'name':'Select Menü für materialdesign json chart' ,'type':'number'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`, {'def':'0', 'name':'Aktualisierung Proplanta' ,'type':'string'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`, {'def':NaN, 'name':'Bewölkungsgrad 12 Uhr Proplanta' ,'type':'number'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`, {'def':NaN, 'name':'Bewölkungsgrad 15 Uhr Proplanta' ,'type':'number'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_0`, {'def':0, 'name':'Max Temperatur heute' ,'type':'number', 'unit':'°C'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_1`, {'def':0, 'name':'Max Temperatur Morgen' ,'type':'number', 'unit':'°C'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_2`, {'def':0, 'name':'Max Temperatur Übermorgen' ,'type':'number', 'unit':'°C'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_3`, {'def':0, 'name':'Max Temperatur in vier Tagen' ,'type':'number', 'unit':'°C'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_0`, {'def':0, 'name':'Min Temperatur heute' ,'type':'number', 'unit':'°C'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_1`, {'def':0, 'name':'Min Temperatur Morgen' ,'type':'number', 'unit':'°C'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_2`, {'def':0, 'name':'Min Temperatur Übermorgen' ,'type':'number', 'unit':'°C'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_3`, {'def':0, 'name':'Min Temperatur in vier Tagen' ,'type':'number', 'unit':'°C'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogHistoryLokal`, {'def':false,'name':'History Daten in Lokaler Datei speichern' ,'type':'boolean', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogHistoryPath`, {'name':'Pfad zur Sicherungsdatei History ' ,'type':'string', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogAusgabe`, {'def':false,'name':'Zusätzliche allgemeine LOG Ausgaben' ,'type':'boolean', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_DebugAusgabe`, {'def':false,'name':'Debug Ausgabe im LOG zur Fehlersuche' ,'type':'boolean', 'unit':'','role':'State'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogAusgabeRegelung`, {'def':false,'name':'Zusätzliche LOG Ausgaben der Lade-Regelung' ,'type':'boolean', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Offset_sunriseEnd`, {'def':60,'name':'Wieviele Minuten nach Sonnenaufgang soll die Notstromreserve noch abdecken' ,'type':'number', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_minWertPrognose_kWh`, {'def':0,'name':'Wenn Prognose nächster Tag > als minWertPrognode_kWh wird die Notstromreserve freigegeben 0=Notstromreserve nicht freigegeben' ,'type':'number', 'unit':'kWh','role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_maxEntladetiefeBatterie`, {'def':90,'name':'Die Entladetiefe der Batterie in % aus den technischen Daten E3DC (beim S10E pro 90%)' ,'type':'number', 'unit':'%','role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Systemwirkungsgrad`, {'def':88,'name':'max. Systemwirkungsgrad inkl. Batterie in % aus den technischen Daten E3DC (beim S10E 88%)' ,'type':'number', 'unit':'%','role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaCountry`, {'def':'de','name':'Ländercode für Proplanta de,at, ch, fr, it' ,'type':'string', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaOrt`, {'name':'Wohnort für Abfrage Wetterdaten Proplanta' ,'type':'string', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaPlz`, {'name':'Postleitzahl für Abfrage Wetterdaten Proplanta' ,'type':'string', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_BewoelkungsgradGrenzwert`, {'def':90,'name':'wird als Umschaltkriterium für die Einstellung 2-5 verwendet' ,'type':'number', 'unit':'%','role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_AbfrageSolcast`, {'def':false,'name':'true = Daten Solcast werden abgerufen false = Daten Solcast werden nicht abgerufen' ,'type':'boolean', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastDachflaechen`, {'name':'Aktuell max. zwei Dachflächen möglich' ,'type':'number', 'unit':'Stück','role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastResource_Id_Dach1`, {'name':'Rooftop 1 Id von der Homepage Solcast' ,'type':'string', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastResource_Id_Dach2`, {'name':'Rooftop 2 Id von der Homepage Solcast' ,'type':'string', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastAPI_key`, {'name':'API Key von der Homepage Solcast' ,'type':'string', 'unit':'','role':'state'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_ModulFlaeche`, {'name':'Installierte Modulfläche in m² (Silizium-Zelle 156x156x60 Zellen x 50 Module)' ,'type':'number', 'unit':'m²','role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_WirkungsgradModule`, {'def':21,'name':'Wirkungsgrad / Effizienzgrad der Solarmodule in % bezogen auf die Globalstrahlung (aktuelle Module haben max. 24 %)' ,'type':'number', 'unit':'%','role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_KorrekturFaktor`, {'def':0,'name':'Korrektur Faktor in Prozent. Reduziert die berechnete Prognose um diese anzugleichen.nKorrFaktor= 0 ohne Korrektur' ,'type':'number', 'unit':'%','role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_minPvLeistungTag_kWh`, {'def':3,'name':'minimal Mögliche PV-Leistung. Wenn Prognose niedriger ist wird mit diesem Wert gerechnet' ,'type':'number', 'unit':'kWh','role':'value'});
    createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_maxPvLeistungTag_kWh`, {'def':105,'name':'max. Mögliche PV-Leistung. Wenn Prognose höher ist wird mit diesem Wert gerechnet' ,'type':'number', 'unit':'kWh','role':'value'});
    for (let i = 0; i <= 31; i++) {
        if(i <=6){
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_${i}`, {'def':'0', 'name':'Datum Proplanta' ,'type':'string'});
        }
        if(i <= 5){
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.UntererLadekorridor_${i}`, {'def':500, 'name':'Die Ladeleistung soll sich oberhalb dieses Wertes bewegen', 'type':'number', 'role':'value', 'desc':'UntererLadekorridor', 'unit':'W'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Ladeschwelle_${i}`, {'def':0, 'name':'bis zur dieser Schwelle wird geladen bevor die Regelung beginnt', 'type':'number', 'role':'value', 'desc':'Ladeschwelle', 'unit':'%'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Ladeende_${i}`, {'def':80, 'name':'Zielwert bis Ende Regelung, dannach wird Ladung auf ladeende2 weiter geregelt', 'type':'number', 'role':'value', 'desc':'Ladeende', 'unit':'%'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Ladeende2_${i}`, {'def':93, 'name':'ladeende2 kann der Wert abweichend vom Defaultwert 93% gesetzt werden.Muss > ladeende sein', 'type':'number', 'role':'value', 'desc':'Ladeende2', 'unit':'%'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.RegelbeginnOffset_${i}`, {'def':"02:00", 'name':'Offset Wert start Regelbeginn in min. von solarNoon (höchster Sonnenstand) = 0 ', 'type':'string', 'role':'value', 'desc':'RB_Offset'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.RegelendeOffset_${i}`, {'def':"02:00", 'name':'Offset Wert ende Regelung in min. von solarNoon (höchster Sonnenstand) = 0 ', 'type':'string', 'role':'value', 'desc':'RE_Offset'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.LadeendeOffset_${i}`, {'def':"02:00", 'name':'Offset Wert Ladeende in min. von sunset (Sonnenuntergang) = 0 ', 'type':'string', 'role':'value', 'desc':'LE_Offset'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[0]}.Unload_${i}`, {'def':100, 'name':'Zielwert beim entladen.Die ladeschwelle muss < unload sein', 'type':'number', 'role':'value', 'desc':'Unload', 'unit':'%'});
        }
        if(i > 0){
            let n = i.toString().padStart(2,"0");
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.IstPvLeistung_kWh_${n}`, {'def':0, 'name':'PV-Leistung Tag' ,'type':'number', 'unit':'kWh'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${n}`, {'def':0, 'name':'Tagesprognose Proplanta', 'type':'number', 'unit':'kWh'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh_${n}`, {'def':0, 'name':'Berechnete Prognose bei Anwahl Automatik' ,'type':'number', 'unit':'kWh'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast_kWh_${n}`, {'def':0, 'name':'Schätzung der PV-Leistung Solcast in Kilowatt (kW)' ,'type':'number', 'unit':'kWh'});
            createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast90_kWh_${n}`, {'def':0, 'name':'Schätzung der PV-Leistung in Kilowatt (kW) 90. Perzentil (hohes Szenario)' ,'type':'number', 'unit':'kWh'});
    
            if (i < 13){
                createStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${n}`, {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
            }
        }
    
    }
}

// Alle User Eingaben prüfen ob Werte eingetragen wurden
async function CheckState()
{
    logflag = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogHistoryLokal`)).val
    if(logflag == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogHistoryLokal enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
        
    sLogPath = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogHistoryPath`)).val
    if(sLogPath == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogHistoryPath enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    LogAusgabe = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogAusgabe`)).val
    if(LogAusgabe == undefined){log(`${Logparser1} Die Objekt ID = ${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogAusgabe enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    DebugAusgabe = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_DebugAusgabe`)).val
    if(DebugAusgabe == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_DebugAusgabe enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    LogAusgabeRegelung = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogAusgabeRegelung`)).val
    if(LogAusgabeRegelung == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_LogAusgabeRegelung enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    Offset_sunriseEnd_min = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Offset_sunriseEnd`)).val
    if(Offset_sunriseEnd_min == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Offset_sunriseEnd enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    minWertPrognose_kWh = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_minWertPrognose_kWh`)).val
    if(minWertPrognose_kWh == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_minWertPrognose_kWh enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    Entladetiefe_Pro = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_maxEntladetiefeBatterie`)).val
    if(Entladetiefe_Pro == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_maxEntladetiefeBatterie enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    if(Entladetiefe_Pro < 0 || Entladetiefe_Pro >100){console.error("Entladetiefe Batterie muss zwischen 0% und 100% sein");}

    Systemwirkungsgrad_Pro = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Systemwirkungsgrad`)).val
    if(Systemwirkungsgrad_Pro == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.10_Systemwirkungsgrad enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    if(Systemwirkungsgrad_Pro < 0 || Systemwirkungsgrad_Pro >100){console.error("Systemwirkungsgrad muss zwischen 0% und 100% sein");}


    country = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaCountry`)).val
    if(country == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaCountry enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    baseurl = baseUrls[country];

    ProplantaOrt = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaOrt`)).val
    if(ProplantaOrt == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaOrt enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    ProplantaPlz = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaPlz`)).val
    if(ProplantaPlz == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_ProplantaPlz enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    BewoelkungsgradGrenzwert = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_BewoelkungsgradGrenzwert`)).val
    if(BewoelkungsgradGrenzwert == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.20_BewoelkungsgradGrenzwert enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    Solcast = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_AbfrageSolcast`)).val
    if(Solcast == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_AbfrageSolcast enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    if (Solcast){
        SolcastDachflaechen = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastDachflaechen`)).val
        if(SolcastDachflaechen == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastDachflaechen enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
        Resource_Id_Dach[1] = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastResource_Id_Dach1`)).val
        if(Resource_Id_Dach[1] == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastResource_Id_Dach1 enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
        if(SolcastDachflaechen == 2){
            Resource_Id_Dach[2] = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastResource_Id_Dach2`)).val
            if(Resource_Id_Dach[2] == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastResource_Id_Dach2 enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
        }

        SolcastAPI_key = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastAPI_key`)).val
        if(SolcastAPI_key == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.30_SolcastAPI_key enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
        
        // Daten von Solcast immer zwischen 04:01 und 04:59 Uhr abholen wenn const Solcast = true
        schedule(`${Math.floor(Math.random() * (59 - 1 + 1)) + 1} 4 * * *`, function() {
            SheduleSolcast(SolcastDachflaechen);
        });
    
    }
    
    nModulFlaeche = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_ModulFlaeche`)).val
    if(nModulFlaeche == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_ModulFlaeche enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    nWirkungsgradModule = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_WirkungsgradModule`)).val
    if(nWirkungsgradModule == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_WirkungsgradModule enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    nKorrFaktor = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_KorrekturFaktor`)).val
    if(nKorrFaktor == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_KorrekturFaktor enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    nMinPvLeistungTag_kWh = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_minPvLeistungTag_kWh`)).val
    if(nMinPvLeistungTag_kWh == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_minPvLeistungTag_kWh enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    nMaxPvLeistungTag_kWh = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_maxPvLeistungTag_kWh`)).val
    if(nMaxPvLeistungTag_kWh == undefined){log(`${Logparser1} Die Objekt ID =${instanz}.${PfadEbene1}.${PfadEbene2[4]}.40_maxPvLeistungTag_kWh enthält keinen gültigen Wert, bitte prüfen ${Logparser2}`,'error');}
    
    // Pfadangaben zu den Modulen Modbus und e3dc-rscp überprüfen
    const PruefeID = [sID_Batterie_SOC,sID_PvLeistung_E3DC_W,sID_PvLeistung_ADD_W,
    sID_Power_Home_W,sID_Power_Wallbox_W,sID_Bat_Discharge_Limit,sID_Bat_Charge_Limit,sID_Notrom_Status,sID_SPECIFIED_Battery_Capacity_0,sID_SET_POWER_MODE,
    sID_SET_POWER_VALUE_W,sID_Max_Discharge_Power_W,sID_Max_Charge_Power_W,sID_startDischargeDefault,sID_Max_wrleistung_W,
    sID_BAT0_Alterungszustand,sID_DISCHARGE_START_POWER,sID_PARAM_EP_RESERVE_W];
    for (let i = 0; i < PruefeID.length; i++) {
        if (!existsObject(PruefeID[i])){log(`${Logparser1} Pfad = ${PruefeID[i]} existiert nicht, bitte prüfen ${Logparser2}`,'error');}
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
    let Notstrom_Status = (await getStateAsync(sID_Notrom_Status)).val;                                             // aktueller Notstrom Status E3DC 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
    let PV_Leistung_ADD_W = (await getStateAsync(sID_PvLeistung_ADD_W)).val;                                        // Aktuelle zusätzliche PV Leistung externer WR         
    let PV_Leistung_E3DC_W = (await getStateAsync(sID_PvLeistung_E3DC_W)).val;                                      // Aktuelle PV Leistung E3DC
    let PV_Leistung_Summe_W = PV_Leistung_E3DC_W + Math.abs(PV_Leistung_ADD_W);                                     // Summe PV Leistung, PV_Leistung_ADD_W (negativer Wert)
    let Akk_max_Discharge_Power_W = (await getStateAsync(sID_Max_Discharge_Power_W)).val;                           // Aktuell eingestellte Entladeleistung   
    let Akk_max_Charge_Power_W = (await getStateAsync(sID_Max_Charge_Power_W)).val;                                 // Aktuell eingestellte Ladeleistung   
    let Power_Home_W = (await getStateAsync(sID_Power_Home_W)).val+(await getStateAsync(sID_Power_Wallbox_W)).val;  // Aktueller Hausverbrauch + Ladeleistung Wallbox E3DC   
    let UntererLadekorridor_W = (await getStateAsync(sID_UntererLadekorridor_W[EinstellungAnwahl])).val             // Parameter UntererLadekorridor
    let NotstromVerwenden = await CheckPrognose();
    Batterie_SOC_Proz = (await getStateAsync(sID_Batterie_SOC)).val;                                                // Aktueller Batterie SOC E3DC
    
    // Das Entladen aus dem Speicher wird freigegeben wenn
    // Notstrom oder Inselbetrieb aktiv ist oder NotstromVerwenden = true oder LadenAufNotstrom = true oder der Batterie SOC > der berechneten Reserve liegt oder PV-Leistung > 100W ist und vor Sonnenuntergang
    // Notstrom_Status 0=nicht möglich 1=active 2= nicht active 3= nicht verfügbar 4= Inselbetrieb
    if (Notstrom_Status == 1 || Notstrom_Status == 4 || NotstromVerwenden|| LadenAufNotstromSOC || Batterie_SOC_Proz > Notstrom_SOC_Proz || (PV_Leistung_E3DC_W > 100 && new Date() < getAstroDate("sunset"))){
        // Laden/Endladen einschalten
        if(Akk_max_Discharge_Power_W == 0 || Akk_max_Charge_Power_W == 0){
            await setStateAsync(sID_Max_Discharge_Power_W, Bat_Discharge_Limit_W)
            await setStateAsync(sID_DISCHARGE_START_POWER, startDischargeDefault)
            await setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
            // Wenn NotstromVerwenden einmal true war, wird mit dem Merker bM_Notstrom das Ausschalten der Lade/Enladeleistung bis Sonnenaufgang verhindert
            if (NotstromVerwenden){bM_Notstrom = true };
            Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val
            log(`${Logparser1} -==== Laden/Entladen der Batterie ist eingeschaltet ====- ${Logparser2}`,'warn')
            if (DebugAusgabe){log(`Ladesteuerung: NotstromVerwenden= ${NotstromVerwenden} Batterie_SOC_Proz= ${Batterie_SOC_Proz} Notstrom_SOC_Proz= ${Notstrom_SOC_Proz} PV_Leistung_E3DC_W= ${PV_Leistung_E3DC_W} Notstrom_SOC_erreicht = ${Notstrom_SOC_erreicht} bM_Notstrom = ${bM_Notstrom}`,'warn')}
        }
    }else if(Batterie_SOC_Proz <= Notstrom_SOC_Proz && (new Date() > getAstroDate("sunset") && !bM_Notstrom || new Date() < getAstroDate("sunrise") && !bM_Notstrom)){
        // Laden/Endladen ausschalten nur wenn Notstrom SOC erreicht wurde und PV-Leistung = 0 W und Batterie SOC > 2% und LadenAufNotstromSOC nicht aktiv
        if((Akk_max_Discharge_Power_W != 0 || Akk_max_Charge_Power_W != 0) && Batterie_SOC_Proz !=0){
            await setStateAsync(sID_DISCHARGE_START_POWER, 0)
            await setStateAsync(sID_Max_Discharge_Power_W, 0)
            await setStateAsync(sID_Max_Charge_Power_W, 0)
            // Notstrom SOC um 1% erhöhen, da die Batterieladung nach ausschalten wieder ansteigen kann.
            Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val +2
            log(`${Logparser1} -==== Notstrom Reserve erreicht, Laden/Entladen der Batterie ist ausgeschaltet ====- ${Logparser2}`,'warn')
            if (DebugAusgabe){log(`Ladesteuerung: NotstromVerwenden= ${NotstromVerwenden} Batterie_SOC_Proz= ${Batterie_SOC_Proz} Notstrom_SOC_Proz= ${Notstrom_SOC_Proz} PV_Leistung_E3DC_W= ${PV_Leistung_E3DC_W} Notstrom_SOC_erreicht = ${Notstrom_SOC_erreicht} bM_Notstrom = ${bM_Notstrom}`,'warn')}
        }
    }                                        
    // Zwischen Sonnenuntergang und Sonnenaufgang kann Merker Notrom entladen wieder zurückgesetzt werden.
    if (new Date() < getAstroDate("sunset") && new Date() > getAstroDate("sunrise")){bM_Notstrom = false}
    
    // Merker Notstrom_SOC_erreicht um das entladen der Batterie zu verhindern.
    if (Notstrom_Status == 1 || Notstrom_Status == 4 || Batterie_SOC_Proz > Notstrom_SOC_Proz || NotstromVerwenden){
        // Entladen einschalten
        Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val
        if (DebugAusgabe && Notstrom_SOC_erreicht){log(`Ladesteuerung: Notstrom_SOC_erreicht= false NotstromVerwenden= ${NotstromVerwenden} Batterie_SOC_Proz= ${Batterie_SOC_Proz} Notstrom_SOC_Proz= ${Notstrom_SOC_Proz} `,'warn')}
        Notstrom_SOC_erreicht = false;
    }else{
        // Endladen ausschalten
        // Notstrom SOC um 1% erhöhen, um ein ständiges aus und einschalten zu vermeiden.
        Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val +2
        if (DebugAusgabe && !Notstrom_SOC_erreicht){log(`Ladesteuerung: Notstrom_SOC_erreicht= true NotstromVerwenden= ${NotstromVerwenden} Batterie_SOC_Proz= ${Batterie_SOC_Proz} Notstrom_SOC_Proz= ${Notstrom_SOC_Proz} `,'warn')}
        Notstrom_SOC_erreicht = true;
    }                                                                                        
    
    
    
    // Nur wenn PV-Leistung vorhanden ist oder Entladen freigegeben ist Regelung starten.
    if(PV_Leistung_Summe_W > 0 || getState(sID_Max_Discharge_Power_W).val > 0 || getState(sID_Max_Charge_Power_W).val > 0){
        let Power = 0;
        let Unload_Proz = (await getStateAsync(sID_Unload_Proz[EinstellungAnwahl])).val;                            // Parameter Unload
        let Ladeende_Proz = (await getStateAsync(sID_Ladeende_Proz[EinstellungAnwahl])).val                         // Parameter Ladeende
        let Ladeende2_Proz = (await getStateAsync(sID_Ladeende2_Proz[EinstellungAnwahl])).val                       // Parameter Ladeende2
        let Ladeschwelle_Proz = (await getStateAsync(sID_Ladeschwelle_Proz[EinstellungAnwahl])).val                 // Parameter Ladeschwelle
        
        // Wenn Notstrom SOC nicht erreicht ist oder Notstrom SOC erreicht wurde und mehr PV-Leistung als benötigt vorhanden ist (Überschuss) regelung starten
        if((Notstrom_SOC_erreicht && (PV_Leistung_Summe_W - Power_Home_W) > UntererLadekorridor_W ) || !Notstrom_SOC_erreicht){
            // Prüfen ob SOC Batterie > Ladeschwelle.Bis zu diesem SoC Wert wird sofort mit der gesamten überschüssigen PV-Leistung geladen. Erst wenn die ladeschwelle erreicht wird, wird mit dem geregelten Laden begonnen  
            if (Batterie_SOC_Proz > Ladeschwelle_Proz) {
                //SOC Ladeschwelle wurde erreicht.
                // Prüfen ob vor Regelbeginn
                if (dAkt.getTime() < RB_AstroSolarNoon.getTime()) { 
                     // Vor Regelbeginn.
                    if(LogAusgabeRegelung && Schritt != 1){log(`${Logparser1} -==== Vor Regelbeginn ====- ${Logparser2}`);Schritt = 1;}
                    // Ist Unload < Ladeschwelle wird bis Ladeschwelle geladen und Unload ignoriert
                    if(Ladeschwelle_Proz <= Unload_Proz){
                        let Unload_SOC_Proz = 100
                        // Ist der Batterie SoC > Unload und PV Leistung vorhanden wird entladen
                        if ((Batterie_SOC_Proz - Unload_Proz) > 0 && PV_Leistung_Summe_W > 0){
                            // Batterie SoC > Unload und PV Leistung vorhanden
                            if ((Batterie_SOC_Proz - Unload_Proz) < 1){
                                Unload_SOC_Proz = Batterie_SOC_Proz
                            }else{
                                // Es wird bis Regelbeginn auf Unload entladen
                                Unload_SOC_Proz = Unload_Proz;
                            }
                            // Neuberechnung der Ladeleistung erfolgt, wenn der SoC sich ändert oder nach Ablauf von höchstens 5 Minuten oder tLadezeitende sich ändert oder die letzte Ladeleistung 0 W war oder die Parameter sich geändert haben.
                            if(Batterie_SOC_Proz != Batterie_SOC_alt_Proz || (dAkt.getTime() - Zeit_alt_milisek) > 30000 || RB_AstroSolarNoon.getTime() != RB_AstroSolarNoon_alt_milisek || M_Power == 0 || M_Power == maximumLadeleistung_W || CheckConfig){
                                Batterie_SOC_alt_Proz = Batterie_SOC_Proz; CheckConfig = false; RB_AstroSolarNoon_alt_milisek = RB_AstroSolarNoon.getTime(); Zeit_alt_milisek = dAkt.getTime();
                                // Berechnen der Entladeleistung bis zum Unload SOC in W/sek.
                                M_Power = Math.round(((Unload_SOC_Proz - Batterie_SOC_Proz)*Speichergroesse_kWh*10*3600) / (Math.trunc((RB_AstroSolarNoon.getTime()- dAkt.getTime())/1000)));
                                if(LogAusgabeRegelung){log(`${Logparser1} -==== 1 M_Power: ${M_Power} = Math.round(((Unload_SOC_Proz:${Unload_SOC_Proz} - Batterie_SOC_Proz:${Batterie_SOC_Proz})*Speichergroesse_kWh: ${Speichergroesse_kWh}*10*3600) / (RB_AstroSolarNoon:${RB_AstroSolarNoon.getTime()} - Zeit_aktuell_milisek:${dAkt.getTime()})) ====- ${Logparser2}`)}
                
                                // Prüfen ob die PV-Leistung plus Entladeleistung Batterie die max. WR-Leistung übersteigt
                                if((PV_Leistung_E3DC_W - M_Power)> Max_wrleistung_W){
                                 M_Power = PV_Leistung_E3DC_W - Max_wrleistung_W
                                }
                            }
                            // Laden der Batterie erst nach Regelbeginn zulassen
                            if(M_Power > 0){bLadenEntladenStoppen = true;M_Power = 0;}
                        }else if((PV_Leistung_Summe_W - Power_Home_W) > UntererLadekorridor_W ){
                            // Unload SOC erreicht und PV-Leistung höher als Eigenverbrauch.Laden der Batterie erst nach Regelbeginn zulassen
                            bLadenEntladenStoppen = true
                            M_Power = 0;
                        }else{
                            // Unload SOC erreicht und PV-Leistung niedriger als Eigenverbrauch.Regelung E3DC überlassen
                            M_Power = 0;
                        }
                    }
                // Prüfen ob nach Regelbeginn vor Regelende
                }else if(dAkt.getTime() < RE_AstroSolarNoon.getTime()){ 
                    // Nach Regelbeginn vor Regelende
                    if(LogAusgabeRegelung && Schritt != 2){log(`${Logparser1} -==== Nach Regelbeginn vor Regelende ====- ${Logparser2}`);Schritt=2;}
                    // Neuberechnung der Ladeleistung erfolgt, wenn der SoC sich ändert oder nach Ablauf von höchstens 5 Minuten oder tLadezeitende sich ändert oder die letzte Ladeleistung 0 W war oder die Parameter sich geändert haben.
                    if(Batterie_SOC_Proz != Batterie_SOC_alt_Proz || (dAkt.getTime() - Zeit_alt_milisek) > 30000 || RE_AstroSolarNoon.getTime() != RE_AstroSolarNoon_alt_milisek || M_Power == 0 || M_Power == maximumLadeleistung_W || CheckConfig){
                        Batterie_SOC_alt_Proz = Batterie_SOC_Proz; CheckConfig = false; RE_AstroSolarNoon_alt_milisek = RE_AstroSolarNoon.getTime(); Zeit_alt_milisek = dAkt.getTime();
                        // Berechnen der Ladeleistung bis zum Ladeende SOC in W/sek.
                        M_Power = Math.round(((Ladeende_Proz - Batterie_SOC_Proz)*Speichergroesse_kWh*10*3600) / (Math.trunc((RE_AstroSolarNoon.getTime()-dAkt.getTime())/1000)));
                        if(LogAusgabeRegelung){log(`${Logparser1} -==== 2 M_Power:${M_Power} = Math.round(((Ladeende_Proz:${Ladeende_Proz} - Batterie_SOC_Proz:${Batterie_SOC_Proz})*Speichergroesse_kWh:${Speichergroesse_kWh}*10*3600) / (tRegelende_milisek:${RE_AstroSolarNoon.getTime()} - Zeit_aktuell_milisek:${dAkt.getTime()})) ====- ${Logparser2}`)}
                        if (M_Power < UntererLadekorridor_W || M_Power < 0){
                            bLadenEntladenStoppen = true
                            M_Power = 0;
                        }
                    }
                // Prüfen ob nach Regelende vor Ladeende
                }else if(dAkt.getTime() < LE_AstroSunset.getTime()){
                    // Nach Regelende vor Ladeende
                    if(LogAusgabeRegelung && Schritt != 3){log(`${Logparser1} -==== Nach Regelende vor Sommerladeende ====- ${Logparser2}`);Schritt=3;}
                    if (Batterie_SOC_Proz < Ladeende_Proz){
                        M_Power = maximumLadeleistung_W;
                    }else if (Batterie_SOC_Proz < Ladeende2_Proz){
                        // Berechnen der Ladeleistung bis zum Ladeende SOC in W/sek.
                        // Neuberechnung der Ladeleistung erfolgt, wenn der SoC sich ändert oder nach Ablauf von höchstens 5 Minuten oder tLadezeitende sich ändert oder die letzte Ladeleistung 0 W war oder die Parameter sich geändert haben.
                        if(Batterie_SOC_Proz != Batterie_SOC_alt_Proz || (dAkt.getTime() - Zeit_alt_milisek) > 30000 || RE_AstroSolarNoon.getTime() != RE_AstroSolarNoon_alt_milisek || M_Power == 0 || M_Power == maximumLadeleistung_W || CheckConfig){
                            Batterie_SOC_alt_Proz = Batterie_SOC_Proz; CheckConfig = false; RE_AstroSolarNoon_alt_milisek = RE_AstroSolarNoon.getTime(); Zeit_alt_milisek = dAkt.getTime();
                            M_Power = Math.round(((Ladeende2_Proz - Batterie_SOC_Proz)*Speichergroesse_kWh*10*3600) / (Math.trunc((LE_AstroSunset.getTime()-dAkt.getTime())/1000)));
                            if(LogAusgabeRegelung){log(`${Logparser1} -==== 3 M_Power:${M_Power} = Math.round(((Ladeende2_Proz:${Ladeende2_Proz} - Batterie_SOC_Proz:${Batterie_SOC_Proz})* Speichergroesse_kWh:${Speichergroesse_kWh} * 10 * 3600)/(tSommerladeende_milisek:${LE_AstroSunset.getTime()} - Zeit_aktuell_milisek:${dAkt.getTime()})) ====- ${Logparser2}`)}
                            if (M_Power < UntererLadekorridor_W){M_Power = 0;bLadenEntladenStoppen = true} 
                        }   
                    }else if(PV_Leistung_Summe_W -Power_Home_W > 0){
                        // PV-Leistung höher als Eigenverbrauch und SOC Ladeende2 erreicht.Laden stoppen
                        bLadenEntladenStoppen = true
                        M_Power = 0;
                    }else{
                        // Ladeende2 erreicht und PV-Leistung niedriger als Eigenverbrauch.Regelung E3DC überlassen
                        M_Power = 0;
                    }
                // Prüfen ob nach Sommerladeende
                }else if(dAkt.getTime() > LE_AstroSunset.getTime()){
                    // Nach Sommerladeende
                    // Wurde Batterie SOC Ladeende2 erreicht, dann Ladung beenden ansonsten mit maximal möglicher Ladeleistung Laden.
                    if(LogAusgabeRegelung && Schritt != 4){log(`${Logparser1} -==== Sommerladeende überschritten ====- ${Logparser2}`);Schritt=4;}
                    if (Batterie_SOC_Proz < Ladeende2_Proz && PV_Leistung_Summe_W > UntererLadekorridor_W){
                        // SOC Ladeende2 nicht erreicht und ausreichend PV-Leistung vorhanden. Regelung E3DC überlassen
                        M_Power = maximumLadeleistung_W;
                    }else if(PV_Leistung_Summe_W -Power_Home_W > 0){
                        // PV-Leistung höher als Eigenverbrauch und SOC Ladeende2 erreicht.Laden stoppen
                        bLadenEntladenStoppen = true
                        M_Power = 0;
                    }else if(PV_Leistung_Summe_W > 0 ){
                        // PV-Leistung vorhanden aber reicht nicht um Eigenverbrauch abzudecken. Regelung E3DC überlassen.
                        M_Power = maximumLadeleistung_W;
                    }
                }
            }else{ 
                // SOC Ladeschwelle wurde nicht erreicht.Regelung E3DC übelassen (Standard:laden mit voller PV-Leistung)
                M_Power = maximumLadeleistung_W;
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
                    if(M_Power < Power_WR){M_Power = Power_WR;M_Abriegelung = true;if(LogAusgabeRegelung ){log(`${Logparser1} -==== Power_WR:${Power_WR} M_Power:${M_Power} ====- ${Logparser2}`)};}
                }else{
                    await setStateAsync(sID_Saved_Power_W,Power)
                    if(M_Power < Power){M_Power = Power;M_Abriegelung = true;if(LogAusgabeRegelung ){log(`${Logparser1} -==== Power:${Power} M_Power:${M_Power} ====- ${Logparser2}`)};}
                }  
            }else{
                await setStateAsync(sID_Saved_Power_W,0)
            }
        
            // Prüfen ob Berechnete Ladeleistung innerhalb der min. und max. Grenze ist
            if (M_Power < Bat_Discharge_Limit_W*-1){M_Power = Bat_Discharge_Limit_W*-1;} 
            if (M_Power > maximumLadeleistung_W){M_Power = maximumLadeleistung_W;}
        
            //Prüfen ob berechnete Ladeleistung M_Power zu Netzbezug führt nur wenn LadenStoppen = false ist
            if(M_Power >= 0 && !bLadenEntladenStoppen){   
                let PowerGrid = PV_Leistung_Summe_W -(Power_Home_W + M_Power)
                if(PowerGrid < 500 && M_Power != maximumLadeleistung_W){// Führt zu Netzbezug, Steuerung ausschalten
                    M_Power = maximumLadeleistung_W
                    if(LogAusgabeRegelung){log(`${Logparser1} -==== Laderegelung wird gestoppt ====- ${Logparser2}`);}
                }   
            }else if (!bLadenEntladenStoppen){
                let PowerGrid = PV_Leistung_Summe_W -(Power_Home_W - M_Power)
                if(LogAusgabeRegelung){log(`${Logparser1} Entladeleistung M_Power=${M_Power} ${Logparser2}`);}
                if(PowerGrid < M_Power ){// Führt zu Netzbezug, Entladeleistung erhöhen
                    M_Power = PowerGrid
                    // Merker um neu Berechnung zu triggern
                    CheckConfig = true;
                    if(LogAusgabeRegelung){log(`${Logparser1} Entladeleistung PowerGrid =${PowerGrid}${Logparser2}`);}
                }   
            }
        }else{
            // Notstrom SOC erreicht und nicht ausreichend PV-Leistung vorhanden
            // Entladen der Batterie stoppen
            bLadenEntladenStoppen = true
            if (DebugAusgabe){log(`Ladesteuerung:-=== Entladen der Batterie stoppen ===-dAkt.getTime() =${dAkt.getTime()}- ZeitE3DC_SetPowerAlt_ms = ${ZeitE3DC_SetPowerAlt_ms} M_Power_alt= ${M_Power_alt} NotstromVerwenden= ${NotstromVerwenden} Notstrom_SOC_erreicht= ${Notstrom_SOC_erreicht} `,'warn')}
        }
   
    
        // Leerlauf beibehalten bis sich der Wert M_Power ändert oder LadenEntladenStoppen true ist
        if(M_Power_alt != maximumLadeleistung_W || M_Power != maximumLadeleistung_W || bLadenEntladenStoppen ){
            
            // Alle 6 sek. muss mindestens ein Steuerbefehl an e3dc.rscp Adapter gesendet werden sonst übernimmt E3DC die Steuerung
            if((bLadenEntladenStoppen != bLadenEntladenStoppen_alt || M_Power != M_Power_alt || (dAkt.getTime()- ZeitE3DC_SetPowerAlt_ms)> 5000) && !LadenAufNotstromSOC){
                ZeitE3DC_SetPowerAlt_ms = dAkt.getTime();
                M_Power_alt = M_Power;
                bLadenEntladenStoppen_alt = bLadenEntladenStoppen
                
                if(M_Power == 0 || bLadenEntladenStoppen){
                    Set_Power_Value_W = 0;
                    await setStateAsync(sID_SET_POWER_MODE,1); // Idle
                    await setStateAsync(sID_SET_POWER_VALUE_W,0)
                    if (LogAusgabeRegelung){log(`${Logparser1}-==== Batterie entladen stoppen 0W. Schritt = ${Schritt} LadenStoppen = ${bLadenEntladenStoppen} SET_POWER_MODE = 1 idle ====-${Logparser2}`,'warn');}
                    bLadenEntladenStoppen = false
                }else if(M_Power == maximumLadeleistung_W ){
                // E3DC die Steuerung überlassen, dann wird mit der maximal möglichen Ladeleistung geladen oder entladen
                    Set_Power_Value_W = 0
                    await setStateAsync(sID_SET_POWER_MODE,0); // Normal
                    if(LogAusgabeRegelung){log(`${Logparser1} -==== Regelung E3DC überlassen. Schritt = ${Schritt} SET_POWER_MODE = 0 normal ====- ${Logparser2}`)}
                
                }else if(M_Power > 0){
                    // Beim ersten aufruf Wert M_Power übernehmen oder wenn Einspeisegrenze erreicht wurde und erst dann langsam erhöhen oder senken
                    if(Set_Power_Value_W < 1 ){Set_Power_Value_W=M_Power}
                    if(M_Abriegelung){Set_Power_Value_W=M_Power+100;M_Abriegelung= false}
                    // Leistung langsam erhöhrn oder senken um Schwankungen auszugleichen
                    if(M_Power > Set_Power_Value_W){
                        Set_Power_Value_W++
                    }else if(M_Power < Set_Power_Value_W){
                        Set_Power_Value_W--
                    }
                    await setStateAsync(sID_SET_POWER_MODE,3); // Laden
                    await setStateAsync(sID_SET_POWER_VALUE_W,Set_Power_Value_W) // E3DC bleib beim Laden im Schnitt um ca 82 W unter der eingestellten Ladeleistung
                    if (LogAusgabeRegelung){log(`${Logparser1}-==== Batterie laden. Schritt = ${Schritt} LadenStoppen = ${bLadenEntladenStoppen} Set_Power_Mode = 3 laden Set_Power_Value_W = ${Set_Power_Value_W} M_Power = ${M_Power} ====-${Logparser2}`,'warn');}
            
                }else if(M_Power < 0 && Batterie_SOC_Proz > Notstrom_SOC_Proz){
                    // Beim ersten aufruf Wert M_Power übernehmen und erst dann langsam erhöhen oder senken
                    if(Set_Power_Value_W >= 0){Set_Power_Value_W=M_Power}
                    if(!CheckConfig){
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
                    if (LogAusgabeRegelung){log(`${Logparser1}-==== Batterie entladen Schritt = ${Schritt} Set_Power_Mode = 2 entladen Set_Power_Value_W = ${Set_Power_Value_W} M_Power = ${M_Power} ====-${Logparser2}`,'warn');}
                }
                
            }
        }
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
        let Notstrom_sockel_Proz = (await getStateAsync(sID_Notstrom_sockel_Proz)).val           // Parameter Charge-Control Notstrom Sockel
        let Notstrom_min_Proz = (await getStateAsync(sID_Notstrom_min_Proz)).val                 // Parameter Charge-Control Notstrom min
        Notstrom_SOC_Proz = Math.round(Notstrom_sockel_Proz + (Notstrom_min_Proz - Notstrom_sockel_Proz) * Math.cos((tm_yday+9)*2*3.14/365))
        await setStateAsync(sID_Notstrom_akt,Notstrom_SOC_Proz)
    }else{
        log(`${Logparser1} -==== Notstromreserve wurde beim Hauskraftwerk eingestellt und wird nicht von Charge-Control gesteuert ====- ${Logparser2}`,'warn')    
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
      log(`${Logparser1} -==== Überschuss PV-Leistung konnte nicht berechnet werden. Ueberschuss=${UeberschussPrognoseProzent} ====- ${Logparser2}`,'error');  
      return  
    }
        
    // Bewölkung für weitere Entscheidung ermitteln
    Bedeckungsgrad12 = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`)).val;
    Bedeckungsgrad15 = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`)).val;
    if (LogAusgabe){log(`${Logparser1} Bewölkungsgrad 12 Uhr Proplanta ${Bedeckungsgrad12}${Logparser2}`);}
    if (LogAusgabe){log(`${Logparser1} Bewölkungsgrad 15 Uhr Proplanta ${Bedeckungsgrad15}${Logparser2}`);}
    if (Number.isNaN(Bedeckungsgrad12) && AutomatikAnwahl || Number.isNaN(Bedeckungsgrad15) && AutomatikAnwahl )
    {
      log(`${Logparser1} -==== Bewölkungsgrad_12 oder Bewölkungsgrad_15 wurde nicht abgerufen. 12=${Bedeckungsgrad12} 15=${Bedeckungsgrad15} ====- ${Logparser2}`,'warn');  
      return  
    }
          
    // Einstellung 1
    // Prognose PV-Leistung geringer als benötigter Eigenverbrauch, Überschuss zu 100% in Batterie speichern
	if (UeberschussPrognoseProzent === 0 && AutomatikAnwahl)
	{
		if (LogAusgabe){log(`${Logparser1}-==== Einstellung 1 aktiv ====-${Logparser2}`);}
        if(EinstellungAnwahl != 1){
            await setStateAsync(sID_EinstellungAnwahl,1);
        }
	}	
	
    // Einstellung 2
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen
    // und keine Bewölkung > 90% 
	if (UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 < BewoelkungsgradGrenzwert && Bedeckungsgrad15 < BewoelkungsgradGrenzwert && AutomatikAnwahl) 
    {
		if (LogAusgabe){log(`${Logparser1}-==== Einstellung 2 aktiv ====-${Logparser2}`);}
        if(EinstellungAnwahl != 2){
            await setStateAsync(sID_EinstellungAnwahl,2);
        }
	}	
	
    // Einstellung 3
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 18:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 >= BewoelkungsgradGrenzwert && Bedeckungsgrad15 >= BewoelkungsgradGrenzwert && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===3))
	{
		if (LogAusgabe){log(`${Logparser1}-==== Einstellung 3 aktiv ====-${Logparser2}`);}
        if(EinstellungAnwahl != 3){
            await setStateAsync(sID_EinstellungAnwahl,3);
        }
	}	
	
    // Einstellung 4
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 12:00 - 15:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 >= BewoelkungsgradGrenzwert && Bedeckungsgrad15 < BewoelkungsgradGrenzwert && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===4))
	{
		if (LogAusgabe){log(`${Logparser1}-==== Einstellung 4 aktiv ====-${Logparser2}`);}
        if(EinstellungAnwahl != 4){
            await setStateAsync(sID_EinstellungAnwahl,4);
        }
    }
	
    // Einstellung 5
    // Prognose PV-Leistung höher als benötigter Eigenverbrauch,Batterie laden und Überschuss ins Netz einspeisen.
	// ab 15:00 - 18:00 Uhr Bewölkung > 90%
	if ((UeberschussPrognoseProzent > 0 && Bedeckungsgrad12 < BewoelkungsgradGrenzwert && Bedeckungsgrad15 >= BewoelkungsgradGrenzwert && AutomatikAnwahl) || (AutomatikAnwahl === false && EinstellungAnwahl ===5))
    {
        if (LogAusgabe){log(`${Logparser1}-==== Einstellung 5 aktiv ====-${Logparser2}`);}
        if(EinstellungAnwahl != 5){
            await setStateAsync(sID_EinstellungAnwahl,5);
        }
	}
    
}

// Die Funktion ändert die Prognosewerte für das Diagramm und berechnet die Prognose in kWh je nach Auswahl 
async function Prognosen_Berechnen()
{
    let Tag =[], PrognoseProplanta_kWh_Tag =[],PrognoseSolcast_kWh_Tag=[],PrognoseSolcast90_kWh_Tag=[],Prognose_kWh_Tag =[];
	let IstSummePvLeistung_kWh = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstSummePvLeistung_kWh`)).val;
    // Array Tag Datum von heute bis + 5 Tag eintragen
    for (let i = 0; i < 7 ; i++){
        Tag[i] = nextDayDate(i).slice(8,10);
    }
    // Array die Aktuellen kWh von Heute + 5 Tage vorraus zuweisen
    for (let i = 0; i < 7 ; i++){
        PrognoseProplanta_kWh_Tag[i] = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${Tag[i]}`)).val;  
        PrognoseSolcast_kWh_Tag[i] = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast_kWh_${Tag[i]}`)).val;  
        PrognoseSolcast90_kWh_Tag[i] = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast90_kWh_${Tag[i]}`)).val;  
    }
    
    if (LogAusgabe){log(`${Logparser1} Prognose Solcast in kWh = ${PrognoseSolcast_kWh_Tag[0]}${Logparser2}`);}
    if (LogAusgabe){log(`${Logparser1} Prognose Solcast 90 Perzentil in kWh = ${PrognoseSolcast90_kWh_Tag[0]}${Logparser2}`);}
    if (LogAusgabe){log(`${Logparser1} Prognose Proplanta in kWh = ${PrognoseProplanta_kWh_Tag[0]}${Logparser2}`);}

    // Berechnung der Prognose nach Einstellung PrognoseAnwahl
    for (let i = 0; i < 7 ; i++){
        if (PrognoseSolcast_kWh_Tag[i] == 0 && PrognoseSolcast90_kWh_Tag[i] == 0 && PrognoseProplanta_kWh_Tag[i] == 0){
            if (LogAusgabe){log(`${Logparser1} -==== Prognose für Tag${i} konnte nicht abgerufen werden ====- ${Logparser2}`)};
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
    if (LogAusgabe){log(`${Logparser1} Prognose_kWh nach Abzug Korrekturfaktor  = ${Prognose_kWh_Tag[0]}${Logparser2}`);}
       
    // Bereits produzierte PV-Leistung muss von der Tagesprognose abgezogen werden 
    // wenn die produzierte PV-Leistung < als Prognose ist.
    if (Prognose_kWh_Tag[0] > IstSummePvLeistung_kWh) {
        Prognose_kWh_Tag[0] = Prognose_kWh_Tag[0]-IstSummePvLeistung_kWh;
        setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh_${Tag[0]}`, Prognose_kWh_Tag[0]+IstSummePvLeistung_kWh);
    }else{
        setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh_${Tag[0]}`, Prognose_kWh_Tag[0]);
    }
    if (LogAusgabe){log(`${Logparser1} Bereits produzierte PV-Leistung  = ${IstSummePvLeistung_kWh}${Logparser2}`);}
    await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseBerechnung_kWh_heute`, Prognose_kWh_Tag[0]);
    // Nur bis ende vom aktuellen Monat werte eintragen, sonst werden die ersten Tage vom aktuellen Monat mit den Werten vom nächsten Monat überschrieben. 
    for (let i = 1; i < 7 ; i++){
        if (Tag[i] == '01'){break;}
        setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh_${Tag[i]}`, Prognose_kWh_Tag[i]);
    }
    
    
    if (LogAusgabe){log(`${Logparser1} Prognose_kWh_heute für Berechnung = ${Prognose_kWh_Tag[0]}${Logparser2}`);}
    
}; 


// Die Funktion berechnet den Überschuss anhand der PrognoseBerechnung_kWh_heute 
// nach Abzug von Eigenverbrauch und Ladekapazität des Batteriespeicher.
async function Ueberschuss_Prozent()
{
    let Ueberschuss_Prozent = 0,Ueberschuss_kWh = 0,FreieKapBatterie_kWh = 0;
    let Rest_Eigenverbrauch_kWh = (await getStateAsync(sID_EigenverbrauchTag)).val;
	let nEigenverbrauchTag = (await getStateAsync(sID_EigenverbrauchTag)).val;
    let Prognose_kWh = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.PrognoseBerechnung_kWh_heute`)).val;
    let AktSpeicherSoC = (await getStateAsync(sID_Batterie_SOC)).val;
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
        if (LogAusgabe){log(`${Logparser1} Eigenverbrauch Tag = ${nEigenverbrauchTag}${Logparser2}`);}
        if (LogAusgabe){log(`${Logparser1} AktSpeicherSoC in % = ${AktSpeicherSoC}${Logparser2}`);}
	    if (LogAusgabe){log(`${Logparser1} Ueberschuss in kWh ${Ueberschuss_kWh} = (Prognose kWh ${Prognose_kWh} - Berechneter Eigenverbrauch ${Rest_Eigenverbrauch_kWh}) - FreieKapBatterie_kWh ${FreieKapBatterie_kWh}${Logparser2}`);}
        if (LogAusgabe){log(`${Logparser1} Ueberschuss in Prozent = ${Ueberschuss_Prozent}${Logparser2}`);}
        return round(Ueberschuss_Prozent, 0);
    
    }else{
        if (LogAusgabe){log(`${Logparser1} -==== PrognoseBerechnung_kWh_heute Variable hat keinen Wert ====- ${Logparser2}`);}
        return null
    }
}

// materialdesing JSON Chart Werte speichern
async function makeJson(){
    let chart = {}
    let values1 = [], values2 = [], values3 = [], values4 = [], values5 = [], axisLabels = [];
    let akkPV_Leistung, akkProgProp, akkProgAuto,akkProgSolcast,akkProgSolcast90;
    let date = new Date();
	let mm = (date.getMonth()+1).toString().padStart(2,"0");
    
    for (let i = 1; i <= 31; i++) {
	    let n= i.toString().padStart(2,"0");
        akkPV_Leistung = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.IstPvLeistung_kWh_${n}`)).val
        akkProgProp = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${n}`)).val
        akkProgSolcast = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast_kWh_${n}`)).val
        akkProgSolcast90 = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast90_kWh_${n}`)).val
        akkProgAuto = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh_${n}`)).val
            
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
    await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${mm}`,JSON.stringify(chart),true);
    //if (DebugAusgabe){log(`${Logparser1} -==== JSON History ertellt ====- ${Logparser2}`);}
}

// Funktion erstellt eine Sicherungsdatei der History JSON vom letzten Monat
async function writelog() {
    let date = new Date();
	let mm = date.getMonth();
    if (mm == 0){mm = 12}
    let MM = mm.toString().padStart(2,"0");
    let Jahr = date.getFullYear()
    let string =MM +"."+ Jahr +"\n"+ (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${MM}`)).val+"\n";
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
    log(`${Logparser1}-==== Speichergroesse_kWh=${Speichergroesse_kWh} ====- ${Logparser2}`)

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

// Addiert zum Datum x Tag und liefert das Datum im Format yyyy-mm-dd
function nextDayDate(days) {
    let today = new Date();
	today.setDate(today.getDate() + days);
    let mm = (today.getMonth()+1).toString().padStart(2,"0"); //January is 0!
    let dd = today.getDate().toString().padStart(2,"0");
    let yyyy = today.getFullYear();
    return yyyy + '-' + mm + '-' + dd;
}

// Summe PV Leistung berechnen Leistungszähler 0 und Leistungszähler 1
async function SummePvLeistung(){   
    let DatumAk = new Date();
	let TagHeute = DatumAk.getDate().toString().padStart(2,"0");
	let IstPvLeistung0_kWh = 0;
	let IstPvLeistung1_kWh = 0;
	let IstPvLeistung_kWh = 0;
	if (existsState(sID_PVErtragLM0)){
	    IstPvLeistung0_kWh = parseFloat(getState(sID_PVErtragLM0).val);
	    //if (DebugAusgabe) {log(`${Logparser1} PV-Leistung Leistungsmesser 0 Heute = ${IstPvLeistung0_kWh}${Logparser2}`);}
	}
	if (existsState(sID_PVErtragLM1)){
	    IstPvLeistung1_kWh = parseFloat(getState(sID_PVErtragLM1).val);
	    //if (DebugAusgabe) {log(`${Logparser1} PV-Leistung Leistungsmesser 1 Heute = ${IstPvLeistung1_kWh}${Logparser2}`);}
	}
	IstPvLeistung_kWh = IstPvLeistung0_kWh + IstPvLeistung1_kWh;
	await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.IstPvLeistung_kWh_${TagHeute}`, IstPvLeistung_kWh);
    await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[1]}.IstSummePvLeistung_kWh`, IstPvLeistung_kWh);
    
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
    let sMinuten = resMinutes.toString().padStart(2,"0");
    // Ausgabe des formatierten Ergebnisses
    return resHours + ":" + sMinuten;
}

// Wetterdaten Proplanta abrufen vor Aufruf main()
async function PrognosedatenAbrufen(){
    await SheduleProplanta()
    // Timer für nächsten Abruf starten
    if(TimerProplanta){clearSchedule(TimerProplanta)};
    let StateZeit = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`)).val;
    if (StateZeit != null){
        StateZeit = addMinutes(StateZeit, 10)
        let t = StateZeit.split(':')
        TimerProplanta = schedule({hour: t[0], minute: t[1]}, function(){PrognosedatenAbrufen();});
    }else{
        TimerProplanta = schedule({hour: 3, minute: 0}, function(){PrognosedatenAbrufen();});
        log(`${Logparser1}-==== Nächste Aktualisierung Wetterdaten 3:00 Uhr ====-${Logparser2}`)
    }
    main();
}

// Prognose Proplanta abrufen.
async function InterrogateProplanta(){
    return new Promise(function(resolve, reject){
        xhr.onload = function(){
            if (xhr.readyState ==4){
                if(xhr.status < 200 || xhr.status > 206 || xhr.responseText == null){
                    reject('Error Proplanta, status code = '+ xhr.status)
                }else{
                    resolve(xhr.responseText)
                }
            }
        }
        xhr.open("GET",baseurl, true);
        xhr.responseType = "text";
		xhr.send();
    
    });
}

async function SheduleProplanta() { 
    if (baseurl == null || typeof baseurl === undefined) {
        log(`${Logparser1}-==== falsche Länderbezeichnung! ====-${Logparser2}`);
    }else{
        // alle alten Werte löschen
        for (let i = 0; i <= 6; i++) {
            await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_${i}`, 'null');
            if(i <=3){
                await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Max_Temperatur_Tag_${i}`, NaN);
                await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Min_Temperatur_Tag_${i}`, NaN);       
            }
        }
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`, NaN);
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`, NaN);
        
        if (LogAusgabe){log(`${Logparser1} ******************* Es wird die Globalstrahlung ab Tag 0 von Proplanta abgerufen ******************* ${Logparser2}`);}
        // Url mit Länderbezeichnung zusammenstellen
        baseurl = baseurl.replace(/#PLZ#/ig, ProplantaPlz).replace(/#ORT#/ig, ProplantaOrt).replace(/&wT=4/ig, '&wT=0');
        await InterrogateProplanta().then(async function(result0){
            let GlobalstrahlungTag0,GlobalstrahlungTag1,GlobalstrahlungTag2,GlobalstrahlungTag3;
            if (LogAusgabe){log(`${Logparser1} Rueckmeldung InterrogateProplanta XHR.Status= ${xhr.status}${Logparser2}`)}
            let ArrayBereinig = await HTML_CleanUp(result0)    
            
            // Prüfen ob Globalstrahlung für heute in eine Zahl umgewandelt werden kann,wenn nicht noch mal nach 1 Stunde abrufen
            if (isNaN(parseFloat(ArrayBereinig[13]))){
                GlobalstrahlungTag0 = 0;
                xhr.abort
                let d = new Date();
                let uhrzeit = addMinutes(d.getHours() + ":" + d.getMinutes(), 60)
                setState(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`,uhrzeit);
                if(LogAusgabe){log(`${Logparser1} Näste Aktualisierung Wetterdaten =${uhrzeit} Uhr ${Logparser2}`)}

            }else{
                let Tag0 = nextDayDate(0).slice(8,10), Tag1 = nextDayDate(1).slice(8,10),Tag2 = nextDayDate(2).slice(8,10), Tag3 =nextDayDate(3).slice(8,10);
                // Prüfen ob Werte in eine Zahl umgewandelt werden können,wenn nicht 0 zuweisen     
                for (let i=0; i < ArrayBereinig.length; i++) {
                    //if (DebugAusgabe){log(`i =${i} Wert ab Tag 0=${ArrayBereinig[i]}`);}
                    
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
                        if (/^\d{2}([./-])\d{2}\1\d{4}$/.test(ArrayBereinig[i+5] )){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Datum_Tag_3`, ArrayBereinig[i+7]);}
                    }
                    if (ArrayBereinig[i] == 'Bedeckungsgrad'){
                        if (isNaN(parseFloat(ArrayBereinig[i+2]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_12`, parseFloat(ArrayBereinig[i+2]));}      
                        if (isNaN(parseFloat(ArrayBereinig[i+8]))){setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`, NaN);}else{setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.Bewoelkungsgrad_15`, parseFloat(ArrayBereinig[i+8]));}
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
                if(LogAusgabe){log(`${Logparser1} Globalstrahlung Tag0 =${GlobalstrahlungTag0}  Globalstrahlung Tag1 =${GlobalstrahlungTag1}  Globalstrahlung Tag2 =${GlobalstrahlungTag2}  Globalstrahlung Tag3 =${GlobalstrahlungTag3}${Logparser2}`)}
                let PrognoseProplanta_kWh_Tag0 = (GlobalstrahlungTag0 * nModulFlaeche) * (nWirkungsgradModule/100);
                let PrognoseProplanta_kWh_Tag1 = (GlobalstrahlungTag1 * nModulFlaeche) * (nWirkungsgradModule/100);
                let PrognoseProplanta_kWh_Tag2 = (GlobalstrahlungTag2 * nModulFlaeche) * (nWirkungsgradModule/100);
                let PrognoseProplanta_kWh_Tag3 = (GlobalstrahlungTag3 * nModulFlaeche) * (nWirkungsgradModule/100);
                setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${Tag0}`, PrognoseProplanta_kWh_Tag0);
                if (Tag1!= '01'){
                    setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${Tag1}`, PrognoseProplanta_kWh_Tag1);
                    if (Tag2!= '01'){
                        setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${Tag2}`, PrognoseProplanta_kWh_Tag2);
                        if (Tag3!= '01'){
                            setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${Tag3}`, PrognoseProplanta_kWh_Tag3);
                        }
                    }
                }
                await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`,ArrayBereinig[40].replace(".",":"));
                if(LogAusgabe){log(`${Logparser1} Näste Aktualisierung Wetterdaten =${ArrayBereinig[40].replace(".",":")} Uhr ${Logparser2}`)}
            
            }
        }, function(error) {
                log (`${Logparser1} Error in der function InterrogateProplanta. Fehler = ${error} ${Logparser2}`, 'warn')
                // Nach einer Stunde neuer Versuch die Daten abzurufen
                let d = new Date();
                d.setHours (d.getHours() + 1);
                let  uhrzeit = `${d.getHours()}:${d.getMinutes()}`;
                setState(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`,uhrzeit);
                if(LogAusgabe){log(`${Logparser1} Näste Aktualisierung Wetterdaten =${uhrzeit} Uhr ${Logparser2}`)}
        })   
        
        if (LogAusgabe){log(`${Logparser1} ******************* Es wird die Globalstrahlung ab Tag 4 von Proplanta abgerufen ******************* ${Logparser2}`);}
        // Url mit Länderbezeichnung zusammenstellen
        baseurl = baseurl.replace(/#PLZ#/ig, ProplantaPlz).replace(/#ORT#/ig, ProplantaOrt).replace(/&wT=0/ig, "&wT=4");
        await InterrogateProplanta().then(async function(result4){
            let GlobalstrahlungTag4,GlobalstrahlungTag5,GlobalstrahlungTag6;
            if (LogAusgabe){log(`${Logparser1} Rueckmeldung InterrogateProplanta XHR.Status= ${xhr.status}${Logparser2}`)}
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
            
            let Tag0 = nextDayDate(4).slice(8,10), Tag1 = nextDayDate(5).slice(8,10),Tag2 = nextDayDate(6).slice(8,10);
            // Prüfen ob Werte in eine Zahl umgewandelt werden können,wenn nicht 0 zuweisen     
               
            // Proplanta Globalstrahlung in kWh umrechnen und in History speichern *********************************************************  
            if(LogAusgabe){log(`${Logparser1} Globalstrahlung Tag4 =${GlobalstrahlungTag4}  Globalstrahlung Tag5 =${GlobalstrahlungTag5}  Globalstrahlung Tag6 =${GlobalstrahlungTag6}${Logparser2}`)}
            let PrognoseProplanta_kWh_Tag4 = (GlobalstrahlungTag4 * nModulFlaeche) * (nWirkungsgradModule/100);
            let PrognoseProplanta_kWh_Tag5 = (GlobalstrahlungTag5 * nModulFlaeche) * (nWirkungsgradModule/100);
            let PrognoseProplanta_kWh_Tag6 = (GlobalstrahlungTag6 * nModulFlaeche) * (nWirkungsgradModule/100);
            if (Tag0!= '01'){
                setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${Tag0}`, PrognoseProplanta_kWh_Tag4);
                if (Tag1!= '01'){
                    setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${Tag1}`, PrognoseProplanta_kWh_Tag5);
                    if (Tag2!= '01'){
                        setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${Tag2}`, PrognoseProplanta_kWh_Tag6);
                    }
                }
            }
            
        
        }, function(error) {
                log (`${Logparser1}-==== Error in der function InterrogateProplanta. Fehler = ${error} ====- ${Logparser2}`,'warn')
                // Nach einer Stunde neuer Versuch die Daten abzurufen
                let d = new Date(), Stunde = d.getHours();
                d.setHours (Stunde + 1);
                let  uhrzeit = `${d.getHours()}:${d.getMinutes()}`;
                setState(`${instanz}.${PfadEbene1}.${PfadEbene2[3]}.NaesteAktualisierung`,uhrzeit);
                if(LogAusgabe){log(`${Logparser1} Näste Aktualisierung Wetterdaten =${uhrzeit} Uhr ${Logparser2}`)}
        })
    }
}


// Proplanta HTML Tags löschen und Daten bereinigen
function HTML_CleanUp(data) {
    //index von "max. Temperatur" 
    let idx_MaxTempStart = data.indexOf('max. Temperatur');
    let idx_MaxTempEnde = data.indexOf('gef&uuml;hlte max. Temp.');
    let maxTemperatur = data.slice(idx_MaxTempStart,idx_MaxTempEnde)
    //log(`${Logparser1} maxTemperatur = ${maxTemperatur}${Logparser2}`)
    //index von "max. Temperatur" 
    let idx_MinTempStart = data.indexOf('min. Temperatur');
    let idx_MinTempEnde = data.indexOf('gef&uuml;hlte min. Temp.');
    let minTemperatur = data.slice(idx_MinTempStart,idx_MinTempEnde)
    //log(`${Logparser1} Temperatur = ${Temperatur} ${Logparser2}`)
    //index von "Globalstrahlung"
    let idx_GlobalstrahlungStart = data.indexOf('Globalstrahlung');
    let idx_GlobalstrahlungEnde = data.indexOf('<b>Wetterzustand</b>');
    let Globalstrahlung = data.slice(idx_GlobalstrahlungStart,idx_GlobalstrahlungEnde)
    //log(`${Logparser1} Globalstrahlung = ${Globalstrahlung} ${Logparser2}`)
    //index von "Bedeckungsgrad"
    let idx_BedeckungsgradStart = data.indexOf('<tr id="BD_12" class="BEDECKUNGSGRAD">');
    let idx_BedeckungsgradEnde = data.indexOf('<tr id="BD_18" class="BEDECKUNGSGRAD">');
    let Bedeckungsgrad = data.slice(idx_BedeckungsgradStart,idx_BedeckungsgradEnde)
    Bedeckungsgrad = 'Bedeckungsgrad'+Bedeckungsgrad;
    //log(`${Logparser1} Bedeckungsgrad = ${Bedeckungsgrad} ${Logparser2}`)
    //index von "Datum"
    let idx_DatumStart = data.indexOf('<b>Datum</b');
    let idx_DatumEnde = data.indexOf('<style>',idx_DatumStart);
    let Datum = data.slice(idx_DatumStart,idx_DatumEnde)
    //log(`${Logparser1} Datum = ${Datum} ${Logparser2}`)
    //index von "nächste Aktualisierung"
    let idx_nextAktStart = data.indexOf('n&auml;chste Aktualisierung');
    let idx_nextAktEnde = idx_nextAktStart+38;
    let nextAktZeit = data.slice(idx_nextAktStart+28,idx_nextAktEnde-3)
    //log(`${Logparser1} nextAktZeit = ${nextAktZeit}${Logparser2})
    let StringProplanta = maxTemperatur + minTemperatur + Globalstrahlung + Bedeckungsgrad + Datum + nextAktZeit
    // HTML Tags löschen und Daten bereinigen 
    StringProplanta = StringProplanta.replace(/<\/tr>/ig, "\n").replace(/<\/table>/ig, "").replace(/<\/td>/ig, "|").replace(/&deg;C/ig, "");
    StringProplanta = StringProplanta.replace(/(<script(.|\n|\r)+?(?=<\/sc)<\/script>|<style(.|\n|\r)+?(?=<\/)<\/style>)/ig, "");
    StringProplanta = StringProplanta.replace(/(&nbsp;|<([^>]+)>)/ig, '|');
    StringProplanta = StringProplanta.replace(/&#48;/g, '0').replace(/&#49;/g, '1').replace(/&#50;/g, '2').replace(/&#51;/g, '3').replace(/&#52;/g, '4').replace(/&#53;/g, '5').replace(/&#54;/g, '6').replace(/&#55;/g, '7').replace(/&#56;/g, '8').replace(/&#57;/g, '9');
    StringProplanta = StringProplanta.replace(/&#([^;]+);/g, '|');
    StringProplanta = StringProplanta.replace(/(%|\r)/g, '').replace(/(kWh\/qm|\r)/g, '').replace(/,/g, '.');
    //log(`${Logparser1} StringProplanta = ${StringProplanta}${Logparser2}`)
    // Array aus restlichen Daten erstellen     
    let ArrayProplanta = StringProplanta.split('|');    
    // Alle Werte löschen die leer sind       
    let ArrayBereinig = ArrayProplanta.filter(function(e){ return e.replace(/(\r\n|\n|\r)/gm,"")});
    return ArrayBereinig;
}    


// Prognose Solcast PV-Leistung in kW je Dachfläche abrufen.
async function InterrogateSolcast(DachFl){
    return new Promise(function(resolve, reject){
        xhr2.onload = function(){
            if (xhr2.readyState ==4){
                if(xhr2.status < 200 || xhr2.status > 206 || xhr2.responseText == null){
                    reject(`Error, status code = ${xhr2.status}`)
                }else{
                    resolve(xhr2.responseText)
                }
            }
        }
        if (DachFl==1 || DachFl==2){
            xhr2.open("GET",`https://api.solcast.com.au/rooftop_sites/${Resource_Id_Dach[DachFl]}/forecasts?format=json&api_key=${SolcastAPI_key}&hours=168`, true);
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
            if (LogAusgabe){log(`${Logparser1} ****************************** Es wird Solcast Dach ${z} abgerufen ****************************** ${Logparser2}`);}
            await InterrogateSolcast(z).then(async function(result){
                let objDaten = JSON.parse(result)
                log(`${Logparser1} Rueckmeldung XHR.Status Solcast= ${xhr2.status}${Logparser2}`)
                //log(`${Logparser1} DAten= ${JSON.stringify(objDaten)${Logparser2}`)
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
                        log(`${Logparser1} Summe PV Leistung Tag ${Datum} pv_estimate= ${round(SummePV_Leistung_Tag_kW[1][d]/2,2)} pv_estimate90= ${round(SummePV_Leistung_Tag_kW[3][d]/2,2)}${Logparser2}`)
                        if (Datum.slice(5,7) == Monat) {
                            // Nach 4 Uhr die Werte vom aktuellen Tag nicht überschreiben
                            if (toInt(dAkt.getHours()) <= 4 || d != 0){
                                setState(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast_kWh_${Datum.slice(8,10)}`,round(SummePV_Leistung_Tag_kW[1][d]/2,2));
                                setState(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast90_kWh_${Datum.slice(8,10)}`,round(SummePV_Leistung_Tag_kW[3][d]/2,2));
                            }
                        }
                        SummePV_Leistung_Tag_kW[1][d] = 0;
                        SummePV_Leistung_Tag_kW[3][d] = 0;
                    }
                }
                
            }, function(error) {
                log (`${Logparser1}-==== Error in der function InterrogateSolcast. Fehler = ${error} ====-${Logparser2}`,'warn')
            })   
        }
        if(!bStart){main();}      
    }
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
    RB_AstroSolarNoon = getAstroDate("solarNoon");
    RE_AstroSolarNoon = getAstroDate("solarNoon");
    LE_AstroSunset = getAstroDate("sunset");

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
    
    await setStateAsync(sID_Regelbeginn_MEZ,`${RB_AstroSolarNoon.getHours().toString().padStart(2,"0")}:${RB_AstroSolarNoon.getMinutes().toString().padStart(2,"0")}`);
    await setStateAsync(sID_Regelende_MEZ,`${RE_AstroSolarNoon.getHours().toString().padStart(2,"0")}:${RE_AstroSolarNoon.getMinutes().toString().padStart(2,"0")}`);
    await setStateAsync(sID_Ladeende_MEZ,`${LE_AstroSunset.getHours().toString().padStart(2,"0")}:${LE_AstroSunset.getMinutes().toString().padStart(2,"0")}`);
}


// Prüfen ob Notstrom verwendet werden kann bei hoher PV Prognose für den nächsten Tag
function CheckPrognose(){
    //if (DebugAusgabe){log(`CheckPrognose: Batterie SOC = ${Batterie_SOC_Proz} Notstrom_SOC_Proz= ${Notstrom_SOC_Proz}`)}
    if (Batterie_SOC_Proz <= Notstrom_SOC_Proz){
        let heute = new Date
        let morgen = new Date(heute.getFullYear(), heute.getMonth(), heute.getDate() + 1);
        let Durschnitt_Wh = getState(sID_EigenverbrauchDurchschnitt_kWh).val*1000
        let KapBatterie_Wh = (Speichergroesse_kWh/100)*Batterie_SOC_Proz*1000;
        let sunriseEndTimeHeute_ms = getAstroDate("sunriseEnd").getTime()+Offset_sunriseEnd_min*60000;
        let sunriseEndTimeMorgen_ms = getAstroDate("sunriseEnd",morgen).getTime()+Offset_sunriseEnd_min*60000;
        let ReichweiteMinuten = parseFloat(((KapBatterie_Wh/Durschnitt_Wh)*60).toFixed(0));
        let ReichweiteTime_ms = new Date(heute.getTime() + ReichweiteMinuten*60000).getTime()
        
        // Prüfen ob aktuelle Zeit vor oder nach sunriseEnd liegt
        //if (DebugAusgabe){log(`CheckPrognose: sunriseEnd ms = ${sunriseEndTimeHeute_ms} Aktuelle Zeit ms = ${heute.getTime()}`)}  
        if (sunriseEndTimeHeute_ms < heute.getTime()){
            // Nach Sonnenaufgang
            //if (DebugAusgabe){log(`CheckPrognose: Nach Sonnenaufgang`)}
            let Tag = nextDayDate(1).slice(8,10);
            let PrognoseMorgen_kWh = getState(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh_${Tag}`).val
            //if (DebugAusgabe){log(`CheckPrognose: Reichweite ms =${ReichweiteTime_ms} Reichweite Stunden =${round((ReichweiteTime_ms-heute.getTime())/3600000,2)} sunriseEndTimeMorgen_ms = ${sunriseEndTimeMorgen_ms} sunriseEndTimeMorgen Stunden =${round((sunriseEndTimeMorgen_ms-heute.getTime())/3600000,2)} PrognoseMorgen_kWh =${PrognoseMorgen_kWh} minWertPrognose_kWh =${minWertPrognose_kWh}`)}
            // Prüfen ob die Reichweite Batterie SOC größer ist als Sonnenaufgang + offset
            if(ReichweiteTime_ms > sunriseEndTimeMorgen_ms && PrognoseMorgen_kWh > minWertPrognose_kWh && minWertPrognose_kWh > 0){
                // Batterie reicht bis zum Sonnenaufgang, es kann entladen werden
                if (LogAusgabe && Notstrom_SOC_erreicht){log(`${Logparser1}-==== Freigabe Notstrom nach Sonnenaufgang. ====-${Logparser2}`)}
                HeuteNotstromVerbraucht = true;
                return true
            }
        }else{
            // Vor Sonnenaufgang
            //if (DebugAusgabe){log(`CheckPrognose: Vor Sonnenaufgang`)}
            let Tag = nextDayDate(0).slice(8,10);
            let PrognoseMorgen_kWh = getState(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh_${Tag}`).val
            //if (DebugAusgabe){log(`CheckPrognose: Reichweite ms =${ReichweiteTime_ms} Reichweite Stunden =${round((ReichweiteTime_ms-heute.getTime())/3600000,2)} sunriseEndTimeHeute_ms = ${sunriseEndTimeHeute_ms} sunriseEndTimeHeute Stunden =${round((sunriseEndTimeHeute_ms-heute.getTime())/3600000,2)} PrognoseMorgen_kWh =${PrognoseMorgen_kWh} minWertPrognose_kWh =${minWertPrognose_kWh}`)}
            // Prüfen ob die Reichweite Batterie SOC größer ist als Sonnenaufgang + offset
            if(ReichweiteTime_ms > sunriseEndTimeHeute_ms && PrognoseMorgen_kWh > minWertPrognose_kWh && minWertPrognose_kWh > 0){
                // Batterie reicht bis zum Sonnenaufgang, es kann entladen werden
                if (LogAusgabe && Notstrom_SOC_erreicht){log(`${Logparser1}-==== Freigabe Notstrom vor Sonnenaufgang. ====-${Logparser2}`)}
                HeuteNotstromVerbraucht = true;
                return true
            }
    
        }
    }
    return false
}

// Leistungsmesser0 jede minute in W/h umrechen W = P*t
function Wh_Leistungsmesser0() {
  let AufDieMinute = '* * * * *';
  Timer0 = schedule(AufDieMinute, () => {
    let Pmin = Summe0 / count0 || 0;
    if (count0 > 0 && Summe0 > 0) {
      setState(sID_PVErtragLM0, getState(sID_PVErtragLM0).val + Pmin / 60 / 1000, true); 
      setTimeout(() => { count0 = Summe0 = 0; }, 100);
    } else if (count0 === 0 && Summe0 === 0) {
      clearSchedule(Timer0);
      Timer0 = null;
    }
  });
}

// Leistungsmesser1 jede minute in W/h umrechen W = P*t
function Wh_Leistungsmesser1(){
	let AufDieMinute =  '* * * * *';
	Timer1 = schedule(AufDieMinute, () => {   
		let Pmin = Summe1/count1;
		if(count1>0 && Summe1 >0){
			setState(sID_PVErtragLM1, getState (sID_PVErtragLM1).val + Pmin/60/1000,true);//kWh
			setTimeout(() => { count1 = Summe1 = 0;},100);
		}else if (count1===0 && Summe1 ===0) {
			clearSchedule(Timer1);
			Timer1=null;
        }  
    });
} 

// Leistungsmesser2 jede minute in W/h umrechen W = P*t
function Wh_Leistungsmesser2(){
	let AufDieMinute =  '* * * * *';
	Timer2 = schedule(AufDieMinute, () => {   
		let Pmin = Summe2/count2;
		if(count2>0 && Summe2 >0){
			setState(sID_PVErtragLM2, getState (sID_PVErtragLM2).val + Pmin/60/1000,true);//kWh
			setTimeout(() => {count2= Summe2 = 0;},100);
		}else if(count2===0 && Summe2 ===0){
				clearSchedule(Timer2);
				Timer2=null;
        }  
    });
} 

// Leistungsmesser3 jede minute in W/h umrechen W = P*t
function Wh_Leistungsmesser3(){
	let AufDieMinute =  '* * * * *';
	Timer3 = schedule(AufDieMinute, () => {   
		let Pmin = Summe3/count3;
		if(count3>0 && Summe3 >0){
			setState(sID_PVErtragLM3, getState (sID_PVErtragLM3).val + Pmin/60/1000,true);//kWh
			setTimeout(() => {count3= Summe3 = 0;},100);
		}else if(count3===0 && Summe3 ===0){
				clearSchedule(Timer3);
				Timer3 = null;
        }  
    });
}

async function BatterieLaden(){
    let Akk_max_Charge_Power_W = (await getStateAsync(sID_Max_Charge_Power_W)).val;                     // Aktuell eingestellte Ladeleistung 
    let LadeleistungBat = Akk_max_Charge_Power_W /2;
    await setStateAsync(sID_SET_POWER_MODE,3); // Charge
    await setStateAsync(sID_SET_POWER_VALUE_W,LadeleistungBat)
}

// Batterie bis auf Notstrom SOC laden
async function LadeNotstromSOC(){
    let nbr_Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val                             // Berechneter Notstrom SOC
    Batterie_SOC_Proz = (await getStateAsync(sID_Batterie_SOC)).val;                                    // Aktueller Batterie SOC E3DC 
    while (!(Batterie_SOC_Proz >= nbr_Notstrom_SOC_Proz)) {
        await BatterieLaden();
        await new Promise(resolve => setTimeout(resolve, 4000)); // alle 5 Sekunde wiederholen sonst übernimmt E3DC die Regelung
        Batterie_SOC_Proz = (await getStateAsync(sID_Batterie_SOC)).val;
        if ((await getStateAsync(sID_Notrom_Status)).val == 4 || (await getStateAsync(sID_Notrom_Status)).val == 1){break;}
    }
    LadenAufNotstromSOC=false
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
    if(!Timer2)Wh_Leistungsmesser2();
    count2 ++
	Summe2 = Summe2 + obj.state.val;
});

// Zaehler LM3
// Verbrauch von 0:00 Uhr bis 8:00 Uhr berechnen.
on(sID_Power_Home_W, function(obj) {
    if (Zeitbereich("00:00","08:00")) {
        let Leistung = Math.abs(getState(obj.id).val);
        if(Leistung > 0){
		    if(!Timer3)Wh_Leistungsmesser3();
		    count3 ++
		    Summe3 = Summe3 + Leistung;
	    }
    }else if(getState(sID_PVErtragLM3).val > 0){
        setState(sID_EigenverbrauchDurchschnitt_kWh,round(getState(sID_PVErtragLM3).val/8,3))
        clearSchedule(Timer3);
		Timer3 = null;
        setState(sID_PVErtragLM3,0)
    
    }
});

// Wird aufgerufen wenn State NotstromAusNetz in VIS geändert wird
on({id: sID_NotstromAusNetz, change: "ne"}, async function (obj){
	NotstromAusNetz = (await getStateAsync(obj.id)).val;
    if(NotstromAusNetz) {
        if (LogAusgabe){log(`${Logparser1} -==== Notstrom SOC aus Netz nachladen eingeschaltet ====- ${Logparser2}`);}
    }else{
        if (LogAusgabe){log(`${Logparser1} -==== Notstrom SOC aus Netz nachladen ausgeschaltet ====- ${Logparser2}`);}
    }
});  

// Wird aufgerufen wenn State Automatik Prognose in VIS geändert wird
on({id: sID_Automatik_Prognose, change: "ne"}, async function (obj){
	 AutomatikAnwahl = (await getStateAsync(obj.id)).val;
     if(AutomatikAnwahl) {
        if (LogAusgabe){log(`${Logparser1} -==== Automatik Einstellung über Prognose gestartet ====- ${Logparser2}`);}
        main();
    }else{
        if (LogAusgabe){log(`${Logparser1} -==== Automatik Einstellung über Prognose gestoppt ====- ${Logparser2}`);}
        await setStateAsync(sID_EinstellungAnwahl,0);
        EinstellungAnwahl = 0
    }
});  

// Wird aufgerufen wenn State Automatik Regelung in VIS geändert wird
on({id: sID_Automatik_Regelung, change: "ne"}, async function (obj){
	 AutomatikRegelung = getState(obj.id).val;
     if(AutomatikRegelung) {
        if (LogAusgabe){log(`${Logparser1} -==== Automatik Laderegelung eingeshaltet ====- ${Logparser2}`);}
    }else{
        if (LogAusgabe){log(`${Logparser1} -==== Automatik Laderegelung gestoppt Laden/Entladen der Batterie ist eingeschaltet ====- ${Logparser2}`);}
        if ((await getStateAsync(sID_Max_Discharge_Power_W)).val == 0 || (await getStateAsync(sID_DISCHARGE_START_POWER)).val == 0 || (await getStateAsync(sID_Max_Charge_Power_W)).val == 0){
            await setStateAsync(sID_Max_Discharge_Power_W, Bat_Discharge_Limit_W)
            await setStateAsync(sID_DISCHARGE_START_POWER, startDischargeDefault)
            await setStateAsync(sID_Max_Charge_Power_W, maximumLadeleistung_W)
        }
    }
});  

// Bei Änderung Eigenverbrauch soll der Überschuss neu berechnet werden.
on({id: sID_EigenverbrauchTag, change: "ne"}, function (obj){
	if (LogAusgabe){log(`${Logparser1} -==== Wert Eigenverbrauch wurde auf  ${getState(obj.id).val} kWh geändert ====- ${Logparser2}`);}
    main();
});  


// Wird aufgerufen wenn State HistorySelect in VIS geändert wird
on({id: sID_AnzeigeHistoryMonat, change: "ne"}, async function (obj){
	let Auswahl = (await getStateAsync(obj.id)).val
    let Auswahl_0 = Auswahl.toString().padStart(2,"0");
    if (Auswahl<=12){
        let JsonString = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${Auswahl_0}`)).val;
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON`,JsonString);
    }else{
        log(`${Logparser1} State ${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistorySelect darf nicht > 12 sein  ${Logparser2}`,'warn');
    }
}); 


// Wird aufgerufen wenn sich an den States HistoryJSON_xx was ändert um in VIS immer das aktuelle 
// Diagramm anzuzeigen
on({id: /\.HistoryJSON_/, change: "ne"}, async function (){	
    let Auswahl = (await getStateAsync(sID_AnzeigeHistoryMonat)).val;
    let Auswahl_0 = Auswahl.toString().padStart(2,"0");
    if (Auswahl<=12){
        let JsonString = (await getStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON_${Auswahl_0}`)).val;
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistoryJSON`,JsonString);
        //if (LogAusgabe){log(`${Logparser1} HistoryJSON_ ${ Auswahl_0} wurde unter HistoryJSON gespeichert ${Logparser2}`);}
    }else{
        log(`${Logparser1} State ${instanz}.${PfadEbene1}.${PfadEbene2[2]}.HistorySelect darf nicht > 12 sein  ${Logparser2}`, 'warn');
    }
});

// Wird aufgerufen wenn sich an den States .USER_ANPASSUNGEN was ändert
on({id: /\.USER_ANPASSUNGEN/, change: "ne"}, async function (obj){	
    log(`${Logparser1}-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-${Logparser2}`,'warn')
    await CheckState();
});


// Bei Änderung der PrognoseAnwahl, Einstellung 0-5 in VIS, jeweilige Prognose abrufen
on({id: sID_PrognoseAnwahl, change: "ne"},async function(obj) {
    PrognoseAnwahl = (await getStateAsync(obj.id)).val
    if (PrognoseAnwahl <= 6){
        if(LogAusgabe && PrognoseAnwahl == 0){log("-==== Proplanta u. Solcast angewählt, Berechnung nach min. Wert ====-")};
        if(LogAusgabe && PrognoseAnwahl == 1){log("-==== Proplanta angewählt ====-")};
        if(LogAusgabe && PrognoseAnwahl == 2){log("-==== Solcast angewählt ====-")};
        if(LogAusgabe && PrognoseAnwahl == 3){log("-==== Proplanta u. Solcast angewählt, Berechnung nach max. Wert ====-")};
        if(LogAusgabe && PrognoseAnwahl == 4){log("-==== Proplanta u. Solcast angewählt, Berechnung nach Ø Wert ====-")};
        if(LogAusgabe && PrognoseAnwahl == 5){log("-==== Solcast 90 angewählt ====-")};
        if(LogAusgabe && PrognoseAnwahl == 6){log("-==== Solcast 90 u. Solcast angewählt, Berechnung nach Ø Wert ====-")};
        main();
    }else{
        log(`${Logparser1} -==== Falscher Wert State PrognoseAnwahl ====- ${Logparser2}`,'warn');
    }
});

// Bei Betättigung der Button Einstellung 1-5 in VIS jeweilige Einstellung laden und automatik ausschalten
on({id: sID_EinstellungAnwahl, change: "ne",valGt: 0}, async function (obj){
    if(AutomatikAnwahl== true){
        EinstellungAnwahl = obj.state.val
        CheckConfig = true
        await MEZ_Regelzeiten();
        if (obj.state.val != 0 && obj.state.val <= 5 ){
            if(LogAusgabe)log("-==== Trigger manuelle Programmvorwahl ====-");
            main();
        }
    }else{
        await setStateAsync(sID_UntererLadekorridor_W[0],getState(sID_UntererLadekorridor_W[obj.state.val]).val)
        await setStateAsync(sID_Ladeschwelle_Proz[0],getState(sID_Ladeschwelle_Proz[obj.state.val]).val)
        await setStateAsync(sID_Ladeende_Proz[0],getState(sID_Ladeende_Proz[obj.state.val]).val)
        await setStateAsync(sID_Ladeende2_Proz[0],getState(sID_Ladeende2_Proz[obj.state.val]).val)
        await setStateAsync(sID_RegelbeginnOffset[0],getState(sID_RegelbeginnOffset[obj.state.val]).val)
        await setStateAsync(sID_RegelendeOffset[0],getState(sID_RegelendeOffset[obj.state.val]).val)
        await setStateAsync(sID_LadeendeOffset[0],getState(sID_LadeendeOffset[obj.state.val]).val)
        await setStateAsync(sID_Unload_Proz[0],getState(sID_Unload_Proz[obj.state.val]).val)
        EinstellungAnwahl = 0
        await setStateAsync(sID_EinstellungAnwahl,0);
        await MEZ_Regelzeiten();
    }
});


// Triggern wenn sich an den Notstrom Werten was ändert
on({id: arrayID_Notstrom, change: "ne"}, async function (obj) {
    await Notstromreserve(); 
});

// Triggern wenn sich an Einstellung 1 was ändert
on({id: arrayID_Parameter1, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==1){
        log(`${Logparser1}-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-${Logparser2}`,'warn')
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an Einstellung 2 was ändert
on({id: arrayID_Parameter2, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==2){
        log(`${Logparser1}-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-${Logparser2}`,'warn')
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an Einstellung 3 was ändert
on({id: arrayID_Parameter3, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==3){
        log(`${Logparser1}-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-${Logparser2}`,'warn')
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an Einstellung 4 was ändert
on({id: arrayID_Parameter4, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==4){
        log(`${Logparser1}-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-${Logparser2}`,'warn')
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an Einstellung 5 was ändert
on({id: arrayID_Parameter5, change: "ne"}, async function (obj) {
    if(EinstellungAnwahl==5){
        log(`${Logparser1}-==== User Parameter ${obj.id.split('.')[4]} wurde in ${obj.state.val} geändert ====-${Logparser2}`,'warn')
        await MEZ_Regelzeiten();
        CheckConfig = true
    }
});

// Triggern wenn sich an den Batterie Leistungswerten oder Spannung was ändert
on({id: sID_BAT0_Alterungszustand, change: "ne"}, async function (obj) {
    await Speichergroesse();
    CheckConfig = true
    log(`${Logparser1} -==== Speichergröße hat sich geändert Speichergroesse_kWh = ${Speichergroesse_kWh} ====- ${Logparser2}`,'warn')
});

// Batterie Kapazität in kWh berechnen wenn sich der SOC in % ändert
on({id: sID_Batterie_SOC, change: "ne"}, async function (obj) {
    let BatSoc = obj.state.val;   
    await setStateAsync(sID_BatSoc_kWh,Math.round((Speichergroesse_kWh*(Systemwirkungsgrad_Pro/100) * BatSoc))/100,true);
    
});


// Batterie Autonomiezeit berechnen bei Entnahme Starten
on({id: sID_Power_Bat_W, change: "ne",valLt: 0}, async function (obj) {
    let Notstrom_kWh = 0;
    let Batterie_SOC_kWh = (Speichergroesse_kWh/100)*(await getStateAsync(sID_Batterie_SOC)).val; 
    // Aktuelle Notstromreserve Charge-Control prüfen
    if (Notstrom_SOC_Proz == 0) {
        // Charge-Control keine Notstromreserve prüfe E3DC
        Notstrom_kWh = (await getStateAsync(sID_PARAM_EP_RESERVE_W)).val/1000
    }else{
        Notstrom_kWh = (Speichergroesse_kWh/100)*Notstrom_SOC_Proz
    }
    let ReichweiteAktVerbrauch =(((Batterie_SOC_kWh-Notstrom_kWh)*(Systemwirkungsgrad_Pro/100))*1000)/Math.abs(obj.state.val)
    const hours = Math.floor(ReichweiteAktVerbrauch);
    const minutes = Math.round((ReichweiteAktVerbrauch - hours) * 60);

    if (ReichweiteAktVerbrauch > ReichweiteAktVerbrauchAlt + 0.5 || ReichweiteAktVerbrauch < ReichweiteAktVerbrauchAlt - 0.5){ 
        ReichweiteAktVerbrauchAlt = ReichweiteAktVerbrauch
        await setStateAsync(sID_Autonomiezeit,`${hours} h ${minutes} m`)
    }
});


// Summe PV-Leistung berechnen bei Änderung
if (existsState(sID_PVErtragLM0)){
    on({id: sID_PVErtragLM0,change: "ne"}, function (obj){SummePvLeistung();});
}
if (existsState(sID_PVErtragLM1)){
    on({id: sID_PVErtragLM1,change: "ne"}, function (obj){SummePvLeistung();});	
}

schedule('*/3 * * * * *', async function() {
    // Vor Regelung Skript Startdurchlauf erst abwarten  
    if(!bStart && AutomatikRegelung){Ladesteuerung();}

});

// jeden Monat am 1 History Daten Tag aktuelles Monat Löschen
schedule("0 0 1 * *", async function() {
   for (let i = 1; i <= 31; i++) {
        let n = i.toString().padStart(2,"0");
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.IstPvLeistung_kWh_${n}`, 0);
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseProp_kWh_${n}`, 0);
	    await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseAuto_kWh_${n}`, 0);
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast_kWh_${n}`, 0);
        await setStateAsync(`${instanz}.${PfadEbene1}.${PfadEbene2[2]}.PrognoseSolcast90_kWh_${n}`, 0);
    }
    writelog();
});

// jeden Tag um 12:00 aktualisieren.
schedule({hour: 12, minute: 0}, function () { 
	HeuteNotstromVerbraucht = false
});

// jeden Tag um 00:01 Tageswert nullen und Regelzeiten aktualisieren.
schedule({hour: 0, minute: 1}, function () { 
	setState(sID_PVErtragLM0,0,true);
	setState(sID_PVErtragLM1,0,true);
	MEZ_Regelzeiten();
    if (LogAusgabe)log(`${Logparser1} -==== Tagesertragswert auf 0 gesetzt ====- ${Logparser2}`);
    
});

// jeden Tag um 02:00 prüfen ob Notstrom SOC mit Batterie SOC übereinstimmt.
schedule({hour: 2, minute: 0}, async function () { 
    if (NotstromAusNetz){
        let nbr_Notstrom_SOC_Proz = (await getStateAsync(sID_Notstrom_akt)).val                             // Berechneter Notstrom SOC
        Batterie_SOC_Proz = (await getStateAsync(sID_Batterie_SOC)).val;                                    // Aktueller Batterie SOC E3DC 
        let Notstrom_Status = (await getStateAsync(sID_Notrom_Status)).val;                                 // aktueller Notstrom Status E3DC 0= nicht möglich 1=Aktiv 2= nicht Aktiv 3= nicht verfügbar 4=Inselbetrieb
        if (Batterie_SOC_Proz < nbr_Notstrom_SOC_Proz && !HeuteNotstromVerbraucht && Notstrom_Status != 4){
            LadenAufNotstromSOC=true
            log(`${Logparser1} -==== Batterie wird bis NotstromSOC aus dem Netz geladen ====- ${Logparser2}`,'warn')
            LadeNotstromSOC();
        }
    }
});

//Bei Scriptende alle Timer löschen
onStop(function () { 
    clearSchedule(Timer0);
    clearSchedule(Timer1);
    clearSchedule(Timer2);
    clearSchedule(Timer3);
    clearSchedule(TimerProplanta);
}, 100);


