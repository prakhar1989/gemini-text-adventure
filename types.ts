
export enum GameState {
  START,
  LOADING,
  PLAYING,
  GAME_OVER,
  ERROR,
}

export interface StorySegment {
  scene: string;
  situation: string;
  choices: string[];
}
