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

<h3>iobroker_VIS_View_E3DC_Charge_Control.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Control2.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Control2.png" alt="VIS View E3DC-Control" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Uebersicht.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Uebersicht.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Uebersicht.png" alt="VIS View E3DC Uebersicht" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Modbus.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Modbus.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Modbus.png" alt="VIS View E3DC Modbus" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_Diagramm_Prognosen.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/Diagramm_Prognosen2.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/Diagramm_Prognosen2.png" alt="VIS View Diagramm_Prognosen" style="max-width:100%;"></a></p>

<h3>iobroker_VIS_View_E3DC_Wallbox.js</h3>
<p>View Import Datei für iobroker VIS</p>
<p><a target="_blank" rel="noopener noreferrer" href="https://github.com/ArnoD15/iobroker_E3DC/blob/master/images/E3DC_Wallbox.png"><img src="https://github.com/ArnoD15/iobroker_E3DC/raw/master/images/E3DC_Wallbox.png" alt="VIS View E3DC Wallbox" style="max-width:100%;"></a></p>

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


<br><br>
<a name="log"></a>

<h3>Changelog Charge-Control</h3>

<ul>
<h3>Version: 1.1.2</h3>
<li>User Parameter 10_NotstromEntladen wird nicht mehr benötig und kann gelöscht werden. Wenn 10_minWertPrognose_kWh = 0 ist, ist die Funktion Notstrom freigeben, wenn Prognose erreicht wird deaktiviert.</li>
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