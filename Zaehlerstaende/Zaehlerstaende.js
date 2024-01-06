/**********************************************************************************************
Script zur Erfassung und Berechnung der Zählerstände.
***********************************************************************************************/
//+++++++++++++++++++++++++++++++++++++  USER ANPASSUNGEN ++++++++++++++++++++++++++++++++++++++

let instanz = '0_userdata.0.';                                                                                      // Instanz Script Charge-Control
let PfadEbene1 = 'Zaehlerstaende.';                                                                                      // Pfad innerhalb der Instanz
let PfadEbene2 = ['Zaehlerstaende.', 'Kosten.', 'History.']                                                         // Pfad innerhalb PfadEbene1
const LogAusgabe = false                                                                                            // Zusätzliche LOG Ausgaben 
const DebugAusgabe = false                                                                                          // Debug Ausgabe im LOG zur Fehlersuche
const nEinspeiseVerguetung = 0.0979                                                                                 // Einspeisevergütung pro kWh

// Script Charge_Control
const sID_Batterie_max_kWh = '0_userdata.0.Charge_Control.Allgemein.Batteriekapazität_kWh'                          // Max. kWh nach Abzug von Wandlungsverlusten und max. Entladetiefe von 90%

// Homematic
const sID_BezugZaehlerHomematic = 'hm-rpc.0.QEQ0337064.1.IEC_ENERGY_COUNTER';                                       // Pfad zum Bezugszähler 
const sID_EinspeiseZaehlerHomematic = 'hm-rpc.0.QEQ0337064.2.IEC_ENERGY_COUNTER';                                   // Pfad zum Einspeisezähler 
const sID_PV_Zaehler_AC_kWh_Akt = 'hm-rpc.0.QEQ0337042.1.IEC_ENERGY_COUNTER';                                       // Pfad zum PV Zähler

// Heizung LW-Pumpe
const sID_LW_Pumpe_Verbrauch_LM0 ='0_userdata.0.Heizung.LW_Pumpe_VerbrauchLM0_kWh';                                 // Leistungszähler Verbrauch LW-Pumpe


// e3dc-rscp Adapter
const sID_String0_DC_Wh = 'e3dc-rscp.0.PVI.PVI_0.String_0.DC_STRING_ENERGY_ALL';                        
const sID_String1_DC_Wh = 'e3dc-rscp.0.PVI.PVI_0.String_1.DC_STRING_ENERGY_ALL';                        


//++++++++++++++++++++++++++++++++++++++ ENDE USER ANPASSUNGEN +++++++++++++++++++++++++++++++++
ScriptStart();

const sID_Json1 = instanz + PfadEbene1 +PfadEbene2[2]+'JsonTableMonat';
const sID_Json2 = instanz + PfadEbene1 +PfadEbene2[2]+'JsonTableTag';
const sID_NetzbezugAltMonat = instanz + PfadEbene1 +PfadEbene2[0]+'NetzbezugAltMonat';
const sID_NetzeinspeisungAltMonat = instanz + PfadEbene1 +PfadEbene2[0]+'NetzeinspeisungAltMonat';
const sID_SolarproduktionAltMonat = instanz + PfadEbene1 +PfadEbene2[0]+'SolarproduktionAltMonat';
const sID_NetzbezugAltTag = instanz + PfadEbene1 +PfadEbene2[0]+'NetzbezugAltTag';
const sID_PV_Zaehler_DC_kWh_AltTag = instanz + PfadEbene1 +PfadEbene2[0]+'PV_Zaehler_DC_AltTag';
const sID_NetzeinspeisungAltTag = instanz + PfadEbene1 +PfadEbene2[0]+'NetzeinspeisungAltTag';
const sID_PV_Zaehler_AC_kWh_AltTag = instanz + PfadEbene1 +PfadEbene2[0]+'SolarproduktionAltTag';
const sID_Mehrwertsteuersatz = instanz + PfadEbene1 +PfadEbene2[1]+'Mehrwertsteuersatz';
const sID_Nettostrompreis = instanz + PfadEbene1 +PfadEbene2[1]+'Nettostrompreis';
const sID_NettoGrundpreis = instanz + PfadEbene1 +PfadEbene2[1]+'NettoGrundpreis';
const sID_StrompreisMonat = instanz + PfadEbene1 +PfadEbene2[1]+'StrompreisMonat';
const sID_AbleseZeitraum = instanz + PfadEbene1 +PfadEbene2[0]+'AbleseZeitraum';
const sID_NetzbezugAktuel = instanz + PfadEbene1 +PfadEbene2[0]+'NetzbezugAktuel';
const sID_Netzeinspeisung_proz = instanz + PfadEbene1 +PfadEbene2[0]+'Netzeinspeisung_Jahr_Prozent';
const sID_LW_Pumpe_NetzbezugAltTag = instanz + PfadEbene1 +PfadEbene2[0]+ 'LW_Pumpe_NetzbezugAltTag';              
const sID_LW_Pumpe_NetzbezugAltMonat = instanz + PfadEbene1 +PfadEbene2[0]+ 'LW_Pumpe_NetzbezugAltMonat'; 


// Wird nur beim Start vom Script aufgerufen
async function ScriptStart()
{
    log(`-==== Script Zählerstände Version 1.0.10 ====-`);
    await CreateState();
    log(`-==== alle Objekt ID\'s angelegt ====- `);
}


// Alle nötigen Objekt ID's anlegen 
async function CreateState(){
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'NetzbezugAltMonat',    0, {name: 'lezter Zählerstand Monatsbeginn', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'PV_Zaehler_DC_AltTag',    0, {name: 'lezter Zählerstand DC Tagesbeginn', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'NetzeinspeisungAltMonat',    0, {name: 'lezter Zählerstand Monatsbeginn', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'SolarproduktionAltMonat',    0, {name: 'lezter Zählerstand Monatsbeginn', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'NetzbezugAltTag',    0, {name: 'lezter Zählerstand Tagesbeginn', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'LW_Pumpe_NetzbezugAltTag',    0, {name: 'lezter Zählerstand Wärmepumpe Tagesbeginn', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'LW_Pumpe_NetzbezugAltMonat',    0, {name: 'lezter Zählerstand Wärmepumpe Monatsbeginn', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'NetzeinspeisungAltTag',    0, {name: 'lezter Zählerstand Tagesbeginn', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'SolarproduktionAltTag',    0, {name: 'lezter Zählerstand Tagesbeginn', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[1]+'Mehrwertsteuersatz',    16, {name: 'aktueller Mehrwertsteuersatz', type: 'number', unit: '%' });
    createState(instanz + PfadEbene1 +PfadEbene2[1]+'Nettostrompreis',    0.2638, {name: 'Strompreis netto pro kwh', type: 'number', unit: '€' });
    createState(instanz + PfadEbene1 +PfadEbene2[1]+'NettoGrundpreis',    8.5, {name: 'Grundpreis netto pro Monat', type: 'number', unit: '€' });
    createState(instanz + PfadEbene1 +PfadEbene2[1]+'StrompreisMonat',    0.2638, {name: 'Strompreis pro kwh', type: 'number', unit: '€' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'AbleseZeitraum',    0, {name: 'lezter abgerechneter Zählerstand ', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'NetzbezugAktuel',    0, {name: 'Aktueller Stromverbrauch im Ablesezeitraum  ', type: 'number', unit: 'kWh' });
    createState(instanz + PfadEbene1 +PfadEbene2[2]+'JsonTableMonat', JSON.stringify([]), {name: 'Tabelle Zaehlerstaende Monat',type: 'string'});
    createState(instanz + PfadEbene1 +PfadEbene2[2]+'JsonTableTag', JSON.stringify([]), {name: 'Tabelle Zaehlerstaende Tag',type: 'string'});
    createState(instanz + PfadEbene1 +PfadEbene2[0]+'Netzeinspeisung_Jahr_Prozent',    0, {name: 'Aktuelle Einspeiseleistung im Jahr in %  ', type: 'number', unit: '%' });
}


// Zählerstände Monatlich um 00:01 speichern
schedule("0 0 1 * *", async function() { 
    if (LogAusgabe)log('Schedule für Monatliche Berechnung aktiv');      
    let nBezugZaehlerAktuell = Math.floor((await getStateAsync(sID_BezugZaehlerHomematic)).val);
    let nEinspeiseZaehlerAktuell = Math.floor((await getStateAsync(sID_EinspeiseZaehlerHomematic)).val);
    let PvZaehlerAktuell=Math.floor((await getStateAsync(sID_PV_Zaehler_AC_kWh_Akt)).val);
    let MWST = (await getStateAsync(sID_Mehrwertsteuersatz)).val;
    let NettoStrompreis = (await getStateAsync(sID_Nettostrompreis)).val;
    let NettoGrundpreis = (await getStateAsync(sID_NettoGrundpreis)).val;
    let nBezugZaehlerAlt = (await getStateAsync(sID_NetzbezugAltMonat)).val;
    let nEinspeiseZaehlerAlt = (await getStateAsync(sID_NetzeinspeisungAltMonat)).val;
    let PvZaehlerAlt= (await getStateAsync(sID_SolarproduktionAltMonat)).val;
    let nBezugZaehlerNeu = nBezugZaehlerAktuell - nBezugZaehlerAlt;
    let nEinspeiseZaehlerNeu = nEinspeiseZaehlerAktuell - nEinspeiseZaehlerAlt;
    let nProduktEinspeiseVerguetung = round(nEinspeiseZaehlerNeu * nEinspeiseVerguetung,2);
    let PvZaehlerNeu = PvZaehlerAktuell - PvZaehlerAlt;
    let EigenverbrauchNeu = PvZaehlerNeu - nEinspeiseZaehlerNeu;
    let AutarkieNeu = Math.round(EigenverbrauchNeu / ((nBezugZaehlerNeu+EigenverbrauchNeu)/100));
    let StromPreis = round(((NettoGrundpreis/nBezugZaehlerNeu)+NettoStrompreis)*(MWST/100+1),3);
    
    
    // Verbrauch LW-Pumpe berechnen
    let nLW_Pumpe_kWh_Akt = (await getStateAsync(sID_LW_Pumpe_Verbrauch_LM0)).val;
    let nLW_Pumpe_kWh_AltMonat = (await getStateAsync(sID_LW_Pumpe_NetzbezugAltMonat)).val;
    let nLW_Pumpe_kWh_Monat = nLW_Pumpe_kWh_Akt-nLW_Pumpe_kWh_AltMonat
    
    // Datum vom Vortag berechnen
    let jetzt = new Date();
    let Theute = jetzt.getDate();
    let Tgestern = new Date();
    Tgestern.setDate(Theute-1);
    let DatumAkt=((Tgestern.getDate())+'.'+ (Tgestern.getMonth()+1) +'.'+ Tgestern.getFullYear());
    //var MonatAkt=(Tgestern.getMonth()+1);
    await setStateAsync(sID_NetzeinspeisungAltMonat,nEinspeiseZaehlerAktuell);
    await setStateAsync(sID_NetzbezugAltMonat,nBezugZaehlerAktuell);
    await setStateAsync(sID_SolarproduktionAltMonat,PvZaehlerAktuell);
    await setStateAsync(sID_StrompreisMonat,StromPreis);
    await setStateAsync(sID_LW_Pumpe_NetzbezugAltMonat,nLW_Pumpe_kWh_Akt);
    if(LogAusgabe)setTimeout(function(){log('Json aktualisiert ' + JSON.stringify(arr))},200);

    // für Json aufbereiten
    let obj = {};

    // 12 Spalten
    obj.Datum = DatumAkt;
    obj.Einspeisung = nEinspeiseZaehlerNeu + ' kWh';
    obj.Einspeiseverguetung = nProduktEinspeiseVerguetung + ' €';
    obj.Netzbezug = nBezugZaehlerNeu + ' kWh';
    obj.Solarproduktion = PvZaehlerNeu + ' kWh';
    obj.Eigenverbrauch = EigenverbrauchNeu + ' kWh';
    obj.Autarkie = AutarkieNeu + ' %';
    obj.LwPumpe = Math.round(nLW_Pumpe_kWh_Monat) + ' kWh'
    obj.Netzeinspeisezaehler = nEinspeiseZaehlerAktuell + ' kWh';
    obj.Netzbezugszaehler = nBezugZaehlerAktuell + ' kWh';
    obj.PVzaehler = PvZaehlerAktuell + ' kWh';
    obj.Strompreis = StromPreis + ' €/kWh';
    let arr = [];
    if(existsState(sID_Json1)) arr = JSON.parse((await getStateAsync(sID_Json1)).val);
    arr.unshift(obj);
    //if(arr.length > 12) arr.shift();
    if(existsState(sID_Json1)) await setStateAsync(sID_Json1, JSON.stringify(arr), true);
    
});

// Zählerstände Täglich um 00:05 speichern
schedule("5 0 * * *", async function() {
    if (LogAusgabe)log('Schedule für Tägliche Berechnung aktiv');      
       
    // Datum vom Vortag berechnen
    let jetzt = new Date();
    let Theute = jetzt.getDate();
    let Tgestern = new Date();
    Tgestern.setDate(Theute-1);
    let DatumGestern=((Tgestern.getDate())+'.'+ (Tgestern.getMonth()+1) +'.'+ Tgestern.getFullYear());
    
    // Bezug Leistung aus Stromnetz berechnen
    let nBezugZaehlerAktuell = (await getStateAsync(sID_BezugZaehlerHomematic)).val;
    let nBezugZaehlerAlt = (await getStateAsync(sID_NetzbezugAltTag)).val;
    let nBezugZaehlerNeu = nBezugZaehlerAktuell - nBezugZaehlerAlt;
    
    // Einspeise leistung berechnen
    let nEinspeiseZaehlerAktuell = (await getStateAsync(sID_EinspeiseZaehlerHomematic)).val;
    let nEinspeiseZaehlerAlt = (await getStateAsync(sID_NetzeinspeisungAltTag)).val;
    let nEinspeiseZaehlerNeu = nEinspeiseZaehlerAktuell - nEinspeiseZaehlerAlt;
       
    // PV Leistung AC berechnen
    let nPV_Zaehler_AC_kWh_Akt = (await getStateAsync(sID_PV_Zaehler_AC_kWh_Akt)).val;
    let nPV_Zaehler_AC_kWh_AltTag = (await getStateAsync(sID_PV_Zaehler_AC_kWh_AltTag)).val;
    let nPV_Leistung_AC_kWh_Tag = nPV_Zaehler_AC_kWh_Akt - nPV_Zaehler_AC_kWh_AltTag;


    // Verbrauch LW-Pumpe berechnen
    let nLW_Pumpe_kWh_Akt = (await getStateAsync(sID_LW_Pumpe_Verbrauch_LM0)).val;
    let nLW_Pumpe_kWh_AltTag = (await getStateAsync(sID_LW_Pumpe_NetzbezugAltTag)).val;
    let nLW_Pumpe_kWh_Tag = nLW_Pumpe_kWh_Akt-nLW_Pumpe_kWh_AltTag


    // PV Leistung DC berechnen
    let nString0_DC_Wh_Aktuell = (await getStateAsync(sID_String0_DC_Wh)).val;
    let nString1_DC_Wh_Aktuell = (await getStateAsync(sID_String1_DC_Wh)).val;
    let nPV_Zaehler_DC_kWh_AltTag = (await getStateAsync(sID_PV_Zaehler_DC_kWh_AltTag)).val
    let nPV_Zaehler_DC_kWh_Akt = (nString0_DC_Wh_Aktuell+nString1_DC_Wh_Aktuell)/1000;
    let nPV_Leistung_DC_kWh_Tag = nPV_Zaehler_DC_kWh_Akt-nPV_Zaehler_DC_kWh_AltTag;
    
    let EigenverbrauchNeu = nPV_Leistung_AC_kWh_Tag - nEinspeiseZaehlerNeu + nBezugZaehlerNeu;
    let AutarkieNeu = (EigenverbrauchNeu-nBezugZaehlerNeu) / (EigenverbrauchNeu/100);
    
    //var MonatAkt=(Tgestern.getMonth()+1);
    await setStateAsync(sID_NetzeinspeisungAltTag,nEinspeiseZaehlerAktuell);
    await setStateAsync(sID_NetzbezugAltTag,nBezugZaehlerAktuell);
    await setStateAsync(sID_PV_Zaehler_AC_kWh_AltTag,nPV_Zaehler_AC_kWh_Akt);
    await setStateAsync(sID_PV_Zaehler_DC_kWh_AltTag,nPV_Zaehler_DC_kWh_Akt);
    await setStateAsync(sID_LW_Pumpe_NetzbezugAltTag,nLW_Pumpe_kWh_Akt)
    //if(LogAusgabe)setTimeout(function(){log('Json Tag aktualisiert ' + JSON.stringify(arr))},200);

    // für Json aufbereiten
    let obj = {};

    // 12 Spalten
    obj.Datum = DatumGestern;
    obj.Einspeisung = Math.round(nEinspeiseZaehlerNeu) + ' kWh';
    obj.Netzbezug = Math.round(nBezugZaehlerNeu) + ' kWh';
    obj.Solarproduktion_AC = round(nPV_Leistung_AC_kWh_Tag,2) + ' kWh';
    obj.Solarproduktion_DC = round(nPV_Leistung_DC_kWh_Tag,2) + ' kWh';
    obj.Eigenverbrauch = Math.round(EigenverbrauchNeu) + ' kWh';
    obj.Autarkie = Math.round(AutarkieNeu) + ' %';
    obj.LwPumpeTag = Math.round(nLW_Pumpe_kWh_Tag) + ' kWh';
    obj.Netzeinspeisezaehler = Math.floor(nEinspeiseZaehlerAktuell) + ' kWh';
    obj.Netzbezugszaehler = Math.floor(nBezugZaehlerAktuell) + ' kWh';
    obj.PvZaehlerAC = Math.round(nPV_Zaehler_AC_kWh_Akt) + ' kWh';
    obj.PvZaehlerDC = Math.round(nPV_Zaehler_DC_kWh_Akt) + ' kWh';
        
    let arr = [];
    if(existsState(sID_Json2)) arr = JSON.parse((await getStateAsync(sID_Json2)).val);
    arr.unshift(obj);
    //if(arr.length > 12) arr.shift();
    if(existsState(sID_Json2)) await setStateAsync(sID_Json2, JSON.stringify(arr), true);
    
});


// JSON String einlesen und PV Einspeiseleistung Jahr % berechnen 
async function AnzeigeEinspeiseleistung_Prozent () {
    let ZaehlerDatenMonat = JSON.parse((await getStateAsync(sID_Json1)).val);
    let date = new Date();
	let Jahr = date.getFullYear()-1
    let Netzeinspeisezaehler_alt= 0, PVzaehler_alt= 0;
    let PVzaehler_akt = Math.round((await getStateAsync(sID_PV_Zaehler_AC_kWh_Akt)).val);
    let Netzeinspeisezaehler_akt = Math.round((await getStateAsync(sID_EinspeiseZaehlerHomematic)).val);
    for (var i in ZaehlerDatenMonat) {
        let Datum_i = ZaehlerDatenMonat[i].Datum;
        if (Datum_i == '31.12.'+Jahr){
            Netzeinspeisezaehler_alt = parseInt(ZaehlerDatenMonat[i].Netzeinspeisezaehler);
            PVzaehler_alt = parseInt(ZaehlerDatenMonat[i].PVzaehler);
        }
    }
    let PV_Leistung_Jahr = PVzaehler_akt - PVzaehler_alt
    let Einspeiseleistung_Jahr = Netzeinspeisezaehler_akt- Netzeinspeisezaehler_alt
    let Einspeiseleistung_Jahr_proz = round(Einspeiseleistung_Jahr/(PV_Leistung_Jahr/100),0)
    return Einspeiseleistung_Jahr_proz;
} 

// Runden. Parameter float wert, int dez Anzahl der Stellen
function round(wert, dez) {
    let umrechnungsfaktor = Math.pow(10,dez);
    return Math.round(wert * umrechnungsfaktor) / umrechnungsfaktor;
} 

// Bei Änderung Bezugszähler soll der Verbrauch im Ablesezeitraum aktualisiert werden.
on({id: sID_BezugZaehlerHomematic, change: "ne"}, async function (obj){	
    let ZaehlerstandAkt = Math.floor((await getStateAsync(obj.id)).val);
    let ZaehlerstandAlt = (await getStateAsync(sID_AbleseZeitraum)).val;
    let ZaehlerstandNeu = ZaehlerstandAkt - ZaehlerstandAlt
    await setStateAsync(sID_NetzbezugAktuel,ZaehlerstandNeu);
});

// Bei Änderung Einspeisezaehler soll die Einspeiseleistung in % aktualisiert werden.
on({id: sID_EinspeiseZaehlerHomematic, change: "ne"}, async function (obj){	
    await setStateAsync(sID_Netzeinspeisung_proz,AnzeigeEinspeiseleistung_Prozent());
});
