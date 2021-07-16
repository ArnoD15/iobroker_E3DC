/*
Script Sammlung für E3DC

Modbus Register 40082 Aufteilung "Autarkie und Eigenverbrauch in Prozent				Autor:Andre Germann
Modbus Register 40002 Aufteilung "Modbus Firmware Version"								Autor:Andre Germann
Modbus Register 40085 "EMS-Status" Datenwort Dez. in BIT_Ausgabe für Vis umwandeln		Autor:ArnoD
Modbus Register 40088 "Wallbox_x_CTRL" Datenwort Dez. in BIT_Ausgabe für Vis umwandeln	Autor:ArnoD
E3DC dynamische Autonomiezeitberechnung V0.0.8											Autor:Smartboard
Bei Firmware-Updates das Datum des Updates und die alte Versionsnummer speichern		Autor:stevie77

*/

// Konfiguration 
var logging = false;
var debug = false;
var Speicherbrutto = 39; // kw/h hier die Speichergröße in kwh eintragen
var Wirkungsgrad = 0.88; // Faktor Systemwirkungsgrad > 88% beiS10 E Pro abzüglich des Systemwirkungsgrad eintragen Bei 13 KW 13 / 100 * 88 = 11.44
var Entladetiefe = 0.9; // Faktor Tiefenentladeschutz 90% Nutzbar weil Tiefenentladungsschutz von E3DC 11.44 / 100 * 90 = 10,296
var E3DCReserve = 0; // % eingestellte Notstromreserve in Prozent bei E3dC. Wenn diese nicht verwendet wird dan 0 eintragen.
var cron1 = 10; // hier die Schedulezeit - Triggerhäufigkeit alle x Sekunden für Zeitberechnung eintragen
var counter = 24; // Hier die Anzahl der Zeitberechnungen eintragen um einen Durchschnitswert zu ermitteln

const fC = false;
const Statepfad = 'javascript.' + instance + '.e3dc.modbus.';
const Statepfad1 = 'javascript.' + instance + '.Wallbox.modbus.';
const idHTSockel = '0_userdata.0.E3DC-Control.Parameter.HTsockel';
const idHTon = '0_userdata.0.E3DC-Control.Parameter.HTon';
const idHToff = '0_userdata.0.E3DC-Control.Parameter.HToff'; 
const idLastFirmwareUpdate = Statepfad + 'lastFirmwareUpdate';
const idLastFirmware = Statepfad + 'lastFirmware';
const idAutonomiezeit = Statepfad + 'Autonomiezeit';   
const idBatSockWh = Statepfad + 'Batteriekapazitaet';


// E3DC Modbus.0
const idBatEntnahme = 'modbus.0.holdingRegisters.40070_Batterie_Leistung'/*Batterie-Leistung in Watt*/;
const idBatSoc = 'modbus.0.holdingRegisters.40083_Batterie_SOC'/*Batterie-SOC in Prozent*/;
const idNotstrombetrieb = 'modbus.0.holdingRegisters.40084_Emergency_Power_Status'/*Emergency-Power Status*/;
const idRegister40082 = 'modbus.0.holdingRegisters.40082_Autarkie_Eigenverbrauch';
const idRegister40002 = 'modbus.0.holdingRegisters.40002_Modbus_Firmware';
const idRegister40088 = 'modbus.0.holdingRegisters.40088_WallBox_0_CTRL';
const idRegister40085 = 'modbus.0.holdingRegisters.40085_EMS_Status';
const idFirmware = 'modbus.0.holdingRegisters.40052_Firmware';

//ab hier muss nichts geändert werden


createState(idLastFirmwareUpdate);
createState(idLastFirmware);
createState(idAutonomiezeit, 0, fC, { type: 'string', name: 'Autonomiezeit',role:'text'});
createState(idBatSockWh, 0, fC, { type: 'number', name: 'Batteriekapazität',role:'value', unit: ' kWh'});
createState(Statepfad + 'Autarkie');
createState(Statepfad + 'Eigenverbrauch');
createState(Statepfad + 'MajorVersion');
createState(Statepfad + 'MinorVersion');
createState(Statepfad + 'WallBox_0_CTRL_Bit_0', {'def':0, 'name':'Wallbox vorhanden und verfügbar=1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_1', {'def':0, 'name':'Solarbetrieb aktiv=1 Mischbetrieb aktiv=0' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_2', {'def':0, 'name':'Laden abgebrochen=1 Laden freigegeben=0' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_3', {'def':0, 'name':'Auto lädt=1 Auto lädt nicht=0' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_4', {'def':0, 'name':'Typ-2-Stecker verriegelt=1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_5', {'def':0, 'name':'Typ-2-Stecker gesteckt=1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_6', {'def':0, 'name':'Schukosteckdose1 an = 1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_7', {'def':0, 'name':'Schukostecker1 gesteckt = 1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_8', {'def':0, 'name':'Schukostecker1 verriegelt = 1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_9', {'def':0, 'name':'Relais an, 16A, 1 Phase,Schukosteckdose = 1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_10', {'def':0, 'name':'Relais an, 16A, 3 Phasen, Typ 2 = 1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_11', {'def':0, 'name':'Relais an, 32A, 3 Phasen, Typ 2 = 1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'WallBox_0_CTRL_Bit_12', {'def':0, 'name':'Eine Phase aktiv=1 drei Phasen aktiv=0' , 'type':'number', 'role':'State'});
createState(Statepfad + 'EMS_Status_Bit_0', {'def':0, 'name':'Laden der Batterien ist gesperrt=1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'EMS_Status_Bit_1', {'def':0, 'name':'Entladen der Batterien ist gesperrt=1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'EMS_Status_Bit_2', {'def':0, 'name':'Notstrommodus ist möglich=1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'EMS_Status_Bit_3', {'def':0, 'name':'Wetterbasiertes Es wird Ladekapazität zurückgehalten=1 Es wird keine Ladekapazität zurückgehalten=0' , 'type':'number', 'role':'State'});
createState(Statepfad + 'EMS_Status_Bit_4', {'def':0, 'name':'Abregelungs-Status es wird abgeregelt=1 es wird nicht abgeregelt=0' , 'type':'number', 'role':'State'});
createState(Statepfad + 'EMS_Status_Bit_5', {'def':0, 'name':'Ladesperrzeit aktiv = 1' , 'type':'number', 'role':'State'});
createState(Statepfad + 'EMS_Status_Bit_6', {'def':0, 'name':'Entladesperrzeit aktiv = 1' , 'type':'number', 'role':'State'});
createState(Statepfad1 + '100_Status', 0, fC, { type: 'string', name: 'Ladestatus Wallbox',role:'text'});


//Modbus Register 40082 ***************** Aufteilung "Autarkie und Eigenverbrauch in Prozent"
on(idRegister40082, function (obj) {
setState(Statepfad + 'Autarkie', (obj.state.val >> 8) & 0xFF, true);
setState(Statepfad + 'Eigenverbrauch', obj.state.val & 0xFF, true);
});
 
//Modbus Register 40002 ***************** Aufteilung "Modbus Firmware Version"
on(idRegister40002, function (obj) {
    log(obj.state.val);
    setState(Statepfad + 'MajorVersion', (obj.state.val >> 8) & 0xFF, true);
    setState(Statepfad + 'MinorVersion', obj.state.val & 0xFF, true);
});

// Modbus Register 40088 ***************** "Wallbox_x_CTRL" Datenwort Dez. in BIT_Ausgabe für Vis umwandeln
on({id: Statepfad + 'WallBox_0_CTRL_Bit_1', change: "ne"}, function (obj){if (CallingInstance(obj) == 3){WriteModbusDez(obj)}});
on({id: Statepfad + 'WallBox_0_CTRL_Bit_2', change: "ne"}, function (obj){if (CallingInstance(obj) == 3){WriteModbusDez(obj)}});
on({id: Statepfad + 'WallBox_0_CTRL_Bit_12', change: "ne"}, function (obj){if (CallingInstance(obj) == 3){WriteModbusDez(obj)}});

on(idRegister40088, function (obj) {
    var myDez = obj.state.val;
    var myBin = myDez.toString(2); //Decimal in Bin 
    myBin = new Array(17 - myBin.length).join('0') + myBin;
    log('Wallbox_x_CTRL Dez ='+myDez+'/ BIN ='+myBin);
    if(myBin[15]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_0',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_0',0)};
    if(myBin[14]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_1',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_1',0)};
    if(myBin[13]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_2',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_2',0)};
    if(myBin[12]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_3',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_3',0)};
    if(myBin[11]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_4',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_4',0)};
    if(myBin[10]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_5',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_5',0)};
    if(myBin[9]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_6',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_6',0)};
    if(myBin[8]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_7',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_7',0)};
    if(myBin[7]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_8',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_8',0)};
    if(myBin[6]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_9',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_9',0)};
    if(myBin[5]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_10',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_10',0)};
    if(myBin[4]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_11',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_11',0)};
    if(myBin[3]==1){setState(Statepfad + 'WallBox_0_CTRL_Bit_12',1)}else{setState(Statepfad + 'WallBox_0_CTRL_Bit_12',0)};
 
});

// Modbus Register 40085 ***************** "EMS-Status" Datenwort Dez. in BIT_Ausgabe für Vis umwandeln
on({id: idRegister40085, change: "ne"}, function (obj) {
    var myDez = obj.state.val;
    var myBin = myDez.toString(2); //Decimal in Bin 
    myBin = new Array(17 - myBin.length).join('0') + myBin;
    log('EMS-Status Dez ='+myDez+'/ BIN ='+myBin);
    if(myBin[15]==1){setState(Statepfad + 'EMS_Status_Bit_0',1)}else{setState(Statepfad + 'EMS_Status_Bit_0',0)};
    if(myBin[14]==1){setState(Statepfad + 'EMS_Status_Bit_1',1)}else{setState(Statepfad + 'EMS_Status_Bit_1',0)};
    if(myBin[13]==1){setState(Statepfad + 'EMS_Status_Bit_2',1)}else{setState(Statepfad + 'EMS_Status_Bit_2',0)};
    if(myBin[12]==1){setState(Statepfad + 'EMS_Status_Bit_3',1)}else{setState(Statepfad + 'EMS_Status_Bit_3',0)};
    if(myBin[11]==1){setState(Statepfad + 'EMS_Status_Bit_4',1)}else{setState(Statepfad + 'EMS_Status_Bit_4',0)};
    if(myBin[10]==1){setState(Statepfad + 'EMS_Status_Bit_5',1)}else{setState(Statepfad + 'EMS_Status_Bit_5',0)};
    if(myBin[9]==1){setState(Statepfad + 'EMS_Status_Bit_6',1)}else{setState(Statepfad + 'EMS_Status_Bit_6',0)};
    
});

function WriteModbusDez(obj)
{
    var myBin='000';
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_12').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_11').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_10').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_9').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_8').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_7').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_6').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_5').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_4').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_3').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_2').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_1').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    if(getState(Statepfad + 'WallBox_0_CTRL_Bit_0').val == 1){myBin = myBin+'1'}else{myBin = myBin+'0'};
    var myDez = parseInt(myBin, 2);
    setState(idRegister40088,myDez);
}; 


// ***************** E3DC dynamische Autonomiezeitberechnung

//Variable für Cronjob start stop
var Timer = null;
//Variable Hilfsmerker
var Merker = true;
//Variable zur Berechnung der Zeit
var Autonomiezeit = 0;
//Variable für Berechnung 
var Reserve = 0;
// Variablen für Durchschnittsberechnung
var count = 0;
var Summe = 0;
// Wert gleich anzeigen
var Anzeige = false;
// Variable für Bat Soc in kwh abzüglich Notstromreserve
var BatSockWh = null;
var Entnahme = null;
var BatSoc = null;
var Batterie = Speicherbrutto*Wirkungsgrad; 
var Speicher = Speicherbrutto*Wirkungsgrad*Entladetiefe; 

if(fC && logging)log('force Creation Aktiv States angelegt oder überschrieben');
setState(idAutonomiezeit, '0' ,true); 
if ( debug )log('Batterie E3DC: Die Speichergröße ist ' + Speicherbrutto + ' kWh. abzüglich Wirkungsgrad ' + Batterie + ' kWh und abzüglich des Tiefenentladeschutz bleiben Netto '+ Speicher+ ' kWh.')

setTimeout( function(){Berechnung();},500);

// Trigger Berechnung Aktueller Bat Soc in kwh 
on(idBatSoc, function(dp) {
    BatSoc = dp.state.val; 
	if(debug)log('Trigger BatSoc aktiv. BatSoc beträgt: '+ BatSoc +' %.'); 
	Berechnung();
});

//Berechnung Aktueller Bat Soc in kwh und Wert in State schreiben
function Berechnung(){    
    BatSoc = getState(idBatSoc).val;    
	setState(idBatSockWh,Math.round(((Speicher/100) * BatSoc)*100)/100,true);  
	if(debug)log('Batterie E3DC: Die Aktuell verfügbare Speicherkapazität ist: '+ getState(idBatSockWh).val+' kWh'); 
}

// Schedule Berechnung Autonomiezeit starten bei Entnahme
on(idBatEntnahme, function(dp) {
    if(dp.state.val < 0 ){
		if(Merker)schedulestart();
		Merker = false;
		if(debug)log('Batterie E3DC: Aktuelle Entnahmeleistung: ' + dp.state.val +' Watt');
    }
});

//Berechnung Autonomiezeit
function schedulestart(){
	if(debug)log('Funktion Schedulestart aktiv');  
	var cronjob = "*/"+cron1+" * * * * *";  
	Timer = schedule(cronjob, function(){   
		if(debug)log('Schedule cronjob aktiv');       
		Entnahme = getState (idBatEntnahme).val;
		BatSockWh = getState (idBatSockWh).val;
		var Sockel = parseFloat(getState (idHTSockel).val);
		var HToff = getState (idHToff).val;
		var HTon = getState (idHTon).val;
		var Notstrombetrieb = getState(idNotstrombetrieb).val;
        if (HTon === HToff && E3DCReserve === 0 && Notstrombetrieb === 2){
			Reserve=Sockel;
			if(debug)log('Die Notstrom Reserve entsprichte der Einstellung in E3DC Control und beträgt: ' + Reserve +' %');
		}
		if (E3DCReserve >0 && Notstrombetrieb === 2){
			Reserve = E3DCReserve;
			if(debug)log('Die Notstrom Reserve entspricht der User Konfig Einstellun und beträgt'+ Reserve + ' %');
		}
		if ((HTon != HToff && E3DCReserve === 0) || Notstrombetrieb !=2){
			Reserve=0;
			if(debug)log('Es wird keine Notstrom Reserve bei der Berechnung berücksichtigt. Wert auf ' + Reserve +' % gesetzt.');
		}
		setTimeout(function(){
			if(Entnahme<0){
				BatSockWh = Math.round(BatSockWh - (Speicher/100*Reserve*100)/100);
				if(debug)log('aktuelle Gesamtkapazität abzüglich der Notstromreserve ist:  '+ BatSockWh + ' kWh.');
				setTimeout(function(){
					Autonomiezeit = Math.round(BatSockWh*1000/Entnahme*-1*100)/100;    
					Durchschnitt();
					// gleich Anzeigen
					if(Anzeige === false && Autonomiezeit >0){
						setState(idAutonomiezeit, Autonomiezeit +' h',true);
						Anzeige = true;
					}
					if(debug)log('Autonomiezeit neu berechnet auf:  '+ Autonomiezeit + ' h.');
				},100);
			}else{
				//Berechnung stoppen bei Entnahme 0 und Autonomiezeit auf 0 setzen
				if(Entnahme >=0){
					clearSchedule(Timer);
					Merker = true;
					if(logging)log('Schedule cronjob gestoppt weil keine Entnahme');
					setState(idAutonomiezeit,'0',true);
					Anzeige = false;
                }
            }
        },100);   
    });
}

// Zaehler für Durchschnittsberechnung
function Durchschnitt(){
	count ++
	Summe = Summe + Autonomiezeit;
	if(debug)log ('Summe: ' + Summe + ' Zaehler: '+count+ ' Addition: + ' + Autonomiezeit);
	if(count===counter){
		var Zeit= Summe/count;
		setTimeout(function(){
			if(logging)log('Batterie E3DC: Aktuelle Speicherkapazität beträgt: '+ getState(idBatSockWh).val+' kWh, abzüglich der Notstromreserve '+BatSockWh+ ' kWh' );     
			if(Zeit>=1){    
				setState(idAutonomiezeit,+ Math.round(Zeit*100)/100 +' h',true);  
				if(logging)log('Autonomiezeit in h beträgt: '+ Math.round(Zeit*10)/10 + ' h');
			}
			if(Zeit<1 && Zeit >0){            
				setState(idAutonomiezeit, + Math.round((Zeit*60)*100/100)+' min',true);
				if(logging)log('Autonomiezeit in min beträgt: '+Math.round((Zeit*60)*100/100) +' min.');
			}    
			if(Zeit < 0){
				setState(idAutonomiezeit, '0' ,true);
				if(logging)log('Batterie E3DC: Autonomiezeit beträgt: 0 min.');
			}
			count=0;
			Summe=0;
			if(debug)log('Reset: Count =  '+ count+ ' Summe = ' + Summe);
		},100);  
	}
}
 
// Speichert zum Zeitpunkt eines Firmware-Updates das Datum des Updates und die alte Versionsnummer.
on(idFirmware, function(obj){
    var actualDate = new Date();
    var actualDateString = formatDate(actualDate, "DD.MM.YYYY hh:mm:ss");
    setState(idLastFirmwareUpdate, actualDateString);
    setState(idLastFirmware, obj.oldState.val);
});
 


//Function prüft welche Instanz aufruft und gibt als Ergebnis admin=1 javascript= 2 web=3 zurück
function CallingInstance(obj){
    let CallingAdmin = ''+obj.state.from.match(/admin/ig)
    let CallingJavascript = ''+obj.state.from.match(/javascript/ig)
    let CallingWeb = ''+obj.state.from.match(/web/ig)
    if (CallingAdmin === 'admin'){return 1;}
    if (CallingJavascript === 'javascript'){return 2;}
    if (CallingWeb === 'web'){return 3;}
    return 0;
}

