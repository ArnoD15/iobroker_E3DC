// defintion which instances has to be used 
const instanzE3DC_RSCP       = 'e3dc-rscp.0' 
const instanzHeizstab_Modbus = 'modbus.1'

// E3DC Komponenten Definition 
const sID_PV_Leistung       = `${instanzE3DC_RSCP}.EMS.POWER_PV`; // PV power
const sID_Netz_Leistung     = `${instanzE3DC_RSCP}.EMS.POWER_GRID`; // Grid power
const sID_Wallbox_Leistung  = `${instanzE3DC_RSCP}.EMS.POWER_WB_ALL`; // Wallbox power
const sID_Batterie_Leistung = `${instanzE3DC_RSCP}.EMS.POWER_BAT`; // Battery power
const sID_Power_Mode        = `${instanzE3DC_RSCP}.EMS.MODE`; // Power mode state
const sID_Batterie_Status   = `${instanzE3DC_RSCP}.EMS.BAT_SOC`; // Battery status state
const sID_Bat_Charge_Limit  = `${instanzE3DC_RSCP}.EMS.SYS_SPECS.maxBatChargePower`;// Batterie Ladelimit

// selbst definierte Variablen
const sID_Eigenverbrauch    = '0_userdata.0.Heizung.E3DC.Hausverbrauch_ohne_Heizstab'; // Household consumption power
const sID_M_Power_W         = '0_userdata.0.Charge_Control.Allgemein.Akt_Berechnete_Ladeleistung_W'; // Calculated required charging power

// Heistab Modbus Variablen 
const sID_LeistungHeizstab_W        = `${instanzHeizstab_Modbus}.holdingRegisters.1000_Power`; // Current power consumption of heating element in W
const sID_Soll_LeistungHeizstab_W   = `${instanzHeizstab_Modbus}.holdingRegisters.1000_Power`; // Target heating element power
const sID_IstTempHeizstab           = `${instanzHeizstab_Modbus}.holdingRegisters.1001_Temp1`; // Current temperature at the heating element
const sID_MaxTempHeizstab           = `${instanzHeizstab_Modbus}.holdingRegisters.1002_WW1_Temp_max`; // Maximum temperature

// Heistab states manuell zu erstellen für Statistikwerte
const sID_previousHeizstabLeistung_W    = '0_userdata.0.Heizung.E3DC.previousHeizstabLeistung'; // Previous heating element load power
const sID_Heizstab_Gesamtenergie        = '0_userdata.0.Heizung.E3DC.Heizstab_Gesamtenergie'; // Cumulative energy
const sID_Heizstab_LetzteAktualisierung = '0_userdata.0.Heizung.E3DC.Heizstab_LetzteAktualisierung'; // Last update

// Defintion von Heizstabparametern und Sicherheitsmechanismen
const debounceInterval          = 3000; // Minimum interval between updates in milliseconds
const temperatureBuffer         = 3;    // Buffer in degrees Celsius to prevent frequent on/off cycling
const minimumHeizstabLeistung   = 300;  // Minimum power for heating element
const sicherheitspuffer         = 300;  // Safety buffer to avoid frequent switching
const MaximalLeistungHeizstab_W = 3000; // Maximum power in watt of the heating element

let debounceTimer;

async function fetchAndUpdateHeizstabLeistung() {
    try {
        // Zustände abfragen
        const states = await Promise.all([
            getStateAsync(sID_Netz_Leistung),
            getStateAsync(sID_LeistungHeizstab_W),
            getStateAsync(sID_Eigenverbrauch),
            getStateAsync(sID_M_Power_W),
            getStateAsync(sID_Batterie_Leistung),
            getStateAsync(sID_IstTempHeizstab),
            getStateAsync(sID_MaxTempHeizstab),
            getStateAsync(sID_PV_Leistung),
            getStateAsync(sID_Soll_LeistungHeizstab_W),
            getStateAsync(sID_previousHeizstabLeistung_W),
            getStateAsync(sID_Power_Mode),
            getStateAsync(sID_Batterie_Status),
            getStateAsync(sID_Bat_Charge_Limit)
        ]);

        const [
            Netz_Leistung, LeistungHeizstab, Eigenverbrauch, M_Power, Batterie_Leistung,
            IstTempHeizstab, MaxTempHeizstab, PV_Leistung, SollLeistungHeizstab, previousHeizstabLeistung,
            Power_Mode, Batterie_Status, Bat_Charge_Limit
        ] = states;

        // Ensure all states are fetched correctly
        const stateNames = [
            'Netz_Leistung', 'LeistungHeizstab', 'Eigenverbrauch', 'M_Power', 'Batterie_Leistung',
            'IstTempHeizstab', 'MaxTempHeizstab', 'PV_Leistung', 'SollLeistungHeizstab', 'previousHeizstabLeistung',
            'Power_Mode', 'Batterie_Status', 'Bat_Charge_Limit'
        ];

        stateNames.forEach((name, index) => {
            if (states[index] === null || states[index] === undefined) {
                console.error(`State ${name} is null or undefined`);
            }
        });

        if (states.some(state => state === null || state === undefined)) {
            throw new Error('One or more states are null or undefined');
        }

        // Werte extrahieren
        let [
            NetzLeistung_W, LeistungHeizstab_W, Hausverbrauch_W, M_Power_W, BatterieLeistung_W,
            IstTemp, MaxTemp, PV_Leistung_W, SollLeistungHeizstab_W, previousHeizstabLeistung_W,
            PowerMode, BatterieStatus, Charge_Limit
        ] = states.map(state => state.val);

        console.log(`Zustände abgefragt: Netz=${NetzLeistung_W}W, PV=${PV_Leistung_W}W, Hausverbrauch=${Hausverbrauch_W}W, LeistungHeizstab=${LeistungHeizstab_W}W, Batterie=${BatterieLeistung_W}W, IstTemp=${IstTemp}°C, MaxTemp=${MaxTemp}°C, SollLeistungHeizstab=${SollLeistungHeizstab_W}W, PowerMode=${PowerMode}, BatterieStatus=${BatterieStatus}, Charge_Limit=${Charge_Limit}, M_Power_W=${M_Power_W}`);

        // Bedingungen prüfen
        if (PowerMode === 2 && Charge_Limit == M_Power_W && BatterieLeistung_W > 0) {
            console.log('Power_Mode ist 2 und Batterie soll mit max. Leistung geladen werden. Heizstab wird nicht aktiviert.');
            await setStateAsync(sID_Soll_LeistungHeizstab_W, 0);
            return;
        }

        // Verfügbaren Überschuss berechnen
        let verfuegbarerUeberschuss_W = PV_Leistung_W - Hausverbrauch_W - M_Power_W - sicherheitspuffer; // Verfügbarer Überschuss unter Berücksichtigung von PV-Leistung, Hausverbrauch, Soll-Ladeleistung und Sicherheitspuffer
        verfuegbarerUeberschuss_W = Math.max(verfuegbarerUeberschuss_W, 0); // Stellen Sie sicher, dass der Wert nicht negativ wird

        // Heizstab-Leistung bestimmen
        let HeizstabLadeleistung_W = 0;
        if (IstTemp < MaxTemp - temperatureBuffer && verfuegbarerUeberschuss_W >= minimumHeizstabLeistung) { // Stellen Sie sicher, dass die Temperaturbedingung mit Puffer erfüllt ist und die Mindestleistung verfügbar ist
            HeizstabLadeleistung_W = Math.min(verfuegbarerUeberschuss_W, MaximalLeistungHeizstab_W); // Begrenzen Sie auf 3000W oder verfügbare Energie
        } else {
            HeizstabLadeleistung_W = 0; // Heizstab ausschalten, wenn die Bedingungen nicht erfüllt sind
        }
        await setStateAsync(sID_Soll_LeistungHeizstab_W, HeizstabLadeleistung_W);

        // Aktualisiere den vorherigen Wert der Heizstabladeleistung
        await setStateAsync(sID_previousHeizstabLeistung_W, HeizstabLadeleistung_W);

        // Kumulierte Energieberechnung, Aktualisierung und Logging
        const jetzt = Date.now();
        const letzteAktualisierung = await getStateAsync(sID_Heizstab_LetzteAktualisierung);
        const vergangeneZeitInStunden = (jetzt - (letzteAktualisierung.val || 0)) / (1000 * 60 * 60);
        const verbrauchteEnergie = (LeistungHeizstab_W * vergangeneZeitInStunden) / 1000; // In kWh umrechnen
        const aktuelleGesamtenergie = (await getStateAsync(sID_Heizstab_Gesamtenergie)).val || 0;
        const neueGesamtenergie = aktuelleGesamtenergie + verbrauchteEnergie;

        await setStateAsync(sID_Heizstab_Gesamtenergie, neueGesamtenergie);
        await setStateAsync(sID_Heizstab_LetzteAktualisierung, jetzt);

        console.log(`Update: Netz=${NetzLeistung_W}W, PV=${PV_Leistung_W}W, Heizstab=${HeizstabLadeleistung_W}W, Überschuss=${verfuegbarerUeberschuss_W}W`);
    } catch (error) {
        // @ts-ignore
        console.error('Fehler bei der Aktualisierung der Heizstab-Leistung:', error.message);
        console.error(error.stack);
    }
}

function debounceUpdate() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(fetchAndUpdateHeizstabLeistung, debounceInterval);
}

// Register listeners for relevant state changes
const ids = [
    sID_PV_Leistung,
    sID_Netz_Leistung,
    sID_Eigenverbrauch,
    sID_Batterie_Leistung,
    sID_LeistungHeizstab_W,
    sID_M_Power_W,
    sID_Power_Mode,
    sID_Batterie_Status
];

ids.forEach(id => {
    on({ id, change: "ne" }, debounceUpdate);
    console.log(`Listener registered for ${id}`);
});

// Initial call
fetchAndUpdateHeizstabLeistung();