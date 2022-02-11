import { useMemo } from "react";
import { useMachine, useActor } from "@xstate/react";
import { createSubredditMachine } from "../state/redditMachine";

export const Subreddit = ({ service }) => {
  // only create the machine based on the subreddit name once
  // const subredditMachine = useMemo(() => createSubredditMachine(name), [name]);

  const [current, send] = useActor(service);

  if (current.matches('failure')) {
    return (
      <div>
        Failed to load posts. {' '}
        <button onClick={() => send('RETRY')}>Retry</button>
      </div>
    )
  }

  const { subreddit, posts, lastUpdated } = current.context;

  return (
    <section
      data-machine={service.id}
      data-state={current.toStrings().join(' ')}
    >
      {current.matches('loading') && <div>Loading posts...</div>}
      {posts && (
        <>
          <header>
            <h2>{subreddit}</h2>
            <small>
              Last updated: {lastUpdated}{' '}
              <button onClick={(_) => send('REFRESH')}>Refresh</button>
            </small>
          </header>
          <ul>
            {posts.map((post) => {
              return <li key={post.id}>{post.title}</li>
            })}
          </ul>
        </>
      )}
    </section>
  );
};