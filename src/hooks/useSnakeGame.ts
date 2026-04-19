"use client";
import { useReducer, useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Point = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";
export type SnakeStatus = "idle" | "playing" | "paused" | "over";

export const GRID = 20;
const SPEED = 140;

type State = {
  snake: Point[];
  food: Point;
  dir: Direction;
  nextDir: Direction;
  status: SnakeStatus;
  score: number;
};

type Action =
  | { type: "START" }
  | { type: "TICK" }
  | { type: "DIR"; dir: Direction }
  | { type: "PAUSE" }
  | { type: "RESET" };

const OPPOSITE: Record<Direction, Direction> = {
  up: "down", down: "up", left: "right", right: "left",
};

function randomFood(snake: Point[]): Point {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  let p: Point;
  do {
    p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (occupied.has(`${p.x},${p.y}`));
  return p;
}

function initialState(): State {
  const snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  return { snake, food: randomFood(snake), dir: "right", nextDir: "right", status: "idle", score: 0 };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START":
      return { ...initialState(), status: "playing" };
    case "RESET":
      return initialState();
    case "PAUSE":
      return state.status === "playing"
        ? { ...state, status: "paused" }
        : state.status === "paused"
        ? { ...state, status: "playing" }
        : state;
    case "DIR":
      if (action.dir === OPPOSITE[state.dir]) return state;
      return { ...state, nextDir: action.dir };
    case "TICK": {
      if (state.status !== "playing") return state;
      const d = state.nextDir;
      const head = state.snake[0];
      const newHead = {
        x: head.x + (d === "right" ? 1 : d === "left" ? -1 : 0),
        y: head.y + (d === "down" ? 1 : d === "up" ? -1 : 0),
      };
      if (newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID) {
        return { ...state, status: "over" };
      }
      if (state.snake.some((p) => p.x === newHead.x && p.y === newHead.y)) {
        return { ...state, status: "over" };
      }
      const ate = newHead.x === state.food.x && newHead.y === state.food.y;
      const newSnake = ate ? [newHead, ...state.snake] : [newHead, ...state.snake.slice(0, -1)];
      return {
        ...state,
        snake: newSnake,
        food: ate ? randomFood(newSnake) : state.food,
        dir: d,
        nextDir: d,
        score: ate ? state.score + 1 : state.score,
      };
    }
    default:
      return state;
  }
}

export function useSnakeGame() {
  const [state, dispatch] = useReducer(reducer, null, initialState);
  const [bestScore, setBestScore] = useLocalStorage("snake-best", 0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (state.status === "playing") {
      intervalRef.current = setInterval(() => dispatch({ type: "TICK" }), SPEED);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [state.status]);

  useEffect(() => {
    if (state.status === "over" && state.score > bestScore) {
      setBestScore(state.score);
    }
  }, [state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  const start = useCallback(() => dispatch({ type: "START" }), []);
  const togglePause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const setDir = useCallback((dir: Direction) => dispatch({ type: "DIR", dir }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const snakeSet = new Set(state.snake.map((p) => `${p.x},${p.y}`));
  const headKey = `${state.snake[0].x},${state.snake[0].y}`;
  const foodKey = `${state.food.x},${state.food.y}`;

  return { ...state, bestScore, start, togglePause, setDir, reset, snakeSet, headKey, foodKey };
}
