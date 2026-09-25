import { createContext } from "react";
import { HostLayout } from "../util/types.js";

/**
 * The edge where the system wants bars to run vertically for this part of the
 * UI, or null for horizontal bars. HostProvider provides the host's bar edge
 * (e.g. the iPhone Duo's outer display); containers that float their content
 * away from the screen edges, like dialogs, provide null so the bars inside
 * them stay horizontal.
 */
export const BarEdgeContext = createContext<HostLayout["barEdge"] | null>(null);
BarEdgeContext.displayName = "BarEdgeContext";
