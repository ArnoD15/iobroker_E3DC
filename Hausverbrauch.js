// defintion which instances has to be used 
const instanzE3DC_RSCP          = 'e3dc-rscp.0' 
const instanzHeizstab_Modbus    = 'modbus.1'

// Define state IDs
const sID_LeistungHeizstab_W            = `${instanzHeizstab_Modbus}.holdingRegisters.1000_Power`; // Current power consumption of heating element in W
const sID_Eigenverbrauch                = `${instanzE3DC_RSCP}.EMS.POWER_HOME`; // Household consumption power
const sID_Hausverbrauch_ohne_Heizstab   = '0_userdata.0.Heizung.E3DC.Hausverbrauch_ohne_Heizstab'; // Household consumption without heating element

const MIN_HAUSVERBRAUCH_OHNE_HEIZSTAB   = 0; // Mindestwert für Hausverbrauch ohne Heizstab
const BUFFER_SIZE                       = 5; // Größe des Buffers für gleitenden Durchschnitt
const debounceTimer                     = 1000; // 1000ms gleich 1 Sekunde

let hausverbrauchBuffer = []; // Buffer für Hausverbrauchswerte

async function calculateAndUpdateHausverbrauchOhneHeizstab() {
    try {
        // Zustände abfragen
        const [LeistungHeizstab, Eigenverbrauch] = await Promise.all([
            getStateAsync(sID_LeistungHeizstab_W),
            getStateAsync(sID_Eigenverbrauch)
        ]);

        // Ensure all states are fetched correctly
        if (LeistungHeizstab === null || LeistungHeizstab === undefined) {
            console.error('State LeistungHeizstab is null or undefined');
            return;
        }

        if (Eigenverbrauch === null || Eigenverbrauch === undefined) {
            console.error('State Eigenverbrauch is null or undefined');
            return;
        }

        // Werte extrahieren
        let LeistungHeizstab_W = LeistungHeizstab.val;
        let Hausverbrauch_W = Eigenverbrauch.val;

        // Hausverbrauch ohne Heizstab berechnen
        let HausverbrauchOhneHeizstab_W = Hausverbrauch_W - LeistungHeizstab_W;

        // Sicherstellen, dass der Hausverbrauch ohne Heizstab nicht negativ ist
        HausverbrauchOhneHeizstab_W = Math.max(HausverbrauchOhneHeizstab_W, MIN_HAUSVERBRAUCH_OHNE_HEIZSTAB);

        // Wert in den Buffer einfügen
        hausverbrauchBuffer.push(HausverbrauchOhneHeizstab_W);

        // Buffergröße begrenzen
        if (hausverbrauchBuffer.length > BUFFER_SIZE) {
            hausverbrauchBuffer.shift(); // Ältesten Wert entfernen
        }

        // Gleitenden Durchschnitt berechnen
        let averageHausverbrauchOhneHeizstab_W = hausverbrauchBuffer.reduce((acc, val) => acc + val, 0) / hausverbrauchBuffer.length;

        await setStateAsync(sID_Hausverbrauch_ohne_Heizstab, averageHausverbrauchOhneHeizstab_W);

        console.log(`Hausverbrauch ohne Heizstab aktualisiert: ${averageHausverbrauchOhneHeizstab_W} W`);
    } catch (error) {
        console.error('Fehler bei der Berechnung des Hausverbrauchs ohne Heizstab:', error.message);
        console.error(error.stack);
    }
}

// Register interval for periodic updates
setInterval(calculateAndUpdateHausverbrauchOhneHeizstab, debounceTimer);

// Initial call
calculateAndUpdateHausverbrauchOhneHeizstab();
