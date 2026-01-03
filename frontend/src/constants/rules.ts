import KeyValuePair from "@/types/keyValuePair"

export const METRIC_OPTIONS: KeyValuePair<string>[] = [
    { key: "pe_ratio", value: "P/E Ratio" },
    { key: "debt_ratio", value: "Debt Ratio" },
    { key: "interest_coverage", value: "Interest Coverage" },
    { key: "ebitda_margin", value: "EBITDA Margin" },
]

export const RULE_OPERATORS: KeyValuePair<string>[] = [
    { key: '>', value: 'is greater than' },
    { key: '<', value: 'is less than' },
    { key: '>=', value: 'is at least' },
    { key: '<=', value: 'is at most' },
    { key: '=', value: 'equals' },
];
