import { createMachine, assign, spawn } from 'xstate';

// sample SELECT  event
const selectEvent = {
  type: 'SELECT', // event type
  name: 'reactjs', // name of the subreddit
};

function invokeFetchSubreddit(context) {
  const { subreddit } = context;

  return fetch(`https://www.reddit.com/r/${subreddit}.json`)
    .then(response => response.json())
    .then(json => json.data.children.map((child) => child.data));
}

export const redditMachine = createMachine({
  id: 'reddit',
  initial: 'idle',
  context: {
    subreddits: {},
    subreddit: null, // none selected
  },
  states: {
    idle: {},
    selected: {}, // no invocations
  },
  on: {
    SELECT: {
      target: '.selected',
      actions: assign((context, event) => {
        // use the existing subreddit actor if one already exists
        let subreddit = context.subreddits[event.name];

        if (subreddit) {
          return {
            ...context,
            subreddit,
          };
        }

        // Otherwise, spawn a new subreddit actor and save it in the subreddits object
        subreddit = spawn(createSubredditMachine(event.name));

        return {
          subreddits: {
            ...context.subreddits,
            [event.name]: subreddit,
          },
          subreddit,
        };
      })
    },
  },
});

export const createSubredditMachine = (subreddit) => {
  return createMachine({
    id: 'subreddit',
    initial: 'loading',
    context: {
      subreddit, // subreddit name passed in
      posts: null,
      lastUpdated: null
    },
    states: {
      loading: {
        invoke: {
          id: 'fetch-subreddit',
          src: invokeFetchSubreddit,
          onDone: {
            target: 'loaded',
            actions: assign({
              posts: (_, event) => event.data,
              lastUpdated: () => Date.now()
            })
          },
          onError: 'failure'
        }
      },
      loaded: {
        on: {
          REFRESH: 'loading'
        }
      },
      failure: {
        on: {
          RETRY: 'loading'
        }
      }
    }
  });
};
