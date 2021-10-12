import * as React from 'react';
import Admin from '../Admin';
import { shallow } from 'enzyme';

describe('Admin test', () => {
  it('should render a basic component', () => {
    const component = shallow(<Admin />);
    expect(component.html()).toMatchSnapshot('basic');
  });
});
