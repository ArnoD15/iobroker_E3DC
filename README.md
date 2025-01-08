# iobroker-E3DC

<h3>Charge-Control</h3>
ioBroker Script zum steuern der Laderegelung von einem E3DC Hauskraftwerk mit Wetterprognose
<br>
Mit dem Programm Charge-Control soll erreicht werden, dass die Batterie möglichst schonend geladen wird, um die Lebensdauer zu erhöhen und ein abregeln 
beim Überschreiten der 70% Einspeisegrenze zu verhindern.<br>
<ul>
<li>Speicher soll nie längere Zeit auf 100 % geladen werden oder auf 0 % entladen werden.</li><br>
<li>Möglichst gleichmäßige Ladeleistung beim Laden.</li><br>
<li>PV-Überschuss soll gespeichert werden, um nicht in die 70 % Abriegelung zu kommen.</li><br>
<li>Bei Überschreitung WR Begrenzung soll Überschuss in die Batterie gespeichert werden.</li><br>
</ul>
<p>Weitere Informationen in der "Anleitung Charge-Control.pdf" oder im iobroker Forum: https://forum.iobroker.net/topic/32976/e3dc-hauskraftwerk-steuern</p>


[![paypal](https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate?hosted_button_id=JWM2WUT7ZACVL&source=url) 

<br>
<h3>E3DC_Wallbox</h3>
Script zum Steuern der Wallbox easy connect mit Mode 3-Ladekabel (3-phasig) fest angeschlagen mit Ladestecker Typ 2 von E3DC. Die Wallbox muss über Modbus
verbunden sein.



<h3>iobroker_VIS_View_E3DC_Charge_Control.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Control.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Control.png" alt="VIS View E3DC-Control" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Uebersicht.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Uebersicht_2.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Uebersicht_2.png" alt="VIS View E3DC Uebersicht" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_Diagramm_Prognosen.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/Diagramm_Prognosen2.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/Diagramm_Prognosen2.png" alt="VIS View Diagramm_Prognosen" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Wallbox.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Wallbox_2.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Wallbox_2.png" alt="VIS View E3DC Wallbox" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_RSCP_Batterie.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/VIS_View_E3DC_RSCP_Batterie.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/VIS_View_E3DC_RSCP_Batterie.png" alt="VIS View E3DC RSCP Batterie" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_RSCP_EMS.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/VIS_View_E3DC_RSCP_EMS.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/VIS_View_E3DC_RSCP_EMS.png" alt="VIS View E3DC RSCP EMS" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_RSCP_Sperrzeiten.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/VIS_View_E3DC_RSCP_Sperrzeiten.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/VIS_View_E3DC_RSCP_Sperrzeiten.png" alt="VIS View E3DC RSCP Sperrzeiten" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_RSCP_Wechselrichter.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/VIS_View_E3DC_RSCP_Wechselrichter.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/VIS_View_E3DC_RSCP_Wechselrichter.png" alt="VIS View E3DC RSCP Wechselrichter" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_Tibber.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/VIS_View_Tibber.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/VIS_View_Tibber.png" alt="VIS View Tibber" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_WR_Diagramm.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_WR_Diagramm.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_WR_Diagramm.png" alt="VIS View E3DC WR Diagramm" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Zell_Temp_Diagramm.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/VIS_View_E3DC_Zell_Temp_Diagramm.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/VIS_View_E3DC_Zell_Temp_Diagramm.png" alt="VIS View E3DC Zell Temp Diagramm" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_SOH_Diagramm.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/VIS_View_E3DC_SOH_Diagramm.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/VIS_View_E3DC_SOH_Diagramm.png" alt="VIS View E3DC SOH Diagramm" style="max-width:100%;"></a></p>


<br><br>
<a name="log"></a>

<h3>Changelog Charge-Control</h3>

### Version: 1.5.14
* Zusätzliche Absicherung Tibber Skript, das ein Netzbezug über 3 x 32A (22000W) nicht möglich ist.
* Fehler korrigiert, dass die Leistung einer externen Wallbox zum Hausverbrauch addiert wurde, obwohl diese bereits im Hausverbrauch enthalten ist.

### Version: 1.5.13
* Fehler korrigiert, dass bei Batterie SoC = 0 und Einstellung Notstromreserve =0 die Regelung versucht hat, das Entladen zu verhindern und deswegen ständig auf die E3DC RSCP Schnittstelle zugegriffen wurde.

### Version: 1.5.12
* Fehler korrigiert, dass die Leistungswerte Wallbox, wenn diese nicht über E3DC gesteuert wird, bei der Berechnung nicht berücksichtigt wurden.

### Version: 1.5.11
* Fehler behoben, dass die Autonomiezeit nicht auf 0:00 h gesetzt wurde, obwohl der Batterie SOC 0 % hatte.

### Version: 1.5.10
* Fehler behoben, dass bei einer ungünstigen Konstellation beim Neustart vom Script die PV-Leistungswerte vom aktuellen Monat gelöscht wurden.

### Version: 1.5.9
* Fehler Objekt ID 0_userdata.0.Charge_Control.Allgemein.NotstromAusNetz korrigiert. Danke an psrelax für die Fehlersuche.

### Version: 1.5.8
* Es werden die wichtigsten e3dc-rscp Adaptereinstellungen geprüft und wenn diese abweichen wird im LOG eine Warnung ausgegeben.

### Version: 1.5.7
* Fehler behoben, dass beim Speichern der History Daten die UTC-Zeit verwendet wurde, was beim Monatswechsel zu einer verzögerten Aktualisierung des Diagramms geführt hat.

### Version: 1.5.6
* Wenn SET_POWER_MODE = null ist, wird jetzt 0 eingetragen und nicht mehr mit einem Fehler beendet.
* Fehler bei der Erstellung Diagramm PrognoseAuto_kWh korrigiert.
* Script aufgeräumt und optimiert 

### Version: 1.5.5
* Diagramm PV Prognosen und PV-Leistung wurde nicht mehr angezeit wenn der Tag vom Datum einstellig war.

### Version: 1.5.4
* Fehler behoben, dass bei aktiver Entladesperre TibberSkript auch nicht mehr geladen wurde.

### Version: 1.5.3
* Kleinere Optimierungen und Fehler behoben für das Tibber Skript
* Neues Objekt `0_userdata.0.Charge_Control.Allgemein.EigenverbrauchDurchschnitt` erstellt, für die Anzeige vom Durchschnittsverbrauch Tag / Nacht in VIS.
* Fehler behoben, dass die Berechnung Notstromreserve <0 sein konnte. (Danke an @MaLei für den Hinweis)

### Version: 1.5.2
* Fehler behoben, dass eingestellter Notstrom SOC ignoriert wurde. (Danke an @psrelax für den Hinweis)

### Version: 1.5.1
* Fehler behoben, dass neue Objekte ohne Definition angelegt wurden.
* Fehler behoben, dass bei der Autonomiezeit die Minuten ohne führende Null eingetragen wurden.

### Version: 1.5.0
* Es wird überprüft ob bei den Instanzeinstellungen des e3dc-rscp Adapter __SET_POWER __Wiederholintervall__ auf 0 eingestellt ist.
* Fehler behoben, dass bei Leerlauf Script ChargeControl __SET_POWER_MODE__ nicht auf 0 gesetzt wurde.
* Fehler im DebugLog behoben wo zweimal die gleichen Werte __sID_PvLeistung_ADD_W__ addiert wurden. (Danke an @psrelax für den Hinweis)
* Kleinere Optimierungen und Fehler behoben für das Script my-pv Heizstab
* Schnittstelle für das Skript Tibber integriert
* Berechnung des durchschnittlichen Hausverbrauchs neu erstellt. Es wird jetzt der Durchschnitt für jeden Tag, getrennt in Verbrauch Tag und Nacht berechnet.<br>Die Anzeige Autonomiezeit in VIS wurde dadurch auch angepasst. Es wird jetzt die Reichweite der Batterie mit dem neuen Durchschnittsverbrauch berechnet und mit dem aktuellen Verbrauch bei Entladung der Batterie.
* Alle Objekt ID`s __IstPvLeistung_kWh_1__ bis __31__ werden nicht mehr benötigt. Daten werden unter der neuen Objekt ID __0_userdata.0.Charge_Control.History.istPV_LeistungTag_kWh__ gespeichert.
* Alle Objekt ID`s __PrognoseProp_kWh_1__ bis __31__ werden nicht mehr benötigt. Daten werden unter der neuen Objekt ID __0_userdata.0.Charge_Control.History.PrognoseProp_kWh__ gespeichert.
* Alle Objekt ID`s __PrognoseAuto_kWh_1__ bis __31__ werden nicht mehr benötigt. Daten werden unter der neuen Objekt ID __0_userdata.0.Charge_Control.History.PrognoseAuto_kWh__ gespeichert.
* Alle Objekt ID`s __PrognoseSolcast90_kWh_1__ bis __31__ werden nicht mehr benötigt. Daten werden unter der neuen Objekt ID __0_userdata.0.Charge_Control.History.PrognoseSolcast90_kWh__ gespeichert.
* Alle Objekt ID`s __PrognoseSolcast_kWh_1__ bis __31__ werden nicht mehr benötigt. Daten werden unter der neuen Objekt ID __0_userdata.0.Charge_Control.History.PrognoseSolcast_kWh__ gespeichert.

### Version: 1.4.1
* XMLHttpRequest ausgetauscht durch axios
* Neue Konstante im Script im Bereich USER ANPASSUNGEN um die Leistung Hausverbrauch zu berechnen ohne LW-Pumpe, Heizstab oder Wallbox<br>
__sID_LeistungHeizstab_W__ hier kann der Pfad zu den Leistungswerten Heizstab eingetragen werden, ansonsten leer lassen<br>
__sID_WallboxLadeLeistung_1_W__ hier kann der Pfad zu den Leistungswerten der Wallbox eingetragen werden, ansonsten leer lassen<br>
__sID_LeistungLW_Pumpe_W__ hier kann der Pfad zu den Leistungswerten der LW-Pumpe eingetragen werden, ansonsten leer lassen<br>
Das Ergebnis wird unter der neuen Objekt ID __0_userdata.0.Charge_Control.Allgemein.Hausverbrauch__ eingetragen. - [Issue #3](https://github.com/ArnoD15/iobroker_E3DC/issues/3)
* Objekt ID __0_userdata.0.Charge_Control.Allgemein.Akt_Berechnete_Ladeleistung_W__ enthält nun den vom Script Charge-Control eingestellte Ladeleistung und nicht mehr 
die berechnete Ladeleistung um die Batterie auf 100% zu laden.

### Version: 1.4.0
* Wenn die Notstromreserve bis zum Sonnenaufgang reicht, wird das Entladen der Batterie freigegeben und nicht mehr gestoppt, bis die Batterie leer ist.<br>
Die ständige Neuberechnung des Batterie SOC führte zu ständigem Ein- und Ausschalten der Entladeleistung.
* Neue Objekt ID "0_userdata.0.Charge_Control.USER_ANPASSUNGEN.10_ScriptHausverbrauch". Wenn das Script "Hausverbrauch" zusammen mit dem Script "my-pv Heizstab" für den Heizstab von ORuessel verwendet wird, dann
bitte auf true setzen.
* Neue Objekt ID "0_userdata.0.Charge_Control.USER_ANPASSUNGEN.10_ScriptTibber". Vorbereitung für Tibber, aktuell noch nicht umgesetzt.
* Geänderte Objekt ID "0_userdata.0.Charge_Control.USER_ANPASSUNGEN.10_DebugAusgabeDetail". Die LOG-Ausgabe zur Fehlersuche wurde geändert, um mir die Hilfe aus der Ferne zu erleichtern.
Es gibt jetzt zwei LOG-Stufen DebugAusgabe, um den Programmdurchlauf zu logen und DebugAusgabeDetail, um auch die Werte und Einstellungen im Logfile auszugeben.
Die Objekt ID 10_LogAusgabeRegelung entfällt somit.
* Script aufgeräumt und optimiert

<h3>Version: 1.3.1</h3>
<li>Parameter in VIS können jetzt auch einzeln unter "Einstellung Manuell" geändert werden. </li>
<li>Regelung Charge-Control wird gestoppt wenn manuelles Laden der Batterie beim E3DC aktiviert wird</li>

<h3>Version: 1.3.0</h3>
<li>Script musste an die neue Version vom Adapter e3dc-rscp 1.2.5 angepasst werden. Bitte zuerst den Adapter e3dc-rscp 1.2.5 installieren und nur dann diese Scriptversion verwenden.</li>

<h3>Version: 1.2.15</h3>
<li>Kleinere Optimierungen und Fehler behoben bei der Berechnung der Sollladeleistung.</li>

<h3>Version: 1.2.14</h3>
<li>Fehler behoben, das die neue Objekt-ID "0_userdata.0.Charge_Control.Allgemein.Akt_Berechnete_Ladeleistung_W" nach Ladeende nicht auf 0 gesetzt wurde. Soll Ladeleistung wird jetzt auch berechnet, wenn "Automatik Laderegelung" ausgeschaltet wird. </li>

<h3>Version: 1.2.13</h3>
<li>Neue Objekt-ID "0_userdata.0.Charge_Control.Allgemein.Akt_Berechnete_Ladeleistung_W" erstellt, um die berechnete Ladeleistung bis Regelende bzw. Ladeende in VIS anzuzeigen.</li>

<h3>Version: 1.2.12</h3>
<li>kleinere Fehler behoben und Script aufgeräumt.</li>

<h3>Version: 1.2.11</h3>
<li>Fehler behoben, dass nicht mehr auf entladen umgeschaltet wurde, nachdem das Laden der Batterie gesperrt war.</li>

<h3>Version: 1.2.10</h3>
<li>E3DC-RSCP Adapater kann ab Version 1.2.0 die Info Tags anzeigen und somit auch die Firmware Version.
<br> Das wurde im Script integriert und zwei neue Objekte angelegt:
<br>"0_userdata.0.Charge_Control.Allgemein.FirmwareDate" und
<br>"0_userdata.0.Charge_Control.Allgemein.LastFirmwareVersion"
<br>um in VIS das Datum und die Uhrzeit der Firmware Installation anzeigen zu können und sich die alte Version zu merken und auch diese anzeigen zu können</li>
<li>Fehler behoben, dass e3dc-rscp.0.EMS.POWER_LIMITS_USED nicht automatisch aktiviert wurde.</li>
<li>Fehler behoben, dass beim Erreichen von Ladeschwelle, Ladeende und Ladeende2 es zum "Pulsen" der Ladeleistung führen kann.</li>

<h3>Version: 1.2.9</h3>
<li>Neuer User Parameter 10_Systemwirkungsgrad.<br> Max. Systemwirkungsgrad inkl. Batterie in % aus den technischen Daten E3DC (beim S10E 88%).<br> Wird für die 
Berechnung der Batteriekapazität in kWh zur Anzeige in VIS verwendet.<br>Neue Objekt ID: 0_userdata.0.Charge_Control.Allgemein.Batteriekapazität_kWh  </li>
<li>Berechnung Autonomiezeit für Anzeige in VIS integriert.<br>Neue Objekt ID: 0_userdata.0.Charge_Control.Allgemein.Autonomiezeit</li>
<li>Fehler behoben, dass der unterer Ladekorridor ignoriert wurde.</li>

<h3>Version: 1.2.8</h3>
<li>Fehler behoben, dass die Batterie entladen wurde, auch wenn Notstromreserve erreicht wurde.  </li>
<li>Ab dieser Version wird nur noch der e3dc-rscp Adapter benötigt, eine Anbindung über Modbus ist nicht mehr erforderlich.
<br>Bitte prüfen, ob beim e3dc-rscp Adapter das Abfrageintervall für kurz[s] auf 2 steht und die folgenden Tag auf S eingestellt sind:<br>
TAG_EMS_REQ_POWER_PV,<br>TAG_EMS_REQ_POWER_BAT,<br>TAG_EMS_REQ_POWER_HOME,<br>TAG_EMS_REQ_POWER_GRID,<br>TAG_EMS_REQ_POWER_ADD,<br>TAG_EMS_REQ_BAT_SOC,<br>TAG_WB_REQ_ENERGY_ALL </li>

<h3>Version: 1.2.7</h3>
<li>Fehler behoben, dass die Batterie nicht mehr entladen wurde nach Regelende vor Ladeende.  </li>

<h3>Version: 1.2.6</h3>
<li>Fehler behoben, dass die Batterie nicht mehr entladen wurde bei Umschaltung vor Regelbeginn 0:01 Uhr.  </li>
<li>Ladeleistung Wallbox wird beim Eigenverbrauch mit berücksichtig, wenn diese über Modbus direkt mit dem Hauskraftwerk verbunden ist.  </li>
<li>Fehler behoben, dass bei manueller Anwahl der Einstellungen 1-5 die Regelzeiten nicht aktualisiert wurden   </li>

<h3>Version: 1.2.5</h3>
<li>Für die Berechnung der Batteriekapazität werden die Objekt ID "e3dc-rscp.0.BAT.BAT_0.SPECIFIED_CAPACITY" und "e3dc-rscp.0.BAT.BAT_1.SPECIFIED_CAPACITY" verwendet.
E3DC zeigt bei neueren Hauskraftwerken über die RSCP Schnittstelle falsche Werte bei der Objekt ID "e3dc-rscp.0.EMS.SYS_SPECS.installedBatteryCapacity" an.</li>

<h3>Version: 1.2.4</h3>
<li>Fehler behoben, dass die Batterie nicht mehr entladen wurde, wenn PV-Leistung zu gering war, um Hausverbrauch abzudecken.  </li>
<li>Für Bewoelkungsgrad_12 und Bewoelkungsgrad_15 wird "NaN" eingetragen, wenn keine Werte abgerufen werden können. </li>

<h3>Version: 1.2.3</h3>
<li>Fehler behoben, dass die Batterie auch nach Erreichen vom soll SOC weiter aufgeladen wurde. </li>

<h3>Version: 1.2.2</h3>
<li>Neue Objekt ID NotstromAusNetz, um die Funktion Notstrom SOC aus dem Netz nachladen in VIS ein und ausschalten zu können</li>

<h3>Version: 1.2.1</h3>
<li>Wechselrichterverluste beim Notstrom SOC werden jetzt aus dem Netz geladen, um den Notstrom SOC stabil zu halten</li>

<h3>Version: 1.2.0</h3>
<li>Bei dieser Version habe ich die Einstellung der Regelzeiten umgestellt auf die Astrofunktion von JS.<br>
    Es sind auch Änderungen in der View erforderlich und einige Parameter werden nicht mehr benötigt.
    Folgende Objekt ID's können gelöscht werden:<br>	
    0_userdata.0.Charge_Control.Allgemein.Winterminimum_MEZ
    0_userdata.0.Charge_Control.Allgemein.Sommermaximum_MEZ
    0_userdata.0.Charge_Control.Allgemein.Sommerladeende_MEZ
    0_userdata.0.Charge_Control.Allgemein.Anwahl_MEZ_MESZ
    0_userdata.0.Charge_Control.Parameter.Winterminimum_0 bis 5
    0_userdata.0.Charge_Control.Parameter.Sommermaximum_0 bis 5
    0_userdata.0.Charge_Control.Parameter.Sommerladeende_0 bis 5<br>	
Die View für die neue Version 1.2.0 findet ihr auf Github und die Anleitung Charge-Control wurde auch angepasst dort sind die neuen Einstellungen beschrieben.
<br>Die Regelzeiten werden jetzt über drei Offset Werte eingestellt.</li>

<h3>Version: 1.1.7</h3>
<li>Fehler in behoben, dass auf Unload SoC entladen wurde, obwohl noch keine PV-Leistung vorhanden war.</li>

<h3>Version: 1.1.6</h3>
<li>Bei der Abfragezeit der Daten von Solcast, werden die Minuten zufällig berechnet. Solcast Daten werden jetzt zwischen 4:01 Uhr und 4:59 Uhr abgerufen</li>
<li>Fehler in Funktion CheckPrognose() behoben. Die Variable Notstrom_SOC_Proz wurde hier auf Einstellwert zurückgesetzt </li>

<h3>Version: 1.1.5</h3>
<li>Entladen wird bei erreichen der Notstromreserve gestoppt und erst bei +1% Batterie SOC über Notstromreserve SOC wieder freigeben</li>
<li>Neue Objekt ID 0_userdata.0.Charge_Control.Allgemein.Automatik_Regelung um die Regelung vom Script in VIS ausschalten zu können. Achtung ! Es wird dann auch keine Notstromreserve mehr 
berücksichtigt und man muss diese wenn gewünscht wieder direkt beim E3DC einstellen.  </li>
<li>Fehler behoben das die untere Ladeschwelle nicht mehr berücksichtigt wurde</li>

<h3>Version: 1.1.4</h3>
<li>Fehler behoben, dass mit Start PV-Leistung die Batterie entladen wurde, ohne dass die Notstromreserve freigegeben war.</li>

<h3>Version: 1.1.3</h3>
<li>Fehler behoben, dass der Parameter 10_Offset_sunriseEnd nicht bei allen Abfragen im Skript verwendet wurde.</li>
<li>Einige Fehler in der Zeitberechnung der Funktion CheckPrognose behoben. Bitte die Versionen 1.1.0 bis 1.1.2 nicht mehr verwenden</li>

<h3>Version: 1.1.2</h3>
<li>User Parameter 10_NotstromEntladen wird nicht mehr benötig und kann gelöscht werden. Wenn 10_minWertPrognose_kWh = 0, ist die Funktion: "Notstrom freigeben, wenn Prognose erreicht wird" deaktiviert.</li>
<li>Neuer User Parameter 10_Offset_sunriseEnd. Hiermit kann die Zeit nach Sonnenaufgang eingestellt werden, die mit der Notstromreserve noch abgedeckt werden soll.</li>
<li>Fehler behoben, dass die Reichweite Notstromreserve nicht mit dem aktuellen Batterie SOC berechnet wurde.</li>

<h3>Version: 1.1.1</h3>
<li>Fehler das Timer3 um 8:00 nicht beendet wurde behoben.</li>
<li>Zeitpunkt, wie lange die Notstromreserve reichen muss um 1 Stunde nach Sonnenaufgang verschoben, da bei Sonnenaufgang noch keine ausreichende PV-Leistung vorhanden ist.</li>

<h3>Version: 1.1.0</h3>
<li>Neue Funktion Notstromreserve verwenden, wenn die Prognose am nächsten Tag über einem einstellbaren Wert liegt.
Es wurden zwei neue User und zwei allgemein Parameter erstellt, 10_NotstromEntladen, 10_minWertPrognose_kWh, EigenverbrauchAbend_kWh,EigenverbrauchDurchschnitt_kWh.
Mit 10_NotstromEntladen = true wird die Funktion aktiviert und mit 10_minWertPrognose_kWh kann festgelegt werden, ab welcher Prognose in kWh am nächsten Tag die Notstromreserve freigegeben wird.
EigenverbrauchAbend_kWh summiert den Eigenverbrauch von 0:00 Uhr bis 8:00 Uhr und unter EigenverbrauchDurchschnitt_kWh wird der berechnete Durchschnittsverbrauch von diesem Zeitraum gespeichert.
Wenn der Notstrom SOC erreicht ist und 10_NotstromEntladen= true und die Prognose am nächsten Tag über dem eingestellten Wert in 10_minWertPrognose_kWh liegt, wird anhand vom Durchschnittsverbrauch berechnet, wie lange der Notstrom SOC den Eigenverbrauch abdecken kann.
Ab dem Zeitpunkt, wo die Notstromreserve bis zum Sonnenaufgang reicht, wird das Entladen der Batterie freigegeben. Bitte beachten das, wenn die Prognose nicht stimmt, kann es vorkommen, dass bei Stromausfall eventuell keine Notstromreserve mehr vorhanden ist.
Danke an @zelkin für diese Idee</li>
<li>Fehler behoben, dass der falsche Timer verwendet wurde. Danke an @icke-pp</li>
<li>LOG Texte optimiert, wenn das Script regelt, werden jetzt Warnungen ausgegeben, um das besser unterscheiden zu können. Natürlich, nur wenn 10_LogAusgabeRegelung = true ist </li>

<h3>Version: 1.0.29</h3>
<li>Ablaufproblem, das durch die Auslagerung der User Parameter entstanden ist, behoben. Solcast Daten sollten jetzt wieder um 4:00 Uhr aktualisiert werden.</li>

<h3>Version: 1.0.28</h3>
<li>Wenn die PV-Erzeugung die Prognose übersteigt, wird diese nicht mehr bei der Überschussberechnung abgezogen. Damit soll verhindert werden, dass die Einstellung sich ändert, wenn die 
Prognose zu gering war. </li>
<li>Wenn Ladeende erreicht ist und der Batterie SOC den Ladeende2 SOC erreicht hat, wird das Laden der Batterie gestoppt</li>

<h3>Version: 1.0.27</h3>
<li>Die Instanz vom Modbus Adapter und e3dc-rscp Adater können jetzt über die beiden neuen Kontanten "instanzModbus" und "instanzE3DC_RSCP" im Script eingestellt werden</li>
<li>Mit der neuen Konstante "LogparserSyntax" kann die Logausgabe vom Script an den Adapter Logparser angepasst werden. Wenn diese auf true eingestellt wird, wird der Log Text im Format ##{"from":"Charge-Control", "message":""}##' ausgegeben. </li>

<h3>Version: 1.0.26</h3>
<li>Doppelter Aufruf der Timer bei Scriptstart korrigiert. Danke an @smartboart, für den Hinweis .</li>
<li>Das Einspeiselimit wird aus "e3dc-rscp.0.EMS.DERATE_AT_PERCENT_VALUE" und "e3dc-rscp.0.EMS.INSTALLED_PEAK_POWER" berechnet, da im e3dc-rscp Adapter seit dem Update E3DC keine W Werte mehr übertragen werden </li>
<li>Für die User Parameter werden jetzt eigene Objekt ID's angelegt. Somit kann das Script immer komplett kopiert werden, ohne das die Einstellungen angepasst werden müssen.
Die Einstellungen im Script in eine andere Datei kopieren, dann die neue Version kopieren und die alte Überschreiben und das Script starten. Es werden einige Fehler angezeigt, die beim ersten Start ignoriert werden können.
Anschließen unter 0_userdata.0.Charge_Control.USER_ANPASSUNGEN die Werte wieder eintragen. Wenn jetzt das Script neu gestartet wird, sollten keine Fehler mehr angezeigt werden.  </li>

<h3>Version: 1.0.25</h3>
<li>URL korrigiert, sodas die Prognose wieder für 7 Tage von Solcast abgerufen wird. Danke an @bluebean für den Tipp .</li>

<h3>Version: 1.0.24</h3>
<li>Für die maximale Entladeleistung der Batterie wird jetzt das Objekt e3dc-rscp.0.EMS.SYS_SPECS.maxBatDischargPower verwendet.</li>

<h3>Version: 1.0.23</h3>
<li>Mehrere kleinere Fehler korrigiert. Das Einschalten der Lade-\Entladeleistung ist jetzt auch von "sunset" und "sunrise" abhängig, sodass bei einem Neustart vom Script vor Sonnenaufgang die Lade-\Entladeleistung nicht eingeschalten wird.  </li>

<h3>Version: 1.0.22</h3>
<li>Mit dem ausschalten der Batterieladung ist es möglich, dass der SOC Wert Batterie wieder um 1% ansteigt. Um ein ständiges ein und ausschalten zu verhindern, wird 
der Notstrom SOC nach dem Ausschalten um 1% erhöht. </li>

<h3>Version: 1.0.21</h3>
<li>Fehler behoben, das Notstrom Reserve nicht berücksichtigt wurde </li>

<h3>Version: 1.0.20</h3>
<li>Bereinigung der HTML-Daten Proplanta an die HTML Seite nach 2:00 Uhr angepasst, da nicht alle Werte um diese Zeit zur Verfügung stehen </li>

<h3>Version: 1.0.19</h3>
<li>Für die maximale Ladeleistung der Batterie wird jetzt das Objekt e3dc-rscp.0.EMS.SYS_SPECS.maxBatChargePower verwendet.</li>
<li>Bereinigung der html Daten Proplanta geändert</li>
<li>Kleinere Optimierungen am Script durchgeführt</li>

<h3>Version: 1.0.18</h3>
<li>Fehler korrigiert, für die Prüfung ob eine Notstromreserve beim E3DC eingestellt wurde, wird jetzt die Objekt ID PARAM_EP_RESERVE_W verwendet. </li>

<h3>Version: 1.0.17</h3>
<li>Es wird geprüft, ob beim Hauskraftwerk eine Notstromreserve eingestellt wurde und wenn ja, wird die Einstellung Notstrom min und Notstrom Sockel
in Charge-Control ignoriert und eine Warnung im LOG eingetragen </li>
<li>Neue Konstante "BewoelkungsgradGrenzwert".Jetzt kann jeder seinen Grenzwert einstellen, der als Umschaltkriterium für die Einstellung 2-5 verwendet wird.</li> 

<h3>Version: 1.0.16</h3>
<li>Ein-/ Ausschaltkriterium der Lade/Entladeleistung E3DC geändert. Es wird jetzt die Astro-Funktion "sunset" verwendet</li>

<h3>Version: 1.0.15</h3>
<li>Fehler, dass beim Abrufen der Wetterdaten Proplanta über Timer die falsche URL verwendet wurde, behoben.</li>

<h3>Version: 1.0.14</h3>
<li>Kleinere Script Optimierungen durchgeführt.</li>

<h3>Version: 1.0.13</h3>
<li>Prognose von Proplanta wird jetzt auch für die nächsten 6 Tage abgerufen.</li>

<h3>Version: 1.0.12</h3>
<li>Fehler, dass Ladeleistung bei Überschreiten der Einspeisegrenze nur langsam erhöht wurde, behoben.</li>

<h3>Version: 1.0.11</h3>
<li>Fehler, dass nach erreichen der Notstromreserve und ausreichender PV-Leistung nicht geladen wurde, behoben.
Wenn die PV-Leistung > 500 W ist, wird das Laden/Entladen der Batterie eingeschaltet und ab 100 W PV-Leistung und Notstrom SOC erreicht ausgeschaltet.</li>

<h3>Version: 1.0.10</h3>
<li>getSchedules(false) ersetzt, da es nicht bei allen problemlos funktioniert.</li>

<h3>Version: 1.0.9</h3>
<li>Fehler, dass Timer bei Neustart vom Skript nicht gelöscht werden, behoben.</li>
<li>Fehler, dass eine Aktualisierung des State "EinstellungAnwahl" zu einem Aufruf von der Funktion Main() führte, behoben.</li>
<li>Fehler, dass die Function Main() beim Scriptstart vor der aktualisierung der Prognosewerte Proplanta aufgerufen wurde, behoben.</li>

<h3>Version: 1.0.8</h3>
<li>Wenn Notstromreserve erreicht ist, wird auch DISCHARGE_START_POWER, MAX_CHARGE_POWER und MAX_DISCHARGE_POWER auf 0 gesetzt,
damit der WR in den Standby-Modus wechselt und die Batterie nicht weiter entladen wird.</li>
<li>Aktualisierung der State SET_POWER_VALUE auf 5 sek. reduziert</li>
<li>kleinere Fehler behoben.</li>

<h3>Version: 1.0.7</h3>
<li>Nach der Zeit Ladeende (Sommer Ladeende) wird die Regelung ausgeschaltet </li>

<h3>Version: 1.0.6</h3>
<li>Beim Skript Start werden jetzt auch die Prognosewerte Solcast abgerufen mit folgender Einschränkung:
Vor 4 Uhr werden die Prognosewerte für den aktuellen Tag + 6 Tage aktualisiert
Nach 4 Uhr werden nur die Prognosewerte für den nächsten Tag + 5 Tage aktualisiert</li>

<h3>Version: 1.0.5</h3>
<li>Es werden 200 W vom Einspeiselimit und der maximalen Wechselrichterleistung abgezogen, um die Trägheit der Steuerung auszugleichen</li> 

<h3>Version: 1.0.4</h3>
<li>Speichergröße berechnen geändert. Von der max. Kapazität der Batterie, werden 10% abgezogen die E3DC verwendet,
um ein Entladen auf 0% oder laden auf 100% zu verhindern.
Da das typabhängig ist, muss die Entladetiefe in % im Script unter Einstellungen E3DC eingetragen werden.</li>
<li>Fehler korrigiert das SET_POWER_MODE und SET_POWER_VALUE beim Skript Start zu einem Fehler führen, wenn diese beiden State
nicht definiert sind.</li>

<h3>Version: 1.0.3</h3>
<li>Die Entladeleistung wird langsam erhöht, um die Kurve zu glätten.</li>

<h3>Version: 1.0.2</h3>
<li>Speichergröße berechnen geändert. Es wird der ASOC (Alterungszustand) von Bat_0 verwendet, um die
verfügbare Batterie Kapazität zu berechnen</li>

<h3>Version: 1.0.1</h3>
<li>Wenn weniger als 500 W in das Netz eingespeist werden können, wird die Regelung ausgeschaltet.
Bei wechselnder Bewölkung ist die Regelung zu langsam, um Netzbezug zu verhindern, deswegen wird bereits 
ab einer Einspeiseleistung von 500 W die Regelung E3DC überlassen.</li>

<h3>Version: 1.0.0</h3>
<li>Das Zusatzprogramm E3DC-Control wird ab dieser Version nicht mehr benötig, dafür muss der
Adapter e3dc-rscp installiert sein.</li>
</ul>