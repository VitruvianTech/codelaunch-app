import MyPage from './List.vue';

export default {
  title: 'CodeLaunch/App/Tasks/List',
  component: MyPage,
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/my-design'
    },
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
  // Then, those values can be accessed directly in the template
  template: '<my-page />',
});

export const All = Template.bind({});