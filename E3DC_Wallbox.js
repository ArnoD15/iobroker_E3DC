/****************************************************************************************************
    Version: 0.3.4  Fehler behoben das bei Schlüsselstellung 0 die Wallbox deaktiviert wurde.
                    Um den Schlüsselschalter im Script verwenden zu können muss die Standard Funktion von Eingang EN und ML deaktiviert werden.
    Version: 0.3.3  Lademodus 1 und 2 optimiert.
                    Ladeleistung Wallbox wird jetzt auch im Lademodus 1 und 2 möglichst konstant gehalten.
                    Parameter Ladeschwelle E3DC-Control wird beim Lademodus 1 jetzt auch berücksichtigt (manuell oder automatisch möglich). 
    Version: 0.3.2  Fehler im Lademodus 4 behoben.
                    Ladeleistung Wallbox beim Entladen der Speicherbatterie E3DC wird jetzt möglichst konstant gehalten.
                    Max Nennleistung Wechselrichter beim Entladen der Speicherbatterie E3DC wird berücksichtigt. 
    Version: 0.3.1  Mehrere Fehler behoben.
                    Prüfung der User Eingaben beim Start.
                    Für jeden Lademodus eine eigene Haltezeit programmiert.
                    Wechsel der Ladeleistung beim Laden nur in 1 A Schritte alle 6 sek. möglich.
                    Berücksichtigung der Einstellung HTmin in E3DC-Control. (manuell oder automatisch möglich)
    Version: 0.3.0  Der % Wert Batterieentladung E3DC durch Wallbox ist in VIS variable einstellbar, dadurch entfällt Einstellung 5
                    Achtung Änderung in Vis nötig, Einstellung 5 muss entfernt werden. 
                    Skript wurde umgebaut und optimiert. Ladeleistung wird nun langsam erhöht oder verringert, um sprunghafte Wechsel
                    zu vermeiden. Mehrere Fehler behoben. Einstellung 4 sollte jetzt funktionieren.
    Version: 0.2.1  Update Function createUserStates auf Version: 1.2 (20 October 2020) von Mic (ioBroker) | Mic-M (github) 
    Version: 0.2.0  Das Laden der Batterie vom E-Auto kann jetzt auf eine einstellbaren SoC Wert in Vis begrenzt werden.
                    Wenn der aktuelle SoC Wert nicht ausgelesen werden kann, dann bei const sID_Autobatterie_SoC = '' eintragen.
                    Es wird dann vom Script diese Funktion ignoriert. 
    Version: 0.1.1  Um beim Laden vom E-Auto nicht ständig zwischen Netzbezug und Einspeisung zu wechseln
                    wurde die Trägheitsreserve auf 1000 W erhöht.
    Version: 0.1.0  Script zum Steuern der Wallbox easy connect mit mode 3-Ladekabel (3-phasig) 
                    fest angeschlagen mit Ladestecker Typ 2 von E3DC. Die Wallbox muss über Modbus 
                    verbunden sein.
*****************************************************************************************************/
//++++++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN ++++++++++++++++++++++++++++++++++++++++
const MinLadestromAuto_A = 6                // minimaler Ladestrom in A der das Fahrzeug benötigt um zu Laden. (Darf nicht unterschritten werden)
const MinLadestromStart_A = 8               // minimaler Ladestrom in A. Ab diesem Wert startet das Laden vom E-Auto
const MaxLadestrom_A = 16                   // maximaler Ladestrom in A
const MaxEntladeLeistungBatterie_W = 9000   // maximale entlade Leistung der E3DC Speicherbatterie in W.
const Haltezeit1 = 30                       // Haltezeit Lademodus 1 in min. Wenn PV-Leistung nicht mehr ausreicht wird diese Zeit weiter geladen bis das Laden pausiert.
const Haltezeit2 = 60                       // Haltezeit Lademodus 2 in min. Wenn PV-Leistung nicht mehr ausreicht wird diese Zeit weiter geladen bis das Laden pausiert.
const Haltezeit4 = 30                       // Haltezeit Lademodus 4 in min. Wenn PV-Leistung nicht mehr ausreicht wird diese Zeit weiter geladen bis das Laden pausiert.
let NettoStrompreis = 0.201                 // Strompreis für Berechnung
const Schluesselschalter_Wallbox1_1 = 4     // Welcher Lademodus soll bei Schlüsselstellung 1 angewählt werden.
const Schluesselschalter_Wallbox1_0 = 3     // Welcher Lademodus soll bei Schlüsselstellung 0 angewählt werden.
let HTmin = 20                              // Wenn die Hausspeicher Batterie diesen SoC Wert in % erreicht, wird das laden vom E-Auto gestoppt bzw. erst gestartet. 
let Ladeschwelle = 50                       // Bis die Hausspeicher Batterie diesen SoC Wert in % erreicht, wird das laden vom E-Auto nicht gestartet im Lademodus 1
const MaxNennleistungWR = 12000             // Max Nennleistung Wechselrichter E3DC
//********************************* Modul Modbus.0 E3DC Hauskraftwerk *******************************
const sID_PV_Leistung = 'modbus.0.holdingRegisters.40068_PV_Leistung';                		// Pfad State Modul ModBus 40068_PV_Leistung
const sID_Eigenverbrauch = 'modbus.0.holdingRegisters.40072_Hausverbrauch_Leistung';             
const sID_Netz_Leistung = 'modbus.0.holdingRegisters.40074_Netz_Leistung';                  // Pfad State Modul ModBus 40074_Netz_Leistung            
const sID_Batterie_Leistung = 'modbus.0.holdingRegisters.40070_Batterie_Leistung';			// Pfad State Modul ModBus 40070_Batterie_Leistung
const sID_Batterie_SoC = 'modbus.0.holdingRegisters.40083_Batterie_SOC';                    // Pfad State Modul ModBus 40083_Batterie_SOC

//********************************* Modul Modbus.1 E3DC Wallbox_1 ***********************************
const sID_WallboxLadeLeistung_1 = 'modbus.1.inputRegisters.120_Leistung_aktuell';           // Pfad State Modul ModBus 120_Leistung_aktuell
const sID_Ladevorgang_Pause_1 = 'modbus.1.coils.468_Ladevorgang_pausieren';                 // Pfad State Modul ModBus Ladevorgang pausieren
const sID_Schluesselschalter_Wallbox_1 = 'modbus.1.discreteInputs.201_Eingang_EN';          // Pfad State Modul ModBus 201_Eingang_EN
const sID_Ladestrom_Wallbox_1 = 'modbus.1.holdingRegisters.528_Vorgabe_Ladestrom';          // Pfad State Modul ModBus 528_Vorgabe_Ladestrom
const sID_Gesamtzaehler_Verbrauch_kWh_1 = 'modbus.1.inputRegisters.128_total_kwh';          // Pfad State Modul ModBus 128_total_kwh
const sID_Ladestatus_1 = 'modbus.1.inputRegisters.100_status';                              // Pfad State Modul ModBus 100_status
const sID_Definition_Eingang_EN = 'modbus.1.holdingRegisters.521_Definition_Eingang_EN'     // Funktionszuordnung der digitalen Eingänge (Schlüsselschalter Wallbox 1=true)
const sID_Definition_Eingang_ML = 'modbus.1.holdingRegisters.522_Definition_Eingang_ML'     // Funktionszuordnung der digitalen Eingänge (Schlüsselschalter Wallbox 1=true)

//**************************************** Optionale State ******************************************
const sID_Autobatterie_SoC ='bmw.0.WBY8P210307G75987.status.Ladezustand.levelValue';        // Pfad State Aktueller SoC Batterie E-Auto.Wenn nicht vorhanden dann '' eintragen
const sID_E3DC_Control_HTmin = '0_userdata.0.E3DC-Control.Parameter.HTmin';                 // Pfad State E3DC-Control Parameter HTmin
const sID_E3DC_Control_Ladeschwelle = '0_userdata.0.E3DC-Control.Parameter.Ladeschwelle';   // Pfad State E3DC-Control Parameter Ladeschwelle

//*************************** Einstellungen Instanz Script E3DC_Wallbox *****************************
let instanz = '0_userdata.0.';
// Pfad innerhalb der Instanz
let PfadEbene1 = 'E3DC_Wallbox.';
let PfadEbene2 = ['Parameter.', 'Allgemein.', 'Stromverbrauch.'];
const LogAusgabe = false;                           // Zusätzliche LOG Ausgaben 
const DebugAusgabe = false;                        // Debug Ausgabe im LOG zur Fehlersuche

//---------------------------------------------------------------------------------------------------
//++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN ++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------

//***************************************************************************************************
//************************************** User Eingaben prüfen ***************************************
//***************************************************************************************************
if ((typeof MinLadestromAuto_A != "number") || (typeof MinLadestromAuto_A == undefined)){console.error("MinLadestromAuto_A muss als Number eingegeben werden");}
if ((typeof MinLadestromStart_A != "number") || (typeof MinLadestromStart_A == undefined)){console.error("MinLadestromStart_A muss als Number eingegeben werden");}
if ((typeof MaxLadestrom_A != "number") || (typeof MaxLadestrom_A == undefined)){console.error("MaxLadestrom_A muss als Number eingegeben werden");}
if ((typeof MaxEntladeLeistungBatterie_W != "number") || (typeof MaxEntladeLeistungBatterie_W == undefined)){console.error("MaxEntladeLeistungBatterie_W muss als Number eingegeben werden");}
if ((typeof Haltezeit1 != "number") || (typeof Haltezeit1 == undefined)){console.error("Haltezeit1 muss als Number eingegeben werden");}
if ((typeof Haltezeit2 != "number") || (typeof Haltezeit2 == undefined)){console.error("Haltezeit2 muss als Number eingegeben werden");}
if ((typeof Haltezeit4 != "number") || (typeof Haltezeit4 == undefined)){console.error("Haltezeit4 muss als Number eingegeben werden");}
if ((typeof NettoStrompreis != "number") || (typeof NettoStrompreis == undefined)){console.error("NettoStrompreis muss als Number eingegeben werden");}
if ((typeof Schluesselschalter_Wallbox1_1 != "number") || (typeof Schluesselschalter_Wallbox1_1 == undefined)){console.error("Schluesselschalter_Wallbox1_1 muss als Number eingegeben werden");}
if ((typeof Schluesselschalter_Wallbox1_0 != "number") || (typeof Schluesselschalter_Wallbox1_0 == undefined)){console.error("Schluesselschalter_Wallbox1_0 muss als Number eingegeben werden");}
if ((typeof MaxNennleistungWR != "number") || (typeof MaxNennleistungWR == undefined)){console.error("MaxNennleistungWR muss als Number eingegeben werden");}

const PruefeID = [sID_PV_Leistung,sID_Eigenverbrauch,sID_Netz_Leistung,sID_Batterie_Leistung,sID_Batterie_SoC,
sID_WallboxLadeLeistung_1,sID_Ladevorgang_Pause_1,sID_Schluesselschalter_Wallbox_1,sID_Ladestrom_Wallbox_1,sID_Gesamtzaehler_Verbrauch_kWh_1,
sID_Ladestatus_1];
for (let i = 0; i < PruefeID.length; i++) {
    if (!existsState(PruefeID[i])){log('Pfad ='+PruefeID[i]+' existiert nicht, bitte prüfen','error');}
}

//******************************************** Variablen *******************************************/
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


let HaltezeitLaden = false;
let HaltezeitLaden1 = null,HaltezeitLaden2 = null,HaltezeitLaden4 = null, timerPause1 = null, timerPause2 = null;
let FahrzeugAngesteckt = false;
let Automatik = false;
let Autobatterie_SoC = 0, AutoLadenBis_SoC = 100;
let Tendenz_i=0;
let Lademodus,MinBatterieSoC;
let iAutoLadestrom_A=6;
/******************************************* benötigten STATE anlegen ******************************/
let statesToCreate = [
[PfadEbene1 + PfadEbene2[1] + 'WallboxLeistungAktuell', {'def':0, 'name':'Wallbox Ladeleistung' , 'type':'number', 'role':'value', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[1] + 'WallboxNetzleistung', {'def':0, 'name':'Wallbox Ladeleistung Netzbezug' , 'type':'number', 'role':'value', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[1] + 'WallboxSolarleistung', {'def':0, 'name':'Wallbox Ladeleistung PV' , 'type':'number', 'role':'value', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[1] + 'WallboxBatterieleistung', {'def':0, 'name':'Wallbox Ladeleistung Batterie' , 'type':'number', 'role':'value', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[1] + 'Hausverbrauch', {'def':0, 'name':'Eigenverbrauch ohne Wallbox' , 'type':'number', 'role':'value', 'unit':'W'}],
[PfadEbene1 + PfadEbene2[0] + 'Lademodus_Wallbox', {'def':4, 'name':'Lademodus 1= Übersch.Prio. Batterie 2= Übersch.Prio. Wallbox 3= max. Ladeleistung Wallbox' , 'type':'number', 'role':'value'}],
[PfadEbene1 + PfadEbene2[0] + 'Ladestatus_Wallbox', {'def':'', 'name':'Ladestatus nach IEC 61851-1' , 'type':'string'}],
[PfadEbene1 + PfadEbene2[0] + 'Automatik_Wallbox', {'def':false, 'name':'Bei true wird automatisch nach angewähltem Lademodus geladen' , 'type':'boolean', 'role':'State', 'desc':'Anwahl Automatik '}],
[PfadEbene1 + PfadEbene2[2] + 'ZaehlerstandMonatAlt', {'def':0, 'name':'Letzter Zählerstand Monat' , 'type':'number', 'role':'value'}],
[PfadEbene1 + PfadEbene2[2] + 'ZaehlerstandJahrAlt', {'def':0, 'name':'Letzter Zählerstand Jahr' , 'type':'number', 'role':'value'}],
[PfadEbene1 + PfadEbene2[2] + 'ZaehlerstandTagAlt', {'def':0, 'name':'Letzter Zählerstand Tag' , 'type':'number', 'role':'value'}],
[PfadEbene1 + PfadEbene2[2] + 'HistoryJSON', {'def':'[]', 'name':'JSON für materialdesign json chart' ,'type':'string'}],
[PfadEbene1 + PfadEbene2[1] + 'MinBatterieSoC', {'def':100, 'name':'SoC Wert bis zu dem die Batterie E3DC entladen werden darf' , 'type':'number', 'role':'value', 'unit':'%'}]
];
for (let i = 1; i <= 31; i++) {
	let n = zeroPad(i,2);
    let statePV_LeistungTag = [PfadEbene1 + PfadEbene2[2] + 'Verbrauch_E-Auto_kWh_Tag' +n, {'def':0, 'name':'PV-Leistung Tag'+n ,'type':'number','role':'value', 'unit':'kWh'}]
    statesToCreate.push(statePV_LeistungTag)
}
// State nur anlegen wenn unter sID_Autobatterie_SoC ein gültiger Pfad eingetragen wurde
if (existsState(sID_Autobatterie_SoC)){
    let stateAutoLadenBis_Soc = [PfadEbene1 + PfadEbene2[1] + 'AutoLadenBis_SoC', {'def':100, 'name':'SoC Wert E-Auto bis zu dem geladen werden soll' , 'type':'number', 'role':'value', 'unit':'%'}]
    statesToCreate.push(stateAutoLadenBis_Soc)
}

createUserStates(instanz, false, statesToCreate, async function(){
    log('Jetzt sind alle States abgearbeitet');
    /* ab hier wird Code erst nach Erstellung der State ausgeführt */
    // Prüfen ob beim Scriptstart das E-Auto bereits angesteckt ist
    Lademodus = getState(sID_Lademodus_Wallbox).val;
    MinBatterieSoC = getState(sID_min_SoC_Batterie_E3DC).val;
    if (getState(sID_Ladestatus_1).val === 67 || getState(sID_Ladestatus_1).val === 66) {FahrzeugAngesteckt = true;}
    if (getState(sID_Automatik).val === true) {Automatik = true;}
    if (existsState(sID_Autobatterie_SoC)){
        Autobatterie_SoC = getState(sID_Autobatterie_SoC).val;
        AutoLadenBis_SoC = getState(sID_AutoLadenBis_SoC).val;
    }
    // Funktion Schlüsselschalter ist mit den digitalen Eingängen EN und ML verbunden
    // diese müsssen deaktiviert werden um über das Script den Schlüsselschalter verwenden zu können.
    await setStateAsync(sID_Definition_Eingang_EN,0); // Standard ist hier 1
	await setStateAsync(sID_Definition_Eingang_ML,0); // Standard ist hier 13
});

//---------------------------------------------------------------------------------------------------
//+++++++++++++++++++++++++++++++++++++++++++ Funktionen ++++++++++++++++++++++++++++++++++++++++++++
//---------------------------------------------------------------------------------------------------

function main()
{
    switch (Lademodus) {
    case 0:
        // E-Auto nicht laden
        setState(sID_Ladevorgang_Pause_1,true);
        break;
    case 1:
        // Lademodus 1= Nur Überschuss Laden mit Prio. Batterie möglichst ohne Netzbezug. (Netzbezug / Entladen Batterie ist während der Haltezeit möglich)
        Lademodus1();
        break;
    case 2:
        // Lademodus 2= Nur Überschuss Laden mit Prio. Wallbox möglichst ohne Netzbezug. (Netzbezug / Entladen Batterie ist während der Haltezeit möglich)
        Lademodus2();
        break;
    case 3:
        // E-Auto mit max. Ladestrom laden. Batterie und Netzbezug werden ignoriert
        setState(sID_Ladestrom_Wallbox_1,MaxLadestrom_A);
        setState(sID_Ladevorgang_Pause_1,false);        
        break;
    case 4:
        // Lademodus 4= Laden über Batterie E3DC ohne Netzbezug bis zu einem eingestellten SoC Wert der Batterie E3DC
        Lademodus4();
        break;
   default:
        setState(sID_Ladestrom_Wallbox_1,MinLadestromAuto_A);
        setState(sID_Ladevorgang_Pause_1,true);        
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

    // Prüfen ob ausreichend PV-Leistung erzeugt wird
    if (StromA(PV_Leistung_W,3)>MinLadestromAuto_A || HaltezeitLaden1){
        
        // Prüfen ob Werte Netz oder Batterie negativ sind
        if (NetzLeistung_W <= -500 && BatterieLeistung_W < 0){
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-NetzLeistung_W;
        }else if (NetzLeistung_W > -500 && BatterieLeistung_W < 0) {
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-2070; //1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W > -500 && BatterieLeistung_W > 0) {
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W-2070; //1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W <= -500 && BatterieLeistung_W > 0){
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W-NetzLeistung_W;
        }
        if (AutoLadeleistung_W<0){AutoLadeleistung_W =0}
        
        //AutoLadeleistung_W in AutoLadestrom_A umrechnen.
        AutoLadestrom_A = await StromA(AutoLadeleistung_W,3);
        
        if (DebugAusgabe){log('NetzLeistung_W ='+NetzLeistung_W)};
        if (DebugAusgabe){log('BatterieLeistung_W ='+BatterieLeistung_W)};
        if (DebugAusgabe){log('Hausverbrauch_W ='+Hausverbrauch_W)};
        if (DebugAusgabe){log('PV_Leistung_W ='+PV_Leistung_W)};
        if (DebugAusgabe){log('Ladestrom Auto ='+AutoLadestrom_A+' AutoLadeleistung_W ='+AutoLadeleistung_W)};
        
        
        // Wenn AutoLadestrom_A höher ist als MaxLadestrom_A, dann auf max. Ladestrom begrenzen
        if (AutoLadestrom_A > MaxLadestrom_A){ AutoLadestrom_A = MaxLadestrom_A;}
        
        // Prüfen ob mögliche AutoLadestrom_A höher als MinLadestromStart_A, wenn ja Haltezeit starten
        // Wenn Hausspeicher Batterie unter MinBatterieSoC ist soll das laden vom E-Auto beendet werden.
        // Wenn Hausspeicher Batterie unter Parameter HTmin E3DC-Control ist soll das laden vom E-Auto beendet werden.
        // Wenn Hausspeicher Batterie unter Ladeschwelle E3DC-Control ist soll das E-Auto nicht geladen werden.
        // Wenn die Autobatterie bis zum eingestellten SoC geladen ist soll das Laden abgebrochen werden
        if (existsState(sID_Autobatterie_SoC)){
            if (AutoLadestrom_A > MinLadestromStart_A && BatterieSoC > MinBatterieSoC && BatterieSoC > HTmin && BatterieSoC > Ladeschwelle &&  Autobatterie_SoC < AutoLadenBis_SoC ){
                if (HaltezeitLaden1){clearTimeout(HaltezeitLaden1)}
                HaltezeitLaden1 = setTimeout(function () {HaltezeitLaden1 = null;}, Haltezeit1*60000);
                await setStateAsync(sID_Ladevorgang_Pause_1,false);
            }else{
                if (HaltezeitLaden1) {
                    AutoLadestrom_A = MinLadestromAuto_A;    
                }else{
                    AutoLadestrom_A = MinLadestromAuto_A;
                    await setStateAsync(sID_Ladevorgang_Pause_1,true);
                }
            }
        }else{
            if (AutoLadestrom_A > MinLadestromStart_A && BatterieSoC > MinBatterieSoC && BatterieSoC > HTmin && BatterieSoC > Ladeschwelle ){
                if (HaltezeitLaden1){clearTimeout(HaltezeitLaden1)}
                HaltezeitLaden1 = setTimeout(function () {HaltezeitLaden1 = null;}, Haltezeit1*60000);
                await setStateAsync(sID_Ladevorgang_Pause_1,false);
            }else{
                if (HaltezeitLaden1) {
                    AutoLadestrom_A = MinLadestromAuto_A;    
                }else{
                    AutoLadestrom_A = MinLadestromAuto_A;
                    await setStateAsync(sID_Ladevorgang_Pause_1,true);
                }
            }
        }
        
        //Schnelle Wechsel beim Laden verhindern und nur in 1 A Schritte erhöhen/verringern
        //Ladeleistung Wallbox über Tendenz Zähler möglichst konstant halten. 
        if (AutoLadestrom_A > iAutoLadestrom_A && !timerPause1 && !timerPause2){
            timerPause1 =  setTimeout(function () {clearTimeout(timerPause1);timerPause1 = null;}, 2000);
            Tendenz_i++
            if (Tendenz_i>=5){++iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A > MaxLadestrom_A){ iAutoLadestrom_A = MaxLadestrom_A;}
        }else if(AutoLadestrom_A < iAutoLadestrom_A && !timerPause1 && !timerPause2){
            Tendenz_i--
            timerPause2 =  setTimeout(function () {clearTimeout(timerPause2);timerPause2 = null;}, 2000);
            if (Tendenz_i<=-5){--iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A < MinLadestromAuto_A){ iAutoLadestrom_A = MinLadestromAuto_A;}
        }
       
        // Vorgabe Ladestrom an Wallbox übermitteln
        await setStateAsync(sID_Ladestrom_Wallbox_1,iAutoLadestrom_A);
        
        if (DebugAusgabe){log('Lademodus = '+ Lademodus);}
        if (DebugAusgabe){log('HaltezeitLaden1 ist  = '+ HaltezeitLaden1);}
        if (DebugAusgabe){log('Autobatterie_SoC ist  = '+ Autobatterie_SoC);}
        if (DebugAusgabe){log('AutoLadenBis_SoC ist  = '+ AutoLadenBis_SoC);}
    }else{
        AutoLadestrom_A = MinLadestromAuto_A;
        await setStateAsync(sID_Ladevorgang_Pause_1,true);
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
    if (StromA(PV_Leistung_W,3)>MinLadestromAuto_A || HaltezeitLaden2){
        
        // Prüfen ob Werte Netzleistung negativ ist
        if (NetzLeistung_W < 0 && BatterieLeistung_W < 0){
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W-NetzLeistung_W;
        }else if (NetzLeistung_W > 0 && BatterieLeistung_W < 0) {
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W-NetzLeistung_W-1380; //1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W > 0 && BatterieLeistung_W > 0) {
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-NetzLeistung_W-1380; //1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W < 0 && BatterieLeistung_W > 0){
            AutoLadeleistung_W = PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-NetzLeistung_W;
        }
        if (AutoLadeleistung_W < 0){AutoLadeleistung_W = 0}
        
        //AutoLadeleistung_W in AutoLadestrom_A umrechnen.
        AutoLadestrom_A = await StromA(AutoLadeleistung_W,3);
        
        if (DebugAusgabe){log('NetzLeistung_W ='+NetzLeistung_W)};
        if (DebugAusgabe){log('BatterieLeistung_W ='+BatterieLeistung_W)};
        if (DebugAusgabe){log('Hausverbrauch_W ='+Hausverbrauch_W)};
        if (DebugAusgabe){log('PV_Leistung_W ='+PV_Leistung_W)};
        if (DebugAusgabe){log('Ladestrom Auto ='+AutoLadestrom_A+' AutoLadeleistung_W ='+AutoLadeleistung_W)};
                
        // Wenn AutoLadestrom_A höher ist als MaxLadestrom_A, dann auf max. Ladestrom begrenzen
        if (AutoLadestrom_A > MaxLadestrom_A){ AutoLadestrom_A = MaxLadestrom_A;}
        
        // Prüfen ob mögliche AutoLadestrom_A höher als MinLadestromStart_A, wenn ja Haltezeit starten
        // Wenn Hausspeicher Batterie unter Parameter HTmin E3DC-Control ist soll das laden vom E-Auto beendet werden.
        // Wenn die Autobatterie bis zum eingestellten SoC geladen ist soll das Laden abgebrochen werden
        if (existsState(sID_Autobatterie_SoC)){
            if (AutoLadestrom_A > MinLadestromStart_A && BatterieSoC > HTmin && Autobatterie_SoC < AutoLadenBis_SoC){
                if (HaltezeitLaden2){clearTimeout(HaltezeitLaden2)}
                HaltezeitLaden2 = setTimeout(function () {HaltezeitLaden2 = null;}, Haltezeit2*60000);
                await setStateAsync(sID_Ladevorgang_Pause_1,false);
            }else{
                if (HaltezeitLaden2) {
                    AutoLadestrom_A = MinLadestromAuto_A;    
                }else{
                    AutoLadestrom_A = MinLadestromAuto_A;
                    await setStateAsync(sID_Ladevorgang_Pause_1,true);
                }
            }
        }else{
            if (AutoLadestrom_A > MinLadestromStart_A && BatterieSoC > HTmin){
                if (HaltezeitLaden2){clearTimeout(HaltezeitLaden2)}
                HaltezeitLaden2 = setTimeout(function () {HaltezeitLaden2 = null;}, Haltezeit2*60000);
                await setStateAsync(sID_Ladevorgang_Pause_1,false);
            }else{
                if (HaltezeitLaden2) {
                    AutoLadestrom_A = MinLadestromAuto_A;    
                }else{
                    AutoLadestrom_A = MinLadestromAuto_A;
                    await setStateAsync(sID_Ladevorgang_Pause_1,true);
                }
            }
        }
        
        //Schnelle Wechsel beim Laden verhindern und nur in 1 A Schritte erhöhen/verringern
        //Ladeleistung Wallbox über Tendenz Zähler möglichst konstant halten. 
        if (AutoLadestrom_A > iAutoLadestrom_A && !timerPause1 && !timerPause2){
            timerPause1 =  setTimeout(function () {clearTimeout(timerPause1);timerPause1 = null;}, 2000);
            Tendenz_i++
            if (Tendenz_i>=5){++iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A > MaxLadestrom_A){ iAutoLadestrom_A = MaxLadestrom_A;}
        }else if(AutoLadestrom_A < iAutoLadestrom_A && !timerPause1 && !timerPause2){
            Tendenz_i--
            timerPause2 =  setTimeout(function () {clearTimeout(timerPause2);timerPause2 = null;}, 2000);
            if (Tendenz_i<=-5){--iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A < MinLadestromAuto_A){ iAutoLadestrom_A = MinLadestromAuto_A;}
        }
        
        // Vorgabe Ladestrom an Wallbox übermitteln
        await setStateAsync(sID_Ladestrom_Wallbox_1,iAutoLadestrom_A);
        if (DebugAusgabe){log('Lademodus = '+ Lademodus);}
        if (DebugAusgabe){log('HaltezeitLaden2 ist  = '+ HaltezeitLaden2);}
        if (DebugAusgabe){log('Autobatterie_SoC ist  = '+ Autobatterie_SoC);}
        if (DebugAusgabe){log('AutoLadenBis_SoC ist  = '+ AutoLadenBis_SoC);}
    }else{
        AutoLadestrom_A = MinLadestromAuto_A;
        await setStateAsync(sID_Ladevorgang_Pause_1,true);
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
    // prüfen ob max Nennleistung Wechselrichter eingehalten wird
    let MaxNennleistung = MaxEntladeLeistungBatterie_W+PV_Leistung_W
    
    // Prüfen ob ausreichend PV-Leistung erzeugt wird oder Batterie E3DC geladen ist
    if (StromA(PV_Leistung_W,3)>MinLadestromAuto_A || HaltezeitLaden2 || BatterieSoC > HTmin){
        // prüfen ob max Nennleistung Wechselrichter eingehalten wird sonst Entladeleistung Batterie reduzieren
        if (MaxNennleistung > MaxNennleistungWR) {
            EntladeleistungBatterie = MaxEntladeLeistungBatterie_W-(MaxNennleistung - MaxNennleistungWR);
            if (EntladeleistungBatterie<0){EntladeleistungBatterie=0}
        }else{
            EntladeleistungBatterie = MaxEntladeLeistungBatterie_W
        }
        if (NetzLeistung_W < 0 && BatterieLeistung_W < 0){
            AutoLadeleistung_W = EntladeleistungBatterie+PV_Leistung_W-Hausverbrauch_W;
        }else if (NetzLeistung_W < 0 && BatterieLeistung_W >= 0){
            AutoLadeleistung_W = EntladeleistungBatterie+PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-NetzLeistung_W;
        }else if (NetzLeistung_W >= 0 && BatterieLeistung_W < 0){
            AutoLadeleistung_W = EntladeleistungBatterie+PV_Leistung_W-Hausverbrauch_W-1380; //1380 W Trägheitsreserve bei Netzbezug
        }else if (NetzLeistung_W >= 0 && BatterieLeistung_W >= 0){
            AutoLadeleistung_W = EntladeleistungBatterie+PV_Leistung_W-Hausverbrauch_W+BatterieLeistung_W-NetzLeistung_W-1380; //1380 W Trägheitsreserve bei Netzbezug
        }
        
        if (AutoLadeleistung_W < 0){AutoLadeleistung_W = 0}
        
        //AutoLadeleistung_W in AutoLadestrom_A umrechnen.
        AutoLadestrom_A = await StromA(AutoLadeleistung_W,3);
        
        if (DebugAusgabe){log('NetzLeistung_W ='+NetzLeistung_W)};
        if (DebugAusgabe){log('BatterieLeistung_W ='+BatterieLeistung_W)};
        if (DebugAusgabe){log('Hausverbrauch_W ='+Hausverbrauch_W)};
        if (DebugAusgabe){log('PV_Leistung_W ='+PV_Leistung_W)};
        if (DebugAusgabe){log('Ladestrom Auto ='+AutoLadestrom_A+' AutoLadeleistung_W ='+AutoLadeleistung_W)};
                
        // Wenn AutoLadestrom_A höher ist als MaxLadestrom_A, dann auf max. Ladestrom begrenzen
        if (AutoLadestrom_A > MaxLadestrom_A){ AutoLadestrom_A = MaxLadestrom_A;}
        
        // Prüfen ob mögliche AutoLadestrom_A höher als MinLadestromStart_A, wenn ja Haltezeit starten
        // Wenn Hausspeicher Batterie unter Parameter HTmin E3DC-Control ist soll das laden vom E-Auto beendet werden.
        // Wenn die Autobatterie bis zum eingestellten SoC geladen ist soll das Laden abgebrochen werden
        if (existsState(sID_Autobatterie_SoC)){
            if (AutoLadestrom_A > MinLadestromStart_A && BatterieSoC > HTmin && BatterieSoC > MinBatterieSoC && Autobatterie_SoC < AutoLadenBis_SoC ){
                if (HaltezeitLaden4){clearTimeout(HaltezeitLaden4)}
                HaltezeitLaden4 = setTimeout(function () {HaltezeitLaden4 = null;}, Haltezeit4*60000);
                await setStateAsync(sID_Ladevorgang_Pause_1,false);
            }else{
                if (HaltezeitLaden4 && BatterieSoC > MinBatterieSoC) {
                    AutoLadestrom_A = MinLadestromAuto_A;    
                }else{
                    AutoLadestrom_A = MinLadestromAuto_A;
                    await setStateAsync(sID_Ladevorgang_Pause_1,true);
                }
            }
        }else{
            if (AutoLadestrom_A > MinLadestromStart_A && BatterieSoC > HTmin && BatterieSoC > MinBatterieSoC){
                if (HaltezeitLaden4){clearTimeout(HaltezeitLaden4)}
                HaltezeitLaden4 = setTimeout(function () {HaltezeitLaden4 = null;}, Haltezeit4*60000);
                await setStateAsync(sID_Ladevorgang_Pause_1,false);
            }else{
                if (HaltezeitLaden4) {
                    AutoLadestrom_A = MinLadestromAuto_A;    
                }else{
                    AutoLadestrom_A = MinLadestromAuto_A;
                    await setStateAsync(sID_Ladevorgang_Pause_1,true);
                }
            }
        }
        
        //Schnelle Wechsel beim Laden verhindern und nur in 1 A Schritte erhöhen/verringern
        //Ladeleistung Wallbox über Tendenz Zähler möglichst konstant halten. 
        if (AutoLadestrom_A > iAutoLadestrom_A && !timerPause1 && !timerPause2){
            timerPause1 =  setTimeout(function () {clearTimeout(timerPause1);timerPause1 = null;}, 2000);
            Tendenz_i++
            if (Tendenz_i>=5){++iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A > MaxLadestrom_A){ iAutoLadestrom_A = MaxLadestrom_A;}
        }else if(AutoLadestrom_A < iAutoLadestrom_A && !timerPause1 && !timerPause2){
            Tendenz_i--
            timerPause2 =  setTimeout(function () {clearTimeout(timerPause2);timerPause2 = null;}, 2000);
            if (Tendenz_i<=-5){--iAutoLadestrom_A;Tendenz_i=0}
            if (iAutoLadestrom_A < MinLadestromAuto_A){ iAutoLadestrom_A = MinLadestromAuto_A;}
        }
        
        // Vorgabe Ladestrom an Wallbox übermitteln
        await setStateAsync(sID_Ladestrom_Wallbox_1,iAutoLadestrom_A);
        if (DebugAusgabe){log('Lademodus = '+ Lademodus);}
        if (DebugAusgabe){log('HaltezeitLaden2 ist  = '+ HaltezeitLaden2);}
        if (DebugAusgabe){log('Autobatterie_SoC ist  = '+ Autobatterie_SoC);}
        if (DebugAusgabe){log('AutoLadenBis_SoC ist  = '+ AutoLadenBis_SoC);}
    }else{
        AutoLadestrom_A = MinLadestromAuto_A;
        await setStateAsync(sID_Ladevorgang_Pause_1,true);
    }
}


// Funktion zum Runden auf einstellbare Anzahl Stellen nach dem Komma.
// Parameter: wert als float und dez als Int für die Anzahl der Stellen nach dem Komma
function round(wert, dez) {
    let umrechnungsfaktor = Math.pow(10,dez);
    return Math.round(wert * umrechnungsfaktor) / umrechnungsfaktor;
} 

// Autor:Mic (ioBroker) | Mic-M (github)
// Fügt Vornullen zu einer Zahl hinzu, macht also z.B. aus 7 eine "007". 
// Akzeptiert sowohl Datentyp number und string als Eingabe.
// Autor:Mic (ioBroker) | Mic-M (github)
function zeroPad(num, places) {
    let zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
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
    out.MM = zeroPad(mm,2);
    out.DD = zeroPad(dd,2);
    return out;
}

// Rechnet Leistung W in A je Phase um
function StromA(Leistung_W,AnzPhasen) {
    let Strom_A = round(Leistung_W/230/AnzPhasen,2)
    return Strom_A;
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
            //if (DebugAusgabe) log('[Debug] Now we are creating new state [' + loopParam[0] + ']');
            let loopInit = (loopParam[1]['def'] == undefined) ? null : loopParam[1]['def']; // mimic same behavior as createState if no init value is provided
            createState(loopParam[0], loopInit, force, loopParam[1], function() {
                numStates--;
                if (numStates === 0) {
                    //if (DebugAusgabe) log('[Debug] All states processed.');
                    if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                        //if (DebugAusgabe) log('[Debug] Function to callback parameter was provided');
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
            //if (DebugAusgabe) log ('[Debug] Currently processing following state: [' + loopParam[0] + ']');
            if( ($(loopParam[0]).length > 0) && (existsState(loopParam[0])) ) { // Workaround due to https://github.com/ioBroker/ioBroker.javascript/issues/478
                // State is existing.
                if (WARN && !force) log('State [' + loopParam[0] + '] is already existing and will no longer be created.', 'warn');
                //if (!WARN && DebugAusgabe) log('[Debug] State [' + loopParam[0] + '] is already existing. Option force (=overwrite) is set to [' + force + '].');
                if(!force) {
                    // State exists and shall not be overwritten since force=false
                    // So, we do not proceed.
                    numStates--;
                    if (numStates === 0) {
                        //if (DebugAusgabe) log('[Debug] All states successfully processed!');
                        if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                            //if (DebugAusgabe) log('[Debug] An optional callback function was provided, which we are going to execute now.');
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
                    //if (DebugAusgabe) log('[Debug] Now we are creating new state [' + loopParam[0] + ']')
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
                            //if (DebugAusgabe) log('[Debug] setState durchgeführt: ' + loopParam[0]);
                            numStates--;
                            if (numStates === 0) {
                                //if (DebugAusgabe) log('[Debug] All states processed.');
                                if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                                    //if (DebugAusgabe) log('[Debug] Function to callback parameter was provided');
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



//***************************************************************************************************
//********************************** Schedules und Trigger Bereich **********************************
//***************************************************************************************************

// Wird bei Änderung Lademodus in VIS aufgerufen
on({id: sID_Lademodus_Wallbox},async function (obj){
	Lademodus = (await getStateAsync(obj.id)).val;
    // Timer zurücksetzen beim Wechsel des Lademodus
    clearTimeout(timerPause1);clearTimeout(timerPause2);clearTimeout(HaltezeitLaden1);clearTimeout(HaltezeitLaden2);clearTimeout(HaltezeitLaden4)
    timerPause1 = null;timerPause2 = null;HaltezeitLaden1 = null;HaltezeitLaden2 = null;HaltezeitLaden4 = null
    main();
});  

// Wird bei Änderung PV_Leistung aufgerufen
// Bei Änderung PV_Leistung und E-Auto bereit zum laden und Lademodus = 1, 2 Main() aufrufen.
on({id: sID_PV_Leistung}, async function (obj){
	let LademodusWallbox = (await getStateAsync(sID_Lademodus_Wallbox)).val;
    if (FahrzeugAngesteckt == true && Automatik && (LademodusWallbox == 1 || LademodusWallbox == 2 ))
    {
        main();
    }
}); 

// Wird bei Änderung Batterie_Leistung aufgerufen
// Bei Änderung Batterie_Leistung und E-Auto bereit zum laden und Lademodus = 4, 5 Main() aufrufen.
on({id: sID_Batterie_Leistung}, async function (obj){
	let LademodusWallbox = (await getStateAsync(sID_Lademodus_Wallbox)).val;
    
    if (FahrzeugAngesteckt == true && Automatik && LademodusWallbox == 4 )
    {
        main();
    }
});

// Wird bei Änderung Schluesselschalter Wallbox aufgerufen
// Anwahl Lademodus über Schlüsselschalter der Wallbox
on({id: sID_Schluesselschalter_Wallbox_1}, async function (obj){
	// Funktion Schlüsselschalter ist mit den digitalen Eingängen EN und ML verbunden
    // diese müsssen deaktiviert werden um über das Script den Schlüsselschalter verwenden zu können.
    await setStateAsync(sID_Definition_Eingang_EN,0); // Standard ist hier 1
	await setStateAsync(sID_Definition_Eingang_ML,0); // Standard ist hier 13
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
    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'Verbrauch_E-Auto_kWh_Tag'+ zeroPad(DateHeute.getDate(),2),ZaehlerDif);
	
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

// Wenn State HTmin vorhanden ist, dann bei Änderung den Wert der Variable aktualisieren
if (existsState(sID_E3DC_Control_HTmin)){    
    on({id:sID_E3DC_Control_HTmin,change: "ne"}, function (obj){
        HTmin = getState(obj.id).val;
    });
}

// Wenn State Ladeschwelle vorhanden ist, dann bei Änderung den Wert der Variable aktualisieren
if (existsState(sID_E3DC_Control_Ladeschwelle)){    
    on({id:sID_E3DC_Control_Ladeschwelle,change: "ne"}, function (obj){
        Ladeschwelle = getState(obj.id).val;
    });
}

// Modbus.1 Register 100 Status nach IEC 61851-1 in Klartext"
on(sID_Ladestatus_1, function (obj) {
    let iStatus = obj.state.val;
    switch (iStatus) {
        case 65:
            setState(instanz + PfadEbene1 + PfadEbene2[0] + 'Ladestatus_Wallbox', 'Standby' );
            FahrzeugAngesteckt = false;
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

// jeden Tag um 23:58 Verbrauch Tag speichern.
schedule('58 23 * * *', function() { 
	let ZaehlerstandAkt = getState(sID_Gesamtzaehler_Verbrauch_kWh_1).val; 
    let ZaehlerstandTagAlt = getState(sID_ZaehlerstandTagAlt).val;
    let ZaehlerDif = ZaehlerstandAkt-ZaehlerstandTagAlt
    let DateHeute = new Date();
    setState(instanz + PfadEbene1 + PfadEbene2[2] + 'Verbrauch_E-Auto_kWh_Tag'+ zeroPad(DateHeute.getDate(),2),ZaehlerDif);
	setState(sID_ZaehlerstandTagAlt,ZaehlerstandAkt)
    if (LogAusgabe)log('Tagesertragswert gespeichert');
});

// Monatlich Json speichern und Tageszähler auf 0 setzen. Am 1.1 Monatzähler auf 0 setzen
schedule("0 0 1 * *", function() { 
    if (existsState('0_userdata.0.PV_Anlage.Kosten.StrompreisMonat')){
        NettoStrompreis = getState('0_userdata.0.PV_Anlage.Kosten.StrompreisMonat').val;
    }
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
	        let n = zeroPad(i,2);
            setState(instanz + PfadEbene1 + PfadEbene2[2] + 'Verbrauch_E-Auto_kWh_Tag' +n,0);
    }
    setState(sID_ZaehlerstandMonatAlt,ZaehlerstandAkt);
    
});