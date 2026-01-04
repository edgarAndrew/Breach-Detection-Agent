import {
    Home,
    Database,
    ShieldCheck,
    Upload,
    TrendingUp,
    Bell,
    PlusCircle,
} from "lucide-react"

const navigationItems = [
    // {
    //     heading: "Overview",
    //     items: [
    //         {
    //             title: "Dashboard",
    //             url: "",
    //             icon: Home,
    //         },
    //     ],
    // },
    {
        heading: "Configuration",
        items: [
            // {
            //     title: "Data source",
            //     url: "/datasource",
            //     icon: Database,
            // },
            {
                title: "Rules",
                url: "/rules",
                icon: ShieldCheck,
            },
            {
                title: "Add rule",
                url: "/rules/new",
                icon: PlusCircle,
            },
        ],
    },
    {
        heading: "Insights",
        items: [
            // {
            //     title: "Trend reports",
            //     url: "/reports/trends",
            //     icon: TrendingUp,
            // },
            {
                title: "Alerts",
                url: "/alerts",
                icon: Bell,
            },
            // {
            //     title: "Historical data",
            //     url: "/historical-upload",
            //     icon: Upload,
            // },
        ],
    },
] 

export default navigationItems;