import { useMachine } from "@xstate/react";

import { redditMachine } from "./state/redditMachine";
import { Subreddit } from "./components/Subreddit";
import './App.css';

const subreddits = ['reactjs', 'frontend', 'javascript'];

function App() {
  const [current, send] = useMachine(redditMachine);
  const { subreddit } = current.context;
  return (
    <main>
      <header>
        <select
          onChange={(e) => {
            send({ type: 'SELECT', name: e.target.value });
          }}
        >
          {subreddits.map((subreddit) => (
            <option key={subreddit} value={subreddit}>
              {subreddit}
            </option>
          ))}
        </select>
      </header>
      {subreddit && <Subreddit name={subreddit} key={subreddit} />}
    </main>
  );
}

export default App;
