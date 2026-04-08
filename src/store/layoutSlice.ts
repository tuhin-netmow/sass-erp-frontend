import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface PosLayoutSettings {
    columns: {
        mobile: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
        xxl: number;
    };
    gap: number;
    showImages: boolean;
    cardStyle: "standard" | "compact" | "bordered";
    autoGenerateInvoice: boolean;
    defaultPaymentMethod: string;
    showDueSale: boolean;
    showCashSale: boolean;
}

interface LayoutState {
    pos: PosLayoutSettings;
}

const initialState: LayoutState = {
    pos: {
        columns: {
            mobile: 2,
            sm: 3,
            md: 4,
            lg: 2,
            xl: 3,
            xxl: 4,
        },
        gap: 4,
        showImages: true,
        cardStyle: "standard",
        autoGenerateInvoice: true,
        defaultPaymentMethod: "cash",
        showDueSale: true,
        showCashSale: true,
    },
};

const layoutSlice = createSlice({
    name: "layout",
    initialState,
    reducers: {
        setPosColumns: (state, action: PayloadAction<{ breakpoint: keyof PosLayoutSettings["columns"]; count: number }>) => {
            state.pos.columns[action.payload.breakpoint] = action.payload.count;
        },
        setPosGap: (state, action: PayloadAction<number>) => {
            state.pos.gap = action.payload;
        },
        togglePosImages: (state) => {
            state.pos.showImages = !state.pos.showImages;
        },
        setPosCardStyle: (state, action: PayloadAction<PosLayoutSettings["cardStyle"]>) => {
            state.pos.cardStyle = action.payload;
        },
        updatePosLayout: (state, action: PayloadAction<Partial<PosLayoutSettings>>) => {
            state.pos = {
                ...state.pos,
                ...action.payload,
                columns: {
                    ...state.pos.columns,
                    ...action.payload.columns
                }
            };
        },
    },
});

export const { setPosColumns, setPosGap, togglePosImages, setPosCardStyle, updatePosLayout } = layoutSlice.actions;
export default layoutSlice.reducer;
