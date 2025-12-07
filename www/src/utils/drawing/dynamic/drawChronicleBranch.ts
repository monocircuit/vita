import { drawBranch } from "@/utils/drawing/dynamic/drawBranch";
import { normalize } from "./helpers";
import { connectionEndpointX, connectionStartpointX } from "./endpoints";
import {
    getGlobalConfig,
    getBranchStyle,
    subscribeBranch,
    subscribeGlobal,
} from "./styleApi";
import { ChronicleCell } from "./helpers";
import type { DrawingContext } from "./helpers";
import { Graphics } from "pixi.js";

/**
 Die Registry speichert für jede gezeichnete Chronicle-Branch die zugehörigen
 Informationen, damit falls eine Kontextänderung stattfindet, der einzelne Branch neu gerendert werden kann.
 */
const branchRegistry = new Map<
    string,
    {
        gfx: Graphics;
        chronicle: ChronicleCell;
        levelIndex: number;
        context: DrawingContext;
        unsubscribeBranch?: () => void;
        unsubscribeGlobal?: () => void;
    }
>();

export const drawChronicleBranch = (
    context: DrawingContext,
    chronicle: ChronicleCell,
    levelIndex: number
) => {
    const { viewport, aknot, distance, screenWidth, centerY } = context;
    const id = String(chronicle.$?.id ?? `${Math.random()}`);

    // Helper to compute start/end/shift
    const computeGeometry = () => {
        const nknots = normalize(chronicle.$.knots, aknot, distance);
        let start = nknots[0] * screenWidth;
        let end = nknots[1] * screenWidth;

        // adapt endpoints where branches connect
        if (chronicle.next && chronicle.next.$) {
            end = connectionStartpointX(nknots[0] * screenWidth, nknots[1] * screenWidth);
        }
        if (chronicle.prev && chronicle.prev.$) {
            start = connectionEndpointX(nknots[0] * screenWidth, nknots[1] * screenWidth);
        }

        const cfg = getGlobalConfig();
        const shift = centerY - levelIndex * cfg.layerDistance;
        return { start, end, shift };
    };

    // Create initial gfx
    const initialCfg = getGlobalConfig();
    const override = chronicle.$?.id ? getBranchStyle(String(chronicle.$.id)) : undefined;
    const color = override?.color ?? initialCfg.branchColor;
    const thickness = override?.thickness ?? initialCfg.branchThickness;
    const geom = computeGeometry();

    // drawBranch should return the Graphics object
    const gfx = drawBranch(viewport, {
        start: geom.start,
        end: geom.end,
        shift: geom.shift,
        title: chronicle.$.id,
        color,
        thickness,
    });

    gfx.interactive = true;
    gfx.onclick = () => {
        console.log("Clicked on branch of Chronicle:", chronicle.$.id);
    };

    // store in registry
    const entry = {
        gfx,
        chronicle,
        levelIndex,
        context,
        unsubscribeBranch: undefined as any,
        unsubscribeGlobal: undefined as any,
    };
    branchRegistry.set(id, entry);

    // redraw function: replace old gfx with a new one (keeps this local so we can call it on updates)
    const redraw = () => {
        // compute new geometry & style
        const g = branchRegistry.get(id);
        if (!g) return;
        const { viewport: vp } = g.context;
        const geom = computeGeometry();
        const override = g.chronicle.$?.id ? getBranchStyle(String(g.chronicle.$.id)) : undefined;
        const cfg = getGlobalConfig();
        const color = override?.color ?? cfg.branchColor;
        const thickness = override?.thickness ?? cfg.branchThickness;

        // remove old gfx
        try {
            if (g.gfx.parent) g.gfx.parent.removeChild(g.gfx);
            g.gfx.destroy({ children: true, texture: false });
        } catch (e) {
            // ignore
        }

        // draw new gfx and reattach handlers
        const newGfx = drawBranch(vp, {
            start: geom.start,
            end: geom.end,
            shift: geom.shift,
            title: g.chronicle.$.id,
            color,
            thickness,
        });
        newGfx.interactive = true;
        newGfx.onclick = () => {
            console.log("Clicked on branch of Chronicle:", g.chronicle.$.id);
        };


        g.gfx = newGfx;
        branchRegistry.set(id, g);
    };


    // In diesen Funktionen wird redraw() aufgerufen bei Stil- oder Kontextänderungen.
    const unsubBranch = subscribeBranch(id, () => {
        redraw();
    });
    //Speicherung der Unsubscribe-Funktion im Falle einer späteren Löschung
    entry.unsubscribeBranch = unsubBranch;
    // globale Changes wie layerDistance
    const unsubGlobal = subscribeGlobal(() => {
        redraw();
    });
    entry.unsubscribeGlobal = unsubGlobal;


    // Return an unsubscribe / cleanup function in case caller wants to unregister later.
    return () => {
        const e = branchRegistry.get(id);
        if (!e) return;
        e.unsubscribeBranch && e.unsubscribeBranch();
        e.unsubscribeGlobal && e.unsubscribeGlobal();
        try {
            if (e.gfx.parent) e.gfx.parent.removeChild(e.gfx);
            e.gfx.destroy({ children: true, texture: false });
        } catch (err) { }
        branchRegistry.delete(id);
    };
};