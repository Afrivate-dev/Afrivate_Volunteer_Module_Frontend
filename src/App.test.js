import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import App from './App';

test('renders app with landing content', () => {
  render(
    <HashRouter>
      <App />
    </HashRouter>
  );
  const headingElement = screen.getByText(/Volunteer Your Skills/i);
  expect(headingElement).toBeInTheDocument();
});
