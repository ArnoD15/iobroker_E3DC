'use strict';
/****************************************************************************************************
    Version: 0.4.3  neue Konstante MaxLadestromWallbox_A.Grundeinstellung wenn das E-Auto nicht angesteckt ist.
                    Fehler das Timer nicht gelöscht werden behoben.
                    Einstellung4 mehrer fehler korrigiert.
    Version: 0.4.2  Mehrer Fehler Einstellung 4 behoben.Fehler in Einstellung 1 das bei 0W Batterieleistung das Auto nicht geladen wurde behoben.
    Version: 0.4.1  Neu Konstante "Phase" zum einstellen mit wieviel Phasen geladen wird.
    Version: 0.4.0  Script E3DC-Wallbox wurde überarbeitet und das Script Charge-Control und Adapter e3dc-rscp werden ab dieser Version benötigt. 
    
*****************************************************************************************************/
//++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN ++++++++++++++++++++++++++++++++++++++++
const MaxLadestromWallbox_A = 32                                                                    // maximaler Ladestrom Wallbox in A
const MinLadestromAuto_A = 6                                                                        // minimaler Ladestrom in A der das Fahrzeug benötigt um zu Laden. (Darf nicht unterschritten werden)
const MinLadestromStart_A = 8                                                                       // minimaler Ladestrom in A. Ab diesem Wert startet das Laden vom E-Auto
const MaxLadestromAuto_A = 16                                                                       // maximaler Ladestrom E-Auto in A
const Phasen = 3                                                                                    // Anzahl der Phasen mit denen das E-Auto geladen wird. 1Ph oder 3 Ph
const Haltezeit1 = 30                                                                               // Haltezeit Lademodus 1 in min. Wenn PV-Leistung nicht mehr ausreicht wird diese Zeit weiter geladen bis das Laden pausiert.
const Haltezeit2 = 60                                                                               // Haltezeit Lademodus 2 in min. Wenn PV-Leistung nicht mehr ausreicht wird diese Zeit weiter geladen bis das Laden pausiert.
const Haltezeit4 = 10                                                                               // Haltezeit Lademodus 4 in min. Wenn PV-Leistung nicht mehr ausreicht wird diese Zeit weiter geladen bis das Laden pausiert.
let NettoStrompreis = getState('0_userdata.0.PV_Anlage.Kosten.StrompreisMonat').val                 // Strompreis für Berechnung
const Schluesselschalter_Wallbox1_1 = 4                                                             // Welcher Lademodus soll bei Schlüsselstellung 1 angewählt werden.
const Schluesselschalter_Wallbox1_0 = 3                                                             // Welcher Lademodus soll bei Schlüsselstellung 0 angewählt werden.
//********************************* Modul Modbus.0 E3DC Hauskraftwerk *******************************
const sID_PV_Leistung = 'modbus.0.holdingRegisters.40068_PV_Leistung';                		        // Pfad State Modul ModBus 40068_PV_Leistung
const sID_Eigenverbrauch = 'modbus.0.holdingRegisters.40072_Hausverbrauch_Leistung';                // Pfad State Modul ModBus 40072_Hausverbrauch_Leistung
const sID_Netz_Leistung = 'modbus.0.holdingRegisters.40074_Netz_Leistung';                          // Pfad State Modul ModBus 40074_Netz_Leistung            
const sID_Batterie_Leistung = 'modbus.0.holdingRegisters.40070_Batterie_Leistung';			        // Pfad State Modul ModBus 40070_Batterie_Leistung
const sID_Batterie_SoC = 'modbus.0.holdingRegisters.40083_Batterie_SOC';                            // Pfad State Modul ModBus 40083_Batterie_SOC

//********************************* Modul Modbus.1 E3DC Wallbox_1 ***********************************
const sID_WallboxLadeLeistung_1 = 'modbus.1.inputRegisters.120_Leistung_aktuell';                   // Pfad State Modul ModBus 120_Leistung_aktuell
const sID_Ladevorgang_Pause_1 = 'modbus.1.coils.468_Ladevorgang_pausieren';                         // Pfad State Modul ModBus Ladevorgang pausieren
const sID_Ladevorgang_Freigeben_1 = 'modbus.1.coils.400_Ladevorgang_freigeben';                     // Ladevorgang freigeben (oder Verknüpfung mit Schlüsselschalter und Eingang EN)
const sID_Ladevorgang_aktiv = 'modbus.1.discreteInputs.206_Ausgang_VR'                              // Ladevorgang gestartet = true
const sID_Schluesselschalter_Wallbox_1 = 'modbus.1.discreteInputs.201_Eingang_EN';                  // Pfad State Modul ModBus 201_Eingang_EN
const sID_Ladestrom_Wallbox_1 = 'modbus.1.holdingRegisters.528_Vorgabe_Ladestrom';                  // Pfad State Modul ModBus 528_Vorgabe_Ladestrom
const sID_Gesamtzaehler_Verbrauch_kWh_1 = 'modbus.1.inputRegisters.128_total_kwh';                  // Pfad State Modul ModBus 128_total_kwh
const sID_Ladestatus_1 = 'modbus.1.inputRegisters.100_status';                                      // Pfad State Modul ModBus 100_status
const sID_Definition_Eingang_EN = 'modbus.1.holdingRegisters.521_Definition_Eingang_EN'             // Funktionszuordnung der digitalen Eingänge (Schlüsselschalter Wallbox 1=true)
const sID_Definition_Eingang_ML = 'modbus.1.holdingRegisters.522_Definition_Eingang_ML'             // Funktionszuordnung der digitalen Eingänge (Schlüsselschalter Wallbox 1=true)

//********************************************* E-Auto **********************************************
const sID_Autobatterie_SoC ='bmw.0.xxxxxxxxxxxxxxxxx.properties.chargingState.chargePercentage';    // Pfad State Aktueller SoC Batterie E-Auto.Wenn nicht vorhanden dann '' eintragen

//***************************************** Charge-Control ******************************************
const sID_Charge_Control_Notstromreserve = '0_userdata.0.Charge_Control.Allgemein.Notstrom_akt';    // Pfad State Charge-Control Parameter HTmin
const sID_Charge_Control_EinstellungAnwahl = '0_userdata.0.Charge_Control.Allgemein.EinstellungAnwahl'
const sID_Max_Discharge_Power_W = 'e3dc-rscp.0.EMS.MAX_DISCHARGE_POWER'                             // Eingestellte maximale Batterie-Entladeleistung. (Variable Einstellung E3DC)
const sID_Max_wrleistung_W = 'e3dc-rscp.0.EMS.SYS_SPECS.maxAcPower'                                 // Maximale Wechselrichter Leistung

//*************************** Einstellungen Instanz Script E3DC_Wallbox *****************************
let instanz = '0_userdata.0.';                                                                      // Instanz
let PfadEbene1 = 'E3DC_Wallbox.';                                                                   // Pfad innerhalb der Instanz
let PfadEbene2 = ['Parameter.', 'Allgemein.', 'Stromverbrauch.'];                                   // Pfad innerhalb der Instanz
const LogAusgabe = false;                                                                           // Zusätzliche LOG Ausgaben 
const DebugAusgabe = false;                                                                         // Debug Ausgabe im LOG zur Fehlersuche
//++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN ++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------
let Start = true
ScriptStart();
//************************************** User Eingaben prüfen ***************************************
if ((typeof MinLadestromAuto_A != "number") || (typeof MinLadestromAuto_A == undefined)){console.error("MinLadestromAuto_A muss als Number eingegeben werden");}
if ((typeof MinLadestromStart_A != "number") || (typeof MinLadestromStart_A == undefined)){console.error("MinLadestromStart_A muss als Number eingegeben werden");}
if ((typeof MaxLadestromAuto_A != "number") || (typeof MaxLadestromAuto_A == undefined)){console.error("MaxLadestrom_A muss als Number eingegeben werden");}
// @ts-ignore
if ((typeof Phasen != "number") || (typeof Phasen == undefined)|| Phasen > 3 || Phasen == 2 ){console.error("Phasen muss als Number eingegeben werden und darf nicht > 3 oder 2 sein");}
if ((typeof Haltezeit1 != "number") || (typeof Haltezeit1 == undefined)){console.error("Haltezeit1 muss als Number eingegeben werden");}
if ((typeof Haltezeit2 != "number") || (typeof Haltezeit2 == undefined)){console.error("Haltezeit2 muss als Number eingegeben werden");}
if ((typeof Haltezeit4 != "number") || (typeof Haltezeit4 == undefined)){console.error("Haltezeit4 muss als Number eingegeben werden");}
if ((typeof NettoStrompreis != "number") || (typeof NettoStrompreis == undefined)){console.error("NettoStrompreis muss als Number eingegeben werden");}
if ((typeof Schluesselschalter_Wallbox1_1 != "number") || (typeof Schluesselschalter_Wallbox1_1 == undefined)){console.error("Schluesselschalter_Wallbox1_1 muss als Number eingegeben werden");}
if ((typeof Schluesselschalter_Wallbox1_0 != "number") || (typeof Schluesselschalter_Wallbox1_0 == undefined)){console.error("Schluesselschalter_Wallbox1_0 muss als Number eingegeben werden");}

const PruefeID = [sID_PV_Leistung,sID_Eigenverbrauch,sID_Netz_Leistung,sID_Batterie_Leistung,sID_Batterie_SoC,
sID_WallboxLadeLeistung_1,sID_Ladevorgang_Pause_1,sID_Ladevorgang_Freigeben_1,sID_Schluesselschalter_Wallbox_1,sID_Ladestrom_Wallbox_1,sID_Gesamtzaehler_Verbrauch_kWh_1,
sID_Ladestatus_1,sID_Definition_Eingang_EN,sID_Definition_Eingang_ML,sID_Autobatterie_SoC,sID_Charge_Control_Notstromreserve,
sID_Charge_Control_EinstellungAnwahl,sID_Max_Discharge_Power_W,sID_Max_wrleistung_W];
for (let i = 0; i < PruefeID.length; i++) {
    if (!existsObject(PruefeID[i])){log('Pfad ='+PruefeID[i]+' existiert nicht, bitte prüfen','error');}
}

//************************************* Globale Deklarationen  *************************************/
const sID_Lademodus_Wallbox = instanz + PfadEbene1 + PfadEbene2[0] + 'Lademodus_Wallbox';                
const sID_WallboxLeistungAktuell = instanz + PfadEbene1 + PfadEbene2[1] + 'WallboxLeistungAktuell';
const sID_WallboxSolarLeistungAktuell = instanz + PfadEbene1 + PfadEbene2[1] + 'WallboxSolarleistung';
const sID_WallboxNetzLeistungAktuell = instanz + PfadEbene1 + PfadEbene2[1] + 'WallboxNetzleistung';
const sID_WallboxBatterieLeistungAktuell = instanz + PfadEbene1 + PfadEbene2[1] + 'WallboxBatterieleistung';
const sID_HausverbrauchAktuell = instanz + PfadEbene1 + PfadEbene2[1] + 'Hausverbrauch';
const sID_ZaehlerstandTagAlt = instanz + PfadEbene1 + PfadEbene2[2] + 'ZaehlerstandTagAlt';
const sID_ZaehlerstandMonatAlt = instanz + PfadEbene1 + PfadEbene2[2] + 'ZaehlerstandMonatAlt';
const sID_ZaehlerstandJahrAlt = instanz + PfadEbene1 + PfadEbene2[2] + 'ZaehlerstandJahrAlt';
const sID_Json = instanz + PfadEbene1 + PfadEbene2[2] + 'HistoryJSON';
const sID_Automatik = instanz + PfadEbene1 + PfadEbene2[0] + 'Automatik_Wallbox';
const sID_AutoLadenBis_SoC = instanz + PfadEbene1 + PfadEbene2[1] + 'AutoLadenBis_SoC';
const sID_min_SoC_Batterie_E3DC = instanz + PfadEbene1 + PfadEbene2[1] + 'MinBatterieSoC';

let HaltezeitLaden1 = null,HaltezeitLaden2 = null,HaltezeitLaden4 = null, timerPause1 = null, timerPause2 = null;
let FahrzeugAngesteckt = false,AutoLaden_aktiv = false,Automatik = false,NeuBerechnen = true;
let Autobatterie_SoC = 0, AutoLadenBis_SoC = 100;
let Tendenz_i=0;
let Lademodus,Lademodus_alt,MinBatterieSoC;
let iAutoLadestrom_A= MinLadestromAuto_A;
let EinstellungAnwahl = getState(sID_Charge_Control_EinstellungAnwahl).val;
let MaxEntladeLeistungBatterie_W = getState(sID_Max_Discharge_Power_W).val;
let Min_SOC_Notstrom_E3DC_Proz = getState(sID_Charge_Control_Notstromreserve).val;
let MaxLeistungWR_W = getState(sID_Max_wrleistung_W).val;
clearTimeout(timerPause1);
clearTimeout(timerPause2);
clearTimeout(HaltezeitLaden1);
clearTimeout(HaltezeitLaden2);
clearTimeout(HaltezeitLaden4);
/******************************************* Objekt ID anlegen ******************************/
async function CreateState(){
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'WallboxLeistungAktuell', {'def':0, 'name':'Wallbox Ladeleistung' , 'type':'number', 'role':'value', 'unit':'W'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'WallboxNetzleistung', {'def':0, 'name':'Wallbox Ladeleistung Netzbezug' , 'type':'number', 'role':'value', 'unit':'W'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'WallboxSolarleistung', {'def':0, 'name':'Wallbox Ladeleistung PV' , 'type':'number', 'role':'value', 'unit':'W'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'WallboxBatterieleistung', {'def':0, 'name':'Wallbox Ladeleistung Batterie' , 'type':'number', 'role':'value', 'unit':'W'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'Hausverbrauch', {'def':0, 'name':'Eigenverbrauch ohne Wallbox' , 'type':'number', 'role':'value', 'unit':'W'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Lademodus_Wallbox', {'def':4, 'name':'Lademodus 1= Übersch.Prio. Batterie 2= Übersch.Prio. Wallbox 3= max. Ladeleistung Wallbox' , 'type':'number', 'role':'value'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Ladestatus_Wallbox', {'def':'', 'name':'Ladestatus nach IEC 61851-1' , 'type':'string'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[0] + 'Automatik_Wallbox', {'def':false, 'name':'Bei true wird automatisch nach angewähltem Lademodus geladen' , 'type':'boolean', 'role':'State', 'desc':'Anwahl Automatik '});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'ZaehlerstandMonatAlt', {'def':0, 'name':'Letzter Zählerstand Monat' , 'type':'number', 'role':'value'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'ZaehlerstandJahrAlt', {'def':0, 'name':'Letzter Zählerstand Jahr' , 'type':'number', 'role':'value'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'ZaehlerstandTagAlt', {'def':0, 'name':'Letzter Zählerstand Tag' , 'type':'number', 'role':'value'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'HistoryJSON', {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'});
    createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'MinBatterieSoC', {'def':100, 'name':'SoC Wert bis zu dem die Batterie E3DC entladen werden darf' , 'type':'number', 'role':'value', 'unit':'%'});
    for (let i = 1; i <= 31; i++) {
	    let n = i.toString().padStart(2,"0");
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[2] + 'Verbrauch_E-Auto_kWh_Tag' +n, {'def':0, 'name':'PV-Leistung Tag'+n ,'type':'number','role':'value', 'unit':'kWh'});
    }
    // State nur anlegen wenn unter sID_Autobatterie_SoC ein gültiger Pfad eingetragen wurde
    if (existsState(sID_Autobatterie_SoC)){
        createStateAsync(instanz+PfadEbene1 + PfadEbene2[1] + 'AutoLadenBis_SoC', {'def':100, 'name':'SoC Wert E-Auto bis zu dem geladen werden soll' , 'type':'number', 'role':'value', 'unit':'%'});
    }
}

//---------------------------------------------------------------------------------------------------
//+++++++++++++++++++++++++++++++++++++++++++ Funktionen ++++++++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------
// Wird nur beim Start vom Script aufgerufen
async function ScriptStart()
{
    await CreateState();
    log('-==== Jetzt sind alle States abgearbeitet Version: 0.4.2 ====-');
    Lademodus = getState(sID_Lademodus_Wallbox).val;
    MinBatterieSoC = getState(sID_min_SoC_Batterie_E3DC).val;
    if (getState(sID_Ladestatus_1).val === 67 || getState(sID_Ladestatus_1).val === 66 ) {FahrzeugAngesteckt = true;}
    if (getState(sID_Automatik).val === true) {Automatik = true;}
    if (getState(sID_Ladevorgang_aktiv).val === true) {AutoLaden_aktiv = true;}
    
    if (existsState(sID_Autobatterie_SoC)){
        Autobatterie_SoC = (await getStateAsync(sID_Autobatterie_SoC)).val;
        AutoLadenBis_SoC = (await getStateAsync(sID_AutoLadenBis_SoC)).val;
    }
    Start = false;
}   


async function main()
{
    switch (Lademodus) {
    case 0:
        if(Lademodus_alt != Lademodus && AutoLaden_aktiv ){
            // E-Auto nicht laden
            setStateAsync(sID_Ladevorgang_Pause_1,true);
            setStateAsync(sID_Ladevorgang_Freigeben_1,false);
            Lademodus_alt = Lademodus
        }
        break;
    case 1:
        // Lademodus 1= Nur Überschuss Laden mit Prio. Batterie möglichst ohne Netzbezug. (Netzbezug / Entladen Batterie ist während der Haltezeit möglich)
        Lademodus1();
        Lademodus_alt = Lademodus
        break;
    case 2:
        // Lademodus 2= Nur Überschuss Laden mit Prio. Wallbox möglichst ohne Netzbezug. (Netzbezug / Entladen Batterie ist während der Haltezeit möglich)
        Lademodus2();
        Lademodus_alt = Lademodus
        break;
    case 3:
        if(Lademodus_alt != Lademodus){
            // E-Auto mit max. Ladestrom laden. Batterie und Netzbezug werden ignoriert
            setStateAsync(sID_Ladestrom_Wallbox_1,MaxLadestromAuto_A);
            setStateAsync(sID_Ladevorgang_Pause_1,false);        
            setStateAsync(sID_Ladevorgang_Freigeben_1,true);
            Lademodus_alt = Lademodus
        }
        break;
    case 4:
        // Lademodus 4= Laden über Batterie E3DC ohne Netzbezug bis zu einem eingestellten SoC Wert der Batterie E3DC
        Lademodus4();
        Lademodus_alt = Lademodus
        break;
   default:
        setStateAsync(sID_Ladestrom_Wallbox_1,MinLadestromAuto_A);
        setStateAsync(sID_Ladevorgang_Pause_1,true);        
        setStateAsync(sID_Ladevorgang_Freigeben_1,false);
        log('unbekannter Lademodus angewählt',"warn");
    }


}

// Lademodus 1= Nur Überschuss Laden mit Prio. Batterie möglichst ohne Netzbezug. (Netzbezug / Entladen Batterie ist während der Haltezeit möglich)
async function Lademodus1(){
    let BatterieLeistung_W = (await getStateAsync(sID_Batterie_Leistung)).val; 
    let PV_Leistung_W = (await getStateAsync(sID_PV_Leistung)).val;
    let Hausverbrauch_W = (await getStateAsync(sID_HausverbrauchAktuell)).val; //ohne Ladeleistung Wallbox
    let AutoLadeleistung_W= 0;
    let AutoLadestrom_A = 0;
    let NetzLeistung_W = (await getStateAsync(sID_Netz_Leistung)).val;
    let BatterieSoC = (await getStateAsync(sID_Batterie_SoC)).val;
    
    if(DebugAusgabe){log('Lademodus 1 aufgerufen StromA='+StromA(PV_Leistung_W,Phasen)+' MinLadestromAuto_A='+MinLadestromAuto_A+' HaltezeitLaden1='+HaltezeitLaden1+' BatterieSoC='+BatterieSoC+' MinBatterieSoC='+MinBatterieSoC+' Min_SOC_Notstrom_E3DC_Proz='+Min_SOC_Notstrom_E3DC_Proz+' Autobatterie_SoC='+Autobatterie_SoC+' AutoLadenBis_SoC='+AutoLadenBis_SoC)}
    // Prüfen ob ausreichend PV-Leistung erzeugt wird
    if ((StromA(PV_Leistung_W,Phasen)>MinLadestromAuto_A || (HaltezeitLaden1 && BatterieSoC > MinBatterieSoC && BatterieSoC > Min_SOC_Notstrom_E3DC_Proz)) && Autobatterie_SoC < AutoLadenBis_SoC){
        // Haltezeit1 neu starten wenn Bedingungen erfüllt sind
        if (StromA(PV_Leistung_W,Phasen)>MinLadestromAuto_A && Autobatterie_SoC < AutoLadenBis_SoC){
			if (HaltezeitLaden1){clearTimeout(HaltezeitLaden1)}
            HaltezeitLaden1 = setTimeout(function () {HaltezeitLaden1 = null;}, Haltezeit1*60000);
		}
        // Prüfen ob Werte Netz oder Batterie negativ sind
        if (NetzLeistung_W <= -500 && BatterieLeistung_W <= 0){
            AutoLadeleistung_W = (PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-NetzLeistung_W)-2070;
        }else if (NetzLeistung_W > -500 && BatterieLeistung_W <= 0) {
            AutoLadeleistung_W = (PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W)-2070;                 // 2070 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W > -500 && BatterieLeistung_W > 0) {
            AutoLadeleistung_W = (PV_Leistung_W-Hausverbrauch_W-BatterieLeistung_W);                                    // 2070 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W <= -500 && BatterieLeistung_W > 0){
            AutoLadeleistung_W = (PV_Leistung_W-Hausverbrauch_W-BatterieLeistung_W-NetzLeistung_W);
        }                  
        // Prüfen ob Hausverbrauch und Ladeleistung Auto die max. WR-Leistung-500W übersteigt
        if (AutoLadeleistung_W+Hausverbrauch_W > MaxLeistungWR_W-500){AutoLadeleistung_W = (MaxLeistungWR_W-500)-Hausverbrauch_W}
        if (AutoLadeleistung_W<0){AutoLadeleistung_W =0}
        
        //AutoLadeleistung_W in AutoLadestrom_A umrechnen.
        AutoLadestrom_A = await StromA(AutoLadeleistung_W,Phasen);
        
        if (DebugAusgabe){log('NetzLeistung_W ='+NetzLeistung_W)};
        if (DebugAusgabe){log('BatterieLeistung_W ='+BatterieLeistung_W)};
        if (DebugAusgabe){log('Hausverbrauch_W ='+Hausverbrauch_W)};
        if (DebugAusgabe){log('PV_Leistung_W ='+PV_Leistung_W)};
        if (DebugAusgabe){log('Ladestrom Auto ='+AutoLadestrom_A+' AutoLadeleistung_W ='+AutoLadeleistung_W)};
        
        
        // Wenn AutoLadestrom_A höher ist als MaxLadestromAuto_A, dann auf max. Ladestrom begrenzen
        if (AutoLadestrom_A > MaxLadestromAuto_A){ AutoLadestrom_A = MaxLadestromAuto_A;}
        
        // Prüfen ob mögliche AutoLadestrom_A höher als MinLadestromStart_A, wenn ja Haltezeit starten
        if (AutoLadestrom_A > MinLadestromStart_A ){
            await setStateAsync(sID_Ladevorgang_Pause_1,false);
            await setStateAsync(sID_Ladevorgang_Freigeben_1,true);
        }else{
            if (HaltezeitLaden1) {
                AutoLadestrom_A = MinLadestromAuto_A;    
            }else{
                AutoLadestrom_A = MinLadestromAuto_A;
                await setStateAsync(sID_Ladevorgang_Pause_1,true);
                await setStateAsync(sID_Ladevorgang_Freigeben_1,false);
            }
        }
                
        //Schnelle Wechsel beim Laden verhindern und nur in 1 A Schritte erhöhen/verringern
        //Ladeleistung Wallbox über Tendenz Zähler möglichst konstant halten. 
        if (AutoLadestrom_A > iAutoLadestrom_A && !timerPause1 && !timerPause2 ){
            timerPause1 =  setTimeout(function () {clearTimeout(timerPause1);timerPause1 = null;}, 2000);
            Tendenz_i++
            if (Tendenz_i>=5){++iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A > MaxLadestromAuto_A){ iAutoLadestrom_A = MaxLadestromAuto_A;}
        }else if(AutoLadestrom_A < iAutoLadestrom_A && !timerPause1 && !timerPause2 ){
            Tendenz_i--
            timerPause2 =  setTimeout(function () {clearTimeout(timerPause2);timerPause2 = null;}, 2000);
            if (Tendenz_i<=-5){--iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A < MinLadestromAuto_A){ iAutoLadestrom_A = MinLadestromAuto_A;}
        }
        if(NeuBerechnen){iAutoLadestrom_A=AutoLadestrom_A;NeuBerechnen = false}
        // Vorgabe Ladestrom an Wallbox übermitteln
        await setStateAsync(sID_Ladestrom_Wallbox_1,Math.floor(iAutoLadestrom_A));
    }else if (!getState(sID_Ladevorgang_Pause_1).val){ 
        AutoLadestrom_A = MinLadestromAuto_A;
        await setStateAsync(sID_Ladevorgang_Pause_1,true);
        await setStateAsync(sID_Ladevorgang_Freigeben_1,false);
    }
}

// Lademodus 2= Nur Überschuss Laden mit Prio. Wallbox möglichst ohne Netzbezug. (Netzbezug / Entladen Batterie ist während der Haltezeit möglich)
async function Lademodus2(){
    let BatterieLeistung_W = (await getStateAsync(sID_Batterie_Leistung)).val; 
    let PV_Leistung_W = (await getStateAsync(sID_PV_Leistung)).val;
    let Hausverbrauch_W = (await getStateAsync(sID_HausverbrauchAktuell)).val; //ohne Ladeleistung Wallbox
    let AutoLadeleistung_W= 0;
    let AutoLadestrom_A = 0;
    let NetzLeistung_W = (await getStateAsync(sID_Netz_Leistung)).val;
    let BatterieSoC = (await getStateAsync(sID_Batterie_SoC)).val;

    
    // Prüfen ob ausreichend PV-Leistung erzeugt wird
    if ((StromA(PV_Leistung_W,Phasen)>MinLadestromAuto_A || (HaltezeitLaden2 && BatterieSoC > MinBatterieSoC && BatterieSoC > Min_SOC_Notstrom_E3DC_Proz)) && Autobatterie_SoC < AutoLadenBis_SoC){
        // Prüfen ob Werte Netzleistung negativ ist
        if (NetzLeistung_W < 0 && BatterieLeistung_W <= 0){
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W-(NetzLeistung_W+1380);                       // 1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W > 0 && BatterieLeistung_W <= 0) {
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W-NetzLeistung_W-1380;                         // 1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W > 0 && BatterieLeistung_W >= 0) {
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-NetzLeistung_W-1380;      // 1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W < 0 && BatterieLeistung_W >= 0){
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-(NetzLeistung_W+1380);    // 1380 W Trägheitsreserve bei Netzbezug
        }
        // Prüfen ob Hausverbrauch und Ladeleistung Auto die max. WR-Leistung-500W übersteigt
        if (AutoLadeleistung_W+Hausverbrauch_W > MaxLeistungWR_W-500){AutoLadeleistung_W = (MaxLeistungWR_W-500)-Hausverbrauch_W}
        if (AutoLadeleistung_W < 0){AutoLadeleistung_W = 0}
        
        //AutoLadeleistung_W in AutoLadestrom_A umrechnen.
        AutoLadestrom_A = await StromA(AutoLadeleistung_W,Phasen);
        
        if (DebugAusgabe){log('NetzLeistung_W ='+NetzLeistung_W)};
        if (DebugAusgabe){log('BatterieLeistung_W ='+BatterieLeistung_W)};
        if (DebugAusgabe){log('Hausverbrauch_W ='+Hausverbrauch_W)};
        if (DebugAusgabe){log('PV_Leistung_W ='+PV_Leistung_W)};
        if (DebugAusgabe){log('Ladestrom Auto ='+AutoLadestrom_A+' AutoLadeleistung_W ='+AutoLadeleistung_W)};
                
        // Wenn AutoLadestrom_A höher ist als MaxLadestromAuto_A, dann auf max. Ladestrom begrenzen
        if (AutoLadestrom_A > MaxLadestromAuto_A){ AutoLadestrom_A = MaxLadestromAuto_A;}
        
        // Prüfen ob mögliche AutoLadestrom_A höher als MinLadestromStart_A, wenn ja Haltezeit starten
        if (AutoLadestrom_A > MinLadestromStart_A ){
            if (HaltezeitLaden2){clearTimeout(HaltezeitLaden2)}
            HaltezeitLaden2 = setTimeout(function () {HaltezeitLaden2 = null;}, Haltezeit2*60000);
            await setStateAsync(sID_Ladevorgang_Pause_1,false);
            await setStateAsync(sID_Ladevorgang_Freigeben_1,true);
        }else{
            if (HaltezeitLaden2) {
                AutoLadestrom_A = MinLadestromAuto_A;    
            }else{
                AutoLadestrom_A = MinLadestromAuto_A;
                await setStateAsync(sID_Ladevorgang_Pause_1,true);
                await setStateAsync(sID_Ladevorgang_Freigeben_1,false);
            }
        }
                
        //Schnelle Wechsel beim Laden verhindern und nur in 1 A Schritte erhöhen/verringern
        //Ladeleistung Wallbox über Tendenz Zähler möglichst konstant halten. 
        if (AutoLadestrom_A > iAutoLadestrom_A && !timerPause1 && !timerPause2 ){
            timerPause1 =  setTimeout(function () {clearTimeout(timerPause1);timerPause1 = null;}, 2000);
            Tendenz_i++
            if (Tendenz_i>=20){++iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A > MaxLadestromAuto_A){ iAutoLadestrom_A = MaxLadestromAuto_A;}
        }else if(AutoLadestrom_A < iAutoLadestrom_A && !timerPause1 && !timerPause2 ){
            Tendenz_i--
            timerPause2 =  setTimeout(function () {clearTimeout(timerPause2);timerPause2 = null;}, 2000);
            if (Tendenz_i<=-5){--iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A < MinLadestromAuto_A){ iAutoLadestrom_A = MinLadestromAuto_A;}
        }
        if(NeuBerechnen){iAutoLadestrom_A=AutoLadestrom_A;NeuBerechnen = false}
        // Vorgabe Ladestrom an Wallbox übermitteln
        await setStateAsync(sID_Ladestrom_Wallbox_1,Math.floor(iAutoLadestrom_A));
        if (DebugAusgabe){log('Lademodus = '+ Lademodus);}
        if (DebugAusgabe){log('HaltezeitLaden2 ist  = '+ HaltezeitLaden2);}
        if (DebugAusgabe){log('Autobatterie_SoC ist  = '+ Autobatterie_SoC);}
        if (DebugAusgabe){log('AutoLadenBis_SoC ist  = '+ AutoLadenBis_SoC);}
    }else if (!getState(sID_Ladevorgang_Pause_1).val){ 
        AutoLadestrom_A = MinLadestromAuto_A;
        await setStateAsync(sID_Ladevorgang_Pause_1,true);
        await setStateAsync(sID_Ladevorgang_Freigeben_1,false);
    }
}

// Lademodus 4= Laden über Batterie E3DC ohne Netzbezug bis zu einem eingestellten SoC Wert der Batterie E3DC
async function Lademodus4(){
    let BatterieLeistung_W = (await getStateAsync(sID_Batterie_Leistung)).val; 
    let PV_Leistung_W = (await getStateAsync(sID_PV_Leistung)).val;
    let Hausverbrauch_W = (await getStateAsync(sID_HausverbrauchAktuell)).val; //ohne Ladeleistung Wallbox
    let AutoLadeleistung_W= 0;
    let AutoLadestrom_A = 0;
    let NetzLeistung_W = (await getStateAsync(sID_Netz_Leistung)).val;
    let BatterieSoC = (await getStateAsync(sID_Batterie_SoC)).val;
    let EntladeleistungBatterie;
        
    // Die max. mögliche WR-Leistung berechnen
    let MaxLeistung = MaxEntladeLeistungBatterie_W+PV_Leistung_W
    if(DebugAusgabe){log('Lademodus 4 aufgerufen StromA='+StromA(PV_Leistung_W,Phasen)+' MinLadestromAuto_A='+MinLadestromAuto_A+' HaltezeitLaden4='+HaltezeitLaden4+' BatterieSoC='+BatterieSoC+' MinBatterieSoC='+MinBatterieSoC+' Min_SOC_Notstrom_E3DC_Proz='+Min_SOC_Notstrom_E3DC_Proz+' Autobatterie_SoC='+Autobatterie_SoC+' AutoLadenBis_SoC='+AutoLadenBis_SoC)}
    // Prüfen ob ausreichend PV-Leistung erzeugt wird oder Batterie E3DC geladen ist
    if (((StromA(PV_Leistung_W,Phasen)> MinLadestromAuto_A || BatterieSoC > MinBatterieSoC)&& BatterieSoC > MinBatterieSoC && BatterieSoC > Min_SOC_Notstrom_E3DC_Proz && Autobatterie_SoC < AutoLadenBis_SoC) || (StromA(NetzLeistung_W,Phasen)> MinLadestromAuto_A && Autobatterie_SoC < AutoLadenBis_SoC) || (HaltezeitLaden4 && BatterieSoC > Min_SOC_Notstrom_E3DC_Proz && Autobatterie_SoC < AutoLadenBis_SoC)){
        // Haltezeit4 neu starten wenn Bedingungen erfüllt sind
        if(((StromA(PV_Leistung_W,Phasen)> MinLadestromAuto_A || BatterieSoC > MinBatterieSoC)&& BatterieSoC > MinBatterieSoC && BatterieSoC > Min_SOC_Notstrom_E3DC_Proz && Autobatterie_SoC < AutoLadenBis_SoC) || (StromA(NetzLeistung_W,Phasen)> MinLadestromAuto_A && Autobatterie_SoC < AutoLadenBis_SoC)){
            if (HaltezeitLaden4){clearTimeout(HaltezeitLaden4)}
            HaltezeitLaden4 = setTimeout(function () {HaltezeitLaden4 = null;}, Haltezeit4*60000);
        }
        // prüfen ob max Leistung Wechselrichter eingehalten wird sonst Entladeleistung Batterie reduzieren
        if (MaxLeistung > MaxLeistungWR_W) {
            EntladeleistungBatterie = MaxEntladeLeistungBatterie_W-(MaxLeistung - MaxLeistungWR_W);
            if (EntladeleistungBatterie<0){EntladeleistungBatterie=0}
        }else{
            EntladeleistungBatterie = MaxEntladeLeistungBatterie_W
        }
        if (NetzLeistung_W < 0 && BatterieLeistung_W < 0){
            AutoLadeleistung_W = EntladeleistungBatterie+PV_Leistung_W-Hausverbrauch_W;
        }else if (NetzLeistung_W >= 0 && BatterieLeistung_W < 0){
            AutoLadeleistung_W = EntladeleistungBatterie+PV_Leistung_W-Hausverbrauch_W-1380;                                    //1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W < 0 && BatterieLeistung_W >= 0){
            AutoLadeleistung_W = EntladeleistungBatterie+PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-NetzLeistung_W+1380;  //1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W >= 0 && BatterieLeistung_W >= 0){
            AutoLadeleistung_W = EntladeleistungBatterie+PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-NetzLeistung_W-1380;  //1380 W Trägheitsreserve bei Netzbezug
        }
        
        // Prüfen ob Hausverbrauch und Ladeleistung Auto die max. WR-Leistung übersteigt
        if (AutoLadeleistung_W + Hausverbrauch_W > MaxLeistungWR_W){AutoLadeleistung_W = (MaxLeistungWR_W)-Hausverbrauch_W}
        if (AutoLadeleistung_W < 0){AutoLadeleistung_W = 0}
        
        //AutoLadeleistung_W in AutoLadestrom_A umrechnen.
        AutoLadestrom_A = await StromA(AutoLadeleistung_W,Phasen);
        
        if (DebugAusgabe){log('NetzLeistung_W ='+NetzLeistung_W)};
        if (DebugAusgabe){log('BatterieLeistung_W ='+BatterieLeistung_W)};
        if (DebugAusgabe){log('Hausverbrauch_W ='+Hausverbrauch_W)};
        if (DebugAusgabe){log('PV_Leistung_W ='+PV_Leistung_W)};
        if (DebugAusgabe){log('Ladestrom Auto ='+AutoLadestrom_A+' AutoLadeleistung_W ='+AutoLadeleistung_W)};
                
        // Wenn AutoLadestrom_A höher ist als MaxLadestromAuto_A, dann auf max. Ladestrom begrenzen
        if (AutoLadestrom_A > MaxLadestromAuto_A){ AutoLadestrom_A = MaxLadestromAuto_A;}
        
        // Prüfen ob mögliche AutoLadestrom_A höher als MinLadestromStart_A, wenn ja Haltezeit starten
        // Wenn Hausspeicher Batterie unter Parameter min_SOC_Notstrom_E3DC ist soll das laden vom E-Auto beendet werden.
        if (AutoLadestrom_A > MinLadestromStart_A){
            await setStateAsync(sID_Ladevorgang_Pause_1,false);
            await setStateAsync(sID_Ladevorgang_Freigeben_1,true);
        }else{
            if (HaltezeitLaden4) {
                AutoLadestrom_A = MinLadestromAuto_A;    
            }else{
                AutoLadestrom_A = MinLadestromAuto_A;
                await setStateAsync(sID_Ladevorgang_Pause_1,true);
                await setStateAsync(sID_Ladevorgang_Freigeben_1,false);
            }
        }
        
        
        //Schnelle Wechsel beim Laden verhindern und nur in 1 A Schritte erhöhen/verringern
        //Ladeleistung Wallbox über Tendenz Zähler möglichst konstant halten. 
        if (AutoLadestrom_A > iAutoLadestrom_A && !timerPause1 && !timerPause2){
            timerPause1 =  setTimeout(function () {clearTimeout(timerPause1);timerPause1 = null;}, 2000);
            Tendenz_i++
            if (Tendenz_i>=20){++iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A > MaxLadestromAuto_A){ iAutoLadestrom_A = MaxLadestromAuto_A;}
        }else if(AutoLadestrom_A < iAutoLadestrom_A && !timerPause1 && !timerPause2){
            Tendenz_i--
            timerPause2 =  setTimeout(function () {clearTimeout(timerPause2);timerPause2 = null;}, 2000);
            if (Tendenz_i<=-5){--iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A < MinLadestromAuto_A){ iAutoLadestrom_A = MinLadestromAuto_A;}
        }
        if(NeuBerechnen){iAutoLadestrom_A=AutoLadestrom_A;NeuBerechnen = false}
        // Vorgabe Ladestrom an Wallbox übermitteln
        await setStateAsync(sID_Ladestrom_Wallbox_1,Math.floor(iAutoLadestrom_A));
        
    }else if (!getState(sID_Ladevorgang_Pause_1).val){ 
        AutoLadestrom_A = MinLadestromAuto_A;
        await setStateAsync(sID_Ladevorgang_Pause_1,true);
        await setStateAsync(sID_Ladevorgang_Freigeben_1,false);
    }
}


// Funktion zum Runden auf einstellbare Anzahl Stellen nach dem Komma.
// Parameter: wert als float und dez als Int für die Anzahl der Stellen nach dem Komma
function round(wert, dez) {
    let umrechnungsfaktor = Math.pow(10,dez);
    return Math.round(wert * umrechnungsfaktor) / umrechnungsfaktor;
} 

// Liefert das Datum von gestern
function lastDayDate(lastDay) {
    if (!lastDay) {
	    lastDay = new Date();
	}
    let out = { yyyy:'0', MM:'0', DD:'0' };
    lastDay.setDate(lastDay.getDate() - 1);
    let mm = lastDay.getMonth() + 1;
    let dd = lastDay.getDate();
    out.yyyy = lastDay.getFullYear();
    out.MM = mm.toString().padStart(2,"0");
    out.DD = dd.toString().padStart(2,"0");
    return out;
}

// Rechnet Leistung W in A je Phase um
function StromA(Leistung_W,AnzPhasen) {
    let Strom_A = round(Leistung_W/230/AnzPhasen,2)
    return Strom_A;
}

//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************

// Wird bei Änderung Lademodus in VIS aufgerufen
on({id: sID_Lademodus_Wallbox},async function (obj){
	Lademodus = (await getStateAsync(obj.id)).val;
});  


// Wird bei Änderung Schluesselschalter Wallbox aufgerufen
// Anwahl Lademodus über Schlüsselschalter der Wallbox
on({id: sID_Schluesselschalter_Wallbox_1}, async function (obj){
	let Schluesselschalter = (await getStateAsync(obj.id)).val
    let Lademodus_Wallbox = 0
    
    if (Schluesselschalter){
        Lademodus_Wallbox = Schluesselschalter_Wallbox1_1
    }else{
        Lademodus_Wallbox = Schluesselschalter_Wallbox1_0
    }
    await setStateAsync(sID_Lademodus_Wallbox,Lademodus_Wallbox);
});  

// Wird bei Änderung Automatik in VIS aufgerufen
// Anwahl Automatik über VIS
on({id: sID_Automatik}, async function (obj){
	if (getState(obj.id).val){
        Automatik = true;
    }else{
        Automatik = false;
        await setStateAsync(sID_Ladevorgang_Pause_1,true);
        await setStateAsync(sID_Ladevorgang_Freigeben_1,false);
    }
});  

// Wird bei Änderung Eigenverbrauch aufgerufen
// Für Anzeige VIS Eigenverbrauch ohne Wallbox Ladeleistung berechnen
on({id: sID_Eigenverbrauch}, async function (obj){
    let Eigenverbrauch_W = (await getStateAsync(obj.id)).val
    let AutoLadeleistung = (await getStateAsync(sID_WallboxLadeLeistung_1)).val
    let Hausverbrauch = 0;
    // Fehler abfangen das Wallbox sporadisch Leistungswerte über 35000 W übermittelt ohne das geladen wird
    if (AutoLadeleistung < 35000 && AutoLadeleistung > 0 ){
        Hausverbrauch = Eigenverbrauch_W-AutoLadeleistung;
    }else{
        Hausverbrauch = Eigenverbrauch_W
    }
    await setStateAsync(sID_HausverbrauchAktuell,Hausverbrauch);
    
});

// Wird bei Änderung Wallbox Ladeleistung aufgerufen
// Ladeleistung in Netzleistung, Batterieleistung und Solarleistung aufteilen
on({id: sID_WallboxLadeLeistung_1}, async function (obj){
    let AutoLadeleistung_W = (await getStateAsync(obj.id)).val
    let AutoNetzleistung_W = 0;
    let AutoSolarleistung_W = 0;
    let AutoBatterieleistung_W = 0;
    let PV_Leistung_W = (await getStateAsync(sID_PV_Leistung)).val;
    let BatterieLeistung_W = (await getStateAsync(sID_Batterie_Leistung)).val;
    let NetzLeistung_W = (await getStateAsync(sID_Netz_Leistung)).val;
    let R = 0;
    // Fehler abfangen das Wallbox sporadisch Leistungswerte über 35000 W übermittelt ohne das geladen wird
    if (AutoLadeleistung_W < 35000 && AutoLadeleistung_W >= 0 ){
        if (NetzLeistung_W > 0){
            if (NetzLeistung_W >= AutoLadeleistung_W){
                AutoNetzleistung_W = AutoLadeleistung_W;
            }else{
                AutoNetzleistung_W = NetzLeistung_W;
                R = AutoLadeleistung_W-NetzLeistung_W;
            }
        }else{
            R = AutoLadeleistung_W;
        }
        
        if (BatterieLeistung_W < 0 && R != 0){
            if (Math.abs(BatterieLeistung_W) >= R){
                AutoBatterieleistung_W = R;
                R = 0;
            }else{
                AutoBatterieleistung_W = Math.abs(BatterieLeistung_W)
                R = R - Math.abs(BatterieLeistung_W)
            }
        } 
        if (PV_Leistung_W > 0 && R != 0){
            if (PV_Leistung_W >= R){
                AutoSolarleistung_W = R;
                R = 0;
            }
        }
        await setStateAsync(sID_WallboxSolarLeistungAktuell,round(AutoSolarleistung_W,0));
        await setStateAsync(sID_WallboxNetzLeistungAktuell,round(AutoNetzleistung_W,0));
        await setStateAsync(sID_WallboxBatterieLeistungAktuell,round(AutoBatterieleistung_W,0));
        await setStateAsync(sID_WallboxLeistungAktuell,AutoLadeleistung_W);
    }
    
});

// Bei Änderung Gesamtzähler Wallbox Tageszähler Verbrauch für Vis aktualisieren
on({id: sID_Gesamtzaehler_Verbrauch_kWh_1, change: "ne"}, function (obj){
    let ZaehlerstandAkt = getState(sID_Gesamtzaehler_Verbrauch_kWh_1).val; 
    let ZaehlerstandTagAlt = getState(sID_ZaehlerstandTagAlt).val;
    let ZaehlerDif = ZaehlerstandAkt-ZaehlerstandTagAlt
    let DateHeute = new Date();
    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'Verbrauch_E-Auto_kWh_Tag'+ DateHeute.getDate().toString().padStart(2,"0"),ZaehlerDif);
	
});

// Bei Änderung min. SoC Wert Batterie E3DC in Vis 
on({id: sID_min_SoC_Batterie_E3DC,change: "ne"}, function (obj){
        MinBatterieSoC = getState(obj.id).val;
});	


// Wenn State vorhanden ist, dann bei Änderung den Wert der Variable aktualisieren
if (existsState(sID_Autobatterie_SoC)){
    on({id: sID_Autobatterie_SoC,change: "ne"}, function (obj){
        Autobatterie_SoC = getState(obj.id).val;
    });	
}

// bei Änderung den Wert der Variable min_SOC_Notstrom_E3DC aktualisieren
on({id:sID_Charge_Control_Notstromreserve,change: "ne"}, async function (obj){
    Min_SOC_Notstrom_E3DC_Proz = (await getStateAsync(obj.id)).val;
});

// bei Änderung laden bis SoC Auto in Vis aktualisieren
on({id:sID_AutoLadenBis_SoC,change: "ne"}, async function (obj){
    AutoLadenBis_SoC = (await getStateAsync(obj.id)).val;
});

// bei Änderung laden bis SoC Auto in Vis aktualisieren
on({id:sID_Ladevorgang_aktiv,change: "ne"}, async function (obj){
    AutoLaden_aktiv = (await getStateAsync(obj.id)).val;
});


// Modbus.1 Register 100 Status nach IEC 61851-1 in Klartext"
on(sID_Ladestatus_1, function (obj) {
    let iStatus = obj.state.val;
    switch (iStatus) {
        case 65:
            setState(instanz + PfadEbene1 + PfadEbene2[0] + 'Ladestatus_Wallbox', 'Standby' );
            FahrzeugAngesteckt = false;
            setStateAsync(sID_Ladestrom_Wallbox_1,MaxLadestromWallbox_A);
            break;
        case 66:
            setState(instanz + PfadEbene1 + PfadEbene2[0] + 'Ladestatus_Wallbox', 'E-Auto angesteckt' );
            FahrzeugAngesteckt = true;
            break;
        case 67:
            setState(instanz + PfadEbene1 + PfadEbene2[0] + 'Ladestatus_Wallbox', 'E-Auto wird geladen' );
            FahrzeugAngesteckt = true;
            break;
        case 68:
            setState(instanz + PfadEbene1 + PfadEbene2[0] + 'Ladestatus_Wallbox', 'Mit Belüftung' );
            break;
        case 69:
            setState(instanz + PfadEbene1 + PfadEbene2[0] + 'Ladestatus_Wallbox', 'Kein Strom' );
            break;
        case 70:
            setState(instanz + PfadEbene1 + PfadEbene2[0] + 'Ladestatus_Wallbox', 'Fehler' );
            break;
    }
    
});

schedule('*/3 * * * * *', async function() {
    // Wenn Lademodus gewechselt wurde, dann alle Timer und Zähler löschen
    if(Lademodus_alt != Lademodus){
        clearTimeout(timerPause1);
        clearTimeout(timerPause2);
        clearTimeout(HaltezeitLaden1);
        clearTimeout(HaltezeitLaden2);
        clearTimeout(HaltezeitLaden4);
        timerPause1 = null;
        timerPause2 = null;
        HaltezeitLaden1 = null;
        HaltezeitLaden2 = null;
        HaltezeitLaden4 = null
        Tendenz_i = 0
        NeuBerechnen = true
    }
    if (DebugAusgabe){log('Schedule läuft FahrzeugAngesteckt='+FahrzeugAngesteckt+' Automatik='+Automatik+' Lademodus='+Lademodus)}
    
    if (FahrzeugAngesteckt == true && Automatik && (Lademodus == 0 || Lademodus == 1 || Lademodus == 2 || Lademodus == 3 || Lademodus == 4))
    {
        main();
    }
});

// jeden Tag um 23:58 Verbrauch Tag speichern.
schedule('58 23 * * *', function() { 
	let ZaehlerstandAkt = getState(sID_Gesamtzaehler_Verbrauch_kWh_1).val; 
    let ZaehlerstandTagAlt = getState(sID_ZaehlerstandTagAlt).val;
    let ZaehlerDif = ZaehlerstandAkt-ZaehlerstandTagAlt
    let DateHeute = new Date();
    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'Verbrauch_E-Auto_kWh_Tag'+ DateHeute.getDate().toString().padStart(2,"0"),ZaehlerDif);
	setState(sID_ZaehlerstandTagAlt,ZaehlerstandAkt)
    if (LogAusgabe)log('Tagesertragswert gespeichert');
});

// Monatlich Json speichern und Tageszähler auf 0 setzen. Am 1.1 Monatzähler auf 0 setzen
schedule("0 0 1 * *", function() { 
    let DateHeute = new Date();
    let DatumAkt = lastDayDate().DD +'.'+lastDayDate().MM+'.'+lastDayDate().yyyy
    let ZaehlerstandAkt = getState(sID_Gesamtzaehler_Verbrauch_kWh_1).val; 
    let ZaehlerstandMonatAlt = getState(sID_ZaehlerstandMonatAlt).val;
    let ZaehlerstandJahrAlt = getState(sID_ZaehlerstandJahrAlt).val;
    let StromVerbrauch_Mo = ZaehlerstandAkt - ZaehlerstandMonatAlt;
    let StromVerbrauchJahr = ZaehlerstandAkt - ZaehlerstandJahrAlt;
    let KostenMonat = (StromVerbrauch_Mo * NettoStrompreis) * 1.19;
    
    // für Json aufbereiten
    let obj = {};
    
    // 12 Spalten
    obj.Datum = DatumAkt;
    obj.StromverbrauchMo = round(StromVerbrauch_Mo,0) + ' kWh';
    obj.Strompreis = NettoStrompreis + ' €/kWh';
    obj.Kosten = round(KostenMonat,2) + ' €';
    obj.StromverbrauchJahr = round(StromVerbrauchJahr,0) + ' kWh';
    
    let arr = [];
    if(existsState(sID_Json)) arr = JSON.parse(getState(sID_Json).val);
    arr.push(obj);
    //if(arr.length > 12) arr.shift();
    if(existsState(sID_Json)) setState(sID_Json, JSON.stringify(arr), true);
    else createState(sID_Json, JSON.stringify(arr), {type: 'string'});
    
    if (toInt(lastDayDate().yyyy) != DateHeute.getFullYear()){
        setState(sID_ZaehlerstandJahrAlt,ZaehlerstandAkt); 
    }
    // Tageswert nullen.
    for (let i = 1; i <= 31; i++) {
	        let n = i.toString().padStart(2,"0");
            setState(instanz + PfadEbene1 + PfadEbene2[2] + 'Verbrauch_E-Auto_kWh_Tag' +n,0);
    }
    setState(sID_ZaehlerstandMonatAlt,ZaehlerstandAkt);
});

//Bei Scriptende alle Timer löschen
onStop(function () { 
    clearTimeout(timerPause1);
    clearTimeout(timerPause2);
    clearTimeout(HaltezeitLaden1);
    clearTimeout(HaltezeitLaden2);
    clearTimeout(HaltezeitLaden4);
    timerPause1 = null;
    timerPause2 = null;
    HaltezeitLaden1 = null;
    HaltezeitLaden2 = null;
    HaltezeitLaden4 = null
}, 100);





