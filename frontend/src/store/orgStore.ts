import {create} from "zustand";

interface OrgState {
    org_id: string | null;
    setOrg: (id: string) => void;
}

const useOrg = create<OrgState>((set) => ({
    org_id: null,
    setOrg: (id: string) => set({ org_id: id })
}));

export { useOrg }