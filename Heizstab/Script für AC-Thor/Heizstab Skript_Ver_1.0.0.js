// Erstellt von DA_Hood am 06.05.2025

const INTERVAL_MS = 1000; // 1 Sekunde
const socLimit = 60;
const statusTimeout = 2 * 60 * 1000; // 2 Minuten
const MAX_SWING = 1500; // maximal erlaubte Schwankung in W
const PAUSE_DURATION = 1.5 * 60 * 1000; // 1,5 Minuten
const EXTENDED_PAUSE = 30 * 60 * 1000; // 30 Minuten
const SWING_WINDOW = 15 * 60 * 1000; // 15 Minuten
const MAX_SWINGS_IN_WINDOW = 3;

const obj = {
    pv: '0_userdata.0.E3DC_Datenpunkte.GesamtLeistung',
    haus: 'modbus.0.holdingRegisters.40072_Hausverbrauch_Leistung',
    battLeistung: 'modbus.0.holdingRegisters.40070_Batterie_Leistung',
    berechneteLadeleistung: '0_userdata.0.Charge_Control.Allgemein.Akt_Berechnete_Ladeleistung_W',
    batteriestatus: 'e3dc-rscp.0.EMS.MODE',
    soc: 'modbus.0.holdingRegisters.40083_Batterie_SOC',
    heizstab: 'modbus.2.holdingRegisters.1000_Power',
    chargeControl: '0_userdata.0.Charge_Control.Allgemein.Automatik'
};

let lastStatus = null;
let statusStartTime = null;
let lastNetzueberschuss = null;
let pauseUntil = 0;
let skipNextSwingCheck = false;
let swingTimestamps = [];

setInterval(() => {
    try {
        const now = new Date();
        const hour = now.getHours();

        if (Date.now() < pauseUntil) {
            log('Berechnung pausiert – Heizstab bleibt bei -1000W', 'info');
            setState(obj.heizstab, -1000);
            return;
        }

        const pv = getState(obj.pv)?.val || 0;
        const haus = getState(obj.haus)?.val || 0;
        const batt = getState(obj.battLeistung)?.val || 0;
        const ladeleistung = getState(obj.berechneteLadeleistung)?.val || 0;

        if (hour < 6 || hour >= 20) {
            setState(obj.heizstab, -1000);
            log('Außerhalb der aktiven Zeit (6–20 Uhr) – Heizstab = -1000W', 'info');
            return;
        }

        const soc = getState(obj.soc)?.val;
        const status = getState(obj.batteriestatus)?.val;
        const chargeControl = getState(obj.chargeControl)?.val;

        if (soc === undefined || status === undefined || chargeControl === undefined) {
            log('Fehlende Werte für SOC, Batteriestatus oder Charge Control', 'warn');
            return;
        }

        let netzueberschuss = -1000;

        if (status !== lastStatus) {
            log(`Statuswechsel: ${lastStatus} → ${status}`, 'debug');
            lastStatus = status;
            statusStartTime = now.getTime();
        }

        if (soc < socLimit || chargeControl === false) {
            netzueberschuss = pv - haus - batt;
            log(`[SOC < 60% oder Charge Control aus] Heizstab = PV(${pv}) - Haus(${haus}) - Batt(${batt}) = ${netzueberschuss}`, 'info');
        } else {
            if (status === 2 && chargeControl === true) {
                netzueberschuss = pv - haus - ladeleistung;
                log(`[Möglichkeit 1] Status=2 & Charge Control aktiv → PV(${pv}) - Haus(${haus}) - Ladeleistung(${ladeleistung}) = ${netzueberschuss}`, 'info');
            } else if ((status === 0 || status === 1) && chargeControl === true) {
                const elapsed = now.getTime() - statusStartTime;
                if (elapsed >= statusTimeout) {
                    netzueberschuss = pv - haus - batt;
                    log(`[Möglichkeit 2] Status=${status} > 2min stabil & Charge Control aktiv → PV(${pv}) - Haus(${haus}) - Batt(${batt}) = ${netzueberschuss}`, 'info');
                } else {
                    log(`[Wartephase] Status=${status} erst seit ${Math.round(elapsed / 1000)}s – Heizstab = -1000W`, 'info');
                    setState(obj.heizstab, -1000);
                    return;
                }
            } else {
                netzueberschuss = -1000;
                log(`Unbekannter Zustand – Heizstab = -1000W`, 'warn');
            }
        }

        // ✅ Schwankungsprüfung – beide Werte müssen < 2000W sein
        if (!skipNextSwingCheck) {
            if (
                lastNetzueberschuss !== null &&
                netzueberschuss < 2000 &&
                lastNetzueberschuss < 2000 &&
                Math.abs(netzueberschuss - lastNetzueberschuss) > MAX_SWING
            ) {
                log(`⚠️ Starke Schwankung erkannt (${lastNetzueberschuss} → ${netzueberschuss})`, 'warn');
                setState(obj.heizstab, -1000);

                const nowTime = Date.now();
                swingTimestamps.push(nowTime);

                swingTimestamps = swingTimestamps.filter(ts => nowTime - ts <= SWING_WINDOW);

                if (swingTimestamps.length >= MAX_SWINGS_IN_WINDOW) {
                    pauseUntil = nowTime + EXTENDED_PAUSE;
                    swingTimestamps = [];
                    log(`🚨 3 Schwankungen in 15min → 30 Minuten Pause aktiviert`, 'error');
                } else {
                    pauseUntil = nowTime + PAUSE_DURATION;
                    log(`⏸ Heizstab 1,5 Minuten pausiert`, 'info');
                }

                skipNextSwingCheck = true;
                return;
            }
        } else {
            log(`🔄 Schwankungspause beendet – neuer Referenzwert = ${netzueberschuss}W`, 'debug');
            skipNextSwingCheck = false;
        }

        setState(obj.heizstab, netzueberschuss);
        log(`Setze Netzüberschuss auf ${netzueberschuss}W`, 'info');
        lastNetzueberschuss = netzueberschuss;

    } catch (err) {
        log('Fehler im Heizstab-Script: ' + err.message, 'error');
        setState(obj.heizstab, -1000); // Sicherheitsmaßnahme
    }
}, INTERVAL_MS);