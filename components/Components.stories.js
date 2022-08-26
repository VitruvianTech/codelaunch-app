import MyPage from './Components.vue';
import * as HeaderStories from './Header.stories';
import { expect } from '@storybook/jest';
import { userEvent, waitFor, within } from '@storybook/testing-library';

export default {
  title: 'CodeLaunch/App/Components',
  component: MyPage,
  parameters: {
    // Use op.query.definitions[0].name.value to conditionalize mock data
    // urql: (op) => ({
    //   data: {
    //     characters: {
    //       results: [{ name: 'Steve' }]
    //     }
    //   }
    // })
  }
};

const Template = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { MyPage },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    // Story args can be mapped to keys in the returned object
    return { user: args.user };
  },
  // Then, those values can be accessed directly in the template
  template: '<my-page :user="user" />',
});

export const DateSelection = Template.bind({});
DateSelection.args = {
  // More on composing args: https://storybook.js.org/docs/vue/writing-stories/args#args-composition
  ...HeaderStories.LoggedIn.args,
};

DateSelection.play = async ({ args, canvasElement }) => {
  const canvas = within(canvasElement)
  const blorp = canvas.getByRole('figure')
  await userEvent.click(canvas.getByText('22'))
  await waitFor(() => expect(new Date(blorp.innerText).getDate()).toEqual(22))
}
