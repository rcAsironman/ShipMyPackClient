import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { paymentInfoType } from "../types/types";


type BankInfoType = {
    bankDetails: paymentInfoType | null;
    setBankDetails: (details: paymentInfoType) => Promise<void>;
    clearBankDetails: () => Promise<void>;
    restoreBankDetails: () => Promise<void>
;
}


export const useBankInfoStore = create<BankInfoType>((set) => ({
    bankDetails: null,

    setBankDetails: async (details) => {
        await AsyncStorage.setItem('bankDetails', JSON.stringify(details));
        set({ bankDetails: details });
    },

    clearBankDetails: async () => {
        await AsyncStorage.removeItem('bankDetails');
        set({ bankDetails: null });
    },

    restoreBankDetails: async() => {
       const bankDetailsStr = await AsyncStorage.getItem('bankDetails');
       const fetchedDetails = bankDetailsStr ? JSON.parse(bankDetailsStr) : null;
       set({bankDetails: fetchedDetails});
    }

}));




