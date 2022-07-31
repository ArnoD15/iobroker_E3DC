# iobroker-E3DC

<h3>Charge-Control</h3>
ioBroker Script zum steuern der Laderegelung von einem E3DC Hauskraftwerk mit Wetterprognose
<br>
Mit dem Programm Charge-Control soll erreicht werden, dass der Batteriespeicher möglichst schonend geladen wird, um die Lebensdauer zu erhöhen und ein abregeln 
beim Überschreiten der 70% Einspeisegrenze zu verhindern.<br>
<ul>
<li>Speicher soll nie längere Zeit auf 100 % geladen werden oder auf 0 % entladen werden.</li><br>
<li>Möglichst gleichmäßige Ladeleistung beim Laden.</li><br>
<li>PV-Überschuss soll gespeichert werden, um nicht in die 70 % Abriegelung zu kommen.</li><br>
<li>Bei Überschreitung WR Begrenzung soll Überschuss in die Batterie gespeichert werden.</li><br>
</ul><br><br>
<p>Weitere Informationen im iobroker Forum: https://forum.iobroker.net/topic/32976/e3dc-hauskraftwerk-steuern</p>


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

<h3>iobroker_VIS_View_E3DC_Control.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Control.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Control.png" alt="VIS View E3DC-Control" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_Diagramm_Prognosen.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/Diagramm_Prognosen.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/Diagramm_Prognosen.png" alt="VIS View E3DC-Control" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Wallbox.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Wallbox.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Wallbox.png" alt="VIS View E3DC-Control" style="max-width:100%;"></a></p>
