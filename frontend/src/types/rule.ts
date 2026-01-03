type Rule = {
    _id: string
    rule_name: string
    rule_id: string
    data_src_id: string
    attribute_name: string
    threshold: number
    near_thres: number
    operator: string
}

export default Rule;