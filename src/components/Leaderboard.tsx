export type Leaderboard = LeaderboardEntry[];
export interface LeaderboardEntry {
    elapsedTime: number;
    clickCount: number;
    at: Date;
}

export function LeaderboardView(props: { leaderboard: Leaderboard }) {
    return <div>
        <h3>Leaderboard</h3>
        <div className='leaderboard'>
            {props.leaderboard.map((le: LeaderboardEntry) => <p
                key={le.at.toString()}
            >Entry: {le.elapsedTime}
                at {le.at && le.at.toString()}
            </p>)}
        </div>
    </div>
}