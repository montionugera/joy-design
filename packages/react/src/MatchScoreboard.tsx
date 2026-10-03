import * as React from 'react';

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ');

export interface MatchScoreboardProps extends React.HTMLAttributes<HTMLDivElement> {
  player1: string;
  player2: string;
  seed1?: string;
  seed2?: string;
  sets1?: Array<number | string>;
  sets2?: Array<number | string>;
  currentPoints1?: string | number;
  currentPoints2?: string | number;
  serving?: 1 | 2;
  surface?: string;
  status?: string;
  matchTime?: string;
  tournament?: string;
  className?: string;
}

export const MatchScoreboard = React.forwardRef<HTMLDivElement, MatchScoreboardProps>(
  (
    {
      player1,
      player2,
      seed1,
      seed2,
      sets1 = [],
      sets2 = [],
      currentPoints1 = '0',
      currentPoints2 = '0',
      serving = 1,
      surface = 'Center Court — Hard',
      status = 'LIVE',
      matchTime = '00:00',
      tournament,
      className = '',
      ...rest
    },
    ref
  ) => {
    const maxSets = Math.max(sets1.length, sets2.length, 3);
    const setIndices = Array.from({ length: maxSets }, (_, i) => i);

    return (
      <div ref={ref} className={cx('joy-match-scoreboard', className)} {...rest}>
        <div className="joy-match-scoreboard__header">
          <span className="joy-match-scoreboard__surface">{surface}</span>
          <span className="joy-match-scoreboard__status">{status}</span>
        </div>

        <table className="joy-match-scoreboard__table">
          <thead>
            <tr>
              <th className="joy-match-scoreboard__cell" style={{ textAlign: 'left' }}>Player</th>
              {setIndices.map((idx) => (
                <th key={idx} className="joy-match-scoreboard__cell">{idx + 1}</th>
              ))}
              <th className="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">PTS</th>
            </tr>
          </thead>
          <tbody>
            {/* Player 1 row */}
            <tr className="joy-match-scoreboard__row">
              <td className="joy-match-scoreboard__player-cell">
                {serving === 1 && (
                  <span className="joy-match-scoreboard__serving" aria-label="Serving" />
                )}
                <span>{player1}</span>
                {seed1 && <span className="joy-match-scoreboard__seed">({seed1})</span>}
              </td>
              {setIndices.map((idx) => (
                <td key={idx} className="joy-match-scoreboard__cell">
                  {sets1[idx] !== undefined ? sets1[idx] : '—'}
                </td>
              ))}
              <td className="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">
                {currentPoints1}
              </td>
            </tr>

            {/* Player 2 row */}
            <tr className="joy-match-scoreboard__row">
              <td className="joy-match-scoreboard__player-cell">
                {serving === 2 && (
                  <span className="joy-match-scoreboard__serving" aria-label="Serving" />
                )}
                <span>{player2}</span>
                {seed2 && <span className="joy-match-scoreboard__seed">({seed2})</span>}
              </td>
              {setIndices.map((idx) => (
                <td key={idx} className="joy-match-scoreboard__cell">
                  {sets2[idx] !== undefined ? sets2[idx] : '—'}
                </td>
              ))}
              <td className="joy-match-scoreboard__cell joy-match-scoreboard__cell--active">
                {currentPoints2}
              </td>
            </tr>
          </tbody>
        </table>

        <div className="joy-match-scoreboard__footer">
          <span>{tournament ?? 'Official Match'}</span>
          <span>Elapsed: {matchTime}</span>
        </div>
      </div>
    );
  }
);

MatchScoreboard.displayName = 'MatchScoreboard';
