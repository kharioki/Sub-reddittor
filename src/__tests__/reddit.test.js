import { interpret } from "xstate";
import { assert } from "chai";

import { redditMachine } from "../state/redditMachine";

describe("redditMachine", () => {
  it('should load posts of a selected subreddit', (done) => {
    const redditService = interpret(redditMachine)
      .onTransition((state) => {
        // when the state finally reaches 'selected.loaded',
        // the test has succeeded.

        if (state.matches({ selected: 'loaded' })) {
          assert.isNotEmpty(state.context.posts);
          assert.equal(state.context.subreddit, 'reactjs');

          done();
        }
      })
      .start(); // remember to start the service!

    // Test that when the 'SELECT' event is sent, the machine eventually
    // reaches the { selected: 'loaded' } state with posts
    redditService.send('SELECT', { name: 'reactjs' });
  });
});

