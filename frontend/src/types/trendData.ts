type TrendData = {
    org_id: string,
    rule_id: string,
    threshold: number,
    trend: { timestamp: number; value: number }[]
    health: string;
}
export default TrendData;