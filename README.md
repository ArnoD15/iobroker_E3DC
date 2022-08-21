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
</ul><br><br>
<p>Weitere Informationen in der "Anleitung Charge-Control.pdf" oder im iobroker Forum: https://forum.iobroker.net/topic/32976/e3dc-hauskraftwerk-steuern</p>


[![paypal](https://www.paypalobjects.com/en_US/DK/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/donate?hosted_button_id=JWM2WUT7ZACVL&source=url) 


<h3>E3DC_Wallbox</h3>
Script zum Steuern der Wallbox easy connect mit Mode 3-Ladekabel (3-phasig) fest angeschlagen mit Ladestecker Typ 2 von E3DC. Die Wallbox muss über Modbus
verbunden sein.

<h3>Modbus</h3>
<p>Script Sammlung Modbus Adapter für E3DC.</p>
<ul>
<li>Modbus Register 40082 Aufteilung "Autarkie und Eigenverbrauch in Prozent<br>Autor: Andre Germann</li><br>
<li>Modbus Register 40002 Aufteilung "Modbus Firmware Version"<br>Autor: Andre Germann</li><br>
<li>Modbus Register 40085 "EMS-Status" Datenwort Dez. in BIT_Ausgabe für Vis umwandeln<br>Autor: ArnoD</li><br>
<li>Modbus Register 40088 "Wallbox_x_CTRL" Datenwort Dez. in BIT_Ausgabe für Vis umwandeln<br>Autor: ArnoD</li><br>
<li>E3DC dynamische Autonomiezeitberechnung V0.0.8<br>Autor: Smartboard</li><br>
<li>Bei Firmware-Updates das Datum des Updates und die alte Versionsnummer speichern<br>Autor: stevie77</li><br>
</ul>

<h3>iobroker_VIS_View_E3DC_Uebersicht.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Uebersicht.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Uebersicht.png" alt="VIS View E3DC Uebersicht" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Modbus.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Modbus.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Modbus.png" alt="VIS View E3DC Modbus" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Charge_Control.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Control.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Control.png" alt="VIS View E3DC-Control" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_Diagramm_Prognosen.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/Diagramm_Prognosen.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/Diagramm_Prognosen.png" alt="VIS View E3DC-Control" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Wallbox.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Wallbox.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Wallbox.png" alt="VIS View E3DC-Control" style="max-width:100%;"></a></p>
<br><br>
<a name="log"></a>

##Changelog Charge-Control
<h3>Version: 1.0.16</h3>
* Ein-/ Ausschaltkriterium der Lade/Entladeleistung E3DC geändert. Es wird jetzt die Astro-Funktion "sunset" verwendet
<h3>Version: 1.0.15</h3>
* Fehler, dass beim Abrufen der Wetterdaten Proplanta über Timer die falsche URL verwendet wurde, behoben.
<h3>Version: 1.0.14</h3>
* Kleinere Script Optimierungen durchgeführt.
<h3>Version: 1.0.13</h3>
* Prognose von Proplanta wird jetzt auch für die nächsten 6 Tage abgerufen.
<h3>Version: 1.0.12</h3>
* Fehler, dass Ladeleistung bei Überschreiten der Einspeisegrenze nur langsam erhöht wurde, behoben.
<h3>Version: 1.0.11</h3>
* Fehler, dass nach erreichen der Notstromreserve und ausreichender PV-Leistung nicht geladen wurde, behoben.
Wenn die PV-Leistung > 500 W ist, wird das Laden/Entladen der Batterie eingeschaltet und ab 100 W PV-Leistung und Notstrom SOC erreicht ausgeschaltet.
<h3>Version: 1.0.10</h3>
* getSchedules(false) ersetzt, da es nicht bei allen problemlos funktioniert.
<h3>Version: 1.0.9</h3>
* Fehler, dass Timer bei Neustart vom Skript nicht gelöscht werden, behoben.
* Fehler, dass eine Aktualisierung des State "EinstellungAnwahl" zu einem Aufruf von der Funktion Main() führte, behoben.
* Fehler, dass die Function Main() beim Scriptstart vor der aktualisierung der Prognosewerte Proplanta aufgerufen wurde, behoben.
<h3>Version: 1.0.8</h3>
* Wenn Notstromreserve erreicht ist, wird auch DISCHARGE_START_POWER, MAX_CHARGE_POWER und MAX_DISCHARGE_POWER auf 0 gesetzt,
damit der WR in den Standby-Modus wechselt und die Batterie nicht weiter entladen wird.
* Aktualisierung der State SET_POWER_VALUE auf 5 sek. reduziert
* kleinere Fehler behoben.
<h3>Version: 1.0.7</h3>
* Nach der Zeit Ladeende (Sommer Ladeende) wird die Regelung ausgeschaltet 
<h3>Version: 1.0.6</h3>
* Beim Skript Start werden jetzt auch die Prognosewerte Solcast abgerufen mit folgender Einschränkung:
Vor 4 Uhr werden die Prognosewerte für den aktuellen Tag + 6 Tage aktualisiert
Nach 4 Uhr werden nur die Prognosewerte für den nächsten Tag + 5 Tage aktualisiert
<h3>Version: 1.0.5</h3>Es werden 200 W vom Einspeiselimit und der maximalen Wechselrichterleistung abgezogen, um die Trägheit der Steuerung auszugleichen 
<h3>Version: 1.0.4</h3>Speichergröße berechnen geändert. Von der max. Kapazität der Batterie, werden 10% abgezogen die E3DC verwendet,
um ein Entladen auf 0% oder laden auf 100% zu verhindern.
Da das typabhängig ist, muss die Entladetiefe in % im Script unter Einstellungen E3DC eingetragen werden.
<br>Fehler korrigiert das SET_POWER_MODE und SET_POWER_VALUE beim Skript Start zu einem Fehler führen, wenn diese beiden State
nicht definiert sind.
<h3>Version: 1.0.3</h3>Auch die Entladeleistung wird langsam erhöht, um Kurve zu glätten.
<h3>Version: 1.0.2</h3>Speichergröße berechnen geändert. Es wird der ASOC (Alterungszustand) von Bat_0 verwendet, um die
verfügbare Batterie Kapazität zu berechnen
<h3>Version: 1.0.1</h3>     Wenn weniger als 500 W in das Netz eingespeist werden können, wird die Regelung ausgeschaltet.
                    Bei wechselnder Bewölkung ist die Regelung zu langsam, um Netzbezug zu verhindern, deswegen wird bereits 
                    ab einer Einspeiseleistung von 500 W die Regelung E3DC überlassen.
<h3>Version: 1.0.0</h3>     Das Zusatzprogramm E3DC-Control wird ab dieser Version nicht mehr benötig, dafür muss der
                    Adapter e3dc-rscp installiert sein.