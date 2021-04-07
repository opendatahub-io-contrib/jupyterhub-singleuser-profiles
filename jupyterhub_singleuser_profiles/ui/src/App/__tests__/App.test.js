import * as React from 'react';
import App from '../App';
import { shallow } from 'enzyme';

describe('App test', () => {
  it('should render a basic component', () => {
    const component = shallow(<App />);
    expect(component.html()).toMatchSnapshot('basic');
  });
});
