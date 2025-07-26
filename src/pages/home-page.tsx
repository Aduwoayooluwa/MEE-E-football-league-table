import LeagueTable from "../components/league-table";
import SeasonRegistration from "../components/season-registration";
// import DebugPanel from "../components/debug-panel";
import { Tabs, Card } from 'antd';

export default function HomePage() {
    const tabItems = [
        {
            key: 'table',
            label: 'League Table',
            children: <LeagueTable />,
        },
        {
            key: 'register',
            label: 'Register for Season',
            children: <SeasonRegistration />,
        },
        // {
        //     key: 'debug',
        //     label: 'Debug Panel',
        //     children: <DebugPanel />,
        // },
    ];

    return (
        <div className="max-w-6xl px-6 container mx-auto py-6">
            <Card>
                <Tabs
                    items={tabItems}
                    type="card"
                    size="large"
                    defaultActiveKey="table"
                />
            </Card>
        </div>
    );
}