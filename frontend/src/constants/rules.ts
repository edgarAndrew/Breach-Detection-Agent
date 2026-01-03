import KeyValuePair from "@/types/keyValuePair"

export const METRIC_OPTIONS: KeyValuePair<string>[] = [
    { key: "pe_ratio", value: "P/E Ratio" },
    { key: "debt_ratio", value: "Debt Ratio" },
    { key: "interest_coverage", value: "Interest Coverage" },
    { key: "ebitda_margin", value: "EBITDA Margin" },
]

export const RULE_OPERATORS: KeyValuePair<string>[] = [
    { key: 'gt', value: 'is greater than' },
    { key: 'lt', value: 'is less than' },
    { key: 'gte', value: 'is at least' },
    { key: 'lte', value: 'is at most' },
    { key: 'eq', value: 'equals' },
];