import FAC from 'fast-average-color';

export function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds / 60) - (h * 60);
  const s = seconds % m || 0;
  return `${ !h ? '' : `${ h }:` }${ m < 10 ? `0${ m }` : m }:${ s < 10 ? `0${ s }` : s }`;
};

export async function getBackdropColour(url: string): Promise<[ string, boolean ]> {
  const c = (await new FAC().getColorAsync(url));
  return [ c.hex, c.isDark ];
};

type EpisodeProgress = 'none' | 'active' | 'watched';
export function getShowProgress(seasons: {
  playablePath: string;
  progress: number;
  duration: number;
}[][]) {
  return seasons.map((s) => s.map((e) => {
    return e.progress === 0 ? 'none' : e.progress === e.duration ? 'watched' : 'active';
  }));
}
export function getShowActiveEpisode(seasons: EpisodeProgress[][]): [ number, number ] {
  const activeEpisodeinSeasons: [ number, number | null ][] = [];

  for (let si in seasons) {
    if (seasons[ si ].every((e) => e === 'none')) { // Hasn't begun watching the season
      activeEpisodeinSeasons.push([ parseInt(si) + 1, 1 ]);
      continue;
    } else if (seasons[ si ].every((e) => e === 'watched')) { // Watched the entire season
      activeEpisodeinSeasons.push([ parseInt(si) + 1, null ]);
      continue;
    } else { // In the middle of watching the season
      const aei = seasons[ si ].reverse().findIndex((e) => e === 'active');
      if (aei === -1) { // In the middle of the season, but not in the middle of an episode
        activeEpisodeinSeasons.push([ parseInt(si) + 1, seasons[ si ].findIndex((e) => e === 'none') + 1 ]);
      } else { // In the middle of the season, as well as an episode in that season
        activeEpisodeinSeasons.push([ parseInt(si) + 1, Math.abs(aei - (seasons[ si ].length - 1)) + 1 ]);
      }
    }
  }

  return activeEpisodeinSeasons.reverse().find(([ _, e ]) => !!e) as [ number, number ];
};
